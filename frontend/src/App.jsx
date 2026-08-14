import { Routes, Route } from 'react-router-dom';
import AppShell from './pages/AppShell';
import ApplyPage from './pages/ApplyPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />} />
      <Route path="/postular" element={<ApplyPage />} />
      <Route path="/postular/:slug" element={<ApplyPage />} />
    </Routes>
  );
}
