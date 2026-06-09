import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../../lib/supabase'

export const GET: APIRoute = async ({ url }) => {
  const creativeId = url.searchParams.get('id')
  if (!creativeId) return new Response(null, { status: 400 })

  const supabase = createSupabaseAdminClient()

  const { data: creative } = await supabase
    .from('ad_creatives')
    .select('id, href, client_id')
    .eq('id', creativeId)
    .single()

  if (!creative?.href) return new Response(null, { status: 404 })

  await supabase.from('ad_clicks').insert({
    creative_id: creative.id,
    client_id: creative.client_id,
    slot_type: url.searchParams.get('slot') ?? null,
    slot_id: url.searchParams.get('div') ?? null,
    page_url: url.searchParams.get('page') ?? null,
  })

  return new Response(null, {
    status: 302,
    headers: { Location: creative.href },
  })
}
