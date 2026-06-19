import { createClient } from '@supabase/supabase-js'
import { generateImage } from './image.js'
import { captionInstagram, captionTwitter, captionFacebook } from './captions.js'
import { markPublished, markError } from './db.js'

const STORAGE_BUCKET = 'social-posts'

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

async function isAutoPublishEnabled() {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('social_config').select('auto_publish').eq('id', 'main').maybeSingle()
  return data?.auto_publish ?? true
}

export async function autoPublish(event) {
  const enabled = await isAutoPublishEnabled()
  if (!enabled) {
    console.log(`[publisher] Modo automático desactivado — evento ${event.id} queda en cola`)
    return false
  }

  const supabase = getSupabase()

  // Fetch handles para los captions
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
  let imageBuffer
  try {
    imageBuffer = await generateImage(event)
  } catch (err) {
    await markError(event.id, `Error imagen: ${err.message}`)
    console.error(`[publisher] Error generando imagen para evento ${event.id}:`, err.message)
    return false
  }

  // Subir a Supabase Storage
  const filename = `${event.id}-${Date.now()}.jpg`
  const { error: uploadErr } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filename, imageBuffer, { contentType: 'image/jpeg', upsert: false })

  if (uploadErr) {
    await markError(event.id, `Error storage: ${uploadErr.message}`)
    console.error(`[publisher] Error subiendo imagen para evento ${event.id}:`, uploadErr.message)
    return false
  }

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename)
  const imageUrl = urlData.publicUrl

  // Postear a Metricool
  const [resIg, resTw, resFb] = await Promise.all([
    postToMetricool(textIg, imageUrl, 'INSTAGRAM'),
    postToMetricool(textTw, imageUrl, 'TWITTER'),
    postToMetricool(textFb, imageUrl, 'FACEBOOK'),
  ])

  if (!resIg.ok || !resTw.ok || !resFb.ok) {
    const detail = JSON.stringify({ ig: resIg.data, tw: resTw.data, fb: resFb.data })
    await markError(event.id, detail)
    console.error(`[publisher] Error Metricool para evento ${event.id}:`, detail)
    return false
  }

  await markPublished(event.id, { ig: resIg.data, tw: resTw.data, fb: resFb.data })
  console.log(`[publisher] ✅ Evento ${event.id} publicado (${event.event_type})`)
  return true
}
