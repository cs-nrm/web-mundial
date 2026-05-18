function initGPT() {
    googletag.destroySlots();
    googletag.cmd.push(function () {
        var mapping14  = googletag.sizeMapping().addSize([600, 800]).build();
        var mapping141 = googletag.sizeMapping().addSize([320, 480]).build();
        var mapping2   = googletag.sizeMapping().addSize([300, 250]).build();
        var mapping3   = googletag.sizeMapping().addSize([970, 250]).build();
        var mapping31  = googletag.sizeMapping().addSize([320, 50]).build();
        var mapping4   = googletag.sizeMapping().addSize([728, 90]).build();
        var mapping41  = googletag.sizeMapping().addSize([320, 50]).build();
        var mapping42  = googletag.sizeMapping().addSize([728, 90]).build();
        var mapping421 = googletag.sizeMapping().addSize([320, 50]).build();
        var mapping5   = googletag.sizeMapping().addSize([300, 600]).build();
        var mapping6   = googletag.sizeMapping().addSize([970, 90]).build();
        var mapping61  = googletag.sizeMapping().addSize([320, 50]).build();

        window.slot14  = googletag.defineSlot("/23349147378/Mundial", [600, 800],  'ad-slot14' ).defineSizeMapping(mapping14 ).addService(googletag.pubads());
        window.slot141 = googletag.defineSlot("/23349147378/Mundial", [320, 480],  'ad-slot141').defineSizeMapping(mapping141).addService(googletag.pubads());
        window.slot2   = googletag.defineSlot("/23349147378/Mundial", [300, 250],  'ad-slot2'  ).defineSizeMapping(mapping2  ).addService(googletag.pubads());
        window.slot3   = googletag.defineSlot("/23349147378/Mundial", [970, 250],  'ad-slot3'  ).defineSizeMapping(mapping3  ).addService(googletag.pubads());
        window.slot31  = googletag.defineSlot("/23349147378/Mundial", [320, 50],   'ad-slot31' ).defineSizeMapping(mapping31 ).addService(googletag.pubads());
        window.slot4   = googletag.defineSlot("/23349147378/Mundial", [728, 90],   'ad-slot4'  ).defineSizeMapping(mapping4  ).addService(googletag.pubads());
        window.slot41  = googletag.defineSlot("/23349147378/Mundial", [320, 50],   'ad-slot41' ).defineSizeMapping(mapping41 ).addService(googletag.pubads());
        window.slot42  = googletag.defineSlot("/23349147378/Mundial", [728, 90],   'ad-slot42' ).defineSizeMapping(mapping42 ).addService(googletag.pubads());
        window.slot421 = googletag.defineSlot("/23349147378/Mundial", [320, 50],   'ad-slot421').defineSizeMapping(mapping421).addService(googletag.pubads());
        window.slot5   = googletag.defineSlot("/23349147378/Mundial", [300, 600],  'ad-slot5'  ).defineSizeMapping(mapping5  ).addService(googletag.pubads());
        window.slot6   = googletag.defineSlot("/23349147378/Mundial", [970, 90],   'ad-slot6'  ).defineSizeMapping(mapping6  ).addService(googletag.pubads());
        window.slot61  = googletag.defineSlot("/23349147378/Mundial", [320, 50],   'ad-slot61' ).defineSizeMapping(mapping61 ).addService(googletag.pubads());

        googletag.pubads().setTargeting("test", "responsive");
        googletag.enableServices();
        googletag.display('ad-slot14');
        googletag.display('ad-slot141');
        googletag.display('ad-slot2');
        googletag.display('ad-slot3');
        googletag.display('ad-slot31');
        googletag.display('ad-slot4');
        googletag.display('ad-slot41');
        googletag.display('ad-slot42');
        googletag.display('ad-slot421');
        googletag.display('ad-slot5');
        googletag.display('ad-slot6');
        googletag.display('ad-slot61');
    });
}

function safeRefreshSlots() {
    if (window.googletag && googletag.apiReady && googletag.pubads) {
        if (window.slot14)  googletag.pubads().refresh([window.slot14]);
        if (window.slot141) googletag.pubads().refresh([window.slot141]);
        if (window.slot2)   googletag.pubads().refresh([window.slot2]);
        if (window.slot3)   googletag.pubads().refresh([window.slot3]);
        if (window.slot31)  googletag.pubads().refresh([window.slot31]);
        if (window.slot4)   googletag.pubads().refresh([window.slot4]);
        if (window.slot41)  googletag.pubads().refresh([window.slot41]);
        if (window.slot42)  googletag.pubads().refresh([window.slot42]);
        if (window.slot421) googletag.pubads().refresh([window.slot421]);
        if (window.slot5)   googletag.pubads().refresh([window.slot5]);
        if (window.slot6)   googletag.pubads().refresh([window.slot6]);
        if (window.slot61)  googletag.pubads().refresh([window.slot61]);
    } else {
        safeRefreshSlots();
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
