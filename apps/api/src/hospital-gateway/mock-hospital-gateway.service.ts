import { Injectable, Logger } from '@nestjs/common';
import {
  HospitalPatientRecord,
  IHospitalGateway,
  LabReport,
  QueueEntryInput,
} from './hospital-gateway.interface';

/**
 * Stand-in for GoTHOMIS until real credentials and a field mapping exist.
 * Every registration number is treated as found; ward defaults to the one
 * the patient selects during intake since there is no real lookup yet.
 * TODO: replace with GothomisGateway once GOTHOMIS_BASE_URL / GOTHOMIS_API_KEY
 * are configured (see .env.example).
 */
@Injectable()
export class MockHospitalGateway implements IHospitalGateway {
  private readonly logger = new Logger(MockHospitalGateway.name);

  async lookupPatient(registrationNumber: string): Promise<HospitalPatientRecord> {
    this.logger.debug(`[mock] lookupPatient(${registrationNumber})`);
    return {
      registrationNumber,
      ward: '',
      found: registrationNumber.trim().length > 0,
    };
  }

  async writeQueueEntry(entry: QueueEntryInput): Promise<void> {
    this.logger.debug(`[mock] writeQueueEntry(${JSON.stringify(entry)})`);
  }

  async readLabReport(registrationNumber: string): Promise<LabReport | null> {
    this.logger.debug(`[mock] readLabReport(${registrationNumber})`);
    return null;
  }
}
