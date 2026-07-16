// ============================================
// RBAC Engine - Solvo Platform Prototype v14.0
// 5 Roles, Dual Assignment (Sales Rep + SDR)
// ============================================

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

// === MOCK ASSIGNMENT DATA (Dual: Sales Rep + SDR) ===
const MOCK_COMPANIES = [
  { id: 'comp-001', name: 'TechCorp Solutions', industry: 'Technology', location: 'Miami, FL', website: 'https://techcorp.com', linkedinId: 'techcorp-solutions', pipelineStage: 'onboarding_started', type: 'client', remoteViable: true, comercialId: 'uuid-staff-001', sdrId: 'uuid-staff-006', coordinatorId: 'uuid-staff-004', contactsCount: 4 },
  { id: 'comp-002', name: 'GlobalHealth Inc', industry: 'Healthcare', location: 'New York, NY', website: 'https://globalhealth.com', linkedinId: 'globalhealth-inc', pipelineStage: 'prospecting', type: 'prospecto', remoteViable: true, comercialId: 'uuid-staff-001', sdrId: 'uuid-staff-007', coordinatorId: 'uuid-staff-004', contactsCount: 2 },
  { id: 'comp-003', name: 'FinServe Partners', industry: 'Finance', location: 'Chicago, IL', website: 'https://finserve.com', linkedinId: 'finserve-partners', pipelineStage: 'engaged', type: 'prospecto', remoteViable: true, comercialId: 'uuid-staff-002', sdrId: 'uuid-staff-006', coordinatorId: 'uuid-staff-004', contactsCount: 3 },
  { id: 'comp-004', name: 'DataStream Analytics', industry: 'Technology', location: 'Austin, TX', website: 'https://datastream.io', linkedinId: 'datastream-analytics', pipelineStage: 'lead', type: 'prospecto', remoteViable: true, comercialId: null, sdrId: 'uuid-staff-006', coordinatorId: null, contactsCount: 1 },
  { id: 'comp-005', name: 'Meridian Logistics', industry: 'Logistics', location: 'Dallas, TX', website: 'https://meridianlog.com', linkedinId: null, pipelineStage: 'initial_appointment_held', type: 'prospecto', remoteViable: false, comercialId: 'uuid-staff-003', sdrId: null, coordinatorId: 'uuid-staff-004', contactsCount: 2 },
  { id: 'comp-006', name: 'NovaTech Industries', industry: 'Manufacturing', location: 'Seattle, WA', website: 'https://novatech.com', linkedinId: 'novatech-industries', pipelineStage: 'client', type: 'client', remoteViable: true, comercialId: 'uuid-staff-002', sdrId: 'uuid-staff-007', coordinatorId: 'uuid-staff-008', contactsCount: 5 },
  { id: 'comp-007', name: 'Summit Education', industry: 'Education', location: 'Boston, MA', website: 'https://summitedu.org', linkedinId: 'summit-education', pipelineStage: 'lead', type: 'prospecto', remoteViable: true, comercialId: null, sdrId: null, coordinatorId: null, contactsCount: 0 },
  { id: 'comp-008', name: 'Apex Retail Group', industry: 'Retail', location: 'Los Angeles, CA', website: 'https://apexretail.com', linkedinId: 'apex-retail-group', pipelineStage: 'prospecting', type: 'prospecto', remoteViable: true, comercialId: 'uuid-staff-003', sdrId: 'uuid-staff-011', coordinatorId: 'uuid-staff-009', contactsCount: 3 },
  { id: 'comp-009', name: 'CloudBridge Systems', industry: 'Technology', location: 'San Francisco, CA', website: 'https://cloudbridge.io', linkedinId: 'cloudbridge-systems', pipelineStage: 'engaged', type: 'prospecto', remoteViable: true, comercialId: 'uuid-staff-001', sdrId: 'uuid-staff-006', coordinatorId: 'uuid-staff-004', contactsCount: 2 },
  { id: 'comp-010', name: 'PharmaVita Labs', industry: 'Healthcare', location: 'Philadelphia, PA', website: 'https://pharmavita.com', linkedinId: null, pipelineStage: 'lost', type: 'inactivo', remoteViable: false, comercialId: 'uuid-staff-002', sdrId: null, coordinatorId: 'uuid-staff-004', contactsCount: 1 }
];

