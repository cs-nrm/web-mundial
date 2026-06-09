import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../../../lib/supabase'
import { canAccess, MANAGE_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

const BUCKET = 'anuncios'

export const POST: APIRoute = async ({ request, locals }) => {
  if (!canAccess(locals.role as UserRole, MANAGE_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file?.size) {
    return new Response(JSON.stringify({ error: 'Archivo requerido' }), { status: 400 })
  }

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type)) {
    return new Response(JSON.stringify({ error: 'Solo imágenes (jpg, png, webp, gif)' }), { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return new Response(JSON.stringify({ error: 'Máximo 5 MB' }), { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, await file.arrayBuffer(), { contentType: file.type })

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename)
  return new Response(JSON.stringify({ url: data.publicUrl }), { status: 200 })
}
