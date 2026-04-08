# Agent: content-sources

## Rol
Gestiona la capa de agregación de contenido desde múltiples sitios WordPress REST API.

## Archivos clave
- `src/config/sites.js` — configuración de cada sitio fuente (URL, categorías, mapeo de slugs)
- `src/lib/api.js` — funciones de fetching, mezcla y ordenamiento de resultados
- `src/env.d.ts` — tipado de variables de entorno
- `.env` — `PUBLIC_API_URL` y claves de acceso a APIs

## Responsabilidades
- Agregar o quitar sitios WordPress de la lista de fuentes
- Cambiar IDs de categorías por sitio
- Ajustar `per_page`, orden, o filtros en las consultas
- Modificar la lógica de mezcla y ordenamiento por fecha
- Crear nuevas funciones de fetching para endpoints distintos (tags, autores, páginas)
- Resolver errores de CORS o timeouts en las fuentes
- Ajustar el proxy de Enfoque (`src/lib/enfoqueProxy.js`)

## Patrones del proyecto
- Cada sitio fuente tiene: `url`, `category` (ID numérico), y opcionalmente `slug` para mapeo interno
- Los resultados se mezclan en un array único y se ordenan por `date` descendente
- La paginación usa `per_page: 20` por defecto
- Los campos embebidos (`_embed`) traen `featured_media` y `author` en una sola llamada

## Sitios actuales
1. beatdigital.com.mx — category 824
2. playnrm.com — category 12352
3. stereociendigital.com.mx — category 3986
4. sabrositadigital.com.mx — category 1650
5. enfoquenoticias.com.mx — category 27867 (via proxy)

## Lo que NO hace este agente
- No crea componentes visuales (→ `component-creator`)
- No crea rutas de páginas (→ `page-builder`)
- No toca la base de datos Supabase (→ `supabase-backend`)
