import { BodyRegionCode } from '@zaheri/types';

/**
 * One clinician-authored red-flag rule: fires when the intake's body region
 * matches AND the complaint text contains one of the keywords (case-insensitive
 * substring match).
 */
export interface RedFlagRule {
  bodyRegion: BodyRegionCode;
  complaintKeywords: string[];
}
