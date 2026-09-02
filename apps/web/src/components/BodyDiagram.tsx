import type { KeyboardEvent } from 'react';
import { BodyRegionCode } from '@zaheri/types';

interface BodyDiagramProps {
  value: BodyRegionCode | null;
  onSelect: (region: BodyRegionCode) => void;
}

interface RegionShape {
  region: BodyRegionCode;
  label: string;
  d?: string;
  shape: 'circle' | 'rect';
  attrs: Record<string, number>;
}

/**
 * TODO(asset): placeholder geometric body diagram. Replace with the
 * commissioned SVG body-diagram asset (front + back, anatomically legible
 * silhouette) — keep the same `data-region` tap targets and region codes
 * from @zaheri/types so the intake wiring doesn't need to change.
 */
const REGIONS: RegionShape[] = [
  { region: 'HEAD', label: 'Kichwa', shape: 'circle', attrs: { cx: 100, cy: 30, r: 22 } },
  { region: 'CHEST', label: 'Kifua', shape: 'rect', attrs: { x: 70, y: 56, width: 60, height: 40 } },
  {
    region: 'ABDOMEN',
    label: 'Tumbo',
    shape: 'rect',
    attrs: { x: 72, y: 98, width: 56, height: 36 },
  },
  {
    region: 'LEFT_ARM',
    label: 'Mkono wa kushoto',
    shape: 'rect',
    attrs: { x: 130, y: 58, width: 22, height: 90 },
  },
  {
    region: 'RIGHT_ARM',
    label: 'Mkono wa kulia',
    shape: 'rect',
    attrs: { x: 48, y: 58, width: 22, height: 90 },
  },
  {
    region: 'LEFT_LEG',
    label: 'Mguu wa kushoto',
    shape: 'rect',
    attrs: { x: 100, y: 136, width: 26, height: 90 },
  },
  {
    region: 'RIGHT_LEG',
    label: 'Mguu wa kulia',
    shape: 'rect',
    attrs: { x: 74, y: 136, width: 26, height: 90 },
  },
];

export function BodyDiagram({ value, onSelect }: BodyDiagramProps) {
  return (
    <div>
      <svg
        viewBox="0 0 200 230"
        role="group"
        aria-label="Mchoro wa mwili — gusa sehemu inayokusumbua"
        className="mx-auto h-64 w-auto sm:h-80"
      >
        <rect x="0" y="0" width="200" height="230" fill="none" />
        {REGIONS.map(({ region, label, shape, attrs }) => {
          const selected = value === region;
          const commonProps = {
            'data-region': region,
            role: 'button' as const,
            tabIndex: 0,
            'aria-label': label,
            'aria-pressed': selected,
            onClick: () => onSelect(region),
            onKeyDown: (e: KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') onSelect(region);
            },
            className: `cursor-pointer stroke-slate-400 stroke-2 transition-colors ${
              selected ? 'fill-brand' : 'fill-slate-200 hover:fill-brand/40'
            }`,
          };
          return shape === 'circle' ? (
            <circle key={region} {...commonProps} {...attrs} />
          ) : (
            <rect key={region} {...commonProps} {...attrs} rx={6} />
          );
        })}
      </svg>
      <button
        type="button"
        onClick={() => onSelect('OTHER')}
        aria-pressed={value === 'OTHER'}
        className={`mt-4 w-full rounded-xl border-2 px-4 py-3 text-lg font-semibold ${
          value === 'OTHER' ? 'border-brand bg-brand/10' : 'border-slate-300'
        }`}
      >
        Sehemu nyingine
      </button>
    </div>
  );
}
