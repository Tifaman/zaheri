import { Injectable, Logger } from '@nestjs/common';
import { IMessagingGateway, PatientNotification } from './messaging-gateway.interface';

/**
 * Stand-in for the real SMS/WhatsApp gateway until credentials exist.
 * TODO: replace with a real gateway once SMS_PROVIDER / SMS_API_KEY /
 * SMS_SENDER_ID are configured (see .env.example).
 */
@Injectable()
export class MockMessagingGateway implements IMessagingGateway {
  private readonly logger = new Logger(MockMessagingGateway.name);

  async sendSms(notification: PatientNotification): Promise<void> {
    this.logger.log(
      `[mock SMS] to registration ${notification.registrationNumber}: "${notification.message}"`,
    );
  }
}
