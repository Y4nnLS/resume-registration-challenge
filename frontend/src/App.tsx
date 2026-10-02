import { Route, Routes } from 'react-router';
import { AppLayout } from './components/AppLayout';
import { CandidateDetailPage } from './pages/CandidateDetailPage';
import { CandidateListPage } from './pages/CandidateListPage';
import { CandidateRegistrationPage } from './pages/CandidateRegistrationPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/candidates/new" element={<CandidateRegistrationPage />} />
        <Route path="/candidates" element={<CandidateListPage />} />
        <Route path="/candidates/:id" element={<CandidateDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
