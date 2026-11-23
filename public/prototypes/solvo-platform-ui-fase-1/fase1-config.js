/* ============================================================================
   FASE 1 — CATÁLOGOS DE CONFIGURACIÓN (FSPL-1 · Habilitación Solvo Platform
   Prospect Engine Modular Fase-1)

   Datos de las tres subpáginas nuevas de Settings: Positions & terms, Geography y
   Decision-maker roles. Se carga en settings.html después de rbac.js y toma de él
   US_STATES y POSITIONS_CATALOG (Release 3). El resto de las páginas no lo carga:
   siguen leyendo los catálogos de Release 3 tal cual.

   Modelo (el mismo de solvo-platform-ui-release-4, rbac.js §20, recortado a Fase 1):
    · País ........ F1_COUNTRIES  — código ISO, nombre, nombre de la división, uso
                                    (venta o contratación), idioma, moneda, zona horaria.
    · División .... F1_DIVISIONS  — código ISO 3166-2 (US-FL, ES-M), país, nombre, activa.
    · Ciudad ...... F1_CITIES     — id, nombre, división, país, activa.
    · Posición .... F1_POSITIONS  — id y nombre de POSITIONS_CATALOG, activa, áreas.
    · Término ..... F1_TERMS      — una posición y un país; no se repite dentro del país.
    · Rol ......... F1_DECISION_ROLES — nivel, áreas (o dirección general), títulos de
                                    búsqueda, si recibe correo y si se le busca teléfono.

   Nombres con prefijo F1_ / f1: rbac.js de Release 3 ya declara RECORD_COUNTRIES,
   countryName y POSITIONS_CATALOG, y un `const` repetido entre scripts corta la carga.

   Persistencia en localStorage: `f1Positions`, `f1Terms`, `f1Geo`, `f1Roles`. Al cambiar
   F1_SEED_VERSION se descartan y se vuelve al seed (mecanismo exclusivo del prototipo).
   ============================================================================ */

/* ---- Estado editable ------------------------------------------------------- */
// Versión del seed: al cambiarla, lo guardado en el navegador se descarta para que
// nadie quede viendo un catálogo viejo.
const F1_SEED_VERSION = '1';
const F1_KEYS = ['f1Positions', 'f1Terms', 'f1Geo', 'f1Roles'];
(function f1ResetStaleConfig() {
  try {
    if (localStorage.getItem('f1SeedVersion') !== F1_SEED_VERSION) {
      F1_KEYS.forEach(function (k) { localStorage.removeItem(k); });
      localStorage.setItem('f1SeedVersion', F1_SEED_VERSION);
    }
  } catch (e) { /* sin almacenamiento: queda el seed */ }
})();
function f1Load(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* sin almacenamiento o dato corrupto: queda el seed */ }
  return JSON.parse(JSON.stringify(seed));
}
function f1Save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* sin almacenamiento */ }
}

/* ---- Geografía: país, división y ciudad ------------------------------------ */
// Zonas horarias que ofrece el selector del país (IANA).
const F1_TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Mexico_City', 'America/Guatemala', 'America/Bogota', 'America/Lima',
  'America/Argentina/Buenos_Aires', 'America/Sao_Paulo', 'America/Santiago',
  'Europe/Madrid', 'Europe/Lisbon', 'Europe/London', 'Africa/Nairobi', 'Africa/Lagos',
  'Asia/Manila', 'Asia/Kolkata'
];

const F1_COUNTRIES_SEED = [
  { code: 'US', name: 'United States', divisionLabel: 'State', language: 'English', currency: 'USD', timezone: 'America/New_York', group: 'sales' },
  { code: 'ES', name: 'Spain', divisionLabel: 'Province', language: 'Spanish', currency: 'EUR', timezone: 'Europe/Madrid', group: 'sales' }
];

// Estados de EE. UU.: los 51 de US_STATES (rbac.js). Provincias de España: las de las
// 20 ciudades de HUPES-1.1 que sembraba la grilla de Release 3.
const F1_ES_PROVINCES = [
  ['ES-M', 'Madrid'], ['ES-B', 'Barcelona'], ['ES-V', 'Valencia'], ['ES-SE', 'Sevilla'],
  ['ES-MA', 'Málaga'], ['ES-A', 'Alicante'], ['ES-PM', 'Illes Balears'], ['ES-Z', 'Zaragoza'],
  ['ES-MU', 'Murcia'], ['ES-BI', 'Bizkaia'], ['ES-GC', 'Las Palmas'], ['ES-CO', 'Córdoba'],
  ['ES-TF', 'Santa Cruz de Tenerife'], ['ES-GR', 'Granada'], ['ES-C', 'A Coruña'], ['ES-VA', 'Valladolid']
];

