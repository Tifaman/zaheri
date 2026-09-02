import { ScreenShell } from '../../components/ScreenShell';
import { NavButton } from '../../components/NavButton';

interface Props {
  value: string;
  hospitalName: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function RegistrationNumberStep({ value, hospitalName, onChange, onNext, onBack }: Props) {
  const isValid = value.trim().length > 0;

  return (
    <ScreenShell
      promptKey="registrationNumber"
      footer={
        <div className="flex gap-3">
          <NavButton variant="secondary" onClick={onBack}>
            Rudi
          </NavButton>
          <NavButton disabled={!isValid} onClick={onNext}>
            Endelea
          </NavButton>
        </div>
      }
    >
      <label className="block space-y-2">
        <span className="text-lg font-semibold text-slate-900">
          Namba ya usajili — {hospitalName}
        </span>
        <input
          type="text"
          inputMode="text"
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border-2 border-slate-300 p-4 text-2xl"
          placeholder="mfano: MNH-0001"
        />
      </label>
    </ScreenShell>
  );
}
