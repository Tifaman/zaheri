import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { Intake } from '../../generated/prisma';
import { toPatientQueueStatus } from './queue.mapper';

function roomFor(intakeId: string): string {
  return `intake:${intakeId}`;
}

/**
 * Real-time queue status for the patient PWA. There is no patient login
 * (see CLAUDE.md — patients scan a QR code, they don't authenticate), so the
 * intake id itself — an unguessable UUID returned only to whoever submitted
 * it — is the subscription capability, the same trust model already used
 * for the intake id in the confirmation response.
 *
 * Only ever emits PatientQueueStatus (queue number, room, disposition,
 * status) — never complaint, body region, urgency, or triage tag. Those
 * stay on the /cases API behind clinician auth; see notifications/ for the
 * matching boundary on the SMS/WhatsApp side.
 */
@WebSocketGateway({ namespace: '/queue', cors: { origin: true } })
export class QueueGateway {
  private readonly logger = new Logger(QueueGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly prisma: PrismaService) {}

  @SubscribeMessage('subscribe')
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { intakeId?: string },
  ): Promise<void> {
    if (!data?.intakeId) return;
    await client.join(roomFor(data.intakeId));

    const intake = await this.prisma.intake.findUnique({ where: { id: data.intakeId } });
    if (intake) {
      client.emit('queue:update', toPatientQueueStatus(intake));
    }
  }

  @OnEvent(['intake.routed', 'intake.completed'])
  handleIntakeChanged(intake: Intake): void {
    this.logger.debug(`Pushing queue update for intake ${intake.id}`);
    this.server.to(roomFor(intake.id)).emit('queue:update', toPatientQueueStatus(intake));
  }
}
