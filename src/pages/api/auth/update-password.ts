import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../lib/supabase'

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData()
  const password = form.get('password') as string
  const confirmPassword = form.get('confirm_password') as string

  if (!password || password !== confirmPassword) {
    return redirect('/auth/nueva-contrasena?error=contrasenas_no_coinciden')
  }

  if (password.length < 8) {
    return redirect('/auth/nueva-contrasena?error=contrasena_corta')
  }

  const supabase = createSupabaseServerClient(request, cookies)
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return redirect('/auth/nueva-contrasena?error=error')
  }

  return redirect('/auth/login?ok=password_actualizada')
}
