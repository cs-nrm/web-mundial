// Rate limiter en memoria (ventana fija por clave).
// Suficiente para una sola instancia. Para multi-instancia migrar a Redis/Upstash.

type Bucket = { count: number; resetAt: number }
const store = new Map<string, Bucket>()

// Limpieza periódica para no crecer indefinidamente
let lastSweep = Date.now()
function sweep(now: number) {
  if (now - lastSweep < 60_000) return
  lastSweep = now
  for (const [key, b] of store) {
    if (b.resetAt <= now) store.delete(key)
  }
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfter: number // segundos
}

/**
 * @param key    identificador (p.ej. `signin:<ip>`)
 * @param limit  máximo de intentos en la ventana
 * @param windowMs  duración de la ventana en ms
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const b = store.get(key)
  if (!b || b.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfter: 0 }
  }

  if (b.count >= limit) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((b.resetAt - now) / 1000) }
  }

  b.count++
  return { allowed: true, remaining: limit - b.count, retryAfter: 0 }
}

/** Extrae la IP del request respetando proxies (x-forwarded-for). */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}
