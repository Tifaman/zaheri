import { useQuery } from '@tanstack/react-query';
import { AnalyticsRangeRequest } from '@zaheri/types';
import { fetchFlowMetrics, fetchSymptomTrends } from '../lib/api';
import { useAuth } from '../auth/AuthContext';

export function useFlowMetrics(range: AnalyticsRangeRequest) {
  const { session } = useAuth();
  return useQuery({
    queryKey: ['analytics', 'flow', range],
    queryFn: () => fetchFlowMetrics(session!.accessToken, range),
    enabled: !!session,
  });
}

export function useSymptomTrends(range: AnalyticsRangeRequest) {
  const { session } = useAuth();
  return useQuery({
    queryKey: ['analytics', 'symptom-trends', range],
    queryFn: () => fetchSymptomTrends(session!.accessToken, range),
    enabled: !!session,
  });
}
