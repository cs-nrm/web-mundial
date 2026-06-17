import { getHandle } from './handles.js'

const PARTIDOS_URL = 'https://fiestafutbol.com.mx/partidos-del-dia'
const BRANDED_TAGS = '#Mundial2026 #WorldCup2026 #LaFiestaDelFútbol2026 #EnfoqueNoticias #StereoCien'

function matchSlug(teamHome, teamAway) {
  const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').trim()
  return `${PARTIDOS_URL}/${slug(teamHome)}-vs-${slug(teamAway)}/`
}

function tag(teamName, platform) {
  const h = getHandle(teamName, platform)
  return h ? ` (${h})` : ''
}

function buildCaption(event, platform) {
  const { event_type, team_home, team_away, score_home, score_away, player_name, minute, goal_type, goal_team } = event
  const url = matchSlug(team_home, team_away)
  const isOwnGoal = goal_type?.toLowerCase().includes('contra')
  const t = (name) => platform === 'fb' ? '' : tag(name, platform)

  switch (event_type) {
    case 'inicio':
      return [
        `⚽ ¡Comienza el partido!`,
        ``,
        `🔵 ${team_home}${t(team_home)} VS ${team_away}${t(team_away)}`,
        ``,
        `🌐 No te pierdas el minuto a minuto en:`,
        url,
        ...(platform !== 'fb' ? [``, BRANDED_TAGS] : []),
      ].join('\n')

    case 'gol': {
      const scorer = isOwnGoal
        ? `🤦 Autogol de ${player_name}${minute > 0 ? ` (min. ${minute}')` : ''}`
        : `⚽ ${player_name ?? goal_team}${minute > 0 ? ` al minuto ${minute}'` : ''}${goal_team ? ` anota para ${goal_team}${t(goal_team)}` : ''}`

      return [
        `¡GOOOOOL! 🚨🔴⚽`,
        ``,
        scorer,
        ``,
        `${team_home}${t(team_home)} ${score_home} - ${score_away} ${team_away}${t(team_away)}`,
        ``,
        `🌐 Vive el fútbol en:`,
        url,
        ...(platform !== 'fb' ? [``, BRANDED_TAGS] : []),
      ].join('\n')
    }

    case 'medio_tiempo':
      return [
        `⏱️ ¡Medio tiempo!`,
        ``,
        `${team_home}${t(team_home)} ${score_home} - ${score_away} ${team_away}${t(team_away)}`,
        ``,
        `¿Cómo van viendo el partido? Sigue el minuto a minuto en:`,
        url,
        ...(platform !== 'fb' ? [``, BRANDED_TAGS] : []),
      ].join('\n')

    case 'final':
      return [
        `🏁 ¡Final del partido!`,
        ``,
        `${team_home}${t(team_home)} ${score_home} - ${score_away} ${team_away}${t(team_away)}`,
        ``,
        `¿Qué te pareció el partido? Todos los resultados en:`,
        url,
        ...(platform !== 'fb' ? [``, BRANDED_TAGS] : []),
      ].join('\n')

    default:
      return ''
  }
}

export function captionInstagram(event) { return buildCaption(event, 'ig') }
export function captionTwitter(event)   { return buildCaption(event, 'tw') }
export function captionFacebook(event)  { return buildCaption(event, 'fb') }

// Compat aliases
export function captionIgX(event)    { return captionInstagram(event) }
export function captionForEvent(event) { return captionInstagram(event) }
