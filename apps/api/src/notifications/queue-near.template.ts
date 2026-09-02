/**
 * Everything a "your number is near" alert is allowed to say. There is no
 * complaint, bodyRegion, urgent, or triageTag field here — the input type
 * itself makes it impossible to build a message carrying assessment data.
 * Assessment data reaches the doctor console only, over the authenticated
 * /cases API (see cases/case.mapper.ts) — never this template, never SMS.
 */
export interface QueueNearNotificationInput {
  ward: string;
  room: string;
  queueNumber: string;
}

export function buildQueueNearMessage(input: QueueNearNotificationInput): string {
  return `ZaHeri: Namba yako ${input.queueNumber} inakaribia kuitwa. Tafadhali njoo ${input.ward} (${input.room}).`;
}
