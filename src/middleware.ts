import { defineMiddleware } from 'astro:middleware'
import { createSupabaseServerClient } from './lib/supabase'
import { getUserContext } from './lib/perfil'
import { canAccess, ADMIN_ROLES } from './lib/admin'
import type { UserRole } from './lib/perfil'

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerClient(context.request, context.cookies)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  context.locals.session = session
  context.locals.user = session?.user ?? null

  if (session?.user) {
    const ctx = await getUserContext(supabase, session.user.id)
    context.locals.hasGenerales = ctx.hasGenerales
    context.locals.role = ctx.role
  } else {
    context.locals.hasGenerales = false
    context.locals.role = 'user'
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
