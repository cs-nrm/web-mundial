import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../lib/supabase'

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerClient(request, cookies)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let code: string
  try {
    const body = await request.json()
    code = (body.code ?? '').trim().toUpperCase()
  } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!code) {
    return new Response(JSON.stringify({ error: 'Código requerido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { data, error } = await supabase.rpc('redimir_codigo', { p_code: code })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // data contiene { ok, message, card_id, card_name, card_image, posicion }
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
