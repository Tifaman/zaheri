import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { PatientQueueStatus } from '@zaheri/types';

let socket: Socket | null = null;

// Local dev proxies /socket.io to the API (vite.config.ts), so a bare
// namespace path connects to the current origin. In production the API is
// a separate origin, so prefix the namespace with its full URL instead —
// see VITE_API_BASE_URL in lib/api.ts and render.yaml.
const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || '';

function getSocket(): Socket {
  if (!socket) {
    socket = io(`${API_ORIGIN}/queue`);
  }
  return socket;
}

/**
 * Subscribes to real-time queue status for one intake. The intake id
 * itself is the subscription capability — there's no patient login (see
 * CLAUDE.md), so anyone with the id (returned only to whoever submitted it)
 * can watch its status, the same trust model as the confirmation screen.
 *
 * Only ever receives PatientQueueStatus — queue number, room, disposition,
 * status. No complaint, body region, urgency, or triage tag ever arrives
 * over this channel; that stays on the clinician-only /cases API.
 */
export function useQueueStatus(intakeId: string | null): PatientQueueStatus | null {
  const [status, setStatus] = useState<PatientQueueStatus | null>(null);

  useEffect(() => {
    if (!intakeId) return;

    const s = getSocket();
    const handleUpdate = (payload: PatientQueueStatus) => {
      if (payload.intakeId === intakeId) setStatus(payload);
    };

    s.on('queue:update', handleUpdate);
    s.emit('subscribe', { intakeId });

    return () => {
      s.off('queue:update', handleUpdate);
    };
  }, [intakeId]);

  return status;
}
