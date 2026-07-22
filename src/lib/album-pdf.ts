import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import fontkit from '@pdf-lib/fontkit'
import { Resvg } from '@resvg/resvg-js'
import {
  PDFDocument,
  rgb,
  pushGraphicsState,
  popGraphicsState,
  moveTo,
  lineTo,
  closePath,
  clip,
  endPath,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from 'pdf-lib'
import type { SupabaseClient } from '@supabase/supabase-js'

// ---- Layout A4 ----
const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN = 40
const COLS = 4
const ROWS = 3
const GUTTER = 14
const FOOTER_H = 16
const PER_PAGE = COLS * ROWS

const CARD_W = (PAGE_W - MARGIN * 2 - GUTTER * (COLS - 1)) / COLS
const IMG_H = CARD_W * 1.5 // aspecto 2:3
const CARD_H = IMG_H + FOOTER_H

// Syne es la tipografía del sitio (ver global.css). @fontsource sólo trae woff /
// woff2, y fontkit lee ambos.
const require = createRequire(import.meta.url)
const SYNE = {
  bold: require.resolve('@fontsource/syne/files/syne-latin-800-normal.woff'),
  regular: require.resolve('@fontsource/syne/files/syne-latin-500-normal.woff'),
}

const LOGO_SITIO = 'https://storage.googleapis.com/nrm-web/mundial/logo_fiestafutbol.png'

function hexToRgb(hex: string | null | undefined, fallback: [number, number, number]) {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex ?? '').trim())
  if (!m) return rgb(fallback[0] / 255, fallback[1] / 255, fallback[2] / 255)
  const n = parseInt(m[1], 16)
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}

/** Luminancia relativa (WCAG) de un color de pdf-lib. */
function luminance(c: any) {
  const ch = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return 0.2126 * ch(c.red) + 0.7152 * ch(c.green) + 0.0722 * ch(c.blue)
}

/**
 * Devuelve `color` si contrasta contra el fondo, si no `fallback`. Hace falta
 * porque en algunos álbumes el acento es casi el mismo tono que el header
 * (sabrosita: rojo sobre rojo) y la barra de progreso desaparecía.
 */
function readable(color: any, bg: any, fallback: any) {
  const [a, b] = [luminance(color), luminance(bg)].sort((x, y) => y - x)
  return (a + 0.05) / (b + 0.05) >= 1.6 ? color : fallback
}

// Syne se sirve en subconjunto latino: descarta lo que no tiene glifo (emoji,
// etc.), porque pdf-lib lanza al dibujar un carácter ausente.
function sanitize(text: string) {
  return (text ?? '').replace(/[^\x20-\x7E\xA0-ɏ]/g, '').trim()
}

function fit(text: string, font: PDFFont, size: number, maxWidth: number) {
  let t = sanitize(text)
  if (font.widthOfTextAtSize(t, size) <= maxWidth) return t
  while (t.length > 1 && font.widthOfTextAtSize(t + '...', size) > maxWidth) {
    t = t.slice(0, -1)
  }
  return t + '...'
}

/** Encoge el texto hasta que quepa antes de truncarlo (Syne es ancha). */
function fitScale(text: string, font: PDFFont, size: number, minSize: number, maxWidth: number) {
  const t = sanitize(text)
  let s = size
  while (s > minSize && font.widthOfTextAtSize(t, s) > maxWidth) s -= 0.5
  return { text: fit(t, font, s, maxWidth), size: s }
}

/**
 * pdf-lib descarta el canal alfa al incrustar un PNG y rellena lo transparente
 * con blanco y negro — los avatares salían con "parches" alrededor. Aquí se
 * compone la imagen sobre el color de fondo que le toca, vía resvg.
 */
function flatten(png: Uint8Array, bg: string): Uint8Array {
  const { width, height } = new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg"><image href="data:image/png;base64,${Buffer.from(png).toString('base64')}"/></svg>`,
  ).render()

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
    `<rect width="100%" height="100%" fill="${bg}"/>` +
    `<image width="${width}" height="${height}" href="data:image/png;base64,${Buffer.from(png).toString('base64')}"/>` +
    `</svg>`

  return new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng()
}

