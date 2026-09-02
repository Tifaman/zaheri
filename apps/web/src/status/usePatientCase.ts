import { useQuery } from '@tanstack/react-query';
import { fetchPatientCase } from '../lib/api';

/**
 * Polls the patient's own case (labs, receipt, queue/room) — the intake id
 * itself is the capability (see apps/api's IntakeController), same trust
 * model as the Socket.IO queue subscription. Polling (not push) is enough
 * for something that changes over minutes/hours (lab results, a receipt
 * issued after a visit), not seconds.
 */
export function usePatientCase(intakeId: string | null) {
  return useQuery({
    queryKey: ['patient-case', intakeId],
    queryFn: () => fetchPatientCase(intakeId!),
    enabled: !!intakeId,
    refetchInterval: 10_000,
  });
}
