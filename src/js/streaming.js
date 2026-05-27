function initGPT() {
  googletag.cmd.push(function() {
    googletag.destroySlots();
    window._adFallbackStates = {};

    // Safe fallback function: evita excepción si la función real no está disponible
    if (typeof window.adFallback !== 'function') {
      window.adFallback = function(slots, containerId) {
        try {
          console.warn('[GPT] adFallback ejecutado para', slots, '→ container:', containerId);
          // marca el estado para depuración
          window._adFallbackStates = window._adFallbackStates || {};
          slots.forEach(function(s){ 
            window._adFallbackStates[s] = window._adFallbackStates[s] || {called:0}; 
            window._adFallbackStates[s].called++; 
          });
          
          // Inserta un placeholder simple solo si existe el contenedor de fallback
          if (containerId) {
            var fallbackContainer = document.getElementById(containerId);
            if (fallbackContainer) {
              fallbackContainer.innerHTML = '<div class="ad-fallback-placeholder" style="background:#f0f0f0;color:#666;padding:10px;border:1px solid #ddd;text-align:center;font-size:12px;border-radius:4px;">Espacio publicitario disponible</div>';
              console.log('[GPT] Fallback placeholder insertado en', containerId);
            } else {
              console.log('[GPT] ℹ️ Contenedor de fallback NO existe:', containerId, '(No AdSense, Google Ads, o fallback configurado)');
            }
          } else {
            console.log('[GPT] ℹ️ Sin containerId para fallback');
          }
        } catch (e) {
          console.error('[GPT] adFallback error:', e);
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

    // Log de slots definidos
    console.log('[GPT] Slots registrados:', googletag.pubads().getSlots().map(function(s){return s.getSlotElementId();}));

    // Usar googletag.setConfig() en lugar de pubads().setTargeting() (deprecated)
    googletag.setConfig({ targeting: { test: 'responsive' } });
    googletag.enableServices();

    // Listener para detectar anuncios devueltos vacíos
    googletag.pubads().addEventListener('slotRenderEnded', function(event) {
      var slotId = event.slot.getSlotElementId();
      var isEmpty = event.isEmpty;
      var lineItemId = event.lineItemId;
      var creativeId = event.creativeId;
      console.log('[GPT] slotRenderEnded:', slotId, '| LineItem:', lineItemId, '| Creative:', creativeId, '| isEmpty=', isEmpty);
      
      if (isEmpty) {
        console.warn('[GPT] ⚠️ AdManager devolvió VACÍO para', slotId, '(LineItem:', lineItemId, ', Creative:', creativeId, ')');
      } else if (lineItemId) {
        console.log('[GPT] ✅ Anuncio servido:', slotId, 'LineItem ID:', lineItemId);
      }
    });

    // Debug: habilitar con ?google_console=1
    var __g_debug = (function() { try { return new URLSearchParams(window.location.search).has('google_console'); } catch(e){return false;} })();

    // Solo llamar display() si el div existe en el DOM de esta página
    ['ad-slot3','ad-slot4','ad-slot32','ad-slot42','ad-slot6','ad-slot2','ad-slot5','ad-slot14',
     'ad-slot201','ad-slot202','ad-slot203','ad-slot204','ad-slot205','ad-slot-videonota'].forEach(function(id) {
      var exists = !!document.getElementById(id);
      if (__g_debug) console.log('[GPT DEBUG] display check for', id, 'exists=', exists);
      if (exists) {
        try {
          googletag.display(id);
          console.log('[GPT] ✅ googletag.display() exitoso para', id);
        } catch (e) {
          console.error('[GPT] ❌ googletag.display() ERROR para', id, e);
        }
      }
    });

    // Los fallbacks ahora se ejecutan automáticamente en el listener slotRenderEnded
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
