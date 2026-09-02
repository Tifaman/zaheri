import { Module } from '@nestjs/common';
import { QueueModule } from '../queue/queue.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RoutingService } from './routing.service';

@Module({
  imports: [QueueModule, NotificationsModule],
  providers: [RoutingService],
  exports: [RoutingService],
})
export class RoutingModule {}
