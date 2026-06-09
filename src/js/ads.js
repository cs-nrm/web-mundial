// ===== Google Ad Manager (GPT) =====
// Solo Ad Manager — sin fallback a AdSense.

function initGPT() {
  googletag.cmd.push(function () {
    googletag.destroySlots();

    // Tamaños fijos — sin responsive mapping para máxima compatibilidad
    if (document.getElementById('ad-slot2'))
      window.slot2 = googletag.defineSlot('/21799830913/Mundial/Box', [[300, 250]], 'ad-slot2').addService(googletag.pubads());

    if (document.getElementById('ad-slot3'))
      window.slot3 = googletag.defineSlot('/21799830913/Mundial/Leader', [[728, 90], [320, 50]], 'ad-slot3').addService(googletag.pubads());

    if (document.getElementById('ad-slot32'))
      window.slot32 = googletag.defineSlot('/21799830913/Mundial/Leader', [[728, 90], [320, 50]], 'ad-slot32').addService(googletag.pubads());

    if (document.getElementById('ad-slot4'))
      window.slot4 = googletag.defineSlot('/21799830913/Mundial/Leader', [[728, 90], [320, 50]], 'ad-slot4').addService(googletag.pubads());

    if (document.getElementById('ad-slot5'))
      window.slot5 = googletag.defineSlot('/21799830913/Mundial/Box', [[300, 600]], 'ad-slot5').addService(googletag.pubads());

    if (document.getElementById('ad-slot6'))
      window.slot6 = googletag.defineSlot('/21799830913/Mundial/Leader', [[728, 90], [320, 50]], 'ad-slot6').addService(googletag.pubads());

    if (document.getElementById('ad-slot14'))
      window.slot14 = googletag.defineSlot('/21799830913/Mundial/Leader', [[600, 800], [320, 480]], 'ad-slot14').addService(googletag.pubads());

    if (document.getElementById('ad-slot-videonota'))
      window.slotVideoNota = googletag.defineSlot('/21799830913/Mundial/Leader', [[400, 311]], 'ad-slot-videonota').addService(googletag.pubads());

    googletag.pubads().setTargeting('test', 'responsive');
    googletag.enableServices();

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

window.initGPT = initGPT;
window.safeRefreshSlots = safeRefreshSlots;

initGPT();
document.addEventListener('astro:page-load', () => {
  initGPT();
});
