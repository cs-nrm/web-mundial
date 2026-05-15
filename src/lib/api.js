import { wpSites, wpSiteEnfoqueNoticias, wpSitesConfig, wpSiteEnfoqueConfig, wpSiteGamecastConfig } from '../config/sites.js';

// Mapa rápido de URL → { estacion, logo } para taggear posts al hacer fetch
const siteMetaByUrl = Object.fromEntries(
    [...wpSitesConfig, wpSiteEnfoqueConfig, wpSiteGamecastConfig].map(s => [s.url, { estacion: s.estacion, logo: s.logo }])
)

// Cache en memoria — se reutiliza entre requests mientras el proceso esté vivo
const _cache = new Map()
const CACHE_TTL = 5 * 60 * 1000  // 5 minutos
const FETCH_TIMEOUT = 5000        // 5 segundos por sitio

function getCached(key) {
    const entry = _cache.get(key)
    if (entry && Date.now() < entry.expires) return entry.data
    return null
}

function setCached(key, data) {
    _cache.set(key, { data, expires: Date.now() + CACHE_TTL })
}

async function fetchWithTimeout(url) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
    try {
        const res = await fetch(url, { signal: controller.signal })
        clearTimeout(timer)
        return res
    } catch (err) {
        clearTimeout(timer)
        throw err
    }
}

export async function getArticles(catIdOrSlug, { sites = wpSites } = {}) {
    const targets = Array.isArray(sites) ? sites : [sites];

    const requests = targets.map(async (siteUrl) => {
        const cached = getCached(siteUrl)
        if (cached) return cached

        try {
            const res = await fetchWithTimeout(`${siteUrl}&per_page=20`)
            if (!res.ok) return []
            const data = await res.json()
            const meta = siteMetaByUrl[siteUrl] ?? { estacion: 'desconocido', logo: '' }
            const tagged = data.map(post => ({ ...post, _estacion: meta.estacion, _logo: meta.logo }))
            setCached(siteUrl, tagged)
            return tagged
        } catch {
            return []
        }
    });

    const results = await Promise.all(requests);
    const allPosts = results.flat();
    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    return allPosts;
}

export async function getArticlesEnfoque(catIdOrSlug) {
    try {
        const posts = await getArticles(catIdOrSlug, { sites: [wpSiteEnfoqueNoticias] });
        if (posts.length > 0) return posts;
    } catch (err) {
        console.warn('getArticlesEnfoque: primary fetch failed:', err.message);
    }
    return getArticles(catIdOrSlug);
}
