import { computeTriageTag } from './triage';

describe('computeTriageTag', () => {
  it('is RED when the red-flag engine fired (urgent), regardless of disposition', () => {
    expect(computeTriageTag(true, null)).toBe('RED');
    expect(computeTriageTag(true, 'SEE_DOCTOR')).toBe('RED');
  });

  it('is RED when the disposition is URGENT_NOW, even if urgent was never set', () => {
    expect(computeTriageTag(false, 'URGENT_NOW')).toBe('RED');
  });

  it('is GREEN for a standard SEE_DOCTOR routing', () => {
    expect(computeTriageTag(false, 'SEE_DOCTOR')).toBe('GREEN');
  });

  it('defaults to GREEN before routing has happened', () => {
    expect(computeTriageTag(false, null)).toBe('GREEN');
  });
});
