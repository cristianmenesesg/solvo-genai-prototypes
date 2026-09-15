/* ============================================================================
   Solvo Platform — prototipo Release 3 · rbac.js
   Capa compartida de todas las páginas: sesión y roles, datos mock con la forma
   de la base compartida, catálogos del motor de prospección, popups y helpers
   de exportación. El README.md del bundle tiene el mapa completo y los
   contratos existentes; la revisión funcional vive en el vault
   (analysis/solvo-platform/revision-prototipo-release-3.md).

   ÍNDICE — buscar por el título de cada sección
    1. ROLE DEFINITIONS · MOCK TEAM DATA ..... roles y staff (public.solvo_staff)
    2. CATÁLOGO ESTÁNDAR DE INDUSTRIAS ....... public.industry_catalog (HUSPL-0.1)
    3. TRAMOS DE TAMAÑO DE EMPRESA ........... company.size_employees (FSPL-7)
    4. ENTIDADES MOCK Y SU COLUMNA ........... typedefs: Company, Vacancy, Contact…
    5. MOCK COMPANIES / CONTACTS / VACANCIES . datos base + seeds autoejecutados
    6. ON-DEMAND OPENINGS (ODO) .............. last_scraped_at, ventana, cool-down
    7. FECHAS · MEMORIA DE EXPORTACIÓN ....... created_at, last_exported_* (HUSPL-0.2)
    8. ROLE-BASED ACCESS FUNCTIONS ........... canViewAll / canAssign / canDelete / canExport
    9. SESSION · HEADER · SIDEBAR · TOAST .... shell de la app
   10. POPUPS ............................... asignación, confirmación, exportación, scraping
   11. CSV EXPORT · EMPAQUETADO · COLUMNAS ... contrato de archivos (FSPL-2)
   12. DATE RANGE / MULTI-SELECT / SEARCHBOX . filtros de Release 2, sin uso en Release 3
   13. RELEASE 3 — Open Positions ........... US_STATES, POSITIONS_CATALOG, LEAD_SIGNALS,
                                              icpTier, ROLE_CODES, nivel de decisión,
                                              EMAIL_VERIFICATION, seeds de calificación,
                                              análisis de contactos y vacantes del barrido
   14. RELEASE 3 — Prospects ................ PIPELINE_STAGES, posiciones por empresa,
                                              nombres, antigüedades, señal de interés
   15. SELECTOR DE LA BARRA DE BÚSQUEDA ..... renderShellPicker / renderShellSearchbox
   16. HISTORIAL DE ESTADOS ................. public.states_history + actividad
   17. TRAZA DE EJECUCIÓN ................... public.execution_logs (sembrada, no mostrada)
   18. ENRIQUECIMIENTO DE LA EMPRESA ........ company_research, repeatedPosting, sizeFit
   19. SERIE DIARIA · FUNNEL DE AGENDAMIENTO  datos sintéticos del tablero

   Convenciones
   · Los objetos mock usan camelCase; la columna real va en snake_case en el
     typedef de cada entidad (sección 4). "derivado" = se calcula, no se guarda.
   · Los comentarios explican por qué el dato tiene esa forma; la revisión del vault
     (analysis/solvo-platform/revision-prototipo-release-3.md) tiene el registro de las
     decisiones y su impacto en el backlog.
   · Nada llama a un servidor: el estado vive en memoria y en localStorage
     (`user`, `odoConfig`, `theme`, `lang`, `sidebarCollapsed`; Settings agrega
     `positionsCatalog`, `citiesGrid`, `citiesCap`).
   ============================================================================ */

// === ROLE DEFINITIONS ===
const ROLES = {
  comercial: {
    name: 'Sales Rep',
    description: 'Sales executive. Sees and manages only the entities where they are the assigned Sales Rep.',
    priority: 2
  },
  sdr: {
    name: 'SDR',
    description: 'Ejecutivo de desarrollo de negocio. Ve y gestiona exclusivamente las entidades donde es el SDR asignado.',
    priority: 1
  },
  coordinador: {
    name: 'Coordinator',
    description: 'Operations coordinator. Sees all records, assigns Sales Reps and SDRs.',
    priority: 3
  },
  supervisor: {
    name: 'Supervisor',
    description: 'Operations supervisor. Same permissions as Coordinator.',
    priority: 4
  },
  administrador: {
    name: 'Administrator',
    description: 'Full access to administration, users and configuration.',
    priority: 5
  }
};

// === MOCK TEAM DATA ===
const TEAM_MEMBERS = [
  // Sales Reps
  { id: 'uuid-staff-001', name: 'Carlos Mendoza', shortName: 'Carlos M.', email: 'carlos.mendoza@solvo.global', roleKey: 'comercial', title: 'Senior Account Executive', isActive: true, companiesAsComercial: 47, companiesAsSDR: 0, vacanciesAsComercial: 1234, vacanciesAsSDR: 0 },
  { id: 'uuid-staff-002', name: 'María García', shortName: 'María G.', email: 'maria.garcia@solvo.global', roleKey: 'comercial', title: 'Account Executive', isActive: true, companiesAsComercial: 38, companiesAsSDR: 0, vacanciesAsComercial: 987, vacanciesAsSDR: 0 },
  { id: 'uuid-staff-003', name: 'Juan Pérez', shortName: 'Juan P.', email: 'juan.perez@solvo.global', roleKey: 'comercial', title: 'Account Executive', isActive: true, companiesAsComercial: 42, companiesAsSDR: 0, vacanciesAsComercial: 1102, vacanciesAsSDR: 0 },
  { id: 'uuid-staff-010', name: 'Laura Torres', shortName: 'Laura T.', email: 'laura.torres@solvo.global', roleKey: 'comercial', title: 'Junior Account Executive', isActive: true, companiesAsComercial: 15, companiesAsSDR: 0, vacanciesAsComercial: 412, vacanciesAsSDR: 0 },
  // SDRs
  { id: 'uuid-staff-006', name: 'Daniela López', shortName: 'Daniela L.', email: 'daniela.lopez@solvo.global', roleKey: 'sdr', title: 'Senior SDR', isActive: true, companiesAsComercial: 0, companiesAsSDR: 52, vacanciesAsComercial: 0, vacanciesAsSDR: 1430 },
  { id: 'uuid-staff-007', name: 'Andrés Ríos', shortName: 'Andrés R.', email: 'andres.rios@solvo.global', roleKey: 'sdr', title: 'SDR', isActive: true, companiesAsComercial: 0, companiesAsSDR: 35, vacanciesAsComercial: 0, vacanciesAsSDR: 876 },
  { id: 'uuid-staff-011', name: 'Valentina Cruz', shortName: 'Valentina C.', email: 'valentina.cruz@solvo.global', roleKey: 'sdr', title: 'SDR', isActive: true, companiesAsComercial: 0, companiesAsSDR: 28, vacanciesAsComercial: 0, vacanciesAsSDR: 720 },
  // Coordinators
  { id: 'uuid-staff-004', name: 'Ana Rodríguez', shortName: 'Ana R.', email: 'ana.rodriguez@solvo.global', roleKey: 'coordinador', title: 'Operations Coordinator', isActive: true, companiesAsComercial: 0, companiesAsSDR: 0, vacanciesAsComercial: 0, vacanciesAsSDR: 0 },
  { id: 'uuid-staff-008', name: 'Roberto Vargas', shortName: 'Roberto V.', email: 'roberto.vargas@solvo.global', roleKey: 'coordinador', title: 'Operations Coordinator', isActive: true, companiesAsComercial: 0, companiesAsSDR: 0, vacanciesAsComercial: 0, vacanciesAsSDR: 0 },
  // Supervisors
  { id: 'uuid-staff-009', name: 'Patricia Morales', shortName: 'Patricia M.', email: 'patricia.morales@solvo.global', roleKey: 'supervisor', title: 'Operations Supervisor', isActive: true, companiesAsComercial: 0, companiesAsSDR: 0, vacanciesAsComercial: 0, vacanciesAsSDR: 0 },
  // Administrators
  { id: 'uuid-staff-005', name: 'Pedro Sánchez', shortName: 'Pedro S.', email: 'pedro.sanchez@solvo.global', roleKey: 'administrador', title: 'Sales Director', isActive: true, companiesAsComercial: 0, companiesAsSDR: 0, vacanciesAsComercial: 0, vacanciesAsSDR: 0 }
];

// Demo users mapped to roles (for login selector)
const DEMO_USERS = {
  comercial: TEAM_MEMBERS[0],      // Carlos Mendoza
  sdr: TEAM_MEMBERS[4],            // Daniela López
  coordinador: TEAM_MEMBERS[7],    // Ana Rodríguez
  supervisor: TEAM_MEMBERS[9],     // Patricia Morales
  administrador: TEAM_MEMBERS[10]  // Pedro Sánchez
};

// === CATÁLOGO ESTÁNDAR DE INDUSTRIAS (HUSPL-0.1) ===
// Fuente única del vocabulario de industria: alimenta el filtro de los dos listados,
// el formulario de empresa y la clasificación automática. Mantenerlo es editar este dato,
// no desplegar la app: `active: false` retira una entrada de lo que se ofrece para clasificar,
// y las empresas que ya la tienen conservan su código y siguen mostrándose con su etiqueta.
const INDUSTRY_CATALOG = [
  { code: 'healthcare', label: 'Healthcare', active: true },
  { code: 'education', label: 'Education', active: true },
  { code: 'financial_services', label: 'Financial Services', active: true },
  { code: 'insurance', label: 'Insurance', active: true },
  { code: 'real_estate', label: 'Real Estate', active: true },
  { code: 'legal_services', label: 'Legal Services', active: true },
  { code: 'technology_software', label: 'Technology & Software', active: true },
  { code: 'staffing_recruiting', label: 'Staffing & Recruiting', active: true },
  { code: 'professional_services', label: 'Professional Services', active: true },
  { code: 'logistics_transportation', label: 'Logistics & Transportation', active: true },
  { code: 'manufacturing', label: 'Manufacturing', active: true },
  { code: 'construction', label: 'Construction', active: true },
  { code: 'retail_ecommerce', label: 'Retail & E-commerce', active: true },
  { code: 'hospitality_travel', label: 'Hospitality & Travel', active: true },
  { code: 'marketing_advertising', label: 'Marketing & Advertising', active: true },
  { code: 'media_entertainment', label: 'Media & Entertainment', active: true },
  { code: 'energy_utilities', label: 'Energy & Utilities', active: true },
  { code: 'telecommunications', label: 'Telecommunications', active: true },
  { code: 'nonprofit', label: 'Nonprofit', active: true },
  { code: 'government_public_sector', label: 'Government & Public Sector', active: true },
  { code: 'agriculture', label: 'Agriculture', active: true },
  { code: 'automotive', label: 'Automotive', active: true },
  { code: 'other', label: 'Other', active: true }
];

// Entradas ofrecidas para clasificar, por etiqueta alfabética.
function getActiveIndustries() {
  return INDUSTRY_CATALOG.filter(function (i) { return i.active; })
    .slice()
    .sort(function (a, b) { return a.label.localeCompare(b.label); });
}

// === TRAMOS DE TAMAÑO DE EMPRESA (FSPL-7) ===
// Cinco tramos sobre `company.size_employees`, con ambos extremos incluidos y sin solaparse:
// una empresa con el dato informado cae en exactamente uno. `unknown` es el valor reservado
// para los registros sin el dato, con la misma convención con que industria usa `unclassified`.
const COMPANY_SIZE_RANGES = [
  { value: '1-50',     label: '1 – 50',        min: 1,    max: 50 },
  { value: '51-200',   label: '51 – 200',      min: 51,   max: 200 },
  { value: '201-500',  label: '201 – 500',     min: 201,  max: 500 },
  { value: '501-1000', label: '501 – 1,000',   min: 501,  max: 1000 },
  { value: '1000+',    label: '1,000+',        min: 1001, max: Infinity }
];

// Un tamaño de 0 o negativo es dato no válido y cae bajo `unknown`, igual que el ausente.
function companySizeBucket(company) {
  const n = company && Number(company.sizeEmployees);
  if (!n || !isFinite(n) || n < 1) return 'unknown';
  const r = COMPANY_SIZE_RANGES.find(function (x) { return n >= x.min && n <= x.max; });
  return r ? r.value : 'unknown';
}

// Etiqueta del catálogo. Una empresa sin clasificar no muestra nada: nunca el texto crudo.
function getIndustryLabel(code) {
  if (!code) return '';
  var entry = INDUSTRY_CATALOG.find(function (i) { return i.code === code; });
  return entry ? entry.label : '';
}

/* ============================================================================
   ENTIDADES MOCK Y SU COLUMNA EN LA BASE COMPARTIDA
   Referencia para implementar: campo del objeto → tabla.columna, y la HU que
   introduce la columna cuando todavía no existe. "derivado" = se calcula.

   Company  (public.company + public.company_research, 1:1 por company_id)
     id                        company.id
     name                      company.name
     industry                  company.industry — texto crudo de la fuente; no se muestra
     industryCode              company.industry_code (HUSPL-0.1) · null = sin clasificar
     location                  company.location ("City, ST")
     stateCode                 company.state_code (HUPEA-0.3)
     website                   company.website
     linkedinId / indeedId     company.linkedin_id / indeed_id — slug; ver rebuildPortalUrl
     linkedinUrl / indeedUrl   derivado (seedPortalUrls)
     sizeEmployees             company.size_employees
     revenueUsd                company.revenue_usd — VARCHAR(50) en la base; ningún filtro
                               resuelve sobre él, así que se guarda tal cual
     yearFounded               company.year_founded — VARCHAR(10), mismo caso
     apolloOrganizationId      company.apollo_organization_id (HUPEA-0.3)
     type                      company.relationship_type — client | prospect | inactive
     pipelineStage             company.pipeline
     lastContactedAt           company.last_contacted_at — lo escribe el envío, una sola vez
                               por empresa (HUPEA-3.1)
     lastScrapedAt             company.last_scraped_at (on-demand)
     isResearched              company.is_researched
     researchedAt / lastResearchAt   company_research.last_research_at
     icpScore                  company.icp_score (HUPEA-1.7) · null = sin calificar
     leadSignals               company.lead_signals JSONB — códigos de LEAD_SIGNALS
     qualifiedAt               company.qualified_at
     contactsSearchedAt        company.contacts_searched_at (HUPEA-2.2)
     isExcluded / exclusionReason    company.is_excluded / exclusion_reason
     leadSummary               company_research.lead_summary (HUPEA-1.7)
     valueProposition / strengthsDifferentiators   company_research.* — los escribe el motor (HUPEA-1.6)
     salesPitch / mission / vision / companyHistory  company_research.* — los escribe una persona
     comercialId / sdrId / coordinatorId   staff_company_assignment, un slot por role_type
     createdAt                 company.created_at — "Detected"
     lastExportedBy / lastExportedAt / exportCount   company.last_exported_* (HUSPL-0.2)
     contactsCount / remoteViable    derivados
     (no modelado)             source_project — 'solvo-platform' al crear desde la app;
                               deleted_at — borrado lógico (company_audit_log)

   Vacancy  (public.vacancies)
     id / title                id / job_title
     companyId                 company_id
     positionId / searchText   position_id / search_text (HUPEA-0.3) · null en las de otros pipelines
     status                    status — detected | contacted | proposal | won | lost
     source                    source_project — ¡nombre invertido a propósito! valores reales:
                               general-us-openings | current-client-us-openings | on_demand_openings
                               | prospect_engine (el barrido por posición del ICP)
     sourcePortal              source — indeed | linkedin | website | manual
     stateCode / location      state_code / location
     workModality              work_modality — remote | hybrid | onsite | unknown
     jobUrl                    job_url
     remoteViable              is_remote_viable
     aiConfidence              ai_confidence NUMERIC(3,2) · null = sin clasificar
     aiReasons                 ai_reasons TEXT[]
     aiSignals                 ai_signals JSONB — tags de HUPEA-1.4 (VACANCY_SIGNALS)
     salaryMinUsd / salaryMaxUsd   salary_min_usd / salary_max_usd (HUPEA-0.3); `salary` = salary_range (texto legado)
     languages                 languages TEXT[]
     seniorityLevel            seniority_level — entry | mid | senior | lead | executive | unspecified
     department / skills       department / skills (skills: TEXT unido por ", ")
     description               description_text
     publishedDate             published_date
     detectedAt / detectedAtTs created_at (fecha / timestamp)
     comercialId, comercialType, sdrId, sdrType   staff_vacancy_assignment (role_type, assignment_type)
     assignmentUpdatedAt       staff_vacancy_assignment.assigned_at
     lastExportedBy / lastExportedAt / exportCount   vacancies.last_exported_* (HUSPL-0.2)

   Contact  (public.company_contacts)
     id / companyId            id / company_id
     fullName / position       full_name / position (cargo crudo)
     department / seniorityLevel   department / seniority_level — TEXT en la base, valor de
                               CONTACT_DEPARTMENTS y CONTACT_SENIORITIES
     email / phone / linkedinUrl   email / phone / linkedin_url
     roleCode                  role_code (HUPEA-2.3) · null = contacto anterior al análisis
     decisionLevel             decision_level SMALLINT 1 | 2 — derivado de role_code + banda de tamaño
     interestSignal            interest_signal
     emailVerification         email_verification — valid | accept_all | unknown | risky · null en existentes
     analyzedAt                analyzed_at
     createdAt                 created_at
     (no modelado)             is_primary — lo marca el motor al guardar (HUPEA-2.5) y la
                               plataforma no lo administra; id_apollo; deleted_at
     lastExportedBy / lastExportedAt / exportCount   company_contacts.last_exported_*

   StateHistory  (public.states_history): id, vacancyId, companyId, changedBy, statusFrom,
     statusTo, note, tags, createdAt — 1:1 con la tabla.
   ExecutionLog  (public.execution_logs): executionId, workflowName, nodeName, message,
     usageType / usageAmount / usageUnit, metadata, createdAt (execution_at), logLevel.
     vacancyId / companyId son ayudas del prototipo: en la base van dentro de metadata.
   ============================================================================ */

// === MOCK ASSIGNMENT DATA (Dual: Sales Rep + SDR) ===
// `industry` conserva el texto crudo que escribió la fuente y ya no se muestra en ningún lado;
// `industryCode` es la clasificación contra el catálogo (null = sin clasificar).
// La marca de exportación (lastExportedBy / lastExportedAt / exportCount) la siembra seedExportState().
const MOCK_COMPANIES = [
  { id: 'comp-001', name: 'TechCorp Solutions', industry: 'Technology', industryCode: 'technology_software', location: 'Miami, FL', website: 'https://techcorp.com', linkedinId: 'techcorp-solutions', indeedId: 'techcorp-solutions', sizeEmployees: 750, lastContactedAt: null, researchedAt: '2025-12-15', salesPitch: 'TechCorp offers customized solutions with demonstrable ROI within 6 months. Their 500+ engineering team guarantees 24/7 support and continuous updates.', pipelineStage: 'onboarding started', type: 'client', remoteViable: true, comercialId: 'uuid-staff-001', sdrId: 'uuid-staff-006', coordinatorId: 'uuid-staff-004', contactsCount: 2 },
  { id: 'comp-002', name: 'GlobalHealth Inc', industry: 'Hospital & Health Care', industryCode: 'healthcare', location: 'New York, NY', website: 'https://globalhealth.com', linkedinId: 'globalhealth-inc', indeedId: 'globalhealth-inc', sizeEmployees: 1200, lastContactedAt: null, researchedAt: '2026-01-10', salesPitch: 'GlobalHealth is expanding rapidly and needs staffing solutions for their new clinics.', pipelineStage: 'prospecting', type: 'prospect', remoteViable: true, comercialId: 'uuid-staff-001', sdrId: 'uuid-staff-007', coordinatorId: 'uuid-staff-004', contactsCount: 1 },
  { id: 'comp-003', name: 'FinServe Partners', industry: 'financial services', industryCode: 'financial_services', location: 'Chicago, IL', website: 'https://finserve.com', linkedinId: 'finserve-partners', indeedId: null, sizeEmployees: 320, lastContactedAt: null, researchedAt: '2026-02-02', salesPitch: 'Mid-market advisory firm scaling its back office; open to nearshore analysts.', pipelineStage: 'engaged', type: 'prospect', remoteViable: true, comercialId: 'uuid-staff-002', sdrId: 'uuid-staff-006', coordinatorId: 'uuid-staff-004', contactsCount: 1 },
  { id: 'comp-004', name: 'DataStream Analytics', industry: 'Computer Software', industryCode: 'technology_software', location: 'Austin, TX', website: 'https://datastream.io', linkedinId: 'datastream-analytics', indeedId: 'datastream-analytics', sizeEmployees: 85, lastContactedAt: null, researchedAt: '2026-03-18', salesPitch: 'Series A startup hiring fast with no internal recruiting team.', pipelineStage: 'lead', type: 'prospect', remoteViable: true, comercialId: null, sdrId: 'uuid-staff-006', coordinatorId: null, contactsCount: 1 },
  { id: 'comp-005', name: 'Meridian Logistics', industry: 'Transportation/Trucking/Railroad', industryCode: 'logistics_transportation', location: 'Dallas, TX', website: 'https://meridianlog.com', linkedinId: null, indeedId: null, sizeEmployees: 460, lastContactedAt: null, researchedAt: '2026-02-27', salesPitch: 'Regional carrier with heavy back-office load in dispatch and billing.', pipelineStage: 'initial appointment held', type: 'prospect', remoteViable: false, comercialId: 'uuid-staff-003', sdrId: null, coordinatorId: 'uuid-staff-004', contactsCount: 1 },
  { id: 'comp-006', name: 'NovaTech Industries', industry: 'Industrial Automation', industryCode: 'manufacturing', location: 'Seattle, WA', website: 'https://novatech.com', linkedinId: 'novatech-industries', indeedId: 'novatech-industries', sizeEmployees: 2100, lastContactedAt: null, researchedAt: '2026-01-29', salesPitch: 'Established client expanding shared services; recurring bilingual support demand.', pipelineStage: 'client', type: 'client', remoteViable: true, comercialId: 'uuid-staff-002', sdrId: 'uuid-staff-007', coordinatorId: 'uuid-staff-008', contactsCount: 2 },
  { id: 'comp-007', name: 'Summit Education', industry: 'education management', industryCode: 'education', location: 'Boston, MA', website: 'https://summitedu.org', linkedinId: 'summit-education', indeedId: null, sizeEmployees: 140, lastContactedAt: null, researchedAt: '2026-03-05', salesPitch: 'Charter network with seasonal admissions and enrollment support peaks.', pipelineStage: 'lead', type: 'prospect', remoteViable: true, comercialId: null, sdrId: null, coordinatorId: null, contactsCount: 0 },
  // El slug de LinkedIn viene guardado como dirección completa: el archivo exportado la entrega tal cual.
  { id: 'comp-008', name: 'Apex Retail Group', industry: 'Retail', industryCode: 'retail_ecommerce', location: 'Los Angeles, CA', website: 'https://apexretail.com', linkedinId: 'https://www.linkedin.com/company/apex-retail-group', indeedId: null, sizeEmployees: 5400, lastContactedAt: null, researchedAt: '2026-02-14', salesPitch: 'National retailer with high-volume seasonal hiring in customer care.', pipelineStage: 'prospecting', type: 'prospect', remoteViable: true, comercialId: 'uuid-staff-003', sdrId: 'uuid-staff-011', coordinatorId: 'uuid-staff-009', contactsCount: 0 },
  // Llegó de General US Openings, que crea la empresa sin industria de origen: queda sin clasificar.
  { id: 'comp-009', name: 'CloudBridge Systems', industry: '', industryCode: null, location: 'San Francisco, CA', website: 'https://cloudbridge.io', linkedinId: 'cloudbridge-systems', indeedId: 'cloudbridge-systems', sizeEmployees: 210, lastContactedAt: null, researchedAt: '2026-03-22', salesPitch: 'B2B SaaS scaling support coverage to US business hours.', pipelineStage: 'engaged', type: 'prospect', remoteViable: true, comercialId: 'uuid-staff-001', sdrId: 'uuid-staff-006', coordinatorId: 'uuid-staff-004', contactsCount: 1 },
  { id: 'comp-010', name: 'PharmaVita Labs', industry: 'Pharmaceuticals', industryCode: 'healthcare', location: 'Philadelphia, PA', website: 'https://pharmavita.com', linkedinId: null, indeedId: null, sizeEmployees: 890, lastContactedAt: null, researchedAt: '2025-11-08', salesPitch: 'Closed the cycle without moving forward; revisit next budget season.', pipelineStage: 'lost', type: 'inactive', remoteViable: false, comercialId: 'uuid-staff-002', sdrId: null, coordinatorId: 'uuid-staff-004', contactsCount: 1 },
  // Empresa todavía sin investigar: sin industria, tamaño, sitio web ni perfiles corporativos.
  { id: 'comp-011', name: 'Harbor Point Services', industry: '', industryCode: null, location: 'Tampa, FL', website: null, linkedinId: null, indeedId: null, sizeEmployees: null, lastContactedAt: null, researchedAt: null, salesPitch: null, pipelineStage: 'lead', type: 'prospect', remoteViable: true, comercialId: null, sdrId: null, coordinatorId: null, contactsCount: 0 }
];