// Ciudades de EE. UU.: la grilla de Release 3 (seed-us-cities.csv de FPEA-0), una por
// estado, todas activas. Se suman, inactivas, las ciudades de los registros de Release 3
// que la grilla no tenía (Dallas, Austin, Tampa, San Francisco). Queens y Brooklyn no
// entran: son distritos de New York, que ya está.
const F1_US_GRID = [
  ['anchorage', 'Anchorage', 'AK'], ['birmingham', 'Birmingham', 'AL'], ['little-rock', 'Little Rock', 'AR'],
  ['phoenix', 'Phoenix', 'AZ'], ['los-angeles', 'Los Angeles', 'CA'], ['denver', 'Denver', 'CO'],
  ['bridgeport', 'Bridgeport', 'CT'], ['wilmington', 'Wilmington', 'DE'], ['miami', 'Miami', 'FL'],
  ['atlanta', 'Atlanta', 'GA'], ['honolulu', 'Honolulu', 'HI'], ['des-moines', 'Des Moines', 'IA'],
  ['boise', 'Boise', 'ID'], ['chicago', 'Chicago', 'IL'], ['indianapolis', 'Indianapolis', 'IN'],
  ['wichita', 'Wichita', 'KS'], ['louisville', 'Louisville', 'KY'], ['new-orleans', 'New Orleans', 'LA'],
  ['boston', 'Boston', 'MA'], ['baltimore', 'Baltimore', 'MD'], ['portland', 'Portland', 'ME'],
  ['detroit', 'Detroit', 'MI'], ['minneapolis', 'Minneapolis', 'MN'], ['kansas-city', 'Kansas City', 'MO'],
  ['jackson', 'Jackson', 'MS'], ['billings', 'Billings', 'MT'], ['charlotte', 'Charlotte', 'NC'],
  ['fargo', 'Fargo', 'ND'], ['omaha', 'Omaha', 'NE'], ['manchester', 'Manchester', 'NH'],
  ['newark', 'Newark', 'NJ'], ['albuquerque', 'Albuquerque', 'NM'], ['las-vegas', 'Las Vegas', 'NV'],
  ['new-york', 'New York', 'NY'], ['columbus', 'Columbus', 'OH'], ['oklahoma-city', 'Oklahoma City', 'OK'],
  ['portland', 'Portland', 'OR'], ['philadelphia', 'Philadelphia', 'PA'], ['providence', 'Providence', 'RI'],
  ['charleston', 'Charleston', 'SC'], ['sioux-falls', 'Sioux Falls', 'SD'], ['nashville', 'Nashville', 'TN'],
  ['houston', 'Houston', 'TX'], ['salt-lake-city', 'Salt Lake City', 'UT'], ['virginia-beach', 'Virginia Beach', 'VA'],
  ['burlington', 'Burlington', 'VT'], ['seattle', 'Seattle', 'WA'], ['milwaukee', 'Milwaukee', 'WI'],
  ['charleston', 'Charleston', 'WV'], ['cheyenne', 'Cheyenne', 'WY']
];
const F1_US_RECORD_CITIES = [
  ['dallas', 'Dallas', 'TX'], ['austin', 'Austin', 'TX'], ['tampa', 'Tampa', 'FL'], ['san-francisco', 'San Francisco', 'CA']
];
const F1_ES_CITIES = [
  ['madrid', 'Madrid', 'ES-M'], ['barcelona', 'Barcelona', 'ES-B'], ['valencia', 'Valencia', 'ES-V'],
  ['sevilla', 'Sevilla', 'ES-SE'], ['malaga', 'Málaga', 'ES-MA'], ['marbella', 'Marbella', 'ES-MA'],
  ['alicante', 'Alicante', 'ES-A'], ['palma-de-mallorca', 'Palma de Mallorca', 'ES-PM'], ['zaragoza', 'Zaragoza', 'ES-Z'],
  ['murcia', 'Murcia', 'ES-MU'], ['bilbao', 'Bilbao', 'ES-BI'], ['las-palmas-de-gran-canaria', 'Las Palmas de Gran Canaria', 'ES-GC'],
  ['cordoba', 'Córdoba', 'ES-CO'], ['santa-cruz-de-tenerife', 'Santa Cruz de Tenerife', 'ES-TF'], ['elche', 'Elche', 'ES-A'],
  ['granada', 'Granada', 'ES-GR'], ['a-coruna', 'A Coruña', 'ES-C'], ['valladolid', 'Valladolid', 'ES-VA'],
  ['terrassa', 'Terrassa', 'ES-B'], ['badalona', 'Badalona', 'ES-B']
];

