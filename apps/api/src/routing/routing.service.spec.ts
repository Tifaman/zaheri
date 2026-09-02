import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RoutingService } from './routing.service';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { NotificationsService } from '../notifications/notifications.service';

function makePrismaMock(
  overrides: {
    intake?: Partial<{ id: string; ward: string; urgent: boolean; registrationNumber: string }>;
  } = {},
) {
  const intake = {
    id: 'intake-1',
    ward: 'OPD (Wagonjwa wa Nje)',
    urgent: false,
    registrationNumber: 'MNH-0001',
    ...overrides.intake,
  };
  return {
    intake: {
      findUnique: jest.fn().mockResolvedValue(intake),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...intake, ...data })),
    },
  } as unknown as PrismaService;
}

function makeQueueServiceMock(queueSequence = 5) {
  return {
    assign: jest.fn().mockResolvedValue({ queueNumber: `Q-${queueSequence}`, queueSequence }),
  } as unknown as QueueService;
}

function makeEventEmitterMock() {
  return { emit: jest.fn() } as unknown as EventEmitter2;
}

function makeNotificationsServiceMock() {
  return {
    enqueueCaseRoutedNotification: jest.fn().mockResolvedValue(undefined),
  } as unknown as NotificationsService;
}

describe('RoutingService', () => {
  it('routes URGENT_NOW to the EMD room with no queue number, and skips queue assignment', async () => {
    const prisma = makePrismaMock({ intake: { urgent: true } });
    const queueService = makeQueueServiceMock();
    const events = makeEventEmitterMock();
    const notifications = makeNotificationsServiceMock();
    const service = new RoutingService(prisma, queueService, notifications, events);

    const result = await service.route('intake-1', 'URGENT_NOW', null);

    expect(result.room).toBe('EMD');
    expect(result.queueNumber).toBeNull();
    expect(result.triageTag).toBe('RED');
    expect(result.status).toBe('ROUTED');
    expect(result.routedById).toBeNull();
    expect(result.routedAt).toBeInstanceOf(Date);
    expect(queueService.assign).not.toHaveBeenCalled();
  });

  it("routes SEE_DOCTOR to the patient's ward with an assigned queue number", async () => {
    const prisma = makePrismaMock();
    const queueService = makeQueueServiceMock(5);
    const events = makeEventEmitterMock();
    const notifications = makeNotificationsServiceMock();
    const service = new RoutingService(prisma, queueService, notifications, events);

    const result = await service.route('intake-1', 'SEE_DOCTOR', 'clinician-1');

    expect(queueService.assign).toHaveBeenCalledWith('OPD (Wagonjwa wa Nje)');
    expect(result.room).toBe('OPD (Wagonjwa wa Nje)');
    expect(result.queueNumber).toBe('Q-5');
    expect(result.queueSequence).toBe(5);
    expect(result.triageTag).toBe('GREEN');
    expect(result.routedById).toBe('clinician-1');
  });

  it('stays RED for SEE_DOCTOR if the red-flag engine had already fired', async () => {
    const prisma = makePrismaMock({ intake: { urgent: true } });
    const service = new RoutingService(
      prisma,
      makeQueueServiceMock(),
      makeNotificationsServiceMock(),
      makeEventEmitterMock(),
    );

    const result = await service.route('intake-1', 'SEE_DOCTOR', 'clinician-1');

    expect(result.triageTag).toBe('RED');
  });

  it('emits intake.routed so the queue gateway can push a realtime update', async () => {
    const prisma = makePrismaMock();
    const events = makeEventEmitterMock();
    const service = new RoutingService(
      prisma,
      makeQueueServiceMock(),
      makeNotificationsServiceMock(),
      events,
    );

    const result = await service.route('intake-1', 'SEE_DOCTOR', 'clinician-1');

    expect(events.emit).toHaveBeenCalledWith('intake.routed', result);
  });

  it('backgrounds a "you\'ve been routed" notification with room + queue number, no clinical fields', async () => {
    const prisma = makePrismaMock();
    const notifications = makeNotificationsServiceMock();
    const service = new RoutingService(
      prisma,
      makeQueueServiceMock(5),
      notifications,
      makeEventEmitterMock(),
    );

    await service.route('intake-1', 'SEE_DOCTOR', 'clinician-1');

    expect(notifications.enqueueCaseRoutedNotification).toHaveBeenCalledWith({
      registrationNumber: 'MNH-0001',
      disposition: 'SEE_DOCTOR',
      ward: 'OPD (Wagonjwa wa Nje)',
      room: 'OPD (Wagonjwa wa Nje)',
      queueNumber: 'Q-5',
    });
  });

  it('backgrounds an EMD "come now" notification for URGENT_NOW, with no queue number', async () => {
    const prisma = makePrismaMock();
    const notifications = makeNotificationsServiceMock();
    const service = new RoutingService(
      prisma,
      makeQueueServiceMock(),
      notifications,
      makeEventEmitterMock(),
    );

    await service.route('intake-1', 'URGENT_NOW', null);

    expect(notifications.enqueueCaseRoutedNotification).toHaveBeenCalledWith({
      registrationNumber: 'MNH-0001',
      disposition: 'URGENT_NOW',
      ward: 'OPD (Wagonjwa wa Nje)',
      room: 'EMD',
      queueNumber: null,
    });
  });

  it('throws NotFoundException for an unknown case', async () => {
    const prisma = makePrismaMock();
    (prisma.intake.findUnique as jest.Mock).mockResolvedValue(null);
    const service = new RoutingService(
      prisma,
      makeQueueServiceMock(),
      makeNotificationsServiceMock(),
      makeEventEmitterMock(),
    );

    await expect(service.route('missing', 'SEE_DOCTOR', null)).rejects.toThrow(
      NotFoundException,
    );
  });
});
