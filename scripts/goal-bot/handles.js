// Handles de Instagram para selecciones nacionales
// Usados en captions al publicar INICIO de partido
// Formato: nombre normalizado → @handle
// Verificar y agregar handles faltantes según sea necesario

const HANDLES = {
  // CONCACAF
  'mexico': '@miseleccionmxoficial',
  'estados unidos': '@ussoccer',
  'canada': '@canadasoccer',
  'costa rica': '@fedefutbolcr',
  'panama': '@fepafut',
  'honduras': '@fenafuth',
  'el salvador': '@fesfut_oficial',
  'guatemala': '@fegafut',
  'jamaica': '@jff_football',
  'haiti': '@fhfhaiti',

  // CONMEBOL
  'argentina': '@afaseleccion',
  'brasil': '@cbf_futebol',
  'uruguay': '@aufoficial',
  'colombia': '@fcf_col',
  'ecuador': '@lafedecuador',
  'chile': '@larojafedch',
  'paraguay': '@apf_py',
  'peru': '@fpf_peru',
  'venezuela': '@vinotinto',
  'bolivia': '@fbf_oficial',

  // UEFA
  'espana': '@sefutbol',
  'francia': '@equipedefrance',
  'alemania': '@dfb_team',
  'inglaterra': '@england',
  'portugal': '@selecaoportugal',
  'italia': '@azzurri',
  'paises bajos': '@oranje',
  'belgica': '@belgiandevils',
  'suiza': '@nati_sfv_asf',
  'croacia': '@hns_cff',
  'serbia': '@fss_rs',
  'polonia': '@pzpn_pl',
  'turquia': '@a_milli_takim',
  'austria': '@oefb_official',
  'escocia': '@scotlandnt',
  'dinamarca': '@dbu_landshold',
  'suecia': '@svenskfotboll',
  'ucrania': '@uaf_official',
  'georgia': '@georgianfa',
  'albania': '@fshf_al',
  'hungria': '@mlsz_official',
  'eslovaquia': '@szfutbal',
  'eslovenia': '@nzs_si',
  'rumania': '@frf_oficial',

  // CAF
  'marruecos': '@frmofficial',
  'senegal': '@senegalfootball',
  'nigeria': '@supereagles',
  'ghana': '@ghanafaofficial',
  'egipto': '@egyptfanational',
  'costa de marfil': '@fif_ci',
  'tunez': '@ftf_officiel',
  'argelia': '@fff_dz',
  'camerun': '@fetracam',
  'sudafrica': '@bafanabafana',
  'rd congo': '@fecofa_officiel',
  'guinea': '@federationguineefoot',
  'cabo verde': '@fcfcv',

  // AFC
  'japon': '@jfa_samuraiblue',
  'corea del sur': '@kfaofficial',
  'arabia saudita': '@saudifootball',
  'australia': '@socceroos',
  'iran': '@irfootball',
  'qatar': '@qatarfootball',
  'irak': '@iraknationalteam',
  'jordania': '@jfa_football',
  'uzbekistan': '@uzbekistanfootball',
  'indonesia': '@timnasindonesia',
}

function normalize(name) {
  return name?.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim() ?? ''
}

export function getHandle(teamName) {
  return HANDLES[normalize(teamName)] ?? ''
}
