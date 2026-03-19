import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../../lib/supabase'

// Verificar que la playlist pertenece al usuario
async function getPlaylist(supabase: any, id: string, userId: string) {
  const { data } = await supabase
    .from('playlists')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  return data
}

export const PATCH: APIRoute = async ({ request, cookies, locals, params }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 })

  const supabase = createSupabaseServerClient(request, cookies)
  const playlist = await getPlaylist(supabase, params.id!, locals.user.id)
  if (!playlist) return new Response(JSON.stringify({ error: 'No encontrado' }), { status: 404 })

  const { nombre } = await request.json()
  if (!nombre?.trim()) return new Response(JSON.stringify({ error: 'Nombre requerido' }), { status: 400 })

  const { error } = await supabase
    .from('playlists')
    .update({ nombre: nombre.trim() })
    .eq('id', params.id!)

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}

export const DELETE: APIRoute = async ({ request, cookies, locals, params }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 })

  const supabase = createSupabaseServerClient(request, cookies)
  const playlist = await getPlaylist(supabase, params.id!, locals.user.id)
  if (!playlist) return new Response(JSON.stringify({ error: 'No encontrado' }), { status: 404 })

  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', params.id!)

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
