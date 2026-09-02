import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CaseDto, TriageTag } from '@zaheri/types';
import { TriageBadge } from '../components/TriageBadge';
import { useCases } from './useCases';
import { getHospitalName } from '../hospitals/catalog';

// Defence-in-depth client-side sort: the backend is the source of truth and
// already orders cases RED-first, but re-asserting the same priority here
// keeps the list correctly ordered even if a response is cached or
// reordered upstream.
const TRIAGE_PRIORITY: Record<TriageTag, number> = { RED: 0, GREEN: 1 };

function sortByTriage(cases: CaseDto[]): CaseDto[] {
  return [...cases].sort((a, b) => TRIAGE_PRIORITY[a.triageTag] - TRIAGE_PRIORITY[b.triageTag]);
}

// A case is "new" until a disposition has been set — either by a clinician
// routing it from the console, or the red-flag engine auto-routing it to
// URGENT_NOW on submit. Once disposition is set it's "reviewed", whether
// still ROUTED or already COMPLETED.
function isNew(c: CaseDto): boolean {
  return c.disposition === null;
}

type Tab = 'new' | 'reviewed';

export function CaseListPage() {
  const { data, isLoading, isError } = useCases();
  const [tab, setTab] = useState<Tab>('new');

  const { newCases, reviewedCases } = useMemo(() => {
    const sorted = sortByTriage(data ?? []);
    return {
      newCases: sorted.filter(isNew),
      reviewedCases: sorted.filter((c) => !isNew(c)),
    };
  }, [data]);

  if (isLoading) return <p>Inapakia...</p>;
  if (isError) return <p role="alert">Imeshindwa kupakia orodha ya wagonjwa.</p>;

  const visibleCases = tab === 'new' ? newCases : reviewedCases;

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-slate-900">Wagonjwa</h2>

      <div role="tablist" className="flex gap-2 border-b border-slate-200">
        <TabButton label="Mpya" count={newCases.length} active={tab === 'new'} onClick={() => setTab('new')} />
        <TabButton
          label="Zilizopitiwa"
          count={reviewedCases.length}
          active={tab === 'reviewed'}
          onClick={() => setTab('reviewed')}
        />
      </div>

      {visibleCases.length === 0 ? (
        <p className="text-slate-600">
          {tab === 'new' ? 'Hakuna wagonjwa wapya kwa sasa.' : 'Hakuna wagonjwa waliopitiwa bado.'}
        </p>
      ) : null}
      <ul className="space-y-2">
        {visibleCases.map((c) => (
          <li key={c.id}>
            <Link
              to={`/console/cases/${c.id}`}
              className="flex items-center justify-between gap-4 rounded-xl border-2 border-slate-200 bg-white p-4 hover:border-brand"
            >
              <div>
                <p className="font-semibold text-slate-900">{c.registrationNumber}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark">
                  {getHospitalName(c.hospitalId)}
                </p>
                <p className="text-sm text-slate-600">
                  {c.ward} — {c.complaint}
                </p>
              </div>
              <TriageBadge tag={c.triageTag} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TabButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2 font-semibold ${
        active ? 'border-brand text-brand-dark' : 'border-transparent text-slate-500'
      }`}
    >
      {label} ({count})
    </button>
  );
}
