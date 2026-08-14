const BASE = '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, { credentials: 'include', ...options });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json') ? res.json() : res.blob();
}

const json = (data) => ({ headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });

export const api = {
  // ---- Búsquedas ----
  getBusquedas: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v)));
    return request(`/busquedas${qs.toString() ? `?${qs}` : ''}`);
  },
  createBusqueda: (data) => request('/busquedas', { method: 'POST', ...json(data) }),

  // ---- Candidatos (staff) ----
  getCandidatos: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v)));
    return request(`/candidatos${qs.toString() ? `?${qs}` : ''}`);
  },
  // Descarga el CV vía fetch (no navegación directa): un <a href> que apunte al
  // endpoint de la API pasa por el proxy de desarrollo de CRA, que sólo reenvía
  // peticiones que NO tengan "Accept: text/html" — una navegación de browser sí
  // lo tiene, así que en dev sirve el index.html de la SPA en vez de proxear al
  // backend, dejando una página en blanco. fetch() no tiene ese problema.
  descargarCv: async (id, nombreArchivo) => {
    const blob = await request(`/candidatos/${id}/cv`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo || 'cv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // ---- Perfil propio de candidato ----
  getMiPerfil: () => request('/candidatos/me'),
  actualizarMiPerfil: (data) => request('/candidatos/me', { method: 'PATCH', ...json(data) }),
  reemplazarMiCv: (formData) => request('/candidatos/me/cv', { method: 'PUT', body: formData }),

  // ---- Postulaciones ----
  postular: (busquedaId) => request('/postulaciones', { method: 'POST', ...json({ busquedaId }) }),
  getMisPostulaciones: () => request('/postulaciones/mias'),

  // ---- Auth candidato ----
  registrarCandidato: (formData) => request('/auth/candidato/registro', { method: 'POST', body: formData }),
  loginCandidato: (email, password) => request('/auth/candidato/login', { method: 'POST', ...json({ email, password }) }),
  verificarEmailCandidato: (token) => request('/auth/candidato/verificar-email', { method: 'POST', ...json({ token }) }),

  // ---- Auth staff ----
  loginStaff: (email, password) => request('/auth/staff/login', { method: 'POST', ...json({ email, password }) }),

  // ---- Auth común ----
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),
  forgotPassword: (email, actor) => request('/auth/forgot-password', { method: 'POST', ...json({ email, actor }) }),
  resetPassword: (token, password) => request('/auth/reset-password', { method: 'POST', ...json({ token, password }) }),

  // ---- Usuarios (admin) ----
  getUsuarios: () => request('/usuarios'),
  crearUsuario: (data) => request('/usuarios', { method: 'POST', ...json(data) }),
  actualizarUsuario: (id, data) => request(`/usuarios/${id}`, { method: 'PATCH', ...json(data) }),
  desactivarUsuario: (id) => request(`/usuarios/${id}`, { method: 'DELETE' }),
};
