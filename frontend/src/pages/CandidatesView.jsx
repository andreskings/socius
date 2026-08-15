import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Search, X, ChevronDown, Calendar, Eye, FileText, Download } from 'lucide-react';
import { api } from '../api/client';
import { formatFecha, veredictoBadge } from '../catalogos';
import CandidateModal from '../components/CandidateModal';

export default function CandidatesView({ filterPosition, onBack, onCountChange, usuarioActual }) {
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cargo, setCargo] = useState(filterPosition ?? '');
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);

  const cargar = () => {
    setLoading(true);
    api
      .getCandidatos()
      .then((data) => {
        setCandidatos(data);
        onCountChange?.(data.length);
      })
      .finally(() => setLoading(false));
  };

  useEffect(cargar, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => setCargo(filterPosition ?? ''), [filterPosition]);

  const cargos = useMemo(() => [...new Set(candidatos.map((c) => c.cargo).filter(Boolean))], [candidatos]);

  const filtrados = useMemo(
    () =>
      candidatos.filter((c) => {
        const matchCargo = cargo === '' || c.cargo === cargo || (cargo === '__general__' && !c.cargo);
        const q = busqueda.toLowerCase();
        const matchBusqueda = !q || `${c.nombre} ${c.apellido} ${c.email}`.toLowerCase().includes(q);
        return matchCargo && matchBusqueda;
      }),
    [candidatos, cargo, busqueda]
  );

  const presencialidadLabel = (p) => {
    if (!p) return '—';
    if (p.startsWith('Sí, disponibilidad completa')) return 'Completa';
    if (p.startsWith('Sí')) return 'Parcial';
    return 'Remoto';
  };

  const descargarDatos = (c) => {
    const lines = [
      'POSTULACIÓN SOCIUS',
      '===================',
      `Nombre:          ${c.nombre} ${c.apellido}`,
      `Email:           ${c.email}`,
      `Teléfono:        ${c.telefono}`,
      `Región:          ${c.region}`,
      `Presencialidad:  ${c.disponibilidadPresencial}`,
      `Cargo:           ${c.cargo || 'Sin cargo específico (base de talentos)'}`,
      `Experiencia:     ${c.experienciaRango}`,
      `Mensaje:         ${c.mensaje || '—'}`,
      `Fecha:           ${formatFecha(c.fechaPostulacion)}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Postulacion_${c.nombre}_${c.apellido}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <div>
          <h1 className="text-2xl font-semibold">Candidatos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{candidatos.length} postulaciones en total</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 mb-5 border border-gray-100 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <div className="relative">
          <select
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300 appearance-none"
          >
            <option value="">Todos los cargos</option>
            {cargos.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="__general__">Sin cargo · Base de talentos</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
        {(cargo || busqueda) && (
          <button
            onClick={() => {
              setCargo('');
              setBusqueda('');
            }}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2"
          >
            <X className="w-3 h-3" /> Limpiar
          </button>
        )}
      </div>

      <div className="text-sm text-gray-500 mb-3">
        {filtrados.length} candidato{filtrados.length !== 1 ? 's' : ''}
      </div>

      <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-xs text-gray-500">
                <th className="py-3 px-4 font-medium">Candidato</th>
                <th className="py-3 px-4 font-medium">Cargo postulado</th>
                <th className="py-3 px-4 font-medium">Experiencia</th>
                <th className="py-3 px-4 font-medium">Región</th>
                <th className="py-3 px-4 font-medium">Presencialidad</th>
                <th className="py-3 px-4 font-medium">IA</th>
                <th className="py-3 px-4 font-medium">Fecha</th>
                <th className="py-3 px-4 font-medium text-right sticky right-0 bg-gray-50 border-l border-gray-100">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                    Cargando...
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                    No hay candidatos que coincidan con los filtros
                  </td>
                </tr>
              ) : (
                filtrados.map((c) => (
                  <tr key={c.id} className="group border-b text-sm hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {c.nombre} {c.apellido}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{c.email}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {c.cargo || <span className="text-gray-400 italic">Base de talentos</span>}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{c.experienciaRango}</td>
                    <td className="py-3 px-4 text-gray-600">{c.region}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          c.disponibilidadPresencial?.startsWith('Sí') ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {presencialidadLabel(c.disponibilidadPresencial)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {c.analisisIa ? (
                        <button
                          onClick={() => setSeleccionado(c)}
                          title={`Afinidad ${c.analisisIa.puntaje}/100 — clic para ver el detalle`}
                          className={`text-xs px-2 py-1 rounded-full font-medium hover:opacity-80 transition-opacity ${veredictoBadge(c.analisisIa.veredicto)}`}
                        >
                          {c.analisisIa.veredicto || `Afinidad ${c.analisisIa.puntaje}/100`}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">Sin analizar</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {formatFecha(c.fechaPostulacion)}
                      </span>
                    </td>
                    <td className="py-3 px-4 sticky right-0 bg-white group-hover:bg-gray-50 border-l border-gray-100 transition-colors">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setSeleccionado(c)}
                          className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver
                        </button>
                        <button
                          onClick={() => descargarDatos(c)}
                          className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                          title="Descargar datos"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Datos
                        </button>
                        <button
                          onClick={() => api.descargarCv(c.id, c.cvNombreOriginal)}
                          disabled={!c.cvArchivo}
                          className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg bg-[#0f1b2d] text-white hover:bg-[#1a2f4a] transition-colors disabled:opacity-40 disabled:pointer-events-none"
                          title="Descargar CV"
                        >
                          <Download className="w-3.5 h-3.5" />
                          CV
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {seleccionado && (
        <CandidateModal
          candidate={seleccionado}
          onClose={() => setSeleccionado(null)}
          usuarioActual={usuarioActual}
          onEliminado={cargar}
        />
      )}
    </>
  );
}
