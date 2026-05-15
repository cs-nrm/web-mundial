var streaming;
var local_status;
const buttonPause = '<svg xmlns="https://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-player-pause" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000" fill="#000" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /><path d="M14 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /></svg>';
const buttonPlay = '<svg xmlns="https://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-player-play-filled" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000" fill="#000" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" stroke-width="0" fill="currentColor" /></svg>';
const bigButtonPause = '<svg xmlns="https://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-player-pause" width="35" height="35" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000" fill="#000" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /><path d="M14 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /></svg>';
const bigButtonPlay = '<svg xmlns="https://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-player-play" width="35" height="35" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000" fill="#000" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 4v16l13 -8z" /></svg>';
const buttongLoading = '<img width="40" height="40" src="https://storage.googleapis.com/nrm-web/oye/recursos/loading-normal.gif" style="padding:5px;"/>';
const buttonPodcastPlay = '<svg xmlns="https://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-player-play" width="80" height="80" viewBox="0 0 24 24" stroke-width="2" stroke="#fff" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 4v16l13 -8z" /></svg>';
const buttonPodcastPause = '<svg xmlns="https://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-player-pause" width="80" height="80" viewBox="0 0 24 24" stroke-width="1.5" stroke="#fff" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /><path d="M14 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /></svg>';
var volume;
var artist;
var cancion;
var hora;
const radioButton = document.getElementById('radiobutton');
const player = document.getElementById('player');
const secchome = document.getElementById('home');

function initGPT() {

    googletag.destroySlots();
    googletag.cmd.push(function () {
        var mapping14 = googletag.sizeMapping().addSize([600, 800]).build();
        var mapping141 = googletag.sizeMapping().addSize([320, 480]).build();
        var mapping2 = googletag.sizeMapping().addSize([300, 250]).build();
        var mapping3 = googletag.sizeMapping().addSize([970, 250]).build();
        var mapping31 = googletag.sizeMapping().addSize([320, 50]).build();
        var mapping4 = googletag.sizeMapping().addSize([728, 90]).build();
        var mapping41 = googletag.sizeMapping().addSize([320, 50]).build();
        var mapping42 = googletag.sizeMapping().addSize([728, 90]).build();
        var mapping421 = googletag.sizeMapping().addSize([320, 50]).build();
        var mapping5 = googletag.sizeMapping().addSize([300, 600]).build();
        var mapping6 = googletag.sizeMapping().addSize([970, 90]).build();
        var mapping61 = googletag.sizeMapping().addSize([320, 50]).build();

        window.slot14 = googletag.defineSlot("/23349147378/Mundial", [600, 800], 'ad-slot14').defineSizeMapping(mapping14).addService(googletag.pubads());
        window.slot141 = googletag.defineSlot("/23349147378/Mundial", [320, 480], 'ad-slot141').defineSizeMapping(mapping141).addService(googletag.pubads());
        window.slot2 = googletag.defineSlot("/23349147378/Mundial", [300, 250], 'ad-slot2').defineSizeMapping(mapping2).addService(googletag.pubads());
        window.slot3 = googletag.defineSlot("/23349147378/Mundial", [970, 250], 'ad-slot3').defineSizeMapping(mapping3).addService(googletag.pubads());
        window.slot31 = googletag.defineSlot("/23349147378/Mundial", [320, 50], 'ad-slot31').defineSizeMapping(mapping31).addService(googletag.pubads());
        window.slot4 = googletag.defineSlot("/23349147378/Mundial", [728, 90], 'ad-slot4').defineSizeMapping(mapping4).addService(googletag.pubads());
        window.slot41 = googletag.defineSlot("/23349147378/Mundial", [320, 50], 'ad-slot41').defineSizeMapping(mapping41).addService(googletag.pubads());
        window.slot42 = googletag.defineSlot("/23349147378/Mundial", [728, 90], 'ad-slot42').defineSizeMapping(mapping42).addService(googletag.pubads());
        window.slot421 = googletag.defineSlot("/23349147378/Mundial", [320, 50], 'ad-slot421').defineSizeMapping(mapping421).addService(googletag.pubads());
        window.slot5 = googletag.defineSlot("/23349147378/Mundial", [300, 600], 'ad-slot5').defineSizeMapping(mapping5).addService(googletag.pubads());
        window.slot6 = googletag.defineSlot("/23349147378/Mundial", [970, 90], 'ad-slot6').defineSizeMapping(mapping6).addService(googletag.pubads());
        window.slot61 = googletag.defineSlot("/23349147378/Mundial", [320, 50], 'ad-slot61').defineSizeMapping(mapping61).addService(googletag.pubads());

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

        //googletag.pubads().refresh([slot3]);
        //setInterval(function(){googletag.pubads().refresh([slot3]);}, 180000);
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
        if (window.slot4) googletag.pubads().refresh([window.slot4]);
        if (window.slot41) googletag.pubads().refresh([window.slot41]);
        if (window.slot42) googletag.pubads().refresh([window.slot42]);
        if (window.slot421) googletag.pubads().refresh([window.slot421]);
        if (window.slot5) googletag.pubads().refresh([window.slot5]);
        if (window.slot6) googletag.pubads().refresh([window.slot6]);
        if (window.slot61) googletag.pubads().refresh([window.slot61]);
        // O simplemente: googletag.pubads().refresh();
        console.log('Banners refrescados post navegación');
    } else {
        safeRefreshSlots(); // Intenta de nuevo después de un breve retraso);
    }
}



/* NAVIGATION */
document.addEventListener('astro:before-preparation', ev => {
    //  console.log('insert spin');    
    document.querySelector('main').classList.add('loading');
    document.querySelector('.preloader').classList.add('showpreloader');
    if (typeof progInterval !== 'undefined' && progInterval) {
        clearInterval(progInterval);
        progInterval = null;
    }

});

document.addEventListener("astro:after-swap", () => {

    const hasInstaEmbeds = !!document.querySelector('blockquote.instagram-media, .instagram-media, [data-instgrm-permalink], iframe[src*="instagram.com"]');
    if (hasInstaEmbeds) {
        // Carga perezosa del SDK si aún no existe
        const ensureInstagramSDK = () => new Promise((resolve) => {
            if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === 'function') {
                resolve();
                return;
            }
            let s = document.getElementById('instagram-embed-sdk');
            if (!s) {
                s = document.createElement('script');
                s.id = 'instagram-embed-sdk';
                s.src = 'https://www.instagram.com/embed.js';
                s.async = true;
                s.onload = () => resolve();
                // como fallback, resuelve tras un tiempo prudente
                setTimeout(() => resolve(), 2000);
                document.head.appendChild(s);
            } else {
                // si ya existe la etiqueta pero aún no expone la API, espera un poco
                setTimeout(() => resolve(), 500);
            }
        });

        ensureInstagramSDK().then(() => {
            try {
                if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === 'function') {
                    window.instgrm.Embeds.process();
                }
            } catch (e) {
                console.warn('Instagram Embeds process() falló o no estaba disponible:', e);
            }
        });
    }

});


