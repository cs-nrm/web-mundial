import { createClient } from '@supabase/supabase-js'
import { generateImage } from './image.js'
import { captionInstagram, captionTwitter, captionFacebook } from './captions.js'
import { markPublished, markError, updateStatusDetail } from './db.js'

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

const PROGRESS_LABELS = {
  recibido:        'EVENTO RECIBIDO...',
  generando_imagen:'✓ EVENTO RECIBIDO\nGENERANDO IMAGEN...',
  posteando:       '✓ EVENTO RECIBIDO\n✓ IMAGEN GENERADA\nPOSTEANDO...',
  publicado:       '✓ EVENTO RECIBIDO\n✓ IMAGEN GENERADA\n✓ POSTEADO EXITOSAMENTE',
}

async function sendProgressMessage(event) {
  const token  = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return null

  const label = {
    gol:          `Gol${event.player_name ? ` de ${event.player_name}` : ''}${event.minute ? ` (${event.minute}')` : ''}`,
    inicio:       'Inicio de partido',
    medio_tiempo: 'Medio tiempo',
    final:        'Final del partido',
  }[event.event_type] ?? event.event_type

  const score = event.score_home !== undefined ? ` ${event.score_home}–${event.score_away}` : ''
  const match = `${event.team_home}${score} vs ${event.team_away}`

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `${label}\n${match}\n\n${PROGRESS_LABELS.recibido}`,
      }),
      signal: AbortSignal.timeout(10_000),
    })
    const data = await res.json()
    return data.ok ? { messageId: data.result.message_id, chatId } : null
  } catch { return null }
}

async function editProgressMessage(chatId, messageId, step, event, extra = '') {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return

  const label = {
    gol:          `Gol${event.player_name ? ` de ${event.player_name}` : ''}${event.minute ? ` (${event.minute}')` : ''}`,
    inicio:       'Inicio de partido',
    medio_tiempo: 'Medio tiempo',
    final:        'Final del partido',
  }[event.event_type] ?? event.event_type

  const score = event.score_home !== undefined ? ` ${event.score_home}–${event.score_away}` : ''
  const match = `${event.team_home}${score} vs ${event.team_away}`
  const body  = PROGRESS_LABELS[step] ?? step

  await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text: `${label}\n${match}\n\n${body}${extra}`,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    }),
    signal: AbortSignal.timeout(5_000),
  }).catch(() => {})
}

async function editProgressMessageError(chatId, messageId, errorObj, event) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return

  const label = {
    gol:          `Gol${event.player_name ? ` de ${event.player_name}` : ''}${event.minute ? ` (${event.minute}')` : ''}`,
    inicio:       'Inicio de partido',
    medio_tiempo: 'Medio tiempo',
    final:        'Final del partido',
  }[event.event_type] ?? event.event_type

  const score = event.score_home !== undefined ? ` ${event.score_home}–${event.score_away}` : ''
  const match = `${event.team_home}${score} vs ${event.team_away}`
  const steps = {
    imagen:    '✓ EVENTO RECIBIDO\n✗ GENERANDO IMAGEN\n— POSTEANDO',
    storage:   '✓ EVENTO RECIBIDO\n✓ IMAGEN GENERADA\n✗ SUBIENDO A STORAGE',
    metricool: '✓ EVENTO RECIBIDO\n✓ IMAGEN GENERADA\n✗ POSTEANDO',
  }
  const stepLog = steps[errorObj?.step] ?? '✗ EVENTO RECIBIDO'
  const err = errorObj?.message?.slice(0, 150) || 'Error desconocido'

  await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text: `[ERROR] ${label}\n${match}\n\n${stepLog}\n\n\`${err}\``,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: 'Reintentar', callback_data: `retry:${event.id}` },
          { text: 'Ignorar',    callback_data: `ignore:${event.id}` },
        ]],
      },
    }),
    signal: AbortSignal.timeout(5_000),
  }).catch(() => {})
}

// Construye los captions por red a partir de los handles guardados
async function buildCaptions(event) {
  const supabase = getSupabase()
  const { data: rawHandles = [] } = await supabase
    .from('social_handles').select('team_name, ig, tw')
  const normalizeKey = (s) =>
    s?.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\.+$/, '').trim()
  const handlesMap = Object.fromEntries(
    (rawHandles ?? []).map((h) => [normalizeKey(h.team_name), { ig: h.ig, tw: h.tw }])
  )
  return {
    textIg: captionInstagram(event, handlesMap),
    textTw: captionTwitter(event, handlesMap),
    textFb: captionFacebook(event, handlesMap),
  }
}

