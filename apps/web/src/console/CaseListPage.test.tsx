import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CaseDto } from '@zaheri/types';
import { CaseListPage } from './CaseListPage';
import { AuthProvider } from '../auth/AuthContext';

const NEW_CASE: CaseDto = {
  id: 'case-new',
  hospitalId: 'muhimbili',
  registrationNumber: 'MNH-0001',
  ward: 'OPD',
  complaint: 'Maumivu ya kichwa',
  bodyRegion: 'HEAD',
  urgent: false,
  status: 'PENDING',
  disposition: null,
  room: null,
  queueNumber: null,
  triageTag: 'GREEN',
  routedById: null,
  routedAt: null,
  labs: [],
  receipts: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const REVIEWED_CASE: CaseDto = {
  ...NEW_CASE,
  id: 'case-reviewed',
  registrationNumber: 'MNH-0002',
  status: 'ROUTED',
  disposition: 'SEE_DOCTOR',
  room: 'OPD',
  queueNumber: 'Q-1',
};

function renderCaseList() {
  localStorage.setItem(
    'zaheri.console.session',
    JSON.stringify({ accessToken: 'token', email: 'doc@zaheri.dev', role: 'CLINICIAN' }),
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <MemoryRouter>
          <CaseListPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('CaseListPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [NEW_CASE, REVIEWED_CASE],
      }),
    );
  });

  it('defaults to the New tab, showing only unrouted cases', async () => {
    renderCaseList();

    await waitFor(() => expect(screen.getByText('MNH-0001')).toBeInTheDocument());
    expect(screen.queryByText('MNH-0002')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Mpya (1)' })).toHaveAttribute('aria-selected', 'true');
  });

  it('switches to the Reviewed tab and shows only routed/completed cases', async () => {
    renderCaseList();
    await waitFor(() => expect(screen.getByText('MNH-0001')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('tab', { name: 'Zilizopitiwa (1)' }));

    expect(screen.getByText('MNH-0002')).toBeInTheDocument();
    expect(screen.queryByText('MNH-0001')).not.toBeInTheDocument();
  });
});
