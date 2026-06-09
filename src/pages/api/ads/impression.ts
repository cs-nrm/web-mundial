import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../../lib/supabase'

export const POST: APIRoute = async ({ request }) => {
  try {
    const { creative_id, client_id, slot_type, slot_id, page_url } = await request.json()
    if (!creative_id || !client_id) return new Response(null, { status: 204 })

    const supabase = createSupabaseAdminClient()
    await supabase.from('ad_impressions').insert({
      creative_id,
      client_id,
      slot_type: slot_type ?? null,
      slot_id: slot_id ?? null,
      page_url: page_url ?? null,
    })
  } catch {
    // silencioso — impresiones no deben romper la página
  }
  return new Response(null, { status: 204 })
}
