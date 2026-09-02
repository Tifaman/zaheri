import { BodyRegionCode, CaseDto, Disposition, HospitalId, IntakeStatus, TriageTag } from '@zaheri/types';
import { Intake, LabOrder, LabReport, PharmacyReceipt } from '../../generated/prisma';
import { toLabOrderDto } from '../labs/lab.mapper';
import { toPharmacyReceiptDto } from '../receipts/receipt.mapper';

export type CaseWithRelations = Intake & {
  labOrders: (LabOrder & { report: LabReport | null })[];
  receipts: PharmacyReceipt[];
};

export async function toCaseDto(intake: CaseWithRelations): Promise<CaseDto> {
  return {
    id: intake.id,
    hospitalId: intake.hospitalId as HospitalId,
    registrationNumber: intake.registrationNumber,
    ward: intake.ward,
    complaint: intake.complaint,
    bodyRegion: intake.bodyRegion as BodyRegionCode,
    urgent: intake.urgent,
    status: intake.status as IntakeStatus,
    disposition: intake.disposition as Disposition | null,
    room: intake.room,
    queueNumber: intake.queueNumber,
    triageTag: intake.triageTag as TriageTag,
    routedById: intake.routedById,
    routedAt: intake.routedAt ? intake.routedAt.toISOString() : null,
    labs: intake.labOrders.map(toLabOrderDto),
    receipts: await Promise.all(intake.receipts.map(toPharmacyReceiptDto)),
    createdAt: intake.createdAt.toISOString(),
    updatedAt: intake.updatedAt.toISOString(),
  };
}