// Genera la imagen y la sube a Storage; devuelve la URL pública. Lanza error con .step
async function generateAndUpload(event) {
  const supabase = getSupabase()

  let imageBuffer
  try {
    imageBuffer = await generateImage(event)
  } catch (e) {
    const err = new Error(e.message)
    err.step = 'imagen'
    throw err
  }

  const filename = `${event.id}-${Date.now()}.jpg`
  const { error: uploadErr } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filename, imageBuffer, { contentType: 'image/jpeg', upsert: false })
  if (uploadErr) {
    const err = new Error(`Storage: ${uploadErr.message}`)
    err.step = 'storage'
    throw err
  }

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename)
  return urlData.publicUrl
}

// Guarda la URL de la imagen en el evento para mostrarla en el admin. Nunca lanza
// (si la columna image_url aún no existe, solo avisa en consola).
async function saveImageUrl(id, imageUrl) {
  try {
    const supabase = getSupabase()
    const { error } = await supabase.from('goal_posts').update({ image_url: imageUrl }).eq('id', id)
    if (error) console.warn(`[publisher] No se pudo guardar image_url: ${error.message}`)
  } catch (e) {
    console.warn(`[publisher] image_url: ${e.message}`)
  }
}

// Intento puro — lanza error con paso fallido, no toca la DB de estado
async function publishEventOnce(event, onProgress = () => {}) {
  const { textIg, textTw, textFb } = await buildCaptions(event)

  // Pasos 1-2: generar imagen + subir a Storage
  onProgress('generando_imagen')
  const imageUrl = await generateAndUpload(event)
  await saveImageUrl(event.id, imageUrl)

  // Paso 3: Postear a Metricool
  onProgress('posteando')
  let resIg, resTw, resFb
  try {
    ;[resIg, resTw, resFb] = await Promise.all([
      postToMetricool(textIg, imageUrl, 'INSTAGRAM'),
      postToMetricool(textTw, imageUrl, 'TWITTER'),
      postToMetricool(textFb, imageUrl, 'FACEBOOK'),
    ])
  } catch (e) {
    const err = new Error(e.message)
    err.step = 'metricool'
    throw err
  }

  if (!resIg.ok || !resTw.ok || !resFb.ok) {
    const err = new Error(`Metricool: ${JSON.stringify({ ig: resIg.data, tw: resTw.data, fb: resFb.data }).slice(0, 200)}`)
    err.step = 'metricool'
    throw err
  }

  await markPublished(event.id, { ig: resIg.data, tw: resTw.data, fb: resFb.data })
  return { imageUrl }
}

function formatEvent(event) {
  const score = event.score_home !== undefined ? ` ${event.score_home}–${event.score_away}` : ''
  const match = `${event.team_home} vs ${event.team_away}`
  const tag = {
    gol:          `[GOL]${event.player_name ? ` ${event.player_name}` : ''}${event.minute ? ` (${event.minute}')` : ''}${score}`,
    inicio:       `[INICIO DE PARTIDO]${score}`,
    medio_tiempo: `[MEDIO TIEMPO]${score}`,
    final:        `[FINAL]${score}`,
  }[event.event_type] ?? `[${event.event_type.toUpperCase()}]`
  return { match, tag }
}

async function tgSend(text, extra = {}) {
  const token  = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, parse_mode: 'HTML', disable_web_page_preview: true, text, ...extra }),
    signal: AbortSignal.timeout(10_000),
  }).catch(e => console.error('[telegram] Error:', e.message))
}

// Envía la imagen como foto a Telegram (la URL pública del storage)
async function tgSendPhoto(photoUrl, caption) {
  const token  = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return
  await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, photo: photoUrl, caption: caption?.slice(0, 1024) }),
    signal: AbortSignal.timeout(15_000),
  }).catch(e => console.error('[telegram] Error sendPhoto:', e.message))
}

async function notifySuccess(event, imageUrl) {
  const { match, tag } = formatEvent(event)
  const imgLine = imageUrl ? `\n<a href="${imageUrl}">Ver imagen</a>` : ''
  await tgSend(`${match}\n${tag}\n\n✓ Recibido\n✓ Imagen generada\n✓ Publicado IG · TW · FB${imgLine}`)
}

