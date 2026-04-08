const LOGOS_BASE = 'https://storage.googleapis.com/nrm-web/mundial'

export const wpSitesConfig = [
  {
    url: 'https://beatdigital.com.mx/wp-json/wp/v2/posts?_embed&_fields=date,title,slug,tags,acf,yoast_head_json,excerpt,_links,_embedded&categories=824',
    estacion: 'beat',
    logo: `${LOGOS_BASE}/logo-beat.png`,
  },
  {
    url: 'https://playnrm.com/wp-json/wp/v2/posts?_embed&fields=date,title,slug,tags,acf,yoast_head_json,excerpt,_links,_embedded&categories=12352',
    estacion: 'oye',
    logo: `${LOGOS_BASE}/logo-oye.png`,
  },
  {
    url: 'https://stereociendigital.com.mx/wp-json/wp/v2/posts?_embed&_fields=date,title,slug,tags,acf,yoast_head_json,excerpt,_links,_embedded&categories=3986',
    estacion: 'stereocien',
    logo: `${LOGOS_BASE}/logo-stereo.png`,
  },
  {
    url: 'https://sabrositadigital.com.mx/wp-json/wp/v2/posts?_embed&_fields=date,title,slug,tags,acf,yoast_head_json,excerpt,_links,_embedded&categories=1650',
    estacion: 'sabrosita',
    logo: `${LOGOS_BASE}/logo-sabrosita.png`,
  },
]

export const wpSiteEnfoqueConfig = {
  url: 'http://34.61.203.222/wp-json/wp/v2/posts?_embed&_fields=date,title,slug,tags,acf,yoast_head_json,excerpt,_links,_embedded&categories=27867',
  estacion: 'enfoque',
  logo: `${LOGOS_BASE}/logo-enfoque.png`,
}

// Arrays planos para compatibilidad con código existente
export const wpSites = wpSitesConfig.map(s => s.url)
export const wpSiteEnfoqueNoticias = wpSiteEnfoqueConfig.url

// Mapping of Category Slugs to internal Site Sections
export const categoryMapping = {
  'fiesta-futbolera': 'fiesta-futbolera',
}
