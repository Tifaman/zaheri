import { toPatientCaseDto } from './patient-case.mapper';
import { CaseWithRelations } from '../cases/case.mapper';

describe('toPatientCaseDto', () => {
  it("includes the patient's own labs and receipts, but never urgent/triageTag/routedById", async () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const row: CaseWithRelations = {
      id: 'intake-1',
      patientId: 'patient-1',
      hospitalId: 'muhimbili',
      registrationNumber: 'MNH-0001',
      ward: 'OPD',
      complaint: 'Maumivu ya kichwa',
      bodyRegion: 'HEAD',
      urgent: true,
      status: 'ROUTED',
      disposition: 'SEE_DOCTOR',
      room: 'OPD',
      queueNumber: 'Q-1',
      queueSequence: 1,
      triageTag: 'RED',
      routedById: 'clinician-1',
      routedAt: now,
      createdAt: now,
      updatedAt: now,
      labOrders: [
        {
          id: 'lab-1',
          intakeId: 'intake-1',
          testName: 'Full Blood Count',
          orderedById: 'clinician-1',
          status: 'RESULTED',
          createdAt: now,
          updatedAt: now,
          report: {
            id: 'report-1',
            labOrderId: 'lab-1',
            resultSummary: 'Normal',
            reportedAt: now,
            createdAt: now,
          },
        },
      ],
      receipts: [
        {
          id: 'receipt-1',
          intakeId: 'intake-1',
          medicationNames: ['Paracetamol 500mg'],
          issuedById: 'clinician-1',
          signature: 'abc123',
          status: 'ISSUED',
          issuedAt: now,
          redeemedAt: null,
          createdAt: now,
          updatedAt: now,
        },
      ],
    };

    const dto = await toPatientCaseDto(row);

    expect(dto.labs).toEqual([
      {
        id: 'lab-1',
        testName: 'Full Blood Count',
        status: 'RESULTED',
        resultSummary: 'Normal',
        reportedAt: now.toISOString(),
        createdAt: now.toISOString(),
      },
    ]);
    expect(dto.receipts).toHaveLength(1);
    expect(dto.receipts[0]).toMatchObject({ id: 'receipt-1', medicationNames: ['Paracetamol 500mg'] });

    expect(dto).not.toHaveProperty('urgent');
    expect(dto).not.toHaveProperty('triageTag');
    expect(dto).not.toHaveProperty('routedById');
  });
});
