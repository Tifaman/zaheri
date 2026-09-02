import { useElapsedTime, formatElapsed } from './useElapsedTime';

interface WaitingTimeCounterProps {
  /** ISO timestamp the wait started from — the intake's createdAt. */
  since: string;
}

/**
 * Live-ticking "how long you've been waiting" clock. Only rendered while a
 * case is still open (see PatientCaseView) — once COMPLETED, waiting is
 * over and the counter would be misleading if it kept running.
 */
export function WaitingTimeCounter({ since }: WaitingTimeCounterProps) {
  const elapsedMs = useElapsedTime(since, true);

  return (
    <div className="flex items-baseline justify-between rounded-lg bg-white/60 px-3 py-2">
      <span className="text-sm font-semibold text-slate-600">Muda wa Kusubiri</span>
      {/* No aria-live here: the value ticks every second, so a live region
          would re-announce it constantly and drown out screen readers. */}
      <span className="font-mono text-2xl font-bold tabular-nums text-brand-dark">
        {formatElapsed(elapsedMs)}
      </span>
    </div>
  );
}
