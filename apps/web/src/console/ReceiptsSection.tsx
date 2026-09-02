import { FormEvent, useState } from 'react';
import { PharmacyReceiptDto } from '@zaheri/types';
import { useIssueReceipt } from './useCases';

interface ReceiptsSectionProps {
  caseId: string;
  receipts: PharmacyReceiptDto[];
}

export function ReceiptsSection({ caseId, receipts }: ReceiptsSectionProps) {
  const issueReceipt = useIssueReceipt(caseId);
  const [pendingMedications, setPendingMedications] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');

  const addMedication = (e: FormEvent) => {
    e.preventDefault();
    const name = currentInput.trim();
    if (!name) return;
    setPendingMedications((meds) => [...meds, name]);
    setCurrentInput('');
  };

  const removeMedication = (index: number) => {
    setPendingMedications((meds) => meds.filter((_, i) => i !== index));
  };

  const handleIssue = () => {
    if (pendingMedications.length === 0) return;
    issueReceipt.mutate(pendingMedications, {
      onSuccess: () => setPendingMedications([]),
    });
  };

  return (
    <div className="space-y-3 rounded-xl border-2 border-slate-200 bg-white p-4">
      <h3 className="font-semibold text-slate-900">Risiti ya Dawa</h3>

      {receipts.length === 0 ? (
        <p className="text-sm text-slate-600">Hakuna risiti iliyotolewa bado.</p>
      ) : (
        <ul className="space-y-2">
          {receipts.map((receipt) => (
            <li key={receipt.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">Risiti</span>
                <span
                  className={`text-xs font-bold ${
                    receipt.status === 'REDEEMED' ? 'text-slate-500' : 'text-green-700'
                  }`}
                >
                  {receipt.status === 'REDEEMED' ? 'Imetumika' : 'Haijatumika'}
                </span>
              </div>
              <ul className="mt-1 list-inside list-disc text-sm text-slate-900">
                {receipt.medicationNames.map((med, i) => (
                  <li key={i}>{med}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2 rounded-lg border-2 border-dashed border-slate-300 p-3">
        <p className="text-sm font-semibold text-slate-700">Ongeza dawa kisha toa risiti moja</p>

        {pendingMedications.length > 0 ? (
          <ul className="space-y-1">
            {pendingMedications.map((med, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span>{med}</span>
                <button
                  type="button"
                  onClick={() => removeMedication(i)}
                  className="text-red-600"
                  aria-label={`Ondoa ${med}`}
                >
                  Ondoa
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <form onSubmit={addMedication} className="flex gap-2">
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="mfano: Paracetamol 500mg"
            className="flex-1 rounded-lg border-2 border-slate-300 p-2 text-sm"
          />
          <button
            type="submit"
            disabled={!currentInput.trim()}
            className="rounded-lg border-2 border-brand px-3 py-2 text-sm font-bold text-brand disabled:border-slate-300 disabled:text-slate-400"
          >
            + Ongeza
          </button>
        </form>

        <button
          type="button"
          onClick={handleIssue}
          disabled={issueReceipt.isPending || pendingMedications.length === 0}
          className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white disabled:bg-slate-300"
        >
          Toa Risiti Moja ya Dawa Zote ({pendingMedications.length})
        </button>
      </div>
      {issueReceipt.isError ? (
        <p role="alert" className="text-sm text-red-700">
          Imeshindwa kutoa risiti.
        </p>
      ) : null}
    </div>
  );
}
