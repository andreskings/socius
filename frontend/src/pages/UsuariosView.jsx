import { useEffect, useState } from 'react';
import { ArrowLeft, UserPlus, Power } from 'lucide-react';
import { api } from '../api/client';
import { formatFecha } from '../catalogos';

const inputCls =
  'w-full px-4 py-2.5 bg-[#f0f4f8] border border-transparent rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400';
const selectCls =
  'w-full px-4 py-2.5 bg-[#f0f4f8] border border-transparent rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400';

export default function UsuariosView({ usuarioActual, onBack }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('RECLUTADOR');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const cargar = () => {
    setLoading(true);
    api.getUsuarios().then(setUsuarios).finally(() => setLoading(false));
  };

  useEffect(cargar, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.crearUsuario({ nombre, email, password, rol });
      setNombre('');
      setEmail('');
      setPassword('');
      setRol('RECLUTADOR');
      setShowForm(false);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActivo = async (u) => {
    if (u.activo) {
      await api.desactivarUsuario(u.id);
    } else {
      await api.actualizarUsuario(u.id, { activo: true });
    }
    cargar();
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
            <h1 className="text-2xl font-semibold">Usuarios</h1>
            <p className="text-sm text-gray-500 mt-1">Cuentas de administradores y reclutadores</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-purple-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo usuario
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-5 mb-5 border border-gray-100 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
            <input required className={inputCls} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo</label>
            <input required type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
            <input required minLength={8} type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Rol</label>
            <select className={selectCls} value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="RECLUTADOR">Reclutador</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
          <div className="col-span-2 flex justify-end">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors disabled:opacity-60">
              {saving ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-xs text-gray-500">
              <th className="py-3 px-4 font-medium">Nombre</th>
              <th className="py-3 px-4 font-medium">Correo</th>
              <th className="py-3 px-4 font-medium">Rol</th>
              <th className="py-3 px-4 font-medium">Estado</th>
              <th className="py-3 px-4 font-medium">Creado</th>
              <th className="py-3 px-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-gray-400">Cargando...</td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id} className="border-b text-sm hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-800">{u.nombre}</td>
                  <td className="py-3 px-4 text-gray-500">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${u.rol === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.rol === 'ADMIN' ? 'Administrador' : 'Reclutador'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${u.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.activo ? 'Activo' : 'Desactivado'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{formatFecha(u.createdAt)}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toggleActivo(u)}
                      disabled={u.id === usuarioActual?.id}
                      title={u.id === usuarioActual?.id ? 'No podés desactivar tu propia cuenta' : u.activo ? 'Desactivar' : 'Reactivar'}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Power className="w-3.5 h-3.5" />
                      {u.activo ? 'Desactivar' : 'Reactivar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
