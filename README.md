# SOCIUS — Plataforma de Reclutamiento

Desafío técnico: módulo de reclutamiento con gestión de búsquedas, registro de
candidatos, carga de CV y asociación candidato ↔ búsqueda (o "base de talentos"
cuando no aplica a una vacante específica). Incluye autenticación y roles
(Administrador, Reclutador, Candidato), pipeline de postulaciones y sugerencias
de cargo con IA (Groq).

## Stack

- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Auth**: JWT en cookie httpOnly + bcrypt, RBAC por rol, rate limiting, Helmet
- **IA**: Groq (Llama 3.3) para sugerir a qué búsqueda encaja mejor un CV
- **Frontend**: React (Create React App) + Tailwind CSS + React Router
- **Infra local**: Docker Compose (solo la base de datos)

## Alcance implementado

- CRUD de búsquedas (crear, listar con filtros, eliminar) y de candidatos (listar,
  eliminar solo ADMIN)
- Dashboard con indicadores (búsquedas activas, en proceso, en entrevistas, total candidatos)
- Carga de CV (PDF/DOCX, máx. 5MB, validado por contenido real del archivo) con descarga posterior
- Asociación del candidato a una búsqueda específica o a la "base de talentos" (sin cargo)
- Listado de candidatos con búsqueda por nombre/email y filtro por cargo
- Ficha de detalle del candidato + descarga de datos en texto plano
- Link de postulación copiable por búsqueda
- **Pipeline de postulaciones**: tablero kanban (Nuevo → En revisión → Entrevista →
  Contratado/Rechazado) para que Admin/Reclutador muevan candidatos entre estados
- **Filtro ATS con IA**: desde la ficha de un candidato, botón "Analizar con IA" —
  extrae el texto del CV (PDF/DOCX) y le pide a Groq que lo compare punto por punto
  contra los requisitos de la búsqueda activa a la que mejor encaja (no solo la
  categoría — usa la descripción de "qué se busca" cargada al crear la oferta).
  Devuelve un veredicto (Cumple los requisitos / Cumple parcialmente / No cumple),
  un puntaje de afinidad (0-100) y un resumen de qué coincide y qué falta. Es una
  **sugerencia para que el staff revise, nunca una decisión automática** — ver el
  razonamiento completo en `Desktop/socius-docs/04-roles-permisos-login-candidatos.md`
  sobre por qué el scoring de CV no debe ser un filtro automático
- **Roles y login** (Administrador / Reclutador / Candidato) — ver
  `Desktop/socius-docs/04-roles-permisos-login-candidatos.md` para la justificación
  técnica completa:
  - Candidato: cuenta propia con verificación de email, perfil, reemplazo de CV
    (1 CV activo, el anterior se borra del servidor), postularse a búsquedas abiertas,
    ver el estado de sus propias postulaciones
  - Reclutador: dashboard, búsquedas, candidatos, pipeline
  - Administrador: todo lo de Reclutador + CRUD de usuarios internos + eliminar candidatos
  - Protecciones de backend: RBAC en cada endpoint, ownership contra IDOR,
    rate limiting en login/registro, cabeceras de seguridad (Helmet), CORS
    restringido al origin del frontend, validación de archivos por magic bytes

## Supuestos

- Los catálogos (prácticas, prioridades, estados, regiones, disponibilidad, rangos de experiencia)
  están fijados en el frontend (`frontend/src/catalogos.js`) según lo observado en la maqueta.
- Un candidato queda asociado a **una** postulación por búsqueda (o a ninguna = base de talentos).
- La verificación de correo y el reset de contraseña generan un token real (con
  expiración y un solo uso) y se envían por email de verdad vía la API de Brevo.
  Si `BREVO_API_KEY`/`MAIL_FROM` no están configurados (o el envío falla), cae a
  mostrar el link directo en pantalla (modo desarrollo) además de loguearlo en la
  consola del backend.
- El análisis de IA es una sugerencia de afinidad, no una evaluación objetiva de
  "calidad" del candidato — la responsabilidad de decidir sigue siendo del reclutador.

## Cómo ejecutar

### 1. Base de datos

Con Docker Desktop abierto:

```bash
docker compose up -d
```

Esto levanta Postgres en `localhost:5432` (usuario/clave/db: `socius`).

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # completa JWT_SECRET, ADMIN_SEED_*, GROQ_API_KEY y BREVO_API_KEY con tus propios valores
npx prisma migrate dev    # crea las tablas
npm run seed               # crea el primer usuario ADMIN (según ADMIN_SEED_* en .env)
npm run dev                # http://localhost:4000
```

`GROQ_API_KEY` es gratis en https://console.groq.com/keys. Sin ella, todo el resto
de la app funciona igual — solo falla el botón "Analizar con IA" con un mensaje claro.

`BREVO_API_KEY` es gratis en https://app.brevo.com/settings/keys/api (300 correos/día).
`MAIL_FROM` debe ser un correo verificado como remitente en Brevo. Sin estas dos
variables, la app funciona igual pero en modo desarrollo: los links de verificación
y reset de contraseña se muestran en pantalla en vez de mandarse por correo.

### 3. Frontend

```bash
cd frontend
npm install
npm start                  # http://localhost:3000
```

El frontend proxea las peticiones no reconocidas hacia `http://localhost:4000`
(campo `proxy` en `frontend/package.json`, provisto por Create React App).

- `http://localhost:3000/login` — acceso interno (Administrador / Reclutador)
- `http://localhost:3000/postular` o `/postular/:cargo` — registro/login de candidato y postulación
- `http://localhost:3000/candidato/portal` — portal del candidato (perfil, CV, mis postulaciones)

La verificación de email y la recuperación de contraseña se envían por correo real
(vía Brevo). Sin `BREVO_API_KEY`/`MAIL_FROM` configurados, cae al modo desarrollo:
el link se muestra directo en pantalla además de imprimirse en la consola donde
corre `npm run dev` del backend.

## Estructura

```
backend/
  prisma/schema.prisma       # Busqueda, Candidato, Postulacion, Usuario, VerificationToken
  prisma/seed.js              # crea el primer usuario ADMIN
  src/routes/                 # /auth, /usuarios, /postulaciones, /busquedas, /candidatos
  src/middleware/              # authenticate.js, authorize.js (RBAC + ownership)
  src/lib/                     # auth.js, fileValidation.js, logger.js, upload.js,
                                # extractText.js (PDF/DOCX), groq.js (sugerencia IA), selects.js
  src/index.js                 # servidor Express (helmet, cors, cookie-parser)
frontend/
  src/pages/                   # AppShell, RecruitmentView, CandidatesView, PipelineView,
                                # StaffLogin, CandidatoAuth, CandidatoPortal,
                                # CandidatoVerificarEmail, UsuariosView
  src/components/               # NewSearchModal, CandidateModal (con sugerencia IA), CopyLinkButton
  src/api/client.js              # cliente fetch hacia la API (credentials: include)
```

## Siguientes pasos

- Edición y cierre de búsquedas desde la UI (hoy solo se pueden crear y eliminar)
- Tests automatizados (backend: rutas con supertest; frontend: componentes con Jest + Testing Library)
- CAPTCHA, MFA para staff — documentado como diferido en
  `Desktop/socius-docs/04-roles-permisos-login-candidatos.md` por requerir servicios externos
