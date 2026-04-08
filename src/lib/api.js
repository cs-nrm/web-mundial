const API_URL = import.meta.env.PUBLIC_API_URL;

import { wpSites, wpSiteEnfoqueNoticias } from '../config/sites.js';

export async function fetchAPI(query = '') {
    // This function is kept for backward compatibility or single-site calls if needed.
    // Ideally, we should use fetchFromAllSites.
    const API_URL = import.meta.env.PUBLIC_API_URL;
    const res = await fetch(`${API_URL}/${query}`);

    if (res.ok) {
        return res.json();
    } else {
        const error = await res.json();
        throw new Error(
            '❗ Failed to fetch API for ' + query + "\n" +
            'Code: ' + error.code + "\n" +
            'Message: ' + error.message + "\n"
        );
    }
}

export async function getArticles(catIdOrSlug, { sites = wpSites } = {}) {
    // The default behavior is to fetch from all wpSites defined in config/sites.js.
    // You can override this by passing a custom `sites` array, e.g.:
    //   getArticles(undefined, { sites: [wpSiteEnfoqueNoticias] })
    // This allows consuming code to request only a subset of sources (e.g., just enfoquenoticias)
    // while keeping the existing multi-site behavior intact.

    // NOTE: The `catIdOrSlug` argument is currently not used for the multi-site fetch.
    // It exists for backwards compatibility with older calls (e.g., getArticles(143)).
    // To support filtering by category you would need per-site category IDs or a different strategy.

    let allPosts = [];

    const targets = Array.isArray(sites) ? sites : [sites];
    
    console.log('🚀 getArticles - Fetching from', targets.length, 'site(s)');

    const requests = targets.map(async (siteUrl) => {
        try {
            // The configured site URLs already include query params (e.g. categories).
            // Append per_page to control the batch size.
            const url = `${siteUrl}&per_page=20`;

            console.log('📡 Fetching from:', url);
            const res = await fetch(url);
            
            console.log('📊 Response status:', res.status, 'from', siteUrl.substring(0, 40) + '...');
            
            if (!res.ok) {
                console.warn(`❌ Failed to fetch from ${siteUrl}: ${res.status}`);
                return [];
            }
            const data = await res.json();
            console.log('✅ Got', data.length, 'posts from', siteUrl.substring(0, 40) + '...');
            return data;
        } catch (err) {
            console.error(`⚠️ Error fetching from ${siteUrl}:`, err.message);
            return [];
        }
    });

    const results = await Promise.all(requests);

    // Flatten array
    allPosts = results.flat();

    // Sort by date (newest first)
    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log('📦 Total posts after filtering:', allPosts.length);

    return allPosts;
}


/**
 * Fetch paginado de sabrosita para la sección Nota Sabrosa (SSR).
 * Devuelve { posts, totalPages, currentPage }.
 */
export async function gado(currentetSabrositaPaginPage = 1, perPage = 20) {
    const base = 'https://sabrositadigital.com.mx/wp-json/wp/v2/posts'
    const url = `${base}?_embed&fields=date,title,slug,acf,excerpt,_links,_embedded&categories=1650&per_page=${perPage}&page=${currentPage}`

    try {
        const res = await fetch(url)
        if (!res.ok) return { posts: [], totalPages: 1, currentPage }

        const posts = await res.json()
        const total = parseInt(res.headers.get('X-WP-TotalPages') ?? '1', 10)
        return { posts, totalPages: total, currentPage }
    } catch {
        return { posts: [], totalPages: 1, currentPage }
    }
}
async function fetchWithBrowserHeaders(url) {
    // Some sites (Cloudflare) may reject default node fetch user-agents.
    // This helper tries to look like a normal browser to reduce 403 responses.
    const headers = {
        'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        Referer: 'https://enfoquenoticias.com.mx/',
    };

    const res = await fetch(url, { headers });
    if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText} - ${text?.slice(0, 200)}`);
    }

    return res.json();
}

export async function getArticlesEnfoque(catIdOrSlug) {
    // Fetch articles specifically from enfoquenoticias only
    // We try 3 strategies:
    // 1) Use the existing multi-site logic (works when the endpoint is accessible)
    // 2) If blocked (403), attempt a browser-like fetch with headers
    // 3) As a last resort, fall back to the multi-site feed to avoid showing an empty UI

    try {
        const posts = await getArticles(catIdOrSlug, { sites: [wpSiteEnfoqueNoticias] });
        if (posts.length > 0) {
            return posts;
        }
    } catch (err) {
        console.warn('getArticlesEnfoque: primary fetch failed:', err.message);
    }

    return getArticles(catIdOrSlug);
}