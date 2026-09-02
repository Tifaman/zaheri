import { Inject, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { IMessagingGateway, MESSAGING_GATEWAY } from './messaging-gateway.interface';
import { buildQueueNearMessage } from './queue-near.template';
import { buildCaseRoutedMessage } from './case-routed.template';
import {
  CASE_ROUTED_JOB,
  CaseRoutedJobData,
  NOTIFICATIONS_QUEUE,
  QUEUE_NEAR_JOB,
  QueueNearJobData,
} from './notifications.types';

type NotificationJobData = QueueNearJobData | CaseRoutedJobData;

@Processor(NOTIFICATIONS_QUEUE)
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(@Inject(MESSAGING_GATEWAY) private readonly messagingGateway: IMessagingGateway) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<void> {
    switch (job.name) {
      case QUEUE_NEAR_JOB: {
        const data = job.data as QueueNearJobData;
        const message = buildQueueNearMessage({
          ward: data.ward,
          room: data.room,
          queueNumber: data.queueNumber,
        });
        await this.messagingGateway.sendSms({ registrationNumber: data.registrationNumber, message });
        return;
      }
      case CASE_ROUTED_JOB: {
        const data = job.data as CaseRoutedJobData;
        const message = buildCaseRoutedMessage({
          disposition: data.disposition,
          ward: data.ward,
          room: data.room,
          queueNumber: data.queueNumber,
        });
        await this.messagingGateway.sendSms({ registrationNumber: data.registrationNumber, message });
        return;
      }
      default:
        this.logger.warn(`Unknown job name "${job.name}" — skipping`);
    }
  }
}
