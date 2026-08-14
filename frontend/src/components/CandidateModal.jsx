import { X, FileText, Download } from 'lucide-react';
import { formatFecha } from '../catalogos';
import { api } from '../api/client';

export default function CandidateModal({ candidate: c, onClose }) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="bg-[#0f1b2d] text-white px-6 py-5 flex items-center justify-between">
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
        <div className="p-6 space-y-3">
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
        </div>
        <div className="border-t px-6 py-4 flex gap-3">
          <button
            onClick={descargarDatos}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Descargar datos
          </button>
          <a
            href={c.cvArchivo ? api.cvUrl(c.id) : undefined}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0f1b2d] text-white rounded-lg text-sm hover:bg-[#1a2f4a] transition-colors ${!c.cvArchivo ? 'opacity-40 pointer-events-none' : ''}`}
          >
            <Download className="w-4 h-4" />
            Descargar CV
          </a>
        </div>
      </div>
    </div>
  );
}
