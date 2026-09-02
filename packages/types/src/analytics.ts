import type { HospitalId } from './hospital.js';
import type { BodyRegionCode } from './body-regions.js';

/**
 * Admin-only operational metrics — never per-patient rows, only counts and
 * durations grouped by hospital/ward. See AnalyticsService for how these are
 * computed from Intake rows.
 */
export interface FlowWaitStats {
  totalIntakes: number;
  avgWaitToRouteMinutes: number | null;
  medianWaitToRouteMinutes: number | null;
  avgWaitToCompleteMinutes: number | null;
}

export interface FlowHospitalMetric extends FlowWaitStats {
  hospitalId: HospitalId;
  /** Currently-PENDING intakes older than `pendingThresholdMinutes`. */
  pendingOverThreshold: number;
}

/** A ward whose oldest currently-PENDING patient has waited past the threshold. */
export interface BottleneckAlert {
  hospitalId: HospitalId;
  ward: string;
  pendingCount: number;
  oldestPendingMinutes: number;
}

export interface FlowMetricsDto {
  rangeFrom: string;
  rangeTo: string;
  pendingThresholdMinutes: number;
  overall: FlowWaitStats;
  byHospital: FlowHospitalMetric[];
  bottlenecks: BottleneckAlert[];
}

/**
 * One anonymised, aggregated cell: a count of intakes sharing a day +
 * hospital + body-region (never raw complaint text, never a patient
 * identifier). Cells below `minCellSize` are suppressed entirely before
 * this ever leaves the server — see AnalyticsService.
 */
export interface SymptomTrendPoint {
  date: string;
  hospitalId: HospitalId;
  bodyRegion: BodyRegionCode;
  count: number;
  redFlagCount: number;
}

export interface SymptomTrendsDto {
  rangeFrom: string;
  rangeTo: string;
  minCellSize: number;
  points: SymptomTrendPoint[];
}

export interface AnalyticsRangeRequest {
  from?: string;
  to?: string;
}
