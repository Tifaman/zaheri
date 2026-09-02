import { NotFoundException } from '@nestjs/common';
import { LabsService } from './labs.service';
import { PrismaService } from '../prisma/prisma.service';

describe('LabsService.order', () => {
  it('creates a lab order for an existing case', async () => {
    const created = {
      id: 'lab-1',
      testName: 'Full Blood Count',
      status: 'ORDERED',
      report: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const prisma = {
      intake: { findUnique: jest.fn().mockResolvedValue({ id: 'intake-1' }) },
      labOrder: { create: jest.fn().mockResolvedValue(created) },
    } as unknown as PrismaService;
    const service = new LabsService(prisma);

    const dto = await service.order('intake-1', 'Full Blood Count', 'clinician-1');

    expect(prisma.labOrder.create).toHaveBeenCalledWith({
      data: { intakeId: 'intake-1', testName: 'Full Blood Count', orderedById: 'clinician-1' },
      include: { report: true },
    });
    expect(dto).toMatchObject({ testName: 'Full Blood Count', status: 'ORDERED', resultSummary: null });
  });

  it('throws NotFoundException for an unknown case', async () => {
    const prisma = {
      intake: { findUnique: jest.fn().mockResolvedValue(null) },
    } as unknown as PrismaService;
    const service = new LabsService(prisma);

    await expect(service.order('missing', 'X', 'clinician-1')).rejects.toThrow(NotFoundException);
  });
});

describe('LabsService.report', () => {
  it('records a result and marks the order RESULTED', async () => {
    const order = { id: 'lab-1', intakeId: 'intake-1' };
    const updated = {
      id: 'lab-1',
      testName: 'Full Blood Count',
      status: 'RESULTED',
      report: { resultSummary: 'Normal', reportedAt: new Date() },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const prisma = {
      labOrder: {
        findUnique: jest.fn().mockResolvedValue(order),
        update: jest.fn().mockResolvedValue(updated),
      },
      labReport: { create: jest.fn().mockResolvedValue({}) },
    } as unknown as PrismaService;
    const service = new LabsService(prisma);

    const dto = await service.report('intake-1', 'lab-1', 'Normal');

    expect(prisma.labReport.create).toHaveBeenCalledWith({
      data: { labOrderId: 'lab-1', resultSummary: 'Normal' },
    });
    expect(dto).toMatchObject({ status: 'RESULTED', resultSummary: 'Normal' });
  });

  it('throws NotFoundException when the lab order does not exist', async () => {
    const prisma = {
      labOrder: { findUnique: jest.fn().mockResolvedValue(null) },
    } as unknown as PrismaService;
    const service = new LabsService(prisma);

    await expect(service.report('intake-1', 'missing', 'Normal')).rejects.toThrow(
      NotFoundException,
    );
  });

  it("throws NotFoundException when the lab order belongs to a different case", async () => {
    const prisma = {
      labOrder: { findUnique: jest.fn().mockResolvedValue({ id: 'lab-1', intakeId: 'intake-OTHER' }) },
    } as unknown as PrismaService;
    const service = new LabsService(prisma);

    await expect(service.report('intake-1', 'lab-1', 'Normal')).rejects.toThrow(
      NotFoundException,
    );
  });
});
