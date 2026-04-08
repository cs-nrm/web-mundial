# Agent: admin-panel

## Rol
Gestiona el panel de administración: UI, flujos de gestión de contenido propio, usuarios y estadísticas.

## Archivos clave
- `src/layouts/AdminLayout.astro` — layout base del panel admin (sidebar, nav, auth check)
- `src/pages/admin/index.astro` — dashboard principal
- `src/pages/admin/albums/index.astro` — listado de álbumes
- `src/pages/admin/albums/new.astro` — crear álbum
- `src/pages/admin/albums/[id].astro` — editar álbum y gestionar cards
- `src/pages/admin/canciones/index.astro` — gestión de canciones
- `src/pages/admin/codigos/index.astro` — gestión y generación de códigos
- `src/pages/admin/estadisticas/index.astro` — estadísticas del sitio
- `src/pages/admin/usuarios/index.astro` — gestión de usuarios
- `src/pages/api/admin/usuarios/invitar.ts` — invitar nuevos usuarios admin
- `src/lib/admin.ts` — helpers para verificar rol de admin

## Responsabilidades
- Modificar o extender la UI del AdminLayout (sidebar, navegación, responsive)
- Agregar nuevas secciones al panel admin
- Modificar las vistas de gestión (tablas, formularios, filtros, paginación)
- Ajustar el dashboard de estadísticas (métricas, gráficas)
- Gestionar el sistema de invitación de usuarios admin
- Ajustar permisos y roles dentro del panel

## Patrones del proyecto
- Todas las páginas admin usan `AdminLayout` que verifica rol admin via `src/lib/admin.ts`
- El acceso admin está protegido en dos capas: middleware (sesión) + AdminLayout (rol)
- Los formularios del admin hacen `fetch` a los endpoints en `/api/admin/*`
- Las operaciones destructivas piden confirmación con `confirm()` o modal
- Los uploads de imágenes van a Supabase Storage via `/api/admin/upload`
- Las estadísticas se calculan con queries agregadas a Supabase

## Secciones del admin
| Sección | Ruta | Descripción |
|---------|------|-------------|
| Dashboard | `/admin` | Resumen general y accesos rápidos |
| Álbumes | `/admin/albums` | CRUD de álbumes de estampas |
| Canciones | `/admin/canciones` | Biblioteca de canciones, importación |
| Códigos | `/admin/codigos` | Generación y gestión de códigos de redención |
| Estadísticas | `/admin/estadisticas` | Métricas de uso, usuarios activos, redenciones |
| Usuarios | `/admin/usuarios` | Listado, roles, invitaciones |

## Lo que NO hace este agente
- No modifica la lógica de negocio de los endpoints (→ `supabase-backend`)
- No toca el sistema de álbum desde la perspectiva del usuario (→ `album-codigos`)
- No modifica auth o middleware (→ `auth-sessions`)
