import { defineMiddleware } from 'astro:middleware'
import { createSupabaseServerClient } from './lib/supabase'
import { getUserContext } from './lib/perfil'
import { canAccess, ADMIN_ROLES } from './lib/admin'
import { verifyEmergencyToken } from './lib/emergency-auth'
import type { UserRole } from './lib/perfil'

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerClient(context.request, context.cookies)

  // getUser() valida el token contra el servidor de Auth (getSession solo decodifica
  // la cookie localmente y puede aceptar tokens revocados/manipulados).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // session se mantiene para compatibilidad, pero la fuente de verdad es `user`
  const {
    data: { session },
  } = user ? await supabase.auth.getSession() : { data: { session: null } }

  context.locals.session = session
  context.locals.user = user

  if (user) {
    const ctx = await getUserContext(supabase, user.id)
    context.locals.hasGenerales = ctx.hasGenerales
    context.locals.role = ctx.role
    context.locals.estacion_favorita = ctx.estacion_favorita
  } else {
    context.locals.hasGenerales = false
    context.locals.role = 'user'
    context.locals.estacion_favorita = null
  }

  // Fallback de emergencia: cookie firmada cuando Google/Supabase no están disponibles
  if (!context.locals.user) {
    const emergencyToken = context.cookies.get('emergency_admin')?.value ?? ''
    if (verifyEmergencyToken(emergencyToken)) {
      context.locals.user = { id: 'emergency', email: 'emergency@admin.local' } as any
      context.locals.role = 'superadmin'
      context.locals.hasGenerales = true
    }
  }

  // Proteger rutas /admin/*
  const pathname = new URL(context.request.url).pathname
  if (pathname.startsWith('/admin')) {
    if (!context.locals.user) {
      return context.redirect(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
    }
    if (!canAccess(context.locals.role as UserRole, ADMIN_ROLES)) {
      return context.redirect('/')
    }
  }

  return next()
})
