import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../lib/supabase'

export const GET: APIRoute = async ({ url, cookies, redirect, request }) => {
  const supabase = createSupabaseServerClient(request, cookies)

  // Flow de email: confirmación de cuenta o recuperación de contraseña
  const token_hash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type')
  const next = url.searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    })

    if (error) {
      return redirect('/auth/login?error=token_invalido')
    }

    return redirect(next)
  }

  // Flow de OAuth (Google)
  const code = url.searchParams.get('code')

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return redirect('/?error=auth_callback')
    }

    if (data.user) {
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
        request.headers.get('x-real-ip') ??
        null

      await supabase.from('login_logs').insert({
        user_id:    data.user.id,
        ip,
        user_agent: request.headers.get('user-agent'),
        provider:   data.user.app_metadata?.provider ?? 'google',
      })
    }
  }

  const redirectAfter = cookies.get('auth_redirect')?.value ?? '/perfil'
  cookies.delete('auth_redirect', { path: '/' })
  return redirect(redirectAfter)
}
