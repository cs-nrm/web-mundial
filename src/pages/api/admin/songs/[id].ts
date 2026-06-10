import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../../lib/supabase'
import { canAccess, EDITOR_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

export const PATCH: APIRoute = async ({ request, cookies, locals, params }) => {
  if (!canAccess(locals.role as UserRole, EDITOR_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  const body = await request.json()
  const supabase = createSupabaseServerClient(request, cookies)

  // Si se está fijando una canción, primero desfijar todas las demás
  if (body.pinned === true) {
    await supabase.from('songs_catalog').update({ pinned: false }).neq('id', params.id!)
  }

  const update: Record<string, any> = {}
  if (body.activo  !== undefined) update.activo  = body.activo
  if (body.pinned  !== undefined) update.pinned  = body.pinned

  const { error } = await supabase
    .from('songs_catalog')
    .update(update)
    .eq('id', params.id!)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