// Mock contacts based on company_contacts schema.
// Lo guardado refleja el filtro de rol decisor de Company Decision Maker: el cargo se contrasta
// contra el catálogo de roles y cada empresa conserva sus contactos de primer nivel de decisión
// —CEO, President, Chairman, CFO, CRO, VP of Sales— o, solo cuando no tiene ninguno, un único
// alterno de segundo nivel (COO, Owner/Founder, Managing Director, Executive Director).
// Los cargos que no califican no llegan a company_contacts, así que una empresa puede quedar
// sin contactos: Summit Education, Apex Retail y Harbor Point son ese caso.
// Conviven dos generaciones: los que guardó el motor nuevo, con `role_code`, `decision_level`
// y `email_verification`, y los que dejó el pipeline anterior o cargó una persona, que tienen
// esos tres campos vacíos y por eso no cuentan como decisores (ver seedContactAnalysis).
const MOCK_CONTACTS = [
  { id: 'ct-001', companyId: 'comp-001', fullName: 'James Wilson', position: 'Chief Executive Officer', department: 'executive', seniorityLevel: 'c_suite', email: 'j.wilson@techcorp.com', phone: '+1 305-555-0101', linkedinUrl: 'https://linkedin.com/in/jameswilson' },
  { id: 'ct-002', companyId: 'comp-001', fullName: 'Sarah Chen', position: 'VP of Sales', department: 'sales', seniorityLevel: 'vp', email: 's.chen@techcorp.com', phone: '+1 305-555-0102', linkedinUrl: 'https://linkedin.com/in/sarachen' },
  { id: 'ct-005', companyId: 'comp-002', fullName: 'Dr. Robert Kim', position: 'President & CEO', department: 'executive', seniorityLevel: 'c_suite', email: 'r.kim@globalhealth.com', phone: '+1 212-555-0201', linkedinUrl: 'https://linkedin.com/in/drrobertkim' },
  { id: 'ct-008', companyId: 'comp-003', fullName: 'Jennifer Lee', position: 'Chief Financial Officer', department: 'finance', seniorityLevel: 'c_suite', email: 'j.lee@finserve.com', phone: '+1 312-555-0302', linkedinUrl: 'https://linkedin.com/in/jenniferlee' },
  { id: 'ct-010', companyId: 'comp-004', fullName: 'Alex Rivera', position: 'Founder & CEO', department: 'executive', seniorityLevel: 'c_suite', email: 'a.rivera@datastream.io', phone: '+1 512-555-0401', linkedinUrl: 'https://linkedin.com/in/alexrivera' },
  // Meridian no tiene ningún contacto de primer nivel: se conserva un único alterno.
  { id: 'ct-011', companyId: 'comp-005', fullName: 'Karen White', position: 'Chief Operating Officer', department: 'operations', seniorityLevel: 'c_suite', email: 'k.white@meridianlog.com', phone: '+1 214-555-0501', linkedinUrl: 'https://linkedin.com/in/karenwhite' },
  { id: 'ct-013', companyId: 'comp-006', fullName: 'Rachel Green', position: 'Chief Executive Officer', department: 'executive', seniorityLevel: 'c_suite', email: 'r.green@novatech.com', phone: '+1 206-555-0601', linkedinUrl: 'https://linkedin.com/in/rachelgreen' },
  { id: 'ct-014', companyId: 'comp-006', fullName: 'Mark Johnson', position: 'VP Sales', department: 'sales', seniorityLevel: 'vp', email: 'm.johnson@novatech.com', phone: '+1 206-555-0602', linkedinUrl: 'https://linkedin.com/in/markjohnson' },
  { id: 'ct-021', companyId: 'comp-009', fullName: 'Sophia Nguyen', position: 'Chief Executive Officer', department: 'executive', seniorityLevel: 'c_suite', email: 's.nguyen@cloudbridge.io', phone: '+1 415-555-0901', linkedinUrl: 'https://linkedin.com/in/sophianguyen' },
  { id: 'ct-023', companyId: 'comp-010', fullName: 'Dr. Helen Moore', position: 'Chairwoman of the Board', department: 'executive', seniorityLevel: 'c_suite', email: 'h.moore@pharmavita.com', phone: '+1 215-555-1001', linkedinUrl: 'https://linkedin.com/in/drhelenmoore' },
  // Contactos anteriores al análisis de perfil: están en company_contacts y no tienen rol
  // normalizado ni nivel de decisión. Es el estado real de todo lo cargado antes de FPEA-2.
  { id: 'ct-003', companyId: 'comp-001', fullName: 'Linda Park', position: 'HR Manager', department: 'hr', seniorityLevel: 'manager', email: 'l.park@techcorp.com', phone: '+1 305-555-0103', linkedinUrl: 'https://linkedin.com/in/lindapark' },
  { id: 'ct-006', companyId: 'comp-002', fullName: 'Marcus Webb', position: 'Executive Assistant to the CEO', department: 'executive', seniorityLevel: 'entry', email: 'm.webb@globalhealth.com', phone: null, linkedinUrl: null }
];

function getContactsForCompany(companyId) {
  return MOCK_CONTACTS.filter(c => c.companyId === companyId);
}

// `source` es el pipeline que detectó la vacante (vacancies.source_project) y `sourcePortal`,
// el portal del que salió el aviso (vacancies.source). `detectedAt` (created_at) y `publishedDate`
// son dos fechas distintas y las siembra seedDetectionDates().
const MOCK_VACANCIES = [
  { id: 'vac-001', title: 'Senior Software Engineer', companyId: 'comp-001', status: 'contacted', source: 'general-us-openings', sourcePortal: 'linkedin', stateCode: 'FL', location: 'Miami, FL', workModality: 'remote', jobUrl: 'https://www.linkedin.com/jobs/view/3901247115', remoteViable: true, salary: '$120K - $150K', salaryBucket: '100-150', seniorityLevel: 'senior', department: 'Engineering', skills: 'Node.js, AWS, PostgreSQL, Docker', description: 'Build scalable microservices using Node.js and AWS.', comercialId: 'uuid-staff-001', comercialType: 'inherited', sdrId: 'uuid-staff-006', sdrType: 'inherited' },
  { id: 'vac-002', title: 'DevOps Lead', companyId: 'comp-001', status: 'proposal', source: 'general-us-openings', sourcePortal: 'indeed', stateCode: 'FL', location: 'Miami, FL', workModality: 'hybrid', jobUrl: 'https://www.indeed.com/viewjob?jk=8b1f4c02ad77e310', remoteViable: true, salary: '$130K - $160K', salaryBucket: '100-150', seniorityLevel: 'lead', department: 'Engineering', skills: 'Kubernetes, Terraform, CI/CD, Azure', description: 'Lead CI/CD pipeline architecture for cloud infrastructure.', comercialId: 'uuid-staff-001', comercialType: 'inherited', sdrId: 'uuid-staff-006', sdrType: 'inherited' },
  { id: 'vac-003', title: 'Product Manager', companyId: 'comp-001', status: 'detected', source: 'current-client-us-openings', sourcePortal: 'linkedin', stateCode: 'FL', location: 'Miami, FL', workModality: 'remote', jobUrl: 'https://www.linkedin.com/jobs/view/3899014772', remoteViable: true, salary: '$110K - $140K', salaryBucket: '100-150', seniorityLevel: 'mid', department: 'Product', skills: 'Roadmapping, Discovery, SQL, Agile', description: 'Drive product strategy for SaaS platform.', comercialId: 'uuid-staff-002', comercialType: 'direct', sdrId: 'uuid-staff-006', sdrType: 'inherited' },
  { id: 'vac-004', title: 'Data Scientist', companyId: 'comp-002', status: 'detected', source: 'general-us-openings', sourcePortal: 'linkedin', stateCode: 'NY', location: 'New York, NY', workModality: 'hybrid', jobUrl: 'https://www.linkedin.com/jobs/view/3902663841', remoteViable: true, salary: '$140K - $170K', salaryBucket: '150+', seniorityLevel: 'senior', department: 'Data', skills: 'Python, scikit-learn, MLflow, SQL', description: 'ML models for patient outcome prediction.', comercialId: 'uuid-staff-001', comercialType: 'inherited', sdrId: 'uuid-staff-007', sdrType: 'inherited' },
  { id: 'vac-005', title: 'Financial Analyst', companyId: 'comp-003', status: 'contacted', source: 'general-us-openings', sourcePortal: 'indeed', stateCode: 'IL', location: 'Chicago, IL', workModality: 'onsite', jobUrl: 'https://www.indeed.com/viewjob?jk=2fd903b7c1e845aa', remoteViable: true, salary: '$80K - $100K', salaryBucket: '50-100', seniorityLevel: 'mid', department: 'Finance', skills: 'Excel, Financial modeling, Power BI', description: 'Financial modeling and forecasting for investment portfolio.', comercialId: 'uuid-staff-002', comercialType: 'inherited', sdrId: 'uuid-staff-006', sdrType: 'inherited' },
  { id: 'vac-006', title: 'React Developer', companyId: 'comp-004', status: 'detected', source: 'general-us-openings', sourcePortal: 'linkedin', stateCode: 'TX', location: 'Austin, TX', workModality: 'remote', jobUrl: 'https://www.linkedin.com/jobs/view/3903771208', remoteViable: true, salary: '$90K - $120K', salaryBucket: '50-100', seniorityLevel: 'mid', department: 'Engineering', skills: 'React, TypeScript, GraphQL', description: 'Frontend development with React and TypeScript.', comercialId: null, comercialType: null, sdrId: 'uuid-staff-006', sdrType: 'inherited' },
  { id: 'vac-007', title: 'Supply Chain Manager', companyId: 'comp-005', status: 'won', source: 'current-client-us-openings', sourcePortal: 'indeed', stateCode: 'TX', location: 'Dallas, TX', workModality: 'onsite', jobUrl: 'https://www.indeed.com/viewjob?jk=71ac4e9d0b3f6612', remoteViable: false, salary: '$95K - $115K', salaryBucket: '50-100', seniorityLevel: 'lead', department: 'Operations', skills: 'S&OP, SAP, Demand planning', description: 'End-to-end supply chain optimization.', comercialId: 'uuid-staff-003', comercialType: 'inherited', sdrId: null, sdrType: null },
  { id: 'vac-008', title: 'QA Automation Engineer', companyId: 'comp-006', status: 'contacted', source: 'general-us-openings', sourcePortal: 'linkedin', stateCode: 'WA', location: 'Seattle, WA', workModality: 'hybrid', jobUrl: 'https://www.linkedin.com/jobs/view/3897520946', remoteViable: true, salary: '$100K - $130K', salaryBucket: '100-150', seniorityLevel: 'mid', department: 'Engineering', skills: 'Playwright, Python, CI/CD', description: 'Build automated test suites for manufacturing control systems.', comercialId: 'uuid-staff-002', comercialType: 'inherited', sdrId: 'uuid-staff-007', sdrType: 'inherited' },
  { id: 'vac-009', title: 'UX Researcher', companyId: 'comp-009', status: 'detected', source: 'general-us-openings', sourcePortal: 'linkedin', stateCode: 'CA', location: 'San Francisco, CA', workModality: 'remote', jobUrl: 'https://www.linkedin.com/jobs/view/3904118530', remoteViable: true, salary: '$105K - $130K', salaryBucket: '100-150', seniorityLevel: 'mid', department: 'Design', skills: 'User interviews, Usability testing, Figma', description: 'User research for B2B SaaS products.', comercialId: 'uuid-staff-001', comercialType: 'inherited', sdrId: 'uuid-staff-006', sdrType: 'inherited' },
  { id: 'vac-010', title: 'Marketing Coordinator', companyId: 'comp-008', status: 'lost', source: 'general-us-openings', sourcePortal: 'indeed', stateCode: 'CA', location: 'Los Angeles, CA', workModality: 'hybrid', jobUrl: 'https://www.indeed.com/viewjob?jk=5c08a26fb914d773', remoteViable: true, salary: '$55K - $70K', salaryBucket: '50-100', seniorityLevel: 'entry', department: 'Marketing', skills: 'HubSpot, Paid media, Copywriting', description: 'Manage digital marketing campaigns for retail brand.', comercialId: 'uuid-staff-003', comercialType: 'inherited', sdrId: 'uuid-staff-011', sdrType: 'inherited' }
];

// === ON-DEMAND OPENINGS (ODO) ===
// Seed last_scraped_at per company (base for the cooldown). null = never scraped on-demand.
(function seedOdState() {
  function daysAgo(n) { var d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); }
  var seed = { 'comp-001': daysAgo(2), 'comp-003': daysAgo(1), 'comp-006': daysAgo(18), 'comp-009': daysAgo(40) };
  MOCK_COMPANIES.forEach(function (c) { c.lastScrapedAt = seed[c.id] || null; });
})();

// Seed portal URLs per company (base de los badges LinkedIn/Indeed). Reutiliza company.linkedinId / indeedId,
// que la base guarda como slug: las direcciones navegables se rearman con los helpers del final del archivo.
(function seedPortalUrls() {
  MOCK_COMPANIES.forEach(function (c) {
    c.linkedinUrl = companyLinkedinUrl(c) || null;
    c.indeedUrl = companyIndeedUrl(c) || null;
  });
})();

// On-demand vacancies (origin = on_demand) returned by a previous on-demand run
MOCK_VACANCIES.push(
  { id: 'vac-od-001', title: 'Bilingual Customer Service Rep', companyId: 'comp-006', status: 'detected', source: 'on_demand_openings', sourcePortal: 'linkedin', stateCode: 'WA', location: 'Seattle, WA', workModality: 'remote', jobUrl: 'https://www.linkedin.com/jobs/view/3906442017', remoteViable: true, salary: '$45K - $55K', salaryBucket: '50-100', seniorityLevel: 'entry', department: 'Customer Service', skills: 'English C1, CRM, Inbound support', description: 'Inbound/outbound support for US customers, English C1+.', comercialId: 'uuid-staff-002', comercialType: 'inherited', sdrId: 'uuid-staff-007', sdrType: 'inherited' },
  { id: 'vac-od-002', title: 'Collections Specialist', companyId: 'comp-006', status: 'detected', source: 'on_demand_openings', sourcePortal: 'indeed', stateCode: 'WA', location: 'Seattle, WA', workModality: 'remote', jobUrl: 'https://www.indeed.com/viewjob?jk=93bd1170e5c2a408', remoteViable: true, salary: '$50K - $62K', salaryBucket: '50-100', seniorityLevel: 'mid', department: 'Finance', skills: 'B2B collections, Bilingual, ERP', description: 'B2B collections, bilingual.', comercialId: 'uuid-staff-002', comercialType: 'inherited', sdrId: 'uuid-staff-007', sdrType: 'inherited' },
  { id: 'vac-od-003', title: 'Virtual Assistant', companyId: 'comp-009', status: 'detected', source: 'on_demand_openings', sourcePortal: 'linkedin', stateCode: 'CA', location: 'San Francisco, CA', workModality: 'remote', jobUrl: 'https://www.linkedin.com/jobs/view/3905880134', remoteViable: true, salary: '$40K - $50K', salaryBucket: '0-50', seniorityLevel: 'entry', department: 'Operations', skills: 'Calendar management, English C1, Google Workspace', description: 'Executive assistant, fully remote.', comercialId: 'uuid-staff-001', comercialType: 'inherited', sdrId: 'uuid-staff-006', sdrType: 'inherited' }
);

// === FECHAS DE DETECCIÓN Y PUBLICACIÓN (HUSPL-1.1) ===
// Se siembran relativas a hoy para que el rango "Detected" siempre tenga material que recortar.
// El offset de publicación es mayor o igual al de detección: el aviso se publicó antes de que el
// sistema lo detectara, y `vac-007` es el caso extremo —publicada hace meses, detectada esta semana—
// que es justo lo que el criterio anterior sobre la fecha de publicación dejaba fuera.
(function seedDetectionDates() {
  function daysAgo(n) { var d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); }
  var companyOffsets = {
    'comp-001': 120, 'comp-002': 96, 'comp-003': 74, 'comp-004': 41, 'comp-005': 63,
    'comp-006': 133, 'comp-007': 17, 'comp-008': 52, 'comp-009': 9, 'comp-010': 148, 'comp-011': 3
  };
  MOCK_COMPANIES.forEach(function (c) {
    c.createdAt = daysAgo(companyOffsets[c.id] !== undefined ? companyOffsets[c.id] : 90);
    c.lastContactedAt = c.lastContactedAt || null;
  });
  // [detección, publicación] en días atrás
  var vacancyOffsets = {
    'vac-001': [28, 34], 'vac-002': [26, 30], 'vac-003': [12, 15], 'vac-004': [11, 13],
    'vac-005': [19, 26], 'vac-006': [6, 8], 'vac-007': [4, 97], 'vac-008': [33, 38],
    'vac-009': [8, 9], 'vac-010': [45, 51],
    'vac-od-001': [2, 2], 'vac-od-002': [2, 3], 'vac-od-003': [5, 6]
  };
  MOCK_VACANCIES.forEach(function (v) {
    var o = vacancyOffsets[v.id] || [30, 35];
    v.detectedAt = daysAgo(o[0]);
    v.publishedDate = daysAgo(o[1]);
  });
  // Última vez contactada de las empresas que ya entraron en conversación.
  var contactedOffsets = { 'comp-001': 7, 'comp-002': 21, 'comp-003': 14, 'comp-005': 45, 'comp-006': 5, 'comp-010': 112 };
  MOCK_COMPANIES.forEach(function (c) {
    if (contactedOffsets[c.id] !== undefined) c.lastContactedAt = daysAgo(contactedOffsets[c.id]) + ' 09:30';
  });
  MOCK_CONTACTS.forEach(function (ct) {
    var company = MOCK_COMPANIES.find(function (c) { return c.id === ct.companyId; });
    ct.createdAt = company ? company.createdAt : daysAgo(60);
  });
})();

// === MEMORIA DE EXPORTACIÓN (HUSPL-0.2) ===
// Cada empresa, vacante y contacto recuerda quién lo exportó por última vez, cuándo, y cuántas
// veces salió en total. Es un único juego de campos por registro: la última exportación sea de quien
// sea, no una marca por usuario. Se siembra parte del universo como ya repartido para que el filtro
// por estado de exportación arranque con contenido en sus tres valores.
(function seedExportState() {
  function daysAgo(n) { var d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); }
  var seed = {
    // Ana Rodríguez (coordinadora, usuario demo) — aparecen bajo "Exported by me" en su sesión
    'comp-002': ['uuid-staff-004', 2, 1],
    'vac-002': ['uuid-staff-004', 2, 1],
    'vac-od-001': ['uuid-staff-004', 1, 1],
    // Roberto Vargas y Patricia Morales — aparecen bajo "Exported by others"
    'comp-006': ['uuid-staff-008', 5, 2],
    'comp-010': ['uuid-staff-009', 9, 1],
    'vac-005': ['uuid-staff-008', 5, 3],
    'vac-007': ['uuid-staff-009', 12, 1]
  };
  function apply(record) {
    var mark = seed[record.id];
    record.lastExportedBy = mark ? mark[0] : null;
    record.lastExportedAt = mark ? daysAgo(mark[1]) + ' 16:45' : null;
    record.exportCount = mark ? mark[2] : 0;
  }
  MOCK_COMPANIES.forEach(apply);
  MOCK_VACANCIES.forEach(apply);
  // Los contactos salen en el archivo junto a su empresa: heredan su marca.
  MOCK_CONTACTS.forEach(function (ct) {
    var company = MOCK_COMPANIES.find(function (c) { return c.id === ct.companyId; });
    ct.lastExportedBy = company ? company.lastExportedBy : null;
    ct.lastExportedAt = company ? company.lastExportedAt : null;
    ct.exportCount = company ? company.exportCount : 0;
  });
})();

// ODO config (single window) — persisted in localStorage. La ventana es a la vez cool-down y antigüedad máx. de vacantes.
var ODO_DEFAULTS = { windowDays: 1, minWindowDays: 1 };
function getOdConfig() {
  try { var s = JSON.parse(localStorage.getItem('odoConfig')) || {}; return Object.assign({}, ODO_DEFAULTS, s); }
  catch (e) { return Object.assign({}, ODO_DEFAULTS); }
}
function setOdConfig(patch) {
  var merged = Object.assign(getOdConfig(), patch || {});
  localStorage.setItem('odoConfig', JSON.stringify({ windowDays: merged.windowDays }));
  return merged;
}
// Cooldown evaluation for one company against the current window.
// inCooldown = scrapeada dentro de la ventana; el cool-down siempre bloquea (blocked = inCooldown).
function getCooldownInfo(company) {
  var cfg = getOdConfig();
  if (!company || !company.lastScrapedAt) return { inCooldown: false, blocked: false, lastScrapedAt: null, daysSince: null, eligibleInDays: 0, windowDays: cfg.windowDays };
  var last = new Date(company.lastScrapedAt);
  var daysSince = Math.floor((Date.now() - last.getTime()) / 86400000);
  var inCooldown = daysSince < cfg.windowDays;
  return { inCooldown: inCooldown, blocked: inCooldown, lastScrapedAt: company.lastScrapedAt, daysSince: daysSince, eligibleInDays: Math.max(0, cfg.windowDays - daysSince), windowDays: cfg.windowDays };
}

// === ROLE-BASED ACCESS FUNCTIONS ===

function getCurrentUser() {
  const data = localStorage.getItem('user');
  return data ? JSON.parse(data) : null;
}

function getCurrentRole() {
  const user = getCurrentUser();
  return user ? user.role : null;
}

function getRoleName() {
  const role = getCurrentRole();
  return role && ROLES[role] ? ROLES[role].name : '';
}

// Can see all records — coordinador, supervisor and admin
function canViewAll() {
  const role = getCurrentRole();
  return role === 'coordinador' || role === 'supervisor' || role === 'administrador';
}

// Can assign — only coordinador and supervisor
function canAssign() {
  const role = getCurrentRole();
  return role === 'coordinador' || role === 'supervisor' || role === 'administrador';
}

function canDelete() {
  const role = getCurrentRole();
  return role === 'administrador' || role === 'coordinador';
}

// Can access admin section — only admin
function canAccessAdmin() {
  return getCurrentRole() === 'administrador';
}

// Can see team KPIs — coordinador, supervisor and admin
function canViewTeamKPIs() {
  const role = getCurrentRole();
  return role === 'coordinador' || role === 'supervisor' || role === 'administrador';
}

// Is a personal-view role (sees only own assignments)
function isPersonalRole() {
  const role = getCurrentRole();
  return role === 'comercial' || role === 'sdr';
}

// Can export CSV — only coordinador, supervisor, admin
function canExport() {
  const role = getCurrentRole();
  return role === 'coordinador' || role === 'supervisor' || role === 'administrador';
}

function getActiveByRole(roleKey) {
  return TEAM_MEMBERS.filter(m => m.roleKey === roleKey && m.isActive);
}

function getActiveCommercials() { return getActiveByRole('comercial'); }
function getActiveSDRs() { return getActiveByRole('sdr'); }

function getMemberById(id) {
  return TEAM_MEMBERS.find(m => m.id === id) || null;
}

// Email del staff asignado a un slot. Es lo que entregan las columnas de asignación de los archivos.
function staffEmail(id) {
  const member = id ? getMemberById(id) : null;
  return member ? member.email : '';
}

// === ENLACES CORPORATIVOS ===
// company.linkedin_id y company.indeed_id guardan el slug, no la dirección: el flujo de investigación
// les quita el protocolo, el www. y el path antes de persistirlos. Acá se rearma la dirección navegable.
// El dato viene inconsistente entre flujos, así que un valor que ya trae el dominio se entrega tal cual.
function rebuildPortalUrl(id, prefix, domain) {
  if (!id) return '';
  const raw = String(id).trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw) || raw.toLowerCase().indexOf(domain) !== -1) return raw;
  return prefix + raw;
}

function companyLinkedinUrl(company) {
  return company ? rebuildPortalUrl(company.linkedinId, 'https://www.linkedin.com/company/', 'linkedin.com') : '';
}

function companyIndeedUrl(company) {
  return company ? rebuildPortalUrl(company.indeedId, 'https://www.indeed.com/cmp/', 'indeed.com') : '';
}

// === ESTADO DE EXPORTACIÓN (HUSPL-2.3 / HUSPL-2.4) ===
const EXPORT_STATUS_OPTIONS = [
  { value: 'not_exported', label: 'Not exported' },
  { value: 'exported_by_me', label: 'Exported by me' },
  { value: 'exported_by_others', label: 'Exported by others' },
  { value: 'all', label: 'All' }
];

// Los cuatro valores del filtro solo aplican a los roles de coordinación; para Sales Rep y SDR
// el listado se comporta como antes de la épica.
function canFilterByExportStatus() {
  return canViewAll();
}

function getExportStatus(record) {
  const user = getCurrentUser();
  if (!record || !record.lastExportedBy) return 'not_exported';
  return user && record.lastExportedBy === user.id ? 'exported_by_me' : 'exported_by_others';
}

// Marca los registros entregados con quién los exportó y cuándo, e incrementa su conteo.
// Se ejecuta después de componer el archivo: el contenido entregado no depende de esta marca.
function markExported(records) {
  const user = getCurrentUser();
  if (!user || !records || !records.length) return;
  const now = new Date();
  const stamp = now.toISOString().slice(0, 10) + ' ' +
    String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  records.forEach(r => {
    r.lastExportedBy = user.id;
    r.lastExportedAt = stamp;
    r.exportCount = (r.exportCount || 0) + 1;
  });
}

// Cuántos registros del recorte ya salieron alguna vez — alimenta el aviso de solapamiento del popup.
function countAlreadyExported(records) {
  return (records || []).filter(r => r && r.lastExportedBy).length;
}

// Get companies visible to current user
function getVisibleCompanies() {
  const user = getCurrentUser();
  if (!user) return [];
  if (canViewAll()) return MOCK_COMPANIES;
  if (user.role === 'comercial') return MOCK_COMPANIES.filter(c => c.comercialId === user.id);
  if (user.role === 'sdr') return MOCK_COMPANIES.filter(c => c.sdrId === user.id);
  return [];
}

// Get vacancies visible to current user
function getVisibleVacancies() {
  const user = getCurrentUser();
  if (!user) return [];
  if (canViewAll()) return MOCK_VACANCIES;
  if (user.role === 'comercial') return MOCK_VACANCIES.filter(v => v.comercialId === user.id);
  if (user.role === 'sdr') return MOCK_VACANCIES.filter(v => v.sdrId === user.id);
  return [];
}

// === SESSION MANAGEMENT ===

function initSession() {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'index.html'; return null; }
  return user;
}

