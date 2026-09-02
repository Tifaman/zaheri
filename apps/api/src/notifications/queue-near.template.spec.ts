import { buildQueueNearMessage, QueueNearNotificationInput } from './queue-near.template';

describe('buildQueueNearMessage', () => {
  it('builds a neutral logistics-only message from ward, room, and queue number', () => {
    const message = buildQueueNearMessage({
      ward: 'OPD (Wagonjwa wa Nje)',
      room: 'OPD (Wagonjwa wa Nje)',
      queueNumber: 'Q-7',
    });

    expect(message).toContain('Q-7');
    expect(message).toContain('OPD (Wagonjwa wa Nje)');
  });

  it('never includes any clinical wording, even if a caller smuggles extra fields in at runtime', () => {
    // The type system already stops this at compile time — this is a
    // runtime backstop proving the function only ever reads ward/room/
    // queueNumber, no matter what a loosely-typed caller (e.g. a raw JSON
    // payload) passes alongside them.
    const input = {
      ward: 'OPD',
      room: 'OPD',
      queueNumber: 'Q-1',
      complaint: 'severe chest pain',
      bodyRegion: 'CHEST',
      urgent: true,
      triageTag: 'RED',
    } as unknown as QueueNearNotificationInput;

    const message = buildQueueNearMessage(input);

    expect(message.toLowerCase()).not.toContain('chest pain');
    expect(message).not.toContain('CHEST');
    expect(message).not.toContain('RED');
  });
});
