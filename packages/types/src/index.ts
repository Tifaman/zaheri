// Explicit named re-exports (not `export *`): the compiled CJS output uses
// per-property Object.defineProperty getters this way, which Rollup's
// commonjs interop (used by apps/web's production build) can statically
// detect. A wildcard `export *` compiles to a dynamic __exportStar copy
// that Rollup cannot see into, and named imports silently fail to resolve.
export { BODY_REGION_CODES } from './body-regions.js';
export type { BodyRegionCode } from './body-regions.js';

export { HOSPITAL_IDS, DEFAULT_HOSPITAL_ID } from './hospital.js';
export type { HospitalId } from './hospital.js';

export { INTAKE_STATUSES } from './intake.js';
export type { IntakeStatus, CreateIntakeRequest, IntakeDto } from './intake.js';

export { USER_ROLES, CONSOLE_ROLES } from './auth.js';
export type { UserRole, LoginRequest, LoginResponse } from './auth.js';

export { DISPOSITIONS, TRIAGE_TAGS } from './case.js';
export type { Disposition, TriageTag, RouteCaseRequest, CaseDto } from './case.js';

export type { PatientQueueStatus } from './queue.js';

export { LAB_ORDER_STATUSES } from './lab.js';
export type { LabOrderStatus, CreateLabOrderRequest, CreateLabReportRequest, LabOrderDto } from './lab.js';

export { RECEIPT_STATUSES } from './receipt.js';
export type {
  ReceiptStatus,
  CreateReceiptRequest,
  VerifyReceiptRequest,
  VerifyReceiptResponse,
  PharmacyReceiptDto,
} from './receipt.js';

export type { PatientCaseDto } from './patient-case.js';

export type {
  FlowWaitStats,
  FlowHospitalMetric,
  BottleneckAlert,
  FlowMetricsDto,
  SymptomTrendPoint,
  SymptomTrendsDto,
  AnalyticsRangeRequest,
} from './analytics.js';