function logout() {
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// === SIDEBAR RENDERING ===

/* === Header: título de producto + controles ===
   La plataforma es en inglés; el prototipo no tiene selector de idioma. El único control
   del header, además del colapso del menú, es el toggle de tema, que monta theme.js
   dentro de #header-controls. */
function renderHeaderControls() {
  const header = document.querySelector('.header');
  if (!header || document.getElementById('header-controls')) return;

  /* boton para ocultar/mostrar el sidebar (desktop) */
  const hb = document.createElement('button');
  hb.type = 'button';
  hb.className = 'header-icon-btn sidebar-collapse-btn';
  hb.title = 'Hide/show menu';
  hb.setAttribute('aria-label', 'Hide/show menu');
  hb.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>';
  hb.addEventListener('click', function () {
    const collapsed = document.body.classList.toggle('sidebar-collapsed');
    try { localStorage.setItem('sidebarCollapsed', collapsed ? '1' : '0'); } catch (e) {}
  });
  header.insertBefore(hb, header.firstChild);
  try {
    if (localStorage.getItem('sidebarCollapsed') === '1') document.body.classList.add('sidebar-collapsed');
  } catch (e) {}
  const wrap = document.createElement('div');
  wrap.id = 'header-controls';
  wrap.className = 'header-controls';
  header.appendChild(wrap);

  /* theme.js monta el toggle apenas el DOM está listo. Una página que llama a esta
     función desde su propio DOMContentLoaded llega tarde y el botón ya quedó flotando
     sobre el body: se reubica en el header en vez de dejarlo suelto. */
  const toggle = document.getElementById('theme-toggle');
  if (toggle) wrap.appendChild(toggle);
}

function renderSidebar(activePage) {
  const user = getCurrentUser();
  if (!user) return;

  const roleName = getRoleName();
  const initials = user.name.split(' ').map(n => n[0]).join('');
  const showAdmin = canAccessAdmin();

  const navItems = [
    { id: 'dashboard', label: 'KPIs', href: 'dashboard.html', icon: '<rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect>' },
    { id: 'vacancies', label: 'Open Positions', href: 'open-positions.html', icon: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect>' },
    { id: 'companies', label: 'Prospects', href: 'prospects.html', icon: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path>' }
  ];
  const adminItems = [
    { id: 'admin-users', label: 'Users', href: 'admin-users.html', icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>' },
    { id: 'settings', label: 'Settings', href: 'settings.html', icon: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle>' }
  ];

  function renderNavItem(item) {
    const isActive = activePage === item.id ? ' active' : '';
    return `<a href="${item.href}" class="nav-item${isActive}">
      <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${item.icon}</svg>
      <span>${item.label}</span>
    </a>`;
  }

  let adminSection = '';
  if (showAdmin) {
    adminSection = `<div class="nav-section"><span class="nav-section-title">Administration</span>${adminItems.map(renderNavItem).join('')}</div>`;
  }

  const sidebarHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo"><img src="SolvoGlobal_Logo_Color.png" alt="Solvo" class="sidebar-logo-img" /></div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section">${navItems.map(renderNavItem).join('')}</div>
        ${adminSection}
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="user-avatar">${initials}</div>
          <div class="user-info">
            <span class="user-name">${user.name}</span>
            <span class="badge badge-role badge-role-${user.role}">${roleName}</span>
          </div>
        </div>
        <button class="btn-logout" onclick="logout()" title="Sign out">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line>
          </svg>
        </button>
      </div>
    </aside>`;

  const container = document.getElementById('sidebar-container');
  if (container) container.innerHTML = sidebarHTML;

  renderHeaderControls();
}

// === SIDEBAR MOBILE TOGGLE ===
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar) sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('show');
}
function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
}
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeSidebar(); });

// === TOAST NOTIFICATIONS ===
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = {
    success: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    error: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" x2="9" y1="9" y2="15"></line><line x1="9" x2="15" y1="9" y2="15"></line></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="16" y2="12"></line><line x1="12" x2="12.01" y1="8" y2="8"></line></svg>'
  };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-message">${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// === ACCESS GUARD ===
function requireAdmin() {
  if (!canAccessAdmin()) { alert('You do not have access to this section.'); window.location.href = 'dashboard.html'; return false; }
  return true;
}

// === UNIFIED ASSIGNMENT POPUP ===
// Opens a popup to manage Comercial + SDR assignment for an entity

function openAssignmentPopup(options) {
  const {
    title = 'Assignment',
    currentComercialId = null,
    currentSdrId = null,
    currentCoordinatorId = null,
    // For vacancies: inheritance info
    comercialType = null,  // 'inherited' | 'direct' | null
    sdrType = null,
    inheritedComercialId = null, // from parent company
    inheritedSdrId = null,
    showInheritance = false,
    onSave = () => {}
  } = options;

  let selectedComercialId = currentComercialId;
  let selectedSdrId = currentSdrId;
  let comercialChanged = false;
  let sdrChanged = false;

  const comerciales = getActiveCommercials();
  const sdrs = getActiveSDRs();
  const currentComercial = currentComercialId ? getMemberById(currentComercialId) : null;
  const currentSdr = currentSdrId ? getMemberById(currentSdrId) : null;
  const coordinator = currentCoordinatorId ? getMemberById(currentCoordinatorId) : null;

  // Build popup HTML
  const overlay = document.createElement('div');
  overlay.className = 'assign-popup-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) closePopup(); };

  const comercialTypeLabel = comercialType === 'inherited' ? '<span class="assign-popup-type">inherited</span>' : comercialType === 'direct' ? '<span class="assign-popup-type"><span class="badge-direct">direct</span></span>' : '';
  const sdrTypeLabel = sdrType === 'inherited' ? '<span class="assign-popup-type">inherited</span>' : sdrType === 'direct' ? '<span class="assign-popup-type"><span class="badge-direct">direct</span></span>' : '';

  const canRestoreComercial = showInheritance && comercialType === 'direct' && inheritedComercialId;
  const canRestoreSdr = showInheritance && sdrType === 'direct' && inheritedSdrId;

  overlay.innerHTML = `
    <div class="assign-popup">
      <div class="assign-popup-header">
        <h3>Assignment — ${title}</h3>
        <button class="btn btn-ghost btn-sm" onclick="this.closest('.assign-popup-overlay').remove()" style="padding:4px;">&times;</button>
      </div>
      <div class="assign-popup-body">
        <div class="assign-popup-row">
          <div class="assign-popup-label">Sales Rep ${comercialTypeLabel}</div>
          <div class="assign-popup-field">
            <div id="popup-comercial-search" style="flex:1; position:relative;"></div>
            <button class="btn-clear" id="popup-comercial-clear" title="Remove assignment" ${!currentComercialId ? 'style="display:none"' : ''}>&times;</button>
            ${canRestoreComercial ? '<button class="btn-restore" id="popup-comercial-restore">Restore inheritance</button>' : ''}
          </div>
          <div class="assign-popup-note" id="popup-comercial-note" style="display:none;"></div>
        </div>
        <div class="assign-popup-row">
          <div class="assign-popup-label">SDR ${sdrTypeLabel}</div>
          <div class="assign-popup-field">
            <div id="popup-sdr-search" style="flex:1; position:relative;"></div>
            <button class="btn-clear" id="popup-sdr-clear" title="Remove assignment" ${!currentSdrId ? 'style="display:none"' : ''}>&times;</button>
            ${canRestoreSdr ? '<button class="btn-restore" id="popup-sdr-restore">Restore inheritance</button>' : ''}
          </div>
          <div class="assign-popup-note" id="popup-sdr-note" style="display:none;"></div>
        </div>
        ${coordinator ? `<div class="assign-popup-row" style="opacity:0.6">
          <div class="assign-popup-label">Coordinator/Supervisor</div>
          <div style="font-size:14px; color:var(--text-primary); padding:6px 0;">${coordinator.name} <span style="font-size:12px; color:var(--text-muted);">(auto-assigned)</span></div>
        </div>` : ''}
      </div>
      <div class="assign-popup-footer">
        <button class="btn btn-ghost btn-sm" onclick="this.closest('.assign-popup-overlay').remove()">Cancel</button>
        <button class="btn btn-primary btn-sm" id="popup-save-btn" disabled>Save</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  // Render searchboxes
  function renderSearchbox(containerId, items, currentId, onChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const current = currentId ? items.find(i => i.id === currentId) : null;
    container.innerHTML = `
      <input type="text" class="form-input" id="${containerId}-input" placeholder="Search…" value="${current ? current.name : ''}" autocomplete="off" style="font-size:14px;" />
      <div id="${containerId}-results" style="display:none; position:absolute; top:100%; left:0; right:0; z-index:100; max-height:200px; overflow-y:auto; background:var(--bg-surface-raised); border:1px solid var(--border-color); border-radius:var(--radius-input); margin-top:4px; box-shadow:var(--shadow-lg);"></div>`;
    const input = document.getElementById(`${containerId}-input`);
    const results = document.getElementById(`${containerId}-results`);
    let isOpen = false;

    function render(filter) {
      const q = (filter || '').toLowerCase();
      const filtered = q ? items.filter(i => i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q)) : items;
      let html = '';
      if (!filtered.length && q) {
        html = '<div style="padding:8px 12px; color:var(--text-muted); font-size:13px;">No matches</div>';
      } else {
        filtered.forEach(i => {
          html += `<div class="searchbox-item" data-id="${i.id}" style="padding:8px 12px; cursor:pointer;">
            <div style="font-size:14px; color:var(--text-primary);">${i.name}</div>
            <div style="font-size:12px; color:var(--text-muted);">${i.email}</div>
          </div>`;
        });
      }
      results.innerHTML = html;
      results.querySelectorAll('.searchbox-item').forEach(el => {
        el.onmouseenter = () => el.style.background = 'var(--bg-tertiary)';
        el.onmouseleave = () => el.style.background = '';
        el.onclick = () => {
          const sel = items.find(i => i.id === el.dataset.id);
          if (sel) { input.value = sel.name; onChange(sel.id); }
          results.style.display = 'none'; isOpen = false;
        };
      });
    }

    input.onfocus = () => { isOpen = true; results.style.display = 'block'; render(input.value); };
    input.oninput = () => { if (!isOpen) { isOpen = true; results.style.display = 'block'; } render(input.value); };
    document.addEventListener('click', (e) => { if (!container.contains(e.target)) { results.style.display = 'none'; isOpen = false; } });
  }

  const saveBtn = document.getElementById('popup-save-btn');
  function checkChanges() {
    const changed = selectedComercialId !== currentComercialId || selectedSdrId !== currentSdrId;
    saveBtn.disabled = !changed;
  }

  renderSearchbox('popup-comercial-search', comerciales, currentComercialId, (id) => {
    selectedComercialId = id;
    const prev = currentComercial ? currentComercial.name : 'nobody';
    const next = getMemberById(id);
    const note = document.getElementById('popup-comercial-note');
    if (currentComercialId && id !== currentComercialId) {
      note.textContent = `Will reassign from ${prev} to ${next ? next.name : ''}`;
      note.style.display = 'block';
    } else { note.style.display = 'none'; }
    document.getElementById('popup-comercial-clear').style.display = '';
    checkChanges();
  });

  renderSearchbox('popup-sdr-search', sdrs, currentSdrId, (id) => {
    selectedSdrId = id;
    const prev = currentSdr ? currentSdr.name : 'nobody';
    const next = getMemberById(id);
    const note = document.getElementById('popup-sdr-note');
    if (currentSdrId && id !== currentSdrId) {
      note.textContent = `Will reassign from ${prev} to ${next ? next.name : ''}`;
      note.style.display = 'block';
    } else { note.style.display = 'none'; }
    document.getElementById('popup-sdr-clear').style.display = '';
    checkChanges();
  });

  // Clear buttons
  document.getElementById('popup-comercial-clear').onclick = () => {
    selectedComercialId = null;
    document.getElementById('popup-comercial-search-input').value = '';
    const note = document.getElementById('popup-comercial-note');
    if (currentComercial) { note.textContent = `Assignment of ${currentComercial.name} will be removed`; note.style.display = 'block'; }
    document.getElementById('popup-comercial-clear').style.display = 'none';
    checkChanges();
  };
  document.getElementById('popup-sdr-clear').onclick = () => {
    selectedSdrId = null;
    document.getElementById('popup-sdr-search-input').value = '';
    const note = document.getElementById('popup-sdr-note');
    if (currentSdr) { note.textContent = `Assignment of ${currentSdr.name} will be removed`; note.style.display = 'block'; }
    document.getElementById('popup-sdr-clear').style.display = 'none';
    checkChanges();
  };

  // Restore heritage buttons (vacancies only)
  const restoreComBtn = document.getElementById('popup-comercial-restore');
  if (restoreComBtn && inheritedComercialId) {
    restoreComBtn.onclick = () => {
      selectedComercialId = inheritedComercialId;
      const inherited = getMemberById(inheritedComercialId);
      document.getElementById('popup-comercial-search-input').value = inherited ? inherited.name : '';
      const note = document.getElementById('popup-comercial-note');
      note.textContent = `Inheritance will be restored → ${inherited ? inherited.name : ''}`;
      note.style.display = 'block';
      document.getElementById('popup-comercial-clear').style.display = '';
      checkChanges();
    };
  }
  const restoreSdrBtn = document.getElementById('popup-sdr-restore');
  if (restoreSdrBtn && inheritedSdrId) {
    restoreSdrBtn.onclick = () => {
      selectedSdrId = inheritedSdrId;
      const inherited = getMemberById(inheritedSdrId);
      document.getElementById('popup-sdr-search-input').value = inherited ? inherited.name : '';
      const note = document.getElementById('popup-sdr-note');
      note.textContent = `Inheritance will be restored → ${inherited ? inherited.name : ''}`;
      note.style.display = 'block';
      document.getElementById('popup-sdr-clear').style.display = '';
      checkChanges();
    };
  }

  // Save
  saveBtn.onclick = () => {
    const changes = [];
    if (selectedComercialId !== currentComercialId) {
      const name = selectedComercialId ? getMemberById(selectedComercialId)?.name : null;
      changes.push(name ? `Sales Rep: ${name}` : 'Sales Rep: unassigned');
    }
    if (selectedSdrId !== currentSdrId) {
      const name = selectedSdrId ? getMemberById(selectedSdrId)?.name : null;
      changes.push(name ? `SDR: ${name}` : 'SDR: unassigned');
    }
    onSave(selectedComercialId, selectedSdrId);
    overlay.remove();
    showToast(changes.join(' | '));
  };

  function closePopup() { overlay.remove(); }
}

// === ASSIGNMENT SECTION RENDERER ===
// Renders the read-only assignment section in detail pages

function renderAssignmentSection(containerId, options) {
  const {
    comercialId, sdrId, coordinatorId,
    comercialType, sdrType,
    companyName,               // empresa de la que hereda la vacante
    showInheritance = false,
    updatedAt = null,
    onManage = null
  } = options;

  const container = document.getElementById(containerId);
  if (!container) return;

  const comercial = comercialId ? getMemberById(comercialId) : null;
  const sdr = sdrId ? getMemberById(sdrId) : null;
  const coordinator = coordinatorId ? getMemberById(coordinatorId) : null;

  // Una fila por puesto: etiqueta y persona. El origen de la asignación se dice al
  // lado del nombre, no debajo, para que no parta el nombre en columnas angostas.
  function slot(label, member, type, title) {
    let origin = '';
    if (showInheritance && member) {
      if (type === 'inherited') {
        origin = '<span class="assign-origin" title="Inherited from ' + (companyName || 'the company') +
          '. Reassigning the company changes it too.">Inherited</span>';
      } else if (type === 'direct') {
        origin = '<span class="assign-origin is-direct" title="Set on this record; it no longer follows the company.">Direct</span>';
      }
    }
    return '<div class="assign-slot"' + (title ? ' title="' + title + '"' : '') + '>' +
      '<dt>' + label + '</dt>' +
      '<dd>' + (member
        ? '<span class="assign-name">' + member.name + '</span>' + origin
        : '<span class="assign-name is-unassigned">Unassigned</span>') +
      '</dd></div>';
  }

  // El tercer puesto lo ocupa un coordinador o un supervisor: se nombra por el rol
  // de quien esté asignado, y solo cae al genérico cuando está vacío.
  const coordLabel = coordinator && ROLES[coordinator.roleKey] ? ROLES[coordinator.roleKey].name : 'Coordinator';

  container.innerHTML =
    '<section class="assign-section">' +
      '<div class="assign-section-head">' +
        '<h3 class="assign-section-title">Assignment</h3>' +
        (canAssign() && onManage ? '<button type="button" class="op-actionbtn" data-manage>Manage</button>' : '') +
      '</div>' +
      '<dl class="assign-slots">' +
        slot('Sales Rep', comercial, comercialType) +
        slot('SDR', sdr, sdrType) +
        slot(coordLabel, coordinator, null, 'Coordinator or supervisor who owns the account internally') +
      '</dl>' +
      (updatedAt ? '<p class="assign-section-updated">Last modified ' + updatedAt + '</p>' : '') +
    '</section>';

  // El manejador se engancha al nodo, no se serializa dentro del HTML: así conserva
  // su closure y no depende de que todo lo que usa sea global.
  const btn = container.querySelector('[data-manage]');
  if (btn) btn.addEventListener('click', onManage);
}

// === CONFIRM POPUP (borrados y acciones destructivas) ===
const CONFIRM_ICONS = {
  trash: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
  search: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>'
};

function openConfirmPopup(options) {
  const {
    title = 'Confirm',
    message = '',
    highlight = '',            // texto destacado bajo el mensaje (ej. nombre del registro)
    icon = 'trash',            // 'trash' | 'search' | html custom
    confirmLabel = 'Confirm',
    onConfirm = () => {}
  } = options;

  const iconHTML = CONFIRM_ICONS[icon] || icon;
  const overlay = document.createElement('div');
  overlay.className = 'assign-popup-overlay';
  overlay.innerHTML = `
    <div class="assign-popup" style="width:420px;">
      <div class="assign-popup-header">
        <h3>${title}</h3>
        <button class="modal-close" aria-label="Close">&times;</button>
      </div>
      <div class="assign-popup-body" style="text-align:center;">
        <div class="confirm-icon">${iconHTML}</div>
        <p style="font-size:14px; color:var(--text-secondary); line-height:1.5; margin:0;">${message}</p>
        ${highlight ? `<p style="font-size:14px; font-weight:700; color:var(--text-strong); margin:14px 0 0;">${highlight}</p>` : ''}
      </div>
      <div class="modal-footer" style="justify-content:center;">
        <button class="btn btn-secondary" data-action="cancel">Cancel</button>
        <button class="btn btn-primary" data-action="confirm">${confirmLabel}</button>
      </div>
    </div>`;

  function close() { overlay.remove(); }
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('.modal-close').addEventListener('click', close);
  overlay.querySelector('[data-action="cancel"]').addEventListener('click', close);
  overlay.querySelector('[data-action="confirm"]').addEventListener('click', () => { close(); onConfirm(); });
  document.body.appendChild(overlay);
}

// === EXPORT POPUP ===
// Confirmación previa a la descarga. Además de la entidad del listado, ofrece sumar al paquete la
// entidad relacionada con el recorte: desde Prospects, sus posiciones; desde Open Positions, sus
// prospectos. Las casillas arrancan desmarcadas cada vez que se abre el popup y muestran el conteo
// de su entidad antes de descargar.
// El paquete son dos archivos y ninguno de contactos: cada uno lleva lo del otro denormalizado
// —correos de decisores en el de posiciones, cargos publicados en el de prospectos—, así que se
// trabajan sin cruzar planillas. Reemplaza al contrato de tres entidades de HUSPL-2.6, que se
// entregó antes del motor nuevo.
//
// options: { entityLabel, entityCount, alreadyExported, companions: [{ key, label, count, note }],
//            onExport(selectedKeys) }

const EXPORT_ROW_LIMIT = 10000;   // tope de filas por archivo

function openExportPopup(options) {
  const {
    entityLabel = 'records',
    entityCount = 0,
    alreadyExported = 0,
    companions = [],
    onExport = () => {}
  } = options;

  if (entityCount === 0) {
    showToast(`No ${entityLabel} to export with the current filters`, 'info');
    return;
  }

  const selected = new Set();

  // Aviso de solapamiento: repetir material ya repartido tiene que ser una decisión, no un descuido.
  const overlapSection = alreadyExported > 0 ? `
    <div class="export-overlap-note">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
        <line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line>
      </svg>
      <span><strong>${alreadyExported}</strong> of ${entityCount} ${entityLabel} were already exported. Exporting again will reassign them to you.</span>
    </div>` : '';

  // Una entidad sin registros deja su casilla deshabilitada; una que supera el tope por archivo
  // queda señalada, y marcarla deshabilita el botón de exportar con el motivo a la vista.
  const companionRows = companions.map((c, i) => {
    const empty = c.count === 0;
    const overLimit = c.count > EXPORT_ROW_LIMIT;
    const reason = empty
      ? 'none in the current selection'
      : overLimit
        ? `over the ${EXPORT_ROW_LIMIT.toLocaleString('en-US')}-row per-file limit`
        : (c.note || '');
    return `
      <label class="export-companion${empty ? ' is-disabled' : ''}${overLimit ? ' is-over-limit' : ''}">
        <input type="checkbox" data-companion="${i}"${empty ? ' disabled' : ''} />
        <span class="export-companion-label">${c.label}</span>
        <span class="export-companion-count">${c.count.toLocaleString('en-US')}</span>
        ${reason ? `<span class="export-companion-note">${reason}</span>` : ''}
      </label>`;
  }).join('');

  const companionsSection = companions.length ? `
    <div class="export-companions">
      <div class="export-companions-title">Include related data</div>
      ${companionRows}
    </div>` : '';

  const mainOverLimit = entityCount > EXPORT_ROW_LIMIT;

  const overlay = document.createElement('div');
  overlay.className = 'assign-popup-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div class="assign-popup" style="width:440px;">
      <div class="assign-popup-header">
        <h3>Export CSV</h3>
        <button class="btn btn-ghost btn-sm" onclick="this.closest('.assign-popup-overlay').remove()" style="padding:4px;">&times;</button>
      </div>
      <div class="assign-popup-body">
        <div style="text-align:center; margin-bottom:8px;">
          <div style="font-size:36px; font-weight:700; color:var(--text-primary);">${entityCount.toLocaleString('en-US')}</div>
          <div style="font-size:14px; color:var(--text-secondary);">${entityLabel} to export</div>
          <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">Based on the active filters</div>
        </div>
        ${overlapSection}
        ${companionsSection}
        <div class="export-limit-note" id="export-limit-note" style="display:none;"></div>
      </div>
      <div class="assign-popup-footer">
        <button class="btn btn-ghost btn-sm" onclick="this.closest('.assign-popup-overlay').remove()">Cancel</button>
        <button class="btn btn-primary btn-sm" id="export-confirm-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" x2="12" y1="15" y2="3"></line>
          </svg>
          Export
        </button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  const confirmBtn = overlay.querySelector('#export-confirm-btn');
  const limitNote = overlay.querySelector('#export-limit-note');

  // El tope se evalúa sobre cada archivo del paquete: si alguno lo supera, no se exporta ninguno.
  function refreshLimitState() {
    const blocking = [];
    if (mainOverLimit) blocking.push(entityLabel);
    companions.forEach((c, i) => { if (selected.has(i) && c.count > EXPORT_ROW_LIMIT) blocking.push(c.label.replace(/^Include /, '')); });
    if (blocking.length) {
      limitNote.style.display = '';
      limitNote.textContent = `${blocking.join(' and ')} ${blocking.length > 1 ? 'exceed' : 'exceeds'} the ${EXPORT_ROW_LIMIT.toLocaleString('en-US')}-row limit per file. Narrow the filters${blocking.length > 1 || !mainOverLimit ? ' or uncheck them' : ''}.`;
      confirmBtn.disabled = true;
    } else {
      limitNote.style.display = 'none';
      confirmBtn.disabled = false;
    }
  }

  overlay.querySelectorAll('[data-companion]').forEach(box => {
    box.addEventListener('change', () => {
      const i = Number(box.dataset.companion);
      if (box.checked) selected.add(i); else selected.delete(i);
      refreshLimitState();
    });
  });
  refreshLimitState();

  confirmBtn.onclick = () => {
    if (confirmBtn.disabled) return;
    const keys = companions.filter((c, i) => selected.has(i)).map(c => c.key);
    onExport(keys);
    overlay.remove();
  };
}

// === SCRAPE POPUP (On-Demand Openings) ===
// Popup del flujo on-demand. Se abre desde 3 puntos:
//   - listado de Vacantes y de Empresas → options = {}: nombre por autocomplete (sin preselección).
//   - detalle de empresa → options = { company }: empresa preseleccionada, nombre no editable.
// Fases: (A) autocomplete + búsqueda/preview sin persistir; (B) confirmar → persistir (fire-and-forget) + popup de procesamiento.
// options: { company (empresa preseleccionada del catálogo), onConfirm(name, vacancies) }
function openScrapePopup(options) {
  options = options || {};
  var cfg = getOdConfig();
  var windowLabel = cfg.windowDays === 1 ? 'last day' : 'last ' + cfg.windowDays + ' days';
  var onConfirm = options.onConfirm || function () {};

  var preselected = options.company || null;   // disparo desde el detalle de empresa
  var locked = !!preselected;                  // nombre no editable cuando la empresa viene preseleccionada
  var selected = preselected;                  // empresa del catálogo elegida (o null = nombre nuevo)
  var typedName = preselected ? preselected.name : '';
  var preliminary = [];

  var overlay = document.createElement('div');
  overlay.className = 'assign-popup-overlay';
  overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML =
    '<div class="assign-popup" style="width:480px; max-width:92vw;">' +
      '<div class="assign-popup-header">' +
        '<h3 id="scrape-title">Scrape on-demand vacancies</h3>' +
        '<button class="btn btn-ghost btn-sm" onclick="this.closest(\'.assign-popup-overlay\').remove()" style="padding:4px;">&times;</button>' +
      '</div>' +
      '<div class="assign-popup-body" id="scrape-body"></div>' +
      '<div class="assign-popup-footer" id="scrape-footer"></div>' +
    '</div>';
  document.body.appendChild(overlay);
  var body = overlay.querySelector('#scrape-body');
  var footer = overlay.querySelector('#scrape-footer');

  function cancelBtn() {
    return '<button class="btn btn-ghost btn-sm" onclick="this.closest(\'.assign-popup-overlay\').remove()">Cancel</button>';
  }

  // Badge de un portal (LinkedIn/Indeed) con el estilo del design system.
  function portalPill(portal) {
    return portal === 'linkedin'
      ? '<span class="badge" style="background:#0a66c220; color:#5aa2e6; border:1px solid #0a66c250;">LinkedIn</span>'
      : '<span class="badge" style="background:#2557a720; color:#7ba7e6; border:1px solid #2557a750;">Indeed</span>';
  }

  // Contenido de los badges de portal de una empresa según sus URLs guardadas (company.linkedinId / indeedId).
  function portalBadgesInner(c) {
    if (!c) return '';
    var pills = [];
    if (c.linkedinId) pills.push(portalPill('linkedin'));
    if (c.indeedId) pills.push(portalPill('indeed'));
    return pills.length
      ? pills.join('<span style="width:6px; display:inline-block;"></span>')
      : '<span class="text-muted text-sm">No saved portal pages — they will be discovered on search</span>';
  }

  // === Fase A: búsqueda ===
  function renderSearch() {
    document.getElementById('scrape-title').textContent = 'Scrape on-demand vacancies';
    var nameField = locked
      ? '<div style="font-size:16px; font-weight:700; color:var(--text-primary); margin-top:6px;">' + typedName + '</div>' +
        '<div id="scrape-badges" style="margin-top:8px;">' + portalBadgesInner(selected) + '</div>'
      : '<input type="text" class="form-input" id="scrape-name" placeholder="Type the company name…" value="' + typedName + '" autocomplete="off" style="margin-top:6px;">' +
        '<div id="scrape-suggest"></div>' +
        '<div id="scrape-badges" style="margin-top:8px;"></div>';
    body.innerHTML =
      '<div style="font-size:13px; color:var(--text-secondary);">Vacancies published in the ' + windowLabel + ' will be searched (max 10). Nothing is saved until you confirm.</div>' +
      '<div style="margin-top:12px;"><label class="form-label">Company</label>' + nameField + '</div>' +
      '<div id="scrape-result" style="margin-top:14px;"></div>';
    footer.innerHTML = cancelBtn() + '<button class="btn btn-primary btn-sm" id="scrape-search-btn">Search vacancies</button>';
    overlay.querySelector('#scrape-search-btn').onclick = onSearchClick;

    if (locked) {
      renderCooldownState();
    } else {
      var input = overlay.querySelector('#scrape-name');
      input.oninput = function () {
        typedName = input.value.trim();
        selected = null;                       // al editar se descarta la selección previa
        overlay.querySelector('#scrape-badges').innerHTML = '';
        overlay.querySelector('#scrape-result').innerHTML = '';
        renderSuggestions(typedName);
      };
      input.focus();
    }
  }

  // Autocomplete: sugiere empresas del catálogo mientras se teclea.
  function renderSuggestions(q) {
    var box = overlay.querySelector('#scrape-suggest');
    if (!box) return;
    if (!q || q.length < 2) { box.innerHTML = ''; return; }
    var matches = MOCK_COMPANIES.filter(function (c) { return c.name.toLowerCase().indexOf(q.toLowerCase()) !== -1; }).slice(0, 6);
    if (!matches.length) {
      box.innerHTML = '<div class="text-muted text-sm" style="padding:6px 2px;">No catalog matches — "<strong>' + q + '</strong>" will be searched on LinkedIn and Indeed and the company created on confirm.</div>';
      return;
    }
    box.innerHTML = '<div style="border:1px solid var(--border-color); border-radius:var(--radius-md); margin-top:4px; overflow:hidden;">' +
      matches.map(function (c, i) {
        var portals = (c.linkedinId ? 'LinkedIn' : '') + (c.linkedinId && c.indeedId ? ' · ' : '') + (c.indeedId ? 'Indeed' : '');
        return '<div class="scrape-suggest-item" data-idx="' + i + '" style="padding:8px 10px; cursor:pointer; display:flex; justify-content:space-between; gap:8px; align-items:center; border-bottom:1px solid var(--border-color);">' +
          '<span style="font-weight:500;">' + c.name + '</span>' +
          '<span style="font-size:11px; color:var(--text-muted);">' + portals + '</span></div>';
      }).join('') + '</div>';
    Array.prototype.forEach.call(box.querySelectorAll('.scrape-suggest-item'), function (el) {
      el.onmouseover = function () { el.style.background = 'var(--bg-tertiary)'; };
      el.onmouseout = function () { el.style.background = ''; };
      el.onclick = function () { selectCompany(matches[parseInt(el.getAttribute('data-idx'), 10)]); };
    });
  }

  function selectCompany(c) {
    selected = c;
    typedName = c.name;
    var input = overlay.querySelector('#scrape-name');
    if (input) input.value = c.name;
    overlay.querySelector('#scrape-suggest').innerHTML = '';
    overlay.querySelector('#scrape-badges').innerHTML = portalBadgesInner(c);
    renderCooldownState();
  }

  // Bloqueo por cool-down si la empresa seleccionada fue scrapeada dentro de la ventana.
  function renderCooldownState() {
    var resultEl = overlay.querySelector('#scrape-result');
    var searchBtn = overlay.querySelector('#scrape-search-btn');
    if (!resultEl || !searchBtn) return;
    if (!selected) { resultEl.innerHTML = ''; searchBtn.disabled = false; searchBtn.style.opacity = ''; searchBtn.style.cursor = ''; return; }
    var info = getCooldownInfo(selected);
    if (info.blocked) {
      resultEl.innerHTML = '<div style="font-size:13px; color:var(--color-warning-dark);">In cool-down: scraped ' + info.daysSince + ' day(s) ago. Available again in ' + info.eligibleInDays + ' day(s).</div>';
      searchBtn.disabled = true; searchBtn.style.opacity = '.5'; searchBtn.style.cursor = 'not-allowed';
    } else {
      resultEl.innerHTML = info.lastScrapedAt ? '<div class="text-muted text-sm">Last on-demand run ' + info.daysSince + ' day(s) ago.</div>' : '';
      searchBtn.disabled = false; searchBtn.style.opacity = ''; searchBtn.style.cursor = '';
    }
  }

  function onSearchClick() {
    var name = locked ? typedName : (overlay.querySelector('#scrape-name').value || '').trim();
    if (!name) { showToast('Type the company name', 'info'); return; }
    typedName = name;
    if (selected && getCooldownInfo(selected).blocked) return;   // bloqueado por cool-down
    var resultEl = overlay.querySelector('#scrape-result');
    var btn = overlay.querySelector('#scrape-search-btn');
    btn.disabled = true; btn.textContent = 'Searching…';
    var suggest = overlay.querySelector('#scrape-suggest'); if (suggest) suggest.innerHTML = '';
    resultEl.innerHTML = '<div style="font-size:13px; color:var(--text-muted);">Searching for the company and its vacancies on LinkedIn and Indeed…</div>';
    setTimeout(function () { renderPreview(name); }, 900);
  }

  function renderPreview(name) {
    var found = name.toLowerCase().indexOf('zzz') === -1; // mock: nombres con 'zzz' = no encontrada
    if (!found) {
      body.innerHTML = '<div style="font-size:13px; color:var(--color-warning-dark);">Company "' + name + '" not found on LinkedIn or Indeed. Try another name.</div>';
      footer.innerHTML = cancelBtn() + '<button class="btn btn-secondary btn-sm" id="scrape-retry-btn">Search again</button>';
      overlay.querySelector('#scrape-retry-btn').onclick = renderSearch;
      return;
    }
    // Listado preliminar mock (máx. 10). Cada vacante con el portal donde se encontró.
    preliminary = [
      { title: 'Bilingual Customer Service Rep', date: 'hoy', portal: 'linkedin' },
      { title: 'Collections Specialist', date: 'hoy', portal: 'indeed' },
      { title: 'Virtual Assistant', date: 'ayer', portal: 'linkedin' },
      { title: 'Data Entry Specialist', date: 'ayer', portal: 'indeed' },
      { title: 'Technical Support Tier 1', date: '2 days ago', portal: 'linkedin' },
      { title: 'AP / AR Analyst', date: '2 days ago', portal: 'indeed' }
    ].slice(0, 10);
    var rows = preliminary.map(function (v) {
      return '<div style="display:flex; justify-content:space-between; gap:8px; padding:6px 0; border-bottom:1px solid var(--border-color); align-items:center;">' +
        '<span style="font-weight:500;">' + v.title + '</span>' +
        '<span style="display:flex; align-items:center; gap:8px; color:var(--text-muted); font-size:12px;">' + v.date + ' ' + portalPill(v.portal) + '</span></div>';
    }).join('');
    var newTag = selected ? '' : ' <span class="text-muted text-sm">(new — will be created on confirm)</span>';
    body.innerHTML =
      '<div style="font-size:13px; color:var(--color-success-dark);">Company found: <strong>' + name + '</strong>' + newTag + '</div>' +
      '<div style="margin-top:6px; font-size:13px; color:var(--text-secondary);">' + preliminary.length + ' preliminary vacancy(ies) in the ' + windowLabel + ', unsaved (max 10 per run):</div>' +
      '<div style="margin-top:8px; max-height:240px; overflow:auto;">' + rows + '</div>';
    footer.innerHTML = cancelBtn() + '<button class="btn btn-primary btn-sm" id="scrape-confirm-btn">Confirm and save</button>';
    overlay.querySelector('#scrape-confirm-btn').onclick = function () {
      onConfirm(name, preliminary);
      renderProcessing(name);
    };
  }

  // === Fase B: segundo popup de procesamiento ===
  function renderProcessing(name) {
    document.getElementById('scrape-title').textContent = 'Processing';
    body.innerHTML =
      '<div style="display:flex; align-items:center; gap:10px;">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted); animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>' +
        '<span style="font-weight:600; color:var(--text-primary);">Fetching vacancy details</span>' +
      '</div>' +
      '<div style="margin-top:10px; font-size:13px; color:var(--text-secondary);">Vacancy details for <strong>' + name + '</strong> are being scraped and analyzed for remote viability. They will be available in the company&#39;s <strong>Vacancies</strong> tab in a few minutes.</div>';
    footer.innerHTML = '<button class="btn btn-primary btn-sm" id="scrape-accept-btn">OK</button>';
    overlay.querySelector('#scrape-accept-btn').onclick = function () {
      overlay.remove();
      if (selected && selected.id) { window.location.href = 'company-detail.html?id=' + selected.id + '&tab=vacantes'; }
      else { window.location.href = 'prospects.html'; }
    };
  }

  renderSearch();
}

// === CSV EXPORT ===
// Contrato com\u00FAn de los archivos exportados (FSPL-2): UTF-8 con BOM, separados por coma y con salto
// de l\u00EDnea CRLF, para que abran en Excel con las tildes correctas sin limpieza previa. Los valores con
// coma, comilla doble o salto de l\u00EDnea van entrecomillados con las comillas internas duplicadas, y una
// celda sin dato se entrega vac\u00EDa: nunca `null`, `N/A` ni un guion.

// Fecha con hora `AAAA-MM-DD HH:MM`, o solo fecha `AAAA-MM-DD`. Vac\u00EDo si no hay dato.
function csvDate(value, withTime) {
  if (!value) return '';
  const raw = String(value).trim();
  return withTime ? raw.slice(0, 16) : raw.slice(0, 10);
}

// Nombre del archivo: <entidad>_<inicio>_<fin>.csv con los extremos del rango de fecha de detecci\u00F3n
// cuando hay rango aplicado, y <entidad>_<AAAA-MM-DD>.csv con la fecha de generaci\u00F3n cuando no lo hay.
function exportFilename(entity, from, to) {
  const today = new Date().toISOString().slice(0, 10);
  if (from || to) return `${entity}_${from || today}_${to || today}.csv`;
  return `${entity}_${today}.csv`;
}

// Orden de las filas: fecha de detecci\u00F3n descendente y, a igual fecha, nombre de empresa ascendente.
function sortForExport(rows, detectedKey, companyKey) {
  return rows.slice().sort((a, b) => {
    const da = String(a[detectedKey] || ''), db = String(b[detectedKey] || '');
    if (da !== db) return db.localeCompare(da);
    return String(a[companyKey] || '').localeCompare(String(b[companyKey] || ''));
  });
}

function csvCell(value) {
  if (value === null || value === undefined) return '';
  const val = String(value).replace(/"/g, '""');
  return /[",\n\r]/.test(val) ? `"${val}"` : val;
}

// `headers` fija el set y el orden de columnas, y permite entregar el archivo con su fila de
// encabezados aunque el recorte no devuelva ninguna fila. UTF-8 con BOM y saltos CRLF.
function buildCSVText(rows, headers) {
  const cols = headers || (rows.length ? Object.keys(rows[0]) : []);
  const lines = [cols.map(csvCell).join(',')];
  rows.forEach(r => lines.push(cols.map(h => csvCell(r[h])).join(',')));
  return '\uFEFF' + lines.join('\r\n') + '\r\n';
}

function downloadBlob(blob, filename) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// === EMPAQUETADO DE LA DESCARGA ===
// Una exportación de un solo archivo se entrega como CSV directo; una de dos o tres, en un ZIP
// único con los CSV adentro, cada uno con su nombre de la convención. El ZIP se arma sin comprimir
// (método `store`), que es suficiente para entregar un paquete válido sin dependencias externas.

function crc32(bytes) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c >>> 0;
    }
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) crc = (crc >>> 8) ^ table[(crc ^ bytes[i]) & 0xFF];
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function zipStore(files) {   // files: [{ name, text }]
  const enc = new TextEncoder();
  const parts = [], central = [];
  let offset = 0;

  files.forEach(f => {
    const nameBytes = enc.encode(f.name);
    const data = enc.encode(f.text);
    const crc = crc32(data);

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);   // local file header
    local.setUint16(4, 20, true);           // version needed
    local.setUint16(6, 0x0800, true);       // nombre en UTF-8
    local.setUint16(8, 0, true);            // método: store
    local.setUint16(12, 0x0021, true);      // fecha DOS válida (1980-01-01)
    local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, nameBytes.length, true);
    parts.push(new Uint8Array(local.buffer), nameBytes, data);

    const dir = new DataView(new ArrayBuffer(46));
    dir.setUint32(0, 0x02014b50, true);     // central directory header
    dir.setUint16(4, 20, true);
    dir.setUint16(6, 20, true);
    dir.setUint16(8, 0x0800, true);
    dir.setUint16(10, 0, true);
    dir.setUint16(14, 0x0021, true);
    dir.setUint32(16, crc, true);
    dir.setUint32(20, data.length, true);
    dir.setUint32(24, data.length, true);
    dir.setUint16(28, nameBytes.length, true);
    dir.setUint32(42, offset, true);
    central.push(new Uint8Array(dir.buffer), nameBytes);

    offset += 30 + nameBytes.length + data.length;
  });

  const centralSize = central.reduce((n, c) => n + c.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);       // end of central directory
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);

  return new Blob(parts.concat(central, [new Uint8Array(end.buffer)]), { type: 'application/zip' });
}

// files: [{ entity, rows, columns }] — el primero es el de la entidad del listado.
function deliverExport(files, from, to) {
  const csvFiles = files.map(f => ({
    name: exportFilename(f.entity, from, to),
    text: buildCSVText(f.rows, f.columns)
  }));

  if (csvFiles.length === 1) {
    downloadBlob(new Blob([csvFiles[0].text], { type: 'text/csv;charset=utf-8;' }), csvFiles[0].name);
    showToast(`Exported: ${csvFiles[0].name}`);
    return;
  }

  const zipName = exportFilename('exportacion', from, to).replace(/\.csv$/, '.zip');
  downloadBlob(zipStore(csvFiles), zipName);
  showToast(`Exported: ${zipName} — ${csvFiles.map(f => f.name).join(', ')}`);
}

// === COMPOSICIÓN DE LOS ARCHIVOS EXPORTADOS (HUSPL-2.1 / HUSPL-2.2) ===
// Dos archivos: posiciones y prospectos. Cada uno se basta solo — el de posiciones lleva los correos
// de los decisores de la empresa y el de prospectos, los cargos que esa empresa tiene publicados —
// así nadie tiene que cruzar dos planillas por ID para poder escribir. Lo accionable va primero y el
// contexto después. Los encabezados son contrato y van en español, como los nombra la HU.
// Ningún archivo incluye quién exportó ni cuándo: eso vive en el listado, no en el archivo.

// El motor rediseñado agrega lo que decide por cada registro —puntaje y señales de la empresa,
// posición del catálogo y veredicto de viabilidad de la vacante—: sin eso, quien recibe el archivo
// no ve por qué ese lead está ahí y tiene que volver a la plataforma a mirarlo.
const EXPORT_COLUMNS_COMPANIES = [
  'Empresa', 'Posiciones detectadas', 'Puntaje ICP', 'Señales', 'Industria', 'Ubicación', 'Sitio web',
  'LinkedIn de la empresa', 'Indeed de la empresa',
  'Comercial asignado', 'SDR asignado', 'Coordinador/supervisor asignado', 'Relación', 'Etapa del embudo',
  'Última vez contactada', 'Detectada', 'Investigada', 'Tamaño', 'ID de empresa', 'Pitch de venta'
];

const EXPORT_COLUMNS_VACANCIES = [
  'Empresa', 'Cargo', 'Posición del catálogo', 'Correos de decisores', 'Ubicación', 'Modalidad', 'Enlace al aviso',
  'Comercial asignado', 'SDR asignado', 'Coordinador/supervisor asignado', 'Estado comercial',
  'Viable en remoto', 'Confianza', 'Última vez contactada', 'Detectada', 'Seniority', 'Departamento',
  'Skills', 'Idiomas', 'Rango salarial', 'Publicada', 'Fuente', 'Pipeline de origen',
  'Puntaje ICP', 'Industria', 'Tamaño', 'Sitio web',
  'LinkedIn de la empresa', 'Indeed de la empresa', 'Relación', 'Etapa del embudo', 'ID de empresa'
];

// Bloque de contexto de la empresa, compartido por los tres archivos. Una empresa todavía sin
// investigar deja vacías industria, tamaño, sitio web, LinkedIn, Indeed, investigada y pitch,
// y la fila se entrega igual: el ID de empresa se entrega siempre.
function companyContextCells(company) {
  return {
    'Industria': company ? getIndustryLabel(company.industryCode) : '',
    'Tamaño': company && company.sizeEmployees ? company.sizeEmployees : '',
    'Ubicación': company ? company.location : '',
    'Sitio web': company ? company.website : '',
    'LinkedIn de la empresa': companyLinkedinUrl(company),
    'Indeed de la empresa': companyIndeedUrl(company),
    'Relación': company ? company.type : '',
    'Etapa del embudo': company ? company.pipelineStage : '',
    'Investigada': company ? csvDate(company.researchedAt) : '',
    'Última vez contactada': company ? csvDate(company.lastContactedAt, true) : '',
    'Pitch de venta': company ? company.salesPitch : '',
    // Una empresa sin calificar deja la celda vacía: el puntaje falta, no es cero.
    'Puntaje ICP': company && company.icpScore !== null && company.icpScore !== undefined ? Math.round(company.icpScore) : '',
    'Señales': company ? (company.leadSignals || []).map(leadSignalLabel).join(' | ') : ''
  };
}

// Emails del staff asignado en cada slot. El slot sin asignar deja su celda vacía.
function assignmentCells(record) {
  return {
    'Comercial asignado': staffEmail(record.comercialId),
    'SDR asignado': staffEmail(record.sdrId),
    'Coordinador/supervisor asignado': staffEmail(record.coordinatorId)
  };
}

function buildCompanyExportRows(companies) {
  const rows = companies.map(c => {
    const ctx = companyContextCells(c);
    return Object.assign({}, assignmentCells(c), {
      'Empresa': c.name,
      'Posiciones detectadas': companyPositionTitles(c.id),
      'Puntaje ICP': ctx['Puntaje ICP'],
      'Señales': ctx['Señales'],
      'Industria': ctx['Industria'],
      'Ubicación': ctx['Ubicación'],
      'Sitio web': ctx['Sitio web'],
      'LinkedIn de la empresa': ctx['LinkedIn de la empresa'],
      'Indeed de la empresa': ctx['Indeed de la empresa'],
      'Relación': ctx['Relación'],
      'Etapa del embudo': ctx['Etapa del embudo'],
      'Última vez contactada': ctx['Última vez contactada'],
      'Detectada': csvDate(c.createdAt),
      'Investigada': ctx['Investigada'],
      'Tamaño': ctx['Tamaño'],
      'ID de empresa': c.id,
      'Pitch de venta': ctx['Pitch de venta']
    });
  });
  return sortForExport(rows, 'Detectada', 'Empresa');
}

// Los correos de los decisores de una empresa, en una celda lista para pegar en el cliente de
// correo: separados por punto y coma y sin repetir. Solo entran los contactos que califican como
// decisores (tienen rol y nivel); una empresa sin decisores deja la celda vacía.
function decisionMakerEmails(companyId) {
  const seen = [];
  getContactsForCompany(companyId).forEach(function (ct) {
    if (!ct.roleCode || !ct.decisionLevel || !ct.email) return;
    if (seen.indexOf(ct.email) === -1) seen.push(ct.email);
  });
  return seen.join('; ');
}

// Los cargos que la empresa tiene publicados, en una celda. Se separan con barra porque un cargo
// puede llevar coma adentro. Se repiten tal cual: dos avisos del mismo cargo son dos publicaciones.
function companyPositionTitles(companyId) {
  return companyVacancies(companyId).map(function (v) { return v.title; }).join(' | ');
}

// Una vacante cuya empresa esté borrada lógicamente se entrega igual, con las columnas de empresa
// vacías y el ID de empresa informado.
function buildVacancyExportRows(vacancies) {
  const rows = vacancies.map(v => {
    const company = MOCK_COMPANIES.find(c => c.id === v.companyId) || null;
    const ctx = companyContextCells(company);
    // El archivo de vacantes no lleva investigada ni pitch de venta: se toma del contexto de
    // empresa solo lo que su tabla de columnas nombra.
    return Object.assign({}, assignmentCells(v), {
      'Empresa': company ? company.name : '',
      'Cargo': v.title,
      // La posición del catálogo es con lo que el barrido la encontró; las vacantes de otros
      // pipelines no tienen ninguna y dejan la celda vacía.
      'Posición del catálogo': v.positionId ? getPositionName(v.positionId) : '',
      'Correos de decisores': decisionMakerEmails(v.companyId),
      'Ubicación': v.location,
      // Modalidad, seniority, portal y pipeline se entregan con su etiqueta, como Industria:
      // la celda la lee una persona. Relación y Etapa del embudo sí van crudas, por contrato.
      'Modalidad': modalityLabel(v.workModality),
      'Enlace al aviso': v.jobUrl,
      'Coordinador/supervisor asignado': staffEmail(company ? company.coordinatorId : null),
      'Estado comercial': v.status,
      // El veredicto del clasificador y su certeza. Una vacante anterior al clasificador deja
      // las dos celdas vacías, que no es lo mismo que "no viable".
      'Viable en remoto': v.remoteViable === true ? 'sí' : v.remoteViable === false ? 'no' : '',
      'Confianza': v.aiConfidence === null || v.aiConfidence === undefined ? '' : Math.round(v.aiConfidence * 100) + '%',
      'Última vez contactada': ctx['Última vez contactada'],
      'Detectada': csvDate(v.detectedAt),
      'Seniority': seniorityLabel(v.seniorityLevel),
      'Departamento': v.department,
      'Skills': v.skills,
      'Idiomas': (v.languages || []).join(' | '),
      // El salario anual en USD que persiste el análisis; las vacantes anteriores solo tienen
      // el texto del portal en salary_range y se entrega ese.
      'Rango salarial': salaryLabel(v) || v.salary || '',
      'Publicada': csvDate(v.publishedDate),
      'Fuente': portalLabel(v.sourcePortal),
      'Pipeline de origen': sourceProjectLabel(v.source),
      'Puntaje ICP': ctx['Puntaje ICP'],
      'Industria': ctx['Industria'],
      'Tamaño': ctx['Tamaño'],
      'Sitio web': ctx['Sitio web'],
      'LinkedIn de la empresa': ctx['LinkedIn de la empresa'],
      'Indeed de la empresa': ctx['Indeed de la empresa'],
      'Relación': ctx['Relación'],
      'Etapa del embudo': ctx['Etapa del embudo'],
      'ID de empresa': v.companyId
    });
  });
  return sortForExport(rows, 'Detectada', 'Empresa');
}

/* ============================================================================
   RELEASE 3 — Open Positions
   Catálogos y campos que introduce la épica Ajustes Prospect Engine. El listado
   deja de mostrar lo que el barrido encontró por geografía y pasa a mostrar lo
   que el motor calificó: la vacante trae la posición del catálogo que la buscó
   y el veredicto de viabilidad remota, la empresa su puntaje de ajuste al ICP
   con las señales que lo sostienen, y el contacto su código de rol y su nivel
   de decisión. Contrato: FPEA-0 (esquema), FPEA-1 (calificación), FPEA-2
   (contactos).
   ============================================================================ */

// === ESTADOS DE ESTADOS UNIDOS ===
// Alimenta el buscador de ubicación. `company.state_code` y `vacancies.state_code`
// resuelven contra `code`; el buscador acepta escribir el nombre o la sigla.
const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
];

