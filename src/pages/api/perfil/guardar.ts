import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../lib/supabase'

export const POST: APIRoute = async ({ request, cookies, redirect, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 })
  }

  const form = await request.formData()
  const cp                 = (form.get('cp') as string)?.trim()
  const fecha_nac          = (form.get('fecha_nac') as string)?.trim()
  const genero             = (form.get('genero') as string)?.trim()
  const estacion_favorita  = (form.get('estacion_favorita') as string)?.trim()
  const medio_escucha_raw  = (form.get('medio_escucha') as string)?.trim()
  const medio_otro         = (form.get('medio_otro') as string)?.trim()
  const acepto             = form.get('acepto_aviso') === 'on'

  const medio_escucha = medio_escucha_raw === 'otro' ? (medio_otro || 'otro') : medio_escucha_raw

  if (!cp || !fecha_nac || !genero || !estacion_favorita || !medio_escucha || !acepto) {
    return new Response(JSON.stringify({ error: 'Campos incompletos' }), { status: 400 })
  }

  const supabase = createSupabaseServerClient(request, cookies)

  const { error } = await supabase.from('user_generales').upsert({
    user_id:             locals.user.id,
    cp,
    fecha_nac,
    genero,
    estacion_favorita,
    estaciones_escucha: [],
    escucha_enfoque:    false,
    medio_escucha,
    acepto_aviso:        true,
    fecha_aviso:         new Date().toISOString(),
    completed_at:        new Date().toISOString(),
  }, { onConflict: 'user_id' })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const origin = form.get('redirect_to') as string | null
  if (origin) return redirect(origin)

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
