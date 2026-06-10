import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../../lib/supabase'
import { canAccess, MANAGE_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  if (!canAccess(locals.role as UserRole, MANAGE_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  let body: any
  try { body = await request.json() } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo inválido' }), { status: 400 })
  }

  const ids: string[] = body.ids ?? []
  if (!ids.length) {
    return new Response(JSON.stringify({ error: 'No se especificaron IDs' }), { status: 400 })
  }

  const supabase = createSupabaseServerClient(request, cookies)

  const { error } = await supabase
    .from('codes')
    .delete()
    .in('id', ids)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
