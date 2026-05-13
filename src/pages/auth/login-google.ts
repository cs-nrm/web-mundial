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

  // PUBLIC_SITE_URL en .env permite apuntar a localhost en dev
  const siteUrl = (import.meta.env.PUBLIC_SITE_URL ?? import.meta.env.SITE ?? url.origin).replace(/\/$/, '')

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
