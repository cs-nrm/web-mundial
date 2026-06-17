# Roadmap: Bot de Eventos en Vivo → Redes Sociales

## Objetivo
Detectar automáticamente goles y medio tiempo en partidos del Mundial 2026 vía DataFactory StatsFeed, generar una imagen con el template de Enfoque Noticias y publicarla en FB, IG y X a través de Metricool.

---

## Decisiones tomadas

| Decisión | Elección |
|---|---|
| Fuente de datos | DataFactory StatsFeed (feed `ficha.idPartido.3`) |
| Zona horaria del feed | `hora_feed - 3h = hora CDMX` |
| Generación de imagen | Código propio (sharp + SVG overlay), templates PNG base de Canva |
| Publicación | Metricool API (no Meta/X developer apps propias) |
| Brand | Enfoque Noticias — blogId `5092714` |
| Redes | Facebook + Instagram + X |
| Ejecución | Proceso Node persistente con pm2 |
| Deduplicación | Tabla Supabase `goal_posts` por `incidenceId` |
| Buffer VAR | Sin espera fija — el feed ya publica el gol confirmado con retraso natural |
| Textos del post | Por definir (se agregarán como config) |

---

## Eventos que el bot detecta

| Status feed | statusId | Acción del bot |
|---|---|---|
| `""` | 0 | No hace nada (partido no iniciado) |
| `"Primer Tiempo"` | 1 | Activa polling rápido (20s) |
| `"Entretiempo"` | 5 | Genera y publica imagen Medio Tiempo |
| `"Segundo Tiempo"` | 6 | Sigue polling rápido |
| `"Finalizado"` | 2 | Detiene polling, cierra ciclo |
| Incidencia `type` contiene `"Gol"` | — | Genera y publica imagen Gol |

---

## Fases

### Fase 1 — Infraestructura base ✅
- [x] Crear tabla Supabase `goal_posts` — SQL dado para ejecución manual
- [x] Crear estructura de carpetas `scripts/goal-bot/`
- [x] `config.js` — constantes, intervalos, tipos de evento
- [x] `db.js` — cliente Supabase, helpers para goal_posts
- [x] Variables de entorno documentadas en `.env.example`

### Fase 2 — Detección de eventos ✅
- [x] `fixture.js` — fetch fixture, detectar partidos en vivo por hora CDMX
- [x] `ficha.js` — parser de `<Status>`, `<Team>`, `<Incidence>` (goles) y `<DeletedIncidences>` (VAR)
- [x] `index.js` — loop principal: idle (2 min) / live (20s), multi-partido simultáneo
- [x] Deduplicación por `incidenceId` contra Supabase antes de guardar

### Fase 3 — Generación de imagen + panel admin ⬜
- [ ] Recibir templates PNG base de Canva → guardar en `public/templates/`
  - `gol.png` — fondo estadio, sin flags ni marcador
  - `medio-tiempo.png` — fondo cancha verde, sin flags ni marcador
- [ ] Resolver URL de banderas por `teamId` / `paisSigla` del feed
- [ ] Composición con sharp: overlay de flags circulares (izq/der), texto de marcador, nombres de equipos
- [ ] Subir imagen generada a Supabase Storage (bucket público) → obtener URL pública

### Fase 4 — Publicación vía Metricool ⬜
- [ ] Definir textos/captions estándar (pendiente de Carlos)
- [ ] Integrar endpoint de Metricool para crear post con imagen URL + texto
- [ ] Publicar a FB + IG + X simultáneamente (`autoPublish: true`)
- [ ] Marcar en Supabase como publicado (`status = publicado`, `platforms = {fb, ig, x}`)
- [ ] Manejo de error por plataforma (reintentar solo la fallida)

### Fase 5 — Despliegue y operación ⬜
- [ ] Script de arranque pm2 (`goal-bot`)
- [ ] Modo sleep inteligente: polling lento (2 min) sin partidos en vivo, rápido (20s) durante partido
- [ ] Logs estructurados a archivo con rotación
- [ ] Alerta por error crítico (email/Slack si el proceso muere)

---

## Pendientes bloqueantes

| Item | Estado |
|---|---|
| Templates PNG base exportados de Canva | ⏳ Carlos los sube a `/public/templates/` |
| Textos/captions para cada evento | ⏳ Carlos los define |
| URL de banderas de selecciones nacionales en DataFactory | 🔍 Por investigar |

---

## Credenciales configuradas

| Credencial | Estado |
|---|---|
| DataFactory password | ✅ |
| Metricool API token | ✅ |
| Metricool userId / blogId | ✅ (`3874738` / `5092714`) |
| Supabase service role key | ✅ (ya en `.env`) |
