# Agent: perfil-playlists

## Rol
Gestiona el perfil de usuario, sus datos personales, y el sistema de playlists de canciones.

## Archivos clave
- `src/pages/perfil/index.astro` — página principal del perfil
- `src/pages/perfil/datos.astro` — edición de datos personales
- `src/pages/perfil/playlist/index.astro` — listado de playlists del usuario
- `src/pages/perfil/playlist/[id].astro` — detalle y gestión de una playlist
- `src/pages/api/perfil/guardar.ts` — endpoint para guardar datos del perfil
- `src/pages/api/perfil/playlists/index.ts` — CRUD de playlists
- `src/pages/api/perfil/playlists/[id].ts` — operaciones sobre playlist específica
- `src/pages/api/perfil/playlists/[id]/canciones.ts` — agregar/quitar canciones
- `src/lib/perfil.ts` — helpers de acceso a datos del perfil
- `src/components/PerfilModal.astro` — modal de perfil visible desde el header

## Responsabilidades
- Modificar los campos del perfil de usuario (nombre, foto, preferencias, equipo favorito)
- Ajustar la UI de las páginas de perfil y datos
- Modificar la lógica de playlists (crear, renombrar, eliminar, reordenar canciones)
- Agregar nuevas secciones al perfil (historial, logros, configuración)
- Ajustar el `PerfilModal` del header

## Patrones del proyecto
- Las páginas de perfil verifican sesión via middleware (ruta protegida `/perfil/*`)
- Los datos del perfil se guardan en una tabla `usuarios` separada de `auth.users`
- Los endpoints de perfil usan la sesión del request para identificar al usuario (no se pasa user_id en el body)
- Las playlists tienen un nombre y una colección ordenada de canciones
- Las canciones vienen de la tabla `canciones` (gestionada en admin)

## Modelo de datos
- `usuarios`: perfil extendido (nombre display, avatar, equipo favorito, etc.)
- `playlists`: lista con nombre, pertenece a un usuario
- `playlist_canciones`: join table con orden de reproducción

## Lo que NOT hace este agente
- No modifica la autenticación ni sesión (→ `auth-sessions`)
- No modifica el esquema de BD (→ `supabase-backend`)
- No toca el sistema de álbum de estampas (→ `album-codigos`)
- No modifica el panel de admin (→ `admin-panel`)
