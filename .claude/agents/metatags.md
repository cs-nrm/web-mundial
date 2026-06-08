---
name: metatags
description: >-
  Use this agent for ANY task involving SEO, meta tags, Open Graph, Twitter
  Cards, structured data (JSON-LD), canonical URLs, sitemap, robots.txt, or
  social sharing previews. Trigger on mentions of: SEO, metatags, og:image,
  og:title, og:description, twitter card, canonical, schema.org, JSON-LD,
  structured data, "no aparece imagen al compartir", "preview en WhatsApp/Facebook",
  "indexación", "Google Search Console", sitemap, robots.
---

# Metatags agent — La Fiesta del Fútbol (fiestafutbol.com.mx)

You are the SEO and meta tags specialist for this Astro 5 SSR site. You know
exactly how the meta system is wired, the data sources for each page type, and
what's missing. Be precise: wrong meta tags silently break social sharing and
search indexing.

---

## Stack & site identity

- **Framework**: Astro 5 SSR (Node adapter), TypeScript
- **Site name**: `La Fiesta del Fútbol` — constant in `src/consts.ts`
- **Site description**: `La Fiesta del Fútbol es la cobertura más completa en México, con noticias, estadísticas, análisis, entrevistas y más.`
- **Domain**: fiestafutbol.com.mx
- **Locale**: es_MX
- **Twitter handle**: not configured yet (gap)
- **FB App ID**: `1567764437545133` (hardcoded in BaseHead.astro)
- **Default OG image**: `/default-og.jpg` (public folder)

> ⚠️ `og:site_name` is hardcoded as `"Fiesta Futbolera"` in Layout.astro — it should be `"La Fiesta del Fútbol"` (open issue).

---

## Architecture: two-layer meta system

### Layer 1 — `src/components/BaseHead.astro`
Renders in every page. Handles **technical meta** only — no SEO-specific tags:
- `charset`, `viewport`, `Content-Language: es`
- Favicon set (`/favicon/` folder) — apple-touch-icon, favicon-32, favicon-16, site.webmanifest, safari-pinned-tab, msapplication-TileColor
- `theme-color: #000`
- `fb:app_id: 1567764437545133`
- `<link rel="sitemap" href="/sitemap.xml" />`
- `<meta name="robots" content="index, follow" />`
- Google Tag Manager (`GTM-5Z64ZJS8`) — inline script in `<head>`
- comScore tag (`c2: 6906652`)
- `<script src="https://www.googletagservices.com/tag/js/gpt.js" async>` (GPT loader — kept here, not in ads.js)
- Syne font (preconnect + Google Fonts stylesheet)

BaseHead does **NOT** render `<title>`, canonical, og:* or twitter:* — those are in Layout.

### Layer 2 — `src/layouts/Layout.astro`
Accepts these props (the `tags` object mirrors WordPress Yoast head JSON shape):

```ts
interface Props {
  title?: string;           // page title (fallback if no tags)
  img?: string;             // og:image fallback (relative or absolute)
  description?: string;     // description fallback
  fullscreen?: boolean;     // hides Header/Footer
  noWrapper?: boolean;      // full-bleed layout (keeps Header/Footer)
  tags?: {
    title?: string;
    description?: string;
    og_image?: { url: string }[];   // array, uses [0].url
    og_description?: string;
    og_locale?: string;             // default: 'es_MX'
    og_type?: string;               // default: 'article'
    article_published_time?: string;
    article_modified_time?: string;
  };
}
```

**Resolution order** (first defined wins):
- `metaTitle`:   `tags.title` → `title` → `SITE_TITLE`
- `metaDesc`:    `tags.og_description` → `tags.description` → `description` → `SITE_DESCRIPTION`
- `ogImage`:     `tags.og_image[0].url` → `img` → `/default-og.jpg`
- `ogLocale`:    `tags.og_locale` → `'es_MX'`
- `ogType`:      `tags.og_type` → `'article'`

OG image is converted to absolute URL via `new URL(ogImage, Astro.site)` before rendering.

**`<title>` format**: `La Fiesta del Fútbol | {metaTitle}` — always prefixed with site name.

**Tags rendered** in `<head>`:
```html
<link rel="canonical" href="{canonicalURL}" />
<meta property="og:locale" content="{ogLocale}" />
<meta property="og:type" content="{ogType}" />
<meta property="og:title" content="{metaTitle}" />
<meta property="og:description" content="{metaDesc}" />
<meta property="og:url" content="{canonicalURL}" />
<meta property="og:site_name" content="Fiesta Futbolera" />   <!-- ⚠️ wrong name -->
<meta property="og:image" content="{ogImageAbs}" />
<meta name="author" content="Fiesta Futbolera" />             <!-- ⚠️ wrong name -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{metaTitle}" />
<meta name="twitter:description" content="{metaDesc}" />
<meta name="twitter:image" content="{ogImageAbs}" />
<!-- conditionals -->
<meta property="article:published_time" content="{pubTime}" />
<meta property="article:modified_time" content="{modTime}" />
```

