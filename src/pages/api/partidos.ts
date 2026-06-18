import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../lib/supabase'
import { getFlagUrl } from '../../lib/flags.js'

export const GET: APIRoute = async ({ url }) => {
  const supabase = createSupabaseAdminClient()

  // Rango: ayer, hoy, mañana en CDMX
  const now = new Date()
  const cdmxOffset = -6 * 60 * 60_000
  const cdmxNow = new Date(now.getTime() + cdmxOffset)

  const cdmxDate = cdmxNow.toISOString().slice(0, 10) // YYYY-MM-DD

  // fecha param opcional para filtrar día específico
  const fechaParam = url.searchParams.get('fecha')

  let desde: string
  let hasta: string

  if (fechaParam && /^\d{4}-\d{2}-\d{2}$/.test(fechaParam)) {
    // Un día específico (full UTC day window)
    desde = `${fechaParam}T00:00:00Z`
    hasta = `${fechaParam}T23:59:59Z`
  } else {
    // Ayer, hoy y mañana en CDMX → ventana de 3 días en UTC
    const ayer = new Date(cdmxNow.getTime() - 24 * 60 * 60_000).toISOString().slice(0, 10)
    const manana = new Date(cdmxNow.getTime() + 24 * 60 * 60_000).toISOString().slice(0, 10)
    desde = `${ayer}T06:00:00Z`   // 00:00 CDMX = 06:00 UTC
    hasta = `${manana}T06:00:00Z`  // fin del día de mañana en CDMX
  }

  const { data, error } = await supabase
    .from('df_partidos')
    .select('*')
    .gte('fecha_utc', desde)
    .lte('fecha_utc', hasta)
    .order('fecha_utc', { ascending: true })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const matches = (data ?? []).map(m => ({
    ...m,
    flag_local: getFlagUrl(m.equipo_local, 80),
    flag_visitante: getFlagUrl(m.equipo_visitante, 80),
  }))

  return new Response(JSON.stringify(matches), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=20',
    },
  })
}
