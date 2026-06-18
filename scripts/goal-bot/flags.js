export const countryToIso = {
  // CONCACAF
  'mexico': 'mx', 'estados unidos': 'us', 'canada': 'ca', 'costa rica': 'cr',
  'panama': 'pa', 'honduras': 'hn', 'guatemala': 'gt', 'el salvador': 'sv',
  'jamaica': 'jm', 'haiti': 'ht',
  // CONMEBOL
  'argentina': 'ar', 'brasil': 'br', 'uruguay': 'uy', 'colombia': 'co',
  'ecuador': 'ec', 'chile': 'cl', 'paraguay': 'py', 'peru': 'pe', 'venezuela': 've', 'bolivia': 'bo',
  // UEFA
  'espana': 'es', 'francia': 'fr', 'alemania': 'de', 'inglaterra': 'gb-eng',
  'portugal': 'pt', 'italia': 'it', 'paises bajos': 'nl', 'belgica': 'be',
  'suiza': 'ch', 'croacia': 'hr', 'serbia': 'rs', 'polonia': 'pl',
  'turquia': 'tr', 'austria': 'at', 'escocia': 'gb-sct', 'dinamarca': 'dk',
  'suecia': 'se', 'noruega': 'no', 'ucrania': 'ua', 'georgia': 'ge', 'albania': 'al',
  'chequia': 'cz', 'republica checa': 'cz', 'rep. checa': 'cz', 'czech republic': 'cz',
  // CAF
  'marruecos': 'ma', 'senegal': 'sn', 'nigeria': 'ng', 'ghana': 'gh',
  'egipto': 'eg', 'costa de marfil': 'ci', 'tunez': 'tn', 'argelia': 'dz',
  'cabo verde': 'cv', 'guinea': 'gn', 'rd congo': 'cd', 'congo': 'cd',
  'camerun': 'cm', 'sudafrica': 'za',
  // AFC
  'japon': 'jp', 'corea del sur': 'kr', 'arabia saudita': 'sa',
  'australia': 'au', 'iran': 'ir', 'qatar': 'qa', 'irak': 'iq',
  'jordania': 'jo', 'nueva zelanda': 'nz', 'uzbekistan': 'uz',
  'indonesia': 'id',
}

export function normalize(name) {
  return name?.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim() ?? ''
}

export function getFlagUrl(name) {
  const iso = countryToIso[normalize(name)]
  return iso ? `https://flagcdn.com/w320/${iso}.png` : null
}

export function getFlagEmoji(name) {
  const iso = countryToIso[normalize(name)]
  if (!iso) return ''
  if (iso === 'gb-eng') return '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
  if (iso === 'gb-sct') return '🏴󠁧󠁢󠁳󠁣󠁴󠁿'
  return [...iso.toUpperCase()].map(c => String.fromCodePoint(c.codePointAt(0) + 127397)).join('')
}
