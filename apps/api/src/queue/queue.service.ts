import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.constants';
import { PrismaService } from '../prisma/prisma.service';
import { Intake } from '../../generated/prisma';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD, resets daily
}

@Injectable()
export class QueueService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly prisma: PrismaService,
  ) {}

  /** Atomically assigns the next queue number for a ward, resetting daily. */
  async assign(ward: string): Promise<{ queueNumber: string; queueSequence: number }> {
    const key = `zaheri:queue:${ward}:${todayKey()}`;
    const sequence = await this.redis.incr(key);
    return { queueNumber: `Q-${sequence}`, queueSequence: sequence };
  }

  /**
   * The next patient still waiting in this ward's SEE_DOCTOR queue after the
   * one just completed — used to send them a neutral "you're near" alert.
   */
  async findNextInWard(ward: string, afterQueueSequence: number): Promise<Intake | null> {
    return this.prisma.intake.findFirst({
      where: {
        ward,
        disposition: 'SEE_DOCTOR',
        status: 'ROUTED',
        queueSequence: { gt: afterQueueSequence },
      },
      orderBy: { queueSequence: 'asc' },
    });
  }
}
