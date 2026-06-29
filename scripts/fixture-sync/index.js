import { createClient } from '@supabase/supabase-js'

const DF_BASE = 'https://feed.datafactory.la'
const DF_PASS = process.env.DF_PASS
const DF_CANAL_FIXTURE = 'deportes.futbol.mundial.fixture'
const DF_CANAL_FICHA = (matchId) => `deportes.futbol.mundial.ficha.${matchId}.3`

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`, 'i'))
  return m ? m[1] : ''
}

function log(msg) {
  console.log(`[${new Date().toLocaleTimeString('es-MX', { timeZone: 'America/Mexico_City' })}] ${msg}`)
}

// Nombre placeholder de eliminatoria aún sin resolver (ej. "3  Grupo A-B-C-D-F", "1  Grupo I")
function isPlaceholder(name) {
  return !name || /grupo/i.test(name) || /^\s*\d/.test(name)
}

// Misma función que captions.js para asegurar URLs consistentes
function makeSlug(teamHome, teamAway) {
  const toSlug = (s) =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').trim()
  return `${toSlug(teamHome)}-vs-${toSlug(teamAway)}`
}

async function fetchFixtureXml() {
  const url = `${DF_BASE}/?ppaass=${DF_PASS}&canal=${DF_CANAL_FIXTURE}`
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) })
  return new TextDecoder('iso-8859-1').decode(await res.arrayBuffer())
}

async function fetchFicha(matchId) {
  try {
    const url = `${DF_BASE}/?ppaass=${DF_PASS}&canal=${DF_CANAL_FICHA(matchId)}`
    const res = await fetch(url, { signal: AbortSignal.timeout(12_000) })
    const xml = new TextDecoder('iso-8859-1').decode(await res.arrayBuffer())

    const teamTags = xml.match(/<Team\b[^>]*>/g) ?? []
    const home = teamTags.find(t => attr(t, 'homeOrAway') === 'Home')
    const away = teamTags.find(t => attr(t, 'homeOrAway') === 'Away')

    const venueTag = xml.match(/<(?:Venue|Estadio|Stadium)\b[^>]*>/i)?.[0]
    const sede = venueTag
      ? (attr(venueTag, 'name') || attr(venueTag, 'nombre') || null)
      : null

    // Leer status del partido desde la ficha
    const matchTag = xml.match(/<(?:MatchDay|Partido|Match)\b[^>]*>/i)?.[0] ?? ''
    const statusRaw = (attr(matchTag, 'status') || attr(matchTag, 'estado') || '').toLowerCase()
    let status = null
    if (/^(fin|final|terminado|cerrado|closed|finished)/i.test(statusRaw)) status = 'finalizado'
    else if (/^(en\s*curso|live|jugando|vivo|progress)/i.test(statusRaw)) status = 'en_vivo'

    // Marcador desde los tags de equipo
    const scoreHome = home ? parseInt(attr(home, 'score') || attr(home, 'goles') || '-1') : -1
    const scoreAway = away ? parseInt(attr(away, 'score') || attr(away, 'goles') || '-1') : -1

    return {
      teamHome: home ? attr(home, 'name') : '',
      teamAway: away ? attr(away, 'name') : '',
      sede,
      status,
      scoreHome: scoreHome >= 0 ? scoreHome : null,
      scoreAway: scoreAway >= 0 ? scoreAway : null,
    }
  } catch {
    return null
  }
}

async function sync() {
  const xml = await fetchFixtureXml()
  const tags = xml.match(/<partido\b[^>]*>/g) ?? []

  if (tags.length === 0) {
    log('Sin partidos en el fixture')
    log('Primeros 500 chars del XML: ' + xml.slice(0, 500))
    return
  }

  // Cargar partidos existentes con nombres ya resueltos
  const { data: existingRows = [] } = await supabase
    .from('df_partidos')
    .select('match_id, equipo_local, equipo_visitante, status')
  const resolvedIds = new Set((existingRows ?? []).filter(m => m.equipo_local).map(m => m.match_id))

  let upserted = 0
  let skipped = 0

  for (const tag of tags) {
    const id = attr(tag, 'id')
    const fecha = attr(tag, 'fecha')  // yyyymmdd
    const hora  = attr(tag, 'hora')   // HH:MM:SS (feed es UTC-3 / Argentina)

    if (!id || !fecha || !hora) continue

    // Parsear fecha/hora a UTC
    const [hh, mm] = hora.split(':').map(Number)
    const y  = parseInt(fecha.slice(0, 4))
    const mo = parseInt(fecha.slice(4, 6)) - 1
    const d  = parseInt(fecha.slice(6, 8))
    const fechaUtc = new Date(Date.UTC(y, mo, d, hh - 3, mm))

    // Si ya existe con nombres, actualizar fecha + status/score si aplica
    if (resolvedIds.has(id)) {
      const row = (existingRows ?? []).find(m => m.match_id === id)
      const updateData = { fecha_utc: fechaUtc.toISOString(), synced_at: new Date().toISOString() }

      // Re-resolver nombres si siguen como placeholder de eliminatoria (ej. "3 Grupo A-B")
      if (isPlaceholder(row?.equipo_local) || isPlaceholder(row?.equipo_visitante)) {
        const ficha = await fetchFicha(id)
        if (ficha && !isPlaceholder(ficha.teamHome) && !isPlaceholder(ficha.teamAway)) {
          updateData.equipo_local = ficha.teamHome
          updateData.equipo_visitante = ficha.teamAway
          updateData.slug = makeSlug(ficha.teamHome, ficha.teamAway)
          if (ficha.sede) updateData.sede = ficha.sede
          if (ficha.status) updateData.status = ficha.status
          if (ficha.scoreHome != null) updateData.score_local = ficha.scoreHome
          if (ficha.scoreAway != null) updateData.score_visitante = ficha.scoreAway
          log(`  RESUELTO ${id}: ${ficha.teamHome} vs ${ficha.teamAway} → /${updateData.slug}/`)
        }
      } else if (row?.status === 'en_vivo') {
        // Consultar ficha solo si está en vivo (max 1-2 partidos a la vez)
        const ficha = await fetchFicha(id)
        if (ficha?.status) updateData.status = ficha.status
        if (ficha?.scoreHome != null) updateData.score_local = ficha.scoreHome
        if (ficha?.scoreAway != null) updateData.score_visitante = ficha.scoreAway
      }

      await supabase.from('df_partidos').update(updateData).eq('match_id', id)
      continue
    }

    // Partido nuevo: intentar nombres desde el fixture primero, luego ficha
    let teamHome = attr(tag, 'local') || attr(tag, 'equipo_local') || attr(tag, 'home')
    let teamAway = attr(tag, 'visitante') || attr(tag, 'equipo_visitante') || attr(tag, 'away')
    let sede     = attr(tag, 'estadio') || attr(tag, 'sede') || attr(tag, 'ciudad') || null
    const grupo  = attr(tag, 'grupo') || attr(tag, 'group') || attr(tag, 'fase') || null

    if (!teamHome || !teamAway) {
      log(`Partido ${id}: sin nombres en fixture, consultando ficha…`)
      const ficha = await fetchFicha(id)
      if (ficha) {
        teamHome = ficha.teamHome || teamHome
        teamAway = ficha.teamAway || teamAway
        sede = sede || ficha.sede || null
      }
    }

    if (!teamHome || !teamAway) {
      log(`Partido ${id}: sin nombres de equipo, saltando`)
      skipped++
      continue
    }

    const slug = makeSlug(teamHome, teamAway)

    const { error } = await supabase.from('df_partidos').upsert({
      match_id: id,
      slug,
      fecha_utc: fechaUtc.toISOString(),
      equipo_local: teamHome,
      equipo_visitante: teamAway,
      grupo: grupo || null,
      sede: sede || null,
      synced_at: new Date().toISOString(),
    }, { onConflict: 'match_id' })

    if (error) {
      log(`ERROR upsert partido ${id}: ${error.message}`)
    } else {
      log(`  ${teamHome} vs ${teamAway} → /${slug}/`)
      upserted++
    }
  }

  log(`Sync completo: ${upserted} nuevos, ${tags.length - upserted - skipped} actualizados, ${skipped} sin datos`)
}

async function main() {
  log('=== Fixture sync iniciado ===')

  while (true) {
    try {
      await sync()
    } catch (err) {
      log(`ERROR sync: ${err.message}`)
    }
    await new Promise(r => setTimeout(r, 30 * 60_000))
  }
}

main().catch(err => {
  console.error('ERROR CRÍTICO fixture-sync:', err)
  process.exit(1)
})
