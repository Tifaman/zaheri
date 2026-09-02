import { BodyRegionCode, Disposition, HospitalId, IntakeStatus, PatientCaseDto } from '@zaheri/types';
import { toLabOrderDto } from '../labs/lab.mapper';
import { toPharmacyReceiptDto } from '../receipts/receipt.mapper';
import { CaseWithRelations } from '../cases/case.mapper';

/**
 * What the patient sees of their own case — no `urgent`, `triageTag`, or
 * `routedById`. Those stay doctor-console-only (see cases/case.mapper.ts);
 * see PatientCaseDto for the reasoning.
 */
export async function toPatientCaseDto(intake: CaseWithRelations): Promise<PatientCaseDto> {
  return {
    id: intake.id,
    hospitalId: intake.hospitalId as HospitalId,
    registrationNumber: intake.registrationNumber,
    ward: intake.ward,
    complaint: intake.complaint,
    bodyRegion: intake.bodyRegion as BodyRegionCode,
    status: intake.status as IntakeStatus,
    disposition: intake.disposition as Disposition | null,
    room: intake.room,
    queueNumber: intake.queueNumber,
    labs: intake.labOrders.map(toLabOrderDto),
    receipts: await Promise.all(intake.receipts.map(toPharmacyReceiptDto)),
    createdAt: intake.createdAt.toISOString(),
    updatedAt: intake.updatedAt.toISOString(),
  };
}
