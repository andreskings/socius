import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Upload, Check, Calendar, Briefcase } from 'lucide-react';
import { api } from '../api/client';
import { formatFecha, postulacionBadge } from '../catalogos';

export default function CandidatoPortal({ onLoggedOut = () => {} }) {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [postulaciones, setPostulaciones] = useState([]);
  const [busquedas, setBusquedas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subiendoCv, setSubiendoCv] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [devVerificationUrl, setDevVerificationUrl] = useState('');
  const [reenviando, setReenviando] = useState(false);
  const fileRef = useRef(null);

  const cargar = () => {
    Promise.all([api.getMiPerfil(), api.getMisPostulaciones(), api.getBusquedas()])
      .then(([p, post, b]) => {
        setPerfil(p);
        setPostulaciones(post);
        setBusquedas(b);
      })
      .catch(() => navigate('/candidato/login'))
      .finally(() => setLoading(false));
  };

  useEffect(cargar, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await api.logout();
    onLoggedOut();
    navigate('/candidato/login');
  };

  const handleReemplazarCv = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoCv(true);
    setMensaje('');
    try {
      const formData = new FormData();
      formData.append('cv', file);
      const actualizado = await api.reemplazarMiCv(formData);
      setPerfil(actualizado);
      setMensaje('CV actualizado correctamente.');
    } catch (err) {
      setMensaje(err.message);
    } finally {
      setSubiendoCv(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const busquedasIds = new Set(postulaciones.map((p) => p.busquedaId));
  const disponibles = busquedas.filter((b) => b.estado === 'Activa' && !busquedasIds.has(b.id));

  const handleReenviarVerificacion = async () => {
    setReenviando(true);
    setDevVerificationUrl('');
    try {
      const res = await api.reenviarVerificacion();
      if (res.devVerificationUrl) setDevVerificationUrl(res.devVerificationUrl);
    } catch (err) {
      setMensaje(err.message);
    } finally {
      setReenviando(false);
    }
  };

  const handlePostular = async (busquedaId) => {
    setMensaje('');
    try {
      await api.postular(busquedaId);
      cargar();
    } catch (err) {
      setMensaje(err.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center text-sm text-gray-400">Cargando...</div>;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <header className="bg-[#0f1b2d] py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white rounded" />
          <span className="text-white font-semibold text-lg">SOCIUS</span>
        </div>
        <button onClick={handleLogout} className="text-white/60 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </header>

      <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h1 className="text-xl font-semibold text-gray-800">
            {perfil.nombre} {perfil.apellido}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{perfil.email}</p>
          {!perfil.emailVerificado && (
            <div className="bg-orange-50 rounded-lg px-3 py-2.5 mt-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-orange-600">Todavía no verificaste tu correo. No podés postular hasta hacerlo.</p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleReenviarVerificacion}
                    disabled={reenviando}
                    className="text-xs px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors disabled:opacity-60"
                  >
                    {reenviando ? 'Generando...' : 'Reenviar verificación'}
                  </button>
                  {devVerificationUrl && (
                    <a
                      href={devVerificationUrl}
                      title="Modo prueba (sitio aún no desplegado): verificá directo sin ir a tu correo"
                      className="text-xs px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                    >
                      Verificar ahora
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-gray-500">CV:</span>
            {perfil.cvArchivo ? (
              <span className="text-sm text-gray-700">{perfil.cvNombreOriginal}</span>
            ) : (
              <span className="text-sm text-gray-400 italic">Sin CV cargado</span>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={subiendoCv}
              className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-60"
            >
              <Upload className="w-3.5 h-3.5" />
              {subiendoCv ? 'Subiendo...' : perfil.cvArchivo ? 'Reemplazar CV' : 'Subir CV'}
            </button>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleReemplazarCv} />
          </div>
          {mensaje && <p className="text-sm text-gray-600 mt-2">{mensaje}</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Mis postulaciones</h2>
          {postulaciones.length === 0 ? (
            <p className="text-sm text-gray-400">Todavía no postulaste a ninguna búsqueda.</p>
          ) : (
            <div className="space-y-2">
              {postulaciones.map((p) => (
                <div key={p.id} className="flex items-center justify-between border-b last:border-0 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{p.busqueda?.posicion || 'Base de talentos'}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {formatFecha(p.createdAt)}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${postulacionBadge(p.estado)}`}>{p.estado}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {perfil.emailVerificado && disponibles.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Búsquedas abiertas</h2>
            <div className="space-y-2">
              {disponibles.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-4 border-b last:border-0 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-800">{b.posicion}</span>
                    </div>
                    {b.descripcionCarga && (
                      <p className="text-xs text-gray-500 mt-1 ml-6 leading-relaxed">{b.descripcionCarga}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handlePostular(b.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors shrink-0"
                  >
                    Postularme
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
