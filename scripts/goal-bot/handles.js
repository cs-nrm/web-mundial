// Handles por selección: { ig: Instagram, tw: Twitter/X }
// Agregar o corregir según necesidad
const HANDLES = {
  // CONCACAF
  'mexico':         { ig: '@miseleccionmxoficial', tw: '@miseleccionmx' },
  'estados unidos': { ig: '@ussoccer',              tw: '@ussoccer' },
  'canada':         { ig: '@canadasoccer',           tw: '@canadasoccer' },
  'costa rica':     { ig: '@fedefutbolcr',           tw: '@fedefutbolcr' },
  'panama':         { ig: '@fepafut',                tw: '@fepafut' },
  'honduras':       { ig: '@fenafuth',               tw: '@fenafuth' },
  'el salvador':    { ig: '@fesfut_oficial',         tw: '@fesfut_oficial' },
  'guatemala':      { ig: '@fegafut',                tw: '@fegafut' },
  'jamaica':        { ig: '@jff_football',           tw: '@jff_football' },

  // CONMEBOL
  'argentina':      { ig: '@afaseleccion',           tw: '@afaseleccion' },
  'brasil':         { ig: '@cbf_futebol',            tw: '@cbf_futebol' },
  'uruguay':        { ig: '@aufoficial',             tw: '@aufoficial' },
  'colombia':       { ig: '@fcf_col',                tw: '@fcf_col' },
  'ecuador':        { ig: '@lafedecuador',           tw: '@lafedecuador' },
  'chile':          { ig: '@larojafedch',            tw: '@larojafedch' },
  'paraguay':       { ig: '@apf_py',                 tw: '@apf_py' },
  'peru':           { ig: '@fpf_peru',               tw: '@fpf_peru' },
  'venezuela':      { ig: '@vinotinto',              tw: '@vinotinto' },
  'bolivia':        { ig: '@fbf_oficial',            tw: '@fbf_oficial' },

  // UEFA
  'espana':         { ig: '@sefutbol',               tw: '@sefutbol' },
  'francia':        { ig: '@equipedefrance',         tw: '@equipedefrance' },
  'alemania':       { ig: '@dfb_team',               tw: '@DFB_Team' },
  'inglaterra':     { ig: '@england',                tw: '@england' },
  'portugal':       { ig: '@selecaoportugal',        tw: '@selecaoportugal' },
  'italia':         { ig: '@azzurri',                tw: '@Azzurri' },
  'paises bajos':   { ig: '@oranje',                 tw: '@OnsOranje' },
  'belgica':        { ig: '@belgiandevils',          tw: '@BelRedDevils' },
  'suiza':          { ig: '@nati_sfv_asf',           tw: '@nati_sfv_asf' },
  'croacia':        { ig: '@hns_cff',                tw: '@HNS_CFF' },
  'serbia':         { ig: '@fss_rs',                 tw: '@fss_rs' },
  'polonia':        { ig: '@pzpn_pl',                tw: '@pzpn_pl' },
  'turquia':        { ig: '@a_milli_takim',          tw: '@aMilliTakim' },
  'austria':        { ig: '@oefb_official',          tw: '@oefb' },
  'escocia':        { ig: '@scotlandnt',             tw: '@ScotlandNT' },
  'dinamarca':      { ig: '@dbu_landshold',          tw: '@dbulandshold' },
  'ucrania':        { ig: '@uaf_official',           tw: '@UAF_official' },
  'georgia':        { ig: '@georgianfa',             tw: '@GeorgianFA' },
  'albania':        { ig: '@fshf_al',                tw: '@fshf_al' },

  // CAF
  'marruecos':      { ig: '@frmofficial',            tw: '@FRMofficiel' },
  'senegal':        { ig: '@senegalfootball',        tw: '@Fsfofficielle' },
  'nigeria':        { ig: '@supereagles',            tw: '@NGSuperEagles' },
  'ghana':          { ig: '@ghanafaofficial',        tw: '@ghanafaofficial' },
  'egipto':         { ig: '@egyptfanational',        tw: '@EFA' },
  'costa de marfil':{ ig: '@fif_ci',                tw: '@FIF_CI' },
  'tunez':          { ig: '@ftf_officiel',           tw: '@FTF_officiel' },
  'camerun':        { ig: '@fetracam',               tw: '@fetracam' },
  'sudafrica':      { ig: '@bafanabafana',           tw: '@Bafana_Bafana' },
  'rd congo':       { ig: '@fecofa_officiel',        tw: '@fecofa_officiel' },
  'guinea':         { ig: '@federationguineefoot',   tw: '@feguifootball' },
  'cabo verde':     { ig: '@fcfcv',                  tw: '@fcfcv' },

  'chequia':         { ig: '@ceskarepre', tw: '@ceskarepre' },
  'republica checa': { ig: '@ceskarepre', tw: '@ceskarepre' },
  'rep. checa':      { ig: '@ceskarepre', tw: '@ceskarepre' },

  // AFC
  'japon':          { ig: '@jfa_samuraiblue',        tw: '@jfa_samuraiblue' },
  'corea del sur':  { ig: '@kfaofficial',            tw: '@kfaofficial' },
  'arabia saudita': { ig: '@saudifootball',          tw: '@saudifootball' },
  'australia':      { ig: '@socceroos',              tw: '@Socceroos' },
  'iran':           { ig: '@irfootball',             tw: '@Iran_Shahin' },
  'qatar':          { ig: '@qatarfootball',          tw: '@QFA' },
  'uzbekistan':     { ig: '@uzbekistanfootball',     tw: '@UzbekFF' },
  'indonesia':      { ig: '@timnasindonesia',        tw: '@PSSI' },
}

function normalize(name) {
  return name?.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim() ?? ''
}

export function getHandle(teamName, platform = 'ig') {
  const entry = HANDLES[normalize(teamName)]
  return entry ? entry[platform] ?? entry.ig ?? '' : ''
}
