import { getHandle as getHandleDefault } from './handles.js'
import { getFlagEmoji, normalize } from './flags.js'

const PARTIDOS_URL = 'https://fiestafutbol.com.mx/partidos-del-dia'
const BRANDED_TAGS = '#Mundial2026 #WorldCup2026 #LaFiestaDelFútbol2026 #EnfoqueNoticias #StereoCien'

function matchSlug(teamHome, teamAway) {
  const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').trim()
  return `${PARTIDOS_URL}/${slug(teamHome)}-vs-${slug(teamAway)}/`
}

// handlesMap: { [normalizedTeamName]: { ig, tw } } — si se pasa, usa DB; si no, usa hardcoded
function resolveHandle(teamName, platform, handlesMap) {
  if (handlesMap) {
    const entry = handlesMap[normalize(teamName)]
    return entry?.[platform] ?? entry?.ig ?? ''
  }
  return getHandleDefault(teamName, platform)
}

function buildCaption(event, platform, handlesMap = null) {
  const { event_type, team_home, team_away, score_home, score_away, player_name, minute, goal_type, goal_team } = event
  const url = matchSlug(team_home, team_away)
  const isOwnGoal = goal_type?.toLowerCase().includes('contra')
  const t = (name) => {
    if (platform === 'fb') return ''
    const h = resolveHandle(name, platform, handlesMap)
    return h ? ` (${h})` : ''
  }
  const f = (name) => { const e = getFlagEmoji(name); return e ? `${e} ` : '' }

  switch (event_type) {
    case 'inicio':
      return [
        `⚽ ¡Comienza el partido!`,
        ``,
        `🔵 ${f(team_home)}${team_home}${t(team_home)} VS ${f(team_away)}${team_away}${t(team_away)}`,
        ``,
        `🌐 No te pierdas el minuto a minuto en:`,
        url,
        ...(platform !== 'fb' ? [``, BRANDED_TAGS] : []),
      ].join('\n')

    case 'gol': {
      const scorer = isOwnGoal
        ? `🤦 Autogol de ${player_name}${minute > 0 ? ` (min. ${minute}')` : ''}`
        : `⚽ ${player_name ?? goal_team}${minute > 0 ? ` al minuto ${minute}'` : ''}${goal_team ? ` anota para ${f(goal_team)}${goal_team}${t(goal_team)}` : ''}`

      return [
        `¡GOOOOOL! 🚨🔴⚽`,
        ``,
        scorer,
        ``,
        `${f(team_home)}${team_home}${t(team_home)} ${score_home} - ${score_away} ${f(team_away)}${team_away}${t(team_away)}`,
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
        `${f(team_home)}${team_home}${t(team_home)} ${score_home} - ${score_away} ${f(team_away)}${team_away}${t(team_away)}`,
        ``,
        `¿Cómo van viendo el partido? Sigue el minuto a minuto en:`,
        url,
        ...(platform !== 'fb' ? [``, BRANDED_TAGS] : []),
      ].join('\n')

    case 'final':
      return [
        `🏁 ¡Final del partido!`,
        ``,
        `${f(team_home)}${team_home}${t(team_home)} ${score_home} - ${score_away} ${f(team_away)}${team_away}${t(team_away)}`,
        ``,
        `¿Qué te pareció el partido? Todos los resultados en:`,
        url,
        ...(platform !== 'fb' ? [``, BRANDED_TAGS] : []),
      ].join('\n')

    default:
      return ''
  }
}

export function captionInstagram(event, handlesMap = null) { return buildCaption(event, 'ig', handlesMap) }
export function captionTwitter(event, handlesMap = null)   { return buildCaption(event, 'tw', handlesMap) }
export function captionFacebook(event, handlesMap = null)  { return buildCaption(event, 'fb', handlesMap) }

// Compat aliases
export function captionIgX(event)      { return captionInstagram(event) }
export function captionForEvent(event) { return captionInstagram(event) }
