import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../../../lib/supabase'

async function getPlaylist(supabase: any, id: string, userId: string) {
  const { data } = await supabase
    .from('playlists')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  return data
}

export const POST: APIRoute = async ({ request, cookies, locals, params }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 })

  const supabase = createSupabaseServerClient(request, cookies)
  const playlist = await getPlaylist(supabase, params.id!, locals.user.id)
  if (!playlist) return new Response(JSON.stringify({ error: 'No encontrado' }), { status: 404 })

  const { song_id } = await request.json()
  if (!song_id) return new Response(JSON.stringify({ error: 'song_id requerido' }), { status: 400 })

  // Calcular el siguiente orden
  const { count } = await supabase
    .from('playlist_songs')
    .select('*', { count: 'exact', head: true })
    .eq('playlist_id', params.id!)

  const { error } = await supabase
    .from('playlist_songs')
    .insert({ playlist_id: params.id!, song_id, orden: count ?? 0 })

  if (error) {
    const msg = error.code === '23505' ? 'La canción ya está en la playlist' : error.message
    return new Response(JSON.stringify({ error: msg }), { status: 400 })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}

export const DELETE: APIRoute = async ({ request, cookies, locals, params }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 })

  const supabase = createSupabaseServerClient(request, cookies)
  const playlist = await getPlaylist(supabase, params.id!, locals.user.id)
  if (!playlist) return new Response(JSON.stringify({ error: 'No encontrado' }), { status: 404 })

  const { song_id } = await request.json()
  if (!song_id) return new Response(JSON.stringify({ error: 'song_id requerido' }), { status: 400 })

  const { error } = await supabase
    .from('playlist_songs')
    .delete()
    .eq('playlist_id', params.id!)
    .eq('song_id', song_id)

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
