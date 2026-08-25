import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronDown, Download, Mail } from 'lucide-react';
import { api } from '../api/client';
import { formatFecha } from '../catalogos';

export default function RechazadosView({ onBack }) {
  const [postulaciones, setPostulaciones] = useState([]);
  const [busquedas, setBusquedas] = useState([]);
  const [busquedaId, setBusquedaId] = useState('');
  const [loading, setLoading] = useState(true);

  const cargar = () => {
    setLoading(true);
    api
      .getPostulaciones({ estado: 'Rechazado', ...(busquedaId && { busquedaId }) })
      .then((data) => setPostulaciones([...data].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))))
      .finally(() => setLoading(false));
  };

  useEffect(cargar, [busquedaId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    api.getBusquedas().then(setBusquedas);
  }, []);

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <div>
            <h1 className="text-2xl font-semibold">Rechazados</h1>
            <p className="text-sm text-gray-500 mt-1">Candidatos que no continuaron en el proceso, con el motivo</p>
          </div>
        </div>
        <div className="relative">
          <select
            value={busquedaId}
            onChange={(e) => setBusquedaId(e.target.value)}
            className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300 appearance-none bg-white"
          >
            <option value="">Todas las búsquedas</option>
            {busquedas.map((b) => (
              <option key={b.id} value={b.id}>
                {b.posicion}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-sm text-gray-400 py-12">Cargando...</div>
      ) : postulaciones.length === 0 ? (
        <div className="text-center text-sm text-gray-400 py-12 bg-white rounded-lg border border-gray-100">
          No hay candidatos rechazados
        </div>
      ) : (
        <div className="space-y-3">
          {postulaciones.map((p) => (
            <div key={p.id} className="bg-white rounded-lg border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-medium text-gray-900">
                    {p.candidato.nombre} {p.candidato.apellido}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" />
                    {p.candidato.email}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {p.busqueda?.posicion || <span className="italic text-gray-400">Base de talentos</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-400">{formatFecha(p.updatedAt)}</span>
                  {p.candidato.cvArchivo && (
                    <button
                      onClick={() => api.descargarCv(p.candidato.id, p.candidato.cvNombreOriginal)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      CV
                    </button>
                  )}
                </div>
              </div>
              {p.motivoRechazo ? (
                <p className="text-sm text-gray-600 bg-red-50 rounded-lg p-3 mt-3 whitespace-pre-line">{p.motivoRechazo}</p>
              ) : (
                <p className="text-xs text-gray-300 italic mt-3">Sin motivo especificado</p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
