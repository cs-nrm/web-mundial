import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../lib/supabase'

export const GET: APIRoute = async ({ cookies, redirect, request }) => {
  const supabase = createSupabaseServerClient(request, cookies)
  await supabase.auth.signOut()
  return redirect('/')
}
