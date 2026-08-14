# SOCIUS — Plataforma de Reclutamiento

Desafío técnico: módulo de reclutamiento con gestión de búsquedas, registro de
candidatos, carga de CV y asociación candidato ↔ búsqueda (o "base de talentos"
cuando no aplica a una vacante específica).

## Stack

- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Frontend**: React (Create React App) + Tailwind CSS + React Router
- **Infra local**: Docker Compose (solo la base de datos)

## Alcance implementado

- CRUD de búsquedas (crear, listar con filtros por posición/práctica/prioridad/estado)
- Dashboard con indicadores (búsquedas activas, en proceso, en entrevistas, total candidatos)
- Registro de candidatos vía formulario público de postulación (`/postular` o `/postular/:cargo`)
- Carga de CV (PDF/DOCX, máx. 5MB) con descarga posterior
- Asociación del candidato a una búsqueda específica o a la "base de talentos" (sin cargo)
- Listado de candidatos con búsqueda por nombre/email y filtro por cargo
- Ficha de detalle del candidato + descarga de datos en texto plano
- Link de postulación copiable por búsqueda

## Supuestos

- No se implementó autenticación: es un panel interno de un solo usuario simulado ("Vera Mila").
- Los catálogos (prácticas, prioridades, estados, regiones, disponibilidad, rangos de experiencia)
  están fijados en el frontend (`frontend/src/catalogos.js`) según lo observado en la maqueta.
- Un candidato queda asociado a **una** búsqueda al postular (o a ninguna = base de talentos).
  El modelo permite extender esto a múltiples postulaciones por candidato a futuro.
- El campo `estado` de una `Postulacion` (Nuevo / En revisión / Entrevista / etc.) está en el
  modelo de datos pero no tiene UI todavía — queda como siguiente paso natural (pipeline tipo kanban).

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
cp .env.example .env      # ya viene con la connection string por defecto
npx prisma migrate dev    # crea las tablas
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

Abrí `http://localhost:3000` para el panel interno, o `http://localhost:3000/postular`
para el formulario público de postulación.

## Estructura

```
backend/
  prisma/schema.prisma   # Busqueda, Candidato, Postulacion
  src/routes/            # /busquedas, /candidatos
  src/index.js           # servidor Express
frontend/
  src/pages/             # AppShell, RecruitmentView, CandidatesView, ApplyPage
  src/components/        # NewSearchModal, CandidateModal, CopyLinkButton
  src/api/client.js       # cliente fetch hacia la API
```

## Siguientes pasos

- Pipeline de estados de postulación (Nuevo → En revisión → Entrevista → Contratado/Rechazado)
- Autenticación y roles (reclutador vs. administrador)
- Edición y cierre de búsquedas desde la UI
- Tests automatizados (backend: rutas con supertest; frontend: componentes con Jest + Testing Library)
- Notificaciones por email al candidato al postular
