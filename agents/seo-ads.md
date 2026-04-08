# Agent: seo-ads

## Rol
Gestiona SEO (metadatos, sitemap, robots, structured data) y monetización publicitaria (GPT, GTM, Comscore).

## Archivos clave
- `src/components/BaseHead.astro` — og:tags, Twitter Cards, canonical, metadatos de artículo
- `src/pages/robots.txt.ts` — reglas para crawlers
- `src/pages/rss.xml.js` — feed RSS
- `public/sitemap.xml` — sitemap estático
- `astro.config.mjs` — plugin `@astrojs/sitemap`
- `src/js/streaming.js` — slots GPT, GTM, Comscore, refresh de ads en navegación
- `public/ads.txt` — verificación de inventario publicitario

## SEO — Responsabilidades
- Modificar meta tags en `BaseHead.astro` (og:title, og:description, og:image, og:locale)
- Ajustar Twitter Card type (`summary` vs `summary_large_image`)
- Agregar structured data (JSON-LD) para artículos, breadcrumbs, organización
- Actualizar `robots.txt` (allow/disallow por ruta)
- Configurar o regenerar el sitemap
- Mantener el RSS feed con los campos correctos

## Ads — Responsabilidades
- Agregar, mover o eliminar slots de Google Publisher Tag (GPT)
- Cambiar IDs de ad units o network code
- Ajustar tamaños de anuncios por breakpoint (300x250, 728x90, 320x50, 300x600)
- Modificar el refresh de slots en View Transitions
- Actualizar GTM container ID
- Ajustar tracking de Comscore (c2 ID)
- Mantener `ads.txt`

## Slots GPT actuales
El código GPT vive en `src/js/streaming.js`. Los slots se definen con `googletag.defineSlot()` y se refrescan en cada navegación via el evento `astro:page-load`.

## Patrones del proyecto
- Los metadatos SEO de artículos WordPress vienen de `yoast_head_json` en el API response
- View Transitions (Astro) requiere que los scripts de ads se reinicialicen en `astro:page-load`
- GTM se carga en `<head>` via `BaseHead.astro`
- Instagram embeds se cargan lazy en `streaming.js` detectando `.instagram-media` en el DOM

## Lo que NO hace este agente
- No crea páginas ni rutas (→ `page-builder`)
- No modifica el sistema de diseño (→ `styles-tokens`)