// === MARCAS DE TIEMPO ===
// Todas las fechas sembradas se leen y se escriben en el mismo marco. Mezclar
// `new Date('2026-09-14 11:40')` —que parsea en hora local— con `toISOString()`
// —que devuelve UTC— corría las marcas por el desfase del huso y desordenaba
// pasos que sí ocurrieron en orden.
function parseStamp(value) {
  if (value instanceof Date) return value;
  let s = String(value).trim().replace(' ', 'T');
  if (s.length <= 10) s += 'T00:00:00Z';
  else if (s.indexOf('Z') === -1) s += (s.length === 16 ? ':00Z' : 'Z');
  return new Date(s);
}

function formatStamp(value) {
  return parseStamp(value).toISOString().slice(0, 16).replace('T', ' ');
}

function stateName(code) {
  const s = US_STATES.find(function (x) { return x.code === code; });
  return s ? s.name : (code || '');
}

// === CATÁLOGO DE POSICIONES (public.positions_catalog · HUPEA-0.1 / 0.4) ===
// Las 21 posiciones del ICP con sus 54 términos, tal como los carga el seed.
// Una vacante guarda `position_id` y el `search_text` que la encontró; las que
// detectó el barrido anterior por geografía no tienen ninguno de los dos.
const POSITIONS_CATALOG = [
  { id: 'pos-01', name: 'Accounting & Finance', terms: ['accounting clerk', 'accounts payable specialist', 'accounts receivable specialist', 'bookkeeper', 'staff accountant'], isActive: true },
  { id: 'pos-02', name: 'Administrative & Executive Assistant', terms: ['executive assistant'], isActive: true },
  { id: 'pos-03', name: 'Construction Estimating & Support', terms: ['estimator'], isActive: true },
  { id: 'pos-04', name: 'Customer Service & Intake', terms: ['bilingual customer service representative', 'collections specialist', 'customer service representative', 'intake specialist'], isActive: true },
  { id: 'pos-05', name: 'Data & Analytics', terms: ['data analyst'], isActive: true },
  { id: 'pos-06', name: 'Data Entry & Back Office', terms: ['data entry clerk'], isActive: true },
  { id: 'pos-07', name: 'E-commerce Support', terms: ['ecommerce customer support', 'order processing specialist'], isActive: true },
  { id: 'pos-08', name: 'Engineering & Technical Design', terms: ['drafter'], isActive: true },
  { id: 'pos-09', name: 'HR & Recruiting', terms: ['hr coordinator', 'payroll specialist', 'recruiter', 'recruiting coordinator'], isActive: true },
  { id: 'pos-10', name: 'Healthcare Administrative Support', terms: ['scheduling coordinator', 'staffing coordinator'], isActive: true },
  { id: 'pos-11', name: 'IT Support', terms: ['help desk technician', 'it support specialist'], isActive: true },
  { id: 'pos-12', name: 'Inside Sales & Business Development', terms: ['appointment setter', 'business development representative', 'inside sales representative', 'sales development representative'], isActive: true },
  { id: 'pos-13', name: 'Insurance & Benefits Operations', terms: ['claims processor', 'insurance account manager', 'insurance customer service representative', 'policy processor'], isActive: true },
  { id: 'pos-14', name: 'Legal Support', terms: ['legal assistant', 'legal intake specialist', 'medical records clerk', 'paralegal'], isActive: true },
  { id: 'pos-15', name: 'Logistics & Supply Chain Support', terms: ['carrier sales representative', 'dispatcher', 'freight billing specialist', 'logistics coordinator'], isActive: true },
  { id: 'pos-16', name: 'Marketing & Content', terms: ['content writer', 'marketing coordinator', 'social media coordinator'], isActive: true },
  { id: 'pos-17', name: 'Medical Billing & RCM', terms: ['medical biller', 'medical coder', 'prior authorization specialist', 'revenue cycle specialist'], isActive: true },
  { id: 'pos-18', name: 'Mortgage Processing', terms: ['loan processor', 'mortgage loan processor'], isActive: true },
  { id: 'pos-19', name: 'Project Management & PMO', terms: ['project coordinator'], isActive: true },
  { id: 'pos-20', name: 'Property Management Coordination', terms: ['leasing coordinator', 'property management assistant'], isActive: true },
  { id: 'pos-21', name: 'Software Development', terms: ['.net developer', 'qa engineer'], isActive: true }
];

