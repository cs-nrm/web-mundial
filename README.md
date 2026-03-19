# La Fiesta del Fútbol — web-mundial

Sitio web de **[fiestafutbol.com.mx](https://fiestafutbol.com.mx/)**, proyecto de **NRM Comunicaciones**. Agrega contenido en tiempo real de 5 propiedades digitales mexicanas y lo presenta con un reproductor de radio, podcasts y transmisión en vivo.

## Stack

- **Framework:** Astro 5 (SSR, Node adapter standalone)
- **Estilos:** Tailwind CSS + SASS + CSS variables
- **Lenguaje:** TypeScript
- **Fuentes de datos:** WordPress REST API (5 sitios)
- **Integraciones:** MDX, Sitemap, RSS
- **Auth y BD:** Supabase (PostgreSQL + OAuth)

## Fuentes de contenido

El sitio agrega posts de 5 WordPress externos configurados en [src/config/sites.js](src/config/sites.js):

| Sitio | URL | Categoría |
|---|---|---|
| Beat Digital | beatdigital.com.mx | 824 |
| PlayNRM | playnrm.com | 12352 |
| Estéreo Cien Digital | stereociendigital.com.mx | 3986 |
| Sabrosita Digital | sabrositadigital.com.mx | 1650 |
| Enfoque Noticias | enfoquenoticias.com.mx | 27867 |

La lógica de fetching está en [src/lib/api.js](src/lib/api.js). El endpoint base se configura en `.env`:

```
PUBLIC_API_URL=https://fiestafutbol.com.mx/wp-json/wp/v2
```

## Estructura del proyecto

```
src/
├── components/       # +40 componentes Astro (cards, banners, player, share, etc.)
├── config/
│   └── sites.js      # Configuración de los 5 sitios WordPress
├── content/
│   └── blog/         # Posts locales en Markdown (uso secundario)
├── layouts/          # Layouts base (Layout.astro)
├── lib/
│   └── api.js        # Cliente WordPress REST API
├── pages/            # Rutas SSR
│   ├── index.astro               # Homepage
│   ├── fiesta-futbolera/[slug]   # Posts de fútbol (detalle)
│   ├── nota-sabrosa/[...page]    # Sección Sabrosita paginada
│   ├── _hot-parade/              # Rankings musicales
│   ├── _podcast/                 # Directorio de podcasts
│   ├── _live/ y _en-vivo/        # Streaming en vivo
│   └── (páginas legales)
├── js/
│   └── streaming.js  # Lógica reproductor Vimeo
├── styles/
│   └── global.css    # Variables CSS y estilos globales
└── consts.ts         # Constantes globales
public/
├── img/              # Imágenes estáticas
├── fonts/            # Fuentes locales
└── sitemap.xml
```

## Secciones principales

- **Homepage** — Grid de últimas noticias de todas las fuentes, widget sorteo, embed Vimeo, carrusel de sponsors
- **Nota Sabrosa** — Artículos paginados de Sabrosita Digital
- **Fiesta Futbolera** — Posts de fútbol con imagen destacada, autor, relacionados y share
- **Hot Parade** — Rankings musicales usando ACF custom fields
- **Podcasts** — Celia Cruz, Momentos Irrepetibles, Frecuencia del Miedo, Vidas Salseras, entre otros
- **En Vivo** — Radio streaming y eventos en vivo

## Paleta de colores

| Variable | Valor | Uso |
|---|---|---|
| `--rojo` | `#EA262A` | Links y highlights |
| `--morado` | `#320E41` | Acento principal |
| `--gris` | `#ADABAB` | Textos secundarios |
| Background | `#7af12b` | Lime green (marca) |

## Comandos

```bash
npm install       # Instalar dependencias
npm run dev       # Dev server en localhost:4321
npm run build     # Build de producción (astro check && astro build)
npm run preview   # Preview del build
```

## Integraciones externas

- **Vimeo** — Embeds de streaming en vivo
- **Google Tag Manager** — Analytics (GTM-5Z64ZJS8)
- **Comscore** — Métricas web
- **Flickity** — Carruseles
- **Plyr.js** — Reproductor de video
- **Google Cloud Storage** — CDN para assets estáticos (storage.googleapis.com/nrm-web)

## Autenticación y sesiones

### Proveedor
Supabase Auth con OAuth de Google. El proyecto de Supabase es `jvuflrzyvbjuxqiwlgrc` (AWS us-east-2).

### Variables de entorno requeridas
```
PUBLIC_SUPABASE_URL=https://jvuflrzyvbjuxqiwlgrc.supabase.co
PUBLIC_SUPABASE_ANON_KEY=...
```

### Flujo de autenticación
```
GET /auth/login      → signInWithOAuth('google') → redirige a Google
Google               → redirige a Supabase callback (jvuflrzyvbjuxqiwlgrc.supabase.co/auth/v1/callback)
Supabase             → redirige a /auth/callback
GET /auth/callback   → exchangeCodeForSession() → redirige a /
GET /auth/logout     → signOut() → redirige a /
```

### Archivos clave
| Archivo | Rol |
|---|---|
| `src/lib/supabase.ts` | Factory del cliente Supabase SSR (usa `parseCookieHeader` del request) |
| `src/middleware.ts` | Inyecta `session`, `user` y `hasGenerales` en `Astro.locals` en cada request |
| `src/pages/auth/login.ts` | Inicia el flujo OAuth con Google |
| `src/pages/auth/callback.ts` | Recibe el code de Google y crea la sesión |
| `src/pages/auth/logout.ts` | Cierra la sesión y redirige al home |
| `src/components/AuthButton.astro` | Botón en el header: muestra "Iniciar sesión" o nombre + dropdown |

### Sesión en páginas
En cualquier página `.astro` o endpoint:
```ts
const { session, user, hasGenerales } = Astro.locals
// user?.user_metadata.full_name — nombre del usuario
// user?.email — correo
// hasGenerales — boolean, si ya completó sus datos personales
```

---

## Base de datos (Supabase)

### Tablas

**`public.profiles`** — se llena automáticamente al primer login vía trigger en `auth.users`
```
id, email, full_name, avatar_url, provider, created_at
```

**`public.user_generales`** — datos personales, llenados por el usuario una sola vez antes de participar en una promo
```
user_id (PK→profiles), cp, estado, municipio, colonia, fecha_nac, acepto_aviso, fecha_aviso, completed_at
```

**`public.promo_[nombre]`** — una tabla por cada promoción, con los datos específicos del concurso

### Perfil modal (`PerfilModal.astro`)
Componente global incluido en `Layout.astro`. Solicita los datos de `user_generales` la primera vez que el usuario intenta participar en una promo.

**Uso en páginas de promo:**
```js
// Verifica si el usuario tiene generales. Si no, abre el modal.
// Cuando el usuario completa o ya tenía sus datos, ejecuta el callback.
window.requirePerfil(() => {
  // lógica de participación en la promo
})
```

### RLS (Row Level Security)
Todas las tablas tienen RLS habilitado. Cada usuario solo puede leer y escribir sus propios registros (`auth.uid() = user_id`).

### Producción
Al desplegar, agregar en Supabase → Authentication → URL Configuration:
- Site URL: `https://fiestafutbol.com.mx`
- Redirect URLs: `https://fiestafutbol.com.mx/auth/callback`

Y en Google Cloud Console → OAuth Client → Authorized redirect URIs agregar `https://fiestafutbol.com.mx/auth/callback`.

---

## Notas de desarrollo

- El sitio usa **SSR** (no generación estática), por lo que el contenido se actualiza dinámicamente desde los WordPress en cada request.
- Los posts usan **ACF** (Advanced Custom Fields) y metadatos **Yoast SEO** (Open Graph, Twitter Cards).
- La rama `mundial` es la variante temática de este proyecto (cobertura especial de fútbol).
