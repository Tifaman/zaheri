import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PatientQueueStatus } from '@zaheri/types';

const handlers: Record<string, (payload: PatientQueueStatus) => void> = {};
const mockSocket = {
  on: vi.fn((event: string, handler: (payload: PatientQueueStatus) => void) => {
    handlers[event] = handler;
  }),
  off: vi.fn(),
  emit: vi.fn(),
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

// Imported after the mock so the module under test picks up the mocked `io`.
const { useQueueStatus } = await import('./useQueueStatus');

describe('useQueueStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('subscribes with the given intake id', () => {
    renderHook(() => useQueueStatus('intake-1'));
    expect(mockSocket.emit).toHaveBeenCalledWith('subscribe', { intakeId: 'intake-1' });
  });

  it('updates status only for a matching intake id, ignoring others', async () => {
    const { result } = renderHook(() => useQueueStatus('intake-1'));
    expect(result.current).toBeNull();

    const otherPayload: PatientQueueStatus = {
      intakeId: 'intake-OTHER',
      status: 'ROUTED',
      disposition: 'SEE_DOCTOR',
      room: 'OPD',
      queueNumber: 'Q-1',
      updatedAt: new Date().toISOString(),
    };
    act(() => handlers['queue:update']!(otherPayload));
    expect(result.current).toBeNull();

    const payload: PatientQueueStatus = {
      intakeId: 'intake-1',
      status: 'ROUTED',
      disposition: 'SEE_DOCTOR',
      room: 'OPD',
      queueNumber: 'Q-2',
      updatedAt: new Date().toISOString(),
    };
    act(() => handlers['queue:update']!(payload));

    await waitFor(() => expect(result.current).toEqual(payload));
  });

  it('does nothing when intakeId is null', () => {
    renderHook(() => useQueueStatus(null));
    expect(mockSocket.emit).not.toHaveBeenCalled();
  });
});
