import { fetchLiveMatches } from './fixture.js'
import { pollMatch } from './ficha.js'
import { isAlreadyProcessed, saveEvent } from './db.js'
import { POLL_INTERVAL_LIVE, POLL_INTERVAL_IDLE, STATUS } from './config.js'

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// Estado por partido: incidencias ya vistas + si ya se posteó el entretiempo
const matchStates = {}

function getMatchState(matchId) {
  if (!matchStates[matchId]) {
    matchStates[matchId] = { seenIncidenceIds: new Set(), halftimePosted: false, kickoffPosted: false, finishedPosted: false }
  }
  return matchStates[matchId]
}

function log(msg) {
  console.log(`[${new Date().toLocaleTimeString('es-MX', { timeZone: 'America/Mexico_City' })}] ${msg}`)
}

async function processMatch(match) {
  const state = getMatchState(match.id)
  let result

  try {
    result = await pollMatch(match.id, state)
  } catch (err) {
    log(`ERROR polling partido ${match.id}: ${err.message}`)
    return false
  }

  const { status, teams, newGoals, isHalftime, isKickoff, isFinished } = result

  // Guardar evento de inicio de partido
  if (isKickoff) {
    const incidenceId = `inicio_${match.id}`
    const alreadySaved = await isAlreadyProcessed(incidenceId)
    if (!alreadySaved) {
      log(`INICIO detectado — ${teams.teamHome} vs ${teams.teamAway}`)
      await saveEvent({
        incidence_id: incidenceId,
        match_id: match.id,
        event_type: 'inicio',
        match_date: match.fecha,
        team_home: teams.teamHome,
        team_away: teams.teamAway,
        team_home_id: teams.teamHomeId,
        team_away_id: teams.teamAwayId,
        score_home: 0,
        score_away: 0,
      })
    }
  }

  // Guardar evento de medio tiempo
  if (isHalftime) {
    const incidenceId = `medio_tiempo_${match.id}`
    const alreadySaved = await isAlreadyProcessed(incidenceId)
    if (!alreadySaved) {
      log(`MEDIO TIEMPO detectado — ${teams.teamHome} ${teams.scoreHome}-${teams.scoreAway} ${teams.teamAway}`)
      await saveEvent({
        incidence_id: incidenceId,
        match_id: match.id,
        event_type: 'medio_tiempo',
        match_date: match.fecha,
        team_home: teams.teamHome,
        team_away: teams.teamAway,
        team_home_id: teams.teamHomeId,
        team_away_id: teams.teamAwayId,
        score_home: teams.scoreHome,
        score_away: teams.scoreAway,
      })
    }
  }

  // Guardar evento de final de partido
  if (isFinished && !state.finishedPosted) {
    state.finishedPosted = true
    const incidenceId = `final_${match.id}`
    const alreadySaved = await isAlreadyProcessed(incidenceId)
    if (!alreadySaved) {
      log(`FINAL detectado — ${teams.teamHome} ${teams.scoreHome}-${teams.scoreAway} ${teams.teamAway}`)
      await saveEvent({
        incidence_id: incidenceId,
        match_id: match.id,
        event_type: 'final',
        match_date: match.fecha,
        team_home: teams.teamHome,
        team_away: teams.teamAway,
        team_home_id: teams.teamHomeId,
        team_away_id: teams.teamAwayId,
        score_home: teams.scoreHome,
        score_away: teams.scoreAway,
      })
    }
  }

  // Guardar eventos de gol
  for (const goal of newGoals) {
    const alreadySaved = await isAlreadyProcessed(goal.incidenceId)
    if (alreadySaved) continue

    const isOwnGoal = goal.goalType?.toLowerCase().includes('contra')
    const goalTeam = isOwnGoal
      ? (goal.teamId === teams.teamHomeId ? teams.teamAway : teams.teamHome)
      : (goal.teamId === teams.teamHomeId ? teams.teamHome : teams.teamAway)

    log(`GOL detectado — ${goal.playerName} (${goal.goalType}) min ${goal.minute} | ${teams.teamHome} ${teams.scoreHome}-${teams.scoreAway} ${teams.teamAway}`)
    await saveEvent({
      incidence_id: goal.incidenceId,
      match_id: match.id,
      event_type: 'gol',
      match_date: match.fecha,
      team_home: teams.teamHome,
      team_away: teams.teamAway,
      team_home_id: teams.teamHomeId,
      team_away_id: teams.teamAwayId,
      score_home: teams.scoreHome,
      score_away: teams.scoreAway,
      minute: goal.minute,
      player_name: goal.playerName,
      assist_name: goal.assistName,
      goal_type: goal.goalType,
      goal_team: goalTeam,
    })
  }

  return isFinished
}

async function main() {
  log('=== Bot de eventos en vivo iniciado ===')

  while (true) {
    let liveMatches = []

    try {
      liveMatches = await fetchLiveMatches()
    } catch (err) {
      log(`ERROR fixture: ${err.message}`)
      await sleep(POLL_INTERVAL_IDLE)
      continue
    }

    if (liveMatches.length === 0) {
      log('Sin partidos en vivo — revisando en 2 min')
      await sleep(POLL_INTERVAL_IDLE)
      continue
    }

    log(`Partidos en vivo: ${liveMatches.map(m => m.id).join(', ')}`)

    // Polling rápido mientras haya partidos en vivo
    const finishedIds = new Set()

    while (liveMatches.length > 0) {
      for (const match of liveMatches) {
        const finished = await processMatch(match)
        if (finished) {
          log(`Partido ${match.id} finalizado`)
          finishedIds.add(match.id)
        }
      }

      liveMatches = liveMatches.filter(m => !finishedIds.has(m.id))
      if (liveMatches.length > 0) await sleep(POLL_INTERVAL_LIVE)
    }

    log('Todos los partidos finalizados — volviendo a modo idle')
  }
}

main().catch(err => {
  console.error('ERROR CRÍTICO:', err)
  process.exit(1)
})
