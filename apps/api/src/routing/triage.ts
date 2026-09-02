import { Disposition, TriageTag } from '@zaheri/types';

/**
 * Derives the display-only triage colour from the assessment ZaHeri has
 * already made — never a new decision. RED when the (clinician-defined)
 * red-flag engine fired OR the disposition is URGENT_NOW; GREEN otherwise
 * (a standard SEE_DOCTOR routing, or not yet routed).
 */
export function computeTriageTag(
  urgent: boolean,
  disposition: Disposition | null,
): TriageTag {
  return urgent || disposition === 'URGENT_NOW' ? 'RED' : 'GREEN';
}
