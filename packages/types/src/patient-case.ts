import type { BodyRegionCode } from './body-regions.js';
import type { IntakeStatus } from './intake.js';
import type { Disposition } from './case.js';
import type { LabOrderDto } from './lab.js';
import type { PharmacyReceiptDto } from './receipt.js';
import type { HospitalId } from './hospital.js';

/**
 * What a patient can see about their own case via GET /intake/:id — the
 * intake id (an unguessable UUID, returned only to whoever submitted it) is
 * the capability, the same trust model as the Socket.IO queue subscription.
 *
 * Deliberately excludes `urgent`, `triageTag`, and `routedById` — those stay
 * doctor-console-only (see CaseDto), consistent with the Phase 2 rule that
 * the red-flag/triage assessment is never surfaced to the patient as a bare
 * signal. Labs and the pharmacy receipt ARE patient-facing by design (own
 * results, own QR code) — this is in-app only, never sent over SMS/WhatsApp.
 */
export interface PatientCaseDto {
  id: string;
  hospitalId: HospitalId;
  registrationNumber: string;
  ward: string;
  complaint: string;
  bodyRegion: BodyRegionCode;
  status: IntakeStatus;
  disposition: Disposition | null;
  room: string | null;
  queueNumber: string | null;
  labs: LabOrderDto[];
  receipts: PharmacyReceiptDto[];
  createdAt: string;
  updatedAt: string;
}
