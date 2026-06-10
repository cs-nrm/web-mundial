import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../../../lib/supabase'
import { canAccess, MANAGE_ROLES, SUPERADMIN_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

const VALID_ROLES: UserRole[] = ['superadmin', 'admin', 'editor', 'estadistica', 'user']

export const PATCH: APIRoute = async ({ request, locals, params }) => {
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

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', params.id!)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}

export const DELETE: APIRoute = async ({ locals, params }) => {
  if (!canAccess(locals.role as UserRole, MANAGE_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  const targetId = params.id!
  const supabase = createSupabaseAdminClient()

  // No permitir borrar superadmins
  const { data: target } = await supabase.from('profiles').select('role').eq('id', targetId).single()
  if (target?.role === 'superadmin') {
    return new Response(JSON.stringify({ error: 'No se puede eliminar a un superadmin' }), { status: 403 })
  }

  // Borrar datos del perfil (en caso de que no haya cascade en la DB)
  await supabase.from('user_generales').delete().eq('user_id', targetId)
  await supabase.from('profiles').delete().eq('id', targetId)

  // Borrar el usuario de auth (esto también hace cascade si está configurado)
  const { error } = await supabase.auth.admin.deleteUser(targetId)
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  return new Response(null, { status: 204 })
}
