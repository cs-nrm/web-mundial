import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../../../lib/supabase'
import { canAccess, MANAGE_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'
// @ts-ignore – JS module in scripts/, Node SSR context
import { generateImage } from '../../../../../scripts/goal-bot/image.js'
// @ts-ignore
import { captionForEvent } from '../../../../../scripts/goal-bot/captions.js'

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

export const POST: APIRoute = async ({ request, locals }) => {
  if (!canAccess(locals.role as UserRole, MANAGE_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  let body: { eventId?: string; caption?: string }
  try { body = await request.json() } catch { return new Response('Bad request', { status: 400 }) }

  const { eventId, caption: rawCaption } = body
  if (!eventId) return new Response('eventId requerido', { status: 400 })

  const supabase = createSupabaseAdminClient()
  const { data: event, error: fetchErr } = await supabase
    .from('goal_posts')
    .select('*')
    .eq('id', eventId)
    .single()

  if (fetchErr || !event) {
    return new Response(JSON.stringify({ error: 'Evento no encontrado' }), { status: 404 })
  }

  const caption = rawCaption?.trim() || captionForEvent(event) || ''

  if (event.status === 'publicado') {
    return new Response(JSON.stringify({ error: 'Este evento ya fue publicado' }), { status: 409 })
  }

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
    .from(STORAGE_BUCKET)
    .upload(filename, imageBuffer, { contentType: 'image/jpeg', upsert: false })

  if (uploadErr) {
    return new Response(JSON.stringify({ error: `Error al subir imagen: ${uploadErr.message}` }), { status: 500 })
  }

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename)
  const imageUrl = urlData.publicUrl

  // 3. Publicar en Metricool
  const metricoolToken = import.meta.env.METRICOOL_TOKEN
  const metricoolUserId = import.meta.env.METRICOOL_USER_ID
  const metricoolBlogId = import.meta.env.METRICOOL_BLOG_ID

  if (!metricoolToken || !metricoolUserId || !metricoolBlogId) {
    return new Response(JSON.stringify({ error: 'Credenciales de Metricool no configuradas' }), { status: 500 })
  }

  const metricoolPayload = {
    publicationDate: {
      dateTime: cdmxDateTimeString(2 * 60_000),
      timezone: 'America/Mexico_City',
    },
    text: caption,
    providers: [
      { network: 'FACEBOOK' },
      { network: 'INSTAGRAM' },
      { network: 'TWITTER' },
    ],
    media: [imageUrl],
    autoPublish: true,
  }

  let metricoolResponse: unknown
  try {
    const mcRes = await fetch(
      `https://app.metricool.com/api/v2/scheduler/posts?userId=${metricoolUserId}&blogId=${metricoolBlogId}`,
      {
        method: 'POST',
        headers: {
          'X-Mc-Auth': metricoolToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metricoolPayload),
        signal: AbortSignal.timeout(20_000),
      }
    )
    metricoolResponse = await mcRes.json()
    if (!mcRes.ok) {
      await supabase.from('goal_posts').update({ status: 'error', error_detail: JSON.stringify(metricoolResponse) }).eq('id', eventId)
      return new Response(JSON.stringify({ error: 'Metricool rechazó el post', detail: metricoolResponse }), { status: 502 })
    }
  } catch (err: any) {
    await supabase.from('goal_posts').update({ status: 'error', error_detail: err.message }).eq('id', eventId)
    return new Response(JSON.stringify({ error: `Error conectando con Metricool: ${err.message}` }), { status: 500 })
  }

  // 4. Marcar como publicado en DB
  await supabase.from('goal_posts').update({
    status: 'publicado',
    published_at: new Date().toISOString(),
    metricool_response: metricoolResponse,
  }).eq('id', eventId)

  return new Response(JSON.stringify({ ok: true, imageUrl, metricool: metricoolResponse }), { status: 200 })
}
