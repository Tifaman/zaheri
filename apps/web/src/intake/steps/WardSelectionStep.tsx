import { ScreenShell } from '../../components/ScreenShell';
import { NavButton } from '../../components/NavButton';
import { WARD_OPTIONS } from '../intakeState';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function WardSelectionStep({ value, onChange, onNext, onBack }: Props) {
  return (
    <ScreenShell
      promptKey="wardSelection"
      footer={
        <div className="flex gap-3">
          <NavButton variant="secondary" onClick={onBack}>
            Rudi
          </NavButton>
          <NavButton disabled={!value} onClick={onNext}>
            Endelea
          </NavButton>
        </div>
      }
    >
      <div className="space-y-3">
        {WARD_OPTIONS.map((ward) => (
          <button
            key={ward}
            type="button"
            onClick={() => onChange(ward)}
            aria-pressed={value === ward}
            className={`w-full rounded-xl border-2 p-4 text-left text-xl font-semibold ${
              value === ward ? 'border-brand bg-brand/10' : 'border-slate-300'
            }`}
          >
            {ward}
          </button>
        ))}
      </div>
    </ScreenShell>
  );
}
