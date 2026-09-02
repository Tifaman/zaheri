import { Module } from '@nestjs/common';
import { HOSPITAL_GATEWAY } from './hospital-gateway.interface';
import { MockHospitalGateway } from './mock-hospital-gateway.service';

@Module({
  providers: [{ provide: HOSPITAL_GATEWAY, useClass: MockHospitalGateway }],
  exports: [HOSPITAL_GATEWAY],
})
export class HospitalGatewayModule {}
