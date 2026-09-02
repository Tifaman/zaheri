import Redis from 'ioredis';
import { QueueService } from './queue.service';
import { PrismaService } from '../prisma/prisma.service';

function makeRedisMock(sequence = 1) {
  return { incr: jest.fn().mockResolvedValue(sequence) } as unknown as Redis;
}

function makePrismaMock(nextIntake: unknown = null) {
  return {
    intake: { findFirst: jest.fn().mockResolvedValue(nextIntake) },
  } as unknown as PrismaService;
}

describe('QueueService', () => {
  it('assigns a sequential, ward-scoped queue number via an atomic Redis INCR', async () => {
    const redis = makeRedisMock(3);
    const service = new QueueService(redis, makePrismaMock());

    const result = await service.assign('OPD');

    expect(result).toEqual({ queueNumber: 'Q-3', queueSequence: 3 });
    expect(redis.incr).toHaveBeenCalledTimes(1);
    const [key] = (redis.incr as jest.Mock).mock.calls[0];
    expect(key).toContain('OPD');
  });

  it('finds the next SEE_DOCTOR/ROUTED case in the ward after a given sequence', async () => {
    const nextIntake = { id: 'intake-2', queueSequence: 8 };
    const prisma = makePrismaMock(nextIntake);
    const service = new QueueService(makeRedisMock(), prisma);

    const result = await service.findNextInWard('OPD', 5);

    expect(result).toBe(nextIntake);
    expect(prisma.intake.findFirst).toHaveBeenCalledWith({
      where: {
        ward: 'OPD',
        disposition: 'SEE_DOCTOR',
        status: 'ROUTED',
        queueSequence: { gt: 5 },
      },
      orderBy: { queueSequence: 'asc' },
    });
  });

  it('returns null when no one else is waiting', async () => {
    const service = new QueueService(makeRedisMock(), makePrismaMock(null));
    await expect(service.findNextInWard('OPD', 5)).resolves.toBeNull();
  });
});