function getPositionName(positionId) {
  const p = POSITIONS_CATALOG.find(function (x) { return x.id === positionId; });
  return p ? p.name : '';
}

// === SEÑALES DE LEAD (company.lead_signals · FPEA-1) ===
// Vocabulario cerrado que devuelve la calificación. Las dos últimas descalifican:
// cuando aparecen, la empresa queda excluida y no se trabaja.
const LEAD_SIGNALS = [
  { code: 'repeated_posting', label: 'Repeated posting' },
  { code: 'multiple_openings', label: 'Multiple openings' },
  { code: 'urgent_hiring', label: 'Urgent hiring' },
  { code: 'growth', label: 'Growth' },
  { code: 'recent_acquisition', label: 'Recent acquisition' },
  { code: 'recent_funding', label: 'Recent funding' },
  { code: 'new_location', label: 'New location' },
  { code: 'spanish_speaking_market', label: 'Spanish-speaking market' },
  { code: 'ai_adoption', label: 'AI adoption' },
  { code: 'founder_led', label: 'Founder-led' },
  { code: 'size_fit', label: 'Size fit' },
  { code: 'staffing_agency', label: 'Staffing agency', disqualifying: true },
  { code: 'government_entity', label: 'Government entity', disqualifying: true }
];

function leadSignalLabel(code) {
  const s = LEAD_SIGNALS.find(function (x) { return x.code === code; });
  return s ? s.label : code;
}

// === PUNTAJE DE AJUSTE AL ICP (company.icp_score · FPEA-1) ===
// La calificación entrega un entero de 0 a 100 y su propio criterio de aceptación
// lo lee por tercios, así que la plataforma lo muestra igual. Una empresa sin
// `qualified_at` no tiene puntaje todavía: el dato falta, no es un cero.
function icpTier(company) {
  if (!company) return 'pending';
  if (company.isExcluded) return 'excluded';
  if (company.icpScore === null || company.icpScore === undefined) return 'pending';
  if (company.icpScore >= 67) return 'strong';
  if (company.icpScore >= 34) return 'moderate';
  return 'weak';
}

// === DEPARTAMENTO Y SENIORITY DEL CONTACTO (company_contacts · FPEA-2) ===
// Las dos columnas son TEXT en la base, pero el valor es cerrado: `seniority_level` guarda la
// seniority tal como la reporta Apollo y `department`, su área. La plataforma ofrece el mismo
// vocabulario para que lo que carga una persona y lo que escribe el motor sean comparables.
const CONTACT_DEPARTMENTS = [
  { code: 'executive', label: 'Executive' },
  { code: 'operations', label: 'Operations' },
  { code: 'finance', label: 'Finance' },
  { code: 'sales', label: 'Sales' },
  { code: 'marketing', label: 'Marketing' },
  { code: 'hr', label: 'HR' },
  { code: 'it', label: 'IT' },
  { code: 'legal', label: 'Legal' },
  { code: 'customer_service', label: 'Customer Service' },
  { code: 'other', label: 'Other' }
];

const CONTACT_SENIORITIES = [
  { code: 'owner', label: 'Owner' },
  { code: 'founder', label: 'Founder' },
  { code: 'c_suite', label: 'C-Suite' },
  { code: 'partner', label: 'Partner' },
  { code: 'vp', label: 'VP' },
  { code: 'head', label: 'Head' },
  { code: 'director', label: 'Director' },
  { code: 'manager', label: 'Manager' },
  { code: 'senior', label: 'Senior' },
  { code: 'entry', label: 'Entry' }
];

function departmentLabel(code) {
  const d = CONTACT_DEPARTMENTS.find(function (x) { return x.code === code; });
  return d ? d.label : (code || '');
}

function contactSeniorityLabel(code) {
  const x = CONTACT_SENIORITIES.find(function (y) { return y.code === code; });
  return x ? x.label : (code || '');
}

// === CÓDIGOS DE ROL Y NIVEL DE DECISIÓN (company_contacts · FPEA-2) ===
// El análisis de perfil normaliza el cargo a uno de estos códigos y de ahí,
// cruzado con la banda de tamaño de la empresa, sale el nivel de decisión.
const ROLE_CODES = [
  { code: 'ceo', label: 'CEO' },
  { code: 'president', label: 'President' },
  { code: 'chairman', label: 'Chairman' },
  { code: 'cfo', label: 'CFO' },
  { code: 'cro', label: 'CRO' },
  { code: 'vp_sales', label: 'VP Sales' },
  { code: 'owner_founder', label: 'Owner / Founder' },
  { code: 'coo', label: 'COO' },
  { code: 'vp_operations', label: 'VP Operations' },
  { code: 'director_operations', label: 'Director of Operations' },
  { code: 'managing_director', label: 'Managing Director' },
  { code: 'executive_director', label: 'Executive Director' }
];

// Redacciones que son la expansión literal del código de rol. Un cargo que cae acá
// repite lo que ya dice el rol normalizado; uno que no —"President & CEO",
// "Owner / COO"— muestra qué resolvió el clasificador y vale mostrarlo.
const ROLE_CANONICAL = {
  ceo: ['ceo', 'chief executive officer'],
  president: ['president'],
  chairman: ['chairman', 'chairwoman', 'chairperson', 'board chair'],
  cfo: ['cfo', 'chief financial officer'],
  cro: ['cro', 'chief revenue officer'],
  vp_sales: ['vp sales', 'vp of sales', 'vice president of sales', 'svp sales', 'evp sales'],
  owner_founder: ['owner', 'founder', 'co-founder'],
  coo: ['coo', 'chief operating officer', 'chief operations officer'],
  vp_operations: ['vp operations', 'vp of operations', 'vice president of operations'],
  director_operations: ['director of operations', 'operations director'],
  managing_director: ['managing director', 'managing partner'],
  executive_director: ['executive director']
};

// Normaliza un cargo escrito a mano al código de rol, con las mismas reglas que el
// análisis de perfil: coincide por significado, un cargo que combina varios toma el
// más alto de la lista, y lo que no está en el catálogo no califica.
const ROLE_PATTERNS = [
  { code: 'ceo', re: /chief executive|\bceo\b/i },
  { code: 'president', re: /\bpresident\b/i, not: /vice|assistant|deputy|associate/i },
  { code: 'chairman', re: /chair(man|woman|person)?\b|board chair/i, not: /vice/i },
  { code: 'cfo', re: /chief financial|\bcfo\b/i },
  { code: 'cro', re: /chief revenue|\bcro\b/i },
  { code: 'vp_sales', re: /(vice president|\bvp\b|\bsvp\b|\bevp\b)[^,]*\bsales\b/i },
  { code: 'owner_founder', re: /\bowner\b|\bco-?founder\b|\bfounder\b/i },
  { code: 'coo', re: /chief operat(ing|ions)|\bcoo\b/i },
  { code: 'vp_operations', re: /(vice president|\bvp\b)[^,]*\boperations\b/i },
  { code: 'director_operations', re: /director of operations|operations director/i },
  { code: 'managing_director', re: /managing (director|partner)/i },
  { code: 'executive_director', re: /executive director/i }
];

// Cargos que nunca califican, aunque contengan una palabra del catálogo.
const ROLE_DISQUALIFIERS = /assistant|chief of staff|advisor|adviser|consultant|secretar|former|retired|interim/i;

function normalizeRoleCode(title) {
  const t = String(title || '').trim();
  if (!t || ROLE_DISQUALIFIERS.test(t)) return null;
  const hit = ROLE_PATTERNS.find(function (r) { return r.re.test(t) && !(r.not && r.not.test(t)); });
  return hit ? hit.code : null;
}

function rawPositionAddsInfo(contact) {
  const raw = String((contact && contact.position) || '').trim().toLowerCase();
  if (!raw) return false;
  return (ROLE_CANONICAL[contact.roleCode] || []).indexOf(raw) === -1;
}

function roleCodeLabel(code) {
  const r = ROLE_CODES.find(function (x) { return x.code === code; });
  return r ? r.label : (code || '');
}

// Banda de tamaño con que la derivación del nivel lee a la empresa.
function companySizeBand(company) {
  const n = company && Number(company.sizeEmployees);
  if (!n || !isFinite(n) || n < 1) return 'unknown';
  if (n >= 20 && n <= 300) return 'high';
  if (n > 1000) return 'low';
  return 'medium';
}

// Tabla de derivación de FPEA-2. `null` es "no califica": esa persona no se guarda.
const DECISION_LEVEL_TABLE = {
  ceo:                 { high: 1, medium: 1, unknown: 1, low: 1 },
  president:           { high: 1, medium: 1, unknown: 1, low: 1 },
  chairman:            { high: 1, medium: 1, unknown: 1, low: 1 },
  cfo:                 { high: 1, medium: 1, unknown: 1, low: 1 },
  cro:                 { high: 1, medium: 1, unknown: 1, low: 1 },
  vp_sales:            { high: 1, medium: 1, unknown: 1, low: 1 },
  owner_founder:       { high: 1, medium: 2, unknown: 2, low: 2 },
  coo:                 { high: 1, medium: 2, unknown: 2, low: 2 },
  vp_operations:       { high: 1, medium: 2, unknown: 2, low: null },
  director_operations: { high: 1, medium: 2, unknown: 2, low: null },
  managing_director:   { high: 2, medium: 2, unknown: 2, low: 2 },
  executive_director:  { high: 2, medium: 2, unknown: 2, low: 2 }
};

function decisionLevelFor(roleCode, company) {
  const row = DECISION_LEVEL_TABLE[roleCode];
  if (!row) return null;
  const level = row[companySizeBand(company)];
  return level === undefined ? null : level;
}

// === VERIFICACIÓN DEL EMAIL (company_contacts.email_verification · FPEA-2) ===
// `short` es la marca que se muestra al lado de la dirección. Es nula en `valid`
// porque ese es el caso esperado y anunciarlo solo agrega ruido: la ficha se calla
// cuando todo está bien y habla cuando hay un pero.
const EMAIL_VERIFICATION = {
  valid: {
    label: 'Verified email', tone: 'success', short: null,
    note: 'Hunter verified the address exists.'
  },
  accept_all: {
    label: 'Catch-all domain', tone: 'warning', short: 'Catch-all',
    note: 'The domain accepts every address, so it cannot be verified. The send cycle still writes to it.'
  },
  risky: {
    label: 'Risky email', tone: 'error', short: 'Risky',
    note: 'The send cycle will not write to this address. Reaching this person takes a manual email or a call.'
  },
  unknown: {
    label: 'Unverified email', tone: 'neutral', short: 'Unverified',
    note: 'Hunter could not verify the address. The send cycle will not write to it.'
  }
};

// === PORTAL Y PIPELINE DE ORIGEN ===
// `vacancies.source` es el portal (indeed | linkedin | website | manual) y
// `vacancies.source_project` el pipeline que la detectó. Los dos se guardan con el
// valor de la base y se muestran con su etiqueta.
const PORTAL_LABELS = { indeed: 'Indeed', linkedin: 'LinkedIn', website: 'Website', manual: 'Manual' };

function portalLabel(value) {
  return PORTAL_LABELS[String(value || '').toLowerCase()] || value || '';
}

// Pipelines que escriben en `public.vacancies`. `prospect_engine` es el barrido por
// posición del ICP que introduce la épica Ajustes Prospect Engine (HUPEA-1.5).
const SOURCE_PROJECT_LABELS = {
  'prospect_engine': 'Prospect Engine',
  'general-us-openings': 'US General Openings',
  'current-client-us-openings': 'Current Client Openings',
  'on_demand_openings': 'On-Demand Openings'
};

function sourceProjectLabel(value) {
  return SOURCE_PROJECT_LABELS[value] || value || '';
}