document.addEventListener('astro:page-load', ev => {

    initGPT();
    safeRefreshSlots();

    window.addEventListener('scroll', function () {
        const scrollY = window.scrollY;

        if ($('.bar-stereo').hasClass('is-pinned')) {
            $('.bar-stereo').addClass('compress');
            $('.bar-stereo .logo').addClass('compress-logo');
        }
        if (scrollY <= 1) {
            $('.bar-stereo').css('position', 'sticky');
            $('.bar-stereo').removeClass('compress');
            $('.bar-stereo .logo').removeClass('compress-logo');
        }
    });

    /* =======COMSCORE*/
    var ts = Math.round((new Date()).getTime() / 1000 * Math.random() * 10);
    // cowensole.log(ts);
    self.COMSCORE && COMSCORE.beacon({
        c1: "2", c2: "6906652",
        options: {
            enableFirstPartyCookie: true,
            bypassUserConsentRequirementFor1PCookie: true
        }
    });

    fetch('/pageview_candidate.txt?' + ts)
        .then(function (resp) {
            console.log(resp);
        });

    /* =======COMSCORE*/
    //googletag.pubads().refresh();


    document.querySelector('main').classList.remove('loading');
    document.querySelector('.preloader').classList.remove('showpreloader');

    const secenvivo = document.getElementById('envivo');







    const imagenNota = document.getElementById("imagen-nota");
    if (imagenNota) {
        const imgNotaOriginal = imagenNota.getElementsByTagName('img');
        const imgNotaOriginal2 = imgNotaOriginal[0].getAttribute('src');
        imagenNota.style.backgroundImage = "url(" + imgNotaOriginal2 + ")";
    }


    $('.wp-block-image').each(function () {
        const datasrc = $(this).find('img').attr('data-src');
        $(this).find('img').attr('src', datasrc);
    });


    const containvideo = document.getElementById('content-w-video');
    if (containvideo) {
        //console.log('sccion pop');  
        //console.log(navigator.userAgent);
        if (navigator.userAgent.indexOf("iPhone") != -1) {

            $('.wp-block-embed-youtube .wp-block-embed__wrapper iframe').each(function (t, el) {
                // console.log($(this));   
                //const ele = $(this).attr('id','el-'+t);     
                $(this).on('click', function () {
                    const getstatus = playerstatus();
                    if (getstatus == 'radio-playing') {
                        radioStop();
                        //hidebarra();
                        $('#player').attr('data-status', 'video-playing');
                    }
                });

            });

        } else {
            $('.wp-block-embed-youtube .wp-block-embed__wrapper').each(function () {
                // console.log($(this).find('iframe'));            
                const plyr = new Plyr($(this).find('iframe').parent(), {
                    debug: true,
                    controls: [
                        'play-large', // The large play button in the center
                        'restart', // Restart playback
                        'rewind', // Rewind by the seek time (default 10 seconds)
                        'play', // Play/pause playback
                        'fast-forward', // Fast forward by the seek time (default 10 seconds)
                        'progress', // The progress bar and scrubber for playback and buffering
                        'current-time', // The current time of playback
                        'duration', // The full duration of the media
                        'mute', // Toggle mute
                        'volume', // Volume control
                        'captions', // Toggle captions
                        'settings', // Settings menu
                        'pip', // Picture-in-picture (currently Safari only)
                        'airplay', // Airplay (currently Safari only)
                        'download', // Show a download button with a link to either the current source or a custom URL you specify in your options
                        'fullscreen',
                    ],
                    playsinline: true

                });
                //console.log(plyr);
                plyr.on('playing', function () {
                    const getstatus = playerstatus();
                    if (getstatus == 'radio-playing') {
                        radioStop();
                        //hidebarra();
                        $('#player').attr('data-status', 'video-playing');
                    }
                });

                $('#radiobutton').on('click', function () {
                    plyr.pause();
                });
            });
        }



    }


});

