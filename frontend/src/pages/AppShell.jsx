import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, User, UserCog, LogOut, Kanban } from 'lucide-react';
import { api } from '../api/client';
import RecruitmentView from './RecruitmentView';
import CandidatesView from './CandidatesView';
import UsuariosView from './UsuariosView';
import PipelineView from './PipelineView';

export default function AppShell() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [view, setView] = useState('recruitment');
  const [filterPosition, setFilterPosition] = useState('');
  const [candidatosCount, setCandidatosCount] = useState(0);

  useEffect(() => {
    api
      .me()
      .then((data) => {
        if (data.tipo !== 'usuario') throw new Error('No autorizado');
        setUsuario(data);
      })
      .catch(() => navigate('/login'))
      .finally(() => setCheckingAuth(false));
  }, [navigate]);

  useEffect(() => {
    if (!usuario) return;
    api.getCandidatos().then((data) => setCandidatosCount(data.length));
  }, [usuario]);

  const irACandidatos = (posicion = '') => {
    setFilterPosition(posicion);
    setView('candidates');
  };

  const handleLogout = async () => {
    await api.logout();
    navigate('/login');
  };

  if (checkingAuth || !usuario) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-400">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1a1f36] text-white px-6 py-3 flex items-center justify-between">
        <div />
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm">{usuario.nombre}</div>
            <div className="text-xs text-white/40">{usuario.rol === 'ADMIN' ? 'Administrador' : 'Reclutador'}</div>
          </div>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <button onClick={handleLogout} title="Cerrar sesión" className="text-white/50 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex">
        <aside className="w-60 bg-white border-r min-h-screen shrink-0">
          <nav className="p-4 space-y-0.5">
            <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2">Reclutamiento</p>
            <button
              onClick={() => setView('recruitment')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                view === 'recruitment' ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Búsquedas activas
            </button>
            <button
              onClick={() => irACandidatos('')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                view === 'candidates' ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" />
              Candidatos
              <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">{candidatosCount}</span>
            </button>
            <button
              onClick={() => setView('pipeline')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                view === 'pipeline' ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Kanban className="w-4 h-4" />
              Pipeline
            </button>

            {usuario.rol === 'ADMIN' && (
              <>
                <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4">Administración</p>
                <button
                  onClick={() => setView('usuarios')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                    view === 'usuarios' ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <UserCog className="w-4 h-4" />
                  Usuarios
                </button>
              </>
            )}
          </nav>
        </aside>

        <main className="flex-1 p-6 min-w-0">
          {view === 'candidates' && (
            <CandidatesView
              filterPosition={filterPosition}
              onBack={() => setView('recruitment')}
              onCountChange={setCandidatosCount}
            />
          )}
          {view === 'recruitment' && (
            <RecruitmentView candidatosCount={candidatosCount} onVerCandidatos={irACandidatos} />
          )}
          {view === 'pipeline' && <PipelineView />}
          {view === 'usuarios' && usuario.rol === 'ADMIN' && <UsuariosView usuarioActual={usuario} />}
        </main>
      </div>
    </div>
  );
}
