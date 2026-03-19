import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { AstroCookies } from 'astro'

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY

// Cliente admin con service role key — solo usar en endpoints de servidor
export function createSupabaseAdminClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export function createSupabaseServerClient(request: Request, cookies: AstroCookies) {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '')
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookies.set(name, value, options)
        })
      },
    },
  })
}