function isPng(bytes: Uint8Array) {
  return bytes[0] === 0x89 && bytes[1] === 0x50
}

/**
 * `bg` es el color sobre el que se aplanan los PNG con transparencia; debe
 * coincidir con lo que hay detrás de la imagen en el PDF. Con `comoLogo` la
 * imagen se monta además sobre una tarjeta blanca redondeada.
 */
async function embedImage(
  pdf: PDFDocument,
  url: string | null,
  bg = '#ffffff',
  comoLogo = false,
): Promise<PDFImage | null> {
  if (!url) return null
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const bytes = new Uint8Array(await res.arrayBuffer())
    const type = (res.headers.get('content-type') ?? '').toLowerCase()

    // Los logos de las emisoras son SVG: hay que rasterizarlos, el PDF no los admite
    let png: Uint8Array | null = null
    if (type.includes('svg') || url.toLowerCase().endsWith('.svg')) {
      png = new Resvg(Buffer.from(bytes), { fitTo: { mode: 'width', value: 900 } }).render().asPng()
    } else if (type.includes('png') || isPng(bytes)) {
      png = bytes
    }

    if (png) return await pdf.embedPng(comoLogo ? logoCard(png, bg) : flatten(png, bg))
    if (type.includes('jpeg') || type.includes('jpg')) return await pdf.embedJpg(bytes)
    // Sin content-type fiable: probar por firma de bytes
    if (bytes[0] === 0xff && bytes[1] === 0xd8) return await pdf.embedJpg(bytes)
    return null
  } catch {
    return null
  }
}

/**
 * Monta el logo sobre una tarjeta blanca de esquinas redondeadas, como en el
 * hero del álbum: casi todos son monocromos y se perderían sobre el fondo de
 * color. Se compone con resvg porque pdf-lib no dibuja esquinas redondeadas, y
 * de paso el logo conserva su transparencia contra el blanco de la tarjeta.
 */
function logoCard(png: Uint8Array, bg: string): Uint8Array {
  const { width, height } = new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg"><image href="data:image/png;base64,${Buffer.from(png).toString('base64')}"/></svg>`,
  ).render()

  const pad = Math.round(height * 0.35)
  const boxW = width + pad * 2
  const boxH = height + pad * 2
  const radius = Math.round(Math.min(boxW, boxH) * 0.16)

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${boxW}" height="${boxH}">` +
    `<rect width="100%" height="100%" fill="${bg}"/>` +
    `<rect width="${boxW}" height="${boxH}" rx="${radius}" ry="${radius}" fill="#ffffff"/>` +
    `<image x="${pad}" y="${pad}" width="${width}" height="${height}" href="data:image/png;base64,${Buffer.from(png).toString('base64')}"/>` +
    `</svg>`

  return new Resvg(svg, { fitTo: { mode: 'width', value: boxW } }).render().asPng()
}

/** Dibuja una tarjeta de logo ya compuesta, ajustada a la caja disponible. */
function drawLogo(page: PDFPage, logo: PDFImage, opts: { x: number; y: number; maxW: number; maxH: number }) {
  const ratio = logo.width / logo.height
  let h = opts.maxH
  let w = h * ratio
  if (w > opts.maxW) {
    w = opts.maxW
    h = w / ratio
  }
  page.drawImage(logo, { x: opts.x, y: opts.y, width: w, height: h })
  return { w, h }
}

type Slot = { num: string; name: string; image: PDFImage | null; obtenida: boolean }

