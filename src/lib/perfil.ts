import type { SupabaseClient } from '@supabase/supabase-js'

export type UserRole = 'superadmin' | 'admin' | 'editor' | 'estadistica' | 'user'

export async function getUserContext(supabase: SupabaseClient, userId: string) {
  const [{ data: profile }, { data: generales }] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', userId).maybeSingle(),
    supabase.from('user_generales').select('user_id').eq('user_id', userId).maybeSingle(),
  ])
  return {
    role: (profile?.role as UserRole) ?? 'user',
    hasGenerales: !!generales,
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