// Modo sin posteo: genera imagen + la guarda en storage + la manda por Telegram para publicar a mano.
// NO toca Metricool. Lanza error con .step si falla la imagen/storage.
async function previewToTelegram(event) {
  await updateStatusDetail(event.id, 'generando_imagen').catch(() => {})
  const imageUrl = await generateAndUpload(event)
  await saveImageUrl(event.id, imageUrl)
  await updateStatusDetail(event.id, null).catch(() => {})

  const { textIg, textTw, textFb } = await buildCaptions(event)
  const { match, tag } = formatEvent(event)

  // Mensaje 1: la imagen con encabezado corto
  await tgSendPhoto(imageUrl, `🖼️ ${match} ${tag}`)

  // Mensaje 2: textos listos para copiar. Cada bloque <pre> trae botón de copiar en Telegram.
  const esc = (s) => (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const copyMsg = [
    '📋 Para copiar:',
    '',
    'Instagram',
    `<pre>${esc(textIg)}</pre>`,
    'X / Twitter',
    `<pre>${esc(textTw)}</pre>`,
    'Facebook',
    `<pre>${esc(textFb)}</pre>`,
  ].join('\n')
  await tgSend(copyMsg)

  return { imageUrl }
}

// Notificación Telegram con botones inline
async function notifyTelegram(event, errorObj) {
  const { match, tag } = formatEvent(event)
  const err = errorObj?.message?.slice(0, 150) || 'Error desconocido'
  const steps = {
    imagen:    `✓ Recibido\n✗ Imagen generada\n— Publicado en redes`,
    storage:   `✓ Recibido\n✓ Imagen generada\n✗ Subida a storage`,
    metricool: `✓ Recibido\n✓ Imagen generada\n✗ Publicado en redes`,
  }
  const stepLog = steps[errorObj?.step] ?? `✗ Recibido`
  await tgSend(
    `${match}\n${tag}\n\n${stepLog}\n\n[ERROR] <code>${err}</code>`,
    {
      reply_markup: {
        inline_keyboard: [[
          { text: 'Reintentar', callback_data: `retry:${event.id}` },
          { text: 'Ignorar',    callback_data: `ignore:${event.id}` },
        ]],
      },
    }
  )
}

export async function notifyVarAnnulment(goal, teams) {
  const score = `${teams.scoreHome}–${teams.scoreAway}`
  const match = `${teams.teamHome} vs ${teams.teamAway}`
  const player = goal.playerName ? ` ${goal.playerName}` : ''
  const minute = goal.minute ? ` (${goal.minute}')` : ''
  const sep = `**********************************`
  await tgSend(`${match}\n[GOL ANULADO]${player}${minute} | ${score}\n\n${sep}\nBORRALO MANUALMENTE DE LAS REDES\n${sep}`)
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
    // Posteo desactivado: generar imagen, guardarla y enviarla por Telegram para publicar a mano.
    console.log(`[publisher] Posteo desactivado — imagen a Telegram, sin postear (evento ${event.id})`)
    try {
      await withTimeout(previewToTelegram(event), TIMEOUT_MS)
      console.log(`[publisher] 🖼️ Evento ${event.id} enviado a Telegram (sin postear), queda en cola`)
    } catch (err) {
      console.error(`[publisher] Error en modo sin posteo: ${err.message}`)
      await markError(event.id, err.message).catch(() => {})
      await notifyTelegram(event, err).catch(() => {})
    }
    return false
  }

  await updateStatusDetail(event.id, 'recibido').catch(() => {})

  const onProgress = (step) => {
    updateStatusDetail(event.id, step).catch(() => {})
  }

  let lastError = null

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { imageUrl } = await withTimeout(publishEventOnce(event, onProgress), TIMEOUT_MS)
      console.log(`[publisher] ✅ Evento ${event.id} publicado (intento ${attempt}/${MAX_ATTEMPTS})`)
      await updateStatusDetail(event.id, null).catch(() => {})
      await notifySuccess(event, imageUrl)
      return true
    } catch (err) {
      lastError = err
      console.error(`[publisher] Intento ${attempt}/${MAX_ATTEMPTS} fallido: ${err.message}`)
      if (attempt < MAX_ATTEMPTS) {
        console.log(`[publisher] Reintentando en ${RETRY_DELAY_MS / 1000}s…`)
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
      }
    }
  }

  // Ambos intentos fallaron
  await markError(event.id, lastError.message)
  await notifyTelegram(event, lastError)
  return false
}
