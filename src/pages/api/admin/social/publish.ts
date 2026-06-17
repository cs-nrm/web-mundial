import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../../../lib/supabase'
import { canAccess, MANAGE_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'
// @ts-ignore – JS module in scripts/, Node SSR context
import { generateImage } from '../../../../../scripts/goal-bot/image.js'
// @ts-ignore
import { captionInstagram, captionTwitter, captionFacebook } from '../../../../../scripts/goal-bot/captions.js'

const STORAGE_BUCKET = 'social-posts'

function cdmxDateTimeString(offsetMs = 0) {
  const d = new Date(Date.now() + offsetMs)
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Mexico_City',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).format(d).replace(' ', 'T')
}

async function postToMetricool(
  token: string,
  userId: string,
  blogId: string,
  text: string,
  imageUrl: string,
  providers: { network: string }[],
) {
  const res = await fetch(
    `https://app.metricool.com/api/v2/scheduler/posts?userId=${userId}&blogId=${blogId}`,
    {
      method: 'POST',
      headers: { 'X-Mc-Auth': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publicationDate: { dateTime: cdmxDateTimeString(5 * 60_000), timezone: 'America/Mexico_City' },
        text,
        providers,
        media: [imageUrl],
        autoPublish: true,
      }),
      signal: AbortSignal.timeout(20_000),
    }
  )
  const data = await res.json()
  return { ok: res.ok, status: res.status, data }
}

export const POST: APIRoute = async ({ request, locals }) => {
  if (!canAccess(locals.role as UserRole, MANAGE_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  let body: { eventId?: string; captionIg?: string; captionTw?: string; captionFb?: string }
  try { body = await request.json() } catch { return new Response('Bad request', { status: 400 }) }

  const { eventId, captionIg: rawIg, captionTw: rawTw, captionFb: rawFb } = body
  if (!eventId) return new Response('eventId requerido', { status: 400 })

  const supabase = createSupabaseAdminClient()
  const { data: event, error: fetchErr } = await supabase
    .from('goal_posts').select('*').eq('id', eventId).single()

  if (fetchErr || !event) {
    return new Response(JSON.stringify({ error: 'Evento no encontrado' }), { status: 404 })
  }

  if (event.status === 'publicado') {
    return new Response(JSON.stringify({ error: 'Este evento ya fue publicado' }), { status: 409 })
  }

  const textIg = rawIg?.trim() || captionInstagram(event) || ''
  const textTw = rawTw?.trim() || captionTwitter(event)   || ''
  const textFb = rawFb?.trim() || captionFacebook(event)  || ''

  // 1. Generar imagen
  let imageBuffer: Buffer
  try {
    imageBuffer = await generateImage(event)
  } catch (err: any) {
    return new Response(JSON.stringify({ error: `Error al generar imagen: ${err.message}` }), { status: 500 })
  }

  // 2. Subir a Supabase Storage
  const filename = `${event.id}-${Date.now()}.jpg`
  const { error: uploadErr } = await supabase.storage
    .from(STORAGE_BUCKET).upload(filename, imageBuffer, { contentType: 'image/jpeg', upsert: false })

  if (uploadErr) {
    return new Response(JSON.stringify({ error: `Error al subir imagen: ${uploadErr.message}` }), { status: 500 })
  }

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename)
  const imageUrl = urlData.publicUrl

  const token  = import.meta.env.METRICOOL_TOKEN
  const userId = import.meta.env.METRICOOL_USER_ID
  const blogId = import.meta.env.METRICOOL_BLOG_ID

  if (!token || !userId || !blogId) {
    return new Response(JSON.stringify({ error: 'Credenciales de Metricool no configuradas' }), { status: 500 })
  }

  // 3. Enviar a Metricool como borradores (autoPublish: false)
  const [resIg, resTw, resFb] = await Promise.all([
    postToMetricool(token, userId, blogId, textIg, imageUrl, [{ network: 'INSTAGRAM' }]),
    postToMetricool(token, userId, blogId, textTw, imageUrl, [{ network: 'TWITTER' }]),
    postToMetricool(token, userId, blogId, textFb, imageUrl, [{ network: 'FACEBOOK' }]),
  ])

  const anyError = !resIg.ok || !resTw.ok || !resFb.ok
  if (anyError) {
    const detail = JSON.stringify({ ig: resIg.data, tw: resTw.data, fb: resFb.data })
    await supabase.from('goal_posts').update({ status: 'error', error_detail: detail }).eq('id', eventId)
    return new Response(
      JSON.stringify({ error: 'Metricool rechazó uno o más borradores', ig: resIg, tw: resTw, fb: resFb }),
      { status: 502 }
    )
  }

  // 4. Marcar como publicado
  await supabase.from('goal_posts').update({
    status: 'publicado',
    published_at: new Date().toISOString(),
    metricool_response: { ig: resIg.data, tw: resTw.data, fb: resFb.data },
  }).eq('id', eventId)

  return new Response(
    JSON.stringify({ ok: true, imageUrl, ig: resIg.data, tw: resTw.data, fb: resFb.data }),
    { status: 200 }
  )
}