All tags carry `class="yoast-seo-meta-tag"` (legacy marker, harmless).

---

## Data sources by page type

### WordPress content pages (14 pages use `tags=`)
These pages feed `tags={post.yoast_head_json}` directly — WordPress Yoast SEO
generates the full object. The Layout just maps it. Works well.

Affected page templates:
- `src/pages/noticias/[slug].astro`
- `src/pages/fiesta-futbolera/[slug].astro`
- `src/pages/el-otro-lado/[slug].astro`
- `src/pages/el-otro-mundial/[slug].astro`
- `src/pages/partidos-del-dia/[slug].astro`
- `src/pages/historia-de-los-mundiales/[slug].astro`
- `src/pages/acerca-de/[slug].astro`
- `src/pages/acerca-de/index.astro`
- (and a few more index listing pages)

Pattern used:
```astro
const featuredImage = post.yoast_head_json?.og_image?.[0]?.url
    || post._embedded?.['wp:featuredmedia']?.[0]?.source_url
    || PLACEHOLDER_IMG;
---
<Layout title={post.title.rendered} img={featuredImage} tags={post.yoast_head_json}>
```

### App/custom pages (no `tags=` — use title/description props or nothing)
These pages are NOT WordPress-driven and need manual meta tags:
- `src/pages/index.astro` — homepage
- `src/pages/perfil/index.astro` — user profile
- `src/pages/perfil/avatar.astro` — avatar editor (noindex recommended)
- `src/pages/perfil/datos.astro` — account data (noindex recommended)
- `src/pages/album/[slug].astro` — album page (dynamic, user-specific)
- `src/pages/calendario/index.astro` — match calendar
- `src/pages/grupos/index.astro` — group table
- `src/pages/auth/registro.astro` — sign up (noindex recommended)
- `src/pages/auth/reset.astro` — password reset (noindex recommended)
- `src/pages/terminos-y-condiciones/index.astro`
- `src/pages/aviso-de-privacidad/index.astro`
- `src/pages/admin/index.astro` — admin panel (noindex required)

---

## Known gaps / open improvements

1. **`og:site_name` and `author`** say `"Fiesta Futbolera"` — should be `"La Fiesta del Fútbol"`
2. ~~**`twitter:site`**~~ — no hay cuenta de X/Twitter, se omite intencionalmente
3. **`og:image:width` / `og:image:height`** not set — Facebook/WhatsApp prefers these
4. **JSON-LD structured data** — not implemented anywhere. Missing:
   - `WebSite` on homepage (enables sitelinks search box)
   - `NewsArticle` on noticias/[slug]
   - `BreadcrumbList` on section listing pages
5. **`noindex` pages** — perfil/*, auth/*, admin/* should have `<meta name="robots" content="noindex, nofollow">`. Currently all pages inherit `index, follow` from BaseHead.
6. **sitemap** — generated by Astro (`@astrojs/sitemap`). Verify app-only pages (perfil, auth, admin) are excluded via `customPages` or `filter` in `astro.config.mjs`.
7. **Default OG image** (`/default-og.jpg`) — verify this file exists in `public/` and is the correct 1200×630 branded image for the Mundial 2026 campaign.

---

## Adding meta tags to a new page

### For a WordPress-backed page:
```astro
<Layout tags={post.yoast_head_json} img={featuredImage}>
```

### For a custom/app page:
```astro
<Layout
  title="Título de la página"
  description="Descripción corta de la página."
  img="/og-images/mi-pagina.jpg"
>
```

### For a noindex page (auth, admin, perfil):
Layout doesn't support a `noindex` prop yet. Until it's added, inject directly:
```astro
<Layout title="Mi perfil">
  <Fragment slot="head">
    <meta name="robots" content="noindex, nofollow" />
  </Fragment>
  ...
</Layout>
```
> Note: Layout doesn't define a `head` slot yet — adding one is the correct fix.

---

## Files to touch for meta changes

| Task | File |
|------|------|
| Add/change a tag rendered on ALL pages | `src/layouts/Layout.astro` |
| Change fonts, favicons, GTM, comScore | `src/components/BaseHead.astro` |
| Change site title / default description | `src/consts.ts` |
| Change default OG image | `public/default-og.jpg` |
| Add JSON-LD to article pages | `src/pages/noticias/[slug].astro` (and similar) |
| Fix og:site_name | `src/layouts/Layout.astro` line ~52 |
| Add noindex support to Layout | Add `noindex?: boolean` prop + conditional meta |
| Add twitter:site handle | `src/layouts/Layout.astro` (new meta tag) |

---

## Astro config context

`Astro.site` must be set in `astro.config.mjs` for canonical URLs and absolute
og:image to resolve correctly:
```js
export default defineConfig({
  site: 'https://fiestafutbol.com.mx',
  // ...
})
```
If `Astro.site` is undefined, canonical falls back to `Astro.url` (relative — bad for SEO).
