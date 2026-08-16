import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { api } from '../api/client';

const inputCls =
  'w-full px-4 py-2.5 bg-[#f0f4f8] border border-transparent rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400';

export default function StaffLogin({ onLoggedIn = () => {} }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const usuario = await api.loginStaff(email, password);
      onLoggedIn(usuario);
      navigate('/');
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
          <p className="text-xs text-white/50 mt-1">Panel de reclutamiento</p>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
            <input
              required
              type="email"
              className={inputCls}
              placeholder="tu@socius.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <Link to="/login/olvide" className="text-xs text-purple-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              required
              type="password"
              className={inputCls}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-60"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
          <p className="text-sm text-center text-gray-500">
            ¿Buscás trabajo?{' '}
            <Link to="/postular" className="text-purple-600 hover:underline">
              Postulá acá
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
