import { BodyRegionCode, HospitalId, IntakeDto, IntakeStatus } from '@zaheri/types';
import { Intake } from '../../generated/prisma';

export function toIntakeDto(intake: Intake): IntakeDto {
  return {
    id: intake.id,
    hospitalId: intake.hospitalId as HospitalId,
    registrationNumber: intake.registrationNumber,
    ward: intake.ward,
    complaint: intake.complaint,
    bodyRegion: intake.bodyRegion as BodyRegionCode,
    urgent: intake.urgent,
    status: intake.status as IntakeStatus,
    createdAt: intake.createdAt.toISOString(),
    updatedAt: intake.updatedAt.toISOString(),
  };
}
