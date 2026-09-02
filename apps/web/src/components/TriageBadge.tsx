import { TriageTag } from '@zaheri/types';

/**
 * Never rely on colour alone: each tag pairs a distinct icon shape (warning
 * triangle vs. checkmark, not just a colour swap) with a bilingual text
 * label, so it reads for colour-blind users and screen readers alike.
 */
const TRIAGE_BADGE_CONFIG: Record<TriageTag, { label: string; icon: string; classes: string }> = {
  RED: {
    label: 'Dharura / Urgent',
    icon: '⚠',
    classes: 'border-red-600 bg-red-100 text-red-800',
  },
  GREEN: {
    label: 'Kawaida / Routine',
    icon: '✓',
    classes: 'border-green-600 bg-green-100 text-green-800',
  },
};

interface TriageBadgeProps {
  tag: TriageTag;
}

export function TriageBadge({ tag }: TriageBadgeProps) {
  const { label, icon, classes } = TRIAGE_BADGE_CONFIG[tag];
  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 px-3 py-1 text-sm font-bold ${classes}`}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </span>
  );
}
