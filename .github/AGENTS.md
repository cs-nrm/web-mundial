# Agentes Personalizados — web-mundial

Este proyecto cuenta con 11 agentes especializados, cada uno enfocado en un área específica del codebase. Para invocar un agente, usa el símbolo `/` en una nueva conversación o pregunta con `@agent-name`.

## Agentes disponibles

### 1. **admin-panel**
Gestiona el panel de administración: UI, flujos de gestión de contenido, usuarios y estadísticas.  
**Use cuando:** modifiques la UI del admin, agregues nuevas secciones, gestiones usuarios, crees dashboards.

### 2. **album-codigos**
Gestiona el sistema de álbum de estampas digitales: visualización, redención de códigos, y gestión de cards.  
**Use cuando:** modifiques el flujo de redención, manejes álbumes o códigos, crees colecciones.

### 3. **auth-sessions**
Autenticación de usuarios, sesiones, flujos de login/registro y protección de rutas.  
**Use cuando:** modifiques login/signup, cambies proveedores OAuth, ajustes protección de rutas.

### 4. **component-creator**
Crea y modifica componentes Astro siguiendo convenciones visuales y técnicas del proyecto.  
**Use cuando:** crees nuevos componentes, modifiques componentes existentes, diseñes Cards/Sliders/Widgets.

### 5. **content-sources**
Capa de agregación de contenido desde múltiples sitios WordPress REST API.  
**Use cuando:** configures nuevas fuentes WP, modifiques fetching, ajustes agregación de datos.

### 6. **deploy-ops**
Pipeline de build, configuración del servidor y despliegue a producción.  
**Use cuando:** modifiques deploy scripts, optimices build, agregues integraciones Astro.

### 7. **page-builder**
Crea y modifica rutas de páginas Astro con patrones de fetching, paginación y SEO.  
**Use cuando:** crees nuevas rutas, implementes paginación, conectes datos, agregues metadatos SEO.

### 8. **perfil-playlists**
Perfil de usuario, datos personales, y sistema de playlists de canciones.  
**Use cuando:** modifiques perfil de usuario, crees funcionalidad de playlists, personalices datos.

### 9. **seo-ads**
SEO (metadatos, sitemap, robots, structured data) y monetización publicitaria (GPT, GTM, Comscore).  
**Use cuando:** configures SEO, manejes ad slots, actualices tracking, mantengas sitemap.

### 10. **styles-tokens**
Sistema de diseño: variables de marca, tipografía, Tailwind config y estilos globales.  
**Use cuando:** agregues colores nuevos, extiendas Tailwind, crees clases globales, agregues fuentes.

### 11. **supabase-backend**
Base de datos Supabase: esquema, migraciones, queries y endpoints API del servidor.  
**Use cuando:** crees tablas, escribas queries, hagas endpoints API, manejes RLS, optimices BD.

## Flujo de trabajo recomendado

1. **Identifica el área de trabajo** — Determina cuál es el agente más relevante para tu tarea
2. **Usa el agente apropiado** — Menciona el agente en tu pregunta o invócalo directamente
3. **El agente proporciona contexto** — Conoce los patrones, archivos clave y responsabilidades del área
4. **Implementación enfocada** — Realiza cambios de forma precisa y consistente con el proyecto

## Límites por agente

Cada agente tiene límites claros de responsabilidad para evitar conflictos:
- **admin-panel** no modifica endpoints de supabase-backend
- **component-creator** no crea rutas (eso es tarea de page-builder)
- **auth-sessions** no modifica esquema de BD (eso es tarea de supabase-backend)
- **content-sources** no crea componentes visuales (eso es tarea de component-creator)

Estos límites aseguran que cada área sea gestionada por su agente especializado.
