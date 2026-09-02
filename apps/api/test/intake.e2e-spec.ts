import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Exercises the patient-facing intake submission path against a real
 * Postgres database. Requires DATABASE_URL to point at a migrated database
 * (see .env.example; `docker compose up -d postgres` +
 * `pnpm --filter @zaheri/api prisma:migrate` is enough for local dev).
 *
 * Clinician reads/routing (and the red-flag auto-routing side effect) are
 * covered in cases.e2e-spec.ts, since /intake is deliberately write-only and
 * unauthenticated — patients don't log in.
 */
describe('Intake (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const registrationNumber = `E2E-${Date.now()}`;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    prisma = moduleRef.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.intake.deleteMany({ where: { registrationNumber } });
    await prisma.patient.deleteMany({ where: { registrationNumber } });
    await app.close();
  });

  it('rejects an incomplete submission', async () => {
    await request(app.getHttpServer())
      .post('/intake')
      .send({ registrationNumber, ward: 'OPD' })
      .expect(400);
  });

  it('rejects an unknown body region', async () => {
    await request(app.getHttpServer())
      .post('/intake')
      .send({
        registrationNumber,
        ward: 'OPD',
        complaint: 'Maumivu ya kichwa',
        bodyRegion: 'NOT_A_REGION',
      })
      .expect(400);
  });

  it('submits a guided intake and returns the created record, pending routing', async () => {
    const res = await request(app.getHttpServer())
      .post('/intake')
      .send({
        hospitalId: 'muhimbili',
        registrationNumber,
        ward: 'OPD',
        complaint: 'Maumivu ya kichwa', // "headache"
        bodyRegion: 'HEAD',
      })
      .expect(201);

    expect(res.body).toMatchObject({
      hospitalId: 'muhimbili',
      registrationNumber,
      ward: 'OPD',
      complaint: 'Maumivu ya kichwa',
      bodyRegion: 'HEAD',
      urgent: false,
      status: 'PENDING',
    });
    expect(res.body.id).toEqual(expect.any(String));
    // Patient-facing shape must never leak routing/triage internals.
    expect(res.body).not.toHaveProperty('triageTag');
    expect(res.body).not.toHaveProperty('disposition');
  });
});
