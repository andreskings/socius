import { Routes, Route } from 'react-router-dom';
import AppShell from './pages/AppShell';
import StaffLogin from './pages/StaffLogin';
import CandidatoAuth from './pages/CandidatoAuth';
import CandidatoPortal from './pages/CandidatoPortal';
import CandidatoVerificarEmail from './pages/CandidatoVerificarEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />} />
      <Route path="/login" element={<StaffLogin />} />
      <Route path="/login/olvide" element={<ForgotPassword actor="usuario" volverA="/login" />} />
      <Route path="/login/restablecer" element={<ResetPassword volverA="/login" />} />

      <Route path="/postular" element={<CandidatoAuth />} />
      <Route path="/postular/:slug" element={<CandidatoAuth />} />
      <Route path="/candidato/registro" element={<CandidatoAuth />} />
      <Route path="/candidato/registro/:slug" element={<CandidatoAuth />} />
      <Route path="/candidato/login" element={<CandidatoAuth modoInicial="login" />} />
      <Route path="/candidato/olvide" element={<ForgotPassword actor="candidato" volverA="/candidato/login" />} />
      <Route path="/candidato/restablecer" element={<ResetPassword volverA="/candidato/login" />} />
      <Route path="/candidato/portal" element={<CandidatoPortal />} />
      <Route path="/candidato/verificar-email" element={<CandidatoVerificarEmail />} />
    </Routes>
  );
}
