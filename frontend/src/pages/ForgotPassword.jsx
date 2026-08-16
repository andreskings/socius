import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { api } from '../api/client';

const inputCls =
  'w-full px-4 py-2.5 bg-[#f0f4f8] border border-transparent rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400';

export default function ForgotPassword({ actor, volverA }) {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.forgotPassword(email, actor);
      setEnviado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-lg overflow-hidden">
        <div className="bg-[#1a1f36] text-white px-6 py-6 text-center">
          <div className="w-10 h-10 bg-white rounded-lg mx-auto mb-2" />
          <h1 className="text-lg font-semibold">SOCIUS</h1>
          <p className="text-xs text-white/50 mt-1">Recuperar contraseña</p>
        </div>
        <div className="px-6 py-6">
          {enviado ? (
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">
                Si <strong>{email}</strong> tiene una cuenta, te enviamos instrucciones para restablecer tu contraseña.
              </p>
              <Link to={volverA} className="inline-block text-sm text-purple-600 hover:underline">
                Volver a iniciar sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-500">Ingresá tu correo y te mandamos un link para restablecer tu contraseña.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
                <input
                  required
                  type="email"
                  className={inputCls}
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-60"
              >
                {loading ? 'Enviando...' : 'Enviar instrucciones'}
              </button>
              <Link to={volverA} className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver a iniciar sesión
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
