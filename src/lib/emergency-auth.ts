const SECRET = import.meta.env.EMERGENCY_ADMIN_SECRET ?? ''

// Comparación en tiempo constante sin imports de Node
function safeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length)
  let diff = a.length === b.length ? 0 : 1
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) ?? 0) ^ (b.charCodeAt(i) ?? 0)
  }
  return diff === 0
}

export function verifyEmergencyToken(token: string): boolean {
  if (!SECRET || SECRET.length < 32 || !token) return false
  return safeEqual(SECRET, token)
}

export function isEmergencyConfigured(): boolean {
  return SECRET.length >= 32
}
