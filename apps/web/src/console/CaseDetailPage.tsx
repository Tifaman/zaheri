import { Link, useParams } from 'react-router-dom';
import { Disposition } from '@zaheri/types';
import { TriageBadge } from '../components/TriageBadge';
import { ApiError } from '../lib/api';
import { useCase, useRouteCase } from './useCases';
import { LabsSection } from './LabsSection';
import { ReceiptsSection } from './ReceiptsSection';
import { getHospitalName } from '../hospitals/catalog';

const DISPOSITION_LABELS: Record<Disposition, string> = {
  SEE_DOCTOR: 'Mwone Daktari (SEE_DOCTOR)',
  URGENT_NOW: 'Dharura Sasa (URGENT_NOW)',
};

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: caseDto, isLoading, isError } = useCase(id!);
  const routeCase = useRouteCase(id!);

  if (isLoading) return <p>Inapakia...</p>;
  if (isError || !caseDto) {
    return (
      <div className="space-y-4">
        <p role="alert">Imeshindwa kupakia taarifa za mgonjwa.</p>
        <Link to="/console" className="inline-block text-sm font-semibold text-brand">
          ← Rudi kwenye orodha
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to="/console" className="inline-block text-sm font-semibold text-brand">
        ← Rudi kwenye orodha
      </Link>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">{caseDto.registrationNumber}</h2>
        <TriageBadge tag={caseDto.triageTag} />
      </div>

      <dl className="space-y-2 rounded-xl border-2 border-slate-200 bg-white p-4">
        <Row label="Hospitali" value={getHospitalName(caseDto.hospitalId)} />
        <Row label="Wodi" value={caseDto.ward} />
        <Row label="Shida" value={caseDto.complaint} />
        <Row label="Sehemu ya mwili" value={caseDto.bodyRegion} />
        <Row label="Hali" value={caseDto.status} />
        <Row
          label="Uamuzi wa sasa"
          value={caseDto.disposition ? DISPOSITION_LABELS[caseDto.disposition] : 'Bado hajapangwa'}
        />
        {caseDto.room ? <Row label="Chumba" value={caseDto.room} /> : null}
        {caseDto.queueNumber ? <Row label="Namba ya foleni" value={caseDto.queueNumber} /> : null}
      </dl>

      <div className="space-y-2">
        <h3 className="font-semibold text-slate-900">Panga uamuzi</h3>
        <p className="text-sm text-slate-600">
          Chaguo mbili tu zinapatikana — hakuna njia ya kutoa dawa bila mgonjwa kumwona
          daktari.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => routeCase.mutate('SEE_DOCTOR')}
            disabled={routeCase.isPending}
            className="flex-1 rounded-xl bg-brand px-4 py-3 font-bold text-white disabled:bg-slate-300"
          >
            Mwone Daktari
          </button>
          <button
            type="button"
            onClick={() => routeCase.mutate('URGENT_NOW')}
            disabled={routeCase.isPending}
            className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-bold text-white disabled:bg-slate-300"
          >
            Dharura Sasa
          </button>
        </div>
        {routeCase.isError ? (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {routeCase.error instanceof ApiError
              ? routeCase.error.message
              : 'Imeshindwa kupanga uamuzi.'}
          </p>
        ) : null}
      </div>

      <LabsSection caseId={caseDto.id} labs={caseDto.labs} />
      <ReceiptsSection caseId={caseDto.id} receipts={caseDto.receipts} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b pb-2 last:border-b-0 last:pb-0">
      <dt className="font-semibold text-slate-600">{label}</dt>
      <dd className="text-right text-slate-900">{value}</dd>
    </div>
  );
}
