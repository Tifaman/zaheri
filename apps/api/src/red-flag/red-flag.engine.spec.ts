import { evaluateRedFlag } from './red-flag.engine';
import { RedFlagRule } from './red-flag.types';
import { RED_FLAG_RULES } from './red-flag.rules';

// Fixture rules used only to exercise the matching mechanics — never the
// real clinician-owned list, which must stay empty until signed off.
const FIXTURE_RULES: RedFlagRule[] = [
  { bodyRegion: 'CHEST', complaintKeywords: ['maumivu makali ya kifua', 'chest pain'] },
  { bodyRegion: 'HEAD', complaintKeywords: ['kupoteza fahamu'] },
];

describe('evaluateRedFlag', () => {
  it('fires when body region and a keyword both match (case-insensitive)', () => {
    expect(evaluateRedFlag('Nina CHEST PAIN kali', 'CHEST', FIXTURE_RULES)).toBe(true);
  });

  it('does not fire when the body region matches but no keyword does', () => {
    expect(evaluateRedFlag('Maumivu kidogo tu', 'CHEST', FIXTURE_RULES)).toBe(false);
  });

  it('does not fire when a keyword matches but the body region differs', () => {
    expect(evaluateRedFlag('chest pain', 'ABDOMEN', FIXTURE_RULES)).toBe(false);
  });

  it('does not fire against an empty rule set', () => {
    expect(evaluateRedFlag('chest pain', 'CHEST', [])).toBe(false);
  });

  it('the real clinician-owned rule list is empty until signed off', () => {
    expect(RED_FLAG_RULES).toEqual([]);
  });
});
