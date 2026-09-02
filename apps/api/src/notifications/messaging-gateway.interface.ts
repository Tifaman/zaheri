/**
 * Isolation seam for the SMS/WhatsApp gateway (e.g. Africa's Talking,
 * Twilio, WhatsApp Cloud API — see .env.example's SMS_PROVIDER/SMS_API_KEY).
 * Only MockMessagingGateway exists until real credentials are supplied.
 *
 * `message` is a fully-built string, never raw clinical fields — callers
 * must go through queue-near.template.ts (or an equivalent narrow builder)
 * so there is no code path where a complaint or diagnosis can end up here.
 */
export interface PatientNotification {
  registrationNumber: string;
  message: string;
}

export interface IMessagingGateway {
  sendSms(notification: PatientNotification): Promise<void>;
}

export const MESSAGING_GATEWAY = Symbol('MESSAGING_GATEWAY');
