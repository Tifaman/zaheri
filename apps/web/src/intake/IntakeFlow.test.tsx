import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IntakeFlow } from './IntakeFlow';

function renderFlow() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/intake']}>
        <IntakeFlow />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('IntakeFlow', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'intake-1',
          hospitalId: 'muhimbili',
          registrationNumber: 'MNH-0001',
          ward: 'OPD (Wagonjwa wa Nje)',
          complaint: 'Maumivu ya kichwa',
          bodyRegion: 'HEAD',
          urgent: false,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      }),
    );
  });

  it('walks the guided intake path end to end and submits', async () => {
    renderFlow();

    // (a) welcome + consent
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Endelea' }));

    // (b) registration number
    fireEvent.change(screen.getByPlaceholderText('mfano: MNH-0001'), {
      target: { value: 'MNH-0001' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Endelea' }));

    // (c) ward selection
    fireEvent.click(screen.getByRole('button', { name: 'OPD (Wagonjwa wa Nje)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Endelea' }));

    // (d) complaint
    fireEvent.change(screen.getByPlaceholderText('Eleza kwa ufupi...'), {
      target: { value: 'Maumivu ya kichwa' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Endelea' }));

    // (e) body region
    fireEvent.click(screen.getByRole('button', { name: 'Kichwa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Endelea' }));

    // (f) confirmation
    expect(screen.getByText('MNH-0001')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thibitisha na Tuma' }));

    await waitFor(() => expect(screen.getByText('Taarifa zimetumwa!')).toBeInTheDocument());
    expect(fetch).toHaveBeenCalledWith(
      '/api/intake',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
