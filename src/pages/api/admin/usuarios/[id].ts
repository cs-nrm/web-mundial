import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../../lib/supabase'
import { canAccess, MANAGE_ROLES, SUPERADMIN_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

const VALID_ROLES: UserRole[] = ['superadmin', 'admin', 'editor', 'estadistica', 'user']

export const PATCH: APIRoute = async ({ request, cookies, locals, params }) => {
  if (!canAccess(locals.role as UserRole, MANAGE_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  let body: any
  try { body = await request.json() } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo inválido' }), { status: 400 })
  }

  const { role } = body

  if (!role || !VALID_ROLES.includes(role)) {
    return new Response(JSON.stringify({ error: 'Rol inválido' }), { status: 400 })
  }

  // Solo superadmin puede asignar el rol superadmin
  if (role === 'superadmin' && !canAccess(locals.role as UserRole, SUPERADMIN_ROLES)) {
    return new Response(JSON.stringify({ error: 'Solo superadmin puede asignar este rol' }), { status: 403 })
  }

  const supabase = createSupabaseServerClient(request, cookies)
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', params.id!)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
