import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../lib/supabase'

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData()
  const email = (form.get('email') as string)?.trim()
  const password = form.get('password') as string
  const redirectAfter = (form.get('redirect') as string) || '/'

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
