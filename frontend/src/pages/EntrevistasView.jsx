import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, Download, Mail, CalendarClock } from 'lucide-react';
import { api } from '../api/client';
import { ESTADOS_POSTULACION, postulacionBadge, formatFecha } from '../catalogos';
import CambiarEstadoModal from '../components/CambiarEstadoModal';

const ESTADOS_QUE_NOTIFICAN = ['Entrevista', 'Rechazado'];

export default function EntrevistasView({ onBack }) {
  const [postulaciones, setPostulaciones] = useState([]);
  const [busquedas, setBusquedas] = useState([]);
  const [busquedaId, setBusquedaId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendiente, setPendiente] = useState(null); // { postulacion, nuevoEstado }

  const cargar = () => {
    setLoading(true);
    api
      .getPostulaciones({ estado: 'Entrevista', ...(busquedaId && { busquedaId }) })
      .then(setPostulaciones)
      .finally(() => setLoading(false));
  };

  useEffect(cargar, [busquedaId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    api.getBusquedas().then(setBusquedas);
  }, []);

  const ordenadas = useMemo(
    () => [...postulaciones].sort((a, b) => new Date(a.fechaEntrevista) - new Date(b.fechaEntrevista)),
    [postulaciones]
  );

  const cambiarEstado = async (postulacion, nuevoEstado, extra = {}) => {
    setError('');
    try {
      await api.actualizarEstadoPostulacion(postulacion.id, nuevoEstado, extra);
      cargar(); // si deja de estar "En entrevista" sale solo de esta lista
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Entrevista/Rechazado mandan correo real al candidato: se confirma primero en
  // un modal (y ahí se pide la fecha si es Entrevista), igual que en el pipeline.
  const elegirEstado = (postulacion, nuevoEstado) => {
    if (ESTADOS_QUE_NOTIFICAN.includes(nuevoEstado)) {
      setPendiente({ postulacion, nuevoEstado });
    } else {
      cambiarEstado(postulacion, nuevoEstado);
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <div>
            <h1 className="text-2xl font-semibold">Entrevistas</h1>
            <p className="text-sm text-gray-500 mt-1">Candidatos con entrevista agendada, ordenados por fecha</p>
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

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-xs text-gray-500">
                <th className="py-3 px-4 font-medium">Candidato</th>
                <th className="py-3 px-4 font-medium">Cargo</th>
                <th className="py-3 px-4 font-medium">Fecha y hora</th>
                <th className="py-3 px-4 font-medium">CV</th>
                <th className="py-3 px-4 font-medium text-right">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
                    Cargando...
                  </td>
                </tr>
              ) : ordenadas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
                    No hay entrevistas agendadas
                  </td>
                </tr>
              ) : (
                ordenadas.map((p) => (
                  <tr key={p.id} className="border-b text-sm hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {p.candidato.nombre} {p.candidato.apellido}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        {p.candidato.email}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {p.busqueda?.posicion || <span className="italic text-gray-400">Base de talentos</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1 text-purple-700 bg-purple-50 rounded px-2 py-1 text-xs font-medium w-fit">
                        <CalendarClock className="w-3.5 h-3.5" />
                        {formatFecha(p.fechaEntrevista)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {p.candidato.cvArchivo ? (
                        <button
                          onClick={() => api.descargarCv(p.candidato.id, p.candidato.cvNombreOriginal)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          CV
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="relative inline-block">
                        <select
                          value={p.estado}
                          onChange={(e) => elegirEstado(p, e.target.value)}
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pendiente && (
        <CambiarEstadoModal
          postulacion={pendiente.postulacion}
          nuevoEstado={pendiente.nuevoEstado}
          onClose={() => setPendiente(null)}
          onConfirm={async (extra) => {
            await cambiarEstado(pendiente.postulacion, pendiente.nuevoEstado, extra);
            setPendiente(null);
          }}
        />
      )}
    </>
  );
}
