import { RedFlagRule } from './red-flag.types';

/**
 * TODO(CLINICAL SIGN-OFF REQUIRED — do not populate without it):
 * This list is intentionally EMPTY. Per CLAUDE.md guardrails, ZaHeri must
 * not invent clinical logic or regulatory decisions — the red-flag list
 * that decides who gets auto-escalated to the EMD has to come from a
 * Muhimbili EMD clinician. Until it is supplied and signed off, the engine
 * evaluates against this empty list and will never fire, so every intake
 * falls through to normal doctor routing (the safe default).
 *
 * When the clinician-approved list arrives, add entries here, e.g.:
 *   { bodyRegion: 'CHEST', complaintKeywords: ['maumivu ya kifua kali'] }
 */
export const RED_FLAG_RULES: RedFlagRule[] = [];