function drawSlot(
  page: PDFPage,
  slot: Slot,
  x: number,
  y: number,
  fonts: { bold: PDFFont; regular: PDFFont },
  colors: { accent: any; cardBg: any; cardText: any; headerText: any; muted: any },
) {
  // Las bloqueadas van atenuadas: con el fondo de carta a tope competirían con
  // las obtenidas (en beat el fondo de carta es del mismo amarillo del acento).
  page.drawRectangle({
    x,
    y,
    width: CARD_W,
    height: CARD_H,
    color: colors.cardBg,
    opacity: slot.obtenida ? 1 : 0.12,
  })

  if (slot.obtenida && slot.image) {
    // "object-fit: cover": la imagen se agranda para llenar la caja y el
    // excedente se recorta con un clipping path (pdf-lib no recorta solo).
    const boxRatio = CARD_W / IMG_H
    const imgRatio = slot.image.width / slot.image.height
    let dw = CARD_W
    let dh = IMG_H
    if (imgRatio > boxRatio) dw = IMG_H * imgRatio
    else dh = CARD_W / imgRatio

    const imgY = y + FOOTER_H
    page.pushOperators(
      pushGraphicsState(),
      moveTo(x, imgY),
      lineTo(x + CARD_W, imgY),
      lineTo(x + CARD_W, imgY + IMG_H),
      lineTo(x, imgY + IMG_H),
      closePath(),
      clip(),
      endPath(),
    )
    page.drawImage(slot.image, {
      x: x - (dw - CARD_W) / 2,
      y: imgY - (dh - IMG_H) / 2,
      width: dw,
      height: dh,
    })
    page.pushOperators(popGraphicsState())
  } else {
    const label = 'BLOQUEADA'
    const size = 6
    page.drawText(label, {
      x: x + (CARD_W - fonts.bold.widthOfTextAtSize(label, size)) / 2,
      y: y + FOOTER_H + IMG_H / 2,
      size,
      font: fonts.bold,
      color: colors.headerText,
      opacity: 0.35,
    })
  }

  // Franja inferior: número + nombre. Sólo las obtenidas la llevan en color;
  // en las bloqueadas el texto va tenue sobre el fondo de la página.
  if (slot.obtenida) {
    page.drawRectangle({ x, y, width: CARD_W, height: FOOTER_H, color: colors.accent })
  }
  const textColor = slot.obtenida ? colors.cardText : colors.headerText
  const textOpacity = slot.obtenida ? 1 : 0.4

  const num = slot.num
  const numSize = 6.5
  page.drawText(num, {
    x: x + 5, y: y + 5.5, size: numSize, font: fonts.bold, color: textColor, opacity: textOpacity,
  })
  const numW = fonts.bold.widthOfTextAtSize(num, numSize)
  const nameX = x + 5 + numW + 4
  const nombre = fitScale(slot.name.toUpperCase(), fonts.bold, 6.5, 4.5, CARD_W - (nameX - x) - 5)
  page.drawText(nombre.text, {
    x: nameX,
    y: y + 5.5,
    size: nombre.size,
    font: fonts.bold,
    color: textColor,
    opacity: textOpacity,
  })

  // Borde
  page.drawRectangle({
    x,
    y,
    width: CARD_W,
    height: CARD_H,
    borderColor: colors.accent,
    borderWidth: slot.obtenida ? 1 : 0.4,
    opacity: 0,
    borderOpacity: slot.obtenida ? 1 : 0.35,
  })
}

export class AlbumNotFoundError extends Error {}

/**
 * Genera el PDF del álbum de un usuario.
 * `supabase` puede ser el cliente de sesión (respeta RLS) o el admin (scripts).
 */
