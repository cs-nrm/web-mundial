import type { APIRoute } from 'astro'
import { createSupabaseAdminClient } from '../../../../lib/supabase'
import { canAccess, MANAGE_ROLES } from '../../../../lib/admin'
import type { UserRole } from '../../../../lib/perfil'

const ROLES_PERMITIDOS = ['admin', 'editor', 'estadistica'] as const

export const POST: APIRoute = async ({ request, locals }) => {
  if (!canAccess(locals.role as UserRole, MANAGE_ROLES)) {
    return new Response(JSON.stringify({ error: 'Sin permiso' }), { status: 403 })
  }

  let body: any
  try { body = await request.json() } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo inválido' }), { status: 400 })
  }

  const email: string = body.email?.trim().toLowerCase()
  const role: string = body.role ?? 'admin'

  if (!email || !email.includes('@')) {
    return new Response(JSON.stringify({ error: 'Email inválido' }), { status: 400 })
  }

  if (!ROLES_PERMITIDOS.includes(role as any)) {
    return new Response(JSON.stringify({ error: 'Rol no permitido' }), { status: 400 })
  }

  const adminClient = createSupabaseAdminClient()

  // Invitar al usuario — Supabase envía el email de invitación automáticamente
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { role },
  })

  if (error) {
    const msg = error.message.includes('already been registered')
      ? 'Ese correo ya está registrado. Cámbia su rol desde la tabla.'
      : error.message
    return new Response(JSON.stringify({ error: msg }), { status: 400 })
  }

  // Pre-crear el perfil con el rol correcto
  if (data.user) {
    await adminClient.from('profiles').upsert({
      id: data.user.id,
      email,
      role,
    }, { onConflict: 'id' })
  }

  return new Response(JSON.stringify({ ok: true, email }), { status: 200 })
}
