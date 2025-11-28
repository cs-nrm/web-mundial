export const wpSites = [
    'https://beatdigital.com.mx/wp-json/wp/v2/posts?_embed&fields=date,title,slug,acf,excerpt,_links,_embedded&categories=824',
    'https://playnrm.com/wp-json/wp/v2/posts?_embed&fields=date,title,slug,acf,excerpt,_links,_embedded&categories=12352',
    'https://stereociendigital.com.mx/wp-json/wp/v2/posts?_embed&fields=date,title,slug,acf,excerpt,_links,_embedded&categories=3986',
    'https://sabrositadigital.com.mx/wp-json/wp/v2/posts?_embed&fields=date,title,slug,acf,excerpt,_links,_embedded&categories=1650',
    'https://enfoquenoticias.com.mx/wp-json/wp/v2/posts?_embed&fields=date,title,slug,acf,excerpt,_links,_embedded&categories=27867'
];

// Mapping of Category Slugs to internal Site Sections
// This allows us to map "deportes" from any site to the "deportes" section of our app.
export const categoryMapping = {
    'fiesta-futbolera': 'fiesta-futbolera',
    // Add more mappings as needed
};
