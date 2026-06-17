import { getHandle } from './handles.js'

const SITE_URL = 'https://fiestafutbol.com.mx'
const PARTIDOS_URL = `${SITE_URL}/partidos-del-dia`

// Slug base para el partido (el usuario puede ajustarlo en el panel admin)
function matchSlug(teamHome, teamAway) {
  const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').trim()
  return `${PARTIDOS_URL}/${slug(teamHome)}-vs-${slug(teamAway)}/`
}

function handle(teamName) {
  const h = getHandle(teamName)
  return h ? ` (${h})` : ''
}

export function captionForEvent(event) {
  const { event_type, team_home, team_away, score_home, score_away, player_name, minute, goal_type, goal_team } = event
  const url = matchSlug(team_home, team_away)
  const isOwnGoal = goal_type?.toLowerCase().includes('contra')

  switch (event_type) {
    case 'inicio':
      return [
        `⚽ ¡Comienza el partido!`,
        ``,
        `🔵 ${team_home}${handle(team_home)} VS ${team_away}${handle(team_away)}`,
        ``,
        `🌐 No te pierdas el minuto a minuto en:`,
        url,
        ``,
        `#Mundial2026 #LaFiestaDelFútbol2026 #FútbolEnVivo`,
      ].join('\n')

    case 'gol': {
      const scorer = isOwnGoal
        ? `🤦 Autogol de ${player_name}${minute > 0 ? ` (min. ${minute}')` : ''}`
        : `⚽ ${player_name ?? goal_team}${minute > 0 ? ` al minuto ${minute}'` : ''}${goal_team ? ` anota para ${goal_team}` : ''}`

      return [
        `¡GOOOOOL! 🚨🔴⚽`,
        ``,
        scorer,
        ``,
        `${team_home} ${score_home} - ${score_away} ${team_away}`,
        ``,
        `🌐 Vive el fútbol en:`,
        url,
        ``,
        `#GOOOL #Mundial2026 #LaFiestaDelFútbol2026 #FútbolEnVivo`,
      ].join('\n')
    }

    case 'medio_tiempo':
      return [
        `⏱️ ¡Medio tiempo!`,
        ``,
        `${team_home} ${score_home} - ${score_away} ${team_away}`,
        ``,
        `¿Cómo van viendo el partido? Sigue el minuto a minuto en:`,
        url,
        ``,
        `#MedioTiempo #Mundial2026 #LaFiestaDelFútbol2026`,
      ].join('\n')

    default:
      return ''
  }
}
