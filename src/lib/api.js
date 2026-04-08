import { wpSites, wpSiteEnfoqueNoticias, wpSitesConfig, wpSiteEnfoqueConfig } from '../config/sites.js';

// Mapa rápido de URL → { estacion, logo } para taggear posts al hacer fetch
const siteMetaByUrl = Object.fromEntries(
    [...wpSitesConfig, wpSiteEnfoqueConfig].map(s => [s.url, { estacion: s.estacion, logo: s.logo }])
)

export async function getArticles(catIdOrSlug, { sites = wpSites } = {}) {
    const targets = Array.isArray(sites) ? sites : [sites];

    const requests = targets.map(async (siteUrl) => {
        try {
            const res = await fetch(`${siteUrl}&per_page=20`);
            if (!res.ok) return [];
            const data = await res.json();
            // Taggear cada post con su estación y logo de origen
            const meta = siteMetaByUrl[siteUrl] ?? { estacion: 'desconocido', logo: '' }
            return data.map(post => ({ ...post, _estacion: meta.estacion, _logo: meta.logo }))
        } catch {
            return [];
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
