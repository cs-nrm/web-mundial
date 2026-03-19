import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../lib/supabase'

export const POST: APIRoute = async ({ request, cookies, redirect, url }) => {
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
