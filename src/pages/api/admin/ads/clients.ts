import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../../../lib/supabase'
import { canAccess, MANAGE_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

export const POST: APIRoute = async ({ request, locals }) => {
  if (!canAccess(locals.role as UserRole, MANAGE_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  const { name } = await request.json()
  if (!name?.trim()) {
    return new Response(JSON.stringify({ error: 'Nombre requerido' }), { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('ad_clients')
    .insert({ name: name.trim() })
    .select()
    .single()

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify(data), { status: 201 })
}
