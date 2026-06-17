import { getHandle } from './handles.js'

const PARTIDOS_URL = 'https://fiestafutbol.com.mx/partidos-del-dia'

function matchSlug(teamHome, teamAway) {
  const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').trim()
  return `${PARTIDOS_URL}/${slug(teamHome)}-vs-${slug(teamAway)}/`
}

// Retorna handle de IG/X o string vacío
function handle(teamName) {
  const h = getHandle(teamName)
  return h ? ` (${h})` : ''
}

// Para Facebook: solo el nombre del equipo, sin @
function fbHandle() { return '' }

function buildCaption(event, getTag) {
  const { event_type, team_home, team_away, score_home, score_away, player_name, minute, goal_type, goal_team } = event
  const url = matchSlug(team_home, team_away)
  const isOwnGoal = goal_type?.toLowerCase().includes('contra')

  switch (event_type) {
    case 'inicio':
      return [
        `⚽ ¡Comienza el partido!`,
        ``,
        `🔵 ${team_home}${getTag(team_home)} VS ${team_away}${getTag(team_away)}`,
        ``,
        `🌐 No te pierdas el minuto a minuto en:`,
        url,
      ].join('\n')

    case 'gol': {
      const scorer = isOwnGoal
        ? `🤦 Autogol de ${player_name}${minute > 0 ? ` (min. ${minute}')` : ''}`
        : `⚽ ${player_name ?? goal_team}${minute > 0 ? ` al minuto ${minute}'` : ''}${goal_team ? ` anota para ${goal_team}${getTag(goal_team)}` : ''}`

      return [
        `¡GOOOOOL! 🚨🔴⚽`,
        ``,
        scorer,
        ``,
        `${team_home}${getTag(team_home)} ${score_home} - ${score_away} ${team_away}${getTag(team_away)}`,
        ``,
        `🌐 Vive el fútbol en:`,
        url,
      ].join('\n')
    }

    case 'medio_tiempo':
      return [
        `⏱️ ¡Medio tiempo!`,
        ``,
        `${team_home}${getTag(team_home)} ${score_home} - ${score_away} ${team_away}${getTag(team_away)}`,
        ``,
        `¿Cómo van viendo el partido? Sigue el minuto a minuto en:`,
        url,
      ].join('\n')

    default:
      return ''
  }
}

// Caption para Instagram y X (con @handles)
export function captionIgX(event) {
  return buildCaption(event, handle)
}

// Caption para Facebook (sin @mentions)
export function captionFacebook(event) {
  return buildCaption(event, fbHandle)
}

// Compat: caption genérico (IG/X por defecto)
export function captionForEvent(event) {
  return captionIgX(event)
}
