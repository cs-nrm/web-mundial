# GEO Audit Report: La Fiesta del Fútbol

**Fecha:** 19 de junio de 2026  
**URL:** https://fiestafutbol.com.mx  
**Tipo de sitio:** Publisher deportivo / Media (NRM Comunicaciones)  
**Páginas analizadas:** 41 URLs en sitemap + homepage + /partidos-del-dia/  

---

## Resumen Ejecutivo

**GEO Score Global: 30/100 — CRÍTICO**

El sitio tiene una base técnica sólida (Astro SSR, Cloudflare CDN) y produce contenido deportivo relevante durante el Mundial 2026. Sin embargo, se ha vuelto prácticamente invisible para todos los motores de búsqueda de IA. El problema más grave es un `robots.txt` gestionado por Cloudflare que bloquea explícitamente a GPTBot, ClaudeBot, Google-Extended, CCBot, meta-externalagent y seis crawlers adicionales. Combinado con la ausencia total de schema markup, sin `llms.txt`, sin meta descriptions, y sin Open Graph tags, el sitio es inaccesible para ChatGPT, Claude, Gemini y Perplexity, incluso cuando tiene contenido que respondería directamente preguntas del Mundial 2026. La fortaleza institucional de NRM Comunicaciones (fundada en 1942, #1 en audiencia en el Valle de México) existe pero no está surfaceada en el sitio.

---

## Desglose de Scores

| Categoría | Score | Peso | Ponderado |
|---|---|---|---|
| AI Citability | 21/100 | 25% | 5.25 |
| Brand Authority | 28/100 | 20% | 5.60 |
| Content E-E-A-T | 47/100 | 20% | 9.40 |
| Technical GEO | 41/100 | 15% | 6.15 |
| Schema & Structured Data | 5/100 | 10% | 0.50 |
| Platform Optimization | 29/100 | 10% | 2.90 |
| **GEO Score Global** | | | **29.8/100** |

---

## Problemas Críticos (Atender Inmediatamente)

### 1. robots.txt bloquea TODOS los crawlers de IA

El `robots.txt` gestionado por Cloudflare aplica `Disallow: /` a:

| Crawler | Plataforma que alimenta |
|---|---|
| GPTBot | ChatGPT (entrenamiento) |
| OAI-SearchBot | ChatGPT Browse / búsqueda en tiempo real |
| ClaudeBot | Claude.ai |
| Google-Extended | Gemini, Vertex AI |
| meta-externalagent | Meta AI (WhatsApp, Instagram, Facebook) |
| CCBot | Common Crawl → LLaMA, Mistral, +20 LLMs |
| Bytespider | TikTok AI |
| Amazonbot | Alexa, Amazon AI |
| Applebot-Extended | Apple Intelligence |

**Consecuencia:** Ningún motor de IA puede citar este sitio aunque tenga la respuesta exacta a una consulta del Mundial 2026.

**Fix inmediato en `robots.txt`** — separar "retrieval" (búsqueda en tiempo real) de "training" (entrenamiento de modelos):

```
# ── Crawlers de RECUPERACIÓN: permitidos ──────────────────
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: meta-externalagent
Allow: /

# ── Crawlers de ENTRENAMIENTO: bloqueados ─────────────────
User-agent: CCBot
Disallow: /

User-agent: Amazonbot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: Applebot-Extended
Disallow: /

# ── Todos los demás: permitidos ───────────────────────────
User-agent: *
Allow: /

Sitemap: https://fiestafutbol.com.mx/sitemap.xml
```

**Impacto estimado en el GEO Score:** +15 a +20 puntos.

---

### 2. Cero schema markup en todo el sitio

No se detectó ningún JSON-LD, microdata, ni RDFa en ninguna página analizada. El sitio tiene datos de partidos en tiempo real, artículos editoriales, perfiles de jugadores y estadios — toda esa información es invisible para los sistemas de IA estructurada.

**Schema mínimo requerido (Semana 1):**

```json
<!-- En Layout.astro (<head>) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "NewsMediaOrganization",
      "@id": "https://fiestafutbol.com.mx/#organization",
      "name": "La Fiesta del Fútbol",
      "url": "https://fiestafutbol.com.mx",
      "logo": {
        "@type": "ImageObject",
        "url": "https://fiestafutbol.com.mx/favicon/apple-touch-icon.png"
      },
      "description": "Cobertura completa del Mundial FIFA 2026 en México. Resultados, estadísticas, análisis y minuto a minuto.",
      "publisher": {
        "@type": "Organization",
        "name": "NRM Comunicaciones"
      },
      "areaServed": "MX",
      "sameAs": [
        "https://es.wikipedia.org/wiki/NRM_Comunicaciones",
        "https://www.wikidata.org/wiki/Q6036967",
        "[URL YouTube]",
        "[URL Facebook]",
        "[URL Instagram]",
        "[URL Twitter/X]"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://fiestafutbol.com.mx/#website",
      "url": "https://fiestafutbol.com.mx",
      "name": "La Fiesta del Fútbol",
      "publisher": { "@id": "https://fiestafutbol.com.mx/#organization" },
      "inLanguage": "es-MX"
    }
  ]
}
</script>
```

---

### 3. No existe `/llms.txt`

Retorna 404. Este archivo le dice a los sistemas de IA qué secciones priorizar.

**Crear `/public/llms.txt`:**

```
# La Fiesta del Fútbol

> Cobertura del Mundial FIFA 2026 en México. Resultados en tiempo real,
> estadísticas, análisis editoriales y minuto a minuto. Propiedad de
> NRM Comunicaciones — grupo de radio #1 en el Valle de México desde 1942.

## Resultados y partidos

- [Partidos del día](https://fiestafutbol.com.mx/partidos-del-dia/): Resultados y marcadores en vivo
- [Calendario](https://fiestafutbol.com.mx/partidos-del-dia/): Fixtures completos del Mundial 2026

## Análisis editorial

- [Resumen de análisis](https://fiestafutbol.com.mx/resumen-de-analisis/): Previas y reportes de partidos

## Estadísticas

- [Estadísticas generales](https://fiestafutbol.com.mx/estadisticas-generales/): Stats del torneo
- [Grupos](https://fiestafutbol.com.mx/grupos/): Clasificación por grupo

## Sobre nosotros

- [Acerca de](https://fiestafutbol.com.mx/acerca-de/): NRM Comunicaciones y La Fiesta del Fútbol
```

---

## Problemas de Alta Prioridad (Esta Semana)

### 4. Sin meta descriptions en ninguna página

La homepage y `/partidos-del-dia/` no tienen meta description. Google y las IAs la usan como preview de citación.

**Fix en `Layout.astro`:**
```astro
<!-- Agregar prop description y usarlo -->
<meta name="description" content={description ?? "Cobertura completa del Mundial FIFA 2026: partidos en vivo, estadísticas, análisis y resultados. La Fiesta del Fútbol por NRM Comunicaciones."} />
```

### 5. Sin canonical tags

Ninguna página tiene `<link rel="canonical">`. Riesgo de contenido duplicado.

**Fix en `Layout.astro`:**
```astro
<link rel="canonical" href={Astro.url.href} />
```

### 6. Sin Open Graph ni Twitter Card

Páginas sin OG tags no generan previews enriquecidos cuando las IAs las citan en interfaces web.

```astro
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content="website" />
<meta property="og:url" content={Astro.url.href} />
<meta property="og:image" content="https://fiestafutbol.com.mx/og-default.jpg" />
<meta property="og:locale" content="es_MX" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
```

### 7. Sitemap desactualizado — lastmod estático (Feb 2026)

Las 41 URLs del sitemap muestran `2026-02-11` como fecha de modificación. Los crawlers no recrawlean contenido que parece inactivo. El sitemap tampoco incluye `/partidos-del-dia/` — la página de mayor tráfico del sitio.

### 8. Página `/acerca-de/` retorna 404

Esta página es crítica para E-E-A-T. Sin ella, Google y las IAs no pueden verificar quién publica el sitio.

### 9. No hay bylines de autores con páginas de bio

Todo el contenido aparece bajo "Redacción Deportes" (anónimo). Esto destruye la señal de Expertise para E-E-A-T.

---

## Problemas Medios (Este Mes)

- **Título duplicado en páginas interiores:** "La Fiesta del Fútbol | Partidos del día · La Fiesta del Fútbol" — el nombre de marca aparece dos veces
- **Content-Signal no es un estándar real:** El mecanismo Cloudflare `Content-Signal: search=yes,ai-train=no` no está reconocido por ningún motor de IA; la protección legal es incierta
- **Zero presencia en Reddit:** Perplexity obtiene 46.7% de sus citas de Reddit. Cero menciones de fiestafutbol.com.mx
- **NRM Comunicaciones no menciona fiestafutbol.com.mx en Wikipedia:** El artículo de NRM en Wikipedia existe (Q6036967) pero no enlaza al sitio — agregar esa mención conectaría la entidad a un nodo reconocido por ChatGPT y Gemini
- **No existe IndexNow:** Cada nuevo artículo tarda en llegar al índice de Bing/Copilot
- **Schema SportsEvent ausente en páginas de partidos:** El feed de DataFactory ya tiene todos los datos necesarios para generarlo

---

---

## Fases de Implementación

---

### 🟥 FASE 1 — Abrir Puertas a la IA
**Tiempo estimado: 1-2 horas | Score proyectado: +18-22 pts → ~48-52/100**

Esta fase desbloquea el potencial existente. El sitio ya tiene SSR, ya tiene contenido relevante — solo necesita que las IAs puedan verlo.

| # | Acción | Archivo | Estado |
|---|---|---|---|
| 1.1 | Fix `robots.txt`: allow retrieval bots (GPTBot, ClaudeBot, OAI-SearchBot, Google-Extended) | Cloudflare Dashboard | ⚠️ Manual en Cloudflare |
| 1.2 | Agregar JSON-LD `NewsMediaOrganization` + `WebSite` al layout | `src/layouts/Layout.astro` | ✅ Implementado |
| 1.3 | Crear `/public/llms.txt` | `public/llms.txt` | ✅ Implementado |
| 1.4 | Fix título duplicado en páginas interiores | `src/layouts/Layout.astro` | ✅ Implementado |

> **Nota robots.txt:** El bloqueo está gestionado por Cloudflare (Security → Bots → AI Scrapers). Ve a tu dashboard de Cloudflare → fiestafutbol.com.mx → Security → Bots → deshabilita "Block AI Scrapers" o configura excepciones para GPTBot, ClaudeBot, OAI-SearchBot, Google-Extended.

---

### 🟧 FASE 2 — Schema Estructurado
**Tiempo estimado: 3-4 horas | Score proyectado: +8-10 pts → ~58-62/100**

Hacer que cada partido y cada artículo sea legible por máquinas.

| # | Acción | Archivo | Estado |
|---|---|---|---|
| 2.1 | `SportsEvent` schema en páginas de partidos (datos del feed DataFactory) | `src/pages/partidos-del-dia/[slug].astro` | ✅ Implementado |
| 2.2 | `NewsArticle` + `Person` schema en artículos editoriales | `src/pages/fiesta-futbolera/[slug].astro` | ✅ Implementado |
| 2.3 | Slot `head` en Layout para schema por página + `BreadcrumbList` | `src/layouts/Layout.astro` | ✅ Implementado |
| 2.4 | Agregar `/partidos-del-dia/`, grupos, calendario, estadios al sitemap | `public/sitemap.xml` | ✅ Implementado |

---

### 🟨 FASE 3 — Autoridad Editorial
**Tiempo estimado: 4-6 horas | Score proyectado: +6-8 pts → ~65-70/100**

Hacer visible la autoridad real que NRM Comunicaciones ya tiene.

| # | Acción | Archivo | Estado |
|---|---|---|---|
| 3.1 | Crear página `/sobre-nosotros/` con info de NRM + misión editorial | `src/pages/sobre-nosotros/index.astro` | ✅ Implementado |
| 3.2 | Crear páginas de autor `/autor/[slug]/` con bio y credenciales | `src/pages/autor/[slug].astro` | ⏳ Pendiente |
| 3.3 | Agregar bylines enlazados en artículos | `src/pages/fiesta-futbolera/[slug].astro` | ⏳ Pendiente |
| 3.4 | Editar Wikipedia de NRM para incluir fiestafutbol.com.mx | Wikipedia ES | ⏳ Manual |

---

### 🟩 FASE 4 — Distribución y Señales de Frescura
**Tiempo estimado: 2-3 horas | Score proyectado: +4-5 pts → ~70-75/100**

Maximizar la velocidad de indexación y las señales de contenido activo.

| # | Acción | Archivo | Estado |
|---|---|---|---|
| 4.1 | Sitemap dinámico con `lastmod` real por artículo (actualmente todos Feb 2026) | `astro.config.mjs` | ⏳ Pendiente |
| 4.2 | Implementar IndexNow para Bing | `public/[key].txt` + webhook en build | ⏳ Pendiente |
| 4.3 | Publicar "Estadísticas del Mundial — Semana N" (dato propio citable) | CMS / editorial | ⏳ Editorial |
| 4.4 | Reddit: thread en r/mexico con datos propios del torneo | Reddit | ⏳ Editorial |

---

---

## Score por Plataforma

| Plataforma | Score actual | Bloqueado por |
|---|---|---|
| Google AI Overviews | 28/100 | Sin schema, sin FAQ structure |
| ChatGPT Web Search | 32/100 | GPTBot + posiblemente OAI-SearchBot bloqueados |
| Perplexity AI | 22/100 | Sin Reddit, sitemap stale, sin structured data |
| Google Gemini | 35/100 | Google-Extended bloqueado (training), NRM en Wikipedia ayuda parcialmente |
| Bing Copilot | 28/100 | Sin IndexNow, sin meta descriptions |

---

## Fortalezas a Capitalizar

1. **Astro SSR** — todo el contenido es server-rendered, listo para crawlers de IA en cuanto se desbloqueen
2. **Cloudflare CDN** — velocidad y uptime
3. **NRM Comunicaciones en Wikipedia** (Q6036967) — entidad reconocida por ChatGPT y Gemini; conectarla al sitio via `sameAs` es un win inmediato
4. **Feed DataFactory en tiempo real** — datos de partidos ya disponibles para generar `SportsEvent` schema dinámico
5. **Contenido de partido tipo Canada 6-0 Qatar** — citable (62/100 citability), solo necesita autor, fecha y fuentes
6. **Cobertura durante torneo activo** — ventana de oportunidad única

---

## Apéndice: Páginas Analizadas

| URL | Tipo | Issues principales |
|---|---|---|
| / | Homepage | Sin schema, sin OG, sin meta description, sin canonical |
| /partidos-del-dia/ | Fixtures hub | Sin schema, sin OG, sin meta description, no está en sitemap |
| /fiesta-futbolera/* (41 URLs) | Editorial | Sin NewsArticle schema, lastmod Feb 2026, bylines anónimos |
| /robots.txt | Técnico | 9 AI crawlers bloqueados con Disallow: / |
| /llms.txt | GEO | 404 — no existe |
| /acerca-de/ | E-E-A-T | 404 — no existe |
| /sitemap.xml | Técnico | 41 URLs, todas con lastmod 2026-02-11, /partidos-del-dia/ ausente |
