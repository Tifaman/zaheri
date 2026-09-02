/**
 * The fixed set of hospitals ZaHeri currently supports. A short, hand-
 * maintained list (like BODY_REGION_CODES) rather than a database table —
 * promote this to a real Hospital model if/when hospitals need to be added
 * without a deploy, or need their own staff/config.
 *
 * Display names and images are frontend-only concerns (see
 * apps/web/src/hospitals/catalog.ts) — this file only carries the ids the
 * backend validates and stores.
 */
export const HOSPITAL_IDS = [
  'muhimbili',
  'jkci',
  'benjamin_mkapa',
  'mwananyamala',
  'dodoma_referral',
  'mbeya_referral',
] as const;

export type HospitalId = (typeof HOSPITAL_IDS)[number];

export const DEFAULT_HOSPITAL_ID: HospitalId = 'muhimbili';
