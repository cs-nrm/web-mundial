import type { APIRoute } from 'astro'
import { verifyEmergencyToken, isEmergencyConfigured } from '../../../lib/emergency-auth'
import { rateLimit, getClientIp } from '../../../lib/rate-limit'

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!isEmergencyConfigured()) {
    return redirect('/auth/emergency?error=no_configurado')
  }

  // Anti fuerza bruta del secret: máx 5 intentos por IP cada 15 min
  const rl = rateLimit(`emergency:${getClientIp(request)}`, 5, 15 * 60_000)
  if (!rl.allowed) {
    return redirect('/auth/emergency?error=demasiados_intentos')
  }

  const form = await request.formData()
  const secret = (form.get('secret') as string | null) ?? ''

  if (!secret) {
    return redirect('/auth/emergency?error=requerido')
  }

  if (!verifyEmergencyToken(secret)) {
    // Pequeño delay para desacelerar fuerza bruta
    await new Promise(r => setTimeout(r, 800))
    return redirect('/auth/emergency?error=invalido')
  }

  // La cookie guarda el secret — es httpOnly + Secure, nunca expuesta al JS del cliente
  cookies.set('emergency_admin', secret, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 86400, // 24 horas
  })

  return redirect('/admin')
}
