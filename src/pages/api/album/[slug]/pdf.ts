import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../../lib/supabase'
import { generarAlbumPdf, AlbumNotFoundError } from '../../../../lib/album-pdf'

export const GET: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createSupabaseServerClient(request, cookies)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const nombre =
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'Participante'

  try {
    const { bytes, filename } = await generarAlbumPdf(supabase, params.slug!, { id: user.id, nombre })

    return new Response(bytes as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    if (err instanceof AlbumNotFoundError) {
      return new Response(JSON.stringify({ error: 'Álbum no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    console.error('[album-pdf]', err)
    return new Response(JSON.stringify({ error: 'No se pudo generar el PDF' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
