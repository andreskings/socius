import { useEffect, useMemo, useState } from 'react';
import { Search, X, Briefcase, Calendar, ChevronDown, Trash2 } from 'lucide-react';
import { api } from '../api/client';
import { PRACTICAS, PRIORIDADES, prioridadBadge, estadoBadge, formatFecha } from '../catalogos';
import NewSearchModal from '../components/NewSearchModal';
import CopyLinkButton from '../components/CopyLinkButton';

export default function RecruitmentView({ candidatosCount, onVerCandidatos }) {
  const [busquedas, setBusquedas] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [posicion, setPosicion] = useState('');
  const [practica, setPractica] = useState('');
  const [prioridad, setPrioridad] = useState('');
  const [estado, setEstado] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([api.getBusquedas(), api.getPostulaciones()])
      .then(([bs, ps]) => {
        setBusquedas(bs);
        setPostulaciones(ps);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtradas = useMemo(
    () =>
      busquedas.filter(
        (b) =>
          b.posicion.toLowerCase().includes(posicion.toLowerCase()) &&
          (practica === '' || b.practica === practica) &&
          (prioridad === '' || b.prioridad === prioridad) &&
          (estado === '' || b.estado === estado)
      ),
    [busquedas, posicion, practica, prioridad, estado]
  );

  const hayFiltros = posicion || practica || prioridad || estado;

  const eliminarBusqueda = async (b) => {
    if (!window.confirm(`¿Eliminar la búsqueda "${b.posicion}"? Los candidatos que postularon pasan a la base de talentos. Esta acción no se puede deshacer.`)) return;
    try {
      await api.eliminarBusqueda(b.id);
      load();
    } catch (err) {
      window.alert(err.message);
    }
  };

  // "En Proceso" y "En Entrevistas" reflejan el estado de las POSTULACIONES (el
  // pipeline kanban), no el estado de la búsqueda en sí — así el panel cambia en
  // el momento en que se mueve un candidato de columna, en vez de depender de un
  // campo de la búsqueda que nada más actualiza.
  const stats = [
    { label: 'Búsquedas Activas', value: busquedas.filter((b) => b.estado === 'Activa').length, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'En Proceso', value: postulaciones.filter((p) => p.estado === 'En revisión').length, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'En Entrevistas', value: postulaciones.filter((p) => p.estado === 'Entrevista').length, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Candidatos', value: candidatosCount, color: 'text-green-600', bg: 'bg-green-50', clickable: true },
  ];

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Reclutamiento</h1>
          <p className="text-sm text-gray-500 mt-1">Búsquedas activas y en proceso</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-purple-700 transition-colors"
          >
            <Briefcase className="w-4 h-4" />
            Nueva Búsqueda
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={s.clickable ? () => onVerCandidatos('') : undefined}
            className={`${s.bg} rounded-lg p-4 text-left ${s.clickable ? 'hover:opacity-90 transition-opacity cursor-pointer' : 'cursor-default'}`}
          >
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className={`text-3xl font-semibold ${s.color}`}>{s.value}</div>
            {s.clickable && <div className="text-xs text-gray-400 mt-1">Ver todos →</div>}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg p-5 mb-5 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtrar búsquedas</span>
          {hayFiltros && (
            <button
              onClick={() => {
                setPosicion('');
                setPractica('');
                setPrioridad('');
                setEstado('');
              }}
              className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" /> Limpiar
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Posición..."
              value={posicion}
              onChange={(e) => setPosicion(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          {[
            { value: practica, setter: setPractica, placeholder: 'Todas las prácticas', options: PRACTICAS },
            { value: prioridad, setter: setPrioridad, placeholder: 'Todas las prioridades', options: PRIORIDADES },
            { value: estado, setter: setEstado, placeholder: 'Todos los estados', options: ['Activa', 'En proceso', 'Entrevistas'] },
          ].map((f, i) => (
            <div className="relative" key={i}>
              <select
                value={f.value}
                onChange={(e) => f.setter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300 appearance-none"
              >
                <option value="">{f.placeholder}</option>
                {f.options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-3">
        {filtradas.length} resultado{filtradas.length !== 1 ? 's' : ''}
        {hayFiltros ? ' encontrados' : ''}
      </div>

      <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-xs text-gray-500">
                <th className="py-3 px-4 font-medium">Posición</th>
                <th className="py-3 px-4 font-medium">Práctica</th>
                <th className="py-3 px-4 font-medium">Prioridad</th>
                <th className="py-3 px-4 font-medium">Estado</th>
                <th className="py-3 px-4 font-medium">Apertura</th>
                <th className="py-3 px-4 font-medium">Solicitante</th>
                <th className="py-3 px-4 font-medium text-center">Candidatos</th>
                <th className="py-3 px-4 font-medium" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                    Cargando...
                  </td>
                </tr>
              ) : filtradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                    No se encontraron búsquedas con los filtros aplicados
                  </td>
                </tr>
              ) : (
                filtradas.map((b) => (
                  <tr key={b.id} className="border-b text-sm hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-800">{b.posicion}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{b.practica}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${prioridadBadge(b.prioridad)}`}>{b.prioridad}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${estadoBadge(b.estado)}`}>{b.estado}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {formatFecha(b.fechaApertura)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{b.solicitante}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onVerCandidatos(b.posicion)}
                        title="Ver candidatos"
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors ${
                          b.candidatos === 0 ? 'bg-gray-100 text-gray-400' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                        }`}
                      >
                        {b.candidatos}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 justify-end">
                        <CopyLinkButton posicion={b.posicion} />
                        <button
                          onClick={() => eliminarBusqueda(b)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                          title="Eliminar búsqueda"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t px-4 py-3 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400">¿No encontrás el rol ideal? Dejá tus datos en nuestra base de talentos.</p>
        </div>
      </div>

      {showModal && (
        <NewSearchModal
          onClose={() => setShowModal(false)}
          onSave={async (data) => {
            await api.createBusqueda(data);
            load();
          }}
        />
      )}
    </>
  );
}
