const API_URL = import.meta.env.PUBLIC_API_URL;

import { wpSites } from '../config/sites.js';

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

export async function getArticles(catIdOrSlug) {
    // Note: catIdOrSlug is currently an ID (e.g., 143) in the existing calls.
    // For multi-site, we prefer Slugs. 
    // If it's a number, we might need to handle it, but for now let's assume we want to fetch 
    // from all sites.

    // Since the current codebase uses IDs (143), and those IDs are specific to the original site,
    // we need a strategy. 
    // Strategy: 
    // 1. If we are just fetching "latest posts" (no category), we hit all sites.
    // 2. If we are fetching by Category ID (143), that ID is only valid for the original site.
    //    We should ideally convert calls to use Slugs.

    // For this iteration, I will implement a robust fetch that tries to get posts from ALL sites.
    // If a category is provided, we need to know the category ID for *each* site, OR filter by slug.
    // Filtering by slug via API usually requires an extra call or a plugin.

    // TEMPORARY HYBRID APPROACH:
    // We will fetch from the defined wpSites.
    // We will assume 'catIdOrSlug' is relevant. 
    // If it's the original site, we use the ID. For others, we might skip filtering or need the ID.

    // To make this truly work for 5 sites, we need to know:
    // "What is the ID of 'Nota Sabrosa' on Site 2?"

    // For now, I will implement the aggregation logic.

    let allPosts = [];

    const requests = wpSites.map(async (siteUrl) => {
        try {
            // The user provided full URLs with query params (e.g. ...&categories=824).
            // We need to append per_page and potentially other params.
            // Since siteUrl already has '?', we use '&' to append.

            // Note: The user's URLs already include 'categories=...'. 
            // If 'catIdOrSlug' is passed to this function, it might conflict or be redundant.
            // For the "Home" or "General Feed", we probably just want to hit these endpoints as configured.
            // If we need to filter further, we'd need more complex logic.

            // Assuming for now we just want to fetch the feed from these specific endpoints:
            const url = `${siteUrl}&per_page=20`;

            const res = await fetch(url);
            if (!res.ok) {
                console.warn(`Failed to fetch from ${siteUrl}: ${res.status}`);
                return [];
            }
            const data = await res.json();
            return data;
        } catch (err) {
            console.error(`Error fetching from ${siteUrl}:`, err);
            return [];
        }
    });

    const results = await Promise.all(requests);

    // Flatten array
    allPosts = results.flat();

    // Sort by date (newest first)
    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    return allPosts;
}

/**
 * Fetch paginado de sabrosita para la sección Nota Sabrosa (SSR).
 * Devuelve { posts, totalPages, currentPage }.
 */
export async function getSabrositaPaginado(currentPage = 1, perPage = 20) {
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

/*export async function conn() {
    const res = await fetch('',{

    });

    if ( res.ok ) {
        return res.json();
    } else {
        const error = await res.json();

        throw new Error(
            '❗ Failed to fetch API for ' + query + "\n" +
            'Code: ' + error.code + "\n" +
            'Message: ' + error.message + "\n"
        );
    }
}*/