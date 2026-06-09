// ===== Google Ad Manager (GPT) =====
// Solo Ad Manager — sin fallback a AdSense.
// initGPT() se dispara en astro:page-load (carga inicial Y navegaciones SPA),
// centralizado aquí para evitar la doble inicialización que destruía el anuncio del modal.

function initGPT() {
  googletag.cmd.push(function () {
    googletag.destroySlots();

    // Responsive mappings: addSize([viewport_w, viewport_h], [ad_w, ad_h])
    var mapping2  = googletag.sizeMapping().addSize([0,   0], [300, 250]).build();
    var mapping3  = googletag.sizeMapping().addSize([768, 0], [970, 250]).addSize([0, 0], [320,  50]).build();
    var mapping32 = googletag.sizeMapping().addSize([768, 0], [728,  90]).addSize([0, 0], [320,  50]).build();
    var mapping4  = googletag.sizeMapping().addSize([768, 0], [728,  90]).addSize([0, 0], [320,  50]).build();
    var mapping5  = googletag.sizeMapping().addSize([0,   0], [300, 600]).build();
    var mapping6  = googletag.sizeMapping().addSize([768, 0], [970,  90]).addSize([0, 0], [320,  50]).build();
    var mapping14 = googletag.sizeMapping().addSize([768, 0], [600, 800]).addSize([0, 0], [320, 480]).build();
    var mappingVideoNota = googletag.sizeMapping().addSize([0, 0], [400, 311]).build();

    // Solo definir el slot si el div existe en esta página
    if (document.getElementById('ad-slot2'))
      window.slot2 = googletag.defineSlot('/21799830913/Mundial-Enfoque/Box', [300, 250], 'ad-slot2').defineSizeMapping(mapping2).addService(googletag.pubads());

    if (document.getElementById('ad-slot3'))
      window.slot3 = googletag.defineSlot('/21799830913/Mundial-Enfoque/leader', [[970, 250], [320, 50]], 'ad-slot3').defineSizeMapping(mapping3).addService(googletag.pubads());

    if (document.getElementById('ad-slot32'))
      window.slot32 = googletag.defineSlot('/21799830913/Mundial-Enfoque/leader', [[728, 90], [320, 50]], 'ad-slot32').defineSizeMapping(mapping32).addService(googletag.pubads());

    if (document.getElementById('ad-slot4'))
      window.slot4 = googletag.defineSlot('/21799830913/Mundial-Enfoque/leader', [[728, 90], [320, 50]], 'ad-slot4').defineSizeMapping(mapping4).addService(googletag.pubads());

    if (document.getElementById('ad-slot5'))
      window.slot5 = googletag.defineSlot('/21799830913/Mundial-Enfoque/Box', [300, 600], 'ad-slot5').defineSizeMapping(mapping5).addService(googletag.pubads());

    if (document.getElementById('ad-slot6'))
      window.slot6 = googletag.defineSlot('/21799830913/Mundial-Enfoque/leader', [[970, 90], [320, 50]], 'ad-slot6').defineSizeMapping(mapping6).addService(googletag.pubads());

    if (document.getElementById('ad-slot14'))
      window.slot14 = googletag.defineSlot('/21799830913/Mundial-Enfoque/leader', [[600, 800], [320, 480]], 'ad-slot14').defineSizeMapping(mapping14).addService(googletag.pubads());

    if (document.getElementById('ad-slot-videonota'))
      window.slotVideoNota = googletag.defineSlot('/21799830913/Mundial-Enfoque/leader', [400, 311], 'ad-slot-videonota').defineSizeMapping(mappingVideoNota).addService(googletag.pubads());

    googletag.setConfig({ targeting: { test: 'responsive' } });
    googletag.enableServices();

    // display() solo en slots presentes
    if (document.getElementById('ad-slot2'))          googletag.display('ad-slot2');
    if (document.getElementById('ad-slot3'))          googletag.display('ad-slot3');
    if (document.getElementById('ad-slot32'))         googletag.display('ad-slot32');
    if (document.getElementById('ad-slot4'))          googletag.display('ad-slot4');
    if (document.getElementById('ad-slot5'))          googletag.display('ad-slot5');
    if (document.getElementById('ad-slot6'))          googletag.display('ad-slot6');
    if (document.getElementById('ad-slot14'))         googletag.display('ad-slot14');
    if (document.getElementById('ad-slot-videonota')) googletag.display('ad-slot-videonota');
  });
}

function safeRefreshSlots() {
  if (window.googletag && googletag.apiReady && googletag.pubads) {
    if (window.slot2)          googletag.pubads().refresh([window.slot2]);
    if (window.slot3)          googletag.pubads().refresh([window.slot3]);
    if (window.slot32)         googletag.pubads().refresh([window.slot32]);
    if (window.slot4)          googletag.pubads().refresh([window.slot4]);
    if (window.slot5)          googletag.pubads().refresh([window.slot5]);
    if (window.slot6)          googletag.pubads().refresh([window.slot6]);
    if (window.slot14)         googletag.pubads().refresh([window.slot14]);
    if (window.slotVideoNota)  googletag.pubads().refresh([window.slotVideoNota]);
    console.log('[ads] Banners refrescados post navegación');
  } else {
    setTimeout(safeRefreshSlots, 400);
  }
}

// Exponer globalmente para uso externo (player, etc.)
window.initGPT = initGPT;
window.safeRefreshSlots = safeRefreshSlots;

// Llamada directa: el script se ejecuta cuando el DOM ya está listo (Astro lo garantiza).
// El listener de astro:page-load queda como respaldo para cuando ViewTransitions esté activo.
initGPT();
document.addEventListener('astro:page-load', () => {
  initGPT();
});
