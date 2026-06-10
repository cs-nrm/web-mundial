import type { APIRoute } from 'astro'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { canAccess, MANAGE_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

const MANIFEST_PATH = join(process.cwd(), 'public/avatar/manifest.json')

export const GET: APIRoute = async ({ locals }) => {
  if (!canAccess(locals.role as UserRole, MANAGE_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'))
  return new Response(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const POST: APIRoute = async ({ request, locals }) => {
  if (!canAccess(locals.role as UserRole, MANAGE_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  let body: any
  try { body = await request.json() } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400 })
  }

  if (!body?.assets || !body?.z_order) {
    return new Response(JSON.stringify({ error: 'Manifest inválido' }), { status: 400 })
  }

  const parts = (body.version ?? '1.0.0').split('.').map(Number)
  parts[2] = (parts[2] ?? 0) + 1
  body.version = parts.join('.')

  writeFileSync(MANIFEST_PATH, JSON.stringify(body, null, 2), 'utf-8')

  return new Response(JSON.stringify({ ok: true, version: body.version }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
