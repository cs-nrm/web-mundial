function initGPT() {
  googletag.cmd.push(function() {
    googletag.destroySlots();
    window._adFallbackStates = {};

    // Safe fallback function: evita excepción si la función real no está disponible
    if (typeof window.adFallback !== 'function') {
      window.adFallback = function(slots, containerId) {
        try {
          console.warn('[GPT] adFallback stub called for', slots, containerId);
          // marca el estado para depuración
          window._adFallbackStates = window._adFallbackStates || {};
          slots.forEach(function(s){ window._adFallbackStates[s] = window._adFallbackStates[s] || {called:0}; window._adFallbackStates[s].called++; });
          // Inserta un placeholder simple solo si existe el contenedor de fallback
          if (containerId && document.getElementById(containerId)) {
            var c = document.getElementById(containerId);
            c.innerHTML = '<div class="ad-fallback" style="background:#f3f3f3;color:#222;padding:8px;border:1px solid #ddd;text-align:center;font-size:14px;">Publicidad</div>';
          }
        } catch (e) {
          console.error('[GPT] adFallback stub error', e);
        }
      };
    }

    // Responsive mappings — addSize([viewport_w, viewport_h], [ad_w, ad_h])
    var mappingBillboard   = googletag.sizeMapping().addSize([768, 0], [970, 250]).addSize([0, 0], [320, 50]).build();
    var mappingLeader      = googletag.sizeMapping().addSize([768, 0], [728,  90]).addSize([0, 0], [320, 50]).build();
    var mappingSuperLeader = googletag.sizeMapping().addSize([768, 0], [970,  90]).addSize([0, 0], [320, 50]).build();
    var mappingBox         = googletag.sizeMapping().addSize([0, 0],   [300, 250]).build();
    var mappingDoubleBox   = googletag.sizeMapping().addSize([0, 0],   [300, 600]).build();
    var mappingModal       = googletag.sizeMapping().addSize([600, 0], [600, 800]).addSize([0, 0], [320, 480]).build();
    var mappingVideoNota   = googletag.sizeMapping().addSize([0, 0], [400, 311]).build();

    window.slot3   = googletag.defineSlot("/23349147378/Mundial", [[970, 250], [320, 50]], 'ad-slot3').defineSizeMapping(mappingBillboard).addService(googletag.pubads());
    window.slot4   = googletag.defineSlot("/23349147378/Mundial", [[728,  90], [320, 50]], 'ad-slot4').defineSizeMapping(mappingLeader).addService(googletag.pubads());
    window.slot32  = googletag.defineSlot("/23349147378/Mundial", [[728,  90], [320, 50]], 'ad-slot32').defineSizeMapping(mappingLeader).addService(googletag.pubads());
    window.slot42  = googletag.defineSlot("/23349147378/Mundial", [[728,  90], [320, 50]], 'ad-slot42').defineSizeMapping(mappingLeader).addService(googletag.pubads());
    window.slot6   = googletag.defineSlot("/23349147378/Mundial", [[970,  90], [320, 50]], 'ad-slot6').defineSizeMapping(mappingSuperLeader).addService(googletag.pubads());
    window.slot2   = googletag.defineSlot("/23349147378/Mundial", [300, 250],              'ad-slot2').defineSizeMapping(mappingBox).addService(googletag.pubads());
    window.slot5   = googletag.defineSlot("/23349147378/Mundial", [300, 600],              'ad-slot5').defineSizeMapping(mappingDoubleBox).addService(googletag.pubads());
    window.slot14  = googletag.defineSlot("/23349147378/Mundial", [[600, 800], [320, 480]],'ad-slot14').defineSizeMapping(mappingModal).addService(googletag.pubads());

    googletag.pubads().setTargeting("test", "responsive");
    googletag.enableServices();

    // Debug: habilitar con ?google_console=1
    var __g_debug = (function() { try { return new URLSearchParams(window.location.search).has('google_console'); } catch(e){return false;} })();

    // Solo llamar display() si el div existe en el DOM de esta página
    ['ad-slot3','ad-slot4','ad-slot32','ad-slot42','ad-slot6','ad-slot2','ad-slot5','ad-slot14',
     'ad-slot201','ad-slot202','ad-slot203','ad-slot204','ad-slot205','ad-slot-videonota'].forEach(function(id) {
      var exists = !!document.getElementById(id);
      if (__g_debug) console.log('[GPT DEBUG] display check for', id, 'exists=', exists);
      if (exists) {
        googletag.display(id);
        if (__g_debug) console.log('[GPT DEBUG] googletag.display called for', id);
      }
    });

    // Registrar fallbacks GPT → AdSense
    if (document.getElementById('ad-slot3'))  { if(__g_debug) console.log('[GPT DEBUG] registering fallback ad-slot3'); adFallback(['ad-slot3'],  'ad-slot3-adsense'); }
    if (document.getElementById('ad-slot4'))  { if(__g_debug) console.log('[GPT DEBUG] registering fallback ad-slot4'); adFallback(['ad-slot4'],  'ad-slot4-adsense'); }
    if (document.getElementById('ad-slot32')) { if(__g_debug) console.log('[GPT DEBUG] registering fallback ad-slot32'); adFallback(['ad-slot32'], 'ad-slot32-adsense'); }
    if (document.getElementById('ad-slot42')) { if(__g_debug) console.log('[GPT DEBUG] registering fallback ad-slot42'); adFallback(['ad-slot42'], 'ad-slot42-adsense'); }
    if (document.getElementById('ad-slot6'))  { if(__g_debug) console.log('[GPT DEBUG] registering fallback ad-slot6'); adFallback(['ad-slot6'],  'ad-slot6-adsense'); }
    if (document.getElementById('ad-slot2'))  { if(__g_debug) console.log('[GPT DEBUG] registering fallback ad-slot2'); adFallback(['ad-slot2'],  'ad-slot2-adsense'); }
    if (document.getElementById('ad-slot5'))  { if(__g_debug) console.log('[GPT DEBUG] registering fallback ad-slot5'); adFallback(['ad-slot5'],  'ad-slot5-adsense'); }
  });
}


