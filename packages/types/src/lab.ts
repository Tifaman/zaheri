/** FHIR-ish: an order is a ServiceRequest, its result a DiagnosticReport. */
export const LAB_ORDER_STATUSES = ['ORDERED', 'RESULTED'] as const;
export type LabOrderStatus = (typeof LAB_ORDER_STATUSES)[number];

export interface CreateLabOrderRequest {
  testName: string;
}

export interface CreateLabReportRequest {
  resultSummary: string;
}

export interface LabOrderDto {
  id: string;
  testName: string;
  status: LabOrderStatus;
  resultSummary: string | null;
  reportedAt: string | null;
  createdAt: string;
}