const F1_GEO_SEED = (function buildGeo() {
  const divisions = US_STATES.map(function (s) { return { code: 'US-' + s.code, country: 'US', name: s.name }; })
    .concat(F1_ES_PROVINCES.map(function (p) { return { code: p[0], country: 'ES', name: p[1] }; }));
  function us(active) {
    return function (r) { return { id: 'city-' + r[0] + '-' + r[2].toLowerCase(), name: r[1], division: 'US-' + r[2], country: 'US', isActive: active }; };
  }
  const cities = F1_US_GRID.map(us(true))
    .concat(F1_US_RECORD_CITIES.map(us(false)))
    .concat(F1_ES_CITIES.map(function (r) { return { id: 'city-es-' + r[0], name: r[1], division: r[2], country: 'ES', isActive: true }; }));
  // Una división arranca activa cuando tiene al menos una ciudad activa.
  divisions.forEach(function (d) { d.isActive = cities.some(function (c) { return c.division === d.code && c.isActive; }); });
  return { countries: F1_COUNTRIES_SEED, divisions: divisions, cities: cities };
})();
const F1_GEO = f1Load('f1Geo', F1_GEO_SEED);
const F1_COUNTRIES = F1_GEO.countries;
const F1_DIVISIONS = F1_GEO.divisions;
const F1_CITIES = F1_GEO.cities;

/* ---- Posiciones y términos por país ----------------------------------------- */
// Las posiciones son las 21 de POSITIONS_CATALOG (Release 3), con sus áreas (HUSPL-13.1).
const F1_AREA_LABELS = {
  finance: 'Finance', sales: 'Sales', marketing: 'Marketing', operations: 'Operations',
  human_resources: 'Human resources', technology: 'Technology', legal: 'Legal'
};
const F1_POSITION_AREAS_SEED = {
  'pos-01': ['finance', 'operations'], 'pos-02': ['operations'], 'pos-03': ['operations'],
  'pos-04': ['operations', 'sales', 'finance'], 'pos-05': ['technology', 'finance', 'operations'],
  'pos-06': ['operations', 'finance'], 'pos-07': ['operations', 'sales'], 'pos-08': ['operations', 'technology'],
  'pos-09': ['human_resources', 'operations', 'finance'], 'pos-10': ['operations'], 'pos-11': ['technology', 'operations'],
  'pos-12': ['sales'], 'pos-13': ['operations', 'sales'], 'pos-14': ['legal', 'operations'],
  'pos-15': ['operations', 'sales', 'finance'], 'pos-16': ['marketing', 'sales'], 'pos-17': ['finance', 'operations'],
  'pos-18': ['operations', 'finance'], 'pos-19': ['operations', 'technology'], 'pos-20': ['operations', 'sales'],
  'pos-21': ['technology']
};
const F1_POSITIONS = f1Load('f1Positions', POSITIONS_CATALOG.map(function (p) {
  return { id: p.id, name: p.name, isActive: p.isActive !== false, areas: (F1_POSITION_AREAS_SEED[p.id] || []).slice() };
}));

// Términos de España: los `search_terms_es` de Release 3 (seed de HUPES-1.1), por posición.
// Los de Estados Unidos son los `search_terms` de POSITIONS_CATALOG.
const F1_TERMS_ES_SEED = {
  'pos-01': ['administrativo contable', 'técnico de cuentas a pagar', 'técnico de cuentas a cobrar', 'contable', 'técnico contable'],
  'pos-02': ['asistente de dirección'],
  'pos-03': ['técnico de presupuestos'],
  'pos-04': ['atención al cliente bilingüe', 'gestor de cobros', 'atención al cliente', 'administrativo de admisión'],
  'pos-05': ['analista de datos'],
  'pos-06': ['grabador de datos'],
  'pos-07': ['atención al cliente ecommerce', 'administrativo de pedidos'],
  'pos-08': ['delineante'],
  'pos-09': ['técnico de recursos humanos', 'técnico de nóminas', 'técnico de selección', 'coordinador de selección'],
  'pos-10': ['coordinador de citas', 'coordinador de personal'],
  'pos-11': ['técnico helpdesk', 'técnico de soporte informático'],
  'pos-12': ['concertador de citas', 'comercial de desarrollo de negocio', 'comercial telefónico', 'teleprospector'],
  'pos-13': ['tramitador de siniestros', 'gestor de cuentas de seguros', 'atención al cliente seguros', 'tramitador de pólizas'],
  'pos-14': ['asistente legal', 'atención al cliente legal', 'administrativo de historias clínicas', 'paralegal'],
  'pos-15': ['comercial de transporte', 'técnico de tráfico', 'administrativo de facturación de transporte', 'coordinador de logística'],
  'pos-16': ['redactor de contenidos', 'coordinador de marketing', 'community manager'],
  'pos-17': ['facturación médica', 'codificador clínico', 'tramitador de autorizaciones médicas', 'técnico de ciclo de ingresos'],
  'pos-18': ['tramitador de préstamos', 'tramitador de hipotecas'],
  'pos-19': ['coordinador de proyectos'],
  'pos-20': ['coordinador de alquileres', 'administrativo de fincas'],
  'pos-21': ['desarrollador .net', 'ingeniero qa']
};
const F1_TERMS_SEED = (function buildTerms() {
  const out = [];
  let n = 0;
  function add(positionId, country, text) {
    n += 1;
    out.push({ id: 'term-' + String(n).padStart(3, '0'), positionId: positionId, country: country, text: text });
  }
  POSITIONS_CATALOG.forEach(function (p) { p.terms.forEach(function (t) { add(p.id, 'US', t); }); });
  POSITIONS_CATALOG.forEach(function (p) { (F1_TERMS_ES_SEED[p.id] || []).forEach(function (t) { add(p.id, 'ES', t); }); });
  return out;
})();
const F1_TERMS = f1Load('f1Terms', F1_TERMS_SEED);

