import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthProvider } from './AuthContext';

function renderAt(path: string, role: 'CLINICIAN' | 'ADMIN' | null) {
  if (role) {
    localStorage.setItem(
      'zaheri.console.session',
      JSON.stringify({ accessToken: 'token', email: 'user@zaheri.dev', role }),
    );
  }

  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/console/login" element={<p>Ingia</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/console" element={<p>Console</p>} />
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/console/analytics" element={<p>Uchambuzi</p>} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sends a logged-out visitor to the login page', () => {
    renderAt('/console/analytics', null);
    expect(screen.getByText('Ingia')).toBeInTheDocument();
  });

  it('blocks a clinician from the admin-only analytics route', () => {
    renderAt('/console/analytics', 'CLINICIAN');
    expect(screen.getByText('Console')).toBeInTheDocument();
    expect(screen.queryByText('Uchambuzi')).not.toBeInTheDocument();
  });

  it('lets an admin through to the analytics route', () => {
    renderAt('/console/analytics', 'ADMIN');
    expect(screen.getByText('Uchambuzi')).toBeInTheDocument();
  });
});
