import type { APIRoute } from 'astro'
import { createSupabaseServerClient, createSupabaseAdminClient } from '../../../../lib/supabase'
import { canAccess, EDITOR_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

export const DELETE: APIRoute = async ({ locals, params }) => {
  if (!canAccess(locals.role as UserRole, EDITOR_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  const supabase = createSupabaseAdminClient()
  const cardId = params.id!

  // Borrar registros dependientes antes de borrar la card
  // Primero obtener los códigos para borrar sus user_cards por code_id
  const { data: codesToDelete } = await supabase.from('codes').select('id').eq('card_id', cardId)
  const codeIds = (codesToDelete ?? []).map((c: any) => c.id)
  if (codeIds.length > 0) {
    await supabase.from('user_cards').delete().in('code_id', codeIds)
  }
  await supabase.from('user_cards').delete().eq('card_id', cardId)
  await supabase.from('codes').delete().eq('card_id', cardId)

  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId)

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

  const updates: Record<string, unknown> = {}
  if (body.posicion !== undefined) updates.posicion = Number(body.posicion)
  if (body.name !== undefined) updates.name = body.name
  if (body.descripcion !== undefined) updates.descripcion = body.descripcion || null
  if (body.image_url !== undefined) updates.image_url = body.image_url || null
  if (body.active !== undefined) updates.active = body.active

  const supabase = createSupabaseServerClient(request, cookies)
  const { error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', params.id!)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
