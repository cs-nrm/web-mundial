import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../../lib/supabase'
import { canAccess, EDITOR_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

export const DELETE: APIRoute = async ({ request, cookies, locals, params }) => {
  if (!canAccess(locals.role as UserRole, EDITOR_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  const supabase = createSupabaseServerClient(request, cookies)
  const { error } = await supabase
    .from('albums')
    .delete()
    .eq('id', params.id!)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}

export const PATCH: APIRoute = async ({ request, cookies, locals, params }) => {
  if (!canAccess(locals.role as UserRole, EDITOR_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  let body: any
  try { body = await request.json() } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo inválido' }), { status: 400 })
  }

  const { name, slug, descripcion, cover_url, active, estacion, color_acento, color_acento2, color_texto, logo_url, total_cards, banner_patrocinador_url } = body

  if (slug && !/^[a-z0-9-]+$/.test(slug)) {
    return new Response(JSON.stringify({ error: 'Slug inválido' }), { status: 400 })
  }
  const hexRe = /^#[0-9a-fA-F]{3,8}$/
  if (color_acento && !hexRe.test(color_acento)) {
    return new Response(JSON.stringify({ error: 'Color de acento inválido' }), { status: 400 })
  }
  if (color_acento2 && !hexRe.test(color_acento2)) {
    return new Response(JSON.stringify({ error: 'Color de acento 2 inválido' }), { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (name !== undefined) updates.name = name
  if (slug !== undefined) updates.slug = slug
  if (descripcion !== undefined) updates.descripcion = descripcion || null
  if (cover_url !== undefined) updates.cover_url = cover_url || null
  if (active !== undefined) updates.active = active
  if (estacion !== undefined) updates.estacion = estacion || null
  if (color_acento !== undefined) updates.color_acento = color_acento || null
  if (color_acento2 !== undefined) updates.color_acento2 = color_acento2 || null
  if (color_texto !== undefined) updates.color_texto = color_texto || null
  if (logo_url !== undefined) updates.logo_url = logo_url || null
  if (total_cards !== undefined) updates.total_cards = total_cards ?? null
  if (banner_patrocinador_url !== undefined) updates.banner_patrocinador_url = banner_patrocinador_url || null

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
