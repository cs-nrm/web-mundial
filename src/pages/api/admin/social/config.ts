import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../../../lib/supabase'
import { canAccess, SOCIAL_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

export const GET: APIRoute = async ({ locals }) => {
  if (!canAccess(locals.role as UserRole, SOCIAL_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('social_config').select('auto_publish').eq('id', 'main').maybeSingle()
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify({ auto_publish: data?.auto_publish ?? true }), { status: 200 })
}

export const POST: APIRoute = async ({ request, locals }) => {
  if (!canAccess(locals.role as UserRole, SOCIAL_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }
  let body: { auto_publish?: boolean }
  try { body = await request.json() } catch { return new Response('Bad request', { status: 400 }) }
  if (typeof body.auto_publish !== 'boolean') {
    return new Response('auto_publish debe ser boolean', { status: 400 })
  }
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('social_config')
    .upsert({ id: 'main', auto_publish: body.auto_publish, updated_at: new Date().toISOString() }, { onConflict: 'id' })
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify({ ok: true, auto_publish: body.auto_publish }), { status: 200 })
}
