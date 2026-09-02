import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatElapsed, useElapsedTime } from './useElapsedTime';

describe('formatElapsed', () => {
  it('formats sub-hour durations as MM:SS', () => {
    expect(formatElapsed(0)).toBe('00:00');
    expect(formatElapsed(75_000)).toBe('01:15');
  });

  it('formats hour-plus durations as HH:MM:SS', () => {
    expect(formatElapsed(3_661_000)).toBe('01:01:01');
  });
});

describe('useElapsedTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('ticks up once a second while running', () => {
    const since = new Date('2026-01-01T00:00:00.000Z').toISOString();
    const { result } = renderHook(() => useElapsedTime(since, true));
    expect(result.current).toBe(0);

    act(() => {
      vi.advanceTimersByTime(3_000);
    });
    expect(result.current).toBe(3_000);
  });

  it('freezes once isRunning goes false', () => {
    const since = new Date('2026-01-01T00:00:00.000Z').toISOString();
    const { result, rerender } = renderHook(({ running }) => useElapsedTime(since, running), {
      initialProps: { running: true },
    });

    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    expect(result.current).toBe(2_000);

    rerender({ running: false });
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(result.current).toBe(2_000);
  });
});
