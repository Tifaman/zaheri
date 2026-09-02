import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function navLinkClass({ isActive }: { isActive: boolean }): string {
  const base = 'rounded-lg px-3 py-1.5 text-sm font-semibold';
  return isActive ? `${base} bg-brand/10 text-brand-dark` : `${base} text-slate-600`;
}

/**
 * Content is capped at max-w-5xl and centred — the console is data-dense
 * (case lists, forms) so it gets more room than the patient flow, but still
 * shouldn't stretch edge to edge on a wide desktop monitor.
 */
export function ConsoleLayout() {
  const { session, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2">
          <NavLink to="/console" className="text-lg font-bold text-slate-900">
            ZaHeri — Console ya Daktari
          </NavLink>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="hidden sm:inline">{session?.email}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold"
            >
              Toka
            </button>
          </div>
        </div>
        <nav className="mx-auto mt-3 flex w-full max-w-5xl gap-2">
          <NavLink to="/console" end className={navLinkClass}>
            Wagonjwa
          </NavLink>
          {session?.role === 'ADMIN' ? (
            <NavLink to="/console/analytics" className={navLinkClass}>
              Uchambuzi
            </NavLink>
          ) : null}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}
