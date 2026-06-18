import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../../../lib/supabase'
import { canAccess, SOCIAL_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'
// @ts-ignore – JS module in scripts/, Node SSR context
import { generateImage } from '../../../../../scripts/goal-bot/image.js'

export const POST: APIRoute = async ({ request, locals }) => {
  if (!canAccess(locals.role as UserRole, SOCIAL_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  let body: { eventId?: string }
  try { body = await request.json() } catch { return new Response('Bad request', { status: 400 }) }

  const { eventId } = body
  if (!eventId) return new Response('eventId requerido', { status: 400 })

  const supabase = createSupabaseAdminClient()
  const { data: event, error } = await supabase
    .from('goal_posts')
    .select('*')
    .eq('id', eventId)
    .single()

  if (error || !event) {
    return new Response(JSON.stringify({ error: 'Evento no encontrado' }), { status: 404 })
  }

  try {
    const imageBuffer: Buffer = await generateImage(event)
    return new Response(imageBuffer, {
      status: 200,
      headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'no-store' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message ?? 'Error al generar imagen' }), { status: 500 })
  }
}
