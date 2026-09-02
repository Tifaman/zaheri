import { BodyRegionCode } from '@zaheri/types';
import { ScreenShell } from '../../components/ScreenShell';
import { NavButton } from '../../components/NavButton';
import { BodyDiagram } from '../../components/BodyDiagram';

interface Props {
  value: BodyRegionCode | null;
  onChange: (value: BodyRegionCode) => void;
  onNext: () => void;
  onBack: () => void;
}

export function BodyRegionStep({ value, onChange, onNext, onBack }: Props) {
  return (
    <ScreenShell
      promptKey="bodyRegion"
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
      <BodyDiagram value={value} onSelect={onChange} />
    </ScreenShell>
  );
}
