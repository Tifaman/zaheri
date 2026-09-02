import type { BodyRegionCode } from './body-regions.js';
import type { IntakeStatus } from './intake.js';
import type { LabOrderDto } from './lab.js';
import type { PharmacyReceiptDto } from './receipt.js';
import type { HospitalId } from './hospital.js';

/**
 * There are only two dispositions, by design: there is no skip-the-doctor /
 * prescription-only path. Every non-emergency patient is routed to an
 * in-person doctor; red flags escalate to the EMD.
 */
export const DISPOSITIONS = ['SEE_DOCTOR', 'URGENT_NOW'] as const;
export type Disposition = (typeof DISPOSITIONS)[number];

/**
 * Derived, display-only triage colour for the doctor console. Never a new
 * clinical decision — see apps/api routing/triage.ts: RED reflects that the
 * (clinician-defined) red-flag engine fired or the disposition is
 * URGENT_NOW; GREEN reflects a standard SEE_DOCTOR routing.
 */
export const TRIAGE_TAGS = ['RED', 'GREEN'] as const;
export type TriageTag = (typeof TRIAGE_TAGS)[number];

export interface RouteCaseRequest {
  disposition: Disposition;
}

/**
 * Clinician-facing view of an intake ("case"). Deliberately separate from
 * IntakeDto (the patient-facing shape) so routing/triage internals are never
 * exposed on the public intake endpoint.
 */
export interface CaseDto {
  id: string;
  hospitalId: HospitalId;
  registrationNumber: string;
  ward: string;
  complaint: string;
  bodyRegion: BodyRegionCode;
  urgent: boolean;
  status: IntakeStatus;
  disposition: Disposition | null;
  room: string | null;
  queueNumber: string | null;
  triageTag: TriageTag;
  routedById: string | null;
  routedAt: string | null;
  labs: LabOrderDto[];
  receipts: PharmacyReceiptDto[];
  createdAt: string;
  updatedAt: string;
}
