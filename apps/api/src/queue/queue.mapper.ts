import { Disposition, IntakeStatus, PatientQueueStatus } from '@zaheri/types';
import { Intake } from '../../generated/prisma';

/**
 * Shapes the patient-safe queue status pushed over Socket.IO. Deliberately
 * drops complaint/bodyRegion/urgent/triageTag — see PatientQueueStatus.
 */
export function toPatientQueueStatus(intake: Intake): PatientQueueStatus {
  return {
    intakeId: intake.id,
    status: intake.status as IntakeStatus,
    disposition: intake.disposition as Disposition | null,
    room: intake.room,
    queueNumber: intake.queueNumber,
    updatedAt: intake.updatedAt.toISOString(),
  };
}
