import sharp from 'sharp'
import { existsSync } from 'fs'
import { join } from 'path'
import { getFlagUrl } from './flags.js'

const TEMPLATES = join(process.cwd(), 'public/templates')

// Posiciones sobre la imagen 1080×1350
const LAYOUT = {
  flag: { size: 175, y: 430 },
  flagLeft:  { x: 215 },
  flagRight: { x: 865 },
  score: { y: 455, fontSize: 110, dashX: 540, leftX: 385, rightX: 695 },
  team:  { y: 570, fontSize: 38 },
}

async function fetchImage(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
  if (!res.ok) throw new Error(`Flag fetch failed: ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

async function makeCircularFlag(url, size) {
  const buf = await fetchImage(url)
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
    </svg>`
  )
  return sharp(buf)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer()
}

function scoreOverlaySvg(scoreHome, scoreAway) {
  const { score: s } = LAYOUT
  return Buffer.from(`
    <svg width="1080" height="1350" xmlns="http://www.w3.org/2000/svg">
      <style>
        .score { font-family: Impact, Arial Black, sans-serif; font-size: ${s.fontSize}px; fill: #111; }
      </style>
      <text x="${s.leftX}"  y="${s.y}" text-anchor="middle" class="score">${scoreHome}</text>
      <text x="${s.dashX}"  y="${s.y}" text-anchor="middle" class="score">-</text>
      <text x="${s.rightX}" y="${s.y}" text-anchor="middle" class="score">${scoreAway}</text>
    </svg>
  `)
}

function teamNamesOverlaySvg(teamHome, teamAway) {
  const { team: t, flagLeft, flagRight } = LAYOUT
  return Buffer.from(`
    <svg width="1080" height="1350" xmlns="http://www.w3.org/2000/svg">
      <style>
        .team { font-family: Arial, sans-serif; font-size: ${t.fontSize}px; font-weight: 700; fill: #111; }
      </style>
      <text x="${flagLeft.x}" y="${t.y}" text-anchor="middle" class="team">${teamHome}</text>
      <text x="${flagRight.x}" y="${t.y}" text-anchor="middle" class="team">${teamAway}</text>
    </svg>
  `)
}

function pickTemplate(...names) {
  for (const name of names) {
    if (existsSync(join(TEMPLATES, name))) return name
  }
  return 'gol.jpg'
}

function templateForEvent(event_type) {
  if (event_type === 'gol')         return pickTemplate('gol1.jpg', 'gol.jpg')
  if (event_type === 'inicio')      return pickTemplate('inicio1.jpg', 'inicio.jpg', 'gol1.jpg', 'gol.jpg')
  if (event_type === 'final')       return pickTemplate('final1.jpg', 'gol1.jpg', 'gol.jpg')
  /* medio_tiempo */                return pickTemplate('medio-tiempo1.jpg', 'medio-tiempo.jpg')
}

export async function generateImage(event) {
  const base = join(TEMPLATES, templateForEvent(event.event_type))
  const { flag, flagLeft, flagRight } = LAYOUT

  const flagUrlHome = getFlagUrl(event.team_home)
  const flagUrlAway = getFlagUrl(event.team_away)

  const composites = []

  if (flagUrlHome) {
    const buf = await makeCircularFlag(flagUrlHome, flag.size)
    composites.push({ input: buf, left: Math.round(flagLeft.x - flag.size / 2), top: Math.round(flag.y - flag.size / 2) })
  }

  if (flagUrlAway) {
    const buf = await makeCircularFlag(flagUrlAway, flag.size)
    composites.push({ input: buf, left: Math.round(flagRight.x - flag.size / 2), top: Math.round(flag.y - flag.size / 2) })
  }

  composites.push({ input: scoreOverlaySvg(event.score_home, event.score_away), top: 0, left: 0 })
  composites.push({ input: teamNamesOverlaySvg(event.team_home, event.team_away), top: 0, left: 0 })

  return sharp(base)
    .composite(composites)
    .jpeg({ quality: 90 })
    .toBuffer()
}
