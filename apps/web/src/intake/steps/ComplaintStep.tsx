import { ScreenShell } from '../../components/ScreenShell';
import { NavButton } from '../../components/NavButton';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ComplaintStep({ value, onChange, onNext, onBack }: Props) {
  const isValid = value.trim().length > 0;

  return (
    <ScreenShell
      promptKey="complaint"
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
        <span className="text-lg font-semibold text-slate-900">Una shida gani?</span>
        <textarea
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full rounded-xl border-2 border-slate-300 p-4 text-xl"
          placeholder="Eleza kwa ufupi..."
        />
      </label>
    </ScreenShell>
  );
}
