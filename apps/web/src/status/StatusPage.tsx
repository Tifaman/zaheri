import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePatientCase } from './usePatientCase';
import { useQueueStatus } from '../queue/useQueueStatus';
import { getLastIntakeId } from './lastIntake';
import { PatientCaseView } from './PatientCaseView';

/** Lets a patient reopen the app later and check their own case status. */
export function StatusPage() {
  const [intakeId] = useState(() => getLastIntakeId());
  const { data: patientCase, isLoading, isError } = usePatientCase(intakeId);
  const liveStatus = useQueueStatus(intakeId);

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      <Link to="/intake" className="inline-block text-sm font-semibold text-brand">
        ← Rudi mwanzo
      </Link>
      <h1 className="text-xl font-bold text-slate-900">Hali ya Ombi Lako</h1>

      {!intakeId ? (
        <p className="text-slate-600">Hakuna ombi la hivi karibuni lililopatikana.</p>
      ) : isLoading ? (
        <p>Inapakia...</p>
      ) : isError || !patientCase ? (
        <p role="alert">Imeshindwa kupakia hali yako.</p>
      ) : (
        <PatientCaseView patientCase={patientCase} liveStatus={liveStatus} />
      )}
    </div>
  );
}
