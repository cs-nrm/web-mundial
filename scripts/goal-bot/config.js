export const SITE_URL = 'https://fiestafutbol.com.mx'

export const DF_BASE = 'https://feed.datafactory.la'
export const DF_PASS = process.env.DF_PASS
export const DF_CANAL_FIXTURE = 'deportes.futbol.mundial.fixture'
export const DF_CANAL_FICHA = (matchId) => `deportes.futbol.mundial.ficha.${matchId}.3`

export const METRICOOL_TOKEN = process.env.METRICOOL_TOKEN
export const METRICOOL_USER_ID = process.env.METRICOOL_USER_ID
export const METRICOOL_BLOG_ID = process.env.METRICOOL_BLOG_ID

// Intervalo de polling cuando hay partido en vivo (ms)
export const POLL_INTERVAL_LIVE = 20_000
// Intervalo de polling para revisar el fixture cuando no hay partidos en vivo (ms)
export const POLL_INTERVAL_IDLE = 2 * 60_000

// Estados del feed de DataFactory
export const STATUS = {
  NO_INICIADO: '',
  PRIMER_TIEMPO: 'Primer Tiempo',
  ENTRETIEMPO: 'Entretiempo',
  SEGUNDO_TIEMPO: 'Segundo Tiempo',
  FINALIZADO: 'Finalizado',
}

// Tipos de incidencia que cuentan como gol
export const GOAL_TYPES = ['gol de jugada', 'gol de cabeza', 'gol de penal', 'gol en contra', 'gol']
