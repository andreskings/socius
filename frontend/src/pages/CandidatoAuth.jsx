import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Upload, X } from 'lucide-react';
import { api } from '../api/client';
import { REGIONES, DISPONIBILIDADES, EXPERIENCIAS } from '../catalogos';

const inputCls =
  'w-full px-4 py-2.5 bg-[#f0f4f8] border border-transparent rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300';
const selectCls =
  'w-full px-4 py-2.5 bg-[#f0f4f8] border border-transparent rounded-lg text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 appearance-none';

export default function CandidatoAuth({ onLoggedIn = () => {}, modoInicial = 'registro' }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [modo, setModo] = useState(modoInicial); // 'registro' | 'login'
  const [busquedas, setBusquedas] = useState([]);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [region, setRegion] = useState('');
  const [presencial, setPresencial] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargoElegido, setCargoElegido] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [dragging, setDragging] = useState(false);

  const [resultado, setResultado] = useState(null); // { verificado, postulado }
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    api.getBusquedas().then(setBusquedas).catch(() => {});
  }, []);

  const busquedaSeleccionada = slug
    ? busquedas.find((b) => b.posicion.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === slug)
    : null;

  // Si no vino por un link con cargo fijo (slug), el candidato puede elegir uno del dropdown.
  const busquedaElegida = busquedaSeleccionada || busquedas.find((b) => b.id === cargoElegido) || null;

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setCvFile(file);
  };

  const postularSiCorresponde = async (candidato) => {
    if (!busquedaElegida || !candidato.emailVerificado) return false;
    try {
      await api.postular(busquedaElegida.id);
      return true;
    } catch {
      return false;
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('apellido', apellido);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('telefono', telefono);
      formData.append('region', region);
      formData.append('disponibilidadPresencial', presencial);
      formData.append('experienciaRango', experiencia);
      formData.append('mensaje', mensaje);
      if (cvFile) formData.append('cv', cvFile);
      const candidato = await api.registrarCandidato(formData);
      onLoggedIn(candidato);
      const postulado = await postularSiCorresponde(candidato);
      // Si eligió cargo pero todavía no está verificado, la postulación no se pudo
      // crear ahora — se guarda acá para completarla sola apenas verifique el email
      // (ver CandidatoVerificarEmail.jsx), sin que tenga que ir a buscarla al portal.
      if (busquedaElegida && !candidato.emailVerificado) {
        sessionStorage.setItem('socius:postularAlVerificar', busquedaElegida.id);
      }
      setResultado({ verificado: candidato.emailVerificado, postulado, devVerificationUrl: candidato.devVerificationUrl });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      const candidato = await api.loginCandidato(email, password);
      onLoggedIn(candidato);
      const postulado = await postularSiCorresponde(candidato);
      if (busquedaSeleccionada) {
        setResultado({ verificado: candidato.emailVerificado, postulado });
      } else {
        navigate('/candidato/portal');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">
      <header className="bg-[#0f1b2d] py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white rounded" />
          <span className="text-white font-semibold text-lg">SOCIUS</span>
        </div>
        <button onClick={() => navigate('/login')} className="text-white/60 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Acceso interno
        </button>
      </header>

      <div className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-lg overflow-hidden">
          <div className="bg-[#0f1b2d] text-white px-8 py-6">
            <h1 className="text-xl font-semibold">{modo === 'registro' ? 'Crear cuenta de candidato' : 'Iniciar sesión'}</h1>
            <p className="text-sm text-white/60 mt-1">
              {busquedaElegida
                ? `Estás postulando al cargo: ${busquedaElegida.posicion}`
                : 'Necesitás una cuenta para postular y hacer seguimiento de tus postulaciones.'}
            </p>
            {busquedaElegida?.descripcionCarga && (
              <p className="text-sm text-white/50 mt-2 leading-relaxed border-t border-white/10 pt-2">
                {busquedaElegida.descripcionCarga}
              </p>
            )}
          </div>

          {resultado ? (
            <div className="px-8 py-16 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">¡Cuenta creada!</h2>
              {!resultado.verificado ? (
                <>
                  <p className="text-sm text-gray-500 max-w-sm">
                    Te enviamos un correo para verificar tu dirección de email. Tenés que verificarlo antes de que tu
                    postulación quede registrada.
                  </p>
                  {resultado.devVerificationUrl && (
                    <div className="mt-4 max-w-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs text-amber-700 font-medium mb-1.5">
                        Modo desarrollo: no hay envío de email real, verificá con este link
                      </p>
                      <a
                        href={resultado.devVerificationUrl}
                        className="text-xs text-blue-600 hover:underline break-all"
                      >
                        {resultado.devVerificationUrl}
                      </a>
                    </div>
                  )}
                </>
              ) : resultado.postulado ? (
                <p className="text-sm text-gray-500 max-w-sm">Tu postulación fue registrada correctamente.</p>
              ) : (
                <p className="text-sm text-gray-500 max-w-sm">Tu cuenta ya está lista.</p>
              )}
              <button
                onClick={() => navigate('/candidato/portal')}
                className="mt-8 px-6 py-2.5 bg-[#0f1b2d] text-white rounded-xl text-sm hover:bg-[#1a2f4a] transition-colors"
              >
                Ir a mi portal
              </button>
            </div>
          ) : modo === 'login' ? (
            <form onSubmit={handleLogin} className="px-8 py-7 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
                <input required type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <Link to="/candidato/olvide" className="text-xs text-blue-600 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <input required type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-[#0f1b2d] text-white py-3.5 rounded-xl text-sm font-medium hover:bg-[#1a2f4a] transition-colors disabled:opacity-60"
              >
                {enviando ? 'Ingresando...' : 'Ingresar'}
              </button>
              <p className="text-sm text-center text-gray-500">
                ¿No tenés cuenta?{' '}
                <button type="button" onClick={() => setModo('registro')} className="text-blue-600 hover:underline">
                  Registrate
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegistro} className="px-8 py-7 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input required className={inputCls} placeholder="Juan" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input required className={inputCls} placeholder="Pérez" value={apellido} onChange={(e) => setApellido(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <input required type="email" className={inputCls} placeholder="juan@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    minLength={8}
                    type="password"
                    className={inputCls}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
                  <input className={inputCls} placeholder="+56 9 1234 5678" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Región de residencia</label>
                  <div className="relative">
                    <select className={selectCls} value={region} onChange={(e) => setRegion(e.target.value)}>
                      <option value="">Selecciona tu región</option>
                      {REGIONES.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Disponibilidad presencial</label>
                  <div className="relative">
                    <select className={selectCls} value={presencial} onChange={(e) => setPresencial(e.target.value)}>
                      <option value="">¿Puedes asistir presencialmente?</option>
                      {DISPONIBILIDADES.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Años de experiencia</label>
                  <div className="relative">
                    <select className={selectCls} value={experiencia} onChange={(e) => setExperiencia(e.target.value)}>
                      <option value="">Selecciona</option>
                      {EXPERIENCIAS.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {!busquedaSeleccionada && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cargo de interés</label>
                  <div className="relative">
                    <select className={selectCls} value={cargoElegido} onChange={(e) => setCargoElegido(e.target.value)}>
                      <option value="">Sin cargo específico (base de talentos)</option>
                      {busquedas
                        .filter((b) => b.estado === 'Activa')
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.posicion}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {cargoElegido && busquedaElegida?.descripcionCarga && (
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed bg-gray-50 rounded-lg p-2.5">
                      {busquedaElegida.descripcionCarga}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mensaje (opcional)</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#f0f4f8] border border-transparent rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  placeholder="Cuéntanos por qué quieres unirte a SOCIUS..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adjuntar CV (opcional, podés subirlo después)</label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-[#f8fafc] hover:border-blue-300 hover:bg-blue-50/40'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                  />
                  {cvFile ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="font-medium">{cvFile.name}</span>
                      <button
                        type="button"
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCvFile(null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-5 h-5 text-blue-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Arrastra tu CV aquí o haz clic</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, DOCX hasta 5 MB</p>
                    </>
                  )}
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-[#0f1b2d] text-white py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#1a2f4a] transition-colors disabled:opacity-60"
              >
                {enviando ? 'Creando cuenta...' : 'Crear cuenta y continuar'}
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-sm text-center text-gray-500">
                ¿Ya tenés cuenta?{' '}
                <button type="button" onClick={() => setModo('login')} className="text-blue-600 hover:underline">
                  Iniciá sesión
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
