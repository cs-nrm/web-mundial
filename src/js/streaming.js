// streaming.js — preloader, Instagram embeds y lazy de imágenes en navegación SPA.
// El código de publicidad (Google Ad Manager) vive ahora en ads.js.

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
