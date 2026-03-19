import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../../lib/supabase'
import { canAccess, EDITOR_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  if (!canAccess(locals.role as UserRole, EDITOR_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  let body: any
  try { body = await request.json() } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo inválido' }), { status: 400 })
  }

  const { album_id, posicion, name, descripcion, image_url } = body

  if (!album_id || !posicion || !name?.trim()) {
    return new Response(JSON.stringify({ error: 'album_id, posicion y name requeridos' }), { status: 400 })
  }

  if (posicion < 1 || posicion > 60) {
    return new Response(JSON.stringify({ error: 'Posición debe ser entre 1 y 60' }), { status: 400 })
  }

  const supabase = createSupabaseServerClient(request, cookies)
  const { data, error } = await supabase
    .from('cards')
    .insert({
      album_id,
      posicion: Number(posicion),
      name: name.trim(),
      descripcion: descripcion || null,
      image_url: image_url || null,
      active: true,
    })
    .select('id')
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  return new Response(JSON.stringify(data), { status: 201 })
}
