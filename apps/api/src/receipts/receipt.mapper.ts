import * as QRCode from 'qrcode';
import { PharmacyReceiptDto, ReceiptStatus, VerifyReceiptRequest } from '@zaheri/types';
import { PharmacyReceipt } from '../../generated/prisma';

/** The QR encodes exactly VerifyReceiptRequest — the pharmacy scan posts this back verbatim. */
export async function toPharmacyReceiptDto(receipt: PharmacyReceipt): Promise<PharmacyReceiptDto> {
  const payload: VerifyReceiptRequest = { id: receipt.id, signature: receipt.signature };
  const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(payload));

  return {
    id: receipt.id,
    medicationNames: receipt.medicationNames,
    status: receipt.status as ReceiptStatus,
    qrCodeDataUrl,
    issuedAt: receipt.issuedAt.toISOString(),
    redeemedAt: receipt.redeemedAt ? receipt.redeemedAt.toISOString() : null,
  };
}
