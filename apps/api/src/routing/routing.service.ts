import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Disposition } from '@zaheri/types';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Intake } from '../../generated/prisma';
import { computeTriageTag } from './triage';

@Injectable()
export class RoutingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
    private readonly notificationsService: NotificationsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Sets one of only two dispositions on a case: SEE_DOCTOR (room + queue
   * number, within the patient's ward) or URGENT_NOW (EMD room, no queue —
   * emergencies bypass the queue). `actingUserId` is null when the red-flag
   * engine auto-routes on intake submit, and the id of the clinician when
   * triggered from the doctor console; either way it's recorded with a
   * timestamp on the case.
   */
  async route(
    intakeId: string,
    disposition: Disposition,
    actingUserId: string | null,
  ): Promise<Intake> {
    const intake = await this.prisma.intake.findUnique({ where: { id: intakeId } });
    if (!intake) {
      throw new NotFoundException('Case not found');
    }

    const room = disposition === 'URGENT_NOW' ? 'EMD' : intake.ward;
    const queueAssignment =
      disposition === 'URGENT_NOW' ? null : await this.queueService.assign(intake.ward);
    const triageTag = computeTriageTag(intake.urgent, disposition);

    const updated = await this.prisma.intake.update({
      where: { id: intakeId },
      data: {
        disposition,
        room,
        queueNumber: queueAssignment?.queueNumber ?? null,
        queueSequence: queueAssignment?.queueSequence ?? null,
        triageTag,
        status: 'ROUTED',
        routedById: actingUserId,
        routedAt: new Date(),
      },
    });

    // Lets QueueGateway push the update to the patient PWA without a
    // circular module dependency between routing and queue.
    this.eventEmitter.emit('intake.routed', updated);

    // Backstop for a patient who isn't actively watching the live status —
    // logistics only (disposition, ward, room, queue number). No complaint,
    // urgency, or triage tag is ever passed through here.
    await this.notificationsService.enqueueCaseRoutedNotification({
      registrationNumber: updated.registrationNumber,
      disposition,
      ward: updated.ward,
      room: updated.room ?? room,
      queueNumber: updated.queueNumber,
    });

    return updated;
  }
}
