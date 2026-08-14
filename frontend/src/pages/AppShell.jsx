import { useEffect, useState } from 'react';
import { Briefcase, Users, User } from 'lucide-react';
import { api } from '../api/client';
import RecruitmentView from './RecruitmentView';
import CandidatesView from './CandidatesView';

export default function AppShell() {
  const [view, setView] = useState('recruitment');
  const [filterPosition, setFilterPosition] = useState('');
  const [candidatosCount, setCandidatosCount] = useState(0);

  useEffect(() => {
    api.getCandidatos().then((data) => setCandidatosCount(data.length));
  }, []);

  const irACandidatos = (posicion = '') => {
    setFilterPosition(posicion);
    setView('candidates');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1a1f36] text-white px-6 py-3 flex items-center justify-between">
        <div />
        <div className="flex items-center gap-4">
          <span className="text-sm">Vera Mila</span>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
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
        </main>
      </div>
    </div>
  );
}
