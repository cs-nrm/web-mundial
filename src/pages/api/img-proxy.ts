import type { APIRoute } from 'astro'

const ALLOWED_BASE = 'https://storage.googleapis.com/nrm-web/'

export const GET: APIRoute = async ({ url }) => {
  const imageUrl = url.searchParams.get('url')

  if (!imageUrl || !imageUrl.startsWith(ALLOWED_BASE)) {
    return new Response('URL no permitida', { status: 400 })
  }

  try {
    const res = await fetch(imageUrl)
    if (!res.ok) return new Response('No encontrado', { status: 404 })

    const buffer = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') ?? 'image/png'

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (e) {
    return new Response('Error al obtener imagen', { status: 500 })
  }
}
