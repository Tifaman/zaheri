import { BadRequestException, Injectable } from '@nestjs/common';
import {
  BottleneckAlert,
  FlowHospitalMetric,
  FlowMetricsDto,
  FlowWaitStats,
  HospitalId,
  BodyRegionCode,
  SymptomTrendPoint,
  SymptomTrendsDto,
} from '@zaheri/types';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsRangeDto } from './dto/analytics-range.dto';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RANGE_DAYS = 30;
const MAX_RANGE_DAYS = 180;

/**
 * A ward's oldest PENDING (not-yet-routed) patient waiting past this many
 * minutes surfaces as a bottleneck alert. Operational default, not a
 * clinical judgement — tune freely; TODO(ops): confirm with hospital
 * operations what threshold actually signals a problem per hospital/ward.
 */
const PENDING_BOTTLENECK_THRESHOLD_MINUTES = 30;

/**
 * Disclosure control: a (date, hospital, bodyRegion) cell with fewer than
 * this many intakes is suppressed entirely rather than returned, so a
 * single unusual case in a quiet ward/day can never be singled out from
 * the aggregate. Standard small-cell suppression threshold; see
 * CLAUDE.md's "Analytics use anonymised, aggregated data only".
 */
const MIN_CELL_SIZE = 5;

interface FlowRow {
  hospitalId: string;
  status: string;
  createdAt: Date;
  routedAt: Date | null;
  updatedAt: Date;
}

interface PendingRow {
  hospitalId: string;
  ward: string;
  createdAt: Date;
}

interface SymptomRow {
  hospitalId: string;
  bodyRegion: string;
  createdAt: Date;
  urgent: boolean;
  triageTag: string;
}

function minutesBetween(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / 60_000;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
}