function safeRefreshSlots() {
    if (window.googletag && googletag.apiReady && googletag.pubads) {
      // Repite para cada slot, si tienes más
      if (window.slot14) googletag.pubads().refresh([window.slot14]);
      if (window.slot141) googletag.pubads().refresh([window.slot141]);
      if (window.slot2) googletag.pubads().refresh([window.slot2]);
      if (window.slot3) googletag.pubads().refresh([window.slot3]);
      if (window.slot31) googletag.pubads().refresh([window.slot31]);
      if (window.slot32) googletag.pubads().refresh([window.slot32]);
      if (window.slot321) googletag.pubads().refresh([window.slot321]);
      if (window.slot4) googletag.pubads().refresh([window.slot4]);
      if (window.slot41) googletag.pubads().refresh([window.slot41]);
      if (window.slot42) googletag.pubads().refresh([window.slot42]);
      if (window.slot421) googletag.pubads().refresh([window.slot421]);
      if (window.slot5) googletag.pubads().refresh([window.slot5]);
      if (window.slot6) googletag.pubads().refresh([window.slot6]);
      if (window.slot61) googletag.pubads().refresh([window.slot61]);
      if (window.slot201) googletag.pubads().refresh([window.slot201]);
      if (window.slot202) googletag.pubads().refresh([window.slot202]);
      if (window.slot203) googletag.pubads().refresh([window.slot203]);
      if (window.slot204) googletag.pubads().refresh([window.slot204]);
      if (window.slot205) googletag.pubads().refresh([window.slot205]);
      // O simplemente: googletag.pubads().refresh();
      console.log('Banners refrescados post navegación');
    } else {
      safeRefreshSlots(); // Intenta de nuevo después de un breve retraso);
    }
  }


  

document.addEventListener('astro:before-preparation', () => {
    document.querySelector('main').classList.add('loading');
    document.querySelector('.preloader').classList.add('showpreloader');
    if (typeof progInterval !== 'undefined' && progInterval) {
        clearInterval(progInterval);
        progInterval = null;
    }
});

document.addEventListener('astro:after-swap', () => {
    const hasInstaEmbeds = !!document.querySelector('blockquote.instagram-media, [data-instgrm-permalink], iframe[src*="instagram.com"]');
    if (!hasInstaEmbeds) return;

    const ensureInstagramSDK = () => new Promise((resolve) => {
        if (window.instgrm?.Embeds?.process) { resolve(); return; }
        let s = document.getElementById('instagram-embed-sdk');
        if (!s) {
            s = document.createElement('script');
            s.id = 'instagram-embed-sdk';
            s.src = 'https://www.instagram.com/embed.js';
            s.async = true;
            s.onload = () => resolve();
            setTimeout(() => resolve(), 2000);
            document.head.appendChild(s);
        } else {
            setTimeout(() => resolve(), 500);
        }
    });

    ensureInstagramSDK().then(() => {
        try { window.instgrm?.Embeds?.process(); }
        catch (e) { console.warn('Instagram Embeds.process() falló:', e); }
    });
});

document.addEventListener('astro:page-load', () => {
    initGPT();
    safeRefreshSlots();

    document.querySelector('main').classList.remove('loading');
    document.querySelector('.preloader').classList.remove('showpreloader');

    document.querySelectorAll('.wp-block-image').forEach((el) => {
        const img = el.querySelector('img');
        if (img) {
            const datasrc = img.getAttribute('data-src');
            if (datasrc) img.setAttribute('src', datasrc);
        }
    });
});
