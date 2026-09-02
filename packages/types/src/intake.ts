import type { BodyRegionCode } from './body-regions.js';
import type { HospitalId } from './hospital.js';

export const INTAKE_STATUSES = ['PENDING', 'ROUTED', 'COMPLETED'] as const;
export type IntakeStatus = (typeof INTAKE_STATUSES)[number];

export interface CreateIntakeRequest {
  hospitalId: HospitalId;
  registrationNumber: string;
  ward: string;
  complaint: string;
  bodyRegion: BodyRegionCode;
}

export interface IntakeDto {
  id: string;
  hospitalId: HospitalId;
  registrationNumber: string;
  ward: string;
  complaint: string;
  bodyRegion: BodyRegionCode;
  /** Set by the red-flag engine in Phase 1; always false in Phase 0. */
  urgent: boolean;
  status: IntakeStatus;
  createdAt: string;
  updatedAt: string;
}
