import { FormEvent, useState } from 'react';
import { LabOrderDto } from '@zaheri/types';
import { useOrderLab, useReportLab } from './useCases';

interface LabsSectionProps {
  caseId: string;
  labs: LabOrderDto[];
}

export function LabsSection({ caseId, labs }: LabsSectionProps) {
  const orderLab = useOrderLab(caseId);
  const [testName, setTestName] = useState('');

  const handleOrder = (e: FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) return;
    orderLab.mutate(testName.trim(), { onSuccess: () => setTestName('') });
  };

  return (
    <div className="space-y-3 rounded-xl border-2 border-slate-200 bg-white p-4">
      <h3 className="font-semibold text-slate-900">Vipimo vya Maabara</h3>

      {labs.length === 0 ? (
        <p className="text-sm text-slate-600">Hakuna kipimo kilichoombwa bado.</p>
      ) : (
        <ul className="space-y-2">
          {labs.map((lab) => (
            <LabRow key={lab.id} caseId={caseId} lab={lab} />
          ))}
        </ul>
      )}

      <form onSubmit={handleOrder} className="flex gap-2">
        <input
          type="text"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          placeholder="mfano: Full Blood Count"
          className="flex-1 rounded-lg border-2 border-slate-300 p-2 text-sm"
        />
        <button
          type="submit"
          disabled={orderLab.isPending || !testName.trim()}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white disabled:bg-slate-300"
        >
          Omba Kipimo
        </button>
      </form>
      {orderLab.isError ? (
        <p role="alert" className="text-sm text-red-700">
          Imeshindwa kuomba kipimo.
        </p>
      ) : null}
    </div>
  );
}

function LabRow({ caseId, lab }: { caseId: string; lab: LabOrderDto }) {
  const reportLab = useReportLab(caseId);
  const [resultSummary, setResultSummary] = useState('');
  const [isEntering, setIsEntering] = useState(false);

  const handleReport = (e: FormEvent) => {
    e.preventDefault();
    if (!resultSummary.trim()) return;
    reportLab.mutate(
      { labOrderId: lab.id, resultSummary: resultSummary.trim() },
      { onSuccess: () => setIsEntering(false) },
    );
  };

  return (
    <li className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-900">{lab.testName}</span>
        <span
          className={`text-xs font-bold ${
            lab.status === 'RESULTED' ? 'text-green-700' : 'text-slate-500'
          }`}
        >
          {lab.status === 'RESULTED' ? 'Imekamilika' : 'Inasubiriwa'}
        </span>
      </div>
      {lab.resultSummary ? (
        <p className="mt-1 text-sm text-slate-700">{lab.resultSummary}</p>
      ) : isEntering ? (
        <form onSubmit={handleReport} className="mt-2 flex gap-2">
          <input
            type="text"
            autoFocus
            value={resultSummary}
            onChange={(e) => setResultSummary(e.target.value)}
            placeholder="Andika matokeo..."
            className="flex-1 rounded-lg border-2 border-slate-300 p-2 text-sm"
          />
          <button
            type="submit"
            disabled={reportLab.isPending || !resultSummary.trim()}
            className="rounded-lg bg-brand px-3 py-2 text-sm font-bold text-white disabled:bg-slate-300"
          >
            Hifadhi
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsEntering(true)}
          className="mt-2 text-sm font-semibold text-brand"
        >
          + Weka Matokeo
        </button>
      )}
    </li>
  );
}