// === SENIORITY ===
// El análisis devuelve entry | mid | senior | lead | executive | unspecified
// (HUPEA-1.4); las vacantes anteriores quedaron normalizadas al mismo vocabulario.
const SENIORITY_LEVELS = [
  { value: 'entry', label: 'Entry' }, { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' }, { value: 'lead', label: 'Lead' },
  { value: 'executive', label: 'Executive' }, { value: 'unspecified', label: 'Unspecified' }
];

function seniorityLabel(value) {
  const hit = SENIORITY_LEVELS.find(function (x) { return x.value === String(value || '').toLowerCase(); });
  return hit ? hit.label : (value || '');
}

// === MODALIDAD ===
// El análisis persiste `work_modality` en minúsculas; los registros del barrido
// anterior lo guardaron con la redacción del portal. Se muestran igual.
// `unknown` es un valor del análisis, no un dato faltante: el aviso no dice cómo se trabaja.
function modalityLabel(value) {
  const map = { onsite: 'On-site', 'on-site': 'On-site', hybrid: 'Hybrid', remote: 'Remote', unknown: 'Not stated' };
  return map[String(value || '').toLowerCase()] || value || '';
}

// === SEÑALES DEL AVISO (vacancies.ai_signals · HUPEA-1.4) ===
// Vocabulario cerrado que el análisis etiqueta sobre la descripción. Es lo que el
// correo usa como gancho (FPEA-3) y lo que distingue dos avisos del mismo puesto.
const VACANCY_SIGNALS = [
  { code: 'urgent_hire', label: 'Urgent hire', tone: 'hot' },
  { code: 'multiple_openings', label: 'Multiple openings', tone: 'hot' },
  { code: 'shift_work', label: 'Shift work' },
  { code: 'client_facing', label: 'Client facing' },
  { code: 'back_office', label: 'Back office' },
  { code: 'supports_licensed_role', label: 'Supports a licensed role' },
  { code: 'competitive_pay', label: 'Competitive pay' },
  { code: 'company_growing', label: 'Company growing', tone: 'hot' },
  { code: 'us_work_authorization', label: 'US work authorization', tone: 'caution' },
  { code: 'no_visa_sponsorship', label: 'No visa sponsorship', tone: 'caution' },
  { code: 'state_restricted', label: 'State restricted', tone: 'caution' }
];

function vacancySignalLabel(code) {
  const s = VACANCY_SIGNALS.find(function (x) { return x.code === code; });
  return s ? s.label : code;
}

function vacancySignalTone(code) {
  const s = VACANCY_SIGNALS.find(function (x) { return x.code === code; });
  return (s && s.tone) || 'plain';
}

// Salario anual en USD, como lo persiste el análisis. Sin dato no se inventa nada.
function salaryLabel(vacancy) {
  const min = vacancy && vacancy.salaryMinUsd;
  const max = vacancy && vacancy.salaryMaxUsd;
  if (!min && !max) return '';
  function k(n) { return '$' + (Math.round(n / 100) / 10).toFixed(1).replace(/\.0$/, '') + 'K'; }
  if (min && max) return k(min) + '–' + k(max) + '/yr';
  return k(min || max) + '/yr';
}

/* ---- Calificación de las empresas (FPEA-1) ------------------------------- */
// Cada empresa investigada queda con su puntaje, sus señales y su resumen de lead.
// Harbor Point nunca pasó por investigación: sin `qualified_at` no tiene puntaje.
(function seedQualification() {
  const q = {
    'comp-001': { stateCode: 'FL', icpScore: 68, leadSignals: ['repeated_posting', 'multiple_openings', 'ai_adoption'], leadSummary: 'Mid-size Florida software firm running its own support desk. Posts the same back-office and helpdesk roles every quarter and has started automating tier-1 tickets, leaving exception handling to people. Already a client; expanding coverage into finance operations.' },
    'comp-002': { stateCode: 'NY', icpScore: 54, leadSignals: ['multiple_openings', 'spanish_speaking_market', 'new_location'], leadSummary: 'Clinic network opening sites across the boroughs, hiring billing and prior-authorization staff in volume. Large patient base requires Spanish. Over 1,000 employees, so an internal recruiting function already exists.' },
    'comp-003': { stateCode: 'IL', icpScore: 76, leadSignals: ['repeated_posting', 'growth', 'founder_led'], leadSummary: 'Founder-run advisory firm scaling its back office. Has reposted accounting and legal-support roles three times this quarter without filling them, and is adding a second office.' },
    'comp-004': { stateCode: 'TX', icpScore: 84, leadSignals: ['size_fit', 'recent_funding', 'urgent_hiring', 'founder_led'], leadSummary: 'Series A analytics startup, 85 people, no internal recruiting. Hiring sales development and recruiting coordination at once after a funding round, with postings marked immediate start.' },
    'comp-005': { stateCode: 'TX', icpScore: 41, leadSignals: ['repeated_posting'], leadSummary: 'Regional carrier with steady dispatch and billing demand. Most roles are tied to the terminal and cannot be covered remotely, which caps the opportunity to the billing side.' },
    'comp-006': { stateCode: 'WA', icpScore: 47, leadSignals: ['multiple_openings', 'ai_adoption'], leadSummary: 'Established manufacturing client with shared-services demand. Over 2,000 employees and a staffed HR function, so the fit rests on specific back-office overflow rather than volume hiring.' },
    'comp-007': { stateCode: 'MA', icpScore: 58, leadSignals: ['size_fit', 'spanish_speaking_market'], leadSummary: 'Charter network of 14 schools with seasonal admissions peaks and a largely Spanish-speaking family base. Right size, but hiring is concentrated in a few months of the year.' },
    'comp-008': { stateCode: 'CA', icpScore: 29, leadSignals: ['multiple_openings'], leadSummary: 'National retailer with high-volume seasonal customer care hiring. At 5,400 employees it runs its own recruiting and BPO contracts, which makes displacement unlikely.' },
    'comp-009': { stateCode: 'CA', icpScore: 71, leadSignals: ['size_fit', 'growth', 'ai_adoption'], leadSummary: 'B2B SaaS extending support coverage to US business hours as its account base grows. 210 employees, no offshore presence yet, and already routing tier-1 through automation.' },
    'comp-010': { stateCode: 'PA', icpScore: 33, leadSignals: [], leadSummary: 'Pharmaceutical lab whose open roles are lab- and site-bound. The cycle closed without moving forward; revisit next budget season.' },
    'comp-011': { stateCode: 'FL', icpScore: null, leadSignals: null, leadSummary: null }
  };
  MOCK_COMPANIES.forEach(function (c) {
    const row = q[c.id] || {};
    c.stateCode = row.stateCode || null;
    c.icpScore = row.icpScore !== undefined ? row.icpScore : null;
    c.leadSignals = row.leadSignals || null;
    c.leadSummary = row.leadSummary || null;
    c.isExcluded = false;
    c.exclusionReason = null;
    // La investigación y la calificación ocurren en la misma cadena, al día siguiente
    // de que el barrido creó la empresa: fecharlas antes de `createdAt` sería imposible.
    if (c.icpScore === null) {
      c.researchedAt = null; c.qualifiedAt = null; c.contactsSearchedAt = null;
    } else {
      const day = function (n) { return new Date(new Date(c.createdAt).getTime() + n * 86400000).toISOString().slice(0, 10); };
      c.researchedAt = day(1);
      c.qualifiedAt = day(1);
      // El barrido de contactos corre sobre las empresas calificadas por encima del umbral.
      c.contactsSearchedAt = c.icpScore >= 50 ? day(2) : null;
    }
  });
})();

// Una agencia de staffing compite con Solvo: la calificación la descalifica y queda
// excluida. Es el caso que el listado tiene que mostrar sin ambigüedad.
MOCK_COMPANIES.push({
  id: 'comp-012', name: 'Bridgeway Staffing Partners', industry: 'Staffing & Recruiting', industryCode: 'staffing_recruiting',
  location: 'Atlanta, GA', stateCode: 'GA', website: 'https://bridgewaystaffing.com', linkedinId: 'bridgeway-staffing-partners', indeedId: null,
  sizeEmployees: 180, lastContactedAt: null,
  salesPitch: null, pipelineStage: 'lead', type: 'prospect', remoteViable: true,
  icpScore: 0, leadSignals: ['staffing_agency'], isExcluded: true, exclusionReason: 'staffing_agency',
  leadSummary: 'Regional staffing agency placing administrative and light industrial workers. Competes directly with Solvo; disqualified.',
  contactsSearchedAt: null, comercialId: null, sdrId: null, coordinatorId: null, contactsCount: 0,
  createdAt: new Date(Date.now() - 26 * 86400000).toISOString().slice(0, 10),
  researchedAt: new Date(Date.now() - 25 * 86400000).toISOString().slice(0, 10),
  qualifiedAt: new Date(Date.now() - 25 * 86400000).toISOString().slice(0, 10),
  lastScrapedAt: null,
  linkedinUrl: 'https://www.linkedin.com/company/bridgeway-staffing-partners', indeedUrl: null
});

/* ---- Análisis de perfil de los contactos (FPEA-2) ------------------------ */
// El cargo crudo se normaliza a `role_code` y el nivel sale de la tabla de derivación:
// nunca se escribe a mano, se calcula con la banda de tamaño de la empresa.
MOCK_CONTACTS.push(
  { id: 'ct-009', companyId: 'comp-003', fullName: 'Miguel Santos', position: 'Director of Operations', department: 'operations', seniorityLevel: 'director', email: 'm.santos@finserve.com', phone: null, linkedinUrl: 'https://linkedin.com/in/miguelsantos' },
  { id: 'ct-022', companyId: 'comp-009', fullName: 'Daniel Okafor', position: 'Chief Operating Officer', department: 'operations', seniorityLevel: 'c_suite', email: 'd.okafor@cloudbridge.io', phone: '+1 415-555-0902', linkedinUrl: 'https://linkedin.com/in/danielokafor' }
);

(function seedContactAnalysis() {
  const a = {
    'ct-001': { roleCode: 'ceo', emailVerification: 'valid', interestSignal: 'Posts about scaling the support org into a 24/7 model.' },
    'ct-002': { roleCode: 'vp_sales', emailVerification: 'valid', interestSignal: null },
    'ct-005': { roleCode: 'ceo', emailVerification: 'accept_all', interestSignal: 'Announced two new clinic locations opening this year.' },
    'ct-008': { roleCode: 'cfo', emailVerification: 'valid', interestSignal: null },
    'ct-010': { roleCode: 'ceo', emailVerification: 'valid', interestSignal: 'Founder hiring across sales and recruiting after the raise.' },
    'ct-011': { roleCode: 'coo', emailVerification: 'unknown', interestSignal: null },
    'ct-013': { roleCode: 'ceo', emailVerification: 'valid', interestSignal: null },
    'ct-014': { roleCode: 'vp_sales', emailVerification: 'risky', interestSignal: null },
    'ct-021': { roleCode: 'ceo', emailVerification: 'valid', interestSignal: 'Talks about extending support coverage to US business hours.' },
    'ct-022': { roleCode: 'coo', emailVerification: 'valid', interestSignal: null },
    'ct-023': { roleCode: 'chairman', emailVerification: 'unknown', interestSignal: null }
  };
  MOCK_CONTACTS.forEach(function (ct) {
    const row = a[ct.id];
    const company = MOCK_COMPANIES.find(function (c) { return c.id === ct.companyId; });
    // Sin fila en el mapa el contacto no pasó por el análisis de perfil: los cuatro campos
    // quedan vacíos, que es como están en la base los contactos anteriores a FPEA-2.
    if (!row) {
      ct.roleCode = null; ct.decisionLevel = null; ct.interestSignal = null;
      ct.emailVerification = null; ct.analyzedAt = null;
      return;
    }
    ct.roleCode = row.roleCode || null;
    ct.decisionLevel = decisionLevelFor(ct.roleCode, company);
    ct.interestSignal = row.interestSignal || null;
    ct.emailVerification = row.emailVerification || 'unknown';
    ct.analyzedAt = company ? company.contactsSearchedAt : null;
    // El teléfono se revela solo para nivel 1: a nivel 2 no se pide y por eso no existe.
    if (ct.decisionLevel !== 1) ct.phone = null;
  });
})();

// Contactos guardados que no pasaron por el análisis de perfil: no son decisores, pero siguen
// siendo el único canal de varias empresas. El detalle los muestra aparte.
function getUnanalyzedContacts(companyId) {
  return getContactsForCompany(companyId).filter(function (c) { return !c.roleCode || !c.decisionLevel; });
}

// Decisores de una empresa, agrupados por código de rol: dos personas con el mismo
// rol cuentan como un badge y el título los nombra a los dos. Nivel 1 primero.
function getDecisionMakers(companyId) {
  const out = [];
  getContactsForCompany(companyId).forEach(function (c) {
    if (!c.roleCode || !c.decisionLevel) return;
    const existing = out.find(function (x) { return x.roleCode === c.roleCode; });
    if (existing) existing.people.push(c);
    else out.push({ roleCode: c.roleCode, label: roleCodeLabel(c.roleCode), level: c.decisionLevel, people: [c] });
  });
  return out.sort(function (a, b) { return a.level - b.level; });
}

/* ---- Vacantes detectadas y calificadas (FPEA-1) -------------------------- */
// El listado convive con dos generaciones. Las que trajo el barrido por geografía
// no tienen posición del catálogo ni término de búsqueda, y se muestran sin ellos.
// Las que trae el barrido por posición llevan las dos cosas, más el veredicto de
// viabilidad remota con su confianza y su razón, el salario anual en USD y los
// idiomas que el aviso pide.
// Nota de nombres: en la base `vacancies.source` es el portal; el prototipo conserva
// `source` para el pipeline que la detectó y `sourcePortal` para el portal, porque es
// lo que leen el detalle de vacante y el de empresa.
(function seedLegacyClassification() {
  const legacy = {
    'vac-001': { conf: 0.91, reason: 'Fully remote posting; the work is software delivery that does not require presence.', langs: ['English'] },
    'vac-002': { conf: 0.78, reason: 'Hybrid schedule stated, but the infrastructure work itself is remote-capable.', langs: ['English'] },
    'vac-003': { conf: 0.86, reason: 'Remote posting; discovery and roadmap work done over calls and documents.', langs: ['English'] },
    'vac-004': { conf: 0.74, reason: 'Hybrid, with modelling work that can be done off-site.', langs: ['English'] },
    'vac-006': { conf: 0.93, reason: 'Remote posting; frontend development requires no presence.', langs: ['English'] },
    'vac-007': { conf: 0.31, reason: 'Requires presence at the distribution centre for daily floor coordination.', langs: ['English'] },
    'vac-008': { conf: 0.88, reason: 'Hybrid; test automation runs against systems reachable remotely.', langs: ['English'] },
    'vac-009': { conf: 0.84, reason: 'Remote posting; research sessions run over video.', langs: ['English'] },
    'vac-010': { conf: 0.72, reason: 'Hybrid; campaign work is executed in software.', langs: ['English'] },
    'vac-od-001': { conf: 0.95, reason: 'Remote posting; inbound and outbound support handled by phone and CRM.', langs: ['English', 'Spanish'] },
    'vac-od-002': { conf: 0.9, reason: 'Remote posting; B2B collections run over phone, email and the ERP.', langs: ['English', 'Spanish'] },
    'vac-od-003': { conf: 0.4, reason: 'Already posted as remote, so there is no on-site work to convert.', langs: ['English'] }
  };
  // `salary` venía como texto con miles; el análisis persiste el anual en USD.
  function parseK(text) {
    if (!text) return [null, null];
    const nums = String(text).match(/\d+/g);
    if (!nums) return [null, null];
    const v = nums.map(function (n) { return Number(n) * 1000; });
    return [v[0] || null, v[1] || v[0] || null];
  }
  MOCK_VACANCIES.forEach(function (v) {
    const row = legacy[v.id];
    // Una vacante muy vieja puede no tener veredicto: el clasificador es posterior.
    if (!row) return;
    const s = parseK(v.salary);
    v.salaryMinUsd = s[0];
    v.salaryMaxUsd = s[1];
    v.languages = row.langs;
    v.aiConfidence = row.conf;
    v.aiReasons = [row.reason];
    v.positionId = row.pos || null;
    v.searchText = row.term || null;
  });
})();

// Lo que trae el barrido por posición: cada una asociada a su posición del catálogo
// y al término que la encontró.
MOCK_VACANCIES.push(
  { id: 'vac-011', title: 'Accounts Payable Specialist', companyId: 'comp-001', positionId: 'pos-01', searchText: 'accounts payable specialist', status: 'detected', source: 'prospect_engine', sourcePortal: 'indeed', stateCode: 'FL', location: 'Miami, FL', workModality: 'onsite', jobUrl: 'https://www.indeed.com/viewjob?jk=aa17c3b90e2d5f41', remoteViable: true, aiConfidence: 0.92, aiReasons: ['Invoice processing and reconciliation run entirely in NetSuite; nothing requires presence.'], salaryMinUsd: 47840, salaryMaxUsd: 56160, languages: ['English'], seniorityLevel: 'mid', department: 'Finance', skills: 'NetSuite, Reconciliation, Excel', description: 'Process high-volume vendor invoices and run month-end reconciliation across a 12-entity structure.', comercialId: 'uuid-staff-001', comercialType: 'inherited', sdrId: 'uuid-staff-006', sdrType: 'inherited' },
  { id: 'vac-012', title: 'Help Desk Technician', companyId: 'comp-001', positionId: 'pos-11', searchText: 'help desk technician', status: 'detected', source: 'prospect_engine', sourcePortal: 'linkedin', stateCode: 'FL', location: 'Miami, FL', workModality: 'hybrid', jobUrl: 'https://www.linkedin.com/jobs/view/3907331200', remoteViable: true, aiConfidence: 0.87, aiReasons: ['Tier-1 ticket handling over Zendesk and remote sessions; on-site days are for asset handover only.'], salaryMinUsd: 45760, salaryMaxUsd: 54080, languages: ['English', 'Spanish'], seniorityLevel: 'entry', department: 'IT', skills: 'Zendesk, Active Directory, Remote support', description: 'First-line support for 700 internal users across US business hours, with escalation to platform teams.', comercialId: 'uuid-staff-001', comercialType: 'inherited', sdrId: 'uuid-staff-006', sdrType: 'inherited' },
  { id: 'vac-013', title: 'Medical Biller', companyId: 'comp-002', positionId: 'pos-17', searchText: 'medical biller', status: 'contacted', source: 'prospect_engine', sourcePortal: 'indeed', stateCode: 'NY', location: 'New York, NY', workModality: 'onsite', jobUrl: 'https://www.indeed.com/viewjob?jk=c4e81b2079f3ad65', remoteViable: true, aiConfidence: 0.94, aiReasons: ['Claims submission and denial follow-up are performed in Epic; no patient contact is required.'], salaryMinUsd: 45760, salaryMaxUsd: 52000, languages: ['English', 'Spanish'], seniorityLevel: 'entry', department: 'Operations', skills: 'ICD-10, CPT coding, Epic', description: 'Submit claims and work the denial queue for a 40-clinic network.', comercialId: 'uuid-staff-001', comercialType: 'inherited', sdrId: 'uuid-staff-007', sdrType: 'inherited' },
  { id: 'vac-014', title: 'Prior Authorization Specialist', companyId: 'comp-002', positionId: 'pos-17', searchText: 'prior authorization specialist', status: 'detected', source: 'prospect_engine', sourcePortal: 'linkedin', stateCode: 'NY', location: 'Brooklyn, NY', workModality: 'onsite', jobUrl: 'https://www.linkedin.com/jobs/view/3908124093', remoteViable: true, aiConfidence: 0.89, aiReasons: ['Authorization requests are submitted through payer portals and followed up by phone.'], salaryMinUsd: 49920, salaryMaxUsd: 58240, languages: ['English', 'Spanish'], seniorityLevel: 'mid', department: 'Operations', skills: 'Payer portals, Benefits verification, Epic', description: 'Obtain and track payer authorizations ahead of scheduled procedures.', comercialId: 'uuid-staff-001', comercialType: 'inherited', sdrId: 'uuid-staff-007', sdrType: 'inherited' },
  { id: 'vac-015', title: 'Staff Accountant', companyId: 'comp-003', positionId: 'pos-01', searchText: 'staff accountant', status: 'detected', source: 'prospect_engine', sourcePortal: 'linkedin', stateCode: 'IL', location: 'Chicago, IL', workModality: 'hybrid', jobUrl: 'https://www.linkedin.com/jobs/view/3908773311', remoteViable: true, aiConfidence: 0.9, aiReasons: ['Close, reconciliations and audit support are performed in the accounting system.'], salaryMinUsd: 62400, salaryMaxUsd: 74880, languages: ['English'], seniorityLevel: 'mid', department: 'Finance', skills: 'GAAP, QuickBooks, Close process', description: 'Own the monthly close for two advisory entities and support the annual audit.', comercialId: 'uuid-staff-002', comercialType: 'inherited', sdrId: 'uuid-staff-006', sdrType: 'inherited' },
  { id: 'vac-016', title: 'Legal Intake Specialist', companyId: 'comp-003', positionId: 'pos-14', searchText: 'legal intake specialist', status: 'detected', source: 'prospect_engine', sourcePortal: 'indeed', stateCode: 'IL', location: 'Chicago, IL', workModality: 'onsite', jobUrl: 'https://www.indeed.com/viewjob?jk=d2f70a1c6b98e304', remoteViable: true, aiConfidence: 0.93, aiReasons: ['Intake calls and case qualification are handled by phone and in the case management system.'], salaryMinUsd: 43680, salaryMaxUsd: 52000, languages: ['English', 'Spanish'], seniorityLevel: 'entry', department: 'Legal', skills: 'Client intake, Clio, Bilingual', description: 'Take first calls from prospective clients, qualify the matter and open the file.', comercialId: 'uuid-staff-002', comercialType: 'inherited', sdrId: null, sdrType: null },
  { id: 'vac-017', title: 'Paralegal', companyId: 'comp-003', positionId: 'pos-14', searchText: 'paralegal', status: 'detected', source: 'prospect_engine', sourcePortal: 'linkedin', stateCode: 'IL', location: 'Chicago, IL', workModality: 'remote', jobUrl: 'https://www.linkedin.com/jobs/view/3911880254', remoteViable: true, aiConfidence: 0.85, aiReasons: ['Contract review and discovery support are document work; no bar licence is required.'], salaryMinUsd: 56160, salaryMaxUsd: 68640, languages: ['English'], seniorityLevel: 'mid', department: 'Legal', skills: 'Contract review, Discovery, Clio', description: 'Contract review and discovery support for the in-house legal team.', comercialId: 'uuid-staff-002', comercialType: 'inherited', sdrId: 'uuid-staff-006', sdrType: 'inherited' },
  { id: 'vac-018', title: 'Sales Development Representative', companyId: 'comp-004', positionId: 'pos-12', searchText: 'sales development representative', status: 'detected', source: 'prospect_engine', sourcePortal: 'linkedin', stateCode: 'TX', location: 'Austin, TX', workModality: 'hybrid', jobUrl: 'https://www.linkedin.com/jobs/view/3909441277', remoteViable: true, aiConfidence: 0.91, aiReasons: ['Outbound prospecting runs on phone, email and HubSpot; inside sales, not field sales.'], salaryMinUsd: 45760, salaryMaxUsd: 58240, languages: ['English'], seniorityLevel: 'entry', department: 'Sales', skills: 'Outbound, HubSpot, English C1', description: 'Outbound prospecting into mid-market data teams; base plus commission.', comercialId: null, comercialType: null, sdrId: 'uuid-staff-006', sdrType: 'inherited' },
  { id: 'vac-019', title: 'Recruiting Coordinator', companyId: 'comp-004', positionId: 'pos-09', searchText: 'recruiting coordinator', status: 'contacted', source: 'prospect_engine', sourcePortal: 'indeed', stateCode: 'TX', location: 'Austin, TX', workModality: 'onsite', jobUrl: 'https://www.indeed.com/viewjob?jk=1b8407fd39c2ea60', remoteViable: true, aiConfidence: 0.88, aiReasons: ['Scheduling, candidate communication and ATS upkeep are all software and calls.'], salaryMinUsd: 47840, salaryMaxUsd: 56160, languages: ['English'], seniorityLevel: 'entry', department: 'HR', skills: 'Greenhouse, Scheduling, Candidate comms', description: 'Coordinate interview loops and keep the ATS current for a team hiring fast.', comercialId: null, comercialType: null, sdrId: 'uuid-staff-006', sdrType: 'inherited' },
  { id: 'vac-020', title: 'Logistics Coordinator', companyId: 'comp-005', positionId: 'pos-15', searchText: 'logistics coordinator', status: 'detected', source: 'prospect_engine', sourcePortal: 'indeed', stateCode: 'TX', location: 'Dallas, TX', workModality: 'onsite', jobUrl: 'https://www.indeed.com/viewjob?jk=6e3b9014f7ac2d58', remoteViable: true, aiConfidence: 0.81, aiReasons: ['Load planning and carrier communication are done in the TMS and by phone.'], salaryMinUsd: 47840, salaryMaxUsd: 58240, languages: ['English', 'Spanish'], seniorityLevel: 'mid', department: 'Operations', skills: 'TMS, Route planning, Carrier comms', description: 'Plan and track regional freight movements and keep carriers updated.', comercialId: 'uuid-staff-003', comercialType: 'inherited', sdrId: null, sdrType: null },
  { id: 'vac-021', title: 'Freight Billing Specialist', companyId: 'comp-005', positionId: 'pos-15', searchText: 'freight billing specialist', status: 'detected', source: 'prospect_engine', sourcePortal: 'linkedin', stateCode: 'TX', location: 'Dallas, TX', workModality: 'hybrid', jobUrl: 'https://www.linkedin.com/jobs/view/3909887120', remoteViable: true, aiConfidence: 0.9, aiReasons: ['Carrier invoice audit and rate disputes are handled in SAP and over email.'], salaryMinUsd: 49920, salaryMaxUsd: 60320, languages: ['English'], seniorityLevel: 'mid', department: 'Finance', skills: 'Freight audit, Excel, SAP', description: 'Audit carrier invoices and resolve rate discrepancies before settlement.', comercialId: 'uuid-staff-003', comercialType: 'inherited', sdrId: null, sdrType: null },
  { id: 'vac-022', title: 'Dispatcher', companyId: 'comp-005', positionId: 'pos-15', searchText: 'dispatcher', status: 'detected', source: 'prospect_engine', sourcePortal: 'indeed', stateCode: 'TX', location: 'Dallas, TX', workModality: 'onsite', jobUrl: 'https://www.indeed.com/viewjob?jk=3c9812aef07b4d55', remoteViable: false, aiConfidence: 0.86, aiReasons: ['Posting is for a fleet technician role at the terminal, not a remote dispatch desk.'], salaryMinUsd: 43680, salaryMaxUsd: 49920, languages: ['English'], seniorityLevel: 'entry', department: 'Operations', skills: 'Fleet, Dispatch, DOT', description: 'Terminal-based dispatch and yard coordination on a rotating shift.', comercialId: 'uuid-staff-003', comercialType: 'inherited', sdrId: null, sdrType: null },
  { id: 'vac-023', title: 'Data Entry Clerk', companyId: 'comp-006', positionId: 'pos-06', searchText: 'data entry clerk', status: 'detected', source: 'prospect_engine', sourcePortal: 'linkedin', stateCode: 'WA', location: 'Seattle, WA', workModality: 'onsite', jobUrl: 'https://www.linkedin.com/jobs/view/3910114552', remoteViable: true, aiConfidence: 0.95, aiReasons: ['Record keying and validation happen entirely in the ERP.'], salaryMinUsd: 39520, salaryMaxUsd: 45760, languages: ['English'], seniorityLevel: 'entry', department: 'Operations', skills: 'Data entry, SAP, Excel', description: 'Key and validate production and inventory records into the ERP.', comercialId: 'uuid-staff-002', comercialType: 'inherited', sdrId: 'uuid-staff-007', sdrType: 'inherited' },
  { id: 'vac-024', title: 'Scheduling Coordinator', companyId: 'comp-006', positionId: 'pos-10', searchText: 'scheduling coordinator', status: 'proposal', source: 'prospect_engine', sourcePortal: 'indeed', stateCode: 'WA', location: 'Seattle, WA', workModality: 'hybrid', jobUrl: 'https://www.indeed.com/viewjob?jk=52d0a7f1c9b38e64', remoteViable: true, aiConfidence: 0.92, aiReasons: ['Shift planning and confirmations are done by phone and in the scheduling system.'], salaryMinUsd: 45760, salaryMaxUsd: 54080, languages: ['English'], seniorityLevel: 'mid', department: 'Operations', skills: 'Scheduling, Workforce planning', description: 'Build and maintain the shared-services shift plan for three sites.', comercialId: 'uuid-staff-002', comercialType: 'inherited', sdrId: 'uuid-staff-007', sdrType: 'inherited' },
  { id: 'vac-025', title: 'Bilingual Customer Service Representative', companyId: 'comp-007', positionId: 'pos-04', searchText: 'bilingual customer service representative', status: 'detected', source: 'prospect_engine', sourcePortal: 'indeed', stateCode: 'MA', location: 'Boston, MA', workModality: 'onsite', jobUrl: 'https://www.indeed.com/viewjob?jk=90ce2a417b3f8d12', remoteViable: true, aiConfidence: 0.96, aiReasons: ['Family communication is by phone and email; Spanish is required, presence is not.'], salaryMinUsd: 41600, salaryMaxUsd: 49920, languages: ['English', 'Spanish'], seniorityLevel: 'entry', department: 'Customer Service', skills: 'Bilingual, CRM, Family communication', description: 'Answer enrolment and attendance questions from families in English and Spanish.', comercialId: null, comercialType: null, sdrId: null, sdrType: null },
  { id: 'vac-026', title: 'Intake Specialist', companyId: 'comp-007', positionId: 'pos-04', searchText: 'intake specialist', status: 'detected', source: 'prospect_engine', sourcePortal: 'linkedin', stateCode: 'MA', location: 'Boston, MA', workModality: 'hybrid', jobUrl: 'https://www.linkedin.com/jobs/view/3910556703', remoteViable: true, aiConfidence: 0.88, aiReasons: ['Application review and follow-up calls run through the enrolment CRM.'], salaryMinUsd: 43680, salaryMaxUsd: 52000, languages: ['English', 'Spanish'], seniorityLevel: 'entry', department: 'Operations', skills: 'Enrollment, CRM, Bilingual', description: 'Process admission applications and follow up with families during the spring peak.', comercialId: null, comercialType: null, sdrId: null, sdrType: null },
  { id: 'vac-027', title: 'Ecommerce Customer Support', companyId: 'comp-008', positionId: 'pos-07', searchText: 'ecommerce customer support', status: 'detected', source: 'prospect_engine', sourcePortal: 'indeed', stateCode: 'CA', location: 'Los Angeles, CA', workModality: 'onsite', jobUrl: 'https://www.indeed.com/viewjob?jk=4a72e05c1839bfd7', remoteViable: true, aiConfidence: 0.94, aiReasons: ['Order and returns inquiries are handled across chat, email and voice in Shopify.'], salaryMinUsd: 37440, salaryMaxUsd: 43680, languages: ['English', 'Spanish'], seniorityLevel: 'entry', department: 'Customer Service', skills: 'Omnichannel, Shopify, English C1', description: 'Handle order, shipping and returns inquiries across chat, email and voice.', comercialId: 'uuid-staff-003', comercialType: 'inherited', sdrId: 'uuid-staff-011', sdrType: 'inherited' },
  { id: 'vac-028', title: 'Order Processing Specialist', companyId: 'comp-008', positionId: 'pos-07', searchText: 'order processing specialist', status: 'detected', source: 'prospect_engine', sourcePortal: 'linkedin', stateCode: 'CA', location: 'Los Angeles, CA', workModality: 'onsite', jobUrl: 'https://www.linkedin.com/jobs/view/3910990418', remoteViable: true, aiConfidence: 0.91, aiReasons: ['Order entry and exception handling are performed in the OMS.'], salaryMinUsd: 39520, salaryMaxUsd: 47840, languages: ['English'], seniorityLevel: 'entry', department: 'Operations', skills: 'OMS, Order entry, Excel', description: 'Enter wholesale orders and resolve exceptions before fulfilment.', comercialId: 'uuid-staff-003', comercialType: 'inherited', sdrId: 'uuid-staff-011', sdrType: 'inherited' },
  { id: 'vac-029', title: 'Insurance Customer Service Representative', companyId: 'comp-009', positionId: 'pos-13', searchText: 'insurance customer service representative', status: 'contacted', source: 'prospect_engine', sourcePortal: 'linkedin', stateCode: 'CA', location: 'San Francisco, CA', workModality: 'hybrid', jobUrl: 'https://www.linkedin.com/jobs/view/3911233806', remoteViable: true, aiConfidence: 0.87, aiReasons: ['Policy servicing calls and endorsements are handled in the agency management system.'], salaryMinUsd: 47840, salaryMaxUsd: 58240, languages: ['English', 'Spanish'], seniorityLevel: 'mid', department: 'Customer Service', skills: 'Policy servicing, AMS, Bilingual', description: 'Service commercial policies: endorsements, certificates and renewal follow-up.', comercialId: 'uuid-staff-001', comercialType: 'inherited', sdrId: 'uuid-staff-006', sdrType: 'inherited' },
  { id: 'vac-030', title: 'Bookkeeper', companyId: 'comp-011', positionId: 'pos-01', searchText: 'bookkeeper', status: 'detected', source: 'prospect_engine', sourcePortal: 'linkedin', stateCode: 'FL', location: 'Tampa, FL', workModality: 'unknown', jobUrl: 'https://www.linkedin.com/jobs/view/3911604927', remoteViable: true, aiConfidence: 0.93, aiReasons: ['Day-to-day books, AP/AR and payroll prep are done in QuickBooks Online.'], salaryMinUsd: 41600, salaryMaxUsd: 49920, languages: ['English'], seniorityLevel: 'entry', department: 'Finance', skills: 'QuickBooks, AP/AR, Payroll', description: 'Keep the books for a two-location services business; QuickBooks Online.', comercialId: null, comercialType: null, sdrId: null, sdrType: null },
  { id: 'vac-031', title: 'Policy Processor', companyId: 'comp-012', positionId: 'pos-13', searchText: 'policy processor', status: 'detected', source: 'prospect_engine', sourcePortal: 'indeed', stateCode: 'GA', location: 'Atlanta, GA', workModality: 'onsite', jobUrl: 'https://www.indeed.com/viewjob?jk=77e1c09b4a2d5f38', remoteViable: true, aiConfidence: 0.89, aiReasons: ['Policy issuance and endorsements are system work with no client-facing presence.'], salaryMinUsd: 43680, salaryMaxUsd: 52000, languages: ['English'], seniorityLevel: 'unspecified', department: 'Operations', skills: 'Policy issuance, AMS, Data entry', description: 'Issue and endorse commercial policies for placed staff.', comercialId: null, comercialType: null, sdrId: null, sdrType: null },
  { id: 'vac-032', title: 'Mortgage Loan Processor', companyId: 'comp-003', positionId: 'pos-18', searchText: 'mortgage loan processor', status: 'detected', source: 'prospect_engine', sourcePortal: 'indeed', stateCode: 'IL', location: 'Chicago, IL', workModality: 'onsite', jobUrl: 'https://www.indeed.com/viewjob?jk=6b04f8d1739ca2e5', remoteViable: true, aiConfidence: 0.9, aiReasons: ['Document collection, verification and underwriter coordination run in Encompass.'], salaryMinUsd: 52000, salaryMaxUsd: 64480, languages: ['English'], seniorityLevel: 'mid', department: 'Finance', skills: 'Encompass, Document review, Underwriting support', description: 'Collect and verify borrower documentation and prepare files for underwriting.', comercialId: 'uuid-staff-002', comercialType: 'inherited', sdrId: 'uuid-staff-006', sdrType: 'inherited' }
);

/* ---- Señales del aviso (vacancies.ai_signals · HUPEA-1.4) ---------------- */
// Las etiqueta el análisis leyendo la descripción. Se siembran solo donde el texto del aviso
// las sostiene; una vacante sin señales es lo normal, no un dato faltante.
const VACANCY_SIGNAL_SEED = {
  'vac-011': ['back_office', 'competitive_pay'],
  'vac-012': ['client_facing', 'shift_work'],
  'vac-013': ['back_office', 'multiple_openings'],
  'vac-014': ['back_office', 'multiple_openings', 'company_growing'],
  'vac-015': ['back_office'],
  'vac-016': ['client_facing', 'urgent_hire'],
  'vac-017': ['back_office', 'supports_licensed_role'],
  'vac-018': ['client_facing', 'competitive_pay', 'company_growing'],
  'vac-019': ['urgent_hire', 'company_growing'],
  'vac-020': ['client_facing'],
  'vac-021': ['back_office'],
  'vac-022': ['shift_work', 'state_restricted'],
  'vac-023': ['back_office', 'multiple_openings'],
  'vac-024': ['back_office'],
  'vac-025': ['client_facing', 'multiple_openings'],
  'vac-026': ['client_facing', 'urgent_hire'],
  'vac-027': ['client_facing', 'shift_work', 'multiple_openings'],
  'vac-028': ['back_office'],
  'vac-029': ['client_facing', 'supports_licensed_role'],
  'vac-030': ['back_office', 'us_work_authorization'],
  'vac-031': ['back_office'],
  'vac-032': ['back_office', 'supports_licensed_role'],
  'vac-033': ['back_office', 'multiple_openings'],
  'vac-034': ['back_office', 'multiple_openings'],
  'vac-035': ['back_office', 'supports_licensed_role'],
  'vac-036': ['back_office'],
  'vac-037': ['back_office', 'company_growing'],
  'vac-038': ['client_facing', 'multiple_openings'],
  'vac-039': ['client_facing', 'no_visa_sponsorship']
};

// Se llama después de cada tanda de vacantes: el bloque de Prospects agrega más abajo las que
// sostienen las señales de empresa, y también tienen que quedar etiquetadas.
function applyVacancySignals() {
  MOCK_VACANCIES.forEach(function (v) {
    if (v.aiSignals === undefined) v.aiSignals = VACANCY_SIGNAL_SEED[v.id] || [];
  });
}
applyVacancySignals();

/* ---- Cierre de la siembra ------------------------------------------------ */
// Las funciones de siembra del listado anterior corrieron antes de que Release 3
// agregara empresa, contactos y vacantes. Esto completa lo que les faltó y suma
// la hora de detección, que la card necesita para leer la antigüedad en horas
// mientras la vacante es del día.
(function seedRelease3State() {
  function hoursAgo(h) { return new Date(Date.now() - h * 3600000); }
  function daysAgoStr(n) { return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10); }

  // Detectadas hoy: la antigüedad se lee en horas.
  const fresh = {
    'vac-011': 3, 'vac-018': 5, 'vac-025': 8, 'vac-012': 11, 'vac-030': 14,
    'vac-023': 16, 'vac-015': 19, 'vac-029': 22
  };
  // El resto de las que agregó Release 3, en días atrás [detección, publicación].
  const offsets = {
    'vac-013': [1, 2], 'vac-014': [1, 3], 'vac-016': [2, 3], 'vac-017': [2, 4],
    'vac-019': [3, 4], 'vac-020': [3, 6], 'vac-021': [4, 5], 'vac-022': [5, 7],
    'vac-024': [6, 8], 'vac-026': [7, 9], 'vac-027': [9, 11], 'vac-028': [11, 13],
    'vac-031': [13, 15], 'vac-032': [16, 19]
  };

  MOCK_VACANCIES.forEach(function (v) {
    if (fresh[v.id] !== undefined) {
      const d = hoursAgo(fresh[v.id]);
      v.detectedAtTs = d.toISOString();
      v.detectedAt = d.toISOString().slice(0, 10);
      v.publishedDate = daysAgoStr(1);
    } else if (offsets[v.id]) {
      v.detectedAt = daysAgoStr(offsets[v.id][0]);
      v.publishedDate = daysAgoStr(offsets[v.id][1]);
      v.detectedAtTs = v.detectedAt + 'T14:20:00.000Z';
    } else {
      v.detectedAtTs = v.detectedAt + 'T09:00:00.000Z';
    }
    // Lo que no pasó por el análisis nuevo queda sin veredicto, no en cero.
    if (v.aiConfidence === undefined) v.aiConfidence = null;
    if (v.aiReasons === undefined) v.aiReasons = null;
    if (v.positionId === undefined) v.positionId = null;
    if (v.searchText === undefined) v.searchText = null;
    if (v.languages === undefined) v.languages = null;
    if (v.salaryMinUsd === undefined) { v.salaryMinUsd = null; v.salaryMaxUsd = null; }
    if (v.aiSignals === undefined) v.aiSignals = [];
    // staff_vacancy_assignment.assigned_at — la fecha que muestra la sección de asignación.
    if (!v.assignmentUpdatedAt && (v.comercialId || v.sdrId)) v.assignmentUpdatedAt = formatStamp(v.detectedAtTs || v.detectedAt);
    // Sin marca de exportación: el registro no salió en ningún archivo todavía.
    if (v.lastExportedBy === undefined) { v.lastExportedBy = null; v.lastExportedAt = null; v.exportCount = 0; }
  });

  MOCK_COMPANIES.forEach(function (c) {
    if (c.lastExportedBy === undefined) { c.lastExportedBy = null; c.lastExportedAt = null; c.exportCount = 0; }
    // staff_company_assignment.assigned_at
    if (!c.assignmentUpdatedAt && (c.comercialId || c.sdrId)) c.assignmentUpdatedAt = formatStamp(c.createdAt + ' 10:00');
  });

  MOCK_CONTACTS.forEach(function (ct) {
    const company = MOCK_COMPANIES.find(function (c) { return c.id === ct.companyId; });
    if (!ct.createdAt) ct.createdAt = company ? company.createdAt : daysAgoStr(60);
    if (ct.lastExportedBy === undefined) {
      ct.lastExportedBy = company ? company.lastExportedBy : null;
      ct.lastExportedAt = company ? company.lastExportedAt : null;
      ct.exportCount = company ? company.exportCount : 0;
    }
  });

  // El conteo de contactos se deriva de los contactos guardados, no se escribe a mano.
  MOCK_COMPANIES.forEach(function (c) { c.contactsCount = getContactsForCompany(c.id).length; });
})();

