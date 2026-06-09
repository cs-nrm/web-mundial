import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../../lib/supabase'

export const GET: APIRoute = async () => {
  const supabase = createSupabaseAdminClient()

  const { data: clients } = await supabase
    .from('ad_clients')
    .select(`
      id,
      name,
      ad_creatives (
        id,
        slot_type,
        type,
        src,
        href,
        alt,
        html_code
      )
    `)
    .eq('active', true)
    .eq('ad_creatives.active', true)
    .order('created_at', { ascending: true })

  return new Response(JSON.stringify({ clients: clients ?? [] }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}
