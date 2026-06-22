import { createClient } from '@supabase/supabase-js'
import { generateImage } from './image.js'
import { captionInstagram, captionTwitter, captionFacebook } from './captions.js'
import { markPublished, markError } from './db.js'

const STORAGE_BUCKET = 'social-posts'
const MAX_ATTEMPTS   = 2
const TIMEOUT_MS     = 45_000
const RETRY_DELAY_MS = 5_000

function getSupabase() {
  return createClient(
    process.env.PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

function cdmxNow() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Mexico_City',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).format(new Date()).replace(' ', 'T')
}

function withTimeout(promise, ms) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout después de ${ms / 1000}s`)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

async function postToMetricool(text, imageUrl, network) {
  const token  = process.env.METRICOOL_TOKEN
  const userId = process.env.METRICOOL_USER_ID
  const blogId = process.env.METRICOOL_BLOG_ID
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
  return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({})) }
}

// Intento puro — lanza error si algo falla, no toca la DB de estado
async function publishEventOnce(event) {
  const supabase = getSupabase()

  const { data: rawHandles = [] } = await supabase
    .from('social_handles').select('team_name, ig, tw')
  const normalizeKey = (s) =>
    s?.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\.+$/, '').trim()
  const handlesMap = Object.fromEntries(
    (rawHandles ?? []).map((h) => [normalizeKey(h.team_name), { ig: h.ig, tw: h.tw }])
  )

  const textIg = captionInstagram(event, handlesMap)
  const textTw = captionTwitter(event, handlesMap)
  const textFb = captionFacebook(event, handlesMap)

  // Generar imagen
  const imageBuffer = await generateImage(event)

  // Subir a Storage
  const filename = `${event.id}-${Date.now()}.jpg`
  const { error: uploadErr } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filename, imageBuffer, { contentType: 'image/jpeg', upsert: false })
  if (uploadErr) throw new Error(`Storage: ${uploadErr.message}`)

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename)
  const imageUrl = urlData.publicUrl

  // Postear a Metricool
  const [resIg, resTw, resFb] = await Promise.all([
    postToMetricool(textIg, imageUrl, 'INSTAGRAM'),
    postToMetricool(textTw, imageUrl, 'TWITTER'),
    postToMetricool(textFb, imageUrl, 'FACEBOOK'),
  ])

  if (!resIg.ok || !resTw.ok || !resFb.ok) {
    throw new Error(`Metricool: ${JSON.stringify({ ig: resIg.data, tw: resTw.data, fb: resFb.data }).slice(0, 200)}`)
  }

  await markPublished(event.id, { ig: resIg.data, tw: resTw.data, fb: resFb.data })
}

// Notificación Telegram con botones inline
async function notifyTelegram(event, errorMsg) {
  const token  = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const label = {
    gol:          `⚽ Gol${event.player_name ? ` — ${event.player_name}` : ''}${event.minute ? ` ${event.minute}'` : ''}`,
    inicio:       '🟢 Inicio de partido',
    medio_tiempo: '🔵 Medio tiempo',
    final:        '🏁 Final',
  }[event.event_type] ?? event.event_type

  const score = event.score_home !== undefined ? `${event.score_home}–${event.score_away}` : ''
  const match = `${event.team_home} ${score} ${event.team_away}`.trim()
  const err   = errorMsg?.slice(0, 150) || 'Error desconocido'

  const text = `⚠️ *Error al publicar* (2 intentos fallidos)\n\n${label}\n${match}\n\n\`${err}\``

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '🔄 Reintentar', callback_data: `retry:${event.id}` },
          { text: '✗ Ignorar',    callback_data: `ignore:${event.id}` },
        ]],
      },
    }),
    signal: AbortSignal.timeout(10_000),
  }).catch(e => console.error('[telegram] Error enviando notificación:', e.message))
}

async function isAutoPublishEnabled() {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('social_config').select('auto_publish').eq('id', 'main').maybeSingle()
  return data?.auto_publish ?? true
}

// Export principal — 2 intentos × 45s, Telegram si ambos fallan
export async function autoPublish(event) {
  const enabled = await isAutoPublishEnabled()
  if (!enabled) {
    console.log(`[publisher] Modo automático desactivado — evento ${event.id} queda en cola`)
    return false
  }

  let lastError = null

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await withTimeout(publishEventOnce(event), TIMEOUT_MS)
      console.log(`[publisher] ✅ Evento ${event.id} publicado (intento ${attempt}/${MAX_ATTEMPTS})`)
      return true
    } catch (err) {
      lastError = err
      console.error(`[publisher] Intento ${attempt}/${MAX_ATTEMPTS} fallido para evento ${event.id}: ${err.message}`)
      if (attempt < MAX_ATTEMPTS) {
        console.log(`[publisher] Reintentando en ${RETRY_DELAY_MS / 1000}s…`)
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
      }
    }
  }

  // Ambos intentos fallaron
  await markError(event.id, lastError.message)
  await notifyTelegram(event, lastError.message)
  return false
}
