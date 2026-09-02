import { IntakeStatus, PatientCaseDto, PatientQueueStatus } from '@zaheri/types';
import { FormalReceipt } from './FormalReceipt';
import { WaitingTimeCounter } from './WaitingTimeCounter';
import { getHospitalName } from '../hospitals/catalog';

const STATUS_LABELS: Record<IntakeStatus, string> = {
  PENDING: 'Inasubiri kupangiwa',
  ROUTED: 'Umepangiwa',
  COMPLETED: 'Imekamilika',
};

interface PatientCaseViewProps {
  patientCase: PatientCaseDto;
  /** Live overlay from Socket.IO, when available — falls back to the polled fetch. */
  liveStatus?: PatientQueueStatus | null;
}

/**
 * Everything a patient can see about their own case: queue/room status,
 * lab results, and their QR pharmacy receipt. Shared by ConfirmationStep
 * (right after submitting) and StatusPage (revisiting later) so the two
 * don't drift. Never renders urgent/triageTag — PatientCaseDto has no such
 * field to render in the first place.
 */
export function PatientCaseView({ patientCase, liveStatus }: PatientCaseViewProps) {
  const status = liveStatus?.status ?? patientCase.status;
  const room = liveStatus?.room ?? patientCase.room;
  const queueNumber = liveStatus?.queueNumber ?? patientCase.queueNumber;
  const hospitalName = getHospitalName(patientCase.hospitalId);

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-xl border-2 border-brand bg-brand/5 p-4">
        <p className="text-sm font-bold uppercase tracking-wide text-brand-dark">
          {hospitalName}
        </p>
        <p className="text-lg text-slate-700">
          Namba ya usajili: <strong>{patientCase.registrationNumber}</strong>
        </p>
        <p className="text-lg text-slate-700">Hali: {STATUS_LABELS[status]}</p>
        {status !== 'COMPLETED' ? <WaitingTimeCounter since={patientCase.createdAt} /> : null}
        {queueNumber ? (
          <p className="text-lg text-slate-700">
            Namba ya foleni: <strong>{queueNumber}</strong>
          </p>
        ) : null}
        {room ? (
          <p className="text-lg text-slate-700">
            Nenda: <strong>{room}</strong>
          </p>
        ) : null}
      </div>

      {patientCase.labs.length > 0 ? (
        <div className="space-y-2 rounded-xl border-2 border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-slate-900">Matokeo ya Vipimo</h3>
          <ul className="space-y-2">
            {patientCase.labs.map((lab) => (
              <li key={lab.id}>
                <p className="font-semibold text-slate-900">{lab.testName}</p>
                <p className="text-sm text-slate-700">
                  {lab.resultSummary ?? 'Bado linasubiriwa'}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {patientCase.receipts.map((receipt) => (
        <FormalReceipt
          key={receipt.id}
          hospitalName={hospitalName}
          registrationNumber={patientCase.registrationNumber}
          receipt={receipt}
        />
      ))}
    </div>
  );
}
