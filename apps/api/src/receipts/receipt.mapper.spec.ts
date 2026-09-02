import { toPharmacyReceiptDto } from './receipt.mapper';
import { PharmacyReceipt } from '../../generated/prisma';

describe('toPharmacyReceiptDto', () => {
  it('maps a receipt and embeds a scannable QR data URL', async () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const receipt: PharmacyReceipt = {
      id: 'receipt-1',
      intakeId: 'intake-1',
      medicationNames: ['Paracetamol 500mg'],
      issuedById: 'clinician-1',
      signature: 'abc123',
      status: 'ISSUED',
      issuedAt: now,
      redeemedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    const dto = await toPharmacyReceiptDto(receipt);

    expect(dto).toMatchObject({
      id: 'receipt-1',
      medicationNames: ['Paracetamol 500mg'],
      status: 'ISSUED',
      issuedAt: now.toISOString(),
      redeemedAt: null,
    });
    expect(dto.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it('reflects a REDEEMED receipt with its redeemedAt timestamp', async () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const redeemedAt = new Date('2026-01-02T00:00:00.000Z');
    const receipt: PharmacyReceipt = {
      id: 'receipt-1',
      intakeId: 'intake-1',
      medicationNames: ['Paracetamol 500mg'],
      issuedById: 'clinician-1',
      signature: 'abc123',
      status: 'REDEEMED',
      issuedAt: now,
      redeemedAt,
      createdAt: now,
      updatedAt: redeemedAt,
    };

    const dto = await toPharmacyReceiptDto(receipt);

    expect(dto.status).toBe('REDEEMED');
    expect(dto.redeemedAt).toBe(redeemedAt.toISOString());
  });
});
