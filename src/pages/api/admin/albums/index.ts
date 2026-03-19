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

  const { name, slug, descripcion, cover_url, active } = body

  if (!name?.trim() || !slug?.trim()) {
    return new Response(JSON.stringify({ error: 'Nombre y slug requeridos' }), { status: 400 })
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return new Response(JSON.stringify({ error: 'Slug inválido: solo minúsculas, números y guiones' }), { status: 400 })
  }

  const supabase = createSupabaseServerClient(request, cookies)
  const { data, error } = await supabase
    .from('albums')
    .insert({ name: name.trim(), slug: slug.trim(), descripcion: descripcion || null, cover_url: cover_url || null, active: active ?? true })
    .select('id')
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  return new Response(JSON.stringify(data), { status: 201 })
}
