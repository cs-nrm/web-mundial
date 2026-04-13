---
name: auth-sessions
description: "Use when: modifying authentication flows, adjusting login/signup forms, changing route protection, managing OAuth providers, handling sessions"
---

# Agent: auth-sessions

Especializado en autenticación de usuarios, sesiones, flujos de login/registro y protección de rutas.

## Archivos clave
- `src/middleware.ts` — protección de rutas, verificación de sesión en cada request
- `src/lib/supabase.ts` — cliente Supabase (con helpers para server y browser)
- `src/pages/auth/login.astro` — formulario de login
- `src/pages/auth/registro.astro` — formulario de registro
- `src/pages/auth/callback.ts` — callback OAuth (Google)
- `src/pages/auth/login-google.ts` — inicio del flujo OAuth con Google
- `src/pages/auth/logout.ts` — cierre de sesión
- `src/pages/auth/reset.astro` — solicitud de reset de contraseña
- `src/pages/auth/nueva-contrasena.astro` — formulario de nueva contraseña
- `src/pages/auth/confirmar.astro` — confirmación de email
- `src/pages/api/auth/signin.ts` — endpoint sign in
- `src/pages/api/auth/signup.ts` — endpoint sign up
- `src/pages/api/auth/request-reset.ts` — endpoint solicitud reset
- `src/pages/api/auth/update-password.ts` — endpoint actualizar contraseña
- `src/components/AuthButton.astro` — botón login/logout contextual
- `src/components/PerfilModal.astro` — modal de perfil de usuario autenticado

## Responsabilidades
- Modificar reglas de protección de rutas en `middleware.ts`
- Agregar o ajustar proveedores OAuth
- Modificar flujos de registro (campos, validaciones, email de confirmación)
- Ajustar configuración de sesiones (expiración, cookies)
- Modificar el `AuthButton` o `PerfilModal`
- Manejar errores de autenticación y redirecciones

## Patrones del proyecto
- Supabase Auth maneja el estado de sesión vía cookies (SSR-compatible)
- El middleware verifica la sesión en rutas protegidas (`/perfil/*`, `/admin/*`, `/album/*`)
- Los endpoints API retornan JSON con `{ success, error }` o `{ user }`
- El flujo OAuth Google usa `signInWithOAuth` con `redirectTo: /auth/callback`
- Las rutas de auth no requieren sesión activa (el middleware las excluye)
- Los formularios de login/registro hacen `fetch` al endpoint correspondiente y redirigen con JS

## Rutas protegidas (middleware)
- `/perfil/*` — requiere usuario autenticado
- `/admin/*` — requiere usuario con rol admin
- `/album/*` — requiere usuario autenticado (para redimir códigos)

## Lo que NO hace este agente
- No modifica el esquema de tablas de usuarios (→ `supabase-backend`)
- No toca páginas de perfil o datos del usuario (→ `perfil-playlists`)
- No modifica el panel de administración (→ `admin-panel`)
