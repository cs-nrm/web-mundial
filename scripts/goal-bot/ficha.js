import { DF_BASE, DF_PASS, DF_CANAL_FICHA, GOAL_TYPES, STATUS } from './config.js'

function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`) )
  return m ? m[1] : ''
}

function parseStatus(xml) {
  const tag = xml.match(/<Status\b[^>]*>/)?.[0]
  if (!tag) return null
  return {
    value: attr(tag, 'value'),
    statusId: attr(tag, 'statusId'),
    period: attr(tag, 'currentPeriod'),
    minute: parseInt(attr(tag, 'currentMinutes') || '0'),
  }
}

function parseTeams(xml) {
  const tags = xml.match(/<Team\b[^>]*>/g) ?? []
  const home = tags.find(t => attr(t, 'homeOrAway') === 'Home')
  const away = tags.find(t => attr(t, 'homeOrAway') === 'Away')
  return {
    teamHome: home ? attr(home, 'name') : '',
    teamAway: away ? attr(away, 'name') : '',
    teamHomeId: home ? attr(home, 'teamId') : '',
    teamAwayId: away ? attr(away, 'teamId') : '',
    scoreHome: home ? parseInt(attr(home, 'score') || '0') : 0,
    scoreAway: away ? parseInt(attr(away, 'score') || '0') : 0,
  }
}

function parseGoals(xml, seenIds) {
  const deletedIds = new Set(
    (xml.match(/<DeletedIncidence\b[^>]*\/>/g) ?? []).map(t => attr(t, 'incidenceId'))
  )

  const newGoals = []
  const incidences = xml.match(/<Incidence\b.*?\/>/gs) ?? []

  for (const tag of incidences) {
    const type = attr(tag, 'type')
    if (!GOAL_TYPES.includes(type.toLowerCase())) continue

    const id = attr(tag, 'incidenceId')
    if (!id || seenIds.has(id) || deletedIds.has(id)) continue

    seenIds.add(id)
    newGoals.push({
      incidenceId: id,
      goalType: type,
      playerName: attr(tag, 'playerName'),
      teamId: attr(tag, 'teamId'),
      minute: parseInt(attr(tag, 'minutes') || '0'),
      assistName: attr(tag, 'assistanceBy') || null,
    })
  }

  return newGoals
}

export async function pollMatch(matchId, state) {
  const url = `${DF_BASE}/?ppaass=${DF_PASS}&canal=${DF_CANAL_FICHA(matchId)}`
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) })
  const xml = new TextDecoder('iso-8859-1').decode(await res.arrayBuffer())

  const status = parseStatus(xml)
  const teams = parseTeams(xml)
  const newGoals = parseGoals(xml, state.seenIncidenceIds)

  // Detectar inicio de partido (Primer Tiempo, solo una vez)
  const isKickoff =
    (status?.value === STATUS.PRIMER_TIEMPO || status?.value === STATUS.SEGUNDO_TIEMPO) &&
    !state.kickoffPosted

  if (isKickoff) state.kickoffPosted = true

  // Detectar cambio a entretiempo (solo una vez por partido)
  const isHalftime =
    status?.value === STATUS.ENTRETIEMPO && !state.halftimePosted

  if (isHalftime) state.halftimePosted = true

  const isFinished = status?.value === STATUS.FINALIZADO

  return { status, teams, newGoals, isKickoff, isHalftime, isFinished }
}
