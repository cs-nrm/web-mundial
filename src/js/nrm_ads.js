// NRM Ads — rotador propio de anuncios
// Carga un cliente al azar (equitativo) y muestra SU creatividad en todos los slots de la página.

(function () {
  // Mapeo de div → tipo de slot
  const SLOT_TYPES = {
    'ad-slot2':         'box',
    'ad-slot3':         'leader',
    'ad-slot32':        'leader',
    'ad-slot4':         'leader',
    'ad-slot5':         'box',
    'ad-slot6':         'leader',
    'ad-slot14':        'leader',
    'ad-slot-videonota':'leader',
  }

  let _clients = null // cache por sesión

  async function fetchClients() {
    if (_clients) return _clients
    try {
      const res = await fetch('/api/ads/load')
      if (!res.ok) return []
      const { clients } = await res.json()
      _clients = (clients ?? []).filter(c => c.ad_creatives?.length)
      return _clients
    } catch {
      return []
    }
  }

  function pickClient(clients) {
    if (!clients.length) return null
    return clients[Math.floor(Math.random() * clients.length)]
  }

  function renderImage(el, creative, divId) {
    const slotType = SLOT_TYPES[divId] ?? 'leader'
    const href = `/api/ads/click?id=${creative.id}&slot=${slotType}&div=${divId}&page=${encodeURIComponent(location.pathname)}`
    el.innerHTML = `<a href="${href}" target="_blank" rel="noopener sponsored" style="display:block;line-height:0;">
      <img src="${creative.src}" alt="${creative.alt ?? ''}" style="display:block;width:100%;height:auto;max-width:100%;" loading="lazy" />
    </a>`
  }

  function renderHTML(el, creative) {
    el.innerHTML = creative.html_code
    // Re-ejecutar scripts del código de terceros
    el.querySelectorAll('script').forEach(old => {
      const s = document.createElement('script')
      Array.from(old.attributes).forEach(a => s.setAttribute(a.name, a.value))
      s.textContent = old.textContent
      old.replaceWith(s)
    })
  }

  function trackImpression(creative, clientId, divId) {
    const slotType = SLOT_TYPES[divId] ?? 'leader'
    fetch('/api/ads/impression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creative_id: creative.id,
        client_id: clientId,
        slot_type: slotType,
        slot_id: divId,
        page_url: location.pathname,
      }),
      keepalive: true,
    }).catch(() => {})
  }

  async function initNRMAds() {
    const clients = await fetchClients()
    const client = pickClient(clients)
    if (!client) return

    // Indexar creatividades por slot_type para lookup rápido
    const creativesBySlot = {}
    for (const c of client.ad_creatives ?? []) {
      if (!creativesBySlot[c.slot_type]) creativesBySlot[c.slot_type] = c
    }

    for (const [divId, slotType] of Object.entries(SLOT_TYPES)) {
      const el = document.getElementById(divId)
      if (!el) continue

      const creative = creativesBySlot[slotType]
      if (!creative) continue

      if (creative.type === 'image') renderImage(el, creative, divId)
      else if (creative.type === 'html') renderHTML(el, creative)

      trackImpression(creative, client.id, divId)
    }
  }

  window.initNRMAds = initNRMAds

  // Cargar en primera visita y en cada navegación SPA
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNRMAds)
  } else {
    initNRMAds()
  }

  document.addEventListener('astro:page-load', () => {
    _clients = null // refrescar lista en cada navegación
    initNRMAds()
  })
})()
