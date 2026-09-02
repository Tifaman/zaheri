import { BodyRegionCode } from '@zaheri/types';
import { RedFlagRule } from './red-flag.types';
import { RED_FLAG_RULES } from './red-flag.rules';

/**
 * Pure matcher: does this complaint + body region match any configured
 * red-flag rule? Takes `rules` as a parameter (defaulting to the real,
 * clinician-owned list) purely so tests can exercise the matching mechanics
 * against fixture rules without touching RED_FLAG_RULES itself.
 */
export function evaluateRedFlag(
  complaint: string,
  bodyRegion: BodyRegionCode,
  rules: RedFlagRule[] = RED_FLAG_RULES,
): boolean {
  const normalizedComplaint = complaint.toLowerCase();
  return rules.some(
    (rule) =>
      rule.bodyRegion === bodyRegion &&
      rule.complaintKeywords.some((keyword) =>
        normalizedComplaint.includes(keyword.toLowerCase()),
      ),
  );
}
