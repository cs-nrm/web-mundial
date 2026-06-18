import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../../../lib/supabase'
import { canAccess, SOCIAL_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

function normalize(name: string) {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}

export const GET: APIRoute = async ({ locals }) => {
  if (!canAccess(locals.role as UserRole, SOCIAL_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('social_handles')
    .select('team_name, ig, tw')
    .order('team_name')
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify({ handles: data ?? [] }), { status: 200 })
}

export const PUT: APIRoute = async ({ request, locals }) => {
  if (!canAccess(locals.role as UserRole, SOCIAL_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }
  let body: { team_name?: string; ig?: string; tw?: string }
  try { body = await request.json() } catch { return new Response('Bad request', { status: 400 }) }

  const { team_name, ig, tw } = body
  if (!team_name?.trim()) return new Response(JSON.stringify({ error: 'team_name requerido' }), { status: 400 })

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('social_handles')
    .upsert({ team_name: normalize(team_name), ig: ig?.trim() ?? '', tw: tw?.trim() ?? '', updated_at: new Date().toISOString() })

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}

export const DELETE: APIRoute = async ({ url, locals }) => {
  if (!canAccess(locals.role as UserRole, SOCIAL_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }
  const team = url.searchParams.get('team')
  if (!team) return new Response('team requerido', { status: 400 })

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('social_handles').delete().eq('team_name', normalize(team))
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(null, { status: 204 })
}
