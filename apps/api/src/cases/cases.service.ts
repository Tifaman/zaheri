import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CaseDto, Disposition } from '@zaheri/types';
import { PrismaService } from '../prisma/prisma.service';
import { RoutingService } from '../routing/routing.service';
import { QueueService } from '../queue/queue.service';
import { NotificationsService } from '../notifications/notifications.service';
import { toCaseDto } from './case.mapper';

const CASE_INCLUDE = {
  labOrders: { include: { report: true } },
  receipts: true,
} as const;

@Injectable()
export class CasesService {
  private readonly logger = new Logger(CasesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly routingService: RoutingService,
    private readonly queueService: QueueService,
    private readonly notificationsService: NotificationsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(): Promise<CaseDto[]> {
    // triageTag is declared RED-then-GREEN in the Prisma schema, so an
    // ascending sort on it puts RED cases first — see schema.prisma.
    const intakes = await this.prisma.intake.findMany({
      orderBy: [{ triageTag: 'asc' }, { createdAt: 'desc' }],
      include: CASE_INCLUDE,
    });
    return Promise.all(intakes.map(toCaseDto));
  }

  async findOne(id: string): Promise<CaseDto> {
    const intake = await this.prisma.intake.findUnique({ where: { id }, include: CASE_INCLUDE });
    if (!intake) {
      throw new NotFoundException('Case not found');
    }
    return toCaseDto(intake);
  }

  async route(id: string, disposition: Disposition, actingUserId: string): Promise<CaseDto> {
    await this.routingService.route(id, disposition, actingUserId);
    return this.findOne(id);
  }

  /**
   * Marks a case COMPLETED and, if it was waiting in a ward's SEE_DOCTOR
   * queue (queueSequence set), backgrounds a neutral "you're near" alert to
   * whoever is next in that ward's queue — logistics only (ward, room,
   * queue number). Nothing about this case's assessment is read past
   * `ward`/`queueSequence`, and nothing about the *next* patient's
   * assessment is touched at all.
   */
  async complete(id: string): Promise<CaseDto> {
    const intake = await this.prisma.intake.findUnique({ where: { id } });
    if (!intake) {
      throw new NotFoundException('Case not found');
    }

    const updated = await this.prisma.intake.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });
    this.eventEmitter.emit('intake.completed', updated);

    if (updated.queueSequence !== null) {
      const next = await this.queueService.findNextInWard(updated.ward, updated.queueSequence);
      if (next && next.room && next.queueNumber) {
        await this.notificationsService.enqueueQueueNearNotification({
          registrationNumber: next.registrationNumber,
          ward: next.ward,
          room: next.room,
          queueNumber: next.queueNumber,
        });
      } else {
        this.logger.debug(`No next patient waiting in ${updated.ward}'s queue.`);
      }
    }

    return this.findOne(id);
  }
}
