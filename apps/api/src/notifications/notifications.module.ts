import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MESSAGING_GATEWAY } from './messaging-gateway.interface';
import { MockMessagingGateway } from './mock-messaging-gateway.service';
import { NotificationsService } from './notifications.service';
import { NotificationsProcessor } from './notifications.processor';
import { NOTIFICATIONS_QUEUE } from './notifications.types';

@Module({
  imports: [BullModule.registerQueue({ name: NOTIFICATIONS_QUEUE })],
  providers: [
    NotificationsService,
    NotificationsProcessor,
    { provide: MESSAGING_GATEWAY, useClass: MockMessagingGateway },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
