import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../../../lib/supabase'
import { canAccess, STATS_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

// Supabase limita a 1000 filas por query; paginamos hasta agotar resultados.
async function fetchAll<T>(buildQuery: (from: number, to: number) => any): Promise<T[]> {
  const PAGE = 1000
  const result: T[] = []
  let offset = 0
  while (true) {
    const { data, error } = await buildQuery(offset, offset + PAGE - 1)
    if (error || !data || data.length === 0) break
    result.push(...data)
    if (data.length < PAGE) break
    offset += PAGE
  }
  return result
}

const fmtCdmx = new Intl.DateTimeFormat('es-MX', {
  timeZone: 'America/Mexico_City',
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit', hour12: false,
})

function fecha(iso: string) {
  if (!iso) return ''
  const p = Object.fromEntries(fmtCdmx.formatToParts(new Date(iso)).map(x => [x.type, x.value]))
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`
}

const esc = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`

export const GET: APIRoute = async ({ url, locals }) => {
  const { role, estacion_asignada } = locals as any
  if (!canAccess(role as UserRole, STATS_ROLES)) {
    return new Response('Sin permiso', { status: 403 })
  }

  // Mismo criterio que la página de estadísticas: el rol 'estadistica' con
  // estación asignada queda bloqueado a esa estación.
  const stationLocked = role === 'estadistica' && estacion_asignada !== null && estacion_asignada !== 'todas'
  const estacion = stationLocked ? estacion_asignada : (url.searchParams.get('estacion') ?? 'todas')

  const supabase = createSupabaseAdminClient()

  let aQ = supabase.from('albums').select('id, name')
  if (estacion !== 'todas') aQ = aQ.eq('estacion', estacion)
  const { data: albums } = await aQ
  const albumIds = (albums ?? []).map(a => a.id)
  if (!albumIds.length) return new Response('Sin álbumes para esta estación', { status: 404 })

  const { data: cards } = await supabase
    .from('cards')
    .select('id, name, posicion, album_id')
    .in('album_id', albumIds)
  const cardIds = (cards ?? []).map(c => c.id)
  if (!cardIds.length) return new Response('Sin cartas para esta estación', { status: 404 })

  const uc = await fetchAll<{ user_id: string; card_id: string; redeemed_at: string }>(
    (from, to) => supabase
      .from('user_cards')
      .select('user_id, card_id, redeemed_at')
      .in('card_id', cardIds)
      .range(from, to)
  )

  // Columnas: cartas ordenadas por álbum y posición
  const albumName: Record<string, string> = {}
  for (const a of (albums ?? [])) albumName[a.id] = a.name
  const cols = (cards ?? []).slice().sort((a: any, b: any) =>
    (albumName[a.album_id] ?? '').localeCompare(albumName[b.album_id] ?? '') ||
    (a.posicion ?? 0) - (b.posicion ?? 0)
  )
  const colIndex: Record<string, number> = {}
  cols.forEach((c: any, i: number) => { colIndex[c.id] = i })

  // Celdas: primera redención de cada usuario por carta
  const grid: Record<string, string[]> = {}
  for (const r of uc) {
    const col = colIndex[r.card_id]
    if (col === undefined) continue
    if (!grid[r.user_id]) grid[r.user_id] = new Array(cols.length).fill('')
    const prev = grid[r.user_id][col]
    if (!prev || (r.redeemed_at && r.redeemed_at < prev)) grid[r.user_id][col] = r.redeemed_at ?? ''
  }

  // Perfiles en lotes: un .in() con cientos de IDs genera una URL GET demasiado
  // larga y la petición falla silenciosamente.
  const uids = Object.keys(grid)
  const profs: Record<string, { email: string; full_name: string }> = {}
  const BATCH = 100
  for (let i = 0; i < uids.length; i += BATCH) {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', uids.slice(i, i + BATCH))
    for (const p of (data ?? [])) profs[p.id] = { email: p.email ?? '', full_name: p.full_name ?? '' }
  }

  const header = [
    'Usuario', 'Email', 'Cartas',
    ...cols.map((c: any) => estacion === 'todas' ? `${albumName[c.album_id]} — ${c.name}` : c.name),
  ]

  const rows = uids
    .map(uid => {
      const cells = grid[uid]
      const total = cells.filter(Boolean).length
      const p = profs[uid]
      return { name: p?.full_name || 'Anónimo', email: p?.email ?? '', total, cells }
    })
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
    .map(r => [r.name, r.email, String(r.total), ...r.cells.map(fecha)])

  const csv = [header, ...rows].map(row => row.map(esc).join(',')).join('\r\n')
  const fname = `matriz-album-${estacion}-${new Date().toISOString().slice(0, 10)}.csv`

  return new Response('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv;charset=utf-8',
      'Content-Disposition': `attachment; filename="${fname}"`,
      'Cache-Control': 'no-store',
    },
  })
}
