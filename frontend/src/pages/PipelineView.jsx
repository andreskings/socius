import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Download, Mail } from 'lucide-react';
import { api } from '../api/client';
import { ESTADOS_POSTULACION, postulacionBadge } from '../catalogos';

const COLUMNA_ESTILO = {
  Nuevo: 'border-t-blue-400',
  'En revisión': 'border-t-purple-400',
  Entrevista: 'border-t-orange-400',
  Contratado: 'border-t-green-400',
  Rechazado: 'border-t-red-400',
};

export default function PipelineView() {
  const [postulaciones, setPostulaciones] = useState([]);
  const [busquedas, setBusquedas] = useState([]);
  const [busquedaId, setBusquedaId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargar = () => {
    setLoading(true);
    api
      .getPostulaciones(busquedaId ? { busquedaId } : {})
      .then(setPostulaciones)
      .finally(() => setLoading(false));
  };

  useEffect(cargar, [busquedaId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    api.getBusquedas().then(setBusquedas);
  }, []);

  const columnas = useMemo(() => {
    const map = Object.fromEntries(ESTADOS_POSTULACION.map((e) => [e, []]));
    for (const p of postulaciones) {
      (map[p.estado] ??= []).push(p);
    }
    return map;
  }, [postulaciones]);

  const cambiarEstado = async (postulacion, nuevoEstado) => {
    setError('');
    const anterior = postulaciones;
    setPostulaciones((prev) => prev.map((p) => (p.id === postulacion.id ? { ...p, estado: nuevoEstado } : p)));
    try {
      await api.actualizarEstadoPostulacion(postulacion.id, nuevoEstado);
    } catch (err) {
      setError(err.message);
      setPostulaciones(anterior);
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Pipeline de postulaciones</h1>
          <p className="text-sm text-gray-500 mt-1">Seguimiento de candidatos por búsqueda</p>
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

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {loading ? (
        <div className="text-center text-sm text-gray-400 py-12">Cargando...</div>
      ) : (
        <div className="flex gap-4 items-start overflow-x-auto pb-2">
          {ESTADOS_POSTULACION.map((estado) => (
            <div key={estado} className={`bg-gray-50 rounded-lg border-t-4 ${COLUMNA_ESTILO[estado]} w-64 shrink-0`}>
              <div className="px-3 py-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{estado}</span>
                <span className="text-xs bg-white text-gray-500 px-1.5 py-0.5 rounded-full border border-gray-200">
                  {columnas[estado].length}
                </span>
              </div>
              <div className="px-2 pb-2 space-y-2">
                {columnas[estado].length === 0 ? (
                  <p className="text-xs text-gray-400 px-1 py-3 text-center">Sin postulaciones</p>
                ) : (
                  columnas[estado].map((p) => (
                    <div key={p.id} className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm">
                      <div className="text-sm font-medium text-gray-800">
                        {p.candidato.nombre} {p.candidato.apellido}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        {p.candidato.email}
                      </div>
                      <div className="text-xs text-gray-500 mt-1.5">
                        {p.busqueda?.posicion || <span className="italic text-gray-400">Base de talentos</span>}
                      </div>
                      <div className="flex items-center justify-between mt-2.5 gap-2">
                        {p.candidato.cvArchivo ? (
                          <button
                            onClick={() => api.descargarCv(p.candidato.id, p.candidato.cvNombreOriginal)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors"
                            title="Descargar CV"
                          >
                            <Download className="w-3 h-3" />
                            CV
                          </button>
                        ) : (
                          <span />
                        )}
                        <div className="relative">
                          <select
                            value={p.estado}
                            onChange={(e) => cambiarEstado(p, e.target.value)}
                            className={`text-xs pl-2 pr-6 py-1 rounded appearance-none font-medium cursor-pointer ${postulacionBadge(p.estado)}`}
                          >
                            {ESTADOS_POSTULACION.map((e) => (
                              <option key={e} value={e}>
                                {e}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-current pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
