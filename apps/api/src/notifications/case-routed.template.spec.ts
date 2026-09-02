import { buildCaseRoutedMessage, CaseRoutedNotificationInput } from './case-routed.template';

describe('buildCaseRoutedMessage', () => {
  it('tells a SEE_DOCTOR patient their queue number and room', () => {
    const message = buildCaseRoutedMessage({
      disposition: 'SEE_DOCTOR',
      ward: 'OPD',
      room: 'OPD',
      queueNumber: 'Q-5',
    });

    expect(message).toContain('Q-5');
    expect(message).toContain('OPD');
  });

  it('tells a URGENT_NOW patient to come to the EMD now, with no queue number', () => {
    const message = buildCaseRoutedMessage({
      disposition: 'URGENT_NOW',
      ward: 'OPD',
      room: 'EMD',
      queueNumber: null,
    });

    expect(message).toContain('EMD');
    expect(message).not.toContain('null');
    expect(message).not.toMatch(/Q-\d+/);
  });

  it('never includes clinical wording, even if a caller smuggles extra fields in at runtime', () => {
    const input = {
      disposition: 'SEE_DOCTOR',
      ward: 'OPD',
      room: 'OPD',
      queueNumber: 'Q-1',
      complaint: 'severe chest pain',
      bodyRegion: 'CHEST',
      urgent: true,
      triageTag: 'RED',
    } as unknown as CaseRoutedNotificationInput;

    const message = buildCaseRoutedMessage(input);

    expect(message.toLowerCase()).not.toContain('chest pain');
    expect(message).not.toContain('CHEST');
    expect(message).not.toContain('RED');
  });
});
