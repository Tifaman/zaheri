import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CasesService } from './cases.service';
import { PrismaService } from '../prisma/prisma.service';
import { RoutingService } from '../routing/routing.service';
import { QueueService } from '../queue/queue.service';
import { NotificationsService } from '../notifications/notifications.service';

function makeIntake(overrides: Record<string, unknown> = {}) {
  return {
    id: 'intake-1',
    registrationNumber: 'MNH-0001',
    ward: 'OPD',
    complaint: 'Maumivu ya kichwa',
    bodyRegion: 'HEAD',
    urgent: false,
    status: 'ROUTED',
    disposition: 'SEE_DOCTOR',
    room: 'OPD',
    queueNumber: 'Q-3',
    queueSequence: 3,
    triageTag: 'GREEN',
    routedById: 'clinician-1',
    routedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    labOrders: [],
    receipts: [],
    ...overrides,
  };
}

function makeDeps({
  intake = makeIntake(),
  nextIntake = null as ReturnType<typeof makeIntake> | null,
}: { intake?: ReturnType<typeof makeIntake>; nextIntake?: ReturnType<typeof makeIntake> | null } = {}) {
  // A mutable "row" so findUnique reflects whatever update() last wrote —
  // complete() reads it once before updating, then findOne() re-reads it
  // afterward and must see the new status, same as a real database would.
  let row = { ...intake };
  const completed = { ...intake, status: 'COMPLETED' };
  const prisma = {
    intake: {
      findUnique: jest.fn().mockImplementation(() => Promise.resolve(row)),
      update: jest.fn().mockImplementation(({ data }) => {
        row = { ...row, ...data };
        return Promise.resolve(row);
      }),
    },
  } as unknown as PrismaService;
  const routingService = {} as unknown as RoutingService;
  const queueService = {
    findNextInWard: jest.fn().mockResolvedValue(nextIntake),
  } as unknown as QueueService;
  const notificationsService = {
    enqueueQueueNearNotification: jest.fn().mockResolvedValue(undefined),
  } as unknown as NotificationsService;
  const eventEmitter = { emit: jest.fn() } as unknown as EventEmitter2;

  return {
    service: new CasesService(prisma, routingService, queueService, notificationsService, eventEmitter),
    prisma,
    queueService,
    notificationsService,
    eventEmitter,
    completed,
  };
}

describe('CasesService.complete', () => {
  it('marks the case COMPLETED and emits intake.completed', async () => {
    const { service, prisma, eventEmitter, completed } = makeDeps();

    const result = await service.complete('intake-1');

    expect(prisma.intake.update).toHaveBeenCalledWith({
      where: { id: 'intake-1' },
      data: { status: 'COMPLETED' },
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith('intake.completed', completed);
    expect(result.status).toBe('COMPLETED');
  });

  it('notifies the next patient in the ward queue with logistics only', async () => {
    const nextIntake = makeIntake({
      id: 'intake-2',
      registrationNumber: 'MNH-0002',
      complaint: 'a different complaint entirely',
      queueSequence: 4,
      queueNumber: 'Q-4',
    });
    const { service, queueService, notificationsService } = makeDeps({ nextIntake });

    await service.complete('intake-1');

    expect(queueService.findNextInWard).toHaveBeenCalledWith('OPD', 3);
    expect(notificationsService.enqueueQueueNearNotification).toHaveBeenCalledWith({
      registrationNumber: 'MNH-0002',
      ward: 'OPD',
      room: 'OPD',
      queueNumber: 'Q-4',
    });
    // The next patient's own complaint must never appear in what's sent.
    const [payload] = (notificationsService.enqueueQueueNearNotification as jest.Mock).mock
      .calls[0];
    expect(JSON.stringify(payload)).not.toContain('a different complaint entirely');
  });

  it('does not notify anyone when no one else is waiting', async () => {
    const { service, notificationsService } = makeDeps({ nextIntake: null });

    await service.complete('intake-1');

    expect(notificationsService.enqueueQueueNearNotification).not.toHaveBeenCalled();
  });

  it('skips the queue lookup entirely for a case that was never queued (e.g. URGENT_NOW)', async () => {
    const intake = makeIntake({ disposition: 'URGENT_NOW', room: 'EMD', queueNumber: null, queueSequence: null });
    const { service, queueService, notificationsService } = makeDeps({ intake });

    await service.complete('intake-1');

    expect(queueService.findNextInWard).not.toHaveBeenCalled();
    expect(notificationsService.enqueueQueueNearNotification).not.toHaveBeenCalled();
  });

  it('throws NotFoundException for an unknown case', async () => {
    const { service, prisma } = makeDeps();
    (prisma.intake.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.complete('missing')).rejects.toThrow(NotFoundException);
  });
});
