import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../lib/supabase'

export const GET: APIRoute = async ({ url, cookies, redirect, request, site }) => {
  const redirectAfter = url.searchParams.get('redirect') ?? '/'
  cookies.set('auth_redirect', redirectAfter, {
    path: '/',
    httpOnly: true,
    maxAge: 600,
    sameSite: 'lax',
  })

  const supabase = createSupabaseServerClient(request, cookies)

  // Usar el `site` configurado en astro.config.mjs para evitar que en producción
  // se use localhost (el proceso Node corre detrás de un proxy).
  const callbackBase = site ? site.origin : url.origin

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${callbackBase}/auth/callback`,
    },
  })

  if (error || !data.url) {
    return redirect('/auth/login?error=google')
  }

  return redirect(data.url)
}
