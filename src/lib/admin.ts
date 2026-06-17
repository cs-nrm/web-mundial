import type { UserRole } from './perfil'

export const ADMIN_ROLES:     UserRole[] = ['superadmin', 'admin', 'editor', 'estadistica', 'social', 'anuncios']
export const EDITOR_ROLES:    UserRole[] = ['superadmin', 'admin', 'editor']
export const STATS_ROLES:     UserRole[] = ['superadmin', 'admin', 'estadistica']
export const SUPERADMIN_ROLES:UserRole[] = ['superadmin']
export const MANAGE_ROLES:    UserRole[] = ['superadmin', 'admin']
export const SOCIAL_ROLES:    UserRole[] = ['superadmin', 'admin', 'social']
export const ANUNCIOS_ROLES:  UserRole[] = ['superadmin', 'admin', 'anuncios']

export function canAccess(role: UserRole, allowed: UserRole[]): boolean {
  return allowed.includes(role)
}
