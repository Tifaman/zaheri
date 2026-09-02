import { Module } from '@nestjs/common';
import { HospitalGatewayModule } from '../hospital-gateway/hospital-gateway.module';
import { RedFlagModule } from '../red-flag/red-flag.module';
import { RoutingModule } from '../routing/routing.module';
import { IntakeController } from './intake.controller';
import { IntakeService } from './intake.service';

@Module({
  imports: [HospitalGatewayModule, RedFlagModule, RoutingModule],
  controllers: [IntakeController],
  providers: [IntakeService],
})
export class IntakeModule {}