/* ---- Roles de decisor (public.decision_role_catalog, extendido) ------------- */
// El nivel sale del rol, no del tamaño de la empresa. Los de dirección general aplican
// a todas las áreas. Los niveles de owner_founder, coo, vp_operations y
// director_operations son de ejemplo: están pendientes de fijar.
const F1_DECISION_ROLES_SEED = [
  { code: 'ceo', label: 'CEO', level: 1, general: true, areas: [], titles: ['ceo', 'chief executive officer'], sendsEmail: true, findsPhone: true },
  { code: 'president', label: 'President', level: 1, general: true, areas: [], titles: ['president'], sendsEmail: true, findsPhone: true },
  { code: 'chairman', label: 'Chairman', level: 1, general: true, areas: [], titles: ['chairman', 'chairwoman', 'board chair'], sendsEmail: false, findsPhone: false },
  { code: 'owner_founder', label: 'Owner / Founder', level: 1, general: true, areas: [], titles: ['owner', 'founder', 'co-founder'], sendsEmail: true, findsPhone: true },
  { code: 'managing_director', label: 'Managing Director', level: 2, general: true, areas: [], titles: ['managing director', 'managing partner'], sendsEmail: true, findsPhone: false },
  { code: 'executive_director', label: 'Executive Director', level: 2, general: true, areas: [], titles: ['executive director'], sendsEmail: true, findsPhone: false },
  { code: 'cfo', label: 'CFO', level: 1, general: false, areas: ['finance'], titles: ['cfo', 'chief financial officer'], sendsEmail: true, findsPhone: true },
  { code: 'cro', label: 'CRO', level: 1, general: false, areas: ['sales', 'marketing'], titles: ['cro', 'chief revenue officer'], sendsEmail: true, findsPhone: false },
  { code: 'vp_sales', label: 'VP Sales', level: 1, general: false, areas: ['sales'], titles: ['vp sales', 'vice president of sales'], sendsEmail: true, findsPhone: false },
  { code: 'coo', label: 'COO', level: 1, general: false, areas: ['operations'], titles: ['coo', 'chief operating officer'], sendsEmail: true, findsPhone: true },
  { code: 'vp_operations', label: 'VP Operations', level: 2, general: false, areas: ['operations'], titles: ['vp operations', 'vice president of operations'], sendsEmail: true, findsPhone: false },
  { code: 'director_operations', label: 'Director of Operations', level: 2, general: false, areas: ['operations'], titles: ['director of operations', 'operations director'], sendsEmail: true, findsPhone: false },
  { code: 'cto', label: 'CTO', level: 1, general: false, areas: ['technology'], titles: ['cto', 'chief technology officer'], sendsEmail: true, findsPhone: false }
];
const F1_DECISION_ROLES = f1Load('f1Roles', F1_DECISION_ROLES_SEED);

/* ---- Helpers ---------------------------------------------------------------- */
function f1Country(code) { return F1_COUNTRIES.find(function (c) { return c.code === code; }) || null; }
function f1CountryName(code) { const c = f1Country(code); return c ? c.name : (code || ''); }
function f1DivisionName(code) { const d = F1_DIVISIONS.find(function (x) { return x.code === code; }); return d ? d.name : (code || ''); }
function f1DecisionRole(code) { return F1_DECISION_ROLES.find(function (r) { return r.code === code; }) || null; }
function f1SaveGeo() { f1Save('f1Geo', { countries: F1_COUNTRIES, divisions: F1_DIVISIONS, cities: F1_CITIES }); }
