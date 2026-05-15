const LOGOS_BASE = 'https://storage.googleapis.com/nrm-web'

export const wpSitesConfig = [
  {
    url: 'https://beatdigital.com.mx/wp-json/wp/v2/posts?_embed&_fields=date,title,slug,tags,acf,yoast_head_json,excerpt,_links,_embedded&categories=824',
    estacion: 'beat',
    logo: `${LOGOS_BASE}/mundial/LOGO_BEAT.svg`,
  },
  {
    url: 'https://stereociendigital.com.mx/wp-json/wp/v2/posts?_embed&_fields=date,title,slug,tags,acf,yoast_head_json,excerpt,_links,_embedded&categories=3986',
    estacion: 'stereocien',
    logo: `${LOGOS_BASE}/oye/recursos/logo-stereocien-2025%20.svg`,
  },
  {
    url: 'https://sabrositadigital.com.mx/wp-json/wp/v2/posts?_embed&_fields=date,title,slug,tags,acf,yoast_head_json,excerpt,_links,_embedded&categories=1650',
    estacion: 'sabrosita',
    logo: `${LOGOS_BASE}/sabrosita/LOGO_SABROSITA_NEW.png`,
  },
  {
    url: 'https://playnrm.com/wp-json/wp/v2/posts?_embed&fields=date,title,slug,tags,acf,yoast_head_json,excerpt,_links,_embedded&categories=12352',
    estacion: 'oye',
    logo: `${LOGOS_BASE}/oye/recursos/main-logo-header.svg`,
  },
]

export const wpSiteEnfoqueConfig = {
  url: 'http://34.61.203.222/wp-json/wp/v2/posts?_embed&_fields=date,title,slug,tags,acf,yoast_head_json,excerpt,_links,_embedded&categories=27867',
  estacion: 'enfoque',
  logo: `${LOGOS_BASE}/mundial/logo-enfoque2.png`,
}

export const wpSiteGamecastConfig = {
  url: 'http://34.61.203.222/wp-json/wp/v2/posts?_embed&_fields=date,title,slug,tags,acf,yoast_head_json,excerpt,_links,_embedded&categories=27867&tags=29732',
  estacion: 'enfoque',
  logo: `${LOGOS_BASE}/mundial/logo-enfoque2.png`,
}

export const wpSiteOyeConfig = [
  {
  url: 'https://playnrm.com/wp-json/wp/v2/posts?_embed&fields=date,title,slug,tags,acf,yoast_head_json,excerpt,_links,_embedded&categories=12352',
  estacion: 'oye',
  logo: `${LOGOS_BASE}/oye/recursos/main-logo-header.svg`,
  },
  {
    url: 'https://stereociendigital.com.mx/wp-json/wp/v2/posts?_embed&_fields=date,title,slug,tags,acf,yoast_head_json,excerpt,_links,_embedded&categories=3986',
    estacion: 'stereocien',
    logo: `${LOGOS_BASE}/oye/recursos/logo-stereocien-2025%20.svg`,
  },
]

// Arrays planos para compatibilidad con código existente
export const wpSites = wpSitesConfig.map(s => s.url)
export const wpSiteEnfoqueNoticias = wpSiteEnfoqueConfig.url
export const wpSiteOyeNoticias = wpSiteOyeConfig.url

// Mapping of Category Slugs to internal Site Sections
export const categoryMapping = {
  'fiesta-futbolera': 'fiesta-futbolera',
}
