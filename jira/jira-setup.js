#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
const path = require('path');

// Cargar .env manualmente (sin dependencias externas)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8')
    .split('\n')
    .forEach((line) => {
      const [key, ...val] = line.trim().split('=');
      if (key && val.length) process.env[key] = val.join('=');
    });
}

const TOKEN = process.env.JIRA_TOKEN;
const EMAIL = 'vicansama123@gmail.com';
const BASE_URL = 'vicansama123.atlassian.net';
const PROJECT_KEY = 'SOC';

if (!TOKEN) {
  console.error('❌ Falta JIRA_TOKEN en el archivo .env');
  process.exit(1);
}

const AUTH = Buffer.from(`${EMAIL}:${TOKEN}`).toString('base64');

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: BASE_URL,
      path,
      method,
      headers: {
        Authorization: `Basic ${AUTH}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(data && { 'Content-Length': Buffer.byteLength(data) }),
      },
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
          } else {
            resolve(parsed);
          }
        } catch {
          resolve(raw);
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const ESTRUCTURA = [
  {
    epic: 'Setup & Arquitectura',
    sprint: 1,
    stories: [
      'Crear repositorio Git y estructura del proyecto',
      'Configurar backend (Express + Prisma + PostgreSQL)',
      'Configurar frontend (React + Create React App + Tailwind)',
      'Definir schema Prisma y correr migración inicial',
    ],
  },
  {
    epic: 'Búsquedas',
    sprint: 1,
    stories: [
      'API: GET /busquedas con filtros',
      'API: POST /busquedas (crear)',
      'UI: Listado de búsquedas con filtros',
      'UI: Formulario crear búsqueda',
    ],
  },
  {
    epic: 'Candidatos',
    sprint: 1,
    stories: [
      'API: GET /candidatos',
      'API: POST /candidatos (crear + subir CV)',
      'UI: Listado de candidatos',
      'UI: Formulario registro de candidato + CV',
      'UI: Ficha/modal detalle del candidato',
    ],
  },
  {
    epic: 'Postulaciones & CV',
    sprint: 2,
    stories: [
      'Lógica de asociar candidato a búsqueda o Base de Talentos',
      'Descarga de CV desde la ficha',
    ],
  },
  {
    epic: 'Presentación',
    sprint: 2,
    stories: [
      'README con instrucciones de ejecución',
      'Preparar demo y supuestos técnicos',
    ],
  },
];

async function createEpic(name) {
  return request('POST', '/rest/api/3/issue', {
    fields: {
      project: { key: PROJECT_KEY },
      summary: name,
      issuetype: { name: 'Epic' },
    },
  });
}

async function createStory(summary, epicKey) {
  return request('POST', '/rest/api/3/issue', {
    fields: {
      project: { key: PROJECT_KEY },
      summary,
      issuetype: { name: 'Story' },
      parent: { key: epicKey },
    },
  });
}

async function getBoardId() {
  const res = await request('GET', `/rest/agile/1.0/board?projectKeyOrId=${PROJECT_KEY}`);
  if (!res.values || res.values.length === 0) throw new Error('No se encontró board para el proyecto');
  return res.values[0].id;
}

async function createSprint(boardId, name, startDate, endDate) {
  return request('POST', '/rest/agile/1.0/sprint', {
    name,
    originBoardId: boardId,
    startDate,
    endDate,
  });
}

async function addIssuesToSprint(sprintId, issueKeys) {
  return request('POST', `/rest/agile/1.0/sprint/${sprintId}/issue`, {
    issues: issueKeys,
  });
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0] + 'T00:00:00.000Z';
}

async function main() {
  console.log('🚀 Configurando proyecto SOCIUS en Jira...\n');

  const today = new Date().toISOString().split('T')[0] + 'T00:00:00.000Z';
  const sprint1End = addDays(today, 7);
  const sprint2Start = addDays(today, 8);
  const sprint2End = addDays(today, 15);

  console.log('📅 Obteniendo board...');
  const boardId = await getBoardId();

  console.log('📅 Creando Sprint 1 (semana 1)...');
  const sprint1 = await createSprint(boardId, 'Sprint 1 - Backend + UI', today, sprint1End);

  console.log('📅 Creando Sprint 2 (semana 2)...');
  const sprint2 = await createSprint(boardId, 'Sprint 2 - Postulaciones', sprint2Start, sprint2End);
  console.log('');

  const sprint1Issues = [];
  const sprint2Issues = [];

  for (const grupo of ESTRUCTURA) {
    console.log(`📁 Épica: ${grupo.epic}`);
    const epic = await createEpic(grupo.epic);
    console.log(`   ✅ ${epic.key}`);

    for (const storySummary of grupo.stories) {
      const story = await createStory(storySummary, epic.key);
      console.log(`   📝 ${story.key} — ${storySummary}`);
      if (grupo.sprint === 1) sprint1Issues.push(story.key);
      else sprint2Issues.push(story.key);
    }
    console.log('');
  }

  if (sprint1Issues.length > 0) {
    await addIssuesToSprint(sprint1.id, sprint1Issues);
    console.log(`✅ ${sprint1Issues.length} historias asignadas al Sprint 1`);
  }

  if (sprint2Issues.length > 0) {
    await addIssuesToSprint(sprint2.id, sprint2Issues);
    console.log(`✅ ${sprint2Issues.length} historias asignadas al Sprint 2`);
  }

  console.log('\n🎉 ¡Listo! Abrí tu Jira:');
  console.log(`   https://vicansama123.atlassian.net/jira/software/projects/${PROJECT_KEY}/boards`);
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
