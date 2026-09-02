/**
 * Documents and enforces, in one place, where patient assessment data
 * (complaint, body region, urgency, triage tag) is and is not allowed to
 * go: it reaches the doctor console via the authenticated /cases API
 * (toCaseDto), and it never reaches the patient PWA's realtime channel
 * (toPatientQueueStatus) or either SMS/WhatsApp notification path
 * (buildQueueNearMessage, buildCaseRoutedMessage) — see
 * queue/queue.mapper.spec.ts and notifications/*.template.spec.ts for
 * those in isolation.
 */
import { CaseWithRelations, toCaseDto } from './case.mapper';
import { toPatientQueueStatus } from '../queue/queue.mapper';
import { buildQueueNearMessage } from '../notifications/queue-near.template';
import { buildCaseRoutedMessage } from '../notifications/case-routed.template';

const ASSESSMENT_ROW: CaseWithRelations = {
  id: 'intake-1',
  patientId: 'patient-1',
  hospitalId: 'muhimbili',
  registrationNumber: 'MNH-0001',
  ward: 'OPD',
  complaint: 'Maumivu makali ya kifua',
  bodyRegion: 'CHEST',
  urgent: true,
  status: 'ROUTED',
  disposition: 'URGENT_NOW',
  room: 'EMD',
  queueNumber: null,
  queueSequence: null,
  triageTag: 'RED',
  routedById: null,
  routedAt: new Date('2026-01-01T00:00:00.000Z'),
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  labOrders: [],
  receipts: [],
};

describe('assessment data boundary', () => {
  it('reaches the doctor console with the full assessment (complaint, body region, urgency, triage tag)', async () => {
    const caseDto = await toCaseDto(ASSESSMENT_ROW);

    expect(caseDto).toMatchObject({
      complaint: 'Maumivu makali ya kifua',
      bodyRegion: 'CHEST',
      urgent: true,
      triageTag: 'RED',
    });
  });

  it('never reaches the patient PWA realtime channel', () => {
    const queueStatus = toPatientQueueStatus(ASSESSMENT_ROW);

    expect(queueStatus).not.toHaveProperty('complaint');
    expect(queueStatus).not.toHaveProperty('bodyRegion');
    expect(queueStatus).not.toHaveProperty('urgent');
    expect(queueStatus).not.toHaveProperty('triageTag');
    expect(JSON.stringify(queueStatus)).not.toContain('kifua');
  });

  it('never reaches the SMS/WhatsApp notification path', () => {
    // buildQueueNearMessage's parameter type has no field to carry any of
    // this — there is no ASSESSMENT_ROW.complaint to even pass in.
    const message = buildQueueNearMessage({
      ward: ASSESSMENT_ROW.ward,
      room: ASSESSMENT_ROW.room ?? 'EMD',
      queueNumber: ASSESSMENT_ROW.queueNumber ?? 'Q-0',
    });

    expect(message).not.toContain('kifua');
    expect(message).not.toContain('CHEST');
    expect(message).not.toContain('RED');
  });

  it('never reaches the "you\'ve been routed" notification path either', () => {
    const message = buildCaseRoutedMessage({
      disposition: ASSESSMENT_ROW.disposition ?? 'SEE_DOCTOR',
      ward: ASSESSMENT_ROW.ward,
      room: ASSESSMENT_ROW.room ?? 'EMD',
      queueNumber: ASSESSMENT_ROW.queueNumber,
    });

    expect(message).not.toContain('kifua');
    expect(message).not.toContain('CHEST');
    expect(message).not.toContain('RED');
  });
});
