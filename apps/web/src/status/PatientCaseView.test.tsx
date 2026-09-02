import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PatientCaseDto } from '@zaheri/types';
import { PatientCaseView } from './PatientCaseView';

const BASE_CASE: PatientCaseDto = {
  id: 'intake-1',
  hospitalId: 'muhimbili',
  registrationNumber: 'MNH-0001',
  ward: 'OPD',
  complaint: 'Maumivu ya kichwa',
  bodyRegion: 'HEAD',
  status: 'ROUTED',
  disposition: 'SEE_DOCTOR',
  room: 'OPD',
  queueNumber: 'Q-3',
  labs: [],
  receipts: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('PatientCaseView', () => {
  it('shows queue number and room from the polled case when no live status is present', () => {
    render(<PatientCaseView patientCase={BASE_CASE} />);
    expect(screen.getByText('Q-3')).toBeInTheDocument();
    expect(screen.getByText('OPD')).toBeInTheDocument();
  });

  it('prefers the live Socket.IO status over the polled snapshot when both are present', () => {
    render(
      <PatientCaseView
        patientCase={BASE_CASE}
        liveStatus={{
          intakeId: 'intake-1',
          status: 'COMPLETED',
          disposition: 'SEE_DOCTOR',
          room: 'Wodi ya Wanawake',
          queueNumber: 'Q-9',
          updatedAt: new Date().toISOString(),
        }}
      />,
    );
    expect(screen.getByText('Q-9')).toBeInTheDocument();
    expect(screen.getByText('Wodi ya Wanawake')).toBeInTheDocument();
    expect(screen.getByText(/Imekamilika/)).toBeInTheDocument();
  });

  it('renders lab results when present, and hides the section otherwise', () => {
    const { rerender } = render(<PatientCaseView patientCase={BASE_CASE} />);
    expect(screen.queryByText('Matokeo ya Vipimo')).not.toBeInTheDocument();

    rerender(
      <PatientCaseView
        patientCase={{
          ...BASE_CASE,
          labs: [
            {
              id: 'lab-1',
              testName: 'Full Blood Count',
              status: 'RESULTED',
              resultSummary: 'Normal',
              reportedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            },
          ],
        }}
      />,
    );
    expect(screen.getByText('Full Blood Count')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
  });

  it('shows a live waiting-time counter while the case is still open', () => {
    render(<PatientCaseView patientCase={BASE_CASE} />);
    expect(screen.getByText('Muda wa Kusubiri')).toBeInTheDocument();
  });

  it('hides the waiting-time counter once the case is completed', () => {
    render(
      <PatientCaseView
        patientCase={BASE_CASE}
        liveStatus={{
          intakeId: 'intake-1',
          status: 'COMPLETED',
          disposition: 'SEE_DOCTOR',
          room: 'Wodi ya Wanawake',
          queueNumber: 'Q-9',
          updatedAt: new Date().toISOString(),
        }}
      />,
    );
    expect(screen.queryByText('Muda wa Kusubiri')).not.toBeInTheDocument();
  });

  it('renders the QR receipt image and redemption state', () => {
    render(
      <PatientCaseView
        patientCase={{
          ...BASE_CASE,
          receipts: [
            {
              id: 'receipt-1',
              medicationNames: ['Paracetamol 500mg', 'Ibuprofen 200mg'],
              status: 'ISSUED',
              qrCodeDataUrl: 'data:image/png;base64,abc123',
              issuedAt: new Date().toISOString(),
              redeemedAt: null,
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('Paracetamol 500mg')).toBeInTheDocument();
    expect(screen.getByText('Ibuprofen 200mg')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /QR/i })).toHaveAttribute(
      'src',
      'data:image/png;base64,abc123',
    );
    expect(screen.getByText('Onyesha hii kwa mfamasia')).toBeInTheDocument();
  });
});
