import { useState } from 'react';
import { AnalyticsRangeRequest, BodyRegionCode } from '@zaheri/types';
import { useFlowMetrics, useSymptomTrends } from './useAnalytics';
import { BODY_REGION_LABELS } from './bodyRegionLabels';
import { HOSPITALS, getHospitalName } from '../hospitals/catalog';

function formatMinutes(value: number | null): string {
  return value === null ? '—' : `${value} dk`;
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

/**
 * Admin-only surveillance dashboard: flow metrics (wait times, bottlenecks)
 * and anonymised, aggregated symptom trends. Every number here comes
 * pre-aggregated from AnalyticsService — this component never sees a raw
 * per-patient row, a registration number, or free-text complaint.
 */
export function AnalyticsDashboardPage() {
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('ALL');

  const range: AnalyticsRangeRequest = {
    ...(fromInput ? { from: new Date(fromInput).toISOString() } : {}),
    ...(toInput ? { to: new Date(toInput).toISOString() } : {}),
  };

  const flow = useFlowMetrics(range);
  const trends = useSymptomTrends(range);

  const byHospital =
    flow.data?.byHospital.filter((h) => hospitalFilter === 'ALL' || h.hospitalId === hospitalFilter) ??
    [];
  const bottlenecks =
    flow.data?.bottlenecks.filter((b) => hospitalFilter === 'ALL' || b.hospitalId === hospitalFilter) ??
    [];
  const points =
    trends.data?.points.filter((p) => hospitalFilter === 'ALL' || p.hospitalId === hospitalFilter) ?? [];

  const regionTotals = new Map<BodyRegionCode, number>();
  for (const p of points) {
    regionTotals.set(p.bodyRegion, (regionTotals.get(p.bodyRegion) ?? 0) + p.count);
  }
  const regionSummary = [...regionTotals.entries()].sort((a, b) => b[1] - a[1]);
  const maxRegionTotal = Math.max(1, ...regionSummary.map(([, count]) => count));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Uchambuzi wa Mfumo</h2>
        <p className="text-sm text-slate-600">
          Takwimu za mtiririko wa wagonjwa na mienendo ya dalili — zote zimefupishwa (aggregated) na
          hazina utambulisho wa mgonjwa yeyote.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border-2 border-slate-200 bg-white p-4">
        <label className="flex flex-col text-sm font-semibold text-slate-700">
          Kuanzia
          <input
            type="date"
            value={fromInput}
            onChange={(e) => setFromInput(e.target.value)}
            className="mt-1 rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm font-semibold text-slate-700">
          Hadi
          <input
            type="date"
            value={toInput}
            onChange={(e) => setToInput(e.target.value)}
            className="mt-1 rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm font-semibold text-slate-700">
          Hospitali
          <select
            value={hospitalFilter}
            onChange={(e) => setHospitalFilter(e.target.value)}
            className="mt-1 rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="ALL">Hospitali Zote</option>
            {HOSPITALS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="space-y-4">
        <h3 className="font-semibold text-slate-900">Mtiririko wa Wagonjwa</h3>
        {flow.isLoading ? <p>Inapakia...</p> : null}
        {flow.isError ? <p role="alert">Imeshindwa kupakia takwimu za mtiririko.</p> : null}
        {flow.data ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SummaryCard label="Jumla ya Wagonjwa" value={String(flow.data.overall.totalIntakes)} />
              <SummaryCard
                label="Wastani hadi Daktari"
                value={formatMinutes(flow.data.overall.avgWaitToRouteMinutes)}
              />
              <SummaryCard
                label="Muda wa Kati hadi Daktari"
                value={formatMinutes(flow.data.overall.medianWaitToRouteMinutes)}
              />
              <SummaryCard
                label="Wastani hadi Kukamilika"
                value={formatMinutes(flow.data.overall.avgWaitToCompleteMinutes)}
              />
            </div>

            <div>
              <h4 className="font-semibold text-slate-800">Vikwazo (Bottlenecks)</h4>
              {bottlenecks.length === 0 ? (
                <p className="text-sm text-slate-600">Hakuna kikwazo kwa sasa.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {bottlenecks.map((b) => (
                    <li
                      key={`${b.hospitalId}-${b.ward}`}
                      className="rounded-lg border-2 border-red-300 bg-red-50 p-3 text-sm text-red-900"
                    >
                      <strong>{getHospitalName(b.hospitalId)}</strong> — Wodi {b.ward}: wagonjwa{' '}
                      {b.pendingCount} wanasubiri, mmoja tangu dakika {b.oldestPendingMinutes} zilizopita.
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border-2 border-slate-200 bg-white">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3">Hospitali</th>
                    <th className="p-3">Jumla</th>
                    <th className="p-3">Wastani hadi Daktari</th>
                    <th className="p-3">Muda wa Kati</th>
                    <th className="p-3">Wastani hadi Kukamilika</th>
                    <th className="p-3">Wanasubiri kwa Muda Mrefu</th>
                  </tr>
                </thead>
                <tbody>
                  {byHospital.map((h) => (
                    <tr key={h.hospitalId} className="border-t">
                      <td className="p-3 font-semibold">{getHospitalName(h.hospitalId)}</td>
                      <td className="p-3">{h.totalIntakes}</td>
                      <td className="p-3">{formatMinutes(h.avgWaitToRouteMinutes)}</td>
                      <td className="p-3">{formatMinutes(h.medianWaitToRouteMinutes)}</td>
                      <td className="p-3">{formatMinutes(h.avgWaitToCompleteMinutes)}</td>
                      <td className="p-3">{h.pendingOverThreshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="font-semibold text-slate-900">Mienendo ya Dalili (Ufuatiliaji wa Mapema)</h3>
          <p className="text-sm text-slate-600">
            Data imefupishwa kwa siku, hospitali na sehemu ya mwili. Makundi madogo (chini ya{' '}
            {trends.data?.minCellSize ?? 5}) hayaonyeshwi ili kulinda utambulisho wa mgonjwa.
          </p>
        </div>
        {trends.isLoading ? <p>Inapakia...</p> : null}
        {trends.isError ? <p role="alert">Imeshindwa kupakia mienendo ya dalili.</p> : null}
        {trends.data ? (
          <>
            <div className="space-y-2 rounded-xl border-2 border-slate-200 bg-white p-4">
              {regionSummary.length === 0 ? (
                <p className="text-sm text-slate-600">Hakuna data ya kutosha kwa muda huu.</p>
              ) : (
                regionSummary.map(([region, count]) => (
                  <div key={region} className="flex items-center gap-3">
                    <span className="w-40 shrink-0 text-sm text-slate-700">
                      {BODY_REGION_LABELS[region]}
                    </span>
                    <div className="h-4 flex-1 rounded bg-slate-100">
                      <div
                        className="h-4 rounded bg-brand"
                        style={{ width: `${(count / maxRegionTotal) * 100}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-sm font-semibold">{count}</span>
                  </div>
                ))
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border-2 border-slate-200 bg-white">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3">Tarehe</th>
                    <th className="p-3">Hospitali</th>
                    <th className="p-3">Sehemu ya Mwili</th>
                    <th className="p-3">Idadi</th>
                    <th className="p-3">Alama Nyekundu</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((p) => (
                    <tr key={`${p.date}-${p.hospitalId}-${p.bodyRegion}`} className="border-t">
                      <td className="p-3">{p.date}</td>
                      <td className="p-3">{getHospitalName(p.hospitalId)}</td>
                      <td className="p-3">{BODY_REGION_LABELS[p.bodyRegion]}</td>
                      <td className="p-3">{p.count}</td>
                      <td className="p-3">{p.redFlagCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
