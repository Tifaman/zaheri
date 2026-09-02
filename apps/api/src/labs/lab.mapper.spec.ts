import { toLabOrderDto } from './lab.mapper';
import { LabOrder, LabReport } from '../../generated/prisma';

describe('toLabOrderDto', () => {
  it('maps an ordered lab with no report yet', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const order: LabOrder & { report: LabReport | null } = {
      id: 'lab-1',
      intakeId: 'intake-1',
      testName: 'Full Blood Count',
      orderedById: 'clinician-1',
      status: 'ORDERED',
      createdAt: now,
      updatedAt: now,
      report: null,
    };

    expect(toLabOrderDto(order)).toEqual({
      id: 'lab-1',
      testName: 'Full Blood Count',
      status: 'ORDERED',
      resultSummary: null,
      reportedAt: null,
      createdAt: now.toISOString(),
    });
  });

  it('maps a resulted lab, pulling the summary and reportedAt from its report', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const reportedAt = new Date('2026-01-02T00:00:00.000Z');
    const order: LabOrder & { report: LabReport | null } = {
      id: 'lab-1',
      intakeId: 'intake-1',
      testName: 'Full Blood Count',
      orderedById: 'clinician-1',
      status: 'RESULTED',
      createdAt: now,
      updatedAt: reportedAt,
      report: {
        id: 'report-1',
        labOrderId: 'lab-1',
        resultSummary: 'Within normal limits',
        reportedAt,
        createdAt: reportedAt,
      },
    };

    expect(toLabOrderDto(order)).toEqual({
      id: 'lab-1',
      testName: 'Full Blood Count',
      status: 'RESULTED',
      resultSummary: 'Within normal limits',
      reportedAt: reportedAt.toISOString(),
      createdAt: now.toISOString(),
    });
  });
});
