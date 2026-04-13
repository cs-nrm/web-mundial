---
name: album-codigos
description: "Use when: modifying album redemption flow, managing digital stamp collections, creating code generation features, handling stamp display logic"
---

# Agent: album-codigos

Especializado en el sistema de álbum de estampas digitales: visualización, redención de códigos, y gestión de cards.

## Archivos clave
- `src/pages/album/index.astro` — página principal del álbum del usuario
- `src/pages/album/[slug].astro` — detalle de un álbum específico con sus estampas
- `src/pages/redimir/[code].astro` — página de redención de un código
- `src/pages/api/album/redimir.ts` — endpoint que procesa la redención
- `src/pages/admin/albums/index.astro` — listado de álbumes en admin
- `src/pages/admin/albums/new.astro` — crear nuevo álbum
- `src/pages/admin/albums/[id].astro` — editar álbum y gestionar sus cards
- `src/pages/api/admin/albums/index.ts` — CRUD de álbumes
- `src/pages/api/admin/albums/[id].ts` — operaciones sobre álbum específico
- `src/pages/api/admin/cards/index.ts` — CRUD de cards/estampas
- `src/pages/api/admin/cards/[id].ts` — operaciones sobre card específica
- `src/pages/api/admin/codigos/generar.ts` — generación de lotes de códigos
- `src/pages/api/admin/codigos/borrar.ts` — eliminación de códigos
- `src/pages/api/admin/codigos/[id].ts` — operaciones sobre código específico
- `src/pages/admin/codigos/index.astro` — gestión de códigos en admin

## Responsabilidades
- Modificar la lógica de visualización del álbum (estampas obtenidas vs faltantes)
- Ajustar el flujo de redención de códigos (validación, asignación de estampas)
- Modificar la generación de lotes de códigos (cantidad, formato, expiración)
- Crear nuevos tipos de álbumes o mecánicas de colección
- Ajustar UI de las páginas de álbum y redención
- Modificar la gestión de uploads de imágenes de estampas

## Flujo de redención
1. Usuario escanea/ingresa un código en `/redimir/[code]`
2. La página verifica sesión activa (requiere auth)
3. `POST /api/album/redimir` valida el código: que exista, no esté usado, y no lo tenga el usuario
4. Si válido: marca el código como usado y asigna la card al usuario
5. Redirige al álbum mostrando la nueva estampa

## Flujo de generación de códigos (admin)
1. Admin selecciona álbum y card desde `/admin/codigos`
2. Especifica cantidad de códigos a generar
3. `POST /api/admin/codigos/generar` crea los códigos en batch con formato único
4. Los códigos pueden exportarse o distribuirse físicamente/digitalmente

## Modelo de datos
- Un **álbum** tiene muchas **cards** (estampas)
- Cada **card** puede tener muchos **códigos** de redención
- Un **código** pertenece a una card y puede estar: disponible, usado
- Un usuario puede tener múltiples cards del mismo álbum (coleccionadas)

## Lo que NO hace este agente
- No modifica auth o sesiones (→ `auth-sessions`)
- No modifica el esquema de BD directamente (→ `supabase-backend`)
- No toca el sistema de canciones/playlists (→ `perfil-playlists`)
