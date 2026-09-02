import { BadRequestException, Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { IntakeDto, PatientCaseDto } from '@zaheri/types';
import { PrismaService } from '../prisma/prisma.service';
import { HOSPITAL_GATEWAY, IHospitalGateway } from '../hospital-gateway/hospital-gateway.interface';
import { RedFlagService } from '../red-flag/red-flag.service';
import { RoutingService } from '../routing/routing.service';
import { computeTriageTag } from '../routing/triage';
import { CreateIntakeDto } from './dto/create-intake.dto';
import { toIntakeDto } from './intake.mapper';
import { toPatientCaseDto } from './patient-case.mapper';

const PATIENT_CASE_INCLUDE = {
  labOrders: { include: { report: true } },
  receipts: true,
} as const;

@Injectable()
export class IntakeService {
  private readonly logger = new Logger(IntakeService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(HOSPITAL_GATEWAY) private readonly hospitalGateway: IHospitalGateway,
    private readonly redFlagService: RedFlagService,
    private readonly routingService: RoutingService,
  ) {}

  async create(dto: CreateIntakeDto): Promise<IntakeDto> {
    const record = await this.hospitalGateway.lookupPatient(dto.registrationNumber);
    if (!record.found) {
      throw new BadRequestException('Registration number not found');
    }

    const patient = await this.prisma.patient.upsert({
      where: { registrationNumber: dto.registrationNumber },
      update: {},
      create: { registrationNumber: dto.registrationNumber },
    });

    const flagged = this.redFlagService.evaluate(dto.complaint, dto.bodyRegion);

    let intake = await this.prisma.intake.create({
      data: {
        patientId: patient.id,
        hospitalId: dto.hospitalId,
        registrationNumber: dto.registrationNumber,
        ward: dto.ward,
        complaint: dto.complaint,
        bodyRegion: dto.bodyRegion,
        urgent: flagged,
        triageTag: computeTriageTag(flagged, null),
      },
    });

    if (flagged) {
      // TODO(Phase 2): replace this log with a real-time staff alert via the
      // Socket.IO gateway (and SMS/WhatsApp per CLAUDE.md's build order).
      this.logger.warn(
        `Red flag fired for intake ${intake.id} (ward ${intake.ward}) — auto-routing to EMD.`,
      );
      intake = await this.routingService.route(intake.id, 'URGENT_NOW', null);
    }

    return toIntakeDto(intake);
  }

  /**
   * Patient-facing lookup by intake id — the id itself (an unguessable
   * UUID, returned only to whoever submitted it) is the capability, the
   * same trust model as the Socket.IO queue subscription. Never includes
   * `urgent`/`triageTag`/`routedById` — see patient-case.mapper.ts.
   */
  async findPatientView(id: string): Promise<PatientCaseDto> {
    const intake = await this.prisma.intake.findUnique({
      where: { id },
      include: PATIENT_CASE_INCLUDE,
    });
    if (!intake) {
      throw new NotFoundException('Intake not found');
    }
    return toPatientCaseDto(intake);
  }
}
