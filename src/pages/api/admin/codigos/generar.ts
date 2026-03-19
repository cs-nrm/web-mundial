import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../../lib/supabase'
import { canAccess, MANAGE_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

function generateCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sin 0/O, 1/I para evitar confusión
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  if (!canAccess(locals.role as UserRole, MANAGE_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  let body: any
  try { body = await request.json() } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo inválido' }), { status: 400 })
  }

  const { card_id, cantidad, max_usos, expira_en } = body

  if (!card_id) {
    return new Response(JSON.stringify({ error: 'card_id requerido' }), { status: 400 })
  }

  const qty = Math.min(Math.max(Number(cantidad) || 1, 1), 500)

  // Generar códigos únicos
  const supabase = createSupabaseServerClient(request, cookies)
  const codes: string[] = []
  const rows: { code: string; card_id: string; max_usos: number; expira_en: string | null; active: boolean }[] = []

  for (let i = 0; i < qty; i++) {
    let code: string
    let attempts = 0
    do {
      code = generateCode(8)
      attempts++
    } while (codes.includes(code) && attempts < 100)
    codes.push(code)
    rows.push({
      code,
      card_id,
      max_usos: Number(max_usos) || 1,
      expira_en: expira_en || null,
      active: true,
    })
  }

  const { error } = await supabase.from('codes').insert(rows)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ ok: true, codes }), { status: 201 })
}
