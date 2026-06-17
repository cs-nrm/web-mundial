import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../../../lib/supabase'
import { canAccess, SOCIAL_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

export const POST: APIRoute = async ({ request, locals }) => {
  if (!canAccess(locals.role as UserRole, SOCIAL_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  let body: { eventId?: string }
  try { body = await request.json() } catch { return new Response('Bad request', { status: 400 }) }

  const { eventId } = body
  if (!eventId) return new Response('eventId requerido', { status: 400 })

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('goal_posts')
    .update({ status: 'descartado' })
    .eq('id', eventId)
    .neq('status', 'publicado') // no descartar algo ya publicado

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
