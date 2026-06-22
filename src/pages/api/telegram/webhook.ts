import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../../lib/supabase'
// @ts-ignore
import { generateImage } from '../../../../scripts/goal-bot/image.js'
// @ts-ignore
import { captionInstagram, captionTwitter, captionFacebook } from '../../../../scripts/goal-bot/captions.js'

const STORAGE_BUCKET = 'social-posts'

function cdmxNow() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Mexico_City',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).format(new Date()).replace(' ', 'T')
}

async function postToMetricool(text: string, imageUrl: string, network: string) {
  const token  = import.meta.env.METRICOOL_TOKEN
  const userId = import.meta.env.METRICOOL_USER_ID
  const blogId = import.meta.env.METRICOOL_BLOG_ID
  const res = await fetch(
    `https://app.metricool.com/api/v2/scheduler/posts?userId=${userId}&blogId=${blogId}`,
    {
      method: 'POST',
      headers: { 'X-Mc-Auth': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publicationDate: { dateTime: cdmxNow(), timezone: 'America/Mexico_City' },
        text,
        providers: [{ network }],
        media: [imageUrl],
        autoPublish: true,
      }),
      signal: AbortSignal.timeout(20_000),
    }
  )
  return { ok: res.ok, data: await res.json().catch(() => ({})) }
}

async function publishEvent(event: any) {
  const supabase = createSupabaseAdminClient()

  const { data: rawHandles = [] } = await supabase
    .from('social_handles').select('team_name, ig, tw')
  const nk = (s: string) =>
    s?.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\.+$/, '').trim()
  const handlesMap = Object.fromEntries(
    (rawHandles ?? []).map((h: any) => [nk(h.team_name), { ig: h.ig, tw: h.tw }])
  )

  const textIg = captionInstagram(event, handlesMap)
  const textTw = captionTwitter(event, handlesMap)
  const textFb = captionFacebook(event, handlesMap)

  const imageBuffer = await generateImage(event)

  const filename = `${event.id}-${Date.now()}.jpg`
  const { error: uploadErr } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filename, imageBuffer, { contentType: 'image/jpeg', upsert: false })
  if (uploadErr) throw new Error(`Storage: ${uploadErr.message}`)

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename)
  const imageUrl = urlData.publicUrl

  const [resIg, resTw, resFb] = await Promise.all([
    postToMetricool(textIg, imageUrl, 'INSTAGRAM'),
    postToMetricool(textTw, imageUrl, 'TWITTER'),
    postToMetricool(textFb, imageUrl, 'FACEBOOK'),
  ])

  if (!resIg.ok || !resTw.ok || !resFb.ok) {
    throw new Error(`Metricool error`)
  }

  await supabase.from('goal_posts').update({
    status: 'publicado',
    published_at: new Date().toISOString(),
    metricool_response: { ig: resIg.data, tw: resTw.data, fb: resFb.data },
  }).eq('id', event.id)
}

async function answerCallback(callbackQueryId: string, text: string) {
  const token = import.meta.env.TELEGRAM_BOT_TOKEN
  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
    signal: AbortSignal.timeout(5_000),
  }).catch(() => {})
}

async function editMessage(chatId: number, messageId: number, text: string) {
  const token = import.meta.env.TELEGRAM_BOT_TOKEN
  await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId, text }),
    signal: AbortSignal.timeout(5_000),
  }).catch(() => {})
}

export const POST: APIRoute = async ({ request }) => {
  // Verificar secret token de Telegram
  const secret = request.headers.get('X-Telegram-Bot-Api-Secret-Token')
  if (secret !== import.meta.env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  let update: any
  try { update = await request.json() } catch { return new Response('ok', { status: 200 }) }

  const cq = update.callback_query
  if (!cq) return new Response('ok', { status: 200 })

  const [action, eventId] = (cq.data as string).split(':')
  const chatId    = cq.message.chat.id as number
  const messageId = cq.message.message_id as number

  // Responder inmediatamente para quitar el "loading" del botón
  await answerCallback(cq.id, action === 'retry' ? '⏳ Publicando…' : '✓ Ignorado')

  const supabase = createSupabaseAdminClient()

  if (action === 'ignore') {
    await supabase.from('goal_posts').update({ status: 'descartado' }).eq('id', eventId)
    await editMessage(chatId, messageId, cq.message.text + '\n\n✗ Ignorado')
    return new Response('ok', { status: 200 })
  }

  if (action === 'retry') {
    const { data: event, error } = await supabase
      .from('goal_posts').select('*').eq('id', eventId).single()

    if (error || !event) {
      await editMessage(chatId, messageId, cq.message.text + '\n\n⚠️ Evento no encontrado')
      return new Response('ok', { status: 200 })
    }

    // Resetear a pendiente antes de reintentar
    await supabase.from('goal_posts').update({ status: 'pendiente', error_detail: null }).eq('id', eventId)

    try {
      await publishEvent(event)
      await editMessage(chatId, messageId, cq.message.text + '\n\n✅ Publicado correctamente')
    } catch (err: any) {
      await supabase.from('goal_posts').update({
        status: 'error',
        error_detail: err.message,
      }).eq('id', eventId)
      await editMessage(chatId, messageId, cq.message.text + `\n\n⚠️ Error al reintentar: ${err.message.slice(0, 100)}`)
    }
  }

  return new Response('ok', { status: 200 })
}
