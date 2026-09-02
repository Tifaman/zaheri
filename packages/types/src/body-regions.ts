/**
 * Region codes for the tappable SVG body diagram used during intake.
 * Kept intentionally coarse for Phase 0; the clinician-reviewed red-flag
 * engine (Phase 1) matches complaint + region against a configurable list.
 */
export const BODY_REGION_CODES = [
  'HEAD',
  'CHEST',
  'ABDOMEN',
  'BACK',
  'LEFT_ARM',
  'RIGHT_ARM',
  'LEFT_LEG',
  'RIGHT_LEG',
  'OTHER',
] as const;

export type BodyRegionCode = (typeof BODY_REGION_CODES)[number];
