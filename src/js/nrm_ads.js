// NRM Ads — rotador propio de anuncios
// Llena los slots directamente. Si no hay creative para un slot, se queda vacío.

(function () {
  const SLOT_TYPES = {
    'ad-slot2':            'boxbanner',
    'ad-slot3':            'leaderboard',
    'ad-slot32':           'leaderboard',
    'ad-slot4':            'leaderboard',
    'ad-slot-expandible':  'expandible',
    'ad-slot5':            'doublebox',
    'ad-slot6':            'super',
    'ad-slot-videonota':   'leaderboard',
  }

  let _clients = null

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

  function renderImage(el, creative, divId) {
    const slotType = resolveSlotType(divId)
    const href = `/api/ads/click?id=${creative.id}&slot=${slotType}&div=${divId}&page=${encodeURIComponent(location.pathname)}`
    el.style.display = 'block'
    el.innerHTML = `<a href="${href}" target="_blank" rel="noopener sponsored" style="display:block;line-height:0;">
      <img src="${creative.src}" alt="${creative.alt ?? ''}" style="display:block;width:100%;height:auto;max-width:100%;" loading="lazy" />
    </a>`
  }

  function renderHTML(el, creative, divId) {
    const slotType = resolveSlotType(divId)
    el.style.display = 'block'
    el.innerHTML = creative.html_code
    el.querySelectorAll('img').forEach(img => {
      if (!img.getAttribute('width') && !img.style.width) {
        img.style.display = 'block'
        img.style.maxWidth = '100%'
        img.style.height = 'auto'
      }
    })
    el.querySelectorAll('script').forEach(old => {
      const s = document.createElement('script')
      Array.from(old.attributes).forEach(a => s.setAttribute(a.name, a.value))
      s.textContent = old.textContent
      old.replaceWith(s)
    })
    // Track clicks en creatividades HTML
    el.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        fetch(
          `/api/ads/click?id=${creative.id}&slot=${slotType}&div=${divId}&page=${encodeURIComponent(location.pathname)}`,
          { keepalive: true, redirect: 'manual' }
        ).catch(() => {})
      })
    })
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

  async function initNRMAds() {
    const clients = await fetchClients()
    const client = pickClient(clients)
    if (!client) return

    const creativesBySlot = {}
    for (const c of client.ad_creatives ?? []) {
      if (!creativesBySlot[c.slot_type]) creativesBySlot[c.slot_type] = c
    }

    for (const divId of Object.keys(SLOT_TYPES)) {
      const el = document.getElementById(divId)
      if (!el) continue
      const creative = findCreative(creativesBySlot, divId)
      if (!creative) continue
      if (creative.type === 'image') renderImage(el, creative, divId)
      else if (creative.type === 'html') renderHTML(el, creative, divId)
      trackImpression(creative, client.id, divId)
    }
  }

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
