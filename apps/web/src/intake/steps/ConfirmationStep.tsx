import { IntakeDto } from '@zaheri/types';
import { ScreenShell } from '../../components/ScreenShell';
import { NavButton } from '../../components/NavButton';
import { IntakeFormState } from '../intakeState';
import { useQueueStatus } from '../../queue/useQueueStatus';
import { usePatientCase } from '../../status/usePatientCase';
import { PatientCaseView } from '../../status/PatientCaseView';

interface Props {
  form: IntakeFormState;
  isPending: boolean;
  isError: boolean;
  errorMessage?: string | undefined;
  result?: IntakeDto | undefined;
  onSubmit: () => void;
  onBack: () => void;
  onRestart: () => void;
}

export function ConfirmationStep({
  form,
  isPending,
  isError,
  errorMessage,
  result,
  onSubmit,
  onBack,
  onRestart,
}: Props) {
  // Live queue status (Socket.IO) layered over the polled full case (labs,
  // receipt) — see PatientCaseView. Neither ever carries complaint/urgency/
  // triage — that stays doctor-console-only.
  const liveStatus = useQueueStatus(result?.id ?? null);
  const { data: patientCase } = usePatientCase(result?.id ?? null);

  if (result) {
    return (
      <ScreenShell
        promptKey="confirmation"
        footer={
          <NavButton variant="secondary" onClick={onRestart}>
            Anza upya
          </NavButton>
        }
      >
        <div className="space-y-4">
          <p className="text-2xl font-bold text-brand-dark">Taarifa zimetumwa!</p>
          {patientCase ? (
            <PatientCaseView patientCase={patientCase} liveStatus={liveStatus} />
          ) : (
            <p className="text-lg text-slate-700">
              Namba ya usajili: <strong>{result.registrationNumber}</strong>
            </p>
          )}
        </div>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      promptKey="confirmation"
      footer={
        <div className="flex gap-3">
          <NavButton variant="secondary" onClick={onBack} disabled={isPending}>
            Rudi
          </NavButton>
          <NavButton onClick={onSubmit} disabled={isPending}>
            {isPending ? 'Inatuma...' : 'Thibitisha na Tuma'}
          </NavButton>
        </div>
      }
    >
      <dl className="space-y-3 text-lg">
        <Row label="Namba ya usajili" value={form.registrationNumber} />
        <Row label="Wodi" value={form.ward} />
        <Row label="Shida" value={form.complaint} />
        <Row label="Sehemu ya mwili" value={form.bodyRegion ?? ''} />
      </dl>
      {isError ? (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">
          {errorMessage ?? 'Imeshindwa kutuma. Jaribu tena.'}
        </p>
      ) : null}
    </ScreenShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b pb-2">
      <dt className="font-semibold text-slate-600">{label}</dt>
      <dd className="text-right text-slate-900">{value}</dd>
    </div>
  );
}
