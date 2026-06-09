import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../../../lib/supabase'
import { canAccess, MANAGE_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

export const POST: APIRoute = async ({ request, locals }) => {
  if (!canAccess(locals.role as UserRole, MANAGE_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  const body = await request.json()
  const { client_id, slot_type, type, src, href, alt, html_code } = body

  if (!client_id || !slot_type || !type) {
    return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), { status: 400 })
  }
  if (!['leader', 'box'].includes(slot_type)) {
    return new Response(JSON.stringify({ error: 'slot_type inválido' }), { status: 400 })
  }
  if (!['image', 'html'].includes(type)) {
    return new Response(JSON.stringify({ error: 'type inválido' }), { status: 400 })
  }
  if (type === 'image' && !src) {
    return new Response(JSON.stringify({ error: 'src requerido para imagen' }), { status: 400 })
  }
  if (type === 'html' && !html_code) {
    return new Response(JSON.stringify({ error: 'html_code requerido' }), { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('ad_creatives')
    .insert({ client_id, slot_type, type, src: src ?? null, href: href ?? null, alt: alt ?? '', html_code: html_code ?? null })
    .select()
    .single()

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify(data), { status: 201 })
}
