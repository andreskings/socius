# SOCIUS — Plataforma de Reclutamiento

Desafío técnico: módulo de reclutamiento con gestión de búsquedas, registro de
candidatos, carga de CV y asociación candidato ↔ búsqueda (o "base de talentos"
cuando no aplica a una vacante específica). Incluye autenticación y roles
(Administrador, Reclutador, Candidato).

## Stack

- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Auth**: JWT en cookie httpOnly + bcrypt, RBAC por rol, rate limiting, Helmet
- **Frontend**: React (Create React App) + Tailwind CSS + React Router
- **Infra local**: Docker Compose (solo la base de datos)

## Alcance implementado

- CRUD de búsquedas (crear, listar con filtros por posición/práctica/prioridad/estado)
- Dashboard con indicadores (búsquedas activas, en proceso, en entrevistas, total candidatos)
- Carga de CV (PDF/DOCX, máx. 5MB, validado por contenido real del archivo) con descarga posterior
- Asociación del candidato a una búsqueda específica o a la "base de talentos" (sin cargo)
- Listado de candidatos con búsqueda por nombre/email y filtro por cargo
- Ficha de detalle del candidato + descarga de datos en texto plano
- Link de postulación copiable por búsqueda
- **Roles y login** (Administrador / Reclutador / Candidato) — ver
  `Desktop/socius-docs/04-roles-permisos-login-candidatos.md` para la justificación
  técnica completa:
  - Candidato: cuenta propia con verificación de email, perfil, reemplazo de CV
    (1 CV activo, el anterior se borra del servidor), postularse a búsquedas abiertas,
    ver el estado de sus propias postulaciones
  - Reclutador: dashboard, listado de búsquedas y candidatos, crear búsquedas
  - Administrador: todo lo de Reclutador + CRUD de usuarios internos
  - Protecciones de backend: RBAC en cada endpoint, ownership contra IDOR,
    rate limiting en login/registro, cabeceras de seguridad (Helmet), CORS
    restringido al origin del frontend, validación de archivos por magic bytes

## Supuestos

- Los catálogos (prácticas, prioridades, estados, regiones, disponibilidad, rangos de experiencia)
  están fijados en el frontend (`frontend/src/catalogos.js`) según lo observado en la maqueta.
- Un candidato queda asociado a **una** postulación por búsqueda (o a ninguna = base de talentos).
  El modelo permite extender esto a múltiples postulaciones por candidato a futuro.
- El campo `estado` de una `Postulacion` (Nuevo / En revisión / Entrevista / etc.) está en el
  modelo de datos y ya tiene RBAC/permisos definidos, pero todavía no tiene UI de pipeline
  (kanban) para que un reclutador lo cambie — queda como siguiente paso.
- No hay envío real de email: la verificación de correo y el reset de contraseña generan un
  token real (con expiración y un solo uso) pero el "envío" es un log en la consola del backend,
  no un correo real, porque no hay SMTP configurado en este entorno local.

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
cp .env.example .env      # completa JWT_SECRET y ADMIN_SEED_* con tus propios valores
npx prisma migrate dev    # crea las tablas
npm run seed               # crea el primer usuario ADMIN (según ADMIN_SEED_* en .env)
npm run dev                # http://localhost:4000
```

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

Los links de verificación de email y de recuperación de contraseña se imprimen en la
consola donde corre `npm run dev` del backend (ver "Supuestos").

## Estructura

```
backend/
  prisma/schema.prisma       # Busqueda, Candidato, Postulacion, Usuario, VerificationToken
  prisma/seed.js              # crea el primer usuario ADMIN
  src/routes/                 # /auth, /usuarios, /postulaciones, /busquedas, /candidatos
  src/middleware/              # authenticate.js, authorize.js (RBAC + ownership)
  src/lib/                     # auth.js, fileValidation.js, logger.js, upload.js
  src/index.js                 # servidor Express (helmet, cors, cookie-parser)
frontend/
  src/pages/                   # AppShell, RecruitmentView, CandidatesView,
                                # StaffLogin, CandidatoAuth, CandidatoPortal,
                                # CandidatoVerificarEmail, UsuariosView
  src/components/               # NewSearchModal, CandidateModal, CopyLinkButton
  src/api/client.js              # cliente fetch hacia la API (credentials: include)
```

## Siguientes pasos

- Pipeline de estados de postulación (Nuevo → En revisión → Entrevista → Contratado/Rechazado)
- Edición y cierre de búsquedas desde la UI
- Tests automatizados (backend: rutas con supertest; frontend: componentes con Jest + Testing Library)
- Envío real de email (SMTP), CAPTCHA, MFA para staff — documentado como diferido en
  `Desktop/socius-docs/04-roles-permisos-login-candidatos.md` por requerir servicios externos