function round1(value: number | null): number | null {
  return value === null ? null : Math.round(value * 10) / 10;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getFlowMetrics(rangeDto: AnalyticsRangeDto): Promise<FlowMetricsDto> {
    const { from, to } = this.resolveRange(rangeDto);

    const intakes: FlowRow[] = await this.prisma.intake.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { hospitalId: true, status: true, createdAt: true, routedAt: true, updatedAt: true },
    });

    const pendingNow: PendingRow[] = await this.prisma.intake.findMany({
      where: { status: 'PENDING' },
      select: { hospitalId: true, ward: true, createdAt: true },
    });
    const now = new Date();

    const byHospitalRows = new Map<string, FlowRow[]>();
    for (const row of intakes) {
      const list = byHospitalRows.get(row.hospitalId) ?? [];
      list.push(row);
      byHospitalRows.set(row.hospitalId, list);
    }

    const byHospital: FlowHospitalMetric[] = [...byHospitalRows.entries()]
      .map(([hospitalId, rows]) => ({
        hospitalId: hospitalId as HospitalId,
        ...this.computeWaitStats(rows),
        pendingOverThreshold: pendingNow.filter(
          (p) =>
            p.hospitalId === hospitalId &&
            minutesBetween(p.createdAt, now) >= PENDING_BOTTLENECK_THRESHOLD_MINUTES,
        ).length,
      }))
      .sort((a, b) => a.hospitalId.localeCompare(b.hospitalId));

    return {
      rangeFrom: from.toISOString(),
      rangeTo: to.toISOString(),
      pendingThresholdMinutes: PENDING_BOTTLENECK_THRESHOLD_MINUTES,
      overall: this.computeWaitStats(intakes),
      byHospital,
      bottlenecks: this.computeBottlenecks(pendingNow, now),
    };
  }

  async getSymptomTrends(rangeDto: AnalyticsRangeDto): Promise<SymptomTrendsDto> {
    const { from, to } = this.resolveRange(rangeDto);

    const intakes: SymptomRow[] = await this.prisma.intake.findMany({
      where: { createdAt: { gte: from, lte: to } },
      // Coded fields only — never `complaint` (free text) or
      // `registrationNumber`. Nothing here can identify a patient on its own.
      select: { hospitalId: true, bodyRegion: true, createdAt: true, urgent: true, triageTag: true },
    });

    interface Cell {
      date: string;
      hospitalId: string;
      bodyRegion: string;
      count: number;
      redFlagCount: number;
    }
    const cells = new Map<string, Cell>();
    for (const intake of intakes) {
      const date = intake.createdAt.toISOString().slice(0, 10);
      const key = `${date}::${intake.hospitalId}::${intake.bodyRegion}`;
      const isRedFlag = intake.urgent || intake.triageTag === 'RED';
      const existing = cells.get(key);
      if (existing) {
        existing.count += 1;
        if (isRedFlag) existing.redFlagCount += 1;
      } else {
        cells.set(key, {
          date,
          hospitalId: intake.hospitalId,
          bodyRegion: intake.bodyRegion,
          count: 1,
          redFlagCount: isRedFlag ? 1 : 0,
        });
      }
    }

    const points: SymptomTrendPoint[] = [...cells.values()]
      .filter((cell) => cell.count >= MIN_CELL_SIZE)
      .map((cell) => ({
        date: cell.date,
        hospitalId: cell.hospitalId as HospitalId,
        bodyRegion: cell.bodyRegion as BodyRegionCode,
        count: cell.count,
        redFlagCount: cell.redFlagCount,
      }))
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          a.hospitalId.localeCompare(b.hospitalId) ||
          a.bodyRegion.localeCompare(b.bodyRegion),
      );

    return {
      rangeFrom: from.toISOString(),
      rangeTo: to.toISOString(),
      minCellSize: MIN_CELL_SIZE,
      points,
    };
  }

  private computeWaitStats(rows: FlowRow[]): FlowWaitStats {
    const waitToRoute = rows.filter((r) => r.routedAt).map((r) => minutesBetween(r.createdAt, r.routedAt!));
    const waitToComplete = rows
      .filter((r) => r.status === 'COMPLETED')
      .map((r) => minutesBetween(r.createdAt, r.updatedAt));

    return {
      totalIntakes: rows.length,
      avgWaitToRouteMinutes: round1(average(waitToRoute)),
      medianWaitToRouteMinutes: round1(median(waitToRoute)),
      avgWaitToCompleteMinutes: round1(average(waitToComplete)),
    };
  }

  private computeBottlenecks(pendingNow: PendingRow[], now: Date): BottleneckAlert[] {
    interface Group {
      hospitalId: string;
      ward: string;
      count: number;
      oldestMinutes: number;
    }
    const groups = new Map<string, Group>();
    for (const p of pendingNow) {
      const key = `${p.hospitalId}::${p.ward}`;
      const ageMinutes = minutesBetween(p.createdAt, now);
      const existing = groups.get(key);
      if (existing) {
        existing.count += 1;
        existing.oldestMinutes = Math.max(existing.oldestMinutes, ageMinutes);
      } else {
        groups.set(key, { hospitalId: p.hospitalId, ward: p.ward, count: 1, oldestMinutes: ageMinutes });
      }
    }

    return [...groups.values()]
      .filter((g) => g.oldestMinutes >= PENDING_BOTTLENECK_THRESHOLD_MINUTES)
      .map((g) => ({
        hospitalId: g.hospitalId as HospitalId,
        ward: g.ward,
        pendingCount: g.count,
        oldestPendingMinutes: Math.round(g.oldestMinutes),
      }))
      .sort((a, b) => b.oldestPendingMinutes - a.oldestPendingMinutes);
  }

  private resolveRange(rangeDto: AnalyticsRangeDto): { from: Date; to: Date } {
    const to = rangeDto.to ? new Date(rangeDto.to) : new Date();
    const from = rangeDto.from ? new Date(rangeDto.from) : new Date(to.getTime() - DEFAULT_RANGE_DAYS * DAY_MS);

    if (from.getTime() > to.getTime()) {
      throw new BadRequestException('`from` must not be after `to`');
    }
    if (to.getTime() - from.getTime() > MAX_RANGE_DAYS * DAY_MS) {
      throw new BadRequestException(`Range must not exceed ${MAX_RANGE_DAYS} days`);
    }

    return { from, to };
  }
}