// Mock contacts based on company_contacts schema
const MOCK_CONTACTS = [
  { id: 'ct-001', companyId: 'comp-001', fullName: 'James Wilson', position: 'CTO', department: 'Technology', seniorityLevel: 'C-Level', email: 'j.wilson@techcorp.com', phone: '+1 305-555-0101', linkedinUrl: 'https://linkedin.com/in/jameswilson' },
  { id: 'ct-002', companyId: 'comp-001', fullName: 'Sarah Chen', position: 'VP Engineering', department: 'Technology', seniorityLevel: 'VP', email: 's.chen@techcorp.com', phone: '+1 305-555-0102', linkedinUrl: 'https://linkedin.com/in/sarachen' },
  { id: 'ct-003', companyId: 'comp-001', fullName: 'Mike Thompson', position: 'HR Director', department: 'Human Resources', seniorityLevel: 'Director', email: 'm.thompson@techcorp.com', phone: '+1 305-555-0103', linkedinUrl: 'https://linkedin.com/in/mikethompson' },
  { id: 'ct-004', companyId: 'comp-001', fullName: 'Emily Davis', position: 'Talent Acquisition Lead', department: 'Human Resources', seniorityLevel: 'Manager', email: 'e.davis@techcorp.com', phone: null, linkedinUrl: 'https://linkedin.com/in/emilydavis' },
  { id: 'ct-005', companyId: 'comp-002', fullName: 'Dr. Robert Kim', position: 'CEO', department: 'Executive', seniorityLevel: 'C-Level', email: 'r.kim@globalhealth.com', phone: '+1 212-555-0201', linkedinUrl: 'https://linkedin.com/in/drrobertkim' },
  { id: 'ct-006', companyId: 'comp-002', fullName: 'Lisa Park', position: 'VP Operations', department: 'Operations', seniorityLevel: 'VP', email: 'l.park@globalhealth.com', phone: '+1 212-555-0202', linkedinUrl: null },
  { id: 'ct-007', companyId: 'comp-003', fullName: 'David Martinez', position: 'Managing Partner', department: 'Executive', seniorityLevel: 'C-Level', email: 'd.martinez@finserve.com', phone: '+1 312-555-0301', linkedinUrl: 'https://linkedin.com/in/davidmartinez' },
  { id: 'ct-008', companyId: 'comp-003', fullName: 'Jennifer Lee', position: 'CFO', department: 'Finance', seniorityLevel: 'C-Level', email: 'j.lee@finserve.com', phone: '+1 312-555-0302', linkedinUrl: 'https://linkedin.com/in/jenniferlee' },
  { id: 'ct-009', companyId: 'comp-003', fullName: 'Tom Baker', position: 'Recruiting Manager', department: 'Human Resources', seniorityLevel: 'Manager', email: 't.baker@finserve.com', phone: null, linkedinUrl: null },
  { id: 'ct-010', companyId: 'comp-004', fullName: 'Alex Rivera', position: 'Founder & CEO', department: 'Executive', seniorityLevel: 'C-Level', email: 'a.rivera@datastream.io', phone: '+1 512-555-0401', linkedinUrl: 'https://linkedin.com/in/alexrivera' },
  { id: 'ct-011', companyId: 'comp-005', fullName: 'Karen White', position: 'COO', department: 'Operations', seniorityLevel: 'C-Level', email: 'k.white@meridianlog.com', phone: '+1 214-555-0501', linkedinUrl: 'https://linkedin.com/in/karenwhite' },
  { id: 'ct-012', companyId: 'comp-005', fullName: 'Steve Brown', position: 'Logistics Director', department: 'Operations', seniorityLevel: 'Director', email: 's.brown@meridianlog.com', phone: '+1 214-555-0502', linkedinUrl: null },
  { id: 'ct-013', companyId: 'comp-006', fullName: 'Rachel Green', position: 'CEO', department: 'Executive', seniorityLevel: 'C-Level', email: 'r.green@novatech.com', phone: '+1 206-555-0601', linkedinUrl: 'https://linkedin.com/in/rachelgreen' },
  { id: 'ct-014', companyId: 'comp-006', fullName: 'Mark Johnson', position: 'VP Sales', department: 'Sales', seniorityLevel: 'VP', email: 'm.johnson@novatech.com', phone: '+1 206-555-0602', linkedinUrl: 'https://linkedin.com/in/markjohnson' },
  { id: 'ct-015', companyId: 'comp-006', fullName: 'Amy Wu', position: 'Engineering Manager', department: 'Technology', seniorityLevel: 'Manager', email: 'a.wu@novatech.com', phone: null, linkedinUrl: 'https://linkedin.com/in/amywu' },
  { id: 'ct-016', companyId: 'comp-006', fullName: 'Chris Taylor', position: 'HR Business Partner', department: 'Human Resources', seniorityLevel: 'Manager', email: 'c.taylor@novatech.com', phone: '+1 206-555-0604', linkedinUrl: null },
  { id: 'ct-017', companyId: 'comp-006', fullName: 'Diana Ross', position: 'Plant Manager', department: 'Manufacturing', seniorityLevel: 'Director', email: 'd.ross@novatech.com', phone: '+1 206-555-0605', linkedinUrl: 'https://linkedin.com/in/dianaross' },
  { id: 'ct-018', companyId: 'comp-008', fullName: 'Paul Adams', position: 'VP Retail Operations', department: 'Operations', seniorityLevel: 'VP', email: 'p.adams@apexretail.com', phone: '+1 310-555-0801', linkedinUrl: 'https://linkedin.com/in/pauladams' },
  { id: 'ct-019', companyId: 'comp-008', fullName: 'Monica Bell', position: 'Talent Director', department: 'Human Resources', seniorityLevel: 'Director', email: 'm.bell@apexretail.com', phone: '+1 310-555-0802', linkedinUrl: 'https://linkedin.com/in/monicabell' },
  { id: 'ct-020', companyId: 'comp-008', fullName: 'Nathan Clark', position: 'Marketing Manager', department: 'Marketing', seniorityLevel: 'Manager', email: 'n.clark@apexretail.com', phone: null, linkedinUrl: null },
  { id: 'ct-021', companyId: 'comp-009', fullName: 'Sophia Nguyen', position: 'CTO', department: 'Technology', seniorityLevel: 'C-Level', email: 's.nguyen@cloudbridge.io', phone: '+1 415-555-0901', linkedinUrl: 'https://linkedin.com/in/sophianguyen' },
  { id: 'ct-022', companyId: 'comp-009', fullName: 'Ryan Foster', position: 'Head of Product', department: 'Product', seniorityLevel: 'Director', email: 'r.foster@cloudbridge.io', phone: '+1 415-555-0902', linkedinUrl: 'https://linkedin.com/in/ryanfoster' },
  { id: 'ct-023', companyId: 'comp-010', fullName: 'Dr. Helen Moore', position: 'Chief Scientific Officer', department: 'R&D', seniorityLevel: 'C-Level', email: 'h.moore@pharmavita.com', phone: '+1 215-555-1001', linkedinUrl: 'https://linkedin.com/in/drhelenmoore' }
];

