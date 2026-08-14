import { useState } from 'react';
import { X } from 'lucide-react';
import { PRACTICAS, PRIORIDADES } from '../catalogos';

const inputCls =
  'w-full px-4 py-2.5 bg-[#f0f4f8] border border-transparent rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400';
const selectCls =
  'w-full px-4 py-2.5 bg-[#f0f4f8] border border-transparent rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 appearance-none';

export default function NewSearchModal({ onClose, onSave }) {
  const [posicion, setPosicion] = useState('');
  const [practica, setPractica] = useState('');
  const [prioridad, setPrioridad] = useState('Media');
  const [solicitante, setSolicitante] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave({ posicion, practica, prioridad, solicitante, descripcionCarga: descripcion });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="bg-[#1a1f36] text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Nueva Búsqueda</h2>
            <p className="text-xs text-white/50 mt-0.5">Completa los datos para publicar la posición</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Posición <span className="text-red-500">*</span>
            </label>
            <input
              required
              className={inputCls}
              placeholder="Ej. Desarrollador Backend Java"
              value={posicion}
              onChange={(e) => setPosicion(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Práctica <span className="text-red-500">*</span>
              </label>
              <select required className={selectCls} value={practica} onChange={(e) => setPractica(e.target.value)}>
                <option value="">Selecciona</option>
                {PRACTICAS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Prioridad <span className="text-red-500">*</span>
              </label>
              <select className={selectCls} value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
                {PRIORIDADES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Solicitante <span className="text-red-500">*</span>
            </label>
            <input
              required
              className={inputCls}
              placeholder="Nombre del responsable"
              value={solicitante}
              onChange={(e) => setSolicitante(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción del cargo (opcional)</label>
            <textarea
              rows={3}
              className="w-full px-4 py-2.5 bg-[#f0f4f8] border border-transparent rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
              placeholder="Describe los requisitos y responsabilidades..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-60">
              {saving ? 'Creando...' : 'Crear búsqueda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
