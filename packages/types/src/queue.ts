import type { Disposition } from './case.js';
import type { IntakeStatus } from './intake.js';

/**
 * Real-time queue status pushed to the patient PWA over Socket.IO.
 * Deliberately narrow — no complaint, body region, urgency, or triage tag.
 * Assessment data is doctor-console-only, delivered over the authenticated
 * /cases API; it never reaches this channel, the patient, or any
 * notification. See apps/api/src/notifications for the enforced boundary.
 */
export interface PatientQueueStatus {
  intakeId: string;
  status: IntakeStatus;
  disposition: Disposition | null;
  room: string | null;
  queueNumber: string | null;
  updatedAt: string;
}
