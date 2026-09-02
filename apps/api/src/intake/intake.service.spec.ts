import { BadRequestException } from '@nestjs/common';
import { IntakeService } from './intake.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedFlagService } from '../red-flag/red-flag.service';
import { RoutingService } from '../routing/routing.service';
import { IHospitalGateway } from '../hospital-gateway/hospital-gateway.interface';
import { CreateIntakeDto } from './dto/create-intake.dto';

describe('IntakeService', () => {
  const baseDto: CreateIntakeDto = {
    hospitalId: 'muhimbili',
    registrationNumber: 'MNH-1',
    ward: 'OPD',
    complaint: 'Maumivu ya kichwa',
    bodyRegion: 'HEAD',
  };

  function makeService({ flagged = false }: { flagged?: boolean } = {}) {
    const createdIntake = {
      id: 'intake-1',
      ...baseDto,
      patientId: 'patient-1',
      urgent: flagged,
      status: 'PENDING' as const,
      disposition: null,
      room: null,
      queueNumber: null,
      triageTag: flagged ? ('RED' as const) : ('GREEN' as const),
      routedById: null,
      routedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const prisma = {
      patient: {
        upsert: jest
          .fn()
          .mockResolvedValue({ id: 'patient-1', registrationNumber: baseDto.registrationNumber }),
      },
      intake: { create: jest.fn().mockResolvedValue(createdIntake) },
    } as unknown as PrismaService;

    const hospitalGateway: IHospitalGateway = {
      lookupPatient: jest
        .fn()
        .mockResolvedValue({ registrationNumber: baseDto.registrationNumber, ward: '', found: true }),
      writeQueueEntry: jest.fn(),
      readLabReport: jest.fn(),
    };

    const redFlagService = {
      evaluate: jest.fn().mockReturnValue(flagged),
    } as unknown as RedFlagService;

    const routedIntake = {
      ...createdIntake,
      disposition: 'URGENT_NOW' as const,
      room: 'EMD',
      status: 'ROUTED' as const,
    };
    const routingService = {
      route: jest.fn().mockResolvedValue(routedIntake),
    } as unknown as RoutingService;

    return {
      service: new IntakeService(prisma, hospitalGateway, redFlagService, routingService),
      hospitalGateway,
      routingService,
    };
  }

  it('rejects an unknown registration number', async () => {
    const { service, hospitalGateway } = makeService();
    (hospitalGateway.lookupPatient as jest.Mock).mockResolvedValue({
      registrationNumber: '',
      ward: '',
      found: false,
    });

    await expect(service.create(baseDto)).rejects.toThrow(BadRequestException);
  });

  it('creates a routine intake and does not auto-route when no red flag fires', async () => {
    const { service, routingService } = makeService({ flagged: false });

    const result = await service.create(baseDto);

    expect(result.urgent).toBe(false);
    expect(routingService.route).not.toHaveBeenCalled();
  });

  it('auto-routes to URGENT_NOW when the red-flag engine fires on submit', async () => {
    const { service, routingService } = makeService({ flagged: true });

    const result = await service.create(baseDto);

    expect(routingService.route).toHaveBeenCalledWith('intake-1', 'URGENT_NOW', null);
    expect(result.urgent).toBe(true);
  });
});