export async function generarAlbumPdf(
  supabase: SupabaseClient,
  slug: string,
  usuario: { id: string; nombre: string },
): Promise<{ bytes: Uint8Array; filename: string }> {
  const [{ data: album }, { data: profile }] = await Promise.all([
    supabase
      .from('albums')
      .select('id, slug, name, total_cards, logo_url, color_acento, color_texto_card, color_fondo_card, color_header, color_texto_header')
      .eq('slug', slug)
      .eq('active', true)
      .maybeSingle(),
    supabase.from('profiles').select('avatar_url').eq('id', usuario.id).maybeSingle(),
  ])

  if (!album) throw new AlbumNotFoundError(slug)

  const { data: cards } = await supabase
    .from('cards')
    .select('id, name, image_url, posicion')
    .eq('album_id', album.id)
    .eq('active', true)
    .order('posicion', { ascending: true })

  const cardIds = (cards ?? []).map((c: any) => c.id)
  let collectedSet = new Set<string>()
  if (cardIds.length > 0) {
    const { data: userCards } = await supabase
      .from('user_cards')
      .select('card_id')
      .eq('user_id', usuario.id)
      .in('card_id', cardIds)
    collectedSet = new Set((userCards ?? []).map((uc: any) => uc.card_id))
  }

  const avatarUrl: string | null = profile?.avatar_url ?? null
  const hasAvatar = !!avatarUrl
  const total = album.total_cards ?? ((cards ?? []).length + 1)
  const collected = collectedSet.size + (hasAvatar ? 1 : 0)
  const pct = total > 0 ? Math.round((collected / total) * 100) : 0
  const displayName = usuario.nombre

  // ---- PDF ----
  const pdf = await PDFDocument.create()
  pdf.setTitle(`Mi Album de ${sanitize(album.name)}`)
  pdf.setAuthor('La Fiesta del Futbol')

  pdf.registerFontkit(fontkit)
  const bold = await pdf.embedFont(readFileSync(SYNE.bold), { subset: true })
  const regular = await pdf.embedFont(readFileSync(SYNE.regular), { subset: true })

  const colors = {
    accent: hexToRgb(album.color_acento, [255, 107, 53]),
    cardBg: hexToRgb(album.color_fondo_card, [28, 31, 40]),
    cardText: hexToRgb(album.color_texto_card, [255, 255, 255]),
    headerBg: hexToRgb(album.color_header, [15, 17, 24]),
    headerText: hexToRgb(album.color_texto_header, [255, 255, 255]),
    muted: rgb(0.55, 0.55, 0.6),
  }

  // Fondos sobre los que se aplana la transparencia de cada imagen
  const bgHeader = album.color_header ?? '#0f1118'
  const bgCard = album.color_fondo_card ?? '#1c1f28'

  // El avatar se incrusta dos veces porque va sobre dos fondos distintos
  const [logoSitio, logoAlbum, avatarPortada] = await Promise.all([
    embedImage(pdf, LOGO_SITIO, bgHeader, true),
    embedImage(pdf, album.logo_url, bgHeader, true),
    embedImage(pdf, avatarUrl, bgHeader),
  ])

  // Descarga de imágenes en tandas para no saturar la conexión
  const sources = [avatarUrl, ...(cards ?? []).map((c: any) => (collectedSet.has(c.id) ? c.image_url : null))]
  const images: (PDFImage | null)[] = []
  for (let i = 0; i < sources.length; i += 8) {
    images.push(...(await Promise.all(sources.slice(i, i + 8).map((u) => embedImage(pdf, u, bgCard)))))
  }

  const slots: Slot[] = [
    { num: '#01', name: 'Mi Avatar', image: images[0], obtenida: hasAvatar },
    ...(cards ?? []).map((c: any, i: number) => ({
      num: `#${String(c.posicion).padStart(2, '0')}`,
      name: c.name ?? '',
      image: images[i + 1],
      obtenida: collectedSet.has(c.id),
    })),
  ]

  // ---- Portada ----
  const cover = pdf.addPage([PAGE_W, PAGE_H])
  cover.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: colors.headerBg })
  cover.drawRectangle({ x: 0, y: PAGE_H - 6, width: PAGE_W, height: 6, color: colors.accent })

  // Logo del sitio en lugar del nombre escrito
  if (logoSitio) {
    drawLogo(cover, logoSitio, { x: MARGIN, y: PAGE_H - 162, maxW: 250, maxH: 80 })
  } else {
    cover.drawText('LA FIESTA DEL FUTBOL', {
      x: MARGIN, y: PAGE_H - 130, size: 10, font: bold, color: colors.accent,
    })
  }

  cover.drawText('MI ÁLBUM', {
    x: MARGIN, y: PAGE_H - 240, size: 46, font: bold, color: colors.headerText,
  })

  // Logo del álbum en lugar del nombre escrito
  if (logoAlbum) {
    drawLogo(cover, logoAlbum, { x: MARGIN, y: PAGE_H - 322, maxW: 280, maxH: 74 })
  } else {
    cover.drawText(fit(album.name.toUpperCase(), bold, 28, PAGE_W - MARGIN * 2), {
      x: MARGIN, y: PAGE_H - 290, size: 28, font: bold, color: colors.accent,
    })
  }

  if (avatarPortada) {
    const size = 150
    const img = avatarPortada
    const ratio = img.width / img.height
    const w = ratio > 1 ? size : size * ratio
    const h = ratio > 1 ? size / ratio : size
    cover.drawImage(img, { x: MARGIN, y: PAGE_H - 490, width: w, height: h })
  }

  const nombre = fitScale(displayName, bold, 20, 11, PAGE_W - MARGIN * 2)
  cover.drawText(nombre.text, {
    x: MARGIN, y: PAGE_H - 540, size: nombre.size, font: bold, color: colors.headerText,
  })

  const resumen = `${collected} de ${total} estampas (${pct}%)`
  cover.drawText(resumen, {
    x: MARGIN, y: PAGE_H - 570, size: 12, font: regular, color: colors.headerText, opacity: 0.65,
  })

  // El acento no siempre contrasta contra el fondo de la portada
  const destacado = readable(colors.accent, colors.headerBg, colors.headerText)

  // Barra de progreso
  const barW = PAGE_W - MARGIN * 2
  cover.drawRectangle({
    x: MARGIN, y: PAGE_H - 590, width: barW, height: 6, color: colors.headerText, opacity: 0.2,
  })
  cover.drawRectangle({ x: MARGIN, y: PAGE_H - 590, width: (barW * pct) / 100, height: 6, color: destacado })

  if (collected >= total && total > 0) {
    cover.drawText('ÁLBUM COMPLETO', {
      x: MARGIN, y: PAGE_H - 635, size: 16, font: bold, color: destacado,
    })
  }

  const fecha = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
  cover.drawText(sanitize(`Generado el ${fecha}`), {
    x: MARGIN, y: MARGIN, size: 9, font: regular, color: colors.muted,
  })

  // ---- Páginas de estampas ----
  const totalPages = Math.ceil(slots.length / PER_PAGE)
  for (let p = 0; p < totalPages; p++) {
    const page = pdf.addPage([PAGE_W, PAGE_H])
    page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: colors.headerBg })

    let headerX = MARGIN
    if (logoAlbum) {
      const { w } = drawLogo(page, logoAlbum, {
        x: MARGIN, y: PAGE_H - MARGIN - 13, maxW: 110, maxH: 26,
      })
      headerX += w + 10
    }
    page.drawText(fit('MI ÁLBUM', bold, 11, PAGE_W - headerX - MARGIN - 40), {
      x: headerX, y: PAGE_H - MARGIN - 4, size: 11, font: bold, color: colors.headerText,
    })

    const pageLabel = `${p + 1} / ${totalPages}`
    page.drawText(pageLabel, {
      x: PAGE_W - MARGIN - bold.widthOfTextAtSize(pageLabel, 9),
      y: PAGE_H - MARGIN - 3,
      size: 9,
      font: regular,
      color: colors.muted,
    })

    const gridTop = PAGE_H - MARGIN - 32
    for (let i = 0; i < PER_PAGE; i++) {
      const slot = slots[p * PER_PAGE + i]
      if (!slot) break
      const col = i % COLS
      const row = Math.floor(i / COLS)
      const x = MARGIN + col * (CARD_W + GUTTER)
      const y = gridTop - (row + 1) * CARD_H - row * GUTTER
      drawSlot(page, slot, x, y, { bold, regular }, colors)
    }
  }

  return { bytes: await pdf.save(), filename: `mi-album-${album.slug}.pdf` }
}
