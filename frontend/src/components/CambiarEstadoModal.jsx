import { useState } from 'react';
import { X, Send } from 'lucide-react';

export default function CambiarEstadoModal({ postulacion, nuevoEstado, onClose, onConfirm }) {
  const esEntrevista = nuevoEstado === 'Entrevista';
  const [fechaEntrevista, setFechaEntrevista] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (esEntrevista && !fechaEntrevista) {
      setError('La fecha y hora de la entrevista son obligatorias');
      return;
    }
    setEnviando(true);
    setError('');
    try {
      await onConfirm({ fechaEntrevista: esEntrevista ? new Date(fechaEntrevista).toISOString() : undefined, mensaje: mensaje || undefined });
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-[#0f1b2d] text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">
              {esEntrevista ? 'Agendar entrevista' : 'Notificar rechazo'}
            </h2>
            <p className="text-xs text-white/50 mt-0.5">
              {postulacion.candidato.nombre} {postulacion.candidato.apellido}
            </p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            Se le va a enviar un correo a <strong>{postulacion.candidato.email}</strong>{' '}
            avisando {esEntrevista ? 'que avanzó a la etapa de entrevista.' : 'que no continúa en este proceso.'}
          </p>

          {esEntrevista && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Fecha y hora de la entrevista <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="datetime-local"
                value={fechaEntrevista}
                onChange={(e) => setFechaEntrevista(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#f0f4f8] border border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {esEntrevista
                ? 'Mensaje (opcional — ej. modalidad, link, entrevistador)'
                : 'Motivo del rechazo (opcional — queda guardado en la pestaña Rechazados)'}
            </label>
            <textarea
              rows={3}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder={esEntrevista ? 'Ej: la entrevista es por videollamada, te llega el link por separado...' : 'Ej: gracias por participar, quedaste en nuestra base de talentos...'}
              className="w-full px-4 py-2.5 bg-[#f0f4f8] border border-transparent rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60 ${
                esEntrevista ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#0f1b2d] hover:bg-[#1a2f4a]'
              }`}
            >
              <Send className="w-4 h-4" />
              {enviando ? 'Enviando...' : 'Confirmar y avisar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
