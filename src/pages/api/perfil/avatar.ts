import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../lib/supabase'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const { user } = locals as any
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { imageData, config } = await request.json()

    if (!imageData || !imageData.startsWith('data:image/png;base64,')) {
      return new Response(JSON.stringify({ error: 'Imagen inválida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const base64 = imageData.replace(/^data:image\/png;base64,/, '')
    const buffer = Buffer.from(base64, 'base64')

    const avatarsDir = join(process.cwd(), 'public', 'avatars')
    await mkdir(avatarsDir, { recursive: true })

    const filename = `${user.id}.png`
    await writeFile(join(avatarsDir, filename), buffer)

    const avatarUrl = `/avatars/${filename}?v=${Date.now()}`

    const supabase = createSupabaseServerClient(request, cookies)
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: `/avatars/${filename}`, avatar_config: config })
      .eq('id', user.id)

    if (error) throw error

    return new Response(JSON.stringify({ ok: true, avatarUrl }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    console.error('[avatar API]', e)
    return new Response(JSON.stringify({ error: 'Error al guardar el avatar' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
