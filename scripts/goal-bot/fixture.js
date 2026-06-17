import { DF_BASE, DF_PASS, DF_CANAL_FIXTURE, STATUS } from './config.js'

function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`) )
  return m ? m[1] : ''
}

export async function fetchLiveMatches() {
  const url = `${DF_BASE}/?ppaass=${DF_PASS}&canal=${DF_CANAL_FIXTURE}`
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) })
  const xml = await res.text()

  const now = new Date()
  // hora CDMX = hora UTC - 6h (getTime() siempre es UTC, sin importar zona del servidor)
  const cdmxNow = new Date(now.getTime() - 6 * 60 * 60_000)

  const matches = []
  const tags = xml.match(/<partido\b[^>]*>/g) ?? []

  for (const tag of tags) {
    const id = attr(tag, 'id')
    const fecha = attr(tag, 'fecha')  // yyyymmdd
    const hora = attr(tag, 'hora')    // HH:MM:SS en crudo (hora_feed - 3h = CDMX)

    if (!id || !fecha || !hora) continue

    const [hh, mm] = hora.split(':').map(Number)
    const y = parseInt(fecha.slice(0, 4))
    const mo = parseInt(fecha.slice(4, 6)) - 1
    const d = parseInt(fecha.slice(6, 8))

    // Convertir hora_feed a CDMX restando 3h (validado con datos reales)
    const kickoffCdmx = new Date(Date.UTC(y, mo, d, hh - 3, mm))

    // Considera candidato a vivo si kickoff ya pasó y hay menos de 3h transcurridas
    const msSinceKickoff = cdmxNow - kickoffCdmx
    if (msSinceKickoff >= 0 && msSinceKickoff < 3 * 60 * 60_000) {
      matches.push({
        id,
        kickoffCdmx,
        fecha,
      })
    }
  }

  return matches
}
