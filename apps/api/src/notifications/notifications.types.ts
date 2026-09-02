import { Disposition } from '@zaheri/types';

/**
 * Job payload for the "queue-near" notification — deliberately the same
 * narrow shape as QueueNearNotificationInput plus the recipient's
 * registration number. No complaint/bodyRegion/urgent/triageTag field
 * exists to put here.
 */
export interface QueueNearJobData {
  registrationNumber: string;
  ward: string;
  room: string;
  queueNumber: string;
}

/**
 * Job payload for the "you've been routed" notification, sent right when a
 * disposition is set (clinician approval, or the red-flag engine's
 * auto-route). Same narrow shape as CaseRoutedNotificationInput plus the
 * recipient's registration number.
 */
export interface CaseRoutedJobData {
  registrationNumber: string;
  disposition: Disposition;
  ward: string;
  room: string;
  queueNumber: string | null;
}

export const NOTIFICATIONS_QUEUE = 'notifications';
export const QUEUE_NEAR_JOB = 'queue-near';
export const CASE_ROUTED_JOB = 'case-routed';
