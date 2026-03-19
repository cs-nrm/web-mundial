import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../../lib/supabase'
import { canAccess, EDITOR_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

export const PATCH: APIRoute = async ({ request, cookies, locals, params }) => {
  if (!canAccess(locals.role as UserRole, EDITOR_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  let body: any
  try { body = await request.json() } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo inválido' }), { status: 400 })
  }

  const { name, slug, descripcion, cover_url, active } = body

  if (slug && !/^[a-z0-9-]+$/.test(slug)) {
    return new Response(JSON.stringify({ error: 'Slug inválido' }), { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (name !== undefined) updates.name = name
  if (slug !== undefined) updates.slug = slug
  if (descripcion !== undefined) updates.descripcion = descripcion || null
  if (cover_url !== undefined) updates.cover_url = cover_url || null
  if (active !== undefined) updates.active = active

  const supabase = createSupabaseServerClient(request, cookies)
  const { error } = await supabase
    .from('albums')
    .update(updates)
    .eq('id', params.id!)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
