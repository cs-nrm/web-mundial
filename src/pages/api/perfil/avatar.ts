import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../lib/supabase'

const BUCKET = 'avatares'

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const { user } = locals as any
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Límite de payload: el canvas 600×900 PNG pesa ~0.5-1MB; 3MB da margen de sobra
  const MAX_DATAURL_LEN = 3 * 1024 * 1024 // ~3MB en caracteres base64

  try {
    const { imageData, faceData, config } = await request.json()

    if (!imageData || !imageData.startsWith('data:image/png;base64,')) {
      return new Response(JSON.stringify({ error: 'Imagen inválida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (imageData.length > MAX_DATAURL_LEN ||
        (faceData && typeof faceData === 'string' && faceData.length > MAX_DATAURL_LEN)) {
      return new Response(JSON.stringify({ error: 'Imagen demasiado grande' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Validar que config sea un objeto plano y no algo enorme/malicioso
    if (config && (typeof config !== 'object' || Array.isArray(config) ||
        JSON.stringify(config).length > 5000)) {
      return new Response(JSON.stringify({ error: 'Configuración inválida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabase = createSupabaseServerClient(request, cookies)

    // Imagen completa (carta con fondo + marco) → Supabase Storage
    const fullBuffer = Buffer.from(imageData.replace(/^data:image\/png;base64,/, ''), 'base64')
    const fullPath = `${user.id}.png`

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(fullPath, fullBuffer, { contentType: 'image/png', upsert: true })
    if (upErr) throw upErr

    const { data: fullUrlData } = supabase.storage.from(BUCKET).getPublicUrl(fullPath)
    const version = Date.now() // cache-busting: cada guardado genera URL nueva
    const avatarUrlStored = `${fullUrlData.publicUrl}?v=${version}`

    const updateData: Record<string, any> = {
      avatar_url: avatarUrlStored,
      avatar_config: config,
    }

    // Headshot (solo cara, fondo transparente) — opcional
    if (faceData && faceData.startsWith('data:image/png;base64,')) {
      const faceBuffer = Buffer.from(faceData.replace(/^data:image\/png;base64,/, ''), 'base64')
      const facePath = `${user.id}-face.png`

      const { error: faceErr } = await supabase.storage
        .from(BUCKET)
        .upload(facePath, faceBuffer, { contentType: 'image/png', upsert: true })
      if (faceErr) throw faceErr

      const { data: faceUrlData } = supabase.storage.from(BUCKET).getPublicUrl(facePath)
      updateData.avatar_face_url = `${faceUrlData.publicUrl}?v=${version}`
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    if (error) throw error

    return new Response(JSON.stringify({ ok: true, avatarUrl: avatarUrlStored }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    console.error('[avatar API]', e)
    return new Response(JSON.stringify({ error: e?.message ?? 'Error al guardar el avatar' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
