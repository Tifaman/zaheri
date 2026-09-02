import { BodyRegionCode } from '@zaheri/types';

export const INTAKE_STEPS = [
  'WELCOME',
  'REGISTRATION',
  'WARD',
  'COMPLAINT',
  'BODY_REGION',
  'CONFIRM',
] as const;

export type IntakeStep = (typeof INTAKE_STEPS)[number];

export interface IntakeFormState {
  consentGiven: boolean;
  registrationNumber: string;
  ward: string;
  complaint: string;
  bodyRegion: BodyRegionCode | null;
}

export const INITIAL_INTAKE_STATE: IntakeFormState = {
  consentGiven: false,
  registrationNumber: '',
  ward: '',
  complaint: '',
  bodyRegion: null,
};

// TODO: source the real ward list from GoTHOMIS via IHospitalGateway once
// that field mapping exists; hardcoded here only to keep Phase 0 unblocked.
export const WARD_OPTIONS = [
  'OPD (Wagonjwa wa Nje)',
  'Wodi ya Wanawake',
  'Wodi ya Wanaume',
  'Watoto',
  'Dharura (EMD)',
];
