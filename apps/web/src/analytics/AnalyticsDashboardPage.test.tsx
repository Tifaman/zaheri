import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FlowMetricsDto, SymptomTrendsDto } from '@zaheri/types';
import { AnalyticsDashboardPage } from './AnalyticsDashboardPage';
import { AuthProvider } from '../auth/AuthContext';

const FLOW: FlowMetricsDto = {
  rangeFrom: '2026-05-01T00:00:00.000Z',
  rangeTo: '2026-06-01T00:00:00.000Z',
  pendingThresholdMinutes: 30,
  overall: {
    totalIntakes: 12,
    avgWaitToRouteMinutes: 15.5,
    medianWaitToRouteMinutes: 14,
    avgWaitToCompleteMinutes: 45,
  },
  byHospital: [
    {
      hospitalId: 'muhimbili',
      totalIntakes: 12,
      avgWaitToRouteMinutes: 15.5,
      medianWaitToRouteMinutes: 14,
      avgWaitToCompleteMinutes: 45,
      pendingOverThreshold: 1,
    },
  ],
  bottlenecks: [
    { hospitalId: 'muhimbili', ward: 'OPD', pendingCount: 3, oldestPendingMinutes: 42 },
  ],
};

const TRENDS: SymptomTrendsDto = {
  rangeFrom: '2026-05-01T00:00:00.000Z',
  rangeTo: '2026-06-01T00:00:00.000Z',
  minCellSize: 5,
  points: [
    { date: '2026-05-10', hospitalId: 'muhimbili', bodyRegion: 'HEAD', count: 8, redFlagCount: 1 },
  ],
};

function renderDashboard() {
  localStorage.setItem(
    'zaheri.console.session',
    JSON.stringify({ accessToken: 'token', email: 'admin@zaheri.dev', role: 'ADMIN' }),
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <MemoryRouter>
          <AnalyticsDashboardPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('AnalyticsDashboardPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/analytics/flow')) {
          return Promise.resolve({ ok: true, json: async () => FLOW });
        }
        if (url.includes('/analytics/symptom-trends')) {
          return Promise.resolve({ ok: true, json: async () => TRENDS });
        }
        throw new Error(`Unexpected fetch: ${url}`);
      }),
    );
  });

  it('shows flow summary stats, the bottleneck alert, and the per-hospital table', async () => {
    renderDashboard();

    await waitFor(() => expect(screen.getAllByText('12').length).toBeGreaterThan(0));
    expect(screen.getAllByText('15.5 dk').length).toBeGreaterThan(0);
    expect(screen.getByText(/Wodi OPD: wagonjwa 3 wanasubiri/)).toBeInTheDocument();
  });

  it('shows the anonymised symptom trend table with only aggregated cells', async () => {
    renderDashboard();

    await waitFor(() => expect(screen.getByText('2026-05-10')).toBeInTheDocument());
    expect(screen.getAllByText('Kichwa').length).toBeGreaterThan(0);
    expect(screen.getAllByText('8').length).toBeGreaterThan(0);
    expect(screen.getByText(/Makundi madogo \(chini ya 5\)/)).toBeInTheDocument();
  });

  it('filters both sections down to the selected hospital', async () => {
    renderDashboard();
    await waitFor(() => expect(screen.getByText('2026-05-10')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Hospitali'), { target: { value: 'jkci' } });

    expect(screen.queryByText('2026-05-10')).not.toBeInTheDocument();
    expect(screen.queryByText(/wagonjwa 3 wanasubiri/)).not.toBeInTheDocument();
  });
});
