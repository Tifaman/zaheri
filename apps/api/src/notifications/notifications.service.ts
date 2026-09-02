import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  CASE_ROUTED_JOB,
  CaseRoutedJobData,
  NOTIFICATIONS_QUEUE,
  QUEUE_NEAR_JOB,
  QueueNearJobData,
} from './notifications.types';

type NotificationJobData = QueueNearJobData | CaseRoutedJobData;

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue(NOTIFICATIONS_QUEUE)
    private readonly notificationsQueue: Queue<NotificationJobData>,
  ) {}

  /** Backgrounds the "your number is near" SMS via BullMQ; never called with clinical fields. */
  async enqueueQueueNearNotification(data: QueueNearJobData): Promise<void> {
    await this.notificationsQueue.add(QUEUE_NEAR_JOB, data);
  }

  /** Backgrounds the "you've been routed" SMS via BullMQ; never called with clinical fields. */
  async enqueueCaseRoutedNotification(data: CaseRoutedJobData): Promise<void> {
    await this.notificationsQueue.add(CASE_ROUTED_JOB, data);
  }
}