function getContactsForCompany(companyId) {
  return MOCK_CONTACTS.filter(c => c.companyId === companyId);
}

const MOCK_VACANCIES = [
  { id: 'vac-001', title: 'Senior Software Engineer', companyId: 'comp-001', status: 'contacted', source: 'general_us', stateCode: 'FL', remoteViable: true, salary: '$120K - $150K', salaryBucket: '100-150', description: 'Build scalable microservices using Node.js and AWS.', detectedAt: '2026-04-10', comercialId: 'uuid-staff-001', comercialType: 'inherited', sdrId: 'uuid-staff-006', sdrType: 'inherited' },
  { id: 'vac-002', title: 'DevOps Lead', companyId: 'comp-001', status: 'proposal', source: 'general_us', stateCode: 'FL', remoteViable: true, salary: '$130K - $160K', salaryBucket: '100-150', description: 'Lead CI/CD pipeline architecture for cloud infrastructure.', detectedAt: '2026-04-08', comercialId: 'uuid-staff-001', comercialType: 'inherited', sdrId: 'uuid-staff-006', sdrType: 'inherited' },
  { id: 'vac-003', title: 'Product Manager', companyId: 'comp-001', status: 'detected', source: 'current_client', stateCode: 'FL', remoteViable: true, salary: '$110K - $140K', salaryBucket: '100-150', description: 'Drive product strategy for SaaS platform.', detectedAt: '2026-04-12', comercialId: 'uuid-staff-002', comercialType: 'direct', sdrId: 'uuid-staff-006', sdrType: 'inherited' },
  { id: 'vac-004', title: 'Data Scientist', companyId: 'comp-002', status: 'detected', source: 'general_us', stateCode: 'NY', remoteViable: true, salary: '$140K - $170K', salaryBucket: '150+', description: 'ML models for patient outcome prediction.', detectedAt: '2026-04-11', comercialId: 'uuid-staff-001', comercialType: 'inherited', sdrId: 'uuid-staff-007', sdrType: 'inherited' },
  { id: 'vac-005', title: 'Financial Analyst', companyId: 'comp-003', status: 'contacted', source: 'general_us', stateCode: 'IL', remoteViable: true, salary: '$80K - $100K', salaryBucket: '50-100', description: 'Financial modeling and forecasting for investment portfolio.', detectedAt: '2026-04-09', comercialId: 'uuid-staff-002', comercialType: 'inherited', sdrId: 'uuid-staff-006', sdrType: 'inherited' },
  { id: 'vac-006', title: 'React Developer', companyId: 'comp-004', status: 'detected', source: 'general_us', stateCode: 'TX', remoteViable: true, salary: '$90K - $120K', salaryBucket: '50-100', description: 'Frontend development with React and TypeScript.', detectedAt: '2026-04-13', comercialId: null, comercialType: null, sdrId: 'uuid-staff-006', sdrType: 'inherited' },
  { id: 'vac-007', title: 'Supply Chain Manager', companyId: 'comp-005', status: 'won', source: 'current_client', stateCode: 'TX', remoteViable: false, salary: '$95K - $115K', salaryBucket: '50-100', description: 'End-to-end supply chain optimization.', detectedAt: '2026-03-28', comercialId: 'uuid-staff-003', comercialType: 'inherited', sdrId: null, sdrType: null },
  { id: 'vac-008', title: 'QA Automation Engineer', companyId: 'comp-006', status: 'contacted', source: 'general_us', stateCode: 'WA', remoteViable: true, salary: '$100K - $130K', salaryBucket: '100-150', description: 'Build automated test suites for manufacturing control systems.', detectedAt: '2026-04-07', comercialId: 'uuid-staff-002', comercialType: 'inherited', sdrId: 'uuid-staff-007', sdrType: 'inherited' },
  { id: 'vac-009', title: 'UX Researcher', companyId: 'comp-009', status: 'detected', source: 'general_us', stateCode: 'CA', remoteViable: true, salary: '$105K - $130K', salaryBucket: '100-150', description: 'User research for B2B SaaS products.', detectedAt: '2026-04-12', comercialId: 'uuid-staff-001', comercialType: 'inherited', sdrId: 'uuid-staff-006', sdrType: 'inherited' },
  { id: 'vac-010', title: 'Marketing Coordinator', companyId: 'comp-008', status: 'lost', source: 'general_us', stateCode: 'CA', remoteViable: true, salary: '$55K - $70K', salaryBucket: '50-100', description: 'Manage digital marketing campaigns for retail brand.', detectedAt: '2026-03-20', comercialId: 'uuid-staff-003', comercialType: 'inherited', sdrId: 'uuid-staff-011', sdrType: 'inherited' }
];

