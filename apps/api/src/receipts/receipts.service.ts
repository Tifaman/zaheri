import { randomUUID } from 'crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PharmacyReceiptDto, VerifyReceiptResponse } from '@zaheri/types';
import { PrismaService } from '../prisma/prisma.service';
import { signReceiptId, verifyReceiptSignature } from './signature';
import { toPharmacyReceiptDto } from './receipt.mapper';

@Injectable()
export class ReceiptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private getSecret(): string {
    const key = this.config.get<string>('RECEIPT_SIGNING_KEY');
    if (!key) {
      throw new Error('RECEIPT_SIGNING_KEY is not set (see .env.example)');
    }
    return key;
  }

  /**
   * The doctor issues one signed, single-use pharmacy receipt covering
   * every medication from this visit — one QR, one document, not one per
   * medication.
   */
  async issue(
    caseId: string,
    medicationNames: string[],
    issuedById: string,
  ): Promise<PharmacyReceiptDto> {
    const intake = await this.prisma.intake.findUnique({ where: { id: caseId } });
    if (!intake) {
      throw new NotFoundException('Case not found');
    }

    // Generated here (not left to Prisma's @default(uuid())) so the
    // signature — computed over this id — is ready before the row exists.
    const id = randomUUID();
    const signature = signReceiptId(id, this.getSecret());

    const receipt = await this.prisma.pharmacyReceipt.create({
      data: { id, intakeId: caseId, medicationNames, issuedById, signature },
    });
    return toPharmacyReceiptDto(receipt);
  }

  /**
   * The pharmacy scans the QR and posts back { id, signature } verbatim —
   * that pair is the entire credential, deliberately unauthenticated
   * (there's no pharmacy staff account system yet; scanning a patient's
   * receipt is the real-world equivalent of a boarding-pass barcode scan).
   * Trust rests entirely on: the signature must verify against
   * RECEIPT_SIGNING_KEY (unforgeable without it), and the receipt must
   * still be ISSUED — the update below only succeeds if it is, so a
   * concurrent second scan can never also redeem it.
   */
  async verify(id: string, signature: string): Promise<VerifyReceiptResponse> {
    const receipt = await this.prisma.pharmacyReceipt.findUnique({
      where: { id },
      include: { intake: true },
    });
    if (!receipt) {
      return { valid: false, message: 'Receipt not found.' };
    }
    if (!verifyReceiptSignature(id, signature, this.getSecret())) {
      return { valid: false, message: 'Invalid signature — receipt not honoured.' };
    }
    if (receipt.status === 'REDEEMED') {
      return { valid: false, alreadyRedeemed: true, message: 'Receipt already redeemed.' };
    }

    const result = await this.prisma.pharmacyReceipt.updateMany({
      where: { id, status: 'ISSUED' },
      data: { status: 'REDEEMED', redeemedAt: new Date() },
    });
    if (result.count === 0) {
      // Lost a race with a concurrent scan between the read above and this update.
      return { valid: false, alreadyRedeemed: true, message: 'Receipt already redeemed.' };
    }

    return {
      valid: true,
      medicationNames: receipt.medicationNames,
      registrationNumber: receipt.intake.registrationNumber,
      message: 'Receipt verified.',
    };
  }
}
