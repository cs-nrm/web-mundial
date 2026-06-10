import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../../../lib/supabase'
import { canAccess, MANAGE_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

function generateCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const POST: APIRoute = async ({ request, locals }) => {
  if (!canAccess(locals.role as UserRole, MANAGE_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  let body: any
  try { body = await request.json() } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo inválido' }), { status: 400 })
  }

  const { album_id, max_usos, expira_en } = body
  if (!album_id) {
    return new Response(JSON.stringify({ error: 'album_id requerido' }), { status: 400 })
  }

  const supabase = createSupabaseAdminClient()

  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('id')
    .eq('album_id', album_id)
    .eq('active', true)

  if (cardsError || !cards?.length) {
    return new Response(JSON.stringify({ error: 'No hay cards activas en este álbum' }), { status: 400 })
  }

  const usedCodes = new Set<string>()
  const rows: { code: string; card_id: string; max_usos: number; expira_en: string | null; active: boolean }[] = []

  for (const card of cards) {
    let code: string
    let attempts = 0
    do {
      code = generateCode(8)
      attempts++
    } while (usedCodes.has(code) && attempts < 100)
    usedCodes.add(code)
    rows.push({
      code,
      card_id: card.id,
      max_usos: Number(max_usos) || 5000,
      expira_en: expira_en || null,
      active: true,
    })
  }

  const { error } = await supabase.from('codes').insert(rows)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ ok: true, total: rows.length }), { status: 201 })
}