// === ON-DEMAND OPENINGS (ODO) ===
// Seed last_scraped_at per company (base for the cooldown). null = never scraped on-demand.
(function seedOdState() {
  function daysAgo(n) { var d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); }
  var seed = { 'comp-001': daysAgo(2), 'comp-003': daysAgo(1), 'comp-006': daysAgo(18), 'comp-009': daysAgo(40) };
  MOCK_COMPANIES.forEach(function (c) { c.lastScrapedAt = seed[c.id] || null; });
})();

// Seed portal URLs per company (base de los badges LinkedIn/Indeed). Reutiliza company.linkedinId / indeedId.
// Variedad: algunas con ambos portales, otras con uno solo, otras con ninguno.
(function seedPortalUrls() {
  var hasIndeed = { 'comp-001': true, 'comp-002': true, 'comp-004': true, 'comp-006': true, 'comp-009': true };
  MOCK_COMPANIES.forEach(function (c) {
    c.linkedinUrl = c.linkedinId ? ('https://linkedin.com/company/' + c.linkedinId) : null;
    if (hasIndeed[c.id]) {
      c.indeedId = c.indeedId || c.id;
      c.indeedUrl = 'https://indeed.com/cmp/' + (c.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    } else {
      c.indeedId = null; c.indeedUrl = null;
    }
  });
})();

// On-demand vacancies (origin = on_demand) returned by a previous on-demand run
MOCK_VACANCIES.push(
  { id: 'vac-od-001', title: 'Bilingual Customer Service Rep', companyId: 'comp-006', status: 'detected', source: 'on_demand', stateCode: 'WA', remoteViable: true, salary: '$45K - $55K', salaryBucket: '50-100', description: 'Inbound/outbound support for US customers, English C1+.', detectedAt: '2026-06-15', comercialId: 'uuid-staff-002', comercialType: 'inherited', sdrId: 'uuid-staff-007', sdrType: 'inherited' },
  { id: 'vac-od-002', title: 'Collections Specialist', companyId: 'comp-006', status: 'detected', source: 'on_demand', stateCode: 'WA', remoteViable: true, salary: '$50K - $62K', salaryBucket: '50-100', description: 'B2B collections, bilingual.', detectedAt: '2026-06-15', comercialId: 'uuid-staff-002', comercialType: 'inherited', sdrId: 'uuid-staff-007', sdrType: 'inherited' },
  { id: 'vac-od-003', title: 'Virtual Assistant', companyId: 'comp-009', status: 'detected', source: 'on_demand', stateCode: 'CA', remoteViable: true, salary: '$40K - $50K', salaryBucket: '0-50', description: 'Executive assistant, fully remote.', detectedAt: '2026-06-10', comercialId: 'uuid-staff-001', comercialType: 'inherited', sdrId: 'uuid-staff-006', sdrType: 'inherited' }
);

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

/* === Header: titulo de producto + controles (idioma / tema) === */
const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Espa\u00f1ol' }
];

