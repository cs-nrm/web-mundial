import type { APIRoute } from 'astro'

// Solo se permite proxear los assets del avatar, no todo el bucket.
const ALLOWED_BASE = 'https://storage.googleapis.com/nrm-web/mundial/avatar/'

export const GET: APIRoute = async ({ url, locals }) => {
  // Requiere sesión: evita uso del servidor como proxy abierto por terceros.
  const { user } = locals as any
  if (!user) {
    return new Response('No autenticado', { status: 401 })
  }

  const imageUrl = url.searchParams.get('url')

  if (!imageUrl || !imageUrl.startsWith(ALLOWED_BASE)) {
    return new Response('URL no permitida', { status: 400 })
  }

  // Evita path traversal o query maliciosa en la URL destino
  if (imageUrl.includes('..') || imageUrl.includes('//', ALLOWED_BASE.length)) {
    return new Response('URL no permitida', { status: 400 })
  }

  try {
    const res = await fetch(imageUrl)
    if (!res.ok) return new Response('No encontrado', { status: 404 })

    const contentType = res.headers.get('content-type') ?? 'image/png'
    // Solo servir imágenes
    if (!contentType.startsWith('image/')) {
      return new Response('Tipo no permitido', { status: 400 })
    }

    const buffer = await res.arrayBuffer()
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
