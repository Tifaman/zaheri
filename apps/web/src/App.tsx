import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { NationalWelcomePage } from './hospitals/NationalWelcomePage';
import { HospitalGridPage } from './hospitals/HospitalGridPage';
import { IntakeFlow } from './intake/IntakeFlow';
import { LoginPage } from './console/LoginPage';
import { ConsoleLayout } from './console/ConsoleLayout';
import { CaseListPage } from './console/CaseListPage';
import { CaseDetailPage } from './console/CaseDetailPage';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { StatusPage } from './status/StatusPage';
import { AnalyticsDashboardPage } from './analytics/AnalyticsDashboardPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NationalWelcomePage />} />
        <Route path="/hospitals" element={<HospitalGridPage />} />
        <Route path="/intake" element={<IntakeFlow />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/console/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<ConsoleLayout />}>
            <Route path="/console" element={<CaseListPage />} />
            <Route path="/console/cases/:id" element={<CaseDetailPage />} />
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/console/analytics" element={<AnalyticsDashboardPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
