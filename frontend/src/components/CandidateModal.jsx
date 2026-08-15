import { useState } from 'react';
import { X, FileText, Download, Sparkles, RefreshCw, Trash2 } from 'lucide-react';
import { formatFecha, veredictoBadge } from '../catalogos';
import { api } from '../api/client';

export default function CandidateModal({ candidate: c, onClose, usuarioActual, onEliminado }) {
  const [analisis, setAnalisis] = useState(c.analisisIa ?? null);
  const [analizando, setAnalizando] = useState(false);
  const [errorAnalisis, setErrorAnalisis] = useState('');
  const [eliminando, setEliminando] = useState(false);

  const rows = [
    ['Email', c.email],
    ['Teléfono', c.telefono],
    ['Región', c.region],
    ['Disponibilidad presencial', c.disponibilidadPresencial],
    ['Experiencia', c.experienciaRango],
    ['Fecha de postulación', formatFecha(c.fechaPostulacion)],
  ];

  const descargarDatos = () => {
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

  const eliminarCandidato = async () => {
    if (!window.confirm(`¿Eliminar a ${c.nombre} ${c.apellido}? Esta acción no se puede deshacer.`)) return;
    setEliminando(true);
    try {
      await api.eliminarCandidato(c.id);
      onEliminado?.(c.id);
      onClose();
    } catch (err) {
      window.alert(err.message);
      setEliminando(false);
    }
  };

  const analizarConIA = async () => {
    setAnalizando(true);
    setErrorAnalisis('');
    try {
      const actualizado = await api.analizarCvIA(c.id);
      setAnalisis(actualizado.analisisIa);
    } catch (err) {
      setErrorAnalisis(err.message);
    } finally {
      setAnalizando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-[#0f1b2d] text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold">
              {c.nombre} {c.apellido}
            </h2>
            <p className="text-xs text-white/50 mt-0.5">{c.cargo || 'Sin cargo específico · Base de talentos'}</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-3 overflow-y-auto">
          {rows.map(([label, value]) => (
            <div key={label} className="flex gap-3">
              <span className="text-xs text-gray-400 w-40 shrink-0 pt-0.5">{label}</span>
              <span className="text-sm text-gray-800">{value || '—'}</span>
            </div>
          ))}
          {c.mensaje && (
            <div className="flex gap-3">
              <span className="text-xs text-gray-400 w-40 shrink-0 pt-0.5">Mensaje</span>
              <span className="text-sm text-gray-700 italic leading-relaxed">{c.mensaje}</span>
            </div>
          )}

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mt-3 mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                Sugerencia de IA
              </span>
              {analisis && (
                <button
                  onClick={analizarConIA}
                  disabled={analizando}
                  className="flex items-center gap-1 text-xs text-purple-600 hover:underline disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${analizando ? 'animate-spin' : ''}`} />
                  Reanalizar
                </button>
              )}
            </div>

            {!c.cvArchivo ? (
              <p className="text-xs text-gray-400">Este candidato no tiene CV cargado.</p>
            ) : !analisis ? (
              <button
                onClick={analizarConIA}
                disabled={analizando}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-purple-200 bg-purple-50 text-purple-700 rounded-lg text-sm hover:bg-purple-100 transition-colors disabled:opacity-60"
              >
                <Sparkles className="w-4 h-4" />
                {analizando ? 'Analizando...' : 'Analizar con IA'}
              </button>
            ) : (
              <div className="bg-purple-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-800">
                    {analisis.cargoSugerido || 'Ninguna búsqueda encaja bien'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {analisis.veredicto && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${veredictoBadge(analisis.veredicto)}`}>
                        {analisis.veredicto}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-purple-700 bg-white px-2 py-0.5 rounded-full border border-purple-200">
                      Afinidad {analisis.puntaje}/100
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{analisis.resumen}</p>
                <p className="text-[11px] text-gray-400">
                  Sugerencia generada el {formatFecha(analisis.fecha)} — revisar antes de decidir, no es automático.
                </p>
              </div>
            )}
            {errorAnalisis && <p className="text-xs text-red-600 mt-2">{errorAnalisis}</p>}
          </div>
        </div>
        <div className="border-t px-6 py-4 flex flex-col gap-3 shrink-0">
          <div className="flex gap-3">
            <button
              onClick={descargarDatos}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Descargar datos
            </button>
            <button
              onClick={() => api.descargarCv(c.id, c.cvNombreOriginal)}
              disabled={!c.cvArchivo}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0f1b2d] text-white rounded-lg text-sm hover:bg-[#1a2f4a] transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <Download className="w-4 h-4" />
              Descargar CV
            </button>
          </div>
          {usuarioActual?.rol === 'ADMIN' && (
            <button
              onClick={eliminarCandidato}
              disabled={eliminando}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {eliminando ? 'Eliminando...' : 'Eliminar candidato'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
