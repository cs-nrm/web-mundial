// NRM Ads — rotador propio de anuncios
// Actúa como house ad: llena los slots donde GPT no sirvió (isEmpty).
// Si no hay GPT en la página, llena directo.

(function () {
  // Valores string = slot_type exacto. Arrays = preferencia (primer match gana).
  const SLOT_TYPES = {
    'ad-slot2':          'boxbanner',
    'ad-slot3':          'leaderboard',
    'ad-slot32':         'leaderboard',
    'ad-slot4':          ['leaderexpandible', 'leaderboard'],
    'ad-slot5':          'doublebox',
    'ad-slot6':          'leaderboard',
    'ad-slot14':         'superleader',
    'ad-slot-videonota': 'leaderboard',
  }

  let _clients = null

  // Slots vacíos que llegaron antes de que los clientes cargaran
  let _pendingEmptySlots = []
  // Callback activo para llenar un slot (se asigna cuando clients están listos)
  let _fillSlotFn = null

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
    const slotType = resolveSlotType(divId)
    const href = `/api/ads/click?id=${creative.id}&slot=${slotType}&div=${divId}&page=${encodeURIComponent(location.pathname)}`
    el.style.display = 'block'
    el.innerHTML = `<a href="${href}" target="_blank" rel="noopener sponsored" style="display:block;line-height:0;">
      <img src="${creative.src}" alt="${creative.alt ?? ''}" style="display:block;width:100%;height:auto;max-width:100%;" loading="lazy" />
    </a>`
  }

  function renderHTML(el, creative) {
    el.style.display = 'block'
    el.innerHTML = creative.html_code
    // Aplicar dimensiones base a imgs que no las tengan
    el.querySelectorAll('img').forEach(img => {
      if (!img.getAttribute('width') && !img.style.width) {
        img.style.display = 'block'
        img.style.maxWidth = '100%'
        img.style.height = 'auto'
      }
    })
    // Re-ejecutar scripts de terceros
    el.querySelectorAll('script').forEach(old => {
      const s = document.createElement('script')
      Array.from(old.attributes).forEach(a => s.setAttribute(a.name, a.value))
      s.textContent = old.textContent
      old.replaceWith(s)
    })
  }

  function resolveSlotType(divId) {
    const val = SLOT_TYPES[divId]
    return Array.isArray(val) ? val[0] : (val ?? 'leaderboard')
  }

  function findCreative(creativesBySlot, divId) {
    const val = SLOT_TYPES[divId]
    const types = Array.isArray(val) ? val : [val]
    for (const t of types) {
      if (creativesBySlot[t]) return creativesBySlot[t]
    }
    return null
  }

  function trackImpression(creative, clientId, divId) {
    const slotType = resolveSlotType(divId)
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

  // Registrar listener de GPT una sola vez (sobrevive navegaciones SPA)
  function registerGPTListener() {
    if (!window.googletag) return
    googletag.cmd.push(() => {
      googletag.pubads().addEventListener('slotRenderEnded', (event) => {
        if (!event.isEmpty) return
        const divId = event.slot.getSlotElementId()
        if (!SLOT_TYPES[divId]) return
        if (_fillSlotFn) {
          _fillSlotFn(divId)
        } else {
          _pendingEmptySlots.push(divId)
        }
      })
    })
  }

  async function initNRMAds() {
    // Reiniciar estado por navegación
    _fillSlotFn = null
    _pendingEmptySlots = []

    const clients = await fetchClients()
    const client = pickClient(clients)
    if (!client) return

    const creativesBySlot = {}
    for (const c of client.ad_creatives ?? []) {
      if (!creativesBySlot[c.slot_type]) creativesBySlot[c.slot_type] = c
    }

    function fillSlot(divId) {
      const el = document.getElementById(divId)
      if (!el) return
      const creative = findCreative(creativesBySlot, divId)
      if (!creative) return
      if (creative.type === 'image') renderImage(el, creative, divId)
      else if (creative.type === 'html') renderHTML(el, creative)
      trackImpression(creative, client.id, divId)
    }

    if (window.googletag) {
      // Llenar slots que GPT ya marcó como vacíos antes de que cargáramos
      for (const divId of _pendingEmptySlots) fillSlot(divId)
      _pendingEmptySlots = []
      // Registrar callback para eventos futuros del mismo ciclo de página
      _fillSlotFn = fillSlot
    } else {
      // Sin GPT: llenar todos los slots directamente
      for (const divId of Object.keys(SLOT_TYPES)) fillSlot(divId)
    }
  }

  registerGPTListener()

  window.initNRMAds = initNRMAds

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNRMAds)
  } else {
    initNRMAds()
  }

  document.addEventListener('astro:page-load', () => {
    _clients = null
    initNRMAds()
  })
})()
