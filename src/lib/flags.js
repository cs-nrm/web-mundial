const countryToIso = {
  // América
  'mexico': 'mx', 'estados unidos': 'us', 'canada': 'ca', 'costa rica': 'cr',
  'panama': 'pa', 'honduras': 'hn', 'guatemala': 'gt', 'el salvador': 'sv',
  'jamaica': 'jm', 'haiti': 'ht', 'cuba': 'cu', 'trinidad y tobago': 'tt',
  'republica dominicana': 'do',
  'argentina': 'ar', 'brasil': 'br', 'uruguay': 'uy', 'colombia': 'co',
  'ecuador': 'ec', 'chile': 'cl', 'paraguay': 'py', 'bolivia': 'bo',
  'peru': 'pe', 'venezuela': 've',
  // Europa
  'espana': 'es', 'francia': 'fr', 'alemania': 'de', 'inglaterra': 'gb-eng',
  'portugal': 'pt', 'italia': 'it', 'paises bajos': 'nl', 'holanda': 'nl',
  'belgica': 'be', 'suiza': 'ch', 'croacia': 'hr', 'serbia': 'rs',
  'polonia': 'pl', 'turquia': 'tr', 'austria': 'at', 'republica checa': 'cz',
  'eslovaquia': 'sk', 'hungria': 'hu', 'rumania': 'ro', 'escocia': 'gb-sct',
  'gales': 'gb-wls', 'irlanda del norte': 'gb-nir', 'irlanda': 'ie',
  'dinamarca': 'dk', 'suecia': 'se', 'noruega': 'no', 'finlandia': 'fi',
  'grecia': 'gr', 'ucrania': 'ua', 'georgia': 'ge', 'albania': 'al',
  'eslovenia': 'si', 'bosnia y herzegovina': 'ba', 'montenegro': 'me',
  'kosovo': 'xk', 'islandia': 'is', 'luxemburgo': 'lu', 'macedonia': 'mk',
  'bielorrusia': 'by', 'rusia': 'ru',
  // África
  'marruecos': 'ma', 'senegal': 'sn', 'nigeria': 'ng', 'ghana': 'gh',
  'egipto': 'eg', 'costa de marfil': 'ci', 'camerun': 'cm', 'sudafrica': 'za',
  'mali': 'ml', 'guinea': 'gn', 'tunez': 'tn', 'argelia': 'dz',
  'mozambique': 'mz', 'tanzania': 'tz', 'zambia': 'zm', 'benin': 'bj',
  'burkina faso': 'bf', 'cabo verde': 'cv', 'ruanda': 'rw', 'uganda': 'ug',
  'angola': 'ao', 'zimbabue': 'zw', 'etiopia': 'et', 'kenia': 'ke',
  'libia': 'ly', 'congo': 'cd', 'gambia': 'gm', 'guinea bissau': 'gw',
  // Asia y Oceanía
  'japon': 'jp', 'corea del sur': 'kr', 'rep. de corea': 'kr', 'arabia saudita': 'sa',
  'australia': 'au', 'iran': 'ir', 'qatar': 'qa', 'catar': 'qa', 'irak': 'iq',
  'jordania': 'jo', 'palestina': 'ps', 'china': 'cn', 'india': 'in',
  'indonesia': 'id', 'vietnam': 'vn', 'tailandia': 'th', 'filipinas': 'ph',
  'malasia': 'my', 'nueva zelanda': 'nz', 'uzbekistan': 'uz',
  'tayikistan': 'tj', 'kirguistan': 'kg', 'oman': 'om', 'bahrain': 'bh',
  'kuwait': 'kw', 'emiratos arabes': 'ae',
  // Nombres abreviados/alternativos que usa DataFactory
  'bosnia-herz.': 'ba', 'bosnia herz.': 'ba',
  'curazao': 'cw',
  'ee.uu.': 'us', 'ee. uu.': 'us', 'estados unidos': 'us',
  'rd congo': 'cd', 'r.d. congo': 'cd', 'republica democratica del congo': 'cd',
  'trinidad y tobago': 'tt', 'guinea ecuatorial': 'gq',
  'nueva caledonia': 'nc', 'papua nueva guinea': 'pg',
}

function normalize(name) {
  return name
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

export function getFlagUrl(countryName, width = 40) {
  const iso = countryToIso[normalize(countryName)]
  if (!iso) return null
  return `https://flagcdn.com/w${width}/${iso}.png`
}
