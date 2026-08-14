const BASE = '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json') ? res.json() : res.blob();
}

export const api = {
  getBusquedas: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v)));
    return request(`/busquedas${qs.toString() ? `?${qs}` : ''}`);
  },
  createBusqueda: (data) =>
    request('/busquedas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  getCandidatos: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v)));
    return request(`/candidatos${qs.toString() ? `?${qs}` : ''}`);
  },
  createCandidato: (formData) =>
    request('/candidatos', { method: 'POST', body: formData }),
  cvUrl: (id) => `${BASE}/candidatos/${id}/cv`,
};
