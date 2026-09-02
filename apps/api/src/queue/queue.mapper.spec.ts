import { toPatientQueueStatus } from './queue.mapper';
import { Intake } from '../../generated/prisma';

describe('toPatientQueueStatus', () => {
  it('maps only logistics fields for the patient PWA realtime channel', () => {
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
      status: 'ROUTED',
      disposition: 'SEE_DOCTOR',
      room: 'OPD',
      queueNumber: 'Q-3',
      queueSequence: 3,
      triageTag: 'GREEN',
      routedById: 'clinician-1',
      routedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    expect(toPatientQueueStatus(row)).toEqual({
      intakeId: 'intake-1',
      status: 'ROUTED',
      disposition: 'SEE_DOCTOR',
      room: 'OPD',
      queueNumber: 'Q-3',
      updatedAt: now.toISOString(),
    });
  });
});
