import { toIntakeDto } from './intake.mapper';
import { Intake } from '../../generated/prisma';

describe('toIntakeDto', () => {
  it('maps a Prisma Intake row to the shared IntakeDto shape', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const row: Intake = {
      id: 'intake-1',
      patientId: 'patient-1',
      hospitalId: 'muhimbili',
      registrationNumber: 'MNH-0001',
      ward: 'OPD',
      complaint: 'Maumivu ya kichwa',
      bodyRegion: 'HEAD',
      urgent: false,
      status: 'PENDING',
      disposition: null,
      room: null,
      queueNumber: null,
      queueSequence: null,
      triageTag: 'GREEN',
      routedById: null,
      routedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    expect(toIntakeDto(row)).toEqual({
      id: 'intake-1',
      hospitalId: 'muhimbili',
      registrationNumber: 'MNH-0001',
      ward: 'OPD',
      complaint: 'Maumivu ya kichwa',
      bodyRegion: 'HEAD',
      urgent: false,
      status: 'PENDING',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  });
});
