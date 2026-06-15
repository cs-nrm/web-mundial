import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../../../lib/supabase'
import { canAccess, EDITOR_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

export const POST: APIRoute = async ({ request, locals }) => {
  if (!canAccess(locals.role as UserRole, EDITOR_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  let body: any
  try { body = await request.json() } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo inválido' }), { status: 400 })
  }

  const { titulo, slug, cuerpo, publicado_en } = body

  if (!titulo?.trim() || !slug?.trim() || !cuerpo?.trim()) {
    return new Response(JSON.stringify({ error: 'Título, slug y contenido son requeridos' }), { status: 400 })
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return new Response(JSON.stringify({ error: 'Slug inválido: solo minúsculas, números y guiones' }), { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('analisis')
    .insert({
      titulo: titulo.trim(),
      slug: slug.trim(),
      cuerpo: cuerpo.trim(),
      publicado_en: publicado_en || new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  return new Response(JSON.stringify(data), { status: 201 })
}