function getLang() {
  try { return localStorage.getItem('lang') || 'es'; } catch (e) { return 'es'; }
}

function setLang(code) {
  try { localStorage.setItem('lang', code); } catch (e) {}
  renderLangDropdown();
}

function renderLangDropdown() {
  const dd = document.getElementById('lang-dropdown');
  if (!dd) return;
  const current = getLang();
  dd.innerHTML = LANGS.map(l =>
    `<button type="button" class="lang-option${l.code === current ? ' active' : ''}" onclick="setLang('${l.code}')">${l.label}</button>`
  ).join('');
}

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
  wrap.innerHTML = `
    <div class="lang-switch">
      <button type="button" class="header-icon-btn" id="lang-toggle" title="Idioma" aria-label="Cambiar idioma">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
      </button>
      <div class="lang-dropdown" id="lang-dropdown"></div>
    </div>`;
  header.appendChild(wrap);
  renderLangDropdown();
  document.getElementById('lang-toggle').addEventListener('click', function (e) {
    e.stopPropagation();
    document.getElementById('lang-dropdown').classList.toggle('open');
  });
  document.addEventListener('click', function () {
    const dd = document.getElementById('lang-dropdown');
    if (dd) dd.classList.remove('open');
  });
}

function renderSidebar(activePage) {
  const user = getCurrentUser();
  if (!user) return;

  const roleName = getRoleName();
  const initials = user.name.split(' ').map(n => n[0]).join('');
  const showAdmin = canAccessAdmin();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: 'dashboard.html', icon: '<rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect>' },
    { id: 'vacancies', label: 'Vacancies', href: 'vacancies.html', icon: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect>' },
    { id: 'companies', label: 'Companies', href: 'companies.html', icon: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path>' }
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

function handleAccessDenied(message) {
  alert(message || 'No tienes acceso a este registro.');
  window.location.href = 'dashboard.html';
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
            ${canRestoreComercial ? '<button class="btn-restore" id="popup-comercial-restore">Restaurar herencia</button>' : ''}
          </div>
          <div class="assign-popup-note" id="popup-comercial-note" style="display:none;"></div>
        </div>
        <div class="assign-popup-row">
          <div class="assign-popup-label">SDR ${sdrTypeLabel}</div>
          <div class="assign-popup-field">
            <div id="popup-sdr-search" style="flex:1; position:relative;"></div>
            <button class="btn-clear" id="popup-sdr-clear" title="Remove assignment" ${!currentSdrId ? 'style="display:none"' : ''}>&times;</button>
            ${canRestoreSdr ? '<button class="btn-restore" id="popup-sdr-restore">Restaurar herencia</button>' : ''}
          </div>
          <div class="assign-popup-note" id="popup-sdr-note" style="display:none;"></div>
        </div>
        ${coordinator ? `<div class="assign-popup-row" style="opacity:0.6">
          <div class="assign-popup-label">Coordinator/Supervisor</div>
          <div style="font-size:14px; color:var(--text-primary); padding:6px 0;">${coordinator.name} <span style="font-size:12px; color:var(--text-muted);">(auto-asignado)</span></div>
        </div>` : ''}
      </div>
      <div class="assign-popup-footer">
        <button class="btn btn-ghost btn-sm" onclick="this.closest('.assign-popup-overlay').remove()">Cancel</button>
        <button class="btn btn-primary btn-sm" id="popup-save-btn" disabled>Guardar</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  // Render searchboxes
  function renderSearchbox(containerId, items, currentId, onChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const current = currentId ? items.find(i => i.id === currentId) : null;
    container.innerHTML = `
      <input type="text" class="form-input" id="${containerId}-input" placeholder="Buscar..." value="${current ? current.name : ''}" autocomplete="off" style="font-size:14px;" />
      <div id="${containerId}-results" style="display:none; position:absolute; top:100%; left:0; right:0; z-index:100; max-height:200px; overflow-y:auto; background:var(--bg-surface-raised); border:1px solid var(--border-color); border-radius:var(--radius-input); margin-top:4px; box-shadow:var(--shadow-lg);"></div>`;
    const input = document.getElementById(`${containerId}-input`);
    const results = document.getElementById(`${containerId}-results`);
    let isOpen = false;

    function render(filter) {
      const q = (filter || '').toLowerCase();
      const filtered = q ? items.filter(i => i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q)) : items;
      let html = '';
      if (!filtered.length && q) {
        html = '<div style="padding:8px 12px; color:var(--text-muted); font-size:13px;">Sin resultados</div>';
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
    companyName, // for vacancy inheritance display
    showInheritance = false,
    updatedAt = null, // fecha de última modificación de asignación
    onManage = null
  } = options;

  const container = document.getElementById(containerId);
  if (!container) return;

  const comercial = comercialId ? getMemberById(comercialId) : null;
  const sdr = sdrId ? getMemberById(sdrId) : null;
  const coordinator = coordinatorId ? getMemberById(coordinatorId) : null;

  function slotHTML(label, member, type, companyName) {
    let valueHTML = member
      ? `<div class="assign-slot-value">${member.name}</div>`
      : '<div class="assign-slot-value unassigned">Unassigned</div>';
    let typeHTML = '';
    if (showInheritance && member) {
      if (type === 'inherited') typeHTML = `<div class="assign-slot-type">inherited from ${companyName || 'company'}</div>`;
      else if (type === 'direct') typeHTML = '<div class="assign-slot-type"><span class="badge-direct">direct</span></div>';
    }
    return `<div><div class="assign-slot-label">${label}</div>${valueHTML}${typeHTML}</div>`;
  }

  const manageBtn = canAssign() && onManage
    ? `<button class="btn btn-secondary btn-sm" onclick="(${onManage.toString()})()">Manage assignment</button>`
    : '';

  container.innerHTML = `
    <div class="assign-section">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
        <div class="assign-section-title">Assignment</div>
        ${manageBtn}
      </div>
      <div class="assign-section-grid">
        ${slotHTML('Sales Rep', comercial, comercialType, companyName)}
        ${slotHTML('SDR', sdr, sdrType, companyName)}
        <div>
          <div class="assign-slot-label">Coordinator/Supervisor</div>
          ${coordinator ? `<div class="assign-slot-value">${coordinator.name}</div>` : '<div class="assign-slot-value unassigned">Unassigned</div>'}
        </div>
      </div>
      ${updatedAt ? `<div class="assign-section-updated">Last modified: ${updatedAt}</div>` : ''}
    </div>`;
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
        <button class="modal-close" aria-label="Cerrar">&times;</button>
      </div>
      <div class="assign-popup-body" style="text-align:center;">
        <div class="confirm-icon">${iconHTML}</div>
        <p style="font-size:14px; color:var(--text-secondary); line-height:1.5; margin:0;">${message}</p>
        ${highlight ? `<p style="font-size:14px; font-weight:700; color:var(--text-strong); margin:14px 0 0;">${highlight}</p>` : ''}
      </div>
      <div class="modal-footer" style="justify-content:center;">
        <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
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
// Opens a confirmation popup before exporting, with optional contacts checkbox (companies)

function openExportPopup(options) {
  const {
    entityLabel = 'records',      // "companies" or "vacancies"
    entityCount = 0,
    contactsCount = 0,              // total contacts across entities (0 = hide checkbox)
    showContactsOption = false,     // show "Include contacts" checkbox
    onExport = (includeContacts) => {}
  } = options;

  if (entityCount === 0) {
    showToast(`No ${entityLabel} to export with the current filters`, 'info');
    return;
  }

  let includeContacts = false;

  const overlay = document.createElement('div');
  overlay.className = 'assign-popup-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  const contactsSection = showContactsOption ? `
    <div style="margin-top:16px; padding:12px; background:var(--bg-tertiary); border-radius:var(--radius-md);">
      <label style="display:flex; align-items:center; gap:10px; cursor:pointer; font-size:14px; color:var(--text-primary);">
        <input type="checkbox" id="export-include-contacts" style="width:16px; height:16px; accent-color:var(--color-secondary); cursor:pointer;" />
        Include associated contacts
      </label>
      <div id="export-contacts-count" style="margin-top:6px; font-size:13px; color:var(--text-muted); padding-left:26px; display:none;">
        <span style="font-weight:600; color:var(--text-secondary);">${contactsCount}</span> contacts from ${entityCount} companies
      </div>
    </div>` : '';

  overlay.innerHTML = `
    <div class="assign-popup" style="width:420px;">
      <div class="assign-popup-header">
        <h3>Export CSV</h3>
        <button class="btn btn-ghost btn-sm" onclick="this.closest('.assign-popup-overlay').remove()" style="padding:4px;">&times;</button>
      </div>
      <div class="assign-popup-body">
        <div style="text-align:center; margin-bottom:8px;">
          <div style="font-size:36px; font-weight:700; color:var(--text-primary);">${entityCount}</div>
          <div style="font-size:14px; color:var(--text-secondary);">${entityLabel} to export</div>
          <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">Based on the active filters</div>
        </div>
        ${contactsSection}
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

  // Wire contacts checkbox
  if (showContactsOption) {
    const checkbox = document.getElementById('export-include-contacts');
    const countEl = document.getElementById('export-contacts-count');
    checkbox.addEventListener('change', () => {
      includeContacts = checkbox.checked;
      countEl.style.display = includeContacts ? 'block' : 'none';
    });
  }

  // Wire confirm button
  document.getElementById('export-confirm-btn').onclick = () => {
    onExport(includeContacts);
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
      '<div style="margin-top:12px;"><label class="form-label">Empresa</label>' + nameField + '</div>' +
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
    btn.disabled = true; btn.textContent = 'Buscando…';
    var suggest = overlay.querySelector('#scrape-suggest'); if (suggest) suggest.innerHTML = '';
    resultEl.innerHTML = '<div style="font-size:13px; color:var(--text-muted);">Searching for the company and its vacancies on LinkedIn and Indeed…</div>';
    setTimeout(function () { renderPreview(name); }, 900);
  }

  function renderPreview(name) {
    var found = name.toLowerCase().indexOf('zzz') === -1; // mock: nombres con 'zzz' = no encontrada
    if (!found) {
      body.innerHTML = '<div style="font-size:13px; color:var(--color-warning-dark);">Company "' + name + '" not found on LinkedIn or Indeed. Try another name.</div>';
      footer.innerHTML = cancelBtn() + '<button class="btn btn-secondary btn-sm" id="scrape-retry-btn">Volver a buscar</button>';
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
      '<div style="font-size:13px; color:var(--color-success-dark);">Empresa encontrada: <strong>' + name + '</strong>' + newTag + '</div>' +
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
    footer.innerHTML = '<button class="btn btn-primary btn-sm" id="scrape-accept-btn">Aceptar</button>';
    overlay.querySelector('#scrape-accept-btn').onclick = function () {
      overlay.remove();
      if (selected && selected.id) { window.location.href = 'company-detail.html?id=' + selected.id + '&tab=vacantes'; }
      else { window.location.href = 'companies.html'; }
    };
  }

  renderSearch();
}

// === CSV EXPORT ===
function exportToCSV(rows, filename) {
  const BOM = '\uFEFF';
  const headers = Object.keys(rows[0]);
  const csv = BOM + headers.join(',') + '\n' + rows.map(r => headers.map(h => {
    const val = (r[h] || '').toString().replace(/"/g, '""');
    return val.includes(',') || val.includes('"') || val.includes('\n') ? `"${val}"` : val;
  }).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  showToast(`Exportado: ${filename}`);
}

// === FILTER SEARCHBOX (for listing pages) ===
function renderFilterSearchbox(containerId, items, options = {}) {
  const { onSelect = () => {}, placeholder = 'Filtrar...', labelField = 'name' } = options;
  const container = document.getElementById(containerId);
  if (!container) return;
  let selectedId = 'all';

  container.innerHTML = `
    <div style="position:relative;">
      <input type="text" class="form-input sm" id="${containerId}-input" placeholder="${placeholder}" value="Todos" autocomplete="off" />
      <div id="${containerId}-results" style="display:none; position:absolute; top:100%; left:0; right:0; z-index:100; max-height:220px; overflow-y:auto; background:var(--bg-surface-raised); border:1px solid var(--border-color); border-radius:var(--radius-input); margin-top:4px; box-shadow:var(--shadow-lg);"></div>
    </div>`;

  const input = document.getElementById(`${containerId}-input`);
  const results = document.getElementById(`${containerId}-results`);
  let isOpen = false;

  function render(filter) {
    const q = (filter || '').toLowerCase();
    const isDefault = filter === 'All' || filter === 'Unassigned';
    const filtered = (q && !isDefault) ? items.filter(i => i[labelField].toLowerCase().includes(q) || (i.email && i.email.toLowerCase().includes(q))) : items;
    let html = `<div class="searchbox-item" data-id="all" style="padding:8px 12px; cursor:pointer; font-weight:500; border-bottom:1px solid var(--border-color);">Todos</div>`;
    html += `<div class="searchbox-item" data-id="unassigned" style="padding:8px 12px; cursor:pointer; color:var(--text-muted); font-style:italic; border-bottom:1px solid var(--border-color);">Sin asignar</div>`;
    filtered.forEach(i => {
      html += `<div class="searchbox-item" data-id="${i.id}" style="padding:8px 12px; cursor:pointer;">
        <div style="font-size:14px; color:var(--text-primary);">${i[labelField]}</div>
        ${i.email ? `<div style="font-size:12px; color:var(--text-muted);">${i.email}</div>` : ''}
      </div>`;
    });
    results.innerHTML = html;
    results.querySelectorAll('.searchbox-item').forEach(el => {
      el.onmouseenter = () => el.style.background = 'var(--bg-tertiary)';
      el.onmouseleave = () => el.style.background = '';
      el.onclick = () => {
        selectedId = el.dataset.id;
        if (selectedId === 'all') input.value = 'Todos';
        else if (selectedId === 'unassigned') input.value = 'Sin asignar';
        else { const item = items.find(i => i.id === selectedId); input.value = item ? item[labelField] : ''; }
        results.style.display = 'none'; isOpen = false;
        onSelect(selectedId);
      };
    });
  }

  input.onfocus = () => { input.select(); isOpen = true; results.style.display = 'block'; render(input.value); };
  input.oninput = () => { if (!isOpen) { isOpen = true; results.style.display = 'block'; } render(input.value); };
  document.addEventListener('click', (e) => { if (!container.contains(e.target)) { results.style.display = 'none'; isOpen = false; } });

  return { getValue: () => selectedId, reset: () => { selectedId = 'all'; input.value = 'Todos'; } };
}
