import { Disposition } from '@zaheri/types';

/**
 * Everything a "you've been routed" alert is allowed to say. No complaint,
 * bodyRegion, urgent, or triageTag field exists here — same structural
 * boundary as queue-near.template.ts. Assessment data reaches the doctor
 * console only, over the authenticated /cases API.
 */
export interface CaseRoutedNotificationInput {
  disposition: Disposition;
  ward: string;
  room: string;
  queueNumber: string | null;
}

export function buildCaseRoutedMessage(input: CaseRoutedNotificationInput): string {
  if (input.disposition === 'URGENT_NOW') {
    return `ZaHeri: Tafadhali njoo sasa hivi ${input.room}.`;
  }
  return `ZaHeri: Umepangiwa kumwona daktari. Namba yako ya foleni: ${input.queueNumber}. Njoo ${input.room} ukiwa tayari.`;
}