// Antigüedad de la detección: horas mientras es del día, días la primera semana,
// semanas después. Es la lectura que la card pone junto al título.
// `agoPhrase` es la misma lectura en frase, para los detalles: "Detected just now" en vez
// del "Detected now ago" que salía de concatenar la forma corta.
function agoPhrase(prefix, value) {
  const label = agoLabel(value);
  if (!label) return '';
  return label === 'now' ? prefix + ' just now' : prefix + ' ' + label + ' ago';
}

function detectedAge(vacancy) {
  const ts = vacancy && (vacancy.detectedAtTs || vacancy.detectedAt);
  if (!ts) return '';
  const diffH = Math.max(0, Math.floor((Date.now() - parseStamp(ts).getTime()) / 3600000));
  if (diffH < 1) return 'now';
  if (diffH < 24) return diffH + 'h';
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return diffD + 'd';
  const diffW = Math.floor(diffD / 7);
  if (diffW < 5) return diffW + 'w';
  return Math.floor(diffD / 30) + 'mo';
}

/* ============================================================================
   RELEASE 3 — Prospects
   Lo que el listado de empresas necesita y no existía como pieza compartida.
   ============================================================================ */

// === ETAPAS DEL EMBUDO ===
const PIPELINE_STAGES = [
  { code: 'lead', label: 'Lead' },
  { code: 'prospecting', label: 'Prospecting' },
  { code: 'engaged', label: 'Engaged' },
  { code: 'initial appointment held', label: 'Initial appointment held' },
  { code: 'onboarding started', label: 'Onboarding started' },
  { code: 'client', label: 'Client' },
  { code: 'lost', label: 'Lost' }
];

function pipelineLabel(stage) {
  const s = PIPELINE_STAGES.find(function (x) { return x.code === stage; });
  return s ? s.label : (stage || '');
}

// Etiquetas de company.relationship_type. Los códigos son los de la base: client | prospect | inactive.
const RELATIONSHIP_LABELS = { client: 'Client', prospect: 'Prospect', inactive: 'Inactive' };

// === POSICIONES DE UNA EMPRESA ===
// El listado cuenta lo detectado y, aparte, lo que el análisis dio por viable en remoto:
// son dos números distintos y el segundo es el accionable.
function companyVacancies(companyId) {
  return MOCK_VACANCIES.filter(function (v) { return v.companyId === companyId; });
}

function companyOpenPositions(companyId) {
  const all = companyVacancies(companyId);
  return { total: all.length, viable: all.filter(function (v) { return v.remoteViable === true; }).length };
}

// === NOMBRE CORTO DE UNA PERSONA ===
// "Dr. Robert Kim" → "Robert K.". Los tratamientos no aportan al escaneo y se descartan;
// un nombre de una sola palabra se muestra tal cual.
const HONORIFICS = ['dr.', 'dr', 'mr.', 'mr', 'ms.', 'ms', 'mrs.', 'mrs', 'prof.', 'prof'];

// El nombre completo sin el tratamiento: "Dr. Robert Kim" → "Robert Kim".
function personName(fullName) {
  return String(fullName || '').trim().split(/\s+/)
    .filter(function (p, i) { return !(i === 0 && HONORIFICS.indexOf(p.toLowerCase()) !== -1); })
    .join(' ');
}

// === ANTIGÜEDAD LEGIBLE ===
// Misma lectura que usa la card de Open Positions, sobre cualquier fecha.
function agoLabel(value) {
  if (!value) return '';
  const t = parseStamp(value).getTime();
  if (!isFinite(t)) return '';
  const diffH = Math.max(0, Math.floor((Date.now() - t) / 3600000));
  if (diffH < 1) return 'now';
  if (diffH < 24) return diffH + 'h';
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return diffD + 'd';
  const diffW = Math.floor(diffD / 7);
  if (diffW < 5) return diffW + 'w';
  return Math.floor(diffD / 30) + 'mo';
}

// Días transcurridos, para los criterios que se expresan en días.
function daysSince(value) {
  if (!value) return null;
  const t = parseStamp(value).getTime();
  return isFinite(t) ? Math.floor((Date.now() - t) / 86400000) : null;
}

// === VOLUMEN REAL DE LAS EMPRESAS QUE REPITEN AVISO ===
// FinServe y GlobalHealth llevan las señales `repeated_posting` y `multiple_openings`,
// que la calificación define sobre hechos contables: dos o más vacantes con la misma
// posición del catálogo. Con tres avisos cada una la señal no se sostenía; estas las
// llevan al volumen que su propio resumen de lead describe.
MOCK_VACANCIES.push(
  { id: 'vac-033', title: 'Accounting Clerk', companyId: 'comp-003', positionId: 'pos-01', searchText: 'accounting clerk', status: 'detected', source: 'prospect_engine', sourcePortal: 'indeed', stateCode: 'IL', location: 'Chicago, IL', workModality: 'onsite', jobUrl: 'https://www.indeed.com/viewjob?jk=2ae70b19cf4d3806', remoteViable: true, aiConfidence: 0.94, aiReasons: ['Invoice coding and ledger entry are done in the accounting system.'], salaryMinUsd: 41600, salaryMaxUsd: 49920, languages: ['English'], seniorityLevel: 'entry', department: 'Finance', skills: 'QuickBooks, Data entry, Excel', description: 'Code invoices and maintain the general ledger for two advisory entities.', comercialId: 'uuid-staff-002', comercialType: 'inherited', sdrId: 'uuid-staff-006', sdrType: 'inherited' },
  { id: 'vac-034', title: 'Accounts Receivable Specialist', companyId: 'comp-003', positionId: 'pos-01', searchText: 'accounts receivable specialist', status: 'detected', source: 'prospect_engine', sourcePortal: 'linkedin', stateCode: 'IL', location: 'Chicago, IL', workModality: 'hybrid', jobUrl: 'https://www.linkedin.com/jobs/view/3912117640', remoteViable: true, aiConfidence: 0.92, aiReasons: ['Collections and cash application run in the ERP and over email.'], salaryMinUsd: 45760, salaryMaxUsd: 54080, languages: ['English'], seniorityLevel: 'entry', department: 'Finance', skills: 'AR, Cash application, NetSuite', description: 'Apply payments, chase overdue balances and reconcile the AR ledger.', comercialId: 'uuid-staff-002', comercialType: 'inherited', sdrId: 'uuid-staff-006', sdrType: 'inherited' },
  { id: 'vac-035', title: 'Legal Assistant', companyId: 'comp-003', positionId: 'pos-14', searchText: 'legal assistant', status: 'detected', source: 'prospect_engine', sourcePortal: 'indeed', stateCode: 'IL', location: 'Chicago, IL', workModality: 'onsite', jobUrl: 'https://www.indeed.com/viewjob?jk=8d41f0c2b9736ae5', remoteViable: true, aiConfidence: 0.88, aiReasons: ['Document preparation and calendaring are performed in the case system.'], salaryMinUsd: 43680, salaryMaxUsd: 52000, languages: ['English'], seniorityLevel: 'entry', department: 'Legal', skills: 'Document prep, Calendaring, Clio', description: 'Prepare filings and manage the matter calendar for the in-house team.', comercialId: 'uuid-staff-002', comercialType: 'inherited', sdrId: null, sdrType: null },
  { id: 'vac-036', title: 'Medical Coder', companyId: 'comp-002', positionId: 'pos-17', searchText: 'medical coder', status: 'detected', source: 'prospect_engine', sourcePortal: 'linkedin', stateCode: 'NY', location: 'New York, NY', workModality: 'onsite', jobUrl: 'https://www.linkedin.com/jobs/view/3912443071', remoteViable: true, aiConfidence: 0.95, aiReasons: ['Chart coding is performed against the record; no patient contact.'], salaryMinUsd: 49920, salaryMaxUsd: 58240, languages: ['English'], seniorityLevel: 'mid', department: 'Operations', skills: 'ICD-10, CPT, Chart review', description: 'Code outpatient encounters and resolve coding queries from billing.', comercialId: 'uuid-staff-001', comercialType: 'inherited', sdrId: 'uuid-staff-007', sdrType: 'inherited' },
  { id: 'vac-037', title: 'Revenue Cycle Specialist', companyId: 'comp-002', positionId: 'pos-17', searchText: 'revenue cycle specialist', status: 'detected', source: 'prospect_engine', sourcePortal: 'indeed', stateCode: 'NY', location: 'New York, NY', workModality: 'hybrid', jobUrl: 'https://www.indeed.com/viewjob?jk=5f92c0e7134ab68d', remoteViable: true, aiConfidence: 0.91, aiReasons: ['Denial analysis and payer follow-up run through the billing platform.'], salaryMinUsd: 54080, salaryMaxUsd: 64480, languages: ['English', 'Spanish'], seniorityLevel: 'mid', department: 'Operations', skills: 'RCM, Denials, Payer relations', description: 'Own denial trends and payer follow-up across the clinic network.', comercialId: 'uuid-staff-001', comercialType: 'inherited', sdrId: 'uuid-staff-007', sdrType: 'inherited' },
  { id: 'vac-038', title: 'Scheduling Coordinator', companyId: 'comp-002', positionId: 'pos-10', searchText: 'scheduling coordinator', status: 'detected', source: 'prospect_engine', sourcePortal: 'linkedin', stateCode: 'NY', location: 'Queens, NY', workModality: 'onsite', jobUrl: 'https://www.linkedin.com/jobs/view/3912770185', remoteViable: true, aiConfidence: 0.9, aiReasons: ['Appointment booking and confirmations are phone and system work.'], salaryMinUsd: 43680, salaryMaxUsd: 52000, languages: ['English', 'Spanish'], seniorityLevel: 'entry', department: 'Operations', skills: 'Scheduling, Epic, Bilingual', description: 'Book and confirm patient appointments across four clinic sites.', comercialId: 'uuid-staff-001', comercialType: 'inherited', sdrId: 'uuid-staff-007', sdrType: 'inherited' }
);

// Las que agrega este bloque entran con la misma siembra que las anteriores.
// TechCorp lleva `repeated_posting` entre sus señales, y ese hecho la calificación lo
// calcula contando vacantes con la misma posición del catálogo. Sin un segundo aviso de
// IT Support la señal no se sostenía.
MOCK_VACANCIES.push(
  { id: 'vac-039', title: 'IT Support Specialist', companyId: 'comp-001', positionId: 'pos-11', searchText: 'it support specialist', status: 'detected', source: 'prospect_engine', sourcePortal: 'indeed', stateCode: 'FL', location: 'Miami, FL', workModality: 'onsite', jobUrl: 'https://www.indeed.com/viewjob?jk=c20f84a17be3d95', remoteViable: true, aiConfidence: 0.9, aiReasons: ['Ticket triage and remote sessions cover the work; on-site time is for hardware handover only.'], salaryMinUsd: 49920, salaryMaxUsd: 58240, languages: ['English'], seniorityLevel: 'mid', department: 'IT', skills: 'Zendesk, Intune, Windows, Networking', description: 'Second-line support for internal users, owning escalations from the help desk.', comercialId: 'uuid-staff-001', comercialType: 'inherited', sdrId: 'uuid-staff-006', sdrType: 'inherited' }
);

(function seedRelease3Extra() {
  function daysAgoStr(n) { return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10); }
  const offsets = { 'vac-033': [2, 4], 'vac-034': [4, 6], 'vac-035': [8, 10], 'vac-036': [1, 2], 'vac-037': [5, 7], 'vac-038': [10, 12], 'vac-039': [3, 5] };
  MOCK_VACANCIES.forEach(function (v) {
    if (!offsets[v.id]) return;
    v.detectedAt = daysAgoStr(offsets[v.id][0]);
    v.publishedDate = daysAgoStr(offsets[v.id][1]);
    v.detectedAtTs = v.detectedAt + 'T11:40:00.000Z';
    v.lastExportedBy = null; v.lastExportedAt = null; v.exportCount = 0;
    if (!v.assignmentUpdatedAt && (v.comercialId || v.sdrId)) v.assignmentUpdatedAt = formatStamp(v.detectedAtTs);
  });
  applyVacancySignals();
  // El conteo de contactos y la marca de principal se rehacen con el universo completo.
  MOCK_COMPANIES.forEach(function (c) { c.contactsCount = getContactsForCompany(c.id).length; });
})();

// === SELECTOR DE LA BARRA DE BÚSQUEDA (Release 3) ===
// Desplegable de selección múltiple que acompaña al campo de búsqueda. Aplica al
// instante: no espera al botón de buscar, que es solo del campo de texto. El valor
// vive en el estado de la página; el selector solo lo refleja.
// `search: false` lo deja sin buscador interno, para listas cortas.
function renderShellPicker(containerId, options) {
  const opts = options || {};
  const items = opts.items || [];
  const withSearch = opts.search !== false;
  const container = document.getElementById(containerId);
  if (!container) return null;
  let value = (opts.value || []).slice();

  container.innerHTML =
    '<div class="op-states" id="' + containerId + '-wrap">' +
      '<button type="button" class="op-states-toggle" id="' + containerId + '-toggle" aria-expanded="false" aria-haspopup="true">' +
        (opts.icon || '') +
        '<span class="op-states-value" id="' + containerId + '-value"></span>' +
        '<svg class="op-caret" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>' +
      '</button>' +
      '<div class="op-states-panel" id="' + containerId + '-panel" role="dialog" aria-label="' + (opts.allLabel || 'Filter') + '">' +
        (withSearch ? '<input type="text" class="op-states-search" id="' + containerId + '-search" autocomplete="off" placeholder="' + (opts.searchPlaceholder || 'Search') + '">' : '') +
        '<div class="op-states-list" id="' + containerId + '-list"></div>' +
        '<div class="op-states-foot">' +
          '<button type="button" class="op-btn-text" id="' + containerId + '-clear">Clear</button>' +
          '<button type="button" class="op-btn-text" id="' + containerId + '-done">Done</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  const wrap = document.getElementById(containerId + '-wrap');
  const toggle = document.getElementById(containerId + '-toggle');
  const valueEl = document.getElementById(containerId + '-value');
  const search = withSearch ? document.getElementById(containerId + '-search') : null;
  const list = document.getElementById(containerId + '-list');

  function label() {
    if (!value.length) { valueEl.textContent = opts.allLabel || 'All'; return; }
    if (value.length === 1) {
      const hit = items.find(function (i) { return i.value === value[0]; });
      valueEl.textContent = hit ? hit.label : value[0];
      return;
    }
    valueEl.textContent = value.length + ' ' + (opts.plural || 'selected');
  }

  function emit() { if (opts.onChange) opts.onChange(value.slice()); }

  function paint() {
    const q = search ? (search.value || '').toLowerCase() : '';
    const shown = items.filter(function (i) {
      return !q || i.label.toLowerCase().indexOf(q) !== -1 || String(i.note || '').toLowerCase().indexOf(q) !== -1;
    });
    list.innerHTML = shown.length
      ? shown.map(function (i) {
          return '<label><input type="checkbox" value="' + i.value + '"' +
            (value.indexOf(i.value) !== -1 ? ' checked' : '') + '>' +
            '<span>' + i.label + '</span>' +
            (i.note ? '<span class="op-state-code">' + i.note + '</span>' : '') + '</label>';
        }).join('')
      : '<div class="op-hint" style="padding:8px 10px;">Nothing matches that.</div>';

    list.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      cb.onchange = function () {
        if (cb.checked) value.push(cb.value);
        else value = value.filter(function (v) { return v !== cb.value; });
        label();
        emit();
      };
    });
    label();
  }

  toggle.onclick = function (e) {
    e.stopPropagation();
    const open = wrap.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { paint(); if (search) search.focus(); }
  };
  if (search) search.oninput = paint;
  document.getElementById(containerId + '-clear').onclick = function () { value = []; paint(); emit(); };
  document.getElementById(containerId + '-done').onclick = function () { wrap.classList.remove('open'); };
  document.addEventListener('click', function (e) { if (!container.contains(e.target)) wrap.classList.remove('open'); });

  label();

  return {
    getValue: function () { return value.slice(); },
    setValue: function (v) { value = (v || []).slice(); if (wrap.classList.contains('open')) paint(); else label(); },
    close: function () { wrap.classList.remove('open'); }
  };
}

// === BUSCADOR DE UN SOLO VALOR PARA LA BARRA ===
// No despliega nada hasta que se escribe, sugiere las coincidencias y deja elegir una.
// La × la suelta. Aplica al instante, como el resto de los filtros de la barra.
function renderShellSearchbox(containerId, options) {
  const opts = options || {};
  const items = opts.items || [];
  const limit = opts.limit || 8;
  const container = document.getElementById(containerId);
  if (!container) return null;
  let value = (opts.value || []).slice(0, 1);

  container.innerHTML =
    '<div class="op-sbox" id="' + containerId + '-wrap">' +
      (opts.icon || '') +
      '<input type="text" class="op-sbox-input" id="' + containerId + '-input" autocomplete="off" placeholder="' + (opts.placeholder || 'Search') + '">' +
      '<button type="button" class="op-sbox-x" id="' + containerId + '-x" aria-label="Clear" hidden>' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>' +
      '</button>' +
      '<div class="op-sbox-suggest" id="' + containerId + '-suggest"></div>' +
    '</div>';

  const wrap = document.getElementById(containerId + '-wrap');
  const input = document.getElementById(containerId + '-input');
  const clearBtn = document.getElementById(containerId + '-x');
  const suggest = document.getElementById(containerId + '-suggest');

  function selected() { return value.length ? items.find(function (i) { return i.value === value[0]; }) : null; }

  function reflect() {
    const hit = selected();
    input.value = hit ? hit.label : '';
    clearBtn.hidden = !hit;
    suggest.innerHTML = '';
    suggest.classList.remove('open');
  }

  function emit() { if (opts.onChange) opts.onChange(value.slice()); }

  function paint() {
    const q = (input.value || '').trim().toLowerCase();
    const hit = selected();
    // Con algo elegido y el texto sin tocar, no hay nada que sugerir.
    if (!q || (hit && input.value === hit.label)) { suggest.innerHTML = ''; suggest.classList.remove('open'); return; }
    const shown = items.filter(function (i) {
      return i.label.toLowerCase().indexOf(q) !== -1 || String(i.note || '').toLowerCase().indexOf(q) !== -1;
    }).slice(0, limit);
    suggest.innerHTML = shown.length
      ? shown.map(function (i) {
          return '<button type="button" class="op-pickitem" data-pick="' + i.value + '">' +
            '<span class="op-pickitem-label">' + i.label + '</span>' +
            (i.note ? '<span class="op-option-note">' + i.note + '</span>' : '') + '</button>';
        }).join('')
      : '<div class="op-hint" style="padding:10px 12px;">Nothing matches that.</div>';
    suggest.classList.add('open');
    suggest.querySelectorAll('[data-pick]').forEach(function (b) {
      b.onclick = function () { value = [b.dataset.pick]; reflect(); emit(); };
    });
  }

  input.oninput = paint;
  input.onfocus = paint;
  clearBtn.onclick = function () { value = []; reflect(); input.focus(); emit(); };
  document.addEventListener('click', function (e) {
    if (!container.contains(e.target)) { suggest.classList.remove('open'); reflect(); }
  });

  reflect();

  return {
    getValue: function () { return value.slice(); },
    setValue: function (v) { value = (v || []).slice(0, 1); reflect(); },
    close: function () { suggest.classList.remove('open'); }
  };
}

// Íconos de los selectores de la barra.
const SHELL_ICONS = {
  company: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path></svg>',
  position: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="14" x="2" y="6" rx="2"></rect><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
  location: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>'
};

// Cuántos decisores tiene guardados la empresa. Cuenta personas, no roles: dos
// contactos con el mismo cargo son dos puertas de entrada distintas.
function countDecisionMakers(companyId) {
  return getContactsForCompany(companyId).filter(function (c) { return c.roleCode && c.decisionLevel; }).length;
}

/* ============================================================================
   HISTORIAL DE ESTADOS (public.states_history)
   La traza real de la actividad: cada cambio de estado de una vacante o de una
   empresa, con quién lo hizo, desde y hacia qué estado, su nota y sus etiquetas.
   La alimentan los triggers de detección y, después, cada cambio desde la
   plataforma. Es lo que lee el tab de seguimiento.
   ============================================================================ */
const MOCK_STATE_HISTORY = [];

const STATE_NOTES = {
  contacted: [
    'First email sent to the CEO with the two openings we can cover.',
    'Reached the VP of Sales by phone; asked us to send a one-pager.',
    'Sequence started. Opened the email twice, no reply yet.'
  ],
  proposal: [
    'Proposal sent for two bilingual support seats, 90-day ramp.',
    'Sent pricing for three back-office seats after the discovery call.'
  ],
  won: [
    'Signed for two seats starting next month. Handing over to onboarding.'
  ],
  lost: [
    'Filled the role internally before we could present candidates.',
    'Budget frozen until the next fiscal year; revisit in Q1.'
  ]
};

