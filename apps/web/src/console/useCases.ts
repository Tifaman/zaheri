import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Disposition } from '@zaheri/types';
import { fetchCase, fetchCases, issueReceipt, orderLab, reportLab, routeCase } from '../lib/api';
import { useAuth } from '../auth/AuthContext';

export function useCases() {
  const { session } = useAuth();
  return useQuery({
    queryKey: ['cases'],
    queryFn: () => fetchCases(session!.accessToken),
    enabled: !!session,
  });
}

export function useCase(id: string) {
  const { session } = useAuth();
  return useQuery({
    queryKey: ['cases', id],
    queryFn: () => fetchCase(session!.accessToken, id),
    enabled: !!session,
  });
}

export function useRouteCase(id: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (disposition: Disposition) => routeCase(session!.accessToken, id, disposition),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}

export function useOrderLab(caseId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (testName: string) => orderLab(session!.accessToken, caseId, testName),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cases', caseId] });
    },
  });
}

export function useReportLab(caseId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ labOrderId, resultSummary }: { labOrderId: string; resultSummary: string }) =>
      reportLab(session!.accessToken, caseId, labOrderId, resultSummary),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cases', caseId] });
    },
  });
}

export function useIssueReceipt(caseId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (medicationNames: string[]) =>
      issueReceipt(session!.accessToken, caseId, medicationNames),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cases', caseId] });
    },
  });
}
