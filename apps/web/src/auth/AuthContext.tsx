import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { LoginResponse } from '@zaheri/types';
import { login as apiLogin } from '../lib/api';

// Mirrors @zaheri/types' CONSOLE_ROLES. Kept as a literal check (not a
// runtime import of that shared constant) because this file only needs a
// UX gate — the real RBAC boundary is server-side (RolesGuard) — and a
// literal check here sidesteps bundler-specific CJS/ESM interop quirks
// around re-exported const arrays.
function isConsoleRole(role: LoginResponse['role']): boolean {
  return role === 'CLINICIAN' || role === 'ADMIN';
}

const STORAGE_KEY = 'zaheri.console.session';

interface Session {
  accessToken: string;
  email: string;
  role: LoginResponse['role'];
}

interface AuthContextValue {
  session: Session | null;
  isConsoleUser: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): Session | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readStoredSession());

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isConsoleUser: !!session && isConsoleRole(session.role),
      login: async (email, password) => {
        const result = await apiLogin({ email, password });
        setSession(result);
      },
      logout: () => setSession(null),
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
