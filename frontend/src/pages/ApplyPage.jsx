import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Upload, X } from 'lucide-react';
import { api } from '../api/client';
import { REGIONES, DISPONIBILIDADES, EXPERIENCIAS } from '../catalogos';

const inputCls =
  'w-full px-4 py-2.5 bg-[#f0f4f8] border border-transparent rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300';
const selectCls =
  'w-full px-4 py-2.5 bg-[#f0f4f8] border border-transparent rounded-lg text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 appearance-none';

export default function ApplyPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [busquedas, setBusquedas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [region, setRegion] = useState('');
  const [presencial, setPresencial] = useState('');
  const [cargo, setCargo] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    api.getBusquedas().then((data) => {
      setBusquedas(data);
      if (slug) {
        const match = data.find((b) => b.posicion.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === slug);
        if (match) setCargo(match.posicion);
      }
    });
  }, [slug]);

  const posicionPreseleccionada = busquedas.find((b) => b.posicion === cargo)?.posicion;

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setCvFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      const busquedaId = busquedas.find((b) => b.posicion === cargo)?.id ?? '';
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('apellido', apellido);
      formData.append('email', email);
      formData.append('telefono', telefono);
      formData.append('region', region);
      formData.append('disponibilidadPresencial', presencial);
      formData.append('experienciaRango', experiencia);
      formData.append('mensaje', mensaje);
      formData.append('busquedaId', busquedaId);
      if (cvFile) formData.append('cv', cvFile);
      await api.createCandidato(formData);
      setEnviado(true);
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
        <button onClick={() => navigate('/')} className="text-white/60 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al panel
        </button>
      </header>

      <div className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-lg overflow-hidden">
          <div className="bg-[#0f1b2d] text-white px-8 py-6">
            <h1 className="text-xl font-semibold">Formulario de Postulación</h1>
            <p className="text-sm text-white/60 mt-1">
              {posicionPreseleccionada ? `Estás postulando al cargo: ${posicionPreseleccionada}` : 'Completa tus datos y adjunta tu CV. Puedes postular sin seleccionar un cargo específico.'}
            </p>
          </div>

          {enviado ? (
            <div className="px-8 py-16 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">¡Postulación enviada!</h2>
              <p className="text-sm text-gray-500 max-w-sm">Hemos recibido tu información. Nuestro equipo se pondrá en contacto contigo a la brevedad.</p>
              <button onClick={() => navigate('/')} className="mt-8 px-6 py-2.5 bg-[#0f1b2d] text-white rounded-xl text-sm hover:bg-[#1a2f4a] transition-colors">
                Volver al inicio
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
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
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input required className={inputCls} placeholder="+56 9 1234 5678" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Región de residencia <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select required className={selectCls} value={region} onChange={(e) => setRegion(e.target.value)}>
                      <option value="">Selecciona tu región</option>
                      {REGIONES.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Disponibilidad presencial <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select required className={selectCls} value={presencial} onChange={(e) => setPresencial(e.target.value)}>
                      <option value="">¿Puedes asistir presencialmente?</option>
                      {DISPONIBILIDADES.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cargo de interés</label>
                  <div className="relative">
                    <select className={selectCls} value={cargo} onChange={(e) => setCargo(e.target.value)}>
                      <option value="">Selecciona un cargo (opcional)</option>
                      {busquedas.map((b) => (
                        <option key={b.id} value={b.posicion}>
                          {b.posicion}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Años de experiencia <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select required className={selectCls} value={experiencia} onChange={(e) => setExperiencia(e.target.value)}>
                      <option value="">Selecciona</option>
                      {EXPERIENCIAS.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Adjuntar CV <span className="text-red-500">*</span>
                </label>
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
                {enviando ? 'Enviando...' : 'Enviar mi postulación'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
