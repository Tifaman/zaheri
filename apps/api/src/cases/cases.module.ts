import { Module } from '@nestjs/common';
import { RoutingModule } from '../routing/routing.module';
import { QueueModule } from '../queue/queue.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';

@Module({
  imports: [RoutingModule, QueueModule, NotificationsModule],
  controllers: [CasesController],
  providers: [CasesService],
})
export class CasesModule {}
