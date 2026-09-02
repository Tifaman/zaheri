import { BadRequestException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

interface FlowFixtureRow {
  hospitalId: string;
  status: string;
  createdAt: Date;
  routedAt: Date | null;
  updatedAt: Date;
}
interface PendingFixtureRow {
  hospitalId: string;
  ward: string;
  createdAt: Date;
}
interface SymptomFixtureRow {
  hospitalId: string;
  bodyRegion: string;
  createdAt: Date;
  urgent: boolean;
  triageTag: string;
}

function makePrismaMock(rangeRows: unknown[], pendingRows: PendingFixtureRow[] = []) {
  const findMany = jest.fn().mockImplementation(({ where }: { where: Record<string, unknown> }) => {
    if (where.status === 'PENDING') return Promise.resolve(pendingRows);
    return Promise.resolve(rangeRows);
  });
  return { intake: { findMany } } as unknown as PrismaService;
}

const NOW = new Date('2026-06-15T12:00:00.000Z');

describe('AnalyticsService.getFlowMetrics', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('computes avg/median wait-to-route and wait-to-complete in minutes', async () => {
    const rows: FlowFixtureRow[] = [
      {
        hospitalId: 'muhimbili',
        status: 'ROUTED',
        createdAt: new Date('2026-06-01T10:00:00.000Z'),
        routedAt: new Date('2026-06-01T10:10:00.000Z'), // 10 min
        updatedAt: new Date('2026-06-01T10:10:00.000Z'),
      },
      {
        hospitalId: 'muhimbili',
        status: 'COMPLETED',
        createdAt: new Date('2026-06-01T09:00:00.000Z'),
        routedAt: new Date('2026-06-01T09:20:00.000Z'), // 20 min
        updatedAt: new Date('2026-06-01T10:00:00.000Z'), // 60 min total
      },
    ];
    const service = new AnalyticsService(makePrismaMock(rows));

    const result = await service.getFlowMetrics({});

    expect(result.overall.totalIntakes).toBe(2);
    expect(result.overall.avgWaitToRouteMinutes).toBe(15);
    expect(result.overall.medianWaitToRouteMinutes).toBe(15);
    expect(result.overall.avgWaitToCompleteMinutes).toBe(60);
  });

  it('excludes not-yet-routed intakes from wait-to-route stats', async () => {
    const rows: FlowFixtureRow[] = [
      {
        hospitalId: 'muhimbili',
        status: 'PENDING',
        createdAt: new Date('2026-06-01T10:00:00.000Z'),
        routedAt: null,
        updatedAt: new Date('2026-06-01T10:00:00.000Z'),
      },
    ];
    const service = new AnalyticsService(makePrismaMock(rows));

    const result = await service.getFlowMetrics({});

    expect(result.overall.avgWaitToRouteMinutes).toBeNull();
    expect(result.overall.medianWaitToRouteMinutes).toBeNull();
  });

  it('groups by hospital and flags currently-pending intakes over the threshold', async () => {
    const rows: FlowFixtureRow[] = [
      {
        hospitalId: 'muhimbili',
        status: 'ROUTED',
        createdAt: new Date('2026-06-01T10:00:00.000Z'),
        routedAt: new Date('2026-06-01T10:05:00.000Z'),
        updatedAt: new Date('2026-06-01T10:05:00.000Z'),
      },
      {
        hospitalId: 'jkci',
        status: 'ROUTED',
        createdAt: new Date('2026-06-01T10:00:00.000Z'),
        routedAt: new Date('2026-06-01T10:05:00.000Z'),
        updatedAt: new Date('2026-06-01T10:05:00.000Z'),
      },
    ];
    const pending: PendingFixtureRow[] = [
      // Waiting 45 min as of NOW — over the 30-minute threshold.
      { hospitalId: 'muhimbili', ward: 'OPD', createdAt: new Date('2026-06-15T11:15:00.000Z') },
      // Waiting 5 min — under threshold.
      { hospitalId: 'jkci', ward: 'OPD', createdAt: new Date('2026-06-15T11:55:00.000Z') },
    ];
    const service = new AnalyticsService(makePrismaMock(rows, pending));

    const result = await service.getFlowMetrics({});

    const muhimbili = result.byHospital.find((h) => h.hospitalId === 'muhimbili');
    const jkci = result.byHospital.find((h) => h.hospitalId === 'jkci');
    expect(muhimbili?.pendingOverThreshold).toBe(1);
    expect(jkci?.pendingOverThreshold).toBe(0);
  });

  it('surfaces a bottleneck alert only for wards whose oldest pending patient exceeds the threshold', async () => {
    const pending: PendingFixtureRow[] = [
      { hospitalId: 'muhimbili', ward: 'OPD', createdAt: new Date('2026-06-15T11:15:00.000Z') }, // 45 min
      { hospitalId: 'muhimbili', ward: 'OPD', createdAt: new Date('2026-06-15T11:50:00.000Z') }, // 10 min
      { hospitalId: 'jkci', ward: 'Cardiac', createdAt: new Date('2026-06-15T11:50:00.000Z') }, // 10 min
    ];
    const service = new AnalyticsService(makePrismaMock([], pending));

    const result = await service.getFlowMetrics({});

    expect(result.bottlenecks).toEqual([
      { hospitalId: 'muhimbili', ward: 'OPD', pendingCount: 2, oldestPendingMinutes: 45 },
    ]);
  });

  it('rejects a range where `from` is after `to`', async () => {
    const service = new AnalyticsService(makePrismaMock([]));
    await expect(service.getFlowMetrics({ from: '2026-06-10', to: '2026-06-01' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects a range longer than 180 days', async () => {
    const service = new AnalyticsService(makePrismaMock([]));
    await expect(service.getFlowMetrics({ from: '2026-01-01', to: '2026-12-31' })).rejects.toThrow(
      BadRequestException,
    );
  });
});

describe('AnalyticsService.getSymptomTrends', () => {
  it('aggregates by date, hospital, and body region — never returning a per-patient row', async () => {
    const rows: SymptomFixtureRow[] = Array.from({ length: 6 }, (_, i) => ({
      hospitalId: 'muhimbili',
      bodyRegion: 'HEAD',
      createdAt: new Date('2026-06-01T10:00:00.000Z'),
      urgent: i < 2,
      triageTag: i < 2 ? 'RED' : 'GREEN',
    }));
    const service = new AnalyticsService(makePrismaMock(rows));

    const result = await service.getSymptomTrends({});

    expect(result.points).toEqual([
      { date: '2026-06-01', hospitalId: 'muhimbili', bodyRegion: 'HEAD', count: 6, redFlagCount: 2 },
    ]);
  });

  it('suppresses any cell below the minimum cell size so small groups are never exposed', async () => {
    const rows: SymptomFixtureRow[] = Array.from({ length: 4 }, () => ({
      hospitalId: 'muhimbili',
      bodyRegion: 'HEAD',
      createdAt: new Date('2026-06-01T10:00:00.000Z'),
      urgent: false,
      triageTag: 'GREEN',
    }));
    const service = new AnalyticsService(makePrismaMock(rows));

    const result = await service.getSymptomTrends({});

    expect(result.points).toEqual([]);
    expect(result.minCellSize).toBe(5);
  });

  it('keeps separate hospitals and body regions as separate cells', async () => {
    const rows: SymptomFixtureRow[] = [
      ...Array.from({ length: 5 }, () => ({
        hospitalId: 'muhimbili',
        bodyRegion: 'HEAD',
        createdAt: new Date('2026-06-01T10:00:00.000Z'),
        urgent: false,
        triageTag: 'GREEN',
      })),
      ...Array.from({ length: 5 }, () => ({
        hospitalId: 'jkci',
        bodyRegion: 'CHEST',
        createdAt: new Date('2026-06-01T10:00:00.000Z'),
        urgent: false,
        triageTag: 'GREEN',
      })),
    ];
    const service = new AnalyticsService(makePrismaMock(rows));

    const result = await service.getSymptomTrends({});

    expect(result.points).toHaveLength(2);
    expect(result.points.map((p) => p.hospitalId).sort()).toEqual(['jkci', 'muhimbili']);
  });
});
