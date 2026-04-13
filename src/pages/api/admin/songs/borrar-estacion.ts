import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../../../lib/supabase'
import { canAccess, EDITOR_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

const ESTACIONES_VALIDAS = ['oye', 'beat', 'stereocien', 'sabrosita']

export const DELETE: APIRoute = async ({ request, locals }) => {
  if (!canAccess(locals.role as UserRole, EDITOR_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  const { estacion } = await request.json()

  if (!estacion || !ESTACIONES_VALIDAS.includes(estacion)) {
    return new Response(JSON.stringify({ error: 'Estación inválida' }), { status: 400 })
  }

  const supabase = createSupabaseAdminClient()

  const { count, error } = await supabase
    .from('songs_catalog')
    .delete({ count: 'exact' })
    .eq('estacion', estacion)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ ok: true, eliminadas: count }), { status: 200 })
}
