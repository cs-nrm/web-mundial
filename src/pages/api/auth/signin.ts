import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../lib/supabase'
import { rateLimit, getClientIp } from '../../../lib/rate-limit'

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData()
  const email = (form.get('email') as string)?.trim()
  const password = form.get('password') as string
  const redirectAfter = (form.get('redirect') as string) || '/'

  // Máx 8 intentos por IP cada 5 minutos
  const rl = rateLimit(`signin:${getClientIp(request)}`, 8, 5 * 60_000)
  if (!rl.allowed) {
    return redirect(`/auth/login?error=demasiados_intentos&redirect=${encodeURIComponent(redirectAfter)}`)
  }

  if (!email || !password) {
    return redirect(`/auth/login?error=campos_requeridos&redirect=${encodeURIComponent(redirectAfter)}`)
  }

  const supabase = createSupabaseServerClient(request, cookies)
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const msg =
      error.message.includes('Invalid login credentials') ? 'credenciales' :
      error.message.includes('Email not confirmed') ? 'email_no_confirmado' :
      'error'
    return redirect(`/auth/login?error=${msg}&redirect=${encodeURIComponent(redirectAfter)}`)
  }

  return redirect(redirectAfter)
}
