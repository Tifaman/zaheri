import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PharmacyReceiptDto } from '@zaheri/types';
import { FormalReceipt } from './FormalReceipt';

const RECEIPT: PharmacyReceiptDto = {
  id: 'receipt-1',
  medicationNames: ['Paracetamol 500mg', 'Amoxicillin 250mg'],
  status: 'ISSUED',
  qrCodeDataUrl: 'data:image/png;base64,abc123',
  issuedAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
  redeemedAt: null,
};

describe('FormalReceipt', () => {
  it('lists every medication under a single QR code, with the emblem as a background watermark', () => {
    render(
      <FormalReceipt
        hospitalName="Muhimbili National Hospital"
        registrationNumber="MNH-0001"
        receipt={RECEIPT}
      />,
    );

    expect(screen.getByText('Paracetamol 500mg')).toBeInTheDocument();
    expect(screen.getByText('Amoxicillin 250mg')).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: /QR/i })).toHaveLength(1);
    expect(screen.getByText('MNH-0001')).toBeInTheDocument();
    expect(screen.getByText('Muhimbili National Hospital')).toBeInTheDocument();

    const emblem = screen.getByAltText('', { exact: true });
    expect(emblem).toHaveAttribute('src', '/emblem.jpg');
    expect(emblem).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows "not yet redeemed" for an ISSUED receipt', () => {
    render(
      <FormalReceipt
        hospitalName="Muhimbili National Hospital"
        registrationNumber="MNH-0001"
        receipt={RECEIPT}
      />,
    );
    expect(screen.getByText('Onyesha hii kwa mfamasia')).toBeInTheDocument();
  });

  it('shows the redeemed state once the pharmacy has scanned it', () => {
    render(
      <FormalReceipt
        hospitalName="Muhimbili National Hospital"
        registrationNumber="MNH-0001"
        receipt={{ ...RECEIPT, status: 'REDEEMED', redeemedAt: new Date().toISOString() }}
      />,
    );
    expect(screen.getByText('Risiti hii imeshatumika')).toBeInTheDocument();
  });
});
