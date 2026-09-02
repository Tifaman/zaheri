import { Link } from 'react-router-dom';
import { ScreenShell } from '../../components/ScreenShell';
import { NavButton } from '../../components/NavButton';
import { getLastIntakeId } from '../../status/lastIntake';

interface Props {
  consentGiven: boolean;
  hospitalName: string;
  onChangeConsent: (value: boolean) => void;
  onNext: () => void;
}

export function WelcomeConsentStep({ consentGiven, hospitalName, onChangeConsent, onNext }: Props) {
  const hasPreviousIntake = !!getLastIntakeId();

  return (
    <ScreenShell
      promptKey="welcome"
      footer={
        <NavButton disabled={!consentGiven} onClick={onNext}>
          Endelea
        </NavButton>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-wide text-brand-dark">
            {hospitalName}
          </span>
          <Link to="/hospitals" className="text-sm font-semibold text-brand">
            ← Badilisha Hospitali
          </Link>
        </div>

        <p className="text-lg text-slate-700">
          ZaHeri itakusaidia kupata huduma leo — kwa sauti na kugusa skrini, bila picha ya
          mtu.
        </p>
        <label className="flex items-start gap-3 rounded-xl border-2 border-slate-200 p-4">
          <input
            type="checkbox"
            className="mt-1 h-6 w-6"
            checked={consentGiven}
            onChange={(e) => onChangeConsent(e.target.checked)}
          />
          <span className="text-lg text-slate-900">
            Nakubali ZaHeri kutumia taarifa zangu na mahali nilipo kwa ajili ya huduma hii.
          </span>
        </label>
        {hasPreviousIntake ? (
          <Link to="/status" className="inline-block text-sm font-semibold text-brand">
            Angalia hali ya ombi lako lililopita →
          </Link>
        ) : null}
      </div>
    </ScreenShell>
  );
}
