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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${url.origin}/auth/callback`,
    },
  })

  if (error || !data.url) {
    return redirect('/auth/login?error=google')
  }

  return redirect(data.url)
}
