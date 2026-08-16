import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { api } from '../api/client';

const inputCls =
  'w-full px-4 py-2.5 bg-[#f0f4f8] border border-transparent rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400';

export default function ResetPassword({ volverA }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('resetToken');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [listo, setListo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.resetPassword(token, password);
      setListo(true);
      setTimeout(() => navigate(volverA), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-lg font-semibold text-gray-800 mb-2">Link inválido</h1>
          <p className="text-sm text-gray-500">
            Pedí un nuevo link desde{' '}
            <Link to={volverA} className="text-purple-600 hover:underline">
              iniciar sesión
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-lg overflow-hidden">
        <div className="bg-[#1a1f36] text-white px-6 py-6 text-center">
          <div className="w-10 h-10 bg-white rounded-lg mx-auto mb-2" />
          <h1 className="text-lg font-semibold">SOCIUS</h1>
          <p className="text-xs text-white/50 mt-1">Nueva contraseña</p>
        </div>
        <div className="px-6 py-6">
          {listo ? (
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Contraseña actualizada. Redirigiendo...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nueva contraseña</label>
                <input
                  required
                  type="password"
                  minLength={8}
                  className={inputCls}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contraseña</label>
                <input
                  required
                  type="password"
                  minLength={8}
                  className={inputCls}
                  placeholder="••••••••"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-60"
              >
                {loading ? 'Guardando...' : 'Restablecer contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
