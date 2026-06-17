import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../../../lib/supabase'
import { canAccess, MANAGE_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

// Polling endpoint — devuelve eventos pendientes creados después de `since`
export const GET: APIRoute = async ({ url, locals }) => {
  if (!canAccess(locals.role as UserRole, MANAGE_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  const since = url.searchParams.get('since') // ISO timestamp
  const supabase = createSupabaseAdminClient()

  let query = supabase
    .from('goal_posts')
    .select('id, event_type, team_home, team_away, score_home, score_away, player_name, minute, created_at, status')
    .eq('status', 'pendiente')
    .order('created_at', { ascending: false })
    .limit(10)

  if (since) query = query.gt('created_at', since)

  const { data, error } = await query
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  return new Response(JSON.stringify({ events: data ?? [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
