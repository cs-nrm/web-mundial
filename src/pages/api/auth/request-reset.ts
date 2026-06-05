import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../lib/supabase'
import { rateLimit, getClientIp } from '../../../lib/rate-limit'

export const POST: APIRoute = async ({ request, cookies, redirect, url }) => {
  // Anti spam de correos de reset: máx 5 por IP cada 15 min
  const rl = rateLimit(`reset:${getClientIp(request)}`, 5, 15 * 60_000)
  if (!rl.allowed) {
    return redirect('/auth/reset?ok=1') // misma respuesta para no filtrar info
  }

  const form = await request.formData()
  const email = (form.get('email') as string)?.trim()

  if (!email) {
    return redirect('/auth/reset?error=email_requerido')
  }

  const supabase = createSupabaseServerClient(request, cookies)
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${url.origin}/auth/callback?next=/auth/nueva-contrasena`,
  })

  // Siempre regresar ok para no revelar si el correo existe
  return redirect('/auth/reset?ok=1')
}
