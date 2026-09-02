import * as argon2 from 'argon2';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// Dev-only seed credentials — never valid outside a local/dev database.
// TODO(Phase 1+): replace with a proper admin-provisioning flow before any
// shared or staging environment exists.
const DEV_PASSWORD = 'ChangeMe123!';

async function main() {
  const passwordHash = await argon2.hash(DEV_PASSWORD);

  await prisma.user.upsert({
    where: { email: 'clinician@zaheri.dev' },
    update: {},
    create: { email: 'clinician@zaheri.dev', passwordHash, role: 'CLINICIAN' },
  });

  await prisma.user.upsert({
    where: { email: 'admin@zaheri.dev' },
    update: {},
    create: { email: 'admin@zaheri.dev', passwordHash, role: 'ADMIN' },
  });

  const patient = await prisma.patient.upsert({
    where: { registrationNumber: 'MNH-0001' },
    update: {},
    create: { registrationNumber: 'MNH-0001' },
  });

  await prisma.intake.upsert({
    where: { id: 'seed-intake-0001' },
    update: {},
    create: {
      id: 'seed-intake-0001',
      patientId: patient.id,
      registrationNumber: patient.registrationNumber,
      ward: 'OPD',
      complaint: 'Maumivu ya tumbo', // "stomach pain" — sample Swahili complaint
      bodyRegion: 'ABDOMEN',
    },
  });

  console.log('Seed complete: 2 users, 1 patient, 1 intake.');
  console.log(`Dev login — clinician@zaheri.dev / ${DEV_PASSWORD}`);
  console.log(`Dev login — admin@zaheri.dev / ${DEV_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
