import { LabOrderDto, LabOrderStatus } from '@zaheri/types';
import { LabOrder, LabReport } from '../../generated/prisma';

export function toLabOrderDto(order: LabOrder & { report: LabReport | null }): LabOrderDto {
  return {
    id: order.id,
    testName: order.testName,
    status: order.status as LabOrderStatus,
    resultSummary: order.report?.resultSummary ?? null,
    reportedAt: order.report ? order.report.reportedAt.toISOString() : null,
    createdAt: order.createdAt.toISOString(),
  };
}
