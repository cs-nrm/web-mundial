import type { SupabaseClient } from '@supabase/supabase-js'

export type UserRole = 'superadmin' | 'admin' | 'editor' | 'estadistica' | 'user'

export async function getUserContext(supabase: SupabaseClient, userId: string) {
  const [{ data: profile }, { data: generales }] = await Promise.all([
    supabase.from('profiles').select('role, estacion_asignada').eq('id', userId).maybeSingle(),
    supabase.from('user_generales').select('user_id, estacion_favorita').eq('user_id', userId).maybeSingle(),
  ])
  const role = (profile?.role as UserRole) ?? 'user'
  // estacion_favorita es siempre la preferencia personal del usuario (álbum, jerseys, etc).
  // estacion_asignada es el alcance que un admin le dio a un rol "estadistica" para ver
  // reportes — son dos cosas distintas, no deben mezclarse.
  const estacion_favorita = (generales?.estacion_favorita as string | null) ?? null
  const estacion_asignada = (profile?.estacion_asignada as string | null) ?? null
  return {
    role,
    hasGenerales: !!generales,
    estacion_favorita,
    estacion_asignada,
  }
}

export async function checkGenerales(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_generales')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  return !!data
}

export const ESTADOS_MX = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
  'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco',
  'Estado de México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León',
  'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala',
  'Veracruz', 'Yucatán', 'Zacatecas',
]
