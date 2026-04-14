import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../lib/supabase'

export const GET: APIRoute = async ({ url, cookies, redirect, request }) => {
  const redirectAfter = url.searchParams.get('redirect') ?? '/'
  cookies.set('auth_redirect', redirectAfter, {
    path: '/',
    httpOnly: true,
    maxAge: 600,
    sameSite: 'lax',
  })

  const supabase = createSupabaseServerClient(request, cookies)

  // import.meta.env.SITE se hornea en el build desde astro.config.mjs
  // y nunca contiene localhost, a diferencia de url.origin que depende del proxy.
  const siteUrl = import.meta.env.SITE?.replace(/\/$/, '') ?? url.origin

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error || !data.url) {
    return redirect('/auth/login?error=google')
  }

  return redirect(data.url)
}
