import { Injectable, NotFoundException } from '@nestjs/common';
import { LabOrderDto } from '@zaheri/types';
import { PrismaService } from '../prisma/prisma.service';
import { toLabOrderDto } from './lab.mapper';

@Injectable()
export class LabsService {
  constructor(private readonly prisma: PrismaService) {}

  async order(caseId: string, testName: string, orderedById: string): Promise<LabOrderDto> {
    const intake = await this.prisma.intake.findUnique({ where: { id: caseId } });
    if (!intake) {
      throw new NotFoundException('Case not found');
    }

    const created = await this.prisma.labOrder.create({
      data: { intakeId: caseId, testName, orderedById },
      include: { report: true },
    });
    return toLabOrderDto(created);
  }

  async report(caseId: string, labOrderId: string, resultSummary: string): Promise<LabOrderDto> {
    const order = await this.prisma.labOrder.findUnique({ where: { id: labOrderId } });
    if (!order || order.intakeId !== caseId) {
      throw new NotFoundException('Lab order not found');
    }

    await this.prisma.labReport.create({ data: { labOrderId, resultSummary } });
    const updated = await this.prisma.labOrder.update({
      where: { id: labOrderId },
      data: { status: 'RESULTED' },
      include: { report: true },
    });
    return toLabOrderDto(updated);
  }
}
