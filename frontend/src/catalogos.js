export const PRACTICAS = [
  'Datos y Desarrollo',
  'Arquitectura + Integración',
  'Infraestructura',
  'Calidad',
  'Gestión de Proyectos',
  'Gestión Comercial',
];

export const PRIORIDADES = ['Alta', 'Media', 'Baja'];

export const ESTADOS_BUSQUEDA = ['Activa', 'En proceso', 'Entrevistas', 'Cerrada'];

export const ESTADOS_POSTULACION = ['Nuevo', 'En revisión', 'Entrevista', 'Contratado', 'Rechazado'];

export const REGIONES = [
  'Región Metropolitana',
  'Valparaíso',
  'Biobío',
  'La Araucanía',
  'Los Lagos',
  'Antofagasta',
  'Coquimbo',
  "O'Higgins",
  'Maule',
  'Aysén',
  'Magallanes',
  'Tarapacá',
  'Arica y Parinacota',
  'Atacama',
  'Los Ríos',
  'Ñuble',
];

export const DISPONIBILIDADES = [
  'Sí, disponibilidad completa',
  'Sí, disponibilidad parcial',
  'No, solo remoto',
];

export const EXPERIENCIAS = [
  'Menos de 1 año',
  '1 – 2 años',
  '3 – 5 años',
  '6 – 10 años',
  'Más de 10 años',
];

export const prioridadBadge = (p) =>
  ({ Alta: 'bg-red-100 text-red-700', Media: 'bg-yellow-100 text-yellow-700', Baja: 'bg-green-100 text-green-700' }[p] ||
  'bg-gray-100 text-gray-600');

export const estadoBadge = (e) =>
  ({
    Activa: 'bg-blue-100 text-blue-700',
    'En proceso': 'bg-purple-100 text-purple-700',
    Entrevistas: 'bg-orange-100 text-orange-700',
    Cerrada: 'bg-gray-100 text-gray-600',
  }[e] || 'bg-gray-100 text-gray-600');

export const postulacionBadge = (e) =>
  ({
    Nuevo: 'bg-blue-100 text-blue-700',
    'En revisión': 'bg-purple-100 text-purple-700',
    Entrevista: 'bg-orange-100 text-orange-700',
    Contratado: 'bg-green-100 text-green-700',
    Rechazado: 'bg-red-100 text-red-700',
  }[e] || 'bg-gray-100 text-gray-600');

export const veredictoBadge = (v) =>
  ({
    'Cumple los requisitos': 'bg-green-100 text-green-700',
    'Cumple parcialmente': 'bg-yellow-100 text-yellow-700',
    'No cumple los requisitos': 'bg-red-100 text-red-700',
  }[v] || 'bg-gray-100 text-gray-600');

export function formatFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CL');
}
