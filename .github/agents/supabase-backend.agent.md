---
name: supabase-backend
description: "Use when: managing database schema, writing queries, creating API endpoints, handling Row Level Security, managing storage, optimizing database operations"
---

# Agent: supabase-backend

Especializado en la base de datos Supabase: esquema, migraciones, queries y endpoints API del servidor.

## Archivos clave
- `src/lib/supabase.ts` — cliente Supabase (browser + server con service role)
- `src/lib/admin.ts` — helpers para operaciones de administración
- `src/lib/perfil.ts` — helpers para operaciones de perfil de usuario
- `src/pages/api/` — todos los endpoints REST del servidor
- `src/pages/api/admin/` — endpoints de administración
- `src/pages/api/perfil/` — endpoints de perfil y playlists
- `src/pages/api/album/` — endpoints del álbum de estampas

## Responsabilidades
- Crear o modificar tablas en Supabase (via MCP o SQL directo)
- Escribir y optimizar queries (select, insert, update, delete, joins)
- Crear o modificar endpoints API en `src/pages/api/`
- Gestionar políticas RLS (Row Level Security)
- Gestionar Storage buckets (imágenes de álbum, uploads de admin)
- Crear índices o funciones de base de datos
- Manejar errores de Supabase en los endpoints

## Patrones del proyecto
- Los endpoints API son archivos `.ts` en `src/pages/api/` que exportan funciones HTTP (`GET`, `POST`, `PUT`, `DELETE`)
- Todos los endpoints retornan `new Response(JSON.stringify({...}), { headers: { 'Content-Type': 'application/json' } })`
- Las operaciones admin usan `supabaseAdmin` (service role key, solo server-side)
- Las operaciones de usuario usan el cliente con la sesión del request
- Los uploads van a Supabase Storage via `supabase.storage.from('bucket').upload()`

## Tablas principales (inferidas del código)
| Tabla | Uso |
|-------|-----|
| `usuarios` | Perfil extendido de usuarios (además de auth.users) |
| `albums` | Álbumes de estampas |
| `canciones` | Canciones asociadas a álbumes |
| `cards` | Estampas/cards del álbum |
| `codigos` | Códigos de redención para obtener estampas |
| `playlists` | Playlists del usuario |
| `playlist_canciones` | Relación playlist ↔ canciones |

## Endpoints API existentes
- `POST /api/auth/signin|signup|request-reset|update-password`
- `GET|PUT|DELETE /api/admin/albums/[id]`
- `GET|POST /api/admin/albums`
- `GET|PUT|DELETE /api/admin/cards/[id]`
- `GET|POST /api/admin/codigos/[id]`, `/generar`, `/borrar`
- `GET|PUT|DELETE /api/admin/songs/[id]`, `/importar`
- `POST /api/admin/upload`
- `GET|PUT|DELETE /api/admin/usuarios/[id]`, `/invitar`
