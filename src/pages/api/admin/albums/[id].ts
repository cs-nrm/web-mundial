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

  const { name, slug, descripcion, cover_url, active, estacion, color_acento, color_acento2, color_texto, color_header, color_body, color_fondo_card, color_texto_card, color_texto_header, color_texto_body, logo_url, total_cards, banner_patrocinador_url } = body

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
  if (color_header && !hexRe.test(color_header)) {
    return new Response(JSON.stringify({ error: 'Color header inválido' }), { status: 400 })
  }
  if (color_body && !hexRe.test(color_body)) {
    return new Response(JSON.stringify({ error: 'Color body inválido' }), { status: 400 })
  }
  if (color_fondo_card && !hexRe.test(color_fondo_card)) {
    return new Response(JSON.stringify({ error: 'Color fondo card inválido' }), { status: 400 })
  }
  if (color_texto_card && !hexRe.test(color_texto_card)) {
    return new Response(JSON.stringify({ error: 'Color texto card inválido' }), { status: 400 })
  }
  if (color_texto_header && !hexRe.test(color_texto_header)) {
    return new Response(JSON.stringify({ error: 'Color texto header inválido' }), { status: 400 })
  }
  if (color_texto_body && !hexRe.test(color_texto_body)) {
    return new Response(JSON.stringify({ error: 'Color texto body inválido' }), { status: 400 })
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
  if (color_header !== undefined) updates.color_header = color_header || null
  if (color_body !== undefined) updates.color_body = color_body || null
  if (color_fondo_card !== undefined) updates.color_fondo_card = color_fondo_card || null
  if (color_texto_card !== undefined) updates.color_texto_card = color_texto_card || null
  if (color_texto_header !== undefined) updates.color_texto_header = color_texto_header || null
  if (color_texto_body !== undefined) updates.color_texto_body = color_texto_body || null

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
