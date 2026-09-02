import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as argon2 from 'argon2';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { IMessagingGateway, MESSAGING_GATEWAY } from '../src/notifications/messaging-gateway.interface';

async function waitFor(predicate: () => boolean, timeoutMs = 3000, intervalMs = 50) {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) throw new Error('Timed out waiting for condition');
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

/**
 * Exercises the clinician-only doctor console API against a real Postgres +
 * Redis: login, RBAC, case listing (RED-first), case detail, the
 * two-disposition routing action, and completion triggering a
 * queue-near notification for the next patient in the ward. Requires
 * DATABASE_URL and REDIS_URL to point at running services — see
 * intake.e2e-spec.ts for local setup.
 */
describe('Cases (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let messagingGateway: IMessagingGateway;

  const suffix = Date.now();
  const clinicianEmail = `e2e-clinician-${suffix}@zaheri.dev`;
  const patientUserEmail = `e2e-patient-${suffix}@zaheri.dev`;
  const testPassword = 'E2E-test-password-1';
  const ward = 'Wodi ya Wanawake';
  const registrationNumber = `E2E-CASE-${suffix}`;
  const secondRegistrationNumber = `E2E-CASE-2-${suffix}`;

  let clinicianToken: string;
  let patientRoleToken: string;
  let intakeId: string;
  let secondIntakeId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
    prisma = moduleRef.get(PrismaService);
    messagingGateway = moduleRef.get(MESSAGING_GATEWAY);

    const passwordHash = await argon2.hash(testPassword);
    await prisma.user.create({
      data: { email: clinicianEmail, passwordHash, role: 'CLINICIAN' },
    });
    await prisma.user.create({
      data: { email: patientUserEmail, passwordHash, role: 'PATIENT' },
    });

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: clinicianEmail, password: testPassword })
      .expect(201);
    clinicianToken = login.body.accessToken;

    const patientLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: patientUserEmail, password: testPassword })
      .expect(201);
    patientRoleToken = patientLogin.body.accessToken;

    const intakeRes = await request(app.getHttpServer()).post('/intake').send({
      hospitalId: 'muhimbili',
      registrationNumber,
      ward,
      complaint: 'Maumivu kidogo ya tumbo',
      bodyRegion: 'ABDOMEN',
    });
    intakeId = intakeRes.body.id;

    const secondIntakeRes = await request(app.getHttpServer()).post('/intake').send({
      hospitalId: 'muhimbili',
      registrationNumber: secondRegistrationNumber,
      ward,
      complaint: 'Homa kali sana isiyoshuka', // deliberately distinct — must never surface in a notification
      bodyRegion: 'OTHER',
    });
    secondIntakeId = secondIntakeRes.body.id;
  });

  afterAll(async () => {
    await prisma.intake.deleteMany({
      where: { registrationNumber: { in: [registrationNumber, secondRegistrationNumber] } },
    });
    await prisma.patient.deleteMany({
      where: { registrationNumber: { in: [registrationNumber, secondRegistrationNumber] } },
    });
    await prisma.user.deleteMany({ where: { email: { in: [clinicianEmail, patientUserEmail] } } });
    await app.close();
  });

  it('rejects login with the wrong password', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: clinicianEmail, password: 'wrong-password' })
      .expect(401);
  });

  it('rejects unauthenticated access to the case list', async () => {
    await request(app.getHttpServer()).get('/cases').expect(401);
  });

  it('rejects a patient-role token from the case list (RBAC)', async () => {
    await request(app.getHttpServer())
      .get('/cases')
      .set('Authorization', `Bearer ${patientRoleToken}`)
      .expect(403);
  });

  it('lists cases for a clinician, defaulting to GREEN and pending routing', async () => {
    const res = await request(app.getHttpServer())
      .get('/cases')
      .set('Authorization', `Bearer ${clinicianToken}`)
      .expect(200);

    const created = res.body.find((c: { id: string }) => c.id === intakeId);
    expect(created).toMatchObject({
      registrationNumber,
      triageTag: 'GREEN',
      disposition: null,
      status: 'PENDING',
    });
  });

  it('returns the case detail for a clinician', async () => {
    const res = await request(app.getHttpServer())
      .get(`/cases/${intakeId}`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .expect(200);
    expect(res.body.id).toBe(intakeId);
  });

  it('routes the case to SEE_DOCTOR — ward room, assigned queue number, GREEN tag', async () => {
    const res = await request(app.getHttpServer())
      .post(`/cases/${intakeId}/route`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .send({ disposition: 'SEE_DOCTOR' })
      .expect(201);

    expect(res.body).toMatchObject({
      disposition: 'SEE_DOCTOR',
      room: ward,
      status: 'ROUTED',
      triageTag: 'GREEN',
    });
    expect(res.body.queueNumber).toEqual(expect.stringMatching(/^Q-\d+$/));
    expect(res.body.routedAt).toEqual(expect.any(String));
  });

  it('routes the second case to SEE_DOCTOR right behind the first, in the same ward', async () => {
    const res = await request(app.getHttpServer())
      .post(`/cases/${secondIntakeId}/route`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .send({ disposition: 'SEE_DOCTOR' })
      .expect(201);

    expect(res.body).toMatchObject({ disposition: 'SEE_DOCTOR', room: ward, status: 'ROUTED' });
  });

  it('completing the first case notifies the next patient in the queue — logistics only, no complaint', async () => {
    const sendSmsSpy = jest.spyOn(messagingGateway, 'sendSms');

    await request(app.getHttpServer())
      .post(`/cases/${intakeId}/complete`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .expect(201);

    await waitFor(() => sendSmsSpy.mock.calls.length > 0);

    const [notification] = sendSmsSpy.mock.calls[sendSmsSpy.mock.calls.length - 1];
    expect(notification.registrationNumber).toBe(secondRegistrationNumber);
    expect(notification.message).not.toMatch(/homa|isiyoshuka/i);
  });

  it('rejects an invalid disposition value', async () => {
    await request(app.getHttpServer())
      .post(`/cases/${intakeId}/route`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .send({ disposition: 'PRESCRIBE_ONLY' })
      .expect(400);
  });

  it('returns 404 routing an unknown case', async () => {
    await request(app.getHttpServer())
      .post('/cases/00000000-0000-0000-0000-000000000000/route')
      .set('Authorization', `Bearer ${clinicianToken}`)
      .send({ disposition: 'SEE_DOCTOR' })
      .expect(404);
  });
});
