import { useEffect, useState } from 'react';

/**
 * Milliseconds elapsed since `sinceIso`, ticking every second while
 * `isRunning`. Frozen (stops ticking, keeps its last value) once
 * `isRunning` goes false — used to stop the counter the moment a case is
 * COMPLETED rather than have it keep counting past the point it means
 * anything.
 */
export function useElapsedTime(sinceIso: string, isRunning: boolean): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  return Math.max(0, now - new Date(sinceIso).getTime());
}

export function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}