(function seedStateHistory() {
  let seq = 0;
  function push(entry) {
    MOCK_STATE_HISTORY.push(Object.assign({ id: 'sh-' + (++seq).toString().padStart(3, '0'), tags: [] }, entry));
  }
  function pick(list, n) { return list[n % list.length]; }
  // Suma días conservando la hora del origen; una fecha sin hora toma la que se indique.
  function daysAfter(iso, n, fallbackTime) {
    const base = String(iso).length <= 10 ? iso + ' ' + (fallbackTime || '09:00') : iso;
    return formatStamp(new Date(parseStamp(base).getTime() + n * 86400000));
  }

  // Detección: la escribe el trigger, no una persona.
  MOCK_COMPANIES.forEach(function (c, i) {
    push({
      companyId: c.id, vacancyId: null, changedBy: 'system',
      statusFrom: null, statusTo: 'lead',
      note: 'Company registered in system.', tags: ['#new-lead'],
      createdAt: c.createdAt + ' 06:14'
    });
    // La investigación es lo que mueve la empresa a `prospecting`, y solo desde `lead`.
    // La calificación no registra: su resultado vive en los campos de la empresa.
    if (c.researchedAt) {
      push({
        companyId: c.id, vacancyId: null, changedBy: 'system',
        statusFrom: 'lead', statusTo: 'prospecting',
        note: 'Company researched and enriched.',
        tags: ['#research'],
        createdAt: c.researchedAt + ' 07:12'
      });
    }
    // Lo que movió una persona después, hasta la etapa en que está hoy.
    const path = ['lead', 'prospecting', 'engaged', 'initial appointment held', 'onboarding started', 'client'];
    const target = path.indexOf(c.pipelineStage);
    if (target > 1 && c.lastContactedAt) {
      const owner = getMemberById(c.comercialId) || getMemberById(c.sdrId);
      const moves = target - 1;
      const spanDays = Math.max(1, daysSince(c.lastContactedAt));
      for (let step = 2; step <= target; step++) {
        push({
          companyId: c.id, vacancyId: null,
          // El paso a `engaged` lo hace el envío, no una persona.
          changedBy: step === 2 ? 'system' : (owner ? owner.name : 'system'),
          statusFrom: path[step - 1], statusTo: path[step],
          note: step === 2
            ? 'Cold outreach email sent.'
            : 'Moved forward after the call with the decision maker.',
          tags: step === 2 ? ['#outreach'] : [],
          // Repartidos entre el primer contacto y hoy, nunca después de hoy.
          createdAt: daysAfter(c.lastContactedAt, Math.floor(spanDays * (step - 2) / moves))
        });
      }
    }
    if (c.pipelineStage === 'lost') {
      push({
        companyId: c.id, vacancyId: null, changedBy: (getMemberById(c.comercialId) || {}).name || 'system',
        statusFrom: 'engaged', statusTo: 'lost', note: pick(STATE_NOTES.lost, i),
        createdAt: daysAfter(c.lastContactedAt || c.createdAt, 12, '10:00')
      });
    }
  });

  // Vacantes: la detección y, si avanzó, cada movimiento con su nota.
  MOCK_VACANCIES.forEach(function (v, i) {
    const company = MOCK_COMPANIES.find(function (c) { return c.id === v.companyId; });
    push({
      vacancyId: v.id, companyId: v.companyId, changedBy: 'system',
      statusFrom: null, statusTo: 'detected',
      note: 'Vacancy detected automatically.', tags: ['#auto'],
      createdAt: formatStamp(v.detectedAtTs || v.detectedAt + 'T09:00')
    });

    const owner = getMemberById(v.comercialId) || getMemberById(v.sdrId);
    const chain = { contacted: ['contacted'], proposal: ['contacted', 'proposal'], won: ['contacted', 'proposal', 'won'], lost: ['contacted', 'lost'] };
    const steps = chain[v.status];
    if (!steps) return;
    let prev = 'detected';
    // Repartidos entre la detección y hoy: con saltos fijos, una vacante detectada
    // esta semana terminaba con movimientos fechados en el futuro.
    const span = Math.max(1, daysSince(v.detectedAt));
    steps.forEach(function (to, n) {
      push({
        vacancyId: v.id, companyId: v.companyId,
        changedBy: owner ? owner.name : 'system',
        statusFrom: prev, statusTo: to,
        note: pick(STATE_NOTES[to] || ['Status updated.'], i + n),
        tags: to === 'contacted' ? ['#email'] : [],
        createdAt: daysAfter(v.detectedAt, Math.floor(span * (n + 1) / (steps.length + 1)), '11:20')
      });
      prev = to;
    });
  });

  MOCK_STATE_HISTORY.sort(function (a, b) { return parseStamp(b.createdAt) - parseStamp(a.createdAt); });
})();

function getVacancyHistory(vacancyId) {
  return MOCK_STATE_HISTORY.filter(function (h) { return h.vacancyId === vacancyId; });
}

function getCompanyHistory(companyId) {
  return MOCK_STATE_HISTORY.filter(function (h) { return h.companyId === companyId && !h.vacancyId; });
}

// Un cambio nuevo entra al frente: el historial se lee de lo más reciente a lo más viejo.
function addStateHistory(entry) {
  const row = Object.assign({
    id: 'sh-' + (MOCK_STATE_HISTORY.length + 1),
    tags: [],
    createdAt: formatStamp(new Date())
  }, entry);
  MOCK_STATE_HISTORY.unshift(row);
  return row;
}

/* ============================================================================
   TRAZA DE EJECUCIÓN (public.execution_logs)
   Cada paso de los flujos deja acá su registro, con el flujo y el nodo que lo
   emitió, su mensaje y el consumo que causó. Para una vacante son los cuatro
   pasos que la trajeron: el encolado desde el barrido, la consulta del detalle,
   la clasificación y la persistencia. Es lo que el seguimiento muestra antes de
   que una persona la toque.
   ============================================================================ */
const MOCK_EXECUTION_LOGS = [];

(function seedExecutionLogs() {
  let seq = 0;
  function push(row) {
    MOCK_EXECUTION_LOGS.push(Object.assign({ id: 'ex-' + (++seq).toString().padStart(3, '0'), logLevel: 'info' }, row));
  }
  function minutesBefore(iso, n) {
    return formatStamp(new Date(parseStamp(iso).getTime() - n * 60000));
  }

  MOCK_VACANCIES.forEach(function (v, i) {
    const at = formatStamp(v.detectedAtTs || v.detectedAt + 'T09:00');
    const portal = v.sourcePortal;
    const execId = 'exec-' + v.id;
    const city = String(v.location || '').split(',')[0];
    const company = MOCK_COMPANIES.find(function (c) { return c.id === v.companyId; });

    // 1. El lanzador encola el aviso. El costo de la consulta es de la consulta, que
    //    devuelve muchos avisos, así que no se le carga a ninguno en particular.
    push({
      executionId: execId, vacancyId: v.id, step: 'queue',
      workflowName: portal === 'LinkedIn' ? '01_SWEEP_LINKEDIN' : '01_SWEEP_INDEED',
      nodeName: 'Enqueue vacancy',
      message: v.searchText
        ? 'Queued from the ' + portal + ' sweep of ' + city + ', ' + v.stateCode + ', searching “' + v.searchText + '”.'
        : 'Queued from the ' + portal + ' sweep of ' + city + ', ' + v.stateCode + '.',
      createdAt: minutesBefore(at, 7)
    });

    // 2. El detalle del aviso, que sí cuesta una consulta a la fuente.
    push({
      executionId: execId, vacancyId: v.id, step: 'detail',
      workflowName: '02_VACANCY_WORKER', nodeName: 'Fetch job detail',
      message: 'Fetched the posting detail from ' + portal + '.' +
        (v.description ? '' : ' The source did not expose a description.'),
      usageType: 'requests', usageAmount: 1, usageUnit: 'count',
      createdAt: minutesBefore(at, 5)
    });

    // 3. La clasificación. Las vacantes anteriores al clasificador no la tienen.
    if (v.aiConfidence !== null && v.aiConfidence !== undefined) {
      push({
        executionId: execId, vacancyId: v.id, step: 'classify',
        workflowName: '02_VACANCY_WORKER', nodeName: 'Classify remote viability',
        message: 'Classified ' + (v.remoteViable ? 'remote viable' : 'not remote viable') +
          ' with ' + Math.round(v.aiConfidence * 100) + '% confidence.',
        usageType: 'tokens', usageAmount: 1680 + (i * 137) % 2600, usageUnit: 'count',
        createdAt: minutesBefore(at, 3)
      });
    }

    // 4. La persistencia, que además resuelve o crea la empresa.
    push({
      executionId: execId, vacancyId: v.id, step: 'persist',
      workflowName: '02_VACANCY_WORKER', nodeName: 'Persist vacancy',
      message: 'Saved to the platform and matched to ' + (company ? company.name : 'its company') +
        ' by its ' + portal + ' company id.',
      createdAt: at
    });
  });

  MOCK_EXECUTION_LOGS.sort(function (a, b) { return parseStamp(b.createdAt) - parseStamp(a.createdAt); });
})();

function getVacancyExecutionLogs(vacancyId) {
  return MOCK_EXECUTION_LOGS.filter(function (l) { return l.vacancyId === vacancyId; });
}

// === ACTIVIDAD DE UN REGISTRO ===
// El seguimiento es el recorrido por el embudo: los cambios de estado de `states_history`,
// de lo más reciente a lo más viejo. Cada entrada declara su `kind` por si más adelante
// convive con otra cosa.
// Los pasos de los flujos (`public.execution_logs`) quedan sembrados y consultables con
// getVacancyExecutionLogs / getCompanyExecutionLogs, pero no se muestran acá: van a tener
// su propia página de consulta y filtrado del registro de ejecución.
function stageEntries(history) {
  return history.map(function (h) {
    return {
      kind: 'stage', at: h.createdAt, by: h.changedBy,
      statusFrom: h.statusFrom, statusTo: h.statusTo,
      note: h.note, tags: h.tags
    };
  });
}

function byNewest(a, b) { return parseStamp(b.at) - parseStamp(a.at); }

function getVacancyActivity(vacancyId) {
  return stageEntries(getVacancyHistory(vacancyId)).sort(byNewest);
}

/* ============================================================================
   ENRIQUECIMIENTO DE LA EMPRESA (HUPEA-1.6)
   Lo que el flujo consolida de Apollo, del sitio web y del modelo: firmografía en
   `public.company` y la investigación en `public.company_research`. Una empresa que
   ninguna fuente devolvió queda con `is_researched = true` y sin campos.
   La tabla admite además `mission`, `vision` y `company_history`, que el motor nuevo
   no escribe: los dejaba el pipeline anterior de Company Decision Maker.
   ============================================================================ */
(function seedCompanyResearch() {
  const research = {
    'comp-001': { revenue: 140000000, founded: 2009, apollo: '5f2a91b0c4e7',
      value: 'Builds and operates order-management software for mid-market distributors in the US, sold as a subscription with implementation and ongoing support included.',
      strengths: 'Owns the full stack, from the platform to the support desk. Long client tenure and a published uptime record. Runs its own tier-1 support instead of outsourcing it, which is the cost it is now trying to bring down.' },
    'comp-002': { revenue: 310000000, founded: 1998, apollo: '7c04e2f19a3d',
      value: 'Operates a network of 40 outpatient clinics across New York City, billing commercial insurers and Medicaid, with primary care and specialty services under one administrative structure.',
      strengths: 'Density in the boroughs and contracts with every major regional payer. Largely Spanish-speaking patient base served by bilingual front-desk and billing staff.' },
    'comp-003': { revenue: 62000000, founded: 2011, apollo: '3b8de5710c92',
      value: 'Advisory firm for mid-market companies in the Midwest, covering financial planning, transaction support and outsourced controller services.',
      strengths: 'Founder-led with a partner model that keeps senior people on accounts. Grew by adding services rather than headcount, which is why the back office is the bottleneck.' },
    'comp-004': { revenue: 11000000, founded: 2021, apollo: '9a17c3e0d5b4',
      value: 'Analytics platform that ingests operational data from mid-market manufacturers and returns scheduled reporting and anomaly alerts.',
      strengths: 'Series A funded, 85 people, no internal recruiting function. Engineering-heavy team that hires commercial and coordination roles through agencies.' },
    'comp-005': { revenue: 88000000, founded: 1994, apollo: '2e6b04a9f18c',
      value: 'Regional less-than-truckload carrier covering Texas and the surrounding states, with its own fleet and three terminals.',
      strengths: 'Owns its equipment and terminals, which keeps service predictable on regional lanes. Dispatch and billing are handled in-house on a legacy TMS.' },
    'comp-006': { revenue: 420000000, founded: 1977, apollo: '8d31f7c20b45',
      value: 'Designs and manufactures industrial automation equipment for food processing and packaging lines, with installation and maintenance contracts.',
      strengths: 'Fifty years of installed base and a service contract attached to most of it. Over 2,000 employees with an established HR function, so hiring is centralised.' },
    'comp-007': { revenue: 39000000, founded: 2006, apollo: '4f90a2c8e731',
      value: 'Charter school network of 14 campuses in the Boston area, publicly funded and enrolling by lottery, with blended in-person and online instruction.',
      strengths: 'Waitlisted enrolment and a largely Spanish-speaking family base. Administrative load concentrates in the spring admissions window rather than spreading across the year.' },
    'comp-008': { revenue: 1200000000, founded: 1985, apollo: '6a25c93f08de',
      value: 'National apparel and home goods retailer with 340 stores and an e-commerce channel, selling own-label and third-party brands.',
      strengths: 'Scale and a store footprint that supports buy-online-pick-up-in-store. Customer care is already split between an internal team and two BPO contracts.' },
    'comp-009': { revenue: 26000000, founded: 2017, apollo: '1c74b08e5d2a',
      value: 'B2B software for insurance brokers that automates policy servicing and renewal workflows, sold per seat to agencies in the US.',
      strengths: 'Growing account base with no offshore presence yet. Routes tier-1 tickets through automation and escalates exceptions to people, which is the work it is looking to cover.' },
    'comp-010': { revenue: 190000000, founded: 1989, apollo: '0b53e1a7c964',
      value: 'Contract pharmaceutical laboratory running formulation, stability testing and small-batch manufacturing for branded and generic clients.',
      strengths: 'FDA-registered facilities and a regulatory affairs team in-house. Most roles are lab- or site-bound, which limits what can be covered remotely.' },
    'comp-011': null,
    'comp-012': { revenue: 24000000, founded: 2013, apollo: 'd47f1c90a3b6',
      value: 'Regional staffing agency placing administrative, clerical and light industrial workers on temporary and temp-to-hire contracts across the Southeast.',
      strengths: 'Local branch network and same-week placement on clerical roles. Competes directly with Solvo on the same buyers.' }
  };

  MOCK_COMPANIES.forEach(function (c) {
    const r = research[c.id];
    c.isResearched = !!c.researchedAt;
    if (!r) {
      c.revenueUsd = null; c.yearFounded = null; c.apolloOrganizationId = null;
      c.valueProposition = null; c.strengthsDifferentiators = null; c.lastResearchAt = null;
      return;
    }
    c.revenueUsd = r.revenue;
    c.yearFounded = r.founded;
    c.apolloOrganizationId = r.apollo;
    c.valueProposition = r.value;
    c.strengthsDifferentiators = r.strengths;
    c.lastResearchAt = c.researchedAt;
  });
})();

// `mission`, `vision` y `company_history` no las escribe el motor nuevo: las dejó el
// pipeline anterior de Company Decision Maker y hoy las llena una persona. Están en
// unas pocas empresas, que es como se ven en la base: algunas completas y la mayoría no.
(function seedLegacyResearch() {
  const legacy = {
    'comp-001': {
      mission: 'Give mid-market distributors the same order-management tooling that enterprise buyers take for granted.',
      vision: 'Be the default order platform for distribution in North America by the end of the decade.',
      history: 'Founded in 2009 by two former ERP implementers in Miami. Bootstrapped until 2016, took growth equity in 2019, and has grown through renewals rather than new logos.'
    },
    'comp-003': {
      mission: 'Give growing Midwest companies the financial function they cannot yet hire in full.',
      vision: 'Become the outsourced finance department of choice for companies between $10M and $100M in revenue.',
      history: 'Started in 2011 as a two-partner tax practice and moved into advisory and outsourced controllership. Opened a second office in 2024.'
    },
    'comp-006': {
      mission: 'Keep food and packaging lines running with automation that plant teams can maintain themselves.',
      vision: 'Lead industrial automation for food processing in the Pacific Northwest and beyond.',
      history: 'Family-owned since 1977, now in its second generation. Added a service division in 1998, which today carries most of the recurring revenue.'
    }
  };
  MOCK_COMPANIES.forEach(function (c) {
    const r = legacy[c.id];
    c.mission = r ? r.mission : null;
    c.vision = r ? r.vision : null;
    c.companyHistory = r ? r.history : null;
  });
})();

// Ingresos anuales como los guarda el enriquecimiento: un entero en USD.
function revenueLabel(company) {
  const n = company && Number(company.revenueUsd);
  if (!n || !isFinite(n)) return '';
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1e6) return '$' + Math.round(n / 1e6) + 'M';
  return '$' + Math.round(n / 1e3) + 'K';
}

// Los dos hechos que la calificación calcula sobre datos ya persistidos, antes de
// llamar al modelo. `size_fit` tiene tres valores: fuera de rango no es lo mismo
// que sin dato, y tratarlos igual penalizaría justo al perfil objetivo.
function repeatedPosting(companyId) {
  const byPosition = {};
  let repeated = false;
  companyVacancies(companyId).forEach(function (v) {
    if (!v.positionId) return;
    byPosition[v.positionId] = (byPosition[v.positionId] || 0) + 1;
    if (byPosition[v.positionId] >= 2) repeated = true;
  });
  return repeated;
}

function sizeFit(company) {
  const n = company && Number(company.sizeEmployees);
  if (!n || !isFinite(n)) return 'unknown';
  return (n >= 20 && n <= 300) ? 'true' : 'false';
}

/* ============================================================================
   TRAZA DE EJECUCIÓN DE LA EMPRESA
   Los pasos que la trajeron a su estado actual: el enriquecimiento, la calificación
   y, cuando el puntaje superó el umbral, la búsqueda y el análisis de contactos.
   Cada uno con el consumo que causó, como lo registra `public.execution_logs`.
   ============================================================================ */
(function seedCompanyExecutionLogs() {
  let seq = 0;
  function push(row) {
    MOCK_EXECUTION_LOGS.push(Object.assign(
      { id: 'exc-' + (++seq).toString().padStart(3, '0'), logLevel: 'info' }, row));
  }
  function at(date, time) { return formatStamp(date + ' ' + time); }

  MOCK_COMPANIES.forEach(function (c, i) {
    const execId = 'exec-' + c.id;

    if (c.isResearched) {
      const sources = c.valueProposition ? ['apollo', 'model'] : ['apollo', 'brightdata', 'model'];
      push({
        executionId: execId, companyId: c.id, step: 'enrich',
        workflowName: '03_COMPANY_WORKER', nodeName: 'Enrich company',
        message: c.valueProposition
          ? 'Enriched from Apollo and consolidated with the model. Classified as ' +
            (getIndustryLabel(c.industryCode) || 'unclassified') + '.'
          : 'No source returned the company. Marked as researched with no fields updated, so it is not qualified.',
        usageType: 'tokens', usageAmount: 2400 + (i * 211) % 1900, usageUnit: 'count',
        metadata: { sources: sources },
        createdAt: at(c.researchedAt, '07:12')
      });
    }

    if (c.qualifiedAt) {
      push({
        executionId: execId, companyId: c.id, step: 'qualify',
        workflowName: '03_COMPANY_WORKER', nodeName: 'Qualify lead',
        message: c.isExcluded
          ? 'Scored 0 and disqualified: ' + leadSignalLabel(c.exclusionReason) + '. Not queued for contacts.'
          : 'Scored ' + Math.round(c.icpScore) + ' out of 100 with ' + (c.leadSignals || []).length +
            ' signal' + ((c.leadSignals || []).length === 1 ? '' : 's') + '. ' +
            (c.contactsSearchedAt ? 'Queued for the contact search.' : 'Below the threshold, so no contact search.'),
        usageType: 'tokens', usageAmount: 1900 + (i * 173) % 1500, usageUnit: 'count',
        createdAt: at(c.qualifiedAt, '07:31')
      });
    }

    if (c.contactsSearchedAt) {
      const kept = countDecisionMakers(c.id);
      const analyzed = kept + 3 + (i % 4);
      push({
        executionId: execId, companyId: c.id, step: 'contacts_search',
        workflowName: '04_CONTACTS_WORKER', nodeName: 'Search people',
        message: 'Found ' + analyzed + ' people at the company through Apollo.',
        usageType: 'credits', usageAmount: 1, usageUnit: 'count',
        createdAt: at(c.contactsSearchedAt, '08:04')
      });
      push({
        executionId: execId, companyId: c.id, step: 'contacts_analyze',
        workflowName: '04_CONTACTS_WORKER', nodeName: 'Analyze profiles',
        message: 'Normalised ' + analyzed + ' titles into role codes and kept ' + kept +
          ' as decision maker' + (kept === 1 ? '' : 's') + '; the rest did not qualify.',
        usageType: 'tokens', usageAmount: 320 * analyzed, usageUnit: 'count',
        createdAt: at(c.contactsSearchedAt, '08:09')
      });
      if (kept) {
        push({
          executionId: execId, companyId: c.id, step: 'contacts_reveal',
          workflowName: '04_CONTACTS_WORKER', nodeName: 'Reveal and verify',
          message: 'Revealed ' + kept + ' email' + (kept === 1 ? '' : 's') + ' and verified them with Hunter.',
          usageType: 'credits', usageAmount: kept, usageUnit: 'count',
          createdAt: at(c.contactsSearchedAt, '08:15')
        });
      }
    }
  });

  MOCK_EXECUTION_LOGS.sort(function (a, b) { return parseStamp(b.createdAt) - parseStamp(a.createdAt); });
})();

function getCompanyExecutionLogs(companyId) {
  return MOCK_EXECUTION_LOGS.filter(function (l) { return l.companyId === companyId && !l.vacancyId; });
}

// Actividad de una empresa: los pasos de los flujos, los cambios de etapa y la marca
// de exportación, en una sola línea de lo más reciente a lo más viejo.
const COMPANY_STEP_TITLES = {
  enrich: 'Enriched', qualify: 'Qualified',
  contacts_search: 'Contacts searched', contacts_analyze: 'Profiles analyzed', contacts_reveal: 'Emails revealed'
};

function getCompanyActivity(companyId) {
  return stageEntries(getCompanyHistory(companyId)).sort(byNewest);
}

/* ============================================================================
   SERIE DIARIA DE MÉTRICAS
   Los listados muestran registros uno por uno; el tablero muestra volumen, que es
   otra escala. Esta serie representa lo que el motor produce corriendo a diario:
   el barrido cubre los estados del día, cada aviso se clasifica, y de ahí salen
   empresas y decisores. Los órdenes de magnitud vienen de lo medido en la épica —
   152 ciudades en 50 estados, una página por consulta, y un rendimiento por ciudad
   que va de 13 vacantes útiles en Dallas a 1 en Orlando.
   Es determinista: la misma fecha da siempre el mismo número.
   ============================================================================ */
const DAILY_WINDOW_DAYS = 30;

// Generador reproducible: sin él, cada recarga movería los gráficos y ninguna
// comparación entre dos lecturas de la misma pantalla sería válida.
function seededNoise(seed) {
  let x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const MOCK_DAILY_METRICS = (function buildDailyMetrics() {
  const rows = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let i = DAILY_WINDOW_DAYS - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const iso = d.toISOString().slice(0, 10);
    const dow = d.getUTCDay();
    const n = seededNoise(d.getTime() / 86400000);

    // El barrido corre de lunes a viernes: el fin de semana cae a una fracción.
    const weekend = (dow === 0 || dow === 6);
    const base = weekend ? 34 : 168;
    const positions = Math.round(base * (0.78 + n * 0.5));
    // El clasificador da por viable algo más de la mitad de lo que el barrido por
    // posición trae; el barrido por geografía rendía mucho menos.
    const viable = Math.round(positions * (0.49 + seededNoise(d.getTime() / 86400000 + 7) * 0.16));
    // Una empresa aparece varias veces: no hay una empresa nueva por vacante.
    const companies = Math.round(positions * (0.19 + seededNoise(d.getTime() / 86400000 + 13) * 0.07));
    // Solo se buscan contactos de las que superan el umbral, y no todas devuelven.
    const withDm = Math.round(companies * (0.31 + seededNoise(d.getTime() / 86400000 + 23) * 0.14));
    const decisionMakers = Math.round(withDm * (1.4 + seededNoise(d.getTime() / 86400000 + 31) * 0.8));
    const viableCompanies = Math.round(companies * (0.55 + seededNoise(d.getTime() / 86400000 + 41) * 0.18));

    rows.push({
      date: iso, weekend: weekend,
      positions: positions, viablePositions: viable,
      companies: companies, viableCompanies: viableCompanies,
      companiesWithDm: withDm, decisionMakers: decisionMakers
    });
  }
  return rows;
})();

// Recorte de la serie a la ventana pedida, desde el día más viejo al más nuevo.
function dailyMetrics(days) {
  return MOCK_DAILY_METRICS.slice(Math.max(0, MOCK_DAILY_METRICS.length - days));
}

function sumMetric(rows, key) {
  return rows.reduce(function (n, r) { return n + r[key]; }, 0);
}

/* ---- Funnel de agendamiento (public.funnel_events) -------------------------
   El embudo del cold outreach hasta la reserva. Los eventos los escribe el webhook
   de Brevo (entrega, apertura, click) y el backend de la landing (visita, franja,
   reserva). La depuración del tracking demostró que el 98% de los clicks del mes
   ocurre a ≤5 minutos de la entrega —escáneres antispam corporativos—, así que la
   serie separa la interacción humana verificada del tráfico automático.
   `availability_shown` y `visible_error` se registran pero no son etapas: viven en
   el registro de abajo.
   --------------------------------------------------------------------------- */
const BOOKING_FUNNEL_STAGES = [
  { key: 'email_delivered', label: 'Delivered', note: 'Brevo accepted the send' },
  { key: 'email_opened', label: 'Opened', note: 'Tracking pixel fired' },
  { key: 'email_click', label: 'Clicked', note: 'Followed the link to the landing' },
  { key: 'landing_view', label: 'Landing viewed', note: 'The booking page rendered' },
  { key: 'slot_selected', label: 'Slot selected', note: 'Picked a time from the calendar' },
  { key: 'booking_confirmed', label: 'Booked', note: 'The server confirmed the meeting' }
];

const MOCK_BOOKING_FUNNEL = (function buildBookingFunnel() {
  const rows = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = DAILY_WINDOW_DAYS - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const iso = d.toISOString().slice(0, 10);
    const dow = d.getUTCDay();
    const n = seededNoise(d.getTime() / 86400000 + 101);
    const weekend = (dow === 0 || dow === 6);

    const delivered = weekend ? 0 : Math.round(210 * (0.8 + n * 0.45));
    const opened = Math.round(delivered * (0.28 + seededNoise(d.getTime() / 86400000 + 103) * 0.12));
    // Humanos, ya descontados los escáneres.
    const clicked = Math.round(opened * (0.07 + seededNoise(d.getTime() / 86400000 + 107) * 0.05));
    const automated = Math.round(delivered * (0.21 + seededNoise(d.getTime() / 86400000 + 109) * 0.09));
    const landing = Math.round(clicked * (0.86 + seededNoise(d.getTime() / 86400000 + 113) * 0.12));
    const availability = Math.round(landing * (0.9 + seededNoise(d.getTime() / 86400000 + 127) * 0.09));
    const slot = Math.round(landing * (0.32 + seededNoise(d.getTime() / 86400000 + 131) * 0.2));
    const booked = Math.round(slot * (0.52 + seededNoise(d.getTime() / 86400000 + 137) * 0.3));
    const errors = seededNoise(d.getTime() / 86400000 + 139) > 0.86 ? 1 : 0;

    rows.push({
      date: iso, weekend: weekend,
      email_delivered: delivered, email_opened: opened, email_click: clicked,
      landing_view: landing, availability_shown: availability,
      slot_selected: slot, booking_confirmed: booked,
      automated_clicks: automated, visible_error: errors
    });
  }
  return rows;
})();

function bookingFunnel(days) {
  return MOCK_BOOKING_FUNNEL.slice(Math.max(0, MOCK_BOOKING_FUNNEL.length - days));
}
