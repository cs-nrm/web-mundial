import type { UserRole } from './perfil'

export const ADMIN_ROLES: UserRole[] = ['superadmin', 'admin', 'editor', 'estadistica']
export const EDITOR_ROLES: UserRole[] = ['superadmin', 'admin', 'editor']
export const STATS_ROLES: UserRole[] = ['superadmin', 'admin', 'estadistica']
export const SUPERADMIN_ROLES: UserRole[] = ['superadmin']
export const MANAGE_ROLES: UserRole[] = ['superadmin', 'admin']

export function canAccess(role: UserRole, allowed: UserRole[]): boolean {
  return allowed.includes(role)
}
