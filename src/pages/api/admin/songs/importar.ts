import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '../../../../lib/supabase'
import { canAccess, EDITOR_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'
import * as XLSX from 'xlsx'

const ESTACIONES_VALIDAS = ['oye', 'beat', 'stereocien', 'sabrosita']

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  if (!canAccess(locals.role as UserRole, EDITOR_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const estacion = (formData.get('estacion') as string | null)?.trim().toLowerCase()

  if (!file || !file.size) {
    return new Response(JSON.stringify({ error: 'Archivo requerido' }), { status: 400 })
  }
  if (!estacion || !ESTACIONES_VALIDAS.includes(estacion)) {
    return new Response(JSON.stringify({ error: 'Selecciona una estación válida' }), { status: 400 })
  }

  const allowed = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ]
  if (!allowed.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
    return new Response(JSON.stringify({ error: 'Solo se permiten archivos CSV o Excel' }), { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  let rows: any[]

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
  } catch {
    return new Response(JSON.stringify({ error: 'No se pudo leer el archivo. Verifica el formato.' }), { status: 400 })
  }

  if (!rows.length) {
    return new Response(JSON.stringify({ error: 'El archivo está vacío.' }), { status: 400 })
  }

  // Normalizar claves (case insensitive, variantes en español/inglés)
  const normalize = (row: any) => {
    const keys = Object.keys(row)
    const get = (...names: string[]) => {
      for (const n of names) {
        const k = keys.find(k => k.toLowerCase().trim() === n)
        if (k) return String(row[k]).trim()
      }
      return ''
    }
    return {
      artist: get('artista', 'artist', 'autor'),
      title: get('titulo', 'título', 'title', 'cancion', 'canción', 'song'),
    }
  }

  const HEADER_WORDS = ['artista', 'artist', 'autor', 'titulo', 'título', 'title', 'cancion', 'canción', 'song']

  const registros = rows
    .map(normalize)
    .filter(r => r.artist && r.title)
    .filter(r => !HEADER_WORDS.includes(r.artist.toLowerCase()) && !HEADER_WORDS.includes(r.title.toLowerCase()))

  if (!registros.length) {
    return new Response(JSON.stringify({ error: 'No se encontraron filas válidas. Verifica que el archivo tenga columnas: artista, titulo' }), { status: 400 })
  }

  const payload = registros.map(r => ({
    artist: r.artist,
    title: r.title,
    estacion,
  }))

  const supabase = createSupabaseServerClient(request, cookies)

  // Insertar ignorando duplicados (mismo artista + título + estación)
  // Una canción puede existir en múltiples estaciones como entradas separadas
  const { data, error } = await supabase
    .from('songs_catalog')
    .upsert(payload, { onConflict: 'artist,title,estacion', ignoreDuplicates: true })
    .select('id')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  const insertadas = data?.length ?? 0
  const duplicadas = payload.length - insertadas

  return new Response(JSON.stringify({ ok: true, insertadas, duplicadas, total: payload.length }), { status: 200 })
}
