/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

import type { Session, User } from '@supabase/supabase-js'

interface ImportMetaEnv {
  readonly PUBLIC_API_URL: string
  readonly PUBLIC_SUPABASE_URL: string
  readonly PUBLIC_SUPABASE_ANON_KEY: string
  readonly SUPABASE_SERVICE_ROLE_KEY: string
}

declare global {
  namespace App {
    interface Locals {
      session: Session | null
      user: User | null
      hasGenerales: boolean
      role: 'superadmin' | 'admin' | 'editor' | 'estadistica' | 'user'
      estacion_favorita: string | null
      estacion_asignada: string | null
    }
  }
}
