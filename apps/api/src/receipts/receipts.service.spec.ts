import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReceiptsService } from './receipts.service';
import { PrismaService } from '../prisma/prisma.service';
import { signReceiptId } from './signature';

const SECRET = 'dev-only-test-secret';

function makeConfigMock() {
  return { get: jest.fn().mockReturnValue(SECRET) } as unknown as ConfigService;
}

describe('ReceiptsService.issue', () => {
  it('creates a receipt with a signature computed over its own id', async () => {
    let createdData: { id: string; signature: string; medicationNames: string[] } | null = null;
    const prisma = {
      intake: { findUnique: jest.fn().mockResolvedValue({ id: 'intake-1' }) },
      pharmacyReceipt: {
        create: jest.fn().mockImplementation(({ data }) => {
          createdData = data;
          return Promise.resolve({ ...data, status: 'ISSUED', issuedAt: new Date(), redeemedAt: null });
        }),
      },
    } as unknown as PrismaService;
    const service = new ReceiptsService(prisma, makeConfigMock());

    const dto = await service.issue('intake-1', ['Paracetamol 500mg', 'Ibuprofen 200mg'], 'clinician-1');

    expect(dto.medicationNames).toEqual(['Paracetamol 500mg', 'Ibuprofen 200mg']);
    expect(dto.status).toBe('ISSUED');
    expect(dto.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
    expect(createdData).not.toBeNull();
    expect(signReceiptId(createdData!.id, SECRET)).toBe(createdData!.signature);
  });

  it('throws NotFoundException for an unknown case', async () => {
    const prisma = {
      intake: { findUnique: jest.fn().mockResolvedValue(null) },
    } as unknown as PrismaService;
    const service = new ReceiptsService(prisma, makeConfigMock());

    await expect(service.issue('missing', ['X'], 'clinician-1')).rejects.toThrow(NotFoundException);
  });
});

describe('ReceiptsService.verify', () => {
  function makeReceiptRow(overrides: Record<string, unknown> = {}) {
    return {
      id: 'receipt-1',
      medicationNames: ['Paracetamol', 'Ibuprofen'],
      status: 'ISSUED',
      issuedAt: new Date(),
      redeemedAt: null,
      intake: { registrationNumber: 'MNH-0001' },
      signature: signReceiptId('receipt-1', SECRET),
      ...overrides,
    };
  }

  it('verifies a valid, not-yet-redeemed receipt and atomically marks it REDEEMED', async () => {
    const receipt = makeReceiptRow();
    const prisma = {
      pharmacyReceipt: {
        findUnique: jest.fn().mockResolvedValue(receipt),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    } as unknown as PrismaService;
    const service = new ReceiptsService(prisma, makeConfigMock());

    const result = await service.verify('receipt-1', receipt.signature);

    expect(result).toMatchObject({
      valid: true,
      medicationNames: ['Paracetamol', 'Ibuprofen'],
      registrationNumber: 'MNH-0001',
    });
    expect(prisma.pharmacyReceipt.updateMany).toHaveBeenCalledWith({
      where: { id: 'receipt-1', status: 'ISSUED' },
      data: { status: 'REDEEMED', redeemedAt: expect.any(Date) },
    });
  });

  it('rejects a receipt that does not exist', async () => {
    const prisma = {
      pharmacyReceipt: { findUnique: jest.fn().mockResolvedValue(null) },
    } as unknown as PrismaService;
    const service = new ReceiptsService(prisma, makeConfigMock());

    const result = await service.verify('unknown', 'whatever');

    expect(result.valid).toBe(false);
  });

  it('rejects an invalid/forged signature and never redeems it', async () => {
    const receipt = makeReceiptRow();
    const prisma = {
      pharmacyReceipt: {
        findUnique: jest.fn().mockResolvedValue(receipt),
        updateMany: jest.fn(),
      },
    } as unknown as PrismaService;
    const service = new ReceiptsService(prisma, makeConfigMock());

    const result = await service.verify('receipt-1', 'forged-signature');

    expect(result.valid).toBe(false);
    expect(prisma.pharmacyReceipt.updateMany).not.toHaveBeenCalled();
  });

  it('rejects an already-redeemed receipt without re-redeeming', async () => {
    const receipt = makeReceiptRow({ status: 'REDEEMED', redeemedAt: new Date() });
    const prisma = {
      pharmacyReceipt: {
        findUnique: jest.fn().mockResolvedValue(receipt),
        updateMany: jest.fn(),
      },
    } as unknown as PrismaService;
    const service = new ReceiptsService(prisma, makeConfigMock());

    const result = await service.verify('receipt-1', receipt.signature);

    expect(result).toMatchObject({ valid: false, alreadyRedeemed: true });
    expect(prisma.pharmacyReceipt.updateMany).not.toHaveBeenCalled();
  });

  it('rejects a concurrent double-scan that loses the atomic single-use race', async () => {
    const receipt = makeReceiptRow(); // still ISSUED as of the read
    const prisma = {
      pharmacyReceipt: {
        findUnique: jest.fn().mockResolvedValue(receipt),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }), // a concurrent scan redeemed it first
      },
    } as unknown as PrismaService;
    const service = new ReceiptsService(prisma, makeConfigMock());

    const result = await service.verify('receipt-1', receipt.signature);

    expect(result).toMatchObject({ valid: false, alreadyRedeemed: true });
  });
});
