import {
  AnalyticsRangeRequest,
  CaseDto,
  CreateIntakeRequest,
  Disposition,
  FlowMetricsDto,
  IntakeDto,
  LabOrderDto,
  LoginRequest,
  LoginResponse,
  PatientCaseDto,
  PharmacyReceiptDto,
  SymptomTrendsDto,
} from '@zaheri/types';

const API_BASE = '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.message ?? 'Imeshindwa kuwasiliana na seva', res.status);
  }

  return res.json();
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export function submitIntake(payload: CreateIntakeRequest): Promise<IntakeDto> {
  return request('/intake', { method: 'POST', body: JSON.stringify(payload) });
}

export function fetchPatientCase(id: string): Promise<PatientCaseDto> {
  return request(`/intake/${id}`);
}

export function login(payload: LoginRequest): Promise<LoginResponse> {
  return request('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
}

export function fetchCases(token: string): Promise<CaseDto[]> {
  return request('/cases', { headers: authHeaders(token) });
}

export function fetchCase(token: string, id: string): Promise<CaseDto> {
  return request(`/cases/${id}`, { headers: authHeaders(token) });
}

export function routeCase(token: string, id: string, disposition: Disposition): Promise<CaseDto> {
  return request(`/cases/${id}/route`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ disposition }),
  });
}

export function orderLab(token: string, caseId: string, testName: string): Promise<LabOrderDto> {
  return request(`/cases/${caseId}/labs`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ testName }),
  });
}

export function reportLab(
  token: string,
  caseId: string,
  labOrderId: string,
  resultSummary: string,
): Promise<LabOrderDto> {
  return request(`/cases/${caseId}/labs/${labOrderId}/report`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ resultSummary }),
  });
}

export function issueReceipt(
  token: string,
  caseId: string,
  medicationNames: string[],
): Promise<PharmacyReceiptDto> {
  return request(`/cases/${caseId}/receipts`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ medicationNames }),
  });
}

function rangeQueryString(range: AnalyticsRangeRequest): string {
  const params = new URLSearchParams();
  if (range.from) params.set('from', range.from);
  if (range.to) params.set('to', range.to);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function fetchFlowMetrics(
  token: string,
  range: AnalyticsRangeRequest,
): Promise<FlowMetricsDto> {
  return request(`/analytics/flow${rangeQueryString(range)}`, { headers: authHeaders(token) });
}

export function fetchSymptomTrends(
  token: string,
  range: AnalyticsRangeRequest,
): Promise<SymptomTrendsDto> {
  return request(`/analytics/symptom-trends${rangeQueryString(range)}`, {
    headers: authHeaders(token),
  });
}
