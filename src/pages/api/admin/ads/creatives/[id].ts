import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../../../../lib/supabase'
import { canAccess, MANAGE_ROLES } from '../../../../../lib/admin'
import type { UserRole } from '../../../../../lib/perfil'

export const PATCH: APIRoute = async ({ request, params, locals }) => {
  if (!canAccess(locals.role as UserRole, MANAGE_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  const body = await request.json()
  const allowed = ['active', 'html_code', 'src', 'href', 'alt']
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('ad_creatives')
    .update(updates)
    .eq('id', params.id!)
    .select()
    .single()

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify(data))
}

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!canAccess(locals.role as UserRole, MANAGE_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('ad_creatives').delete().eq('id', params.id!)
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(null, { status: 204 })
}
