import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../lib/supabase'
import { rateLimit, getClientIp } from '../../../lib/rate-limit'

export const POST: APIRoute = async ({ request, cookies, redirect, url }) => {
  const form = await request.formData()
  const email = (form.get('email') as string)?.trim()
  const password = form.get('password') as string
  const confirmPassword = form.get('confirm_password') as string
  const redirectAfter = (form.get('redirect') as string) || '/'

  // Máx 5 registros por IP cada 15 minutos
  const rl = rateLimit(`signup:${getClientIp(request)}`, 5, 15 * 60_000)
  if (!rl.allowed) {
    return redirect(`/auth/registro?error=demasiados_intentos&redirect=${encodeURIComponent(redirectAfter)}`)
  }

  if (!email || !password || !confirmPassword) {
    return redirect(`/auth/registro?error=campos_requeridos&redirect=${encodeURIComponent(redirectAfter)}`)
  }

  if (password !== confirmPassword) {
    return redirect(`/auth/registro?error=contrasenas_no_coinciden&redirect=${encodeURIComponent(redirectAfter)}`)
  }

  if (password.length < 8) {
    return redirect(`/auth/registro?error=contrasena_corta&redirect=${encodeURIComponent(redirectAfter)}`)
  }

  const supabase = createSupabaseServerClient(request, cookies)
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${url.origin}/auth/callback`,
    },
  })

  if (error) {
    const msg =
      error.message.includes('already registered') ? 'email_en_uso' :
      error.message.toLowerCase().includes('rate limit') ? 'limite_emails' :
      'error'
    return redirect(`/auth/registro?error=${msg}&redirect=${encodeURIComponent(redirectAfter)}`)
  }

  return redirect('/auth/confirmar')
}
