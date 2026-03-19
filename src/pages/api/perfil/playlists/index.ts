import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../../lib/supabase'

export const POST: APIRoute = async ({ request, cookies, locals, redirect }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 })
  }

  const form = await request.formData()
  const nombre = (form.get('nombre') as string)?.trim()

  if (!nombre) {
    return redirect('/perfil/playlist')
  }

  const supabase = createSupabaseServerClient(request, cookies)

  const { data, error } = await supabase
    .from('playlists')
    .insert({ user_id: locals.user.id, nombre })
    .select('id')
    .single()

  if (error) {
    return redirect('/perfil/playlist')
  }

  return redirect(`/perfil/playlist/${data.id}`)
}
