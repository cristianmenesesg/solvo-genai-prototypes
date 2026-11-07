/* ========================================================================
   Solvo Recruiter Platform — Prototipo
   Alineado al design system platform de Solvo Global (tokens + dark mode).
   RBAC lean (recruiter / admin) + demo de búsqueda. Todo simulado (mock).
   ======================================================================== */

/* ----------------- Roles & sesión ----------------- */
const DEMO_USERS = {
  recruiter: { id: 'u-rec', name: 'Carlos Ortega', email: 'carlos.ortega@solvo.global', role: 'recruiter' },
  admin:     { id: 'u-adm', name: 'Laura Méndez',  email: 'laura.mendez@solvo.global',  role: 'admin' },
};
const ROLE_NAMES = { recruiter: 'Recruiter', admin: 'Admin' };

function getCurrentUser() { try { return JSON.parse(localStorage.getItem('tps_user')); } catch (e) { return null; } }
function getRole() { const u = getCurrentUser(); return u ? u.role : null; }
function canAccessAdmin() { return getRole() === 'admin'; }
function initSession() {
  const u = getCurrentUser();
  if (!u) {
    /* Guarda la página pedida para volver a ella tras el login: es lo que hace
       que un enlace directo a una vista concreta llegue a destino. */
    try { sessionStorage.setItem('tps_next', location.pathname.split('/').pop()); } catch (e) {}
    window.location.href = 'index.html';
    return null;
  }
  return u;
}
function logout() { localStorage.removeItem('tps_user'); window.location.href = 'index.html'; }

/* ----------------- Sidebar (espejo de rbac.js) ----------------- */
function renderSidebar(activePage) {
  const user = getCurrentUser();
  if (!user) return;
  const roleName = ROLE_NAMES[user.role] || user.role;
  const initials = user.name.split(' ').map(n => n[0]).join('');

  const navItems = [
    { id: 'candidatos', label: 'Candidate search', href: 'candidatos.html',
      icon: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>' },
  ];
  const adminItems = [
    { id: 'perfiles', label: 'Search profiles', href: 'perfiles.html',
      icon: '<path d="M3 3h7v7H3z"></path><path d="M14 3h7v7h-7z"></path><path d="M14 14h7v7h-7z"></path><path d="M3 14h7v7H3z"></path>' },
    { id: 'parametros', label: 'Parameters', href: 'parametros.html',
      icon: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>' },
  ];
  const item = (it) => `<a href="${it.href}" class="nav-item${activePage === it.id ? ' active' : ''}">
      <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${it.icon}</svg>
      <span>${it.label}</span></a>`;

  const adminSection = canAccessAdmin()
    ? `<div class="nav-section"><span class="nav-section-title">Administration</span>${adminItems.map(item).join('')}</div>` : '';

  const html = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo"><img src="SolvoGlobal_Logo_Color.png" alt="Solvo" class="sidebar-logo-img" /></div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section"><span class="nav-section-title">Recruitment</span>${navItems.map(item).join('')}</div>
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
  const c = document.getElementById('sidebar-container');
  if (c) c.innerHTML = html;

  renderHeaderControls();
}

/* ----------------- Idioma (preferencia persistida) ----------------- */
const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' }
];
function getLang() { try { return localStorage.getItem('lang') || 'en'; } catch (e) { return 'en'; } }
function setLang(code) { try { localStorage.setItem('lang', code); } catch (e) {} renderLangDropdown(); }
function renderLangDropdown() {
  const dd = document.getElementById('lang-dropdown'); if (!dd) return;
  const current = getLang();
  dd.innerHTML = LANGS.map(l =>
    `<button type="button" class="lang-option${l.code === current ? ' active' : ''}" onclick="setLang('${l.code}')">${l.label}</button>`
  ).join('');
}

/* ----------------- Header controls: colapsar sidebar + idioma ----------------- */
function renderHeaderControls() {
  const header = document.querySelector('.header');
  if (!header || document.getElementById('header-controls')) return;

  /* botón para ocultar/mostrar el sidebar (desktop) */
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
  try { if (localStorage.getItem('sidebarCollapsed') === '1') document.body.classList.add('sidebar-collapsed'); } catch (e) {}

  const wrap = document.createElement('div');
  wrap.id = 'header-controls';
  wrap.className = 'header-controls';
  wrap.innerHTML = `
    <div class="lang-switch">
      <button type="button" class="header-icon-btn" id="lang-toggle" title="Language" aria-label="Change language">
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

/* ----------------- Mobile sidebar ----------------- */
function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
  document.querySelector('.sidebar-overlay')?.classList.toggle('show');
}
function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.querySelector('.sidebar-overlay')?.classList.remove('show');
}

/* ----------------- Modal / drawer helpers ----------------- */
function openModal(id) { document.getElementById(id)?.classList.add('active'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }
function openDrawer() { document.getElementById('drawer')?.classList.add('open'); document.getElementById('drawerOverlay')?.classList.add('show'); }
function closeDrawer() { document.getElementById('drawer')?.classList.remove('open'); document.getElementById('drawerOverlay')?.classList.remove('show'); }
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeDrawer(); closeSidebar();
    document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
  }
});

/* ----------------- Toast (espejo de rbac.js) ----------------- */
function showToast(message, type = 'success') {
  let c = document.querySelector('.toast-container');
  if (!c) { c = document.createElement('div'); c.className = 'toast-container'; document.body.appendChild(c); }
  const icons = {
    success: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    error: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" x2="9" y1="9" y2="15"></line><line x1="9" x2="15" y1="9" y2="15"></line></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="16" y2="12"></line><line x1="12" x2="12.01" y1="8" y2="8"></line></svg>',
  };
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-message">${message}</span>`;
  c.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}

/* ----------------- Confirm popup (borrados y acciones destructivas) ----------------- */
const CONFIRM_ICONS = {
  trash: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
  search: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>',
  mail: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>',
  download: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>',
  sparkle: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>'
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

/* ----------------- Mock data ----------------- */
/* Espejo del catálogo de perfiles de búsqueda (perfiles.html). Los inactivos
   siguen listados: sus candidatos ya persistidos se consultan igual. */
const PROFILES = [
  'Litigation Assistant', 'Senior Paralegal', 'Customer Service Representative',
  'Sales Representative', 'Sales Development Representative', 'Intake Specialist',
  'Executive Assistant', 'Administrative Assistant', 'Collections Specialist',
  'Scheduler', 'CAD Designer', 'Legal Assistant', 'Paralegal',
];

const CANDIDATES = [
  {
    "id": 1,
    "first": "María",
    "last": "Restrepo",
    "loc": "Bogota, D.C., Capital District, Colombia",
    "verified": true,
    "otw": true,
    "headline": "Bilingual Customer Service Representative | English C1 | Zendesk & Salesforce | Open to remote roles with US teams",
    "email": "maria.restrepo@gmail.com",
    "about": "Asesora bilingüe de servicio al cliente con cuatro años atendiendo cuentas de Estados Unidos desde Bogotá. He trabajado colas de alto volumen en retail y suscripciones, resolviendo en el primer contacto siempre que la política lo permite y escalando con contexto cuando no.\n\nManejo diario de Zendesk y Salesforce Service Cloud, con macros, SLA y tableros de calidad. Sostengo satisfacción por encima del 95% y tiempos de primera respuesta en chat por debajo de tres minutos. Soy buena en desescalar: llevo a un cliente molesto hasta la solución sin pasarle el problema a un supervisor.\n\nTrabajo desde casa con espacio dedicado y conexión de respaldo, cómoda con turnos rotativos y temporadas altas. Inglés C1 con acento neutro en llamadas y escritura limpia. Busco un rol remoto de tiempo completo con un equipo de Estados Unidos.",
    "locationParts": {
      "city": "Bogotá",
      "state": "Bogotá D.C.",
      "country": "Colombia"
    },
    "languages": [
      {
        "name": "Español",
        "proficiency": "Native or bilingual proficiency"
      },
      {
        "name": "Inglés",
        "proficiency": "Professional working proficiency"
      }
    ],
    "topSkills": [
      "Zendesk",
      "De-escalation",
      "Bilingual English"
    ],
    "skills": [
      "Zendesk",
      "De-escalation",
      "Bilingual English",
      "Customer Service",
      "Salesforce Service Cloud",
      "Live chat support",
      "SLA management",
      "Order management",
      "Quality assurance",
      "Conflict resolution",
      "Active listening",
      "Microsoft Office",
      "CRM ticketing"
    ],
    "experience": [
      {
        "position": "Customer Service Representative",
        "companyName": "Teleperformance",
        "employmentType": "Full-time",
        "location": "Bogotá, Colombia",
        "duration": "2 yrs 7 mos",
        "startDate": "Feb 2023",
        "endDate": "Present"
      },
      {
        "position": "Bilingual Agent",
        "companyName": "Atento",
        "employmentType": "Full-time",
        "location": "Bogotá, Colombia",
        "duration": "1 yr 5 mos",
        "startDate": "Sep 2021",
        "endDate": "Jan 2023"
      },
      {
        "position": "Asesora de Retención",
        "companyName": "Emtelco",
        "employmentType": "Full-time",
        "location": "Bogotá, Colombia",
        "duration": "11 mos",
        "startDate": "Oct 2020",
        "endDate": "Aug 2021"
      }
    ],
    "education": [
      {
        "degree": "Profesional",
        "fieldOfStudy": "Lenguas Modernas",
        "schoolName": "Universidad Nacional de Colombia",
        "period": "Jan 2017 - Nov 2021"
      }
    ],
    "profile": "Customer Service Representative"
  },
  {
    "id": 2,
    "first": "Juan",
    "last": "Pérez",
    "loc": "Medellín, Antioquia, Colombia",
    "verified": false,
    "otw": true,
    "headline": "Customer Support Specialist | Call Center",
    "email": "juanperez88@outlook.com",
    "about": "Especialista en soporte al cliente con más de cuatro años en call center inbound y outbound, en operaciones de telecomunicaciones y cobranzas. Conozco el ciclo completo: recepción, tipificación, seguimiento y cierre, con la disciplina de dejar el CRM en condiciones para quien tome el caso después.\n\nHe manejado carteras de cobranza temprana negociando acuerdos de pago sin romper la relación con el cliente, y campañas de retención donde la métrica era la permanencia y no la llamada. Trabajo con indicadores a la vista y sé leer un reporte de gestión como una lista de prioridades.\n\nInglés en nivel intermedio, en mejora activa. Disponibilidad para turnos y para trabajo remoto con equipo propio. Busco una operación donde el soporte sea parte del producto y no un costo a recortar.",
    "locationParts": {
      "city": "Medellín",
      "state": "Antioquia",
      "country": "Colombia"
    },
    "languages": [
      {
        "name": "Español",
        "proficiency": "Native or bilingual proficiency"
      },
      {
        "name": "Inglés",
        "proficiency": "Limited working proficiency"
      }
    ],
    "topSkills": [
      "Call Center",
      "CRM",
      "Inbound Support"
    ],
    "skills": [
      "Call Center",
      "CRM",
      "Inbound Support",
      "Customer Support",
      "Cobranzas",
      "Ventas telefónicas"
    ],
    "experience": [
      {
        "position": "Customer Support Specialist",
        "companyName": "Sutherland",
        "employmentType": "Full-time",
        "location": "Medellín, Colombia",
        "duration": "3 yrs 2 mos",
        "startDate": "Jul 2022",
        "endDate": "Present"
      },
      {
        "position": "Agente de Cobranzas",
        "companyName": "Konecta",
        "employmentType": "Full-time",
        "location": "Medellín, Colombia",
        "duration": "1 yr 8 mos",
        "startDate": "Nov 2020",
        "endDate": "Jun 2022"
      }
    ],
    "education": [
      {
        "degree": "Tecnólogo",
        "fieldOfStudy": "Gestión Administrativa",
        "schoolName": "Politécnico Jaime Isaza Cadavid",
        "period": "Jan 2018 - Dec 2020"
      }
    ],
    "profile": "Customer Service Representative"
  },
  {
    "id": 3,
    "first": "Andrea",
    "last": "Gómez",
    "loc": "Bogota, D.C., Capital District, Colombia",
    "verified": true,
    "otw": false,
    "headline": "Abogada | Asistente Legal Corporativa | Derecho Administrativo y Conciliación | Disponible de inmediato",
    "email": null,
    "about": "Abogada con experiencia en asistencia jurídica corporativa y administrativa, tanto en firma privada como en entidad pública. He acompañado procesos de revisión documental, redacción técnica de memoriales y respuestas, y atención a requerimientos con términos perentorios.\n\nEn la Fiscalía trabajé bajo volumen y confidencialidad estricta; antes, en asistencia corporativa, llevé la gestión documental, la contratación menor y el seguimiento a proveedores de una compañía mediana. Estoy acostumbrada a que un error de forma cueste un término, así que reviso dos veces.\n\nComplementé el grado con diplomaturas en conciliación, derecho administrativo y sistema interamericano de derechos humanos. Inglés profesional, suficiente para documentación y correo con equipos de Estados Unidos.\n\nBusco un rol remoto de asistente legal donde la rigurosidad y el manejo de información sensible sean el centro del trabajo.",
    "locationParts": {
      "city": "Bogotá",
      "state": "Bogotá D.C.",
      "country": "Colombia"
    },
    "languages": [
      {
        "name": "Español",
        "proficiency": "Native or bilingual proficiency"
      },
      {
        "name": "Inglés",
        "proficiency": "Professional working proficiency"
      }
    ],
    "topSkills": [
      "Revisión de documentos",
      "Redacción técnica",
      "Análisis jurídico"
    ],
    "skills": [
      "Revisión de documentos",
      "Redacción técnica",
      "Análisis jurídico",
      "Finanzas corporativas",
      "Atención al detalle",
      "Rendimiento bajo presión",
      "Pensamiento crítico",
      "Confidencialidad",
      "Derecho administrativo",
      "Conciliación",
      "Resolución de conflictos",
      "Microsoft Office",
      "Gestión documental",
      "Atención al cliente",
      "Derecho laboral",
      "Contratación estatal",
      "Oratoria",
      "Trabajo en equipo",
      "Organización",
      "Adaptabilidad"
    ],
    "experience": [
      {
        "position": "Attorney General's Office of Colombia",
        "companyName": "Fiscalía General de la Nación",
        "employmentType": "Full-time",
        "location": "Bogotá, Colombia",
        "duration": "2 mos",
        "startDate": "Oct 2025",
        "endDate": "Nov 2025"
      },
      {
        "position": "Customer Service & Financial Advisor",
        "companyName": "BRM S.A.S",
        "employmentType": "Part-time",
        "location": "Bogotá, Colombia",
        "duration": "7 mos",
        "startDate": "Jul 2024",
        "endDate": "Jan 2025"
      },
      {
        "position": "Administrative Assistant",
        "companyName": "Human Service S.A.S",
        "employmentType": null,
        "location": "Bogotá, Colombia",
        "duration": "4 mos",
        "startDate": "Mar 2024",
        "endDate": "Jun 2024"
      },
      {
        "position": "Corporate Administrative Assistant",
        "companyName": "Soluciones Inmediatas S.A.S",
        "employmentType": "Full-time",
        "location": "Bogotá, Colombia",
        "duration": "2 yrs 1 mo",
        "startDate": "Feb 2022",
        "endDate": "Feb 2024"
      },
      {
        "position": "Legal Assistant",
        "companyName": "Mauricio Caballero Law Office",
        "employmentType": "Full-time",
        "location": "Bogotá, Colombia",
        "duration": "1 yr 11 mos",
        "startDate": "Mar 2020",
        "endDate": "Jan 2022"
      }
    ],
    "education": [
      {
        "degree": "Doctor en Derecho",
        "fieldOfStudy": "Bachelor of laws",
        "schoolName": "Universidad Antonio Nariño",
        "period": "Aug 2021 - Dec 2025"
      },
      {
        "degree": "Diplomatura",
        "fieldOfStudy": "Conciliation and Conflict Resolution",
        "schoolName": "Politécnico Superior de Colombia",
        "period": "Jul 2025"
      },
      {
        "degree": "Diplomatura",
        "fieldOfStudy": "Public Administration",
        "schoolName": "Politécnico Superior de Colombia",
        "period": "Jul 2025"
      },
      {
        "degree": "Diplomatura",
        "fieldOfStudy": "International Humanitarian Law",
        "schoolName": "Politécnico Superior de Colombia",
        "period": "Jul 2025"
      },
      {
        "degree": "Diplomatura",
        "fieldOfStudy": "Finance for Non-Financial Professionals",
        "schoolName": "Politécnico Superior de Colombia",
        "period": "Jul 2025"
      },
      {
        "degree": "Diplomatura",
        "fieldOfStudy": "Inter-American Human Rights System",
        "schoolName": "Inter-American Commission on Human Rights (IACHR)",
        "period": "Aug 2024"
      }
    ],
    "profile": "Legal Assistant"
  },
  {
    "id": 4,
    "first": "Carlos",
    "last": "Villanueva",
    "loc": "Manila, Metro Manila, Philippines",
    "verified": true,
    "otw": true,
    "headline": "Customer Service Representative | E-commerce | Shopify",
    "email": "carlos.v@proton.me",
    "about": "Customer service representative with four years supporting US e-commerce brands from Manila. I handle the full post-purchase cycle: order issues, returns and refunds, shipping exceptions and the escalations that come with peak season.\n\nDay to day I work in Shopify and Gorgias, with live chat as the main channel and email for anything that needs a paper trail. I am comfortable owning a queue without supervision and keeping response times inside SLA when volume triples in November.\n\nI write clean, professional English and keep a neutral tone with frustrated customers. Home office with fiber and backup connection, and full availability for US business hours including early shifts. Looking for a long-term remote role with a team that treats support as part of the product.",
    "locationParts": {
      "city": "Manila",
      "state": "Metro Manila",
      "country": "Filipinas"
    },
    "languages": [
      {
        "name": "Inglés",
        "proficiency": "Full professional proficiency"
      },
      {
        "name": "Tagalo",
        "proficiency": "Native or bilingual proficiency"
      }
    ],
    "topSkills": [
      "E-commerce",
      "Shopify",
      "Customer Service"
    ],
    "skills": [
      "E-commerce",
      "Shopify",
      "Customer Service",
      "Returns handling",
      "Live chat",
      "Gorgias"
    ],
    "experience": [
      {
        "position": "Customer Service Representative",
        "companyName": "Concentrix",
        "employmentType": "Full-time",
        "location": "Manila, Filipinas",
        "duration": "4 yrs 1 mo",
        "startDate": "Aug 2021",
        "endDate": "Present"
      }
    ],
    "education": [
      {
        "degree": "Bachelor",
        "fieldOfStudy": "Communication Arts",
        "schoolName": "University of Santo Tomas",
        "period": "Jun 2016 - May 2020"
      }
    ],
    "profile": "Customer Service Representative"
  },
  {
    "id": 5,
    "first": "Sofía",
    "last": "Hernández",
    "loc": "Buenos Aires, Buenos Aires Province, Argentina",
    "verified": false,
    "otw": true,
    "headline": "Bilingual Support Agent | Fintech",
    "email": null,
    "about": "Agente bilingüe de soporte con cuatro años en fintech argentina, atendiendo consultas de producto, disputas y verificación de identidad. Vengo de operaciones donde el error tiene consecuencia económica directa, así que trabajo con procedimiento y dejo traza de cada decisión.\n\nManejo Zendesk y herramientas internas de KYC, con experiencia en el flujo completo de una disputa: recepción, evidencia, resolución y comunicación al cliente. También acompañé la puesta en marcha de una base de conocimiento que bajó las consultas repetidas de manera medible.\n\nInglés profesional, cómodo en llamadas y en escritura. Disponibilidad completa para horario de Estados Unidos desde un espacio de trabajo propio. Busco un rol remoto en fintech o SaaS donde el soporte tenga acceso al producto y no solo al guion.",
    "locationParts": {
      "city": "Buenos Aires",
      "state": "Buenos Aires",
      "country": "Argentina"
    },
    "languages": [
      {
        "name": "Español",
        "proficiency": "Native or bilingual proficiency"
      },
      {
        "name": "Inglés",
        "proficiency": "Professional working proficiency"
      }
    ],
    "topSkills": [
      "Fintech",
      "Bilingual English",
      "Support"
    ],
    "skills": [
      "Fintech",
      "Bilingual English",
      "Support",
      "Disputas",
      "Zendesk",
      "KYC"
    ],
    "experience": [
      {
        "position": "Bilingual Support Agent",
        "companyName": "Ualá",
        "employmentType": "Full-time",
        "location": "Buenos Aires, Argentina",
        "duration": "1 yr 11 mos",
        "startDate": "Nov 2023",
        "endDate": "Sep 2025"
      },
      {
        "position": "Analista de Atención",
        "companyName": "Naranja X",
        "employmentType": "Full-time",
        "location": "Córdoba, Argentina",
        "duration": "2 yrs 4 mos",
        "startDate": "Jul 2021",
        "endDate": "Oct 2023"
      }
    ],
    "education": [
      {
        "degree": "Licenciatura",
        "fieldOfStudy": "Relaciones del Trabajo",
        "schoolName": "Universidad de Buenos Aires",
        "period": "Mar 2016 - Dec 2021"
      }
    ],
    "profile": "Customer Service Representative"
  },
  {
    "id": 6,
    "first": "Valentina",
    "last": "Cruz",
    "loc": "Cali, Valle del Cauca, Colombia",
    "verified": false,
    "otw": null,
    "headline": "Inbound Support Representative | Zendesk",
    "email": null,
    "about": "Representante de soporte inbound con casi tres años en operación de telecomunicaciones, atendiendo consultas de facturación, servicio técnico de primer nivel y gestión de reclamos.\n\nTrabajo con Zendesk y con los procedimientos de la cuenta, cumpliendo tiempos de atención y tipificación. Me manejo bien con clientes molestos y con casos que requieren seguimiento en varios contactos.\n\nInglés B2, en formación para certificar C1. Busco mi primera oportunidad remota con un equipo de Estados Unidos, con disponibilidad completa e interés en crecer dentro del área de soporte.",
    "locationParts": {
      "city": "Cali",
      "state": "Valle del Cauca",
      "country": "Colombia"
    },
    "languages": [
      {
        "name": "Español",
        "proficiency": "Native or bilingual proficiency"
      }
    ],
    "topSkills": [],
    "skills": [
      "Inbound",
      "Bilingual English",
      "Zendesk"
    ],
    "experience": [],
    "education": [],
    "profile": "Customer Service Representative"
  },
  {
    "id": 7,
    "first": "Miguel",
    "last": "Santos",
    "loc": "Cebu, Central Visayas, Philippines",
    "verified": true,
    "otw": true,
    "headline": "Technical Support Representative | B2B SaaS",
    "email": "miguel.santos@gmail.com",
    "about": "Technical support representative with four and a half years supporting B2B SaaS products from Cebu. I work tier one and tier two: integration issues, API errors, authentication problems and the escalations that need a reproducible case before they reach engineering.\n\nI am comfortable reading logs, writing basic SQL to confirm a hypothesis, and documenting a bug so the developer does not have to ask me three follow-up questions. Daily tools are Jira, Intercom and the product's own admin console.\n\nStrong written English, which matters more than accent in this role: most of my work is async with customers in different time zones. Home setup built for the job, and availability across US business hours. Looking for a remote role with a product team I can learn deeply.",
    "locationParts": {
      "city": "Cebú",
      "state": "Central Visayas",
      "country": "Filipinas"
    },
    "languages": [
      {
        "name": "Inglés",
        "proficiency": "Full professional proficiency"
      },
      {
        "name": "Tagalo",
        "proficiency": "Native or bilingual proficiency"
      }
    ],
    "topSkills": [
      "Technical Support",
      "SaaS",
      "Troubleshooting"
    ],
    "skills": [
      "Technical Support",
      "SaaS",
      "Troubleshooting",
      "APIs",
      "Jira",
      "Intercom",
      "SQL básico"
    ],
    "experience": [
      {
        "position": "Technical Support Representative",
        "companyName": "TaskUs",
        "employmentType": "Full-time",
        "location": "Cebú, Filipinas",
        "duration": "3 yrs 6 mos",
        "startDate": "Apr 2022",
        "endDate": "Present"
      },
      {
        "position": "IT Helpdesk Assistant",
        "companyName": "Accenture",
        "employmentType": "Full-time",
        "location": "Cebú, Filipinas",
        "duration": "1 yr 2 mos",
        "startDate": "Feb 2021",
        "endDate": "Mar 2022"
      }
    ],
    "education": [
      {
        "degree": "Bachelor",
        "fieldOfStudy": "Information Technology",
        "schoolName": "Cebu Institute of Technology",
        "period": "Jun 2016 - Apr 2020"
      }
    ],
    "profile": "Customer Service Representative"
  },
  {
    "id": 8,
    "first": "Lucía",
    "last": "Fernández",
    "loc": "Lima, Lima, Peru",
    "verified": false,
    "otw": false,
    "headline": "Especialista en Retención | CRM",
    "email": "lucia.fernandez@gmail.com",
    "about": "Especialista en retención y recuperación de clientes con cuatro años en suscripciones y servicios financieros. Mi trabajo es la conversación que ocurre cuando el cliente ya decidió irse: entender el motivo real, ofrecer lo que corresponde y cerrar el acuerdo en la misma llamada.\n\nManejo HubSpot y campañas de recuperación con segmentación por motivo de baja, y tengo indicadores propios de tasa de retención y valor recuperado que puedo sustentar. También armé los guiones de objeción que hoy usa el equipo.\n\nInglés intermedio en mejora. Busco un rol remoto comercial o de retención con un equipo de Estados Unidos, donde la métrica sea el resultado y no la cantidad de llamadas.",
    "locationParts": {
      "city": "Lima",
      "state": "Lima",
      "country": "Perú"
    },
    "languages": [
      {
        "name": "Español",
        "proficiency": "Native or bilingual proficiency"
      },
      {
        "name": "Inglés",
        "proficiency": "Limited working proficiency"
      }
    ],
    "topSkills": [
      "Retención",
      "CRM",
      "Ventas"
    ],
    "skills": [
      "Retención",
      "CRM",
      "Ventas",
      "HubSpot",
      "Campañas"
    ],
    "experience": [],
    "education": [
      {
        "degree": "Bachiller",
        "fieldOfStudy": "Comunicaciones",
        "schoolName": "Universidad de Lima",
        "period": "Mar 2017 - Dec 2021"
      }
    ],
    "profile": "Sales Representative"
  },
  {
    "id": 9,
    "first": "Diego",
    "last": "Morales",
    "loc": "San Salvador, San Salvador, El Salvador",
    "verified": true,
    "otw": true,
    "headline": "Billing Support Specialist | Excel",
    "email": "diego.morales@outlook.com",
    "about": "Especialista en soporte de facturación con dos años en operación de servicios, atendiendo consultas de cobro, conciliaciones y ajustes. Trabajo con volumen alto de casos donde la precisión importa más que la velocidad.\n\nManejo avanzado de Excel —tablas dinámicas, búsquedas y validaciones— y experiencia con QuickBooks para conciliar contra el sistema de facturación. Me tocó depurar bases con inconsistencias históricas y dejar el proceso documentado para que no se repita.\n\nInglés profesional, cómodo en correo y en llamadas con clientes de Estados Unidos. Busco un rol remoto en facturación, cuentas por cobrar o soporte administrativo con un equipo estadounidense.",
    "locationParts": {
      "city": "San Salvador",
      "state": "San Salvador",
      "country": "El Salvador"
    },
    "languages": [
      {
        "name": "Español",
        "proficiency": "Native or bilingual proficiency"
      },
      {
        "name": "Inglés",
        "proficiency": "Professional working proficiency"
      }
    ],
    "topSkills": [
      "Billing",
      "Excel",
      "Customer Service"
    ],
    "skills": [
      "Billing",
      "Excel",
      "Customer Service",
      "Conciliaciones",
      "QuickBooks"
    ],
    "experience": [
      {
        "position": "Billing Support Specialist",
        "companyName": "Sykes",
        "employmentType": "Full-time",
        "location": "San Salvador, El Salvador",
        "duration": "2 yrs 2 mos",
        "startDate": "Aug 2023",
        "endDate": "Present"
      }
    ],
    "education": [],
    "profile": "Sales Representative"
  }
];
// El email ya viene capturado por el pipeline (FTPS-1); true = el pipeline lo capturó, false = quedó sin email.
const EMAIL_RESOLUTION = { 1:true,2:true,3:false,4:true,5:false,6:true,7:false,8:true,9:false };
const initials = c => (c.first[0] + c.last[0]).toUpperCase();
/* Bloque de historial: una entrada por fila, con su vigencia marcada.
   Vale para experiencia y para educación, que comparten forma. */
/* LinkedIn devuelve el nivel en su forma larga; en una celda angosta sobra. */
/* El pool guarda los idiomas como objetos; el listado solo necesita el nombre. */
const langNames = c => (c.languages || []).map(l => (l && l.name) || l).filter(Boolean);

const PROFICIENCY = {
  'Native or bilingual proficiency': 'Native',
  'Full professional proficiency': 'Full professional',
  'Professional working proficiency': 'Professional',
  'Limited working proficiency': 'Limited',
  'Elementary proficiency': 'Elementary',
};
const shortProficiency = t => PROFICIENCY[t] || t;
function setCount(root, sel, n) {
  const el = root.querySelector(sel); if (el) el.textContent = n ? `(${n})` : '';
}

/* Pestañas del panel de detalle. */
function initDrawerTabs() {
  const d = document.getElementById('drawer'); if (!d) return;
  d.querySelectorAll('.drawer-tab').forEach(btn => btn.addEventListener('click', () => {
    d.querySelectorAll('.drawer-tab').forEach(b => b.classList.toggle('active', b === btn));
    d.querySelectorAll('[data-panel]').forEach(sec => { sec.hidden = sec.dataset.panel !== btn.dataset.tab; });
    d.querySelector('.drawer-body').scrollTop = 0;
  }));
}
function resetDrawerTabs() {
  const d = document.getElementById('drawer'); if (!d) return;
  d.querySelectorAll('.drawer-tab').forEach((b, i) => b.classList.toggle('active', i === 0));
  d.querySelectorAll('[data-panel]').forEach(sec => { sec.hidden = sec.dataset.panel !== 'profile'; });
  d.querySelector('.drawer-body').scrollTop = 0;
}

function timeline(items, campos, vacio) {
  if (!items || !items.length) return `<p class="tl-empty">${vacio}</p>`;
  return items.map(it => {
    const [titulo, sub, meta, fechas] = campos(it);
    const vigente = /present/i.test(fechas || '');
    return `<div class="tl-item${vigente ? ' tl-item--current' : ''}">
      <div class="tl-title">${titulo}${vigente ? '<span class="tl-now">Current</span>' : ''}</div>
      <div class="tl-sub">${sub || ''}</div>
      ${meta ? `<div class="tl-meta">${meta}</div>` : ''}
      <div class="tl-dates">${fechas || ''}</div>
    </div>`;
  }).join('');
}
const chips = arr => `<div class="cand-chips">${arr.map(s => `<span class="cand-chip">${s}</span>`).join('')}</div>`;
/* En la tabla la celda se acota para que la fila mantenga su altura;
   la lista completa está en el panel de detalle. */
const chipsCapped = (arr, max) => {
  const shown = arr.slice(0, max);
  const rest = arr.length - shown.length;
  return `<div class="cand-chips">${shown.map(s => `<span class="cand-chip">${s}</span>`).join('')}` +
    (rest ? `<span class="cand-chip cand-chip--more">+${rest}</span>` : '') + '</div>';
};
const candCountry = c => c.loc.split(',').pop().trim();

/* ========================================================================
   Búsqueda de candidatos — patrón de Open Positions (Solvo Platform UI R3).
   Sin re-validación desde la pantalla, la búsqueda ya no necesita un perfil
   obligatorio: el campo de texto busca en todo el pool (titular, acerca de y
   habilidades) y espera al botón; el perfil es un filtro rápido al lado, y el
   resto de los filtros vive en el popup. Los filtros se aplican al elegir.
   ======================================================================== */
const SELECTED = new Set();
const ICON_PROFILE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
const ICON_X_SM = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';
const ICON_FILTERS = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="6" y2="6"></line><line x1="7" x2="17" y1="12" y2="12"></line><line x1="10" x2="14" y1="18" y2="18"></line></svg>';

/* Filtros del popup. `neutral` es el valor que no filtra (no lleva chip);
   `def` es con lo que arranca la página: disponibles y no exportados, como antes. */
const FILTER_DEFS = [
  { key: 'vertical', group: 'Candidate', label: 'Vertical', type: 'multi', neutral: [], def: [],
    hint: 'Verticals of the AI searches that found the candidate on target. A candidate can have more than one.',
    options: () => [...VERTICALS.map(v => ({ value: v, label: v })), { value: 'none', label: 'No vertical' }],
    chip: v => v.length > 2 ? `${v.length} verticals` : v.map(x => x === 'none' ? 'No vertical' : x).join(', ') },
  { key: 'avail', group: 'Candidate', label: 'Availability', type: 'single', neutral: 'all', def: 'yes',
    hint: 'Open to work as the last availability check found it.',
    options: () => [{ value: 'yes', label: 'Open to work', note: 'Default' }, { value: 'no', label: 'Not available' }, { value: 'all', label: 'Both' }],
    chip: v => ({ yes: 'Open to work', no: 'Not available' })[v] },
  { key: 'lang', group: 'Candidate', label: 'Languages', type: 'multi', neutral: [], def: [],
    hint: 'Languages on the profile, with one name per language whatever way the candidate wrote it. A candidate matches if they speak any of the checked ones.',
    options: () => [...new Set(poolCands().flatMap(c => normalizeProfile(c).languages.map(l => l.language)))].sort().map(l => ({ value: l, label: l })),
    chip: v => v.length > 2 ? `${v.length} languages` : v.join(', ') },
  { key: 'langLevel', group: 'Candidate', label: 'Language level', type: 'single', neutral: 'any', def: 'any',
    hint: 'Minimum level for the languages checked above. With no language checked, it applies to English.',
    options: () => [{ value: 'any', label: 'Any level' }, ...LEVELS.slice(1).map(l => ({ value: l, label: `${LEVEL_LABEL[l]} or higher` }))],
    chip: v => `${LEVEL_LABEL[v]}+` },
  { key: 'exp', group: 'Candidate', label: 'Years of experience', type: 'multi', neutral: [], def: [],
    hint: 'Total years in their positions, without counting overlaps twice or internships.',
    options: () => [{ value: 'lt2', label: 'Less than 2' }, { value: '2to5', label: '2 to 5' }, { value: '5to10', label: '5 to 10' }, { value: 'gt10', label: 'More than 10' }],
    chip: v => v.map(x => ({ lt2: '<2 yrs', '2to5': '2–5 yrs', '5to10': '5–10 yrs', gt10: '10+ yrs' })[x]).join(', ') },
  { key: 'seniority', group: 'Candidate', label: 'Seniority', type: 'multi', neutral: [], def: [],
    hint: 'Level of the current or most recent role, from its title, whether they lead others and their years of experience.',
    options: () => Object.entries(SENIORITY_LABEL).map(([value, label]) => ({ value, label })),
    chip: v => v.map(x => SENIORITY_LABEL[x]).join(', ') },
  { key: 'remote', group: 'Candidate', label: 'Remote experience', type: 'single', neutral: 'any', def: 'any',
    hint: 'Whether at least one of their positions was remote.',
    options: () => [{ value: 'any', label: 'Any' }, { value: 'yes', label: 'Has worked remotely' }],
    chip: () => 'Remote experience' },
  { key: 'loc', group: 'Candidate', label: 'City', type: 'multi', neutral: [], def: [],
    hint: 'City from the cities catalog: the one the AI search used when it found the candidate.',
    options: () => [...ALL_CITIES.filter(x => poolCands().some(c => normalizeProfile(c).city === x.city)).map(x => ({ value: x.city, label: x.city, note: x.country })),
                    { value: 'none', label: 'No catalog city' }],
    chip: v => v.length > 2 ? `${v.length} cities` : v.map(x => x === 'none' ? 'No catalog city' : x).join(', ') },
  { key: 'email', group: 'Candidate', label: 'Contact email', type: 'single', neutral: 'any', def: 'any',
    hint: 'Whether the pipeline found a contact email for the candidate.',
    options: () => [{ value: 'any', label: 'Any' }, { value: 'with', label: 'With email' }, { value: 'without', label: 'Without email' }],
    chip: v => ({ with: 'With email', without: 'Without email' })[v] },
  { key: 'status', group: 'Management', label: 'Status', type: 'multi', neutral: [], def: [],
    hint: 'Where the candidate is in the outreach process.',
    options: () => Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label })),
    chip: v => v.map(x => STATUS_LABEL[x]).join(', ') },
  { key: 'export', group: 'Management', label: 'Export', type: 'single', neutral: 'all', def: 'none',
    hint: 'Who took the candidate out of the platform last. Starts on the ones nobody exported.',
    options: () => [{ value: 'none', label: 'Not exported', note: 'Default' }, { value: 'me', label: 'Exported by me' }, { value: 'other', label: 'Exported by others' }, { value: 'all', label: 'All' }],
    chip: v => ({ none: 'Not exported', me: 'Exported by me', other: 'Exported by others' })[v] },
];
const clone = v => Array.isArray(v) ? v.slice() : v;
const defaultFilters = () => Object.fromEntries(FILTER_DEFS.map(f => [f.key, clone(f.def)]));
const isNeutral = (f, v) => Array.isArray(f.neutral) ? !(v && v.length) : v === f.neutral;

const SEARCH = { q: '', profiles: [], filters: defaultFilters(), sort: 'newest', ai: false };
const AI_DELIVERED = new Set();
/* Los apartados de una AI Search (filtro de pertinencia y fuera de foco) no se listan. */
let SHOW_OFF = false;
let profilePicker = null;

/* El pool: lo que dejó el disparo programado más lo que fueron sumando las búsquedas asistidas. */
const poolCands = () => CANDIDATES.concat(AI_POOL.filter(c => AI_DELIVERED.has(c.id)));
const detectedAt = c => c.detectedAt || (c.detectedAt = new Date(Date.now() - c.id * 2.7 * 864e5));

function initSearchPage() {
  profilePicker = renderShellPicker('pickProfile', {
    icon: ICON_PROFILE, allLabel: 'All profiles', plural: 'profiles', searchPlaceholder: 'Search profile',
    items: [...CATALOG_PROFILES, 'Otros'].map(p => ({ value: p, label: p })),
    onChange: v => { SEARCH.profiles = v; candPage = 0; applyFilters(); },
  });
  const input = document.getElementById('searchInput');
  document.getElementById('searchBtn').onclick = commitSearch;
  input.addEventListener('keydown', e => { if (e.key === 'Enter') commitSearch(); });
  document.getElementById('sortSelect').onchange = e => { SEARCH.sort = e.target.value; candPage = 0; applyFilters(); };
  document.getElementById('candPrev')?.addEventListener('click', () => { if (candPage > 0) { candPage--; applyFilters(); } });
  document.getElementById('candNext')?.addEventListener('click', () => { candPage++; applyFilters(); });
  document.getElementById('modalClose').onclick = closeFilterModal;
  document.getElementById('filterModal').addEventListener('click', e => { if (e.target.id === 'filterModal') closeFilterModal(); });
  document.getElementById('modalApply').onclick = () => { SEARCH.filters = draft; closeFilterModal(); candPage = 0; applyFilters(); };
  document.getElementById('modalClearAll').onclick = () => { draft = Object.fromEntries(FILTER_DEFS.map(f => [f.key, clone(f.neutral)])); renderModal(); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeFilterModal(); });
  loadPool();
}

/* El campo de texto es lo único que espera al botón. */
function commitSearch() {
  SEARCH.q = document.getElementById('searchInput').value.trim();
  candPage = 0;
  applyFilters();
}

/* Vista del pool: la página arranca acá, sin pedir perfil, y vuelve acá al soltar una AI Search. */
function loadPool() {
  const tbody = document.getElementById('candRows'); if (!tbody) return;
  SEARCH.ai = false; SHOW_OFF = false;
  if (SEARCH.sort === 'match') SEARCH.sort = 'newest';
  SELECTED.clear(); updateBulk();
  const card = document.getElementById('resultsCard');
  card.classList.remove('is-ai');
  document.getElementById('aiPanel').style.display = 'none';
  document.getElementById('loadNote').style.display = 'none';
  tbody.innerHTML = '';
  poolCands().forEach(c => tbody.appendChild(buildCandRow(c)));
  bindRowSelection(tbody);
  renderSortOptions();
  candPage = 0;
  applyFilters();
}

function renderSortOptions() {
  const opts = [['newest', 'Newest detected'], ['oldest', 'Oldest detected'], ['experience', 'Most experience'], ['name', 'Name A–Z']];
  opts.push(['match', 'AI match']);
  if (SEARCH.ai) opts.unshift(opts.pop());
  const sel = document.getElementById('sortSelect');
  sel.innerHTML = opts.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
  sel.value = SEARCH.sort;
}

/* La selección por casilla la usan tanto el pool como AI Search. */
function bindRowSelection(tbody) {
  tbody.onchange = e => {
    if (e.target.matches('input[type=checkbox]')) {
      const id = +e.target.dataset.id;
      e.target.checked ? SELECTED.add(id) : SELECTED.delete(id);
      e.target.closest('tr').classList.toggle('is-selected', e.target.checked);
      updateBulk();
    }
  };
}

/* Paginación sobre el resultado ya filtrado y ordenado. */
const CAND_PAGE_SIZE = 5;
let candPage = 0;
/* Filas que pasan la búsqueda y los filtros: es lo que exporta el botón Export. */
let LAST_MATCHES = [];

function rowPasses(tr) {
  const f = SEARCH.filters;
  if (SEARCH.q && !tr.dataset.text.includes(norm(SEARCH.q))) return false;
  if (SEARCH.profiles.length && !SEARCH.profiles.includes(tr.dataset.profile)) return false;
  if (f.vertical.length) {
    const vs = JSON.parse(tr.dataset.vertical || '[]');
    if (!f.vertical.some(v => v === 'none' ? !vs.length : vs.includes(v))) return false;
  }
  if (f.avail !== 'all' && tr.dataset.otw !== f.avail) return false;
  if (f.lang.length || f.langLevel !== 'any') {
    const want = f.lang.length ? f.lang : ['English'];
    const min = f.langLevel === 'any' ? -1 : LEVELS.indexOf(f.langLevel);
    if (!JSON.parse(tr.dataset.langs || '[]').some(l => want.includes(l.language) && LEVELS.indexOf(l.level) >= min)) return false;
  }
  if (f.exp.length && !f.exp.includes(yearsBucket(tr.dataset.years === '' ? null : +tr.dataset.years))) return false;
  if (f.remote === 'yes' && tr.dataset.remote !== '1') return false;
  if (f.seniority.length && !f.seniority.includes(tr.dataset.seniority)) return false;
  if (f.loc.length && !f.loc.includes(tr.dataset.city)) return false;
  if (f.email === 'with' && tr.dataset.email !== '1') return false;
  if (f.email === 'without' && tr.dataset.email === '1') return false;
  if (f.status.length && !f.status.includes(tr.dataset.status)) return false;
  if (f.export !== 'all' && tr.dataset.exp !== f.export) return false;
  return true;
}

const SORTERS = {
  match:  (a, b) => (+b.dataset.score) - (+a.dataset.score),
  newest: (a, b) => (+b.dataset.detected) - (+a.dataset.detected),
  oldest: (a, b) => (+a.dataset.detected) - (+b.dataset.detected),
  name:   (a, b) => a.dataset.name.localeCompare(b.dataset.name),
  experience: (a, b) => (+b.dataset.years || 0) - (+a.dataset.years || 0),
};

function applyFilters() {
  const tbody = document.getElementById('candRows');
  const rows = [...tbody.querySelectorAll('tr')];
  rows.sort(SORTERS[SEARCH.sort] || SORTERS.newest).forEach(r => tbody.appendChild(r));
  const matches = rows.filter(rowPasses);
  LAST_MATCHES = matches;

  const pages = Math.max(1, Math.ceil(matches.length / CAND_PAGE_SIZE));
  candPage = Math.min(Math.max(candPage, 0), pages - 1);
  const start = candPage * CAND_PAGE_SIZE;
  const slice = matches.slice(start, start + CAND_PAGE_SIZE);
  rows.forEach(tr => { tr.style.display = 'none'; });
  slice.forEach(tr => { tr.style.display = ''; });

  renderCandPager(matches.length, pages, start, slice.length);
  renderFilterBar();
  const n = matches.length;
  document.getElementById('resultCount').innerHTML = `<strong>${n}</strong> candidate${n === 1 ? '' : 's'}` +
    (SEARCH.ai ? ' from this AI Search' : ' in the pool');
  const searching = SEARCH.ai && AI_RUN && AI_RUN.running;
  const empty = !n && !searching;
  document.getElementById('emptyState').style.display = empty ? '' : 'none';
  document.querySelector('#resultsCard .table-container').style.display = empty ? 'none' : '';
  if (empty) document.getElementById('emptyMsg').textContent = emptyMessage();
}
function emptyMessage() {
  const on = activeChips().filter(c => c.key !== '__ai').map(c => c.text);
  return on.length ? `Active now: ${on.join(' · ')}. Clear some of them or search for something else.`
    : 'Nothing in the pool yet. Use AI Search to go find candidates.';
}
function renderCandPager(total, pages, start, shown) {
  const pager = document.getElementById('candPager');
  if (!pager) return;
  if (!total) { pager.style.display = 'none'; return; }
  pager.style.display = '';
  document.getElementById('candPagerInfo').textContent =
    `${start + 1}–${start + shown} of ${total} candidate${total === 1 ? '' : 's'}`;
  document.getElementById('candPagerPages').textContent = `Page ${candPage + 1} of ${pages}`;
  document.getElementById('candPrev').disabled = candPage === 0;
  document.getElementById('candNext').disabled = candPage >= pages - 1;
}

/* ----------------- Filtros activos ----------------- */
function activeChips() {
  const chips = [];
  if (SEARCH.ai && AI_RUN) chips.push({ key: '__ai', text: `AI Search · ${AI_RUN.label}`, cls: 'op-chip-ai' });
  if (SEARCH.q) chips.push({ key: '__q', text: `“${SEARCH.q}”` });
  if (SEARCH.profiles.length) chips.push({ key: '__profile', text: SEARCH.profiles.length > 2 ? `${SEARCH.profiles.length} profiles` : SEARCH.profiles.join(', ') });
  FILTER_DEFS.forEach(f => {
    const v = SEARCH.filters[f.key];
    if (!isNeutral(f, v)) chips.push({ key: f.key, text: f.chip(v) });
  });
  return chips;
}
function renderFilterBar() {
  const chips = activeChips();
  const n = chips.filter(c => c.key.indexOf('__') !== 0).length;
  document.getElementById('filterBar').innerHTML =
    `<button type="button" class="op-filters-open" id="openFilters">${ICON_FILTERS}Filters${n ? `<span class="op-filters-count">${n}</span>` : ''}</button>` +
    chips.map(c => `<span class="op-chip ${c.cls || ''}"><span>${c.text}</span><button class="op-chip-x" aria-label="Remove" data-clear="${c.key}">${ICON_X_SM}</button></span>`).join('') +
    (chips.length ? '<button type="button" class="op-clearall" onclick="clearEverything()">Clear all</button>' : '');
  document.getElementById('openFilters').onclick = () => openFilterModal();
  document.querySelectorAll('#filterBar [data-clear]').forEach(b => { b.onclick = () => clearOne(b.dataset.clear); });
}
function clearOne(key) {
  /* Soltar la AI Search devuelve el pool con los filtros con que arranca la página. */
  if (key === '__ai') { SEARCH.filters = defaultFilters(); if (!AI_RUN || !AI_RUN.running) hideAiProgress(); return loadPool(); }
  if (key === '__q') { SEARCH.q = ''; document.getElementById('searchInput').value = ''; }
  else if (key === '__profile') { SEARCH.profiles = []; profilePicker?.setValue([]); }
  else { const f = FILTER_DEFS.find(x => x.key === key); SEARCH.filters[key] = clone(f.neutral); }
  candPage = 0;
  applyFilters();
}
/* Limpia búsqueda, perfil y filtros; una AI Search en pantalla se mantiene. */
function clearEverything() {
  SEARCH.q = ''; document.getElementById('searchInput').value = '';
  SEARCH.profiles = []; profilePicker?.setValue([]);
  SEARCH.filters = Object.fromEntries(FILTER_DEFS.map(f => [f.key, clone(f.neutral)]));
  candPage = 0;
  applyFilters();
}
/* Lo que usa AI Search al arrancar: filtros por defecto, sin texto, todos los disponibles. */
function enterAiMode() {
  SEARCH.ai = true;
  SEARCH.q = ''; document.getElementById('searchInput').value = '';
  /* Los resultados muestran a todos los candidatos de la búsqueda: sin los filtros del pool. */
  SEARCH.filters = Object.fromEntries(FILTER_DEFS.map(f => [f.key, clone(f.neutral)]));
  SEARCH.sort = 'match';
  renderSortOptions();
}

/* ----------------- Popup de filtros ----------------- */
let draft = null;
let activeCategory = FILTER_DEFS[0].key;
function openFilterModal(key) {
  draft = Object.fromEntries(FILTER_DEFS.map(f => [f.key, clone(SEARCH.filters[f.key])]));
  if (key) activeCategory = key;
  document.getElementById('filterModal').classList.add('open');
  renderModal();
  document.querySelector('.op-modal-box').focus();
}
function closeFilterModal() { document.getElementById('filterModal').classList.remove('open'); }
const draftCount = f => isNeutral(f, draft[f.key]) ? 0 : (Array.isArray(draft[f.key]) ? draft[f.key].length : 1);
function renderModal() {
  let rail = '', group = null;
  FILTER_DEFS.forEach(f => {
    if (f.group !== group) { group = f.group; rail += `<div class="op-rail-group">${group}</div>`; }
    const n = draftCount(f);
    rail += `<button type="button" class="op-rail-item${f.key === activeCategory ? ' is-active' : ''}" data-cat="${f.key}">${f.label}${n ? `<span class="op-rail-badge">${n}</span>` : ''}</button>`;
  });
  document.getElementById('modalRail').innerHTML = rail;
  document.querySelectorAll('#modalRail [data-cat]').forEach(b => { b.onclick = () => { activeCategory = b.dataset.cat; renderModal(); }; });
  renderPanel(FILTER_DEFS.find(f => f.key === activeCategory));
  const chips = FILTER_DEFS.filter(f => !isNeutral(f, draft[f.key]));
  document.getElementById('modalChips').innerHTML = chips.map(f =>
    `<span class="op-chip"><span>${f.chip(draft[f.key])}</span><button class="op-chip-x" data-dchip="${f.key}" aria-label="Remove">${ICON_X_SM}</button></span>`).join('');
  document.querySelectorAll('[data-dchip]').forEach(b => { b.onclick = () => { draft[b.dataset.dchip] = clone(FILTER_DEFS.find(f => f.key === b.dataset.dchip).neutral); renderModal(); }; });
}
function renderPanel(f) {
  const v = draft[f.key];
  const opts = f.options();
  const multi = f.type === 'multi';
  const body = `<div class="op-options${multi ? '' : ' one-col'}">` + opts.map(o => {
    const on = multi ? v.includes(o.value) : v === o.value;
    return `<label class="op-option${on ? ' is-checked' : ''}"><input type="${multi ? 'checkbox' : 'radio'}" name="opt-${f.key}" value="${o.value}"${on ? ' checked' : ''}>` +
      `<span>${o.label}</span>${o.note ? `<span class="op-option-note">${o.note}</span>` : ''}</label>`;
  }).join('') + '</div>';
  const canAll = multi && opts.length > 2 && v.length < opts.length;
  document.getElementById('modalPanel').innerHTML =
    `<div class="op-panel-head"><div class="op-panel-heading"><h3 class="op-panel-title">${f.label}</h3><p class="op-panel-hint">${f.hint}</p></div>` +
    `<div class="op-panel-actions">${canAll ? '<button type="button" class="op-panel-clear" id="panelAll">Select all</button>' : ''}` +
    `${draftCount(f) ? '<button type="button" class="op-panel-clear" id="panelClear">Clear</button>' : ''}</div></div>` + body;
  document.getElementById('panelClear')?.addEventListener('click', () => { draft[f.key] = clone(f.neutral); renderModal(); });
  document.getElementById('panelAll')?.addEventListener('click', () => { draft[f.key] = opts.map(o => o.value); renderModal(); });
  document.querySelectorAll('#modalPanel input').forEach(inp => {
    inp.onchange = () => {
      if (multi) draft[f.key] = inp.checked ? [...draft[f.key], inp.value] : draft[f.key].filter(x => x !== inp.value);
      else draft[f.key] = inp.value;
      renderModal();
    };
  });
}

function updateBulk() {
  const bar = document.getElementById('bulkBar'); if (!bar) return;
  if (SELECTED.size) { bar.classList.add('show'); bar.querySelector('[data-count]').textContent = SELECTED.size; }
  else bar.classList.remove('show');
}

/* ----------------- Drawer detalle ----------------- */
function fillDrawer(c) {
  const d = document.getElementById('drawer'); if (!d) return;
  d.querySelector('[data-d-initials]').textContent = initials(c);
  d.querySelector('[data-d-name]').textContent = `${c.first} ${c.last}`;
  d.querySelector('[data-d-headline]').textContent = c.headline;
  /* La cabecera acompaña el nombre con la ubicación, que es lo que identifica
     al candidato sin repetir el titular que el primer bloque ya muestra. */
  const hl = d.querySelector('[data-d-headloc]');
  if (hl) hl.textContent = (c.locationParts && [c.locationParts.city, c.locationParts.country].filter(Boolean).join(', ')) || c.loc;
  d.querySelector('[data-d-about]').textContent = c.about;
  /* La ubicación estructurada se lee de un vistazo; el texto que devuelve
     LinkedIn queda debajo porque es el que el reclutador reconoce al buscar. */
  const np0 = normalizeProfile(c);
  d.querySelector('[data-d-loc]').innerHTML = np0.city
    ? `<span class="loc-parsed">${np0.city}, ${np0.country}</span><span class="loc-raw">${c.loc}</span>`
    : c.loc;
  const langEl = d.querySelector('[data-d-langs]');
  /* languages llega de la fuente como objetos {name, proficiency}: el nivel
     es la mitad del dato y sin él no se puede decidir a quién presentar. */
  const np = normalizeProfile(c);
  if (langEl) langEl.innerHTML = np.languages.length
    ? np.languages.map(l => `<span class="lang-item"><b>${l.language}</b>${l.level ? `<i>${LEVEL_LABEL[l.level]}</i>` : ''}${l.source === 'text' ? '<i class="lang-src">· from profile text</i>' : ''}</span>`).join('')
    : '<span class="text-muted">Not stated</span>';
  const kv = (sel, v) => { const el = d.querySelector(sel); if (el) el.innerHTML = v || '<span class="text-muted">Not stated</span>'; };
  kv('[data-d-vertical]', np.verticals.join(' · '));
  kv('[data-d-profile]', np.profile ? `${np.profile}${np.profile === 'Otros' ? ' <span class="text-muted">· no catalog profile fits</span>' : ''}` : '');
  kv('[data-d-years]', np.years == null ? '' : yearsLabel(np.years));
  kv('[data-d-seniority]', np.seniority ? SENIORITY_LABEL[np.seniority] : '');
  kv('[data-d-current]', np.title ? `${np.title}${np.company ? ` <span class="text-muted">· ${np.company}</span>` : ''}` : '');
  kv('[data-d-edu]', np.edu ? `${EDU_LABEL[np.edu]}${np.field ? ` <span class="text-muted">· ${np.field}</span>` : ''}` : '');
  kv('[data-d-remote]', np.remote ? 'Yes' : 'No');
  d.querySelector('[data-d-email]').textContent = hasEmailFor(c.id) ? c.email : 'no email';
  d.querySelector('[data-d-experience]').innerHTML = timeline(c.experience, e =>
    [e.position, e.companyName, [e.employmentType, e.location].filter(Boolean).join(' · '),
     `${e.startDate} – ${e.endDate}${e.duration ? ` · ${e.duration}` : ''}`],
    'No work history on the profile');
  d.querySelector('[data-d-education]').innerHTML = timeline(c.education, e =>
    [[e.degree, e.fieldOfStudy].filter(Boolean).join(', '), e.schoolName, '', e.period],
    'No education on the profile');
  setCount(d, '[data-d-expcount]', (c.experience || []).length);
  setCount(d, '[data-d-educount]', (c.education || []).length);
  const top = c.topSkills || [];
  const topEl = d.querySelector('[data-d-topskills]');
  if (topEl) topEl.innerHTML = top.length ? `<span class="top-skills-label">Top</span>${chips(top)}` : '';
  /* Habilidades con su nombre canónico, agrupadas: herramientas, técnicas y blandas. */
  const all = [...np.skills.tools, ...np.skills.technical, ...np.skills.soft].filter(x => !top.includes(x));
  d.querySelector('[data-d-skills]').innerHTML = all.length ? chips(all) : '';
  DRAWER_ID = c.id;
  const st = candState(c.id);
  const otwEl = d.querySelector('[data-d-otw]'); if (otwEl) otwEl.innerHTML = otwBadge(c);
  const stEl = d.querySelector('[data-d-status]'); if (stEl) stEl.innerHTML = statusBadge(st.status);
  const expEl = d.querySelector('[data-d-export]');
  if (expEl) expEl.innerHTML = st.exp
    ? `${shortName(st.exp.by)} · ${shortDate(st.exp.at)}${st.exp.times > 1 ? ` · ${st.exp.times} times` : ''}`
    : 'Never exported';
  renderNotes();
  setCount(d, '[data-d-notecount]', candState(c.id).notes.length);
  fillDrawerMatch(c);
  renderSearchHistory(c);
  resetDrawerTabs();
}

/* ----------------- Outreach ----------------- */
function openOutreach() {
  if (!SELECTED.size) return;
  const n = SELECTED.size;
  const noEmail = [...SELECTED].filter(id => !hasEmailFor(id)).length;
  openConfirmPopup({
    title: 'Send invitation email',
    message: noEmail
      ? `We'll invite the candidates you selected to apply. ${noEmail} of them ${noEmail === 1 ? 'has' : 'have'} no email address, so ${noEmail === 1 ? 'they' : 'they'} won't be contacted.`
      : "We'll invite the candidates you selected to apply.",
    highlight: `${n} candidate${n === 1 ? '' : 's'} selected`,
    icon: 'mail',
    confirmLabel: 'Send invitations',
    onConfirm: confirmOutreach
  });
}
function confirmOutreach() {
  let withEmail = 0;
  SELECTED.forEach(id => {
    if (!hasEmailFor(id)) return;
    withEmail++;
    /* El estatus lo mueve el envío: a quien se omite o falla no se le toca. */
    candState(id).status = 'contacted';
    refreshRowState(id);
  });
  const skipped = SELECTED.size - withEmail;
  applyFilters();
  showToast(
    `${withEmail} invitation${withEmail === 1 ? '' : 's'} sent${skipped ? ` · ${skipped} skipped, no email address` : ''}`,
    skipped ? 'info' : 'success'
  );
}


/* ========================================================================
   Release 2 — estatus y notas, memoria de exportación, y AI Search.
   Todo simulado (mock). Los precios replican el modelo del brief de costos:
   $0.10 por página + $0.004 por perfil (25 perfiles/página) = $0.20 la página
   llena; el email se compra aparte, solo para los que resultan disponibles.
   ======================================================================== */

/* ----------------- Catálogo y constantes ----------------- */
/* Ciudades activas (espejo de las marcadas a:true en parametros.html). */
const LOCATIONS = [
      { country:'Argentina', locs:[ {n:'Buenos Aires',a:true}, {n:'Córdoba, Argentina',a:true}, {n:'La Plata',a:false}, {n:'Mendoza',a:false}, {n:'Rosario',a:false} ] },
      { country:'Belice',    locs:[ {n:'Belmopan',a:false}, {n:'Belize City',a:false}, {n:'Corozal District',a:false}, {n:'Orange Walk Town',a:false}, {n:'San Ignacio',a:false} ] },
      { country:'Colombia',  locs:[ {n:'Bogotá',a:true}, {n:'Medellín',a:true}, {n:'Medellín Area Metropolitana',a:true}, {n:'Barranquilla',a:true}, {n:'Cali',a:false}, {n:'Armenia',a:false}, {n:'Bucaramanga',a:false}, {n:'Ibagué',a:false} ] },
      { country:'Guatemala', locs:[ {n:'Guatemala City',a:false}, {n:'Escuintla',a:false}, {n:'Mixco',a:false}, {n:'Quetzaltenango',a:false}, {n:'Villa Nueva',a:false} ] },
      { country:'Honduras',  locs:[ {n:'San Pedro Sula',a:false}, {n:'Choloma',a:false}, {n:'El Progreso',a:false}, {n:'La Ceiba',a:false}, {n:'Tegucigalpa',a:false} ] },
      { country:'Kenia',     locs:[ {n:'Nairobi',a:true} ] },
      { country:'México',    locs:[ {n:'Chihuahua',a:true}, {n:'Mérida',a:true}, {n:'Mexico City',a:false}, {n:'Aguascalientes',a:false}, {n:'Yucatán',a:false} ] },
      { country:'Perú',      locs:[ {n:'Lima',a:true}, {n:'Arequipa',a:false}, {n:'Chiclayo',a:false}, {n:'Piura',a:false}, {n:'Trujillo',a:false} ] },
];

/* La cobertura del pipeline programado son las ciudades marcadas activas.
   La búsqueda asistida no se acota a esa marca: puede ir a cualquiera del
   catálogo, porque su razón de ser es buscar donde el cron todavía no va. */
const ALL_CITIES = LOCATIONS.flatMap(c => c.locs.map(l => ({ city: l.n, country: c.country })));
const ACTIVE_CITIES = LOCATIONS.flatMap(c => c.locs.filter(l => l.a).map(l => ({ city: l.n, country: c.country })));


const REQUIRED_LANGS = ['English', 'Spanish', 'Portuguese', 'French'];

/* Techo de presupuesto y consumo acumulado del período.
   Se persiste para que Parameters y AI Search vean el mismo saldo. */
function loadBudget() {
  try {
    const b = JSON.parse(localStorage.getItem('tps_budget'));
    if (b && typeof b.cap === 'number') return b;
  } catch (e) {}
  return { cap: 105, spent: 28.7, periodDays: 30 };
}
const BUDGET = loadBudget();
function saveBudget() { try { localStorage.setItem('tps_budget', JSON.stringify(BUDGET)); } catch (e) {} }
/* Mínimo de candidatos por debajo del cual la búsqueda se amplía al criterio siguiente. */
const BROADEN_MIN = 8;

const STATUS_LABEL = { detected: 'Detected', contacted: 'Cold email sent' };
const money = n => '$' + n.toFixed(2);
const money4 = n => '$' + n.toFixed(4);
const shortDate = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
function shortName(full) {
  const p = full.trim().split(/\s+/);
  return p.length > 1 ? `${p[0]} ${p[p.length - 1][0]}.` : p[0];
}

/* ----------------- Estado de gestión por candidato (mock) ----------------- */
/* status · notes (hilo con autor y fecha) · exp (memoria de exportación) */
const CAND_STATE = {};
function candState(id) {
  if (!CAND_STATE[id]) CAND_STATE[id] = { status: 'detected', notes: [], exp: null };
  return CAND_STATE[id];
}
(function seedState() {
  const d = (dd, mm) => new Date(2026, mm - 1, dd);
  CAND_STATE[1] = { status:'contacted', exp:{ by:'Andrea Ramírez', at:d(12,8), times:2 },
    notes:[ { by:'Andrea Ramírez', at:d(11,8), text:'Habla inglés C1 confirmado en la llamada. Disponible para turno US East.' },
            { by:'Carlos Ortega', at:d(12,8), text:'Enviado a la vacante de CSR bilingüe de Acme.' } ] };
  CAND_STATE[2] = { status:'detected', exp:{ by:'Andrea Ramírez', at:d(12,8), times:1 }, notes:[] };
  CAND_STATE[4] = { status:'contacted', exp:null,
    notes:[ { by:'Carlos Ortega', at:d(19,8), text:'Zona horaria de Filipinas: solo sirve para cuentas con turno nocturno.' } ] };
  CAND_STATE[6] = { status:'detected', exp:{ by:'Carlos Ortega', at:d(20,8), times:1 }, notes:[] };
  CAND_STATE[8] = { status:'detected', exp:null,
    notes:[ { by:'Laura Méndez', at:d(21,8), text:'Perfil técnico más fuerte de lo que pide la vacante; considerar para soporte L2.' } ] };
})();

/* ----------------- Celdas derivadas del estado ----------------- */
/* Disponibilidad del candidato: la escribe el pipeline, y puede no estar escrita todavía. */
const OTW_LABEL = { yes: 'Open to work', no: 'Not available' };
function otwKey(c) { return c.otw === true ? 'yes' : c.otw === false ? 'no' : 'unknown'; }
function otwBadge(c) {
  const k = otwKey(c);
  /* Sin señal escrita no es lo mismo que no disponible: para decidir a quién contactar son cosas distintas. */
  if (k === 'unknown') return '<span class="otw-none">No signal</span>';
  return `<span class="badge badge-${k === 'yes' ? 'success' : 'neutral'}">${OTW_LABEL[k]}</span>`;
}
function statusBadge(status) {
  const cls = status === 'contacted' ? 'contacted' : 'detected';
  return `<span class="badge-pipeline badge-pipeline-${cls}" style="cursor:default;">${STATUS_LABEL[status]}</span>`;
}
function exportCell(exp) {
  if (!exp) return '<span class="exp-none">—</span>';
  return `<div class="exp-badge">
      <span class="exp-who">${shortName(exp.by)}${exp.times > 1 ? `<span class="exp-times">×${exp.times}</span>` : ''}</span>
      <span class="exp-when">${shortDate(exp.at)}</span>
    </div>`;
}
function noteDot(n) {
  return `<span class="note-dot" title="${n} note${n === 1 ? '' : 's'}">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>${n}</span>`;
}
/* Relación del candidato con quien mira: sin exportar, propio o de otro. */
function expOwner(exp) {
  if (!exp) return 'none';
  const me = getCurrentUser();
  return me && exp.by === me.name ? 'me' : 'other';
}

/* ----------------- Constructor de fila (compartido por ambas búsquedas) ----------------- */
function buildCandRow(c) {
  const hasEmail = c.emailKnown !== undefined ? c.emailKnown : EMAIL_RESOLUTION[c.id];
  const st = candState(c.id);
  const tr = document.createElement('tr');
  tr.className = 'cand-row';
  tr.style.cursor = 'pointer';
  tr.dataset.id = c.id;
  const np = normalizeProfile(c);
  /* La búsqueda de texto lee también las habilidades canónicas: "customer service" encuentra a quien escribió "atención al cliente". */
  tr.dataset.text = norm([c.headline, c.about, c.skills.join(' '), ...np.skills.tools, ...np.skills.technical, ...np.skills.soft].join(' '));
  tr.dataset.langs = JSON.stringify(np.languages);
  tr.dataset.years = np.years ?? '';
  tr.dataset.edu = np.edu || '';
  tr.dataset.remote = np.remote ? '1' : '0';
  tr.dataset.seniority = np.seniority || '';
  tr.dataset.country = candCountry(c);
  tr.dataset.city = normalizeProfile(c).city || 'none';
  tr.dataset.email = hasEmail ? '1' : '0';
  tr.dataset.status = st.status;
  tr.dataset.otw = otwKey(c);
  tr.dataset.exp = expOwner(st.exp);
  tr.dataset.profile = normalizeProfile(c).profile || '';
  tr.dataset.vertical = JSON.stringify(normalizeProfile(c).verticals);
  tr.dataset.detected = +detectedAt(c);
  tr.dataset.name = `${c.first} ${c.last}`;
  const ra = rowAnalysis(c);
  tr.dataset.score = ra && !ra.off && !(SEARCH.ai && c.analyzing) ? ra.score : -1;
  tr.innerHTML = `
    <td class="cand-check" onclick="event.stopPropagation()">${hasEmail
      ? `<input type="checkbox" data-id="${c.id}" aria-label="Select for the invitation email">`
      : `<input type="checkbox" disabled title="No email: an invitation cannot be sent" aria-label="No email, cannot be selected">`}</td>
    <td><div class="cand-name"><span class="cand-avatar">${initials(c)}</span>
        <div><span class="font-medium">${c.first} ${c.last}</span>${st.notes.length ? noteDot(st.notes.length) : ''}<br><span class="text-muted cand-loc">${normalizeProfile(c).city ? `${normalizeProfile(c).city}, ${normalizeProfile(c).country}` : c.loc}</span></div></div></td>
    <td class="td-match" data-cell="match">${matchCell(c)}</td>
    <td class="cand-headline"><span>${c.headline}</span></td>
    <td class="cand-years">${normalizeProfile(c).years == null ? '<span class="text-muted">—</span>' : yearsLabel(normalizeProfile(c).years)}</td>
    <td>${normalizeProfile(c).seniority ? `<span class="seniority-pill">${SENIORITY_LABEL[normalizeProfile(c).seniority]}</span>` : '<span class="text-muted">—</span>'}</td>
    <td>${chipsCapped(c.skills, 3)}</td>
    <td>${chipsCapped(normalizeProfile(c).languages.map(langLabel), 2)}</td>
    <td class="cand-email">${hasEmail ? `<span class="email-cell">${c.email}</span>` : `<span class="email-cell email-none">no email</span>`}</td>
    <td onclick="event.stopPropagation()"><a class="cand-li" href="#" target="_blank" rel="noopener">LinkedIn ↗</a></td>`;
  tr.addEventListener('click', () => { fillDrawer(c); openDrawer(); });
  return tr;
}

/* Refresca in situ las celdas que dependen del estado, sin re-renderizar la tabla. */
function refreshRowState(id) {
  const tr = document.querySelector(`#candRows tr[data-id="${id}"]`);
  if (!tr) return;
  const st = candState(id);
  tr.dataset.status = st.status;
  tr.dataset.exp = expOwner(st.exp);
  /* Estatus y exportación ya no son columnas: siguen en el detalle y en los filtros. */
  const nameCell = tr.querySelector('.cand-name .font-medium');
  const dot = tr.querySelector('.note-dot');
  if (st.notes.length && !dot) nameCell.insertAdjacentHTML('afterend', noteDot(st.notes.length));
  else if (st.notes.length && dot) dot.outerHTML = noteDot(st.notes.length);
}


/* ========================================================================
   AI Search — interpretación de la descripción y búsqueda en la fuente
   ======================================================================== */

/* Léxico del intérprete. En operación esto lo resuelve el modelo de lenguaje;
   acá se replica con coincidencia de términos para que la demo sea real. */
const LEX = {
  roles: {
    'Paralegal': ['paralegal'],
    'Legal Assistant': ['legal assistant','asistente legal','asistente jurídico','law clerk'],
    'Customer Service Representative': ['customer service','servicio al cliente','csr','customer support','soporte al cliente'],
    'Executive Assistant': ['executive assistant','asistente ejecutiv','virtual assistant','asistente virtual'],
    'Sales Development Representative': ['sdr','sales development','inside sales','representante de ventas'],
    'Collections Specialist': ['collections','cobranza'],
    'Medical Biller': ['medical billing','medical biller','facturación médica'],
    'Bookkeeper': ['bookkeeper','auxiliar contable','accounting assistant'],
    'Technical Support Specialist': ['technical support','soporte técnico','help desk'],
  },
  skills: {
    'Litigation': ['litigation','litigio'],
    'Immigration Law': ['immigration','inmigración','migratorio'],
    'Personal Injury': ['personal injury','lesiones personales'],
    'Case Management': ['case management','manejo de casos','expedientes'],
    'Drafting': ['drafting','redacción','pleadings','demandas'],
    'Salesforce': ['salesforce'],
    'Zendesk': ['zendesk'],
    'HubSpot': ['hubspot'],
    'QuickBooks': ['quickbooks'],
    'CRM': ['crm'],
    'Call Center': ['call center','contact center'],
    'E-commerce': ['e-commerce','ecommerce','shopify'],
    'Cold Calling': ['cold call','llamada en frío'],
  },
  industries: {
    'Legal': ['law firm','bufete','legal','jurídic'],
    'Healthcare': ['healthcare','salud','medical','médic'],
    'Fintech': ['fintech','banking','banca'],
    'SaaS': ['saas','software'],
    'Logistics': ['logistics','logística','freight'],
    'BPO': ['bpo','outsourcing','tercerizac'],
  },
  seniority: {
    'Entry level': ['entry level','junior','trainee','sin experiencia'],
    'Mid-Senior': ['semi senior','mid','intermedio'],
    'Senior': ['senior','sr.','experimentad'],
    'Manager': ['manager','gerente','jefe de'],
  },
  languages: {
    'English': ['english','inglés','ingles','bilingual','bilingüe','c1','b2'],
    'Portuguese': ['portuguese','portugués'],
    'French': ['french','francés'],
  },
};

/* Palabras que no aportan a una búsqueda de perfiles. */
const STOPWORDS = new Set(('necesito busco buscamos quiero requiero alguien persona candidato candidata ' +
  'que para con una unos unas los las del de la el en por sobre como muy más mas tenga tener sea ser ' +
  'need needing looking want wanted someone person candidate profile that for with the and are who ' +
  'able must should have has our we').split(/\s+/));

function keyTerms(raw) {
  const words = raw.toLowerCase()
    .replace(/[^\p{L}\p{N}\s+#]/gu, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOPWORDS.has(w));
  const uniq = [...new Set(words)].slice(0, 3);
  return uniq.length ? [uniq.join(' ')] : ['Customer Service Representative'];
}

function matchLex(text, group) {
  const out = [];
  for (const [label, terms] of Object.entries(group)) {
    if (terms.some(t => text.includes(t))) out.push(label);
  }
  return out;
}

/* ----------------- Estimación de alcance y costo -----------------
   Mismas tarifas y supuestos que la proyección mensual: COST_MODEL. */
function estimate(pages, cityCount) {
  const m = COST_MODEL;
  const totalPages = pages * cityCount;
  const maxCands = totalPages * m.profilesPerPage;
  const persisted = Math.round(maxCands * m.uniqueRate);
  const expected = Math.round(persisted * m.otwYield);
  const searchCost = totalPages * (m.rateSearchPage + m.profilesPerPage * m.rateProfile);
  const emailCost = persisted * m.rateEmail;
  /* Análisis de afinidad: tope sobre los disponibles; el filtro de pertinencia lo baja en la práctica. */
  const matchCost = expected * aiMatchPerCandidate();
  return { totalPages, maxCands, persisted, expected, searchCost, emailCost, matchCost, total: searchCost + emailCost + matchCost };
}
/* Perfil completo + descripción + instrucción (~5.000 tokens) y seis criterios con su razón (~600). */
function aiMatchPerCandidate() {
  const m = COST_MODEL;
  return (m.aiInTokens * m.aiInPer1M + 600 * m.aiOutPer1M) / 1e6;
}
const budgetLeft = () => BUDGET.cap - BUDGET.spent;

/* ----------------- Candidatos que trae la búsqueda asistida (demo) -----------------
   Ficticios, modelados sobre los arquetipos reales del spike de pertinencia
   (88 candidatos del pool de Customer Service Representative):
   · 7 de 20 no pasan el filtro de palabras clave (el rol no aparece en un cargo vigente o de los
     últimos 5 años, ni en el titular respaldado por un término del dominio).
   · 3 pasan el filtro pero la IA los marca fuera de foco: el término está, la función es otra.
   · 10 reciben el análisis de afinidad completo. */
const AI_DEMO = {
  label: 'Bilingual Customer Service Rep · E-commerce support, Zendesk · English B2+',
  firstBatch: 10,
};

const xp = (position, companyName, startDate, endDate, duration, location = '', employmentType = 'Full-time') =>
  ({ position, companyName, startDate, endDate, duration, location, employmentType });
const ed = (degree, fieldOfStudy, schoolName, period) => ({ degree, fieldOfStudy, schoolName, period });
const lg = (name, proficiency) => ({ name, proficiency });
const NATIVE = 'Native or bilingual proficiency', FULL = 'Full professional proficiency',
      WORK = 'Professional working proficiency', LIMITED = 'Limited working proficiency';
const EDU_NA = { na: true, reason: 'This search does not ask for a degree or a certification, so education does not weigh in the match.' };
const where = (city, country, state = '') => ({ loc: [city, state, country].filter(Boolean).join(', '), locationParts: { city, state, country } });

const AI_POOL = [
  { id: 201, first: 'Valentina', last: 'Ríos', ...where('Bogotá', 'Colombia', 'Bogotá D.C.'), verified: true, otw: true, emailKnown: true,
    email: 'valentina.rios@gmail.com',
    headline: 'Bilingual Customer Support Agent | E-commerce | Zendesk & Gorgias | English C1',
    about: 'Agente de soporte bilingüe con cuatro años atendiendo clientes de Estados Unidos para marcas de e-commerce. Resuelvo pedidos, cambios, devoluciones y reembolsos por chat, correo y teléfono, siempre dejando el ticket documentado.\n\nTrabajo a diario en Zendesk y Gorgias con macros y SLA, y conozco el back office de Shopify para rastrear órdenes sin escalar. Mantengo CSAT por encima de 94%.',
    languages: [lg('Español', NATIVE), lg('Inglés', FULL)],
    topSkills: ['Zendesk', 'Gorgias', 'Refunds & returns'],
    skills: ['Zendesk', 'Gorgias', 'Refunds & returns', 'Shopify', 'Live chat', 'Email support', 'Order tracking', 'De-escalation', 'Macros', 'CSAT'],
    experience: [xp('Customer Support Agent — US fashion retailer', 'Teleperformance', 'Mar 2023', 'Present', '2 yrs 7 mos', 'Bogotá, Colombia'),
                 xp('Chat Support Representative', 'Konecta', 'Jun 2021', 'Feb 2023', '1 yr 9 mos', 'Bogotá, Colombia')],
    education: [ed('Tecnólogo', 'Gestión Comercial', 'SENA', '2018 - 2020')],
    profile: 'Customer Service Representative',
    match: { score: 92, reason: 'Four years of inbound e-commerce support for a US retailer on Zendesk and Gorgias — orders, returns and refunds by chat, email and phone — with English at full professional level.',
      criteria: {
        experience: { score: 94, reason: '4 years 4 months of inbound support, all of it for US e-commerce customers: order tracking, returns and refunds across chat, email and phone. Above the 2 years asked.' },
        seniority:  { score: 85, reason: 'Agent level with four years in the seat — the level this role hires for, with enough tenure to work without close supervision.' },
        skills:     { score: 95, reason: 'Uses Zendesk and Gorgias daily, two of the three tools the search names, plus Shopify back office for order lookups.' },
        languages:  { score: 90, reason: 'English at full professional proficiency (stated as C1 in her headline), above the B2 required. Native Spanish.' },
        education:  EDU_NA,
        us:         { score: 92, reason: 'Her current account is a US fashion retailer: she works with US customers, policies and hours.' } } } },

  { id: 202, first: 'Andrés', last: 'Montoya', ...where('Medellín', 'Colombia', 'Antioquia'), verified: false, otw: true, emailKnown: false, email: null,
    headline: 'Líder Comercial B2B | Software y Tecnología | Consultoría de compra',
    about: 'Lidero procesos de venta consultiva de software para empresas medianas. Prospección, demos y cierre.',
    languages: [lg('Español', NATIVE), lg('Inglés', WORK)], topSkills: [], skills: ['Ventas B2B', 'Prospección', 'CRM', 'Negociación'],
    experience: [xp('Asesor comercial', 'Grupo Soluciones TI', 'Feb 2022', 'Present', '3 yrs 8 mos', 'Medellín, Colombia'),
                 xp('Especialista en tecnología', 'Alkosto', 'Jan 2019', 'Jan 2022', '3 yrs', 'Medellín, Colombia')],
    education: [ed('Profesional', 'Administración de Empresas', 'Universidad EAFIT', '2013 - 2018')],
    profile: 'Customer Service Representative', match: { off: true, reason: 'B2B technology sales: consultative selling and demos to companies, not inbound support to consumers.' } },

  { id: 203, first: 'Daniela', last: 'Cárdenas', ...where('Barranquilla', 'Colombia', 'Atlántico'), verified: true, otw: true, emailKnown: true,
    email: 'dani.cardenas@outlook.com',
    headline: 'Customer Service Representative | Insurance claims | US accounts',
    about: 'Representante de servicio al cliente con tres años en llamadas inbound para una aseguradora de autos de Estados Unidos. Atiendo reclamos, dudas de facturación y cambios de póliza en Salesforce Service Cloud.\n\nAntes trabajé en atención presencial en sucursal bancaria. Inglés profesional.',
    languages: [lg('Español', NATIVE), lg('Inglés', WORK)],
    topSkills: ['Salesforce Service Cloud', 'Inbound calls', 'Claims'],
    skills: ['Salesforce Service Cloud', 'Inbound calls', 'Claims', 'Billing', 'De-escalation', 'Customer Service', 'Microsoft Office'],
    experience: [xp('Customer Service Representative — US auto insurance', 'Concentrix', 'Aug 2022', 'Present', '3 yrs 2 mos', 'Barranquilla, Colombia'),
                 xp('Asesora de servicio', 'Banco de Occidente', 'Feb 2020', 'Jul 2022', '2 yrs 6 mos', 'Barranquilla, Colombia')],
    education: [ed('Técnico profesional', 'Contabilidad', 'Universidad del Atlántico', '2017 - 2019')],
    profile: 'Customer Service Representative',
    match: { score: 79, reason: 'Three years on inbound calls for a US insurer in Salesforce Service Cloud: a strong service base, though her cases are claims and billing rather than e-commerce orders and refunds.',
      criteria: {
        experience: { score: 76, reason: '3 years of inbound phone support for US customers, above the 2 required. The domain is insurance claims and billing; there is no order, return or refund handling, and no chat or email channel.' },
        seniority:  { score: 82, reason: 'Agent level, three years in the role — matches the seat.' },
        skills:     { score: 80, reason: 'Works in Salesforce Service Cloud, one of the three tools named. Billing questions and de-escalation are in her day-to-day.' },
        languages:  { score: 70, reason: 'English at professional working proficiency, roughly the B2 threshold; worth confirming on a call.' },
        education:  EDU_NA,
        us:         { score: 88, reason: 'Her account is a US auto insurer: US customers and US business hours for three years.' } } } },

  { id: 204, first: 'Camilo', last: 'Herrera', ...where('Lima', 'Peru', 'Lima'), verified: true, otw: true, emailKnown: false, email: null,
    headline: 'Ingeniero de Calidad | Industria automotriz | Six Sigma Green Belt',
    about: 'Ingeniero industrial enfocado en control de calidad de procesos y proveedores. PPAP, 8D y mejora continua.',
    languages: [lg('Español', NATIVE), lg('Inglés', WORK)], topSkills: [], skills: ['Six Sigma', 'PPAP', '8D', 'Control de calidad'],
    experience: [xp('Quality Control Engineer', 'Autopartes Andinas', 'Mar 2021', 'Present', '4 yrs 7 mos', 'Lima, Perú')],
    education: [ed('Bachiller', 'Ingeniería Industrial', 'Universidad de Lima', '2014 - 2019')],
    profile: 'Customer Service Representative', match: { off: true, reason: 'Quality engineer in automotive manufacturing; no customer support in his history.' } },

  { id: 205, first: 'Natalia', last: 'Pardo', ...where('Bogotá', 'Colombia', 'Bogotá D.C.'), verified: true, otw: true, emailKnown: true,
    email: 'natalia.pardo.s@gmail.com',
    headline: 'Customer Service & Operations Lead | BPO | US telecom accounts',
    about: 'Siete años en servicio al cliente inbound: empecé como agente bilingüe en una cuenta de telecomunicaciones de Estados Unidos y desde 2022 lidero un equipo de 18 agentes. Me ocupo de calidad, coaching y cumplimiento de SLA.',
    languages: [lg('Español', NATIVE), lg('Inglés', FULL)],
    topSkills: ['Team leadership', 'Quality monitoring', 'Zendesk'],
    skills: ['Team leadership', 'Quality monitoring', 'Zendesk', 'Coaching', 'WFM', 'Inbound calls', 'SLA management'],
    experience: [xp('Customer Service Supervisor — US telecom', 'Atento', 'Feb 2022', 'Present', '3 yrs 8 mos', 'Bogotá, Colombia'),
                 xp('Bilingual Customer Service Agent — US telecom', 'Atento', 'Jun 2018', 'Jan 2022', '3 yrs 8 mos', 'Bogotá, Colombia')],
    education: [ed('Profesional', 'Administración de Empresas', 'Universidad Externado de Colombia', '2012 - 2017')],
    profile: 'Customer Service Representative',
    match: { score: 68, reason: 'Solid inbound background for US accounts, but she has led a team for over three years; this is an agent seat, so it would be a step back in level.',
      criteria: {
        experience: { score: 84, reason: '7 years in inbound service for a US telecom, almost 4 of them as an agent on phone and chat. Not e-commerce, but the service skills transfer directly.' },
        seniority:  { score: 42, reason: 'Supervisor of 18 agents since 2022. The role asks for an agent; expect a salary and motivation gap.' },
        skills:     { score: 70, reason: 'Zendesk from her agent years. No e-commerce or refund tooling.' },
        languages:  { score: 90, reason: 'English at full professional proficiency, well above B2.' },
        education:  EDU_NA,
        us:         { score: 86, reason: 'Seven years on a US telecom account, with US customers and hours.' } } } },

  { id: 206, first: 'Laura', last: 'Benítez', ...where('Medellín', 'Colombia', 'Antioquia'), verified: true, otw: true, emailKnown: true,
    email: 'laura.benitez.c@gmail.com',
    headline: 'Analista de comunicaciones en Stop Jeans',
    about: 'Comunicadora social con experiencia en comunicación interna, redes y relacionamiento con medios para marcas de moda.',
    languages: [lg('Español', NATIVE), lg('Inglés', LIMITED)], topSkills: ['Comunicación interna'], skills: ['Comunicación interna', 'Redes sociales', 'Relaciones públicas', 'Redacción'],
    experience: [xp('Analista de comunicaciones', 'Stop Jeans', 'Mar 2023', 'Present', '2 yrs 7 mos', 'Medellín, Colombia'),
                 xp('Servicio de atención al cliente', 'Éxito', 'Jun 2022', 'Feb 2023', '9 mos', 'Medellín, Colombia', 'Part-time'),
                 xp('Jefe de comunicaciones', 'Agencia Nodo', 'Mar 2017', 'May 2022', '5 yrs 3 mos', 'Medellín, Colombia')],
    education: [ed('Profesional', 'Comunicación Social', 'Universidad de Antioquia', '2011 - 2016')],
    profile: 'Customer Service Representative',
    match: { off: true, reason: 'Her career is corporate communications. The only customer service role was nine months of part-time in-store work between two communications jobs — the keyword is there, the function is not.' } },

  { id: 207, first: 'Juan Sebastián', last: 'Lozano', ...where('Bogotá', 'Colombia', 'Bogotá D.C.'), verified: false, otw: true, emailKnown: true,
    email: 'jslozano.cs@gmail.com',
    headline: 'Agente bilingüe de servicio al cliente | Chat & email | Amazon',
    about: 'Atiendo clientes de Amazon en Estados Unidos por chat y correo: estado de pedidos, devoluciones, reembolsos y reclamos de entrega. Antes estuve en call center inbound para una cuenta de telecomunicaciones.',
    languages: [lg('Español', NATIVE), lg('Inglés', WORK)],
    topSkills: ['Chat support', 'Returns & refunds', 'Order tracking'],
    skills: ['Chat support', 'Email support', 'Returns & refunds', 'Order tracking', 'Customer Service', 'Typing 60 wpm'],
    experience: [xp('Representante del servicio de atención al cliente — Amazon US', 'Amazon', 'Jan 2024', 'Present', '1 yr 9 mos', 'Bogotá, Colombia'),
                 xp('Asesor de call center', 'Emtelco', 'Apr 2023', 'Dec 2023', '9 mos', 'Bogotá, Colombia')],
    education: [ed('Estudiante', 'Negocios Internacionales', 'Politécnico Grancolombiano', '2022 - Present')],
    profile: 'Customer Service Representative',
    match: { score: 78, reason: 'Handles orders, returns and refunds for US Amazon customers by chat and email and meets the experience bar, but he has not worked on Zendesk, Gorgias or Salesforce.',
      criteria: {
        experience: { score: 84, reason: '2 years 6 months of inbound support; the current 21 months are exactly the e-commerce work described — orders, returns, refunds — for US customers.' },
        seniority:  { score: 80, reason: 'Agent level, early in his career; fits the seat.' },
        skills:     { score: 52, reason: 'Works on Amazon\'s internal tools only. None of Zendesk, Gorgias or Salesforce Service Cloud appear; ramp-up is likely short but real.' },
        languages:  { score: 74, reason: 'English at professional working proficiency, around B2; chat and email work suggests solid written English.' },
        education:  EDU_NA,
        us:         { score: 92, reason: 'Serves US Amazon customers daily, under US policies and hours.' } } } },

  { id: 208, first: 'Mariana', last: 'Ochoa', ...where('Lima', 'Peru', 'Lima'), verified: true, otw: true, emailKnown: false, email: null,
    headline: 'Jefe de Marketing | Trade Marketing | Branding',
    about: 'Doce años construyendo marcas de consumo masivo: planes de trade, lanzamientos y gestión de agencias.',
    languages: [lg('Español', NATIVE), lg('Inglés', FULL)], topSkills: [], skills: ['Trade marketing', 'Branding', 'Marketing digital'],
    experience: [xp('Jefe de marketing', 'Alicorp', 'May 2019', 'Present', '6 yrs 5 mos', 'Lima, Perú')],
    education: [ed('Licenciatura', 'Marketing', 'Universidad del Pacífico', '2008 - 2013')],
    profile: 'Customer Service Representative', match: { off: true, reason: 'Twelve years leading trade marketing and brands; a different function from customer support.' } },

  { id: 209, first: 'Felipe', last: 'Arango', ...where('Medellín', 'Colombia', 'Antioquia'), verified: true, otw: true, emailKnown: false, email: null,
    headline: 'iOS Developer | 3+ years | SwiftUI | UIKit',
    about: 'Desarrollador iOS. Apps nativas en Swift, SwiftUI y UIKit, integración con APIs REST.',
    languages: [lg('Español', NATIVE), lg('Inglés', WORK)], topSkills: [], skills: ['Swift', 'SwiftUI', 'UIKit', 'REST APIs'],
    experience: [xp('iOS Developer', 'Pragma', 'Jul 2022', 'Present', '3 yrs 3 mos', 'Medellín, Colombia')],
    education: [ed('Profesional', 'Ingeniería de Sistemas', 'Universidad Nacional de Colombia', '2016 - 2021')],
    profile: 'Customer Service Representative', match: { off: true, reason: 'iOS developer; no customer-facing support in his history.' } },

  { id: 210, first: 'Paola', last: 'Ramírez', ...where('Barranquilla', 'Colombia', 'Atlántico'), verified: false, otw: true, emailKnown: true,
    email: 'paola.ramirez.v@hotmail.com',
    headline: 'Especialista en Ventas | Telemercadeo | Atención al Cliente | Ventas para USA',
    about: 'Agente de ventas telefónicas para el mercado de Estados Unidos en reparación de crédito. Llamadas outbound, manejo de objeciones y seguimiento en HubSpot. Inglés B2.',
    languages: [lg('Español', NATIVE)],
    topSkills: ['Outbound calls', 'Objection handling'],
    skills: ['Outbound calls', 'Objection handling', 'HubSpot', 'Sales', 'Atención al cliente'],
    experience: [xp('Agente de ventas — US credit repair', 'Allied Global', 'Sep 2023', 'Present', '2 yrs 1 mo', 'Barranquilla, Colombia'),
                 xp('Vendedora', 'Falabella', 'Jan 2021', 'Aug 2023', '2 yrs 8 mos', 'Barranquilla, Colombia')],
    education: [ed('Técnico', 'Mercadeo', 'SENA', '2019 - 2020')],
    profile: 'Customer Service Representative',
    match: { score: 52, reason: 'Two years on the phone with US customers, but in outbound sales for credit repair rather than inbound support, and no ticketing tool experience.',
      criteria: {
        experience: { score: 45, reason: '2 years of phone work with US customers, all outbound sales. No inbound support, orders, returns or refunds.' },
        seniority:  { score: 70, reason: 'Agent level; the level fits even though the function differs.' },
        skills:     { score: 34, reason: 'HubSpot for sales follow-up. None of the support tools the search names.' },
        languages:  { score: 70, reason: 'English at professional working proficiency, near the B2 threshold.' },
        education:  EDU_NA,
        us:         { score: 80, reason: 'Two years selling to US consumers, on US hours.' } } } },

  { id: 211, first: 'Sofía', last: 'Mejía', ...where('Medellín', 'Colombia', 'Antioquia'), verified: true, otw: true, emailKnown: true,
    email: 'sofia.mejia.cx@gmail.com',
    headline: 'Customer Support Specialist | DTC e-commerce | Zendesk & Gorgias | English C2',
    about: 'Five years in customer support for US direct-to-consumer brands. I own refunds and escalations end to end, write macros for the team and keep CSAT above 96%.\n\nComfortable with Zendesk, Gorgias and Shopify, and with rotating shifts during peak season.',
    languages: [lg('Español', NATIVE), lg('Inglés', NATIVE)],
    topSkills: ['Zendesk', 'Gorgias', 'Escalations'],
    skills: ['Zendesk', 'Gorgias', 'Escalations', 'Shopify', 'Refunds & returns', 'Macros', 'CSAT', 'Live chat', 'Email support', 'Phone support'],
    experience: [xp('Customer Support Specialist — US skincare brand', 'Foundever', 'Oct 2022', 'Present', '3 yrs', 'Medellín, Colombia'),
                 xp('Customer Care Agent — US home goods retailer', 'Teleperformance', 'Aug 2020', 'Sep 2022', '2 yrs 2 mos', 'Medellín, Colombia')],
    education: [ed('Profesional', 'Lenguas Extranjeras', 'Universidad Pontificia Bolivariana', '2015 - 2020')],
    profile: 'Customer Service Representative',
    match: { score: 94, reason: 'Five years of e-commerce support for US direct-to-consumer brands on Zendesk and Gorgias, owning refunds, escalations and CSAT, with bilingual English.',
      criteria: {
        experience: { score: 96, reason: '5 years of inbound support for US e-commerce brands across chat, email and phone; owns refunds and escalations end to end.' },
        seniority:  { score: 82, reason: 'Specialist tier within the agent track — experienced enough to coach peers without being a manager.' },
        skills:     { score: 96, reason: 'Zendesk and Gorgias, plus Shopify; writes macros for her team.' },
        languages:  { score: 98, reason: 'English at native or bilingual proficiency, far above B2.' },
        education:  EDU_NA,
        us:         { score: 95, reason: 'Every account in her history is a US consumer brand.' } } } },

  { id: 212, first: 'Ricardo', last: 'Paz', ...where('Lima', 'Peru', 'Lima'), verified: false, otw: true, emailKnown: false, email: null,
    headline: 'Jefe de Compras | Supply Chain | Negociación con proveedores',
    about: 'Gestión de compras estratégicas, homologación de proveedores y control de inventarios.',
    languages: [lg('Español', NATIVE)], topSkills: [], skills: ['Compras', 'Supply chain', 'Negociación'],
    experience: [xp('Jefe de compras', 'Distribuidora Norte', 'Jan 2020', 'Present', '5 yrs 9 mos', 'Lima, Perú')],
    education: [ed('Bachiller', 'Administración', 'Universidad San Martín de Porres', '2010 - 2015')],
    profile: 'Customer Service Representative', match: { off: true, reason: 'Procurement and supplier management; a different function from customer support.' } },

  { id: 213, first: 'Gabriela', last: 'Torres', ...where('Bogotá', 'Colombia', 'Bogotá D.C.'), verified: true, otw: true, emailKnown: true,
    email: 'gabriela.torres.abg@gmail.com',
    headline: 'Law Graduate | Bilingual (Spanish-English B2) | Legal, Administrative & Customer Service Roles',
    about: 'Abogada con experiencia en litigio civil y apoyo administrativo en despacho; también respondí consultas de clientes del despacho por chat. Busco nuevas oportunidades.',
    languages: [lg('Español', NATIVE), lg('Inglés', WORK)], topSkills: ['Litigio'], skills: ['Litigio', 'Redacción jurídica', 'Gestión documental'],
    experience: [xp('Abogada litigante', 'Torres & Asociados', 'Feb 2022', 'Present', '3 yrs 8 mos', 'Bogotá, Colombia'),
                 xp('Auxiliar jurídico', 'Notaría 45', 'Jan 2020', 'Jan 2022', '2 yrs', 'Bogotá, Colombia')],
    education: [ed('Profesional', 'Derecho', 'Universidad Católica de Colombia', '2015 - 2021')],
    profile: 'Customer Service Representative',
    match: { off: true, reason: 'Practicing litigation lawyer. "Customer service" appears only in her headline; no support role appears anywhere in her history.' } },

  { id: 214, first: 'Carlos', last: 'Gutiérrez', ...where('Lima', 'Peru', 'Lima'), verified: false, otw: true, emailKnown: true,
    email: 'carlos.gutierrez.r@gmail.com',
    headline: 'Administrador de tienda | Líder en ventas retail | Atención al cliente',
    about: 'Administro una tienda de una cadena retail: equipo de ocho vendedores, inventario, metas y servicio al cliente en piso.',
    languages: [lg('Español', NATIVE), lg('Inglés', LIMITED)],
    topSkills: ['Retail', 'Atención al cliente'],
    skills: ['Retail', 'Atención al cliente', 'Gestión de equipos', 'Inventarios', 'Ventas'],
    experience: [xp('Administrador de tienda', 'Saga Falabella', 'Mar 2021', 'Present', '4 yrs 7 mos', 'Lima, Perú'),
                 xp('Asesor de ventas retail', 'Ripley', 'Feb 2018', 'Feb 2021', '3 yrs', 'Lima, Perú')],
    education: [ed('Técnico', 'Administración de Negocios', 'Instituto Cibertec', '2015 - 2017')],
    profile: 'Customer Service Representative',
    match: { score: 36, reason: 'Long in-store retail service, but no remote phone, chat or email support, no US customers, and English below the B2 this search asks for.',
      criteria: {
        experience: { score: 38, reason: '7 years of face-to-face service in retail. No phone, chat or email support, no ticketing and no inbound queue.' },
        seniority:  { score: 55, reason: 'Store manager with a team of eight — above an agent seat, in a different track.' },
        skills:     { score: 22, reason: 'None of Zendesk, Gorgias or Salesforce Service Cloud.' },
        languages:  { score: 35, reason: 'English at limited working proficiency, below the B2 required.' },
        education:  EDU_NA,
        us:         { score: 15, reason: 'No US customers or companies in his history.' } } } },

  { id: 215, first: 'Isabella', last: 'Vargas', ...where('Barranquilla', 'Colombia', 'Atlántico'), verified: true, otw: true, emailKnown: true,
    email: 'isabella.vargas.m@gmail.com',
    headline: 'Representante bilingüe de servicio al cliente | Fintech | Inbound',
    about: 'Representante bilingüe en una cuenta fintech de Estados Unidos: llamadas y chat inbound sobre pagos, disputas de facturación y verificación de identidad. Antes, asesora de servicio en telecomunicaciones.',
    languages: [lg('Español', NATIVE), lg('Inglés', FULL)],
    topSkills: ['Salesforce Service Cloud', 'Billing disputes', 'Inbound calls'],
    skills: ['Salesforce Service Cloud', 'Billing disputes', 'Inbound calls', 'Live chat', 'KYC', 'De-escalation'],
    experience: [xp('Bilingual Customer Service Representative — US fintech', 'iQor', 'Feb 2024', 'Present', '1 yr 8 mos', 'Barranquilla, Colombia'),
                 xp('Asesora de servicio', 'Claro', 'Apr 2023', 'Jan 2024', '10 mos', 'Barranquilla, Colombia')],
    education: [ed('Tecnólogo', 'Gestión Empresarial', 'SENA', '2020 - 2022')],
    profile: 'Customer Service Representative',
    match: { score: 77, reason: 'Inbound support for a US fintech in Salesforce Service Cloud, strong on billing disputes; she reaches the 2 years only by counting her Spanish-language telecom role.',
      criteria: {
        experience: { score: 70, reason: '2 years 6 months of inbound support, 20 months of it for US customers. Billing questions match; no e-commerce orders or refunds.' },
        seniority:  { score: 78, reason: 'Agent level; fits the seat.' },
        skills:     { score: 82, reason: 'Salesforce Service Cloud daily, one of the three tools named; billing disputes and de-escalation are core to her role.' },
        languages:  { score: 88, reason: 'English at full professional proficiency, above B2.' },
        education:  EDU_NA,
        us:         { score: 76, reason: '20 months on a US fintech account, under US regulation and hours.' } } } },

  { id: 216, first: 'Diana', last: 'Salazar', ...where('Medellín', 'Colombia', 'Antioquia'), verified: true, otw: true, emailKnown: false, email: null,
    headline: 'Jefe Desarrollo Humano y Organizacional',
    about: 'Gestión humana: clima organizacional, formación y planes de carrera.',
    languages: [lg('Español', NATIVE), lg('Inglés', WORK)], topSkills: [], skills: ['Gestión humana', 'Clima organizacional', 'Formación'],
    experience: [xp('Jefe de Desarrollo Humano y Organizacional', 'Comfama', 'Jun 2019', 'Present', '6 yrs 4 mos', 'Medellín, Colombia')],
    education: [ed('Profesional', 'Psicología', 'Universidad CES', '2009 - 2014')],
    profile: 'Customer Service Representative', match: { off: true, reason: 'Human resources management (organizational development and training); not customer support.' } },

  { id: 217, first: 'Mateo', last: 'Cifuentes', ...where('Bogotá', 'Colombia', 'Bogotá D.C.'), verified: false, otw: true, emailKnown: true,
    email: 'mateo.cifuentes@proton.me',
    headline: 'Quality Assurance Specialist at Remotasks',
    about: 'QA specialist reviewing AI training data. Previously a customer service agent for a US telecom account.',
    languages: [lg('Español', NATIVE), lg('Inglés', FULL)],
    topSkills: ['Quality assurance'], skills: ['Quality assurance', 'Data annotation', 'Inbound calls', 'Customer Service'],
    experience: [xp('Quality Assurance Specialist', 'Remotasks', 'Feb 2024', 'Present', '1 yr 8 mos', 'Remote', 'Contract'),
                 xp('Customer Service Agent — US telecom', 'Teleperformance', 'May 2023', 'Oct 2023', '6 mos', 'Bogotá, Colombia')],
    education: [ed('Estudiante', 'Ingeniería Industrial', 'Universidad Distrital', '2021 - Present')],
    profile: 'Customer Service Representative',
    match: { score: 44, reason: 'Six months of inbound support for a US telecom and strong English, but well short of the 2 years and currently doing data annotation.',
      criteria: {
        experience: { score: 28, reason: '6 months of inbound phone support, then data annotation. Far from the 2 years asked.' },
        seniority:  { score: 60, reason: 'Entry level; would start as a junior agent.' },
        skills:     { score: 30, reason: 'No ticketing tools listed; his QA work is on annotation platforms.' },
        languages:  { score: 90, reason: 'English at full professional proficiency.' },
        education:  EDU_NA,
        us:         { score: 58, reason: 'Six months with US customers; his current work is for a US company but not customer-facing.' } } } },

  { id: 218, first: 'Esteban', last: 'Rueda', ...where('Lima', 'Peru', 'Lima'), verified: true, otw: true, emailKnown: true,
    email: 'esteban.rueda.q@gmail.com',
    headline: 'Process Quality Engineer | KPIs, scrap, 8D and customer PPAP',
    about: 'Process quality engineer in automotive manufacturing. Root-cause analysis, supplier audits and customer quality claims.',
    languages: [lg('Español', NATIVE), lg('Inglés', FULL)], topSkills: ['8D'], skills: ['8D', 'PPAP', 'Root cause analysis', 'Supplier audits'],
    experience: [xp('Process Quality Engineer', 'Tecnomotor', 'Jan 2022', 'Present', '3 yrs 9 mos', 'Lima, Perú'),
                 xp('Servicio de atención al cliente (calidad B2B)', 'Tecnomotor', 'Mar 2020', 'Dec 2021', '1 yr 10 mos', 'Lima, Perú')],
    education: [ed('Bachiller', 'Ingeniería Mecánica', 'PUCP', '2013 - 2019')],
    profile: 'Customer Service Representative',
    match: { off: true, reason: 'Process quality engineer in automotive manufacturing. His "customer service" position handled supplier quality claims from carmakers (B2B), not consumer support.' } },

  { id: 219, first: 'Lucía', last: 'Fernández', ...where('Medellín', 'Colombia', 'Antioquia'), verified: true, otw: true, emailKnown: true,
    email: 'lucia.fernandez.cs@gmail.com',
    headline: 'Business Lead of Customer Support @ Bia | ex-Rappi',
    about: 'Lidero el área de soporte al cliente de una startup de energía: procesos, KPIs, herramientas y un equipo de 12 personas. Antes fui Customer Service Lead en Rappi y agente bilingüe en una cuenta de viajes de Estados Unidos.',
    languages: [lg('Español', NATIVE), lg('Inglés', FULL)],
    topSkills: ['Zendesk', 'Team leadership', 'Process design'],
    skills: ['Zendesk', 'Intercom', 'Team leadership', 'Process design', 'KPIs', 'Customer Support'],
    experience: [xp('Business Lead of Customer Support', 'Bia', 'Mar 2023', 'Present', '2 yrs 7 mos', 'Medellín, Colombia'),
                 xp('Customer Service Lead', 'Rappi', 'Jan 2021', 'Feb 2023', '2 yrs 2 mos', 'Medellín, Colombia'),
                 xp('Bilingual Customer Service Agent — US travel', 'Webhelp', 'Feb 2019', 'Dec 2020', '1 yr 11 mos', 'Medellín, Colombia')],
    education: [ed('Profesional', 'Ingeniería Administrativa', 'Universidad Nacional de Colombia', '2013 - 2018')],
    profile: 'Customer Service Representative',
    match: { score: 58, reason: 'Deep support background on Zendesk, but she has led support teams since 2021; the agent seat would be a clear step down.',
      criteria: {
        experience: { score: 80, reason: '6+ years in customer support, two of them as an agent for a US travel company. The service knowledge is there.' },
        seniority:  { score: 30, reason: 'Head of a 12-person support area. An agent seat is two levels below where she is.' },
        skills:     { score: 75, reason: 'Zendesk and Intercom; strong on process and metrics.' },
        languages:  { score: 88, reason: 'English at full professional proficiency.' },
        education:  EDU_NA,
        us:         { score: 52, reason: 'US customers only in her first role, which ended in 2020.' } } } },

  { id: 220, first: 'Pedro', last: 'Quintero', ...where('Barranquilla', 'Colombia', 'Atlántico'), verified: false, otw: true, emailKnown: false, email: null,
    headline: 'Food and Beverage Administrator',
    about: 'Administración de alimentos y bebidas en hoteles y restaurantes.',
    languages: [lg('Español', NATIVE)], topSkills: [], skills: ['Alimentos y bebidas', 'Costos', 'Inventarios'],
    experience: [xp('Administrador de A&B', 'Hotel Caribe Plaza', 'Jul 2021', 'Present', '4 yrs 3 mos', 'Barranquilla, Colombia'),
                 xp('Representante de ventas', 'Postobón', 'Jan 2018', 'Jun 2021', '3 yrs 6 mos', 'Barranquilla, Colombia')],
    education: [ed('Técnico', 'Gastronomía', 'SENA', '2015 - 2017')],
    profile: 'Customer Service Representative', match: { off: true, reason: 'Food and beverage administration and field sales; no phone, chat or email support.' } },
];


/* ----------------- Utilidades compartidas ----------------- */
let DRAWER_ID = null;
const ALL_CANDS = () => CANDIDATES.concat(AI_POOL);
const candById = id => ALL_CANDS().find(c => c.id === +id);
function hasEmailFor(id) {
  const c = candById(id);
  if (c && c.emailKnown !== undefined) return c.emailKnown;
  return !!EMAIL_RESOLUTION[id];
}

/* ----------------- Notas (hilo con autor y fecha) ----------------- */
function renderNotes() {
  const wrap = document.getElementById('notesThread');
  if (!wrap || DRAWER_ID == null) return;
  const notes = candState(DRAWER_ID).notes;
  wrap.innerHTML = notes.length
    ? notes.map(n => `<div class="note-item">
          <div class="note-meta"><span class="note-author">${n.by}</span><span class="note-date">${shortDate(n.at)}</span></div>
          <p class="note-text">${n.text}</p>
        </div>`).join('')
    : '<p class="note-empty">No notes yet. Add the first one so the team knows what you found.</p>';
}
function addNote() {
  const ta = document.getElementById('noteInput');
  const text = (ta?.value || '').trim();
  if (!text || DRAWER_ID == null) return;
  const me = getCurrentUser();
  candState(DRAWER_ID).notes.push({ by: me ? me.name : 'Unknown', at: new Date(), text });
  ta.value = '';
  renderNotes();
  refreshRowState(DRAWER_ID);
  showToast('Note added', 'success');
}

/* ----------------- Exportación con trazabilidad ----------------- */
function openExport() {
  if (!LAST_MATCHES.length) { showToast('Nothing to export with the current filters', 'info'); return; }
  const n = LAST_MATCHES.length;
  const already = LAST_MATCHES.filter(tr => tr.dataset.exp !== 'none').length;
  openConfirmPopup({
    title: 'Export candidates',
    message: already
      ? `We'll export the candidates matching your current filters. <b>${already}</b> of them ${already === 1 ? 'was' : 'were'} already exported by someone on the team.`
      : "We'll export the candidates matching your current filters. None of them has been exported before.",
    highlight: `${n} candidate${n === 1 ? '' : 's'} · CSV`,
    icon: 'download',
    confirmLabel: 'Export CSV',
    onConfirm: () => confirmExport(LAST_MATCHES.map(tr => +tr.dataset.id))
  });
}
function confirmExport(ids) {
  const me = getCurrentUser();
  const now = new Date();
  ids.forEach(id => {
    const st = candState(id);
    /* La marca se escribe una vez compuesto el archivo: último actor, momento y conteo. */
    st.exp = { by: me ? me.name : 'Unknown', at: now, times: (st.exp?.times || 0) + 1 };
    refreshRowState(id);
  });
  applyFilters();
  if (DRAWER_ID != null) { const c = candById(DRAWER_ID); if (c) fillDrawer(c); }
  showToast(`${ids.length} candidate${ids.length === 1 ? '' : 's'} exported · marked with your name`, 'success');
}

/* ========================================================================
   AI Search — cuadro de diálogo
   ======================================================================== */
const AI_FORM = { cities: new Set(['Bogotá', 'Medellín', 'Barranquilla', 'Lima']), pages: 2 };

function openAiSearch() {
  renderAiCities();
  const langSel = document.getElementById('aiLang');
  if (langSel && langSel.options.length <= 1) {
    langSel.innerHTML = '<option value="">Any language</option>' +
      REQUIRED_LANGS.map(l => `<option>${l}</option>`).join('');
  }
  /* La búsqueda arranca por la vertical; el perfil de cada candidato lo asigna la IA al normalizarlo. */
  const vert = document.getElementById('aiVertical');
  if (vert && !vert.options.length) {
    vert.innerHTML = VERTICALS.map(v => `<option>${v}</option>`).join('');
    vert.value = 'CSR';
    if (langSel) langSel.value = 'English';
  }
  updateAiEstimate();
  openModal('aiModal');
}

function renderAiCities() {
  const wrap = document.getElementById('aiCities');
  if (!wrap) return;
  const elegidas = [...AI_FORM.cities];
  wrap.innerHTML = elegidas.length
    ? elegidas.map(city => {
        const c = ALL_CITIES.find(x => x.city === city);
        const fuera = c && !ACTIVE_CITIES.some(a => a.city === city);
        return `<span class="city-chip on" data-city="${city}">${city}<span class="city-country">${c ? c.country : ''}</span>` +
               `${fuera ? '<span class="city-off" title="Not covered by the scheduled search">off-schedule</span>' : ''}` +
               `<button type="button" class="city-chip-x" data-remove="${city}" aria-label="Remove ${city}">&times;</button></span>`;
      }).join('')
    : '<p class="tl-empty">No cities yet. Add at least one to run the search.</p>';
  wrap.onclick = e => {
    const x = e.target.closest('[data-remove]'); if (!x) return;
    AI_FORM.cities.delete(x.dataset.remove);
    renderAiCities(); updateAiEstimate();
  };
}

/* Comparación tolerante a acentos y mayúsculas, para los buscadores. */
const norm = t => String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/* Buscador de ciudades: el catálogo crece, así que se agrega escribiendo
   en vez de recorrer una grilla. */
function initAiCityPicker() {
  const input = document.getElementById('aiCityInput');
  const sug = document.getElementById('aiCitySuggest');
  if (!input || !sug) return;
  function render() {
    const q = norm(input.value.trim());
    if (!q) { sug.innerHTML = ''; sug.classList.remove('open'); return; }
    const hits = ALL_CITIES
      .filter(c => !AI_FORM.cities.has(c.city))
      .filter(c => norm(c.city).includes(q) || norm(c.country).includes(q))
      .slice(0, 8);
    sug.innerHTML = hits.length
      ? hits.map(c => {
          const activa = ACTIVE_CITIES.some(a => a.city === c.city);
          return `<button type="button" class="city-suggest-item" data-city="${c.city}">${c.city}` +
                 `<span class="city-country">${c.country}</span>` +
                 `${activa ? '<span class="city-on">on schedule</span>' : ''}</button>`;
        }).join('')
      : '<div class="city-suggest-empty">No city matches that</div>';
    sug.classList.add('open');
  }
  input.addEventListener('input', render);
  input.addEventListener('focus', render);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); sug.querySelector('.city-suggest-item')?.click(); }
    if (e.key === 'Escape') { sug.classList.remove('open'); }
  });
  sug.addEventListener('mousedown', e => {
    const b = e.target.closest('.city-suggest-item'); if (!b) return;
    e.preventDefault();
    AI_FORM.cities.add(b.dataset.city);
    input.value = ''; sug.innerHTML = ''; sug.classList.remove('open');
    renderAiCities(); updateAiEstimate();
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.city-picker')) sug.classList.remove('open');
  });
}


function updateAiEstimate() {
  const pages = +(document.getElementById('aiPages')?.value || AI_FORM.pages);
  AI_FORM.pages = pages;
  const cities = AI_FORM.cities.size;
  const est = estimate(pages, cities);

  const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  set('aiMath', cities
    ? `<b>${pages}</b> page${pages === 1 ? '' : 's'} × <b>${cities}</b> cit${cities === 1 ? 'y' : 'ies'} = <b>${est.totalPages}</b> pages`
    : 'Pick at least one city');
  set('aiCands', cities ? `up to <b>${est.maxCands}</b> candidates` : '—');

  /* El presupuesto se sigue validando, pero quien busca solo ve si puede lanzar, sin montos. */
  const exhausted = budgetLeft() <= 0;
  const over = exhausted || (cities && est.total > budgetLeft());
  const btn = document.getElementById('aiSubmit');
  const warn = document.getElementById('aiBudgetWarn');
  if (btn) btn.disabled = !cities || over;
  if (warn) {
    warn.style.display = over ? 'flex' : 'none';
    warn.innerHTML = !over ? ''
      : exhausted ? "AI Search reached its limit for this period. Ask an administrator."
      : "This search exceeds what's left in the period. Reduce pages or cities.";
  }
}

function submitAiSearch() {
  const desc = (document.getElementById('aiDesc')?.value || '').trim();
  if (!desc) { showToast('Describe the profile you need', 'info'); return; }
  if (!AI_FORM.cities.size) { showToast('Pick at least one city', 'info'); return; }
  closeModal('aiModal');
  openConfirmPopup({
    title: 'Start AI search',
    message: `We'll search LinkedIn live across <b>${AI_FORM.cities.size}</b> cit${AI_FORM.cities.size === 1 ? 'y' : 'ies'}, up to <b>${AI_FORM.pages}</b> page${AI_FORM.pages === 1 ? '' : 's'} each. Candidates will appear in the table as we find them.`,
    icon: 'sparkle',
    confirmLabel: 'Search now',
    onConfirm: () => runAiSearch(desc, document.getElementById('aiLang')?.value || '')
  });
}

/* ----------------- AI Search — ejecución ----------------- */
/* Orden de cada candidato que llega: filtro de pertinencia por palabras clave →
   análisis de afinidad con IA (solo los que pasan). Los descartados quedan en el
   pool pero fuera del listado. */
let AI_RUN = null;

/* Etiqueta de la búsqueda: la arma la IA con el rol y la expertise pedida, más útil que el perfil del catálogo. */
function runLabel(desc, langHint) {
  if (norm(desc).includes('bilingual customer service representative')) return AI_DEMO.label;
  const t = desc.toLowerCase();
  const role = matchLex(t, LEX.roles)[0] || keyTerms(desc)[0];
  const exp = [...matchLex(t, LEX.skills), ...matchLex(t, LEX.industries)].slice(0, 2);
  const lang = langHint || matchLex(t, LEX.languages)[0];
  return [role, exp.join(', '), lang].filter(Boolean).join(' · ');
}

function runAiSearch(desc, langHint) {
  const tbody = document.getElementById('candRows'); if (!tbody) return;
  const cities = AI_FORM.cities.size;
  const pageBudget = AI_FORM.pages * cities;
  AI_RUN = { at: new Date(), label: runLabel(desc, langHint), vertical: document.getElementById('aiVertical')?.value || 'CSR',
             by: (getCurrentUser() || {}).name || 'You', description: desc, cities: [...AI_FORM.cities], pages: AI_FORM.pages,
             language: langHint || 'Any language', found: 0, off: 0, aiOff: 0, analyzed: 0, pending: 0 };

  SELECTED.clear(); updateBulk();
  document.getElementById('emptyState').style.display = 'none';
  const card = document.getElementById('resultsCard');
  card.style.display = 'block';
  card.classList.add('is-ai');
  document.getElementById('thMatch')?.classList.remove('sorted');
  tbody.innerHTML = '';
  AI_POOL.forEach(c => { c.analyzing = true; c.detectedAt = AI_RUN.at; });
  enterAiMode();
  bindRowSelection(tbody);

  AI_RUN.running = true;
  const progress = () => showAiProgress('running', AI_RUN.found, AI_RUN.pending);

  /* La ampliación consume el mismo presupuesto de páginas, no uno adicional. */
  const l1Pages = Math.max(1, Math.min(pageBudget, Math.round(pageBudget * 0.55)));
  const l2Pages = pageBudget - l1Pages;
  const spent = { pages: 0, profiles: 0, emails: 0 };
  const scrapedFor = p => Math.round(p * COST_MODEL.profilesPerPage * COST_MODEL.uniqueRate);
  /* Pertinentes: lo que pasó el filtro y la IA no marcó fuera de foco. */
  const onTarget = () => AI_RUN.found - AI_POOL.filter(c => c.match && c.match.off && document.querySelector(`#candRows tr[data-id="${c.id}"]`)).length;

  function analyze(c, tr) {
    AI_RUN.pending++;
    setTimeout(() => {
      c.analyzing = false;
      c.match.run = AI_RUN;
      const np = normalizeProfile(c);
      if (!c.match.off && !np.verticals.includes(AI_RUN.vertical)) np.verticals.push(AI_RUN.vertical);
      tr.dataset.vertical = JSON.stringify(np.verticals);
      tr.dataset.score = c.match.off ? -1 : c.match.score;
      if (c.match.off) { tr.dataset.off = '1'; tr.classList.add('is-off'); AI_RUN.aiOff++; applyFilters(); }
      tr.querySelector('[data-cell="match"]').innerHTML = matchCell(c);
      AI_RUN.analyzed++; AI_RUN.pending--;
      if (AI_RUN.running) progress();
      if (DRAWER_ID === c.id) fillDrawerMatch(c);
    }, 900 + Math.random() * 900);
  }

  function deliver(list, from, done) {
    list.forEach((c, i) => {
      setTimeout(() => {
        AI_RUN.found++;
        AI_DELIVERED.add(c.id);
        if (c.emailKnown) spent.emails++;
        const tr = buildCandRow(c);
        tbody.appendChild(tr);
        analyze(c, tr);
        progress();
        applyFilters();
        if (i === list.length - 1) done();
      }, from + i * 260);
    });
  }

  progress();
  spent.pages += l1Pages; spent.profiles += scrapedFor(l1Pages);

  const first = AI_POOL.slice(0, AI_DEMO.firstBatch);
  deliver(first, 700, () => {
    /* El mínimo para ampliar cuenta solo lo que pasó el filtro: el ruido no es resultado. */
    if (onTarget() >= BROADEN_MIN || l2Pages < 1) return waitAnalysis();
    spent.pages += l2Pages; spent.profiles += scrapedFor(l2Pages);
    setTimeout(() => deliver(AI_POOL.slice(AI_DEMO.firstBatch), 0, waitAnalysis), 900);
  });

  function waitAnalysis() {
    if (AI_RUN.pending > 0) return setTimeout(waitAnalysis, 300);
    finish();
  }

  function finish() {
    AI_RUN.running = false;
    const aiCost = AI_RUN.analyzed * aiMatchPerCandidate();
    const real = spent.pages * COST_MODEL.rateSearchPage + spent.profiles * COST_MODEL.rateProfile + spent.emails * COST_MODEL.rateEmail + aiCost;
    BUDGET.spent += real;
    saveBudget();
    sortByMatch();
    const status = !onTarget() ? 'empty'
      : (spent.pages < pageBudget && onTarget() < BROADEN_MIN ? 'partial' : 'done');
    showAiProgress(status, AI_RUN.found);
  }
}

/* Orden por afinidad: los descartados van al final. */
function sortByMatch() {
  SEARCH.sort = 'match';
  renderSortOptions();
  document.getElementById('thMatch')?.classList.add('sorted');
  candPage = 0; applyFilters();
}
function initMatchSort() { document.getElementById('thMatch')?.addEventListener('click', sortByMatch); }


/* ========================================================================
   Proyección de costo mensual del pipeline programado.

   Fuentes de precio (agosto 2026):
   · Búsqueda  — harvestapi/linkedin-profile-search, modo Full:
                 $0.10 por página abierta + $0.004 por perfil.
   · Email     — harvestapi/linkedin-profile-scraper, "Profile details +
                 email search": $10 por 1.000 perfiles. Se toma el máximo:
                 la fuente no cobra el intento cuando el perfil no da datos,
                 así que el real entra por debajo.
   · Scraping de enriquecimiento — Bright Data, dataset LinkedIn people
                 profiles: $1.50 por 1.000 registros (pay-as-you-go).
   · IA        — gpt-5-mini: $0.25 por 1M de entrada, $2.00 por 1M de salida.
                 Los tokens por candidato salen del prompt real del agente
                 (instrucción + perfil completo pretty-printed → salida JSON).

   Se calcula con valores máximos: páginas llenas de 25 perfiles y email
   siempre cobrado. La búsqueda se paga en bruto sobre todo lo que devuelve
   la fuente; el email corre sobre los candidatos únicos que quedan
   persistidos en la base, y el enriquecimiento y la IA sobre los que de
   esos resultan disponibles.
   ======================================================================== */
const COST_MODEL = {
  profilesPerPage: 25,     // máximo que entrega una página de la fuente
  pagesPerCombo: 1,        // hoy fijo en el pipeline; no es parámetro todavía
  otwYield: 0.28,          // rendimiento open-to-work observado (7 de 25)
  uniqueRate: 0.50,        // candidatos netos nuevos que una ejecución suma al pool
  rateSearchPage: 0.10,
  rateProfile: 0.004,
  rateEmail: 0.010,
  rateBrightData: 0.0015,
  aiInTokens: 5000,        // instrucción + perfil completo del agente
  aiOutTokens: 350,
  aiInPer1M: 0.25,
  aiOutPer1M: 2.00,
};
/* Espejo del catálogo de perfiles de búsqueda (perfiles.html): 11 de 14 activos. */
const ACTIVE_PROFILES = 11;
const DAYS_PER_MONTH = 30.44;

function projectCost(o) {
  const m = { ...COST_MODEL, ...o };
  const combos = m.profiles * m.cities;
  const pages = combos * m.pagesPerCombo;
  const scraped = pages * m.profilesPerPage;
  const persisted = scraped * m.uniqueRate;
  const otw = persisted * m.otwYield;

  const search = pages * (m.rateSearchPage + m.profilesPerPage * m.rateProfile);
  const email = persisted * m.rateEmail;
  const brightData = otw * m.rateBrightData;
  const ai = otw * (m.aiInTokens * m.aiInPer1M / 1e6 + m.aiOutTokens * m.aiOutPer1M / 1e6);

  const perRun = search + email + brightData + ai;
  const runsPerMonth = DAYS_PER_MONTH / m.frequencyDays;
  return {
    combos, pages, scraped,
    persisted: Math.round(persisted), otw: Math.round(otw),
    runsPerMonth,
    lines: [
      { key: 'search',     label: 'Candidate search',   vendor: 'Apify',       run: search },
      { key: 'email',      label: 'Email capture',      vendor: 'Apify',       run: email },
      { key: 'brightdata', label: 'Profile enrichment', vendor: 'Bright Data', run: brightData },
      { key: 'ai',         label: 'AI analysis',        vendor: 'gpt-5-mini',  run: ai },
    ],
    perRun,
    perMonth: perRun * runsPerMonth,
    aiTokensPerMonth: otw * (m.aiInTokens + m.aiOutTokens) * runsPerMonth,
  };
}


/* ========================================================================
   AI match — afinidad de cada candidato con la descripción de su búsqueda.
   El análisis pertenece a la búsqueda: lleva la etiqueta que la IA arma para
   ella (rol + expertise pedida) y el momento en que se hizo.
   ======================================================================== */
const MATCH_CRITERIA = [
  { key: 'experience', label: 'Experience',
    icon: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>' },
  { key: 'seniority', label: 'Seniority',
    icon: '<path d="M5 21v-6"/><path d="M12 21V9"/><path d="M19 21V3"/>' },
  { key: 'skills', label: 'Skills',
    icon: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>' },
  { key: 'languages', label: 'Languages',
    icon: '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>' },
  { key: 'education', label: 'Education',
    icon: '<path d="M21.42 10.92a1 1 0 0 0-.02-1.84L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.83l8.57 3.91a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>' },
  { key: 'us', label: 'US exposure',
    icon: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>' },
];
const MATCH_OVERALL_ICON = '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/>';
const svgIco = (paths, size = 14) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

const MATCH_VERDICT = { strong: 'Strong match', good: 'Good match', partial: 'Partial match', weak: 'Weak match' };
function matchBand(score) {
  if (score == null) return 'na';
  return score >= 80 ? 'strong' : score >= 60 ? 'good' : score >= 40 ? 'partial' : 'weak';
}

function matchRing(score, size = 30) {
  const sw = size >= 48 ? 4.5 : 3;
  const r = (size - sw) / 2, c = 2 * Math.PI * r;
  const off = c * (1 - (score || 0) / 100);
  const fs = size >= 48 ? Math.round(size * 0.3) : Math.round(size * 0.36);
  return `<span class="m-ring m-${matchBand(score)}" style="width:${size}px;height:${size}px">
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle class="m-ring-track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${sw}"/>
      <circle class="m-ring-val" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${sw}"
        stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}"/>
    </svg><b style="font-size:${fs}px">${score == null ? '–' : score}</b></span>`;
}

/* Celda de la tabla. Estados: analizando · fuera de foco (descartado por el filtro) · analizado. */
/* Análisis que muestra la fila: en una AI Search, el de esa búsqueda; en el pool, el más reciente del candidato. */
function rowAnalysis(c) {
  if (SEARCH.ai && c.match && c.match.run === AI_RUN) return c.match;
  return analysesOf(c)[0] || null;
}
function matchCell(c) {
  const inRun = SEARCH.ai && c.match && c.match.run === AI_RUN;
  if (!inRun && !rowAnalysis(c)) return '<span class="match-none" title="No AI search has analyzed this candidate yet">—</span>';
  const m = rowAnalysis(c) || c.match;
  if (m && m.off && !(inRun && c.analyzing)) return `<span class="match-off" tabindex="0" data-mtip="${c.id}:overall">${svgIco(MATCH_OVERALL_ICON, 11)} Off-target</span>`;
  if (!m || (inRun && c.analyzing)) {
    return `<div class="match-cell match-pending" title="Analyzing…">${matchRing(null, 30)}<div class="match-icons">${
      MATCH_CRITERIA.map(k => `<span class="m-ico">${svgIco(k.icon, 13)}</span>`).join('')}</div></div>`;
  }
  return `<div class="match-cell">
    <span tabindex="0" data-mtip="${c.id}:overall">${matchRing(m.score, 30)}</span>
    <div class="match-icons">${MATCH_CRITERIA.map(k => {
      const cr = m.criteria[k.key];
      const band = cr.na ? 'na' : matchBand(cr.score);
      return `<span class="m-ico m-${band}" tabindex="0" data-mtip="${c.id}:${k.key}" aria-label="${k.label}: ${cr.na ? 'not required' : cr.score + '%'}">${svgIco(k.icon, 13)}</span>`;
    }).join('')}</div></div>`;
}

const fmtRunDate = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' +
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const runSource = run => `AI Search · <b>${run.label}</b> · ${fmtRunDate(run.at)}${run.by ? ` · ${run.by}` : ''}`;

/* Tarjeta flotante: una sola en el documento, alimentada por data-mtip="<id>:<criterio>". */
function initMatchTip() {
  if (document.getElementById('matchTip')) return;
  const tip = document.createElement('div');
  tip.id = 'matchTip'; tip.className = 'match-tip'; tip.setAttribute('role', 'tooltip');
  document.body.appendChild(tip);

  let current = null;
  function show(el) {
    current = el;
    const [id, key] = el.dataset.mtip.split(':');
    const c = candById(id); if (!c) return;
    /* En el detalle, la tarjeta es del análisis que muestra el bloque (puede ser de otra búsqueda). */
    const m = el.closest('#drawerMatch') ? (c.shown || c.match) : (rowAnalysis(c) || c.match);
    if (key === 'filter') {
      tip.className = 'match-tip m-na';
      tip.innerHTML = `
        <div class="match-tip-kicker">Relevance filter</div>
        <div class="match-tip-name">Set aside before the AI analysis</div>
        <p class="match-tip-reason">${c.offReason}</p>
        ${AI_RUN ? `<div class="match-tip-foot">${runSource(AI_RUN)}</div>` : ''}`;
    } else if (!m) { return;
    } else if (key === 'overall' && m.off) {
      tip.className = 'match-tip m-na';
      tip.innerHTML = `
        <div class="match-tip-kicker">${svgIco(MATCH_OVERALL_ICON, 12)} AI match</div>
        <div class="match-tip-name">Off-target — a different function</div>
        <p class="match-tip-reason">${m.reason}</p>
        ${m.run ? `<div class="match-tip-foot">${runSource(m.run)}</div>` : ''}`;
    } else if (key === 'overall') {
      const band = matchBand(m.score);
      tip.className = `match-tip m-${band}`;
      tip.innerHTML = `
        <div class="match-tip-head">
          <div class="match-tip-title">
            <div class="match-tip-kicker">${svgIco(MATCH_OVERALL_ICON, 12)} AI match</div>
            <div class="match-tip-name">${MATCH_VERDICT[band]}</div>
          </div>${matchRing(m.score, 46)}
        </div>
        <p class="match-tip-reason">${m.reason}</p>
        ${m.run ? `<div class="match-tip-foot">${runSource(m.run)}</div>` : ''}`;
    } else {
      const k = MATCH_CRITERIA.find(x => x.key === key);
      const cr = m.criteria[key];
      const band = cr.na ? 'na' : matchBand(cr.score);
      tip.className = `match-tip m-${band}`;
      tip.innerHTML = `
        <div class="match-tip-head">
          <div class="match-tip-title">
            <div class="match-tip-kicker">${svgIco(k.icon, 12)} ${k.label}</div>
            <div class="match-tip-verdict">${cr.na ? 'Not required by this search' : MATCH_VERDICT[band]}</div>
          </div>${cr.na ? matchRing(null, 46).replace('m-na', 'm-na') : matchRing(cr.score, 46)}
        </div>
        <p class="match-tip-reason">${cr.reason}</p>`;
    }
    tip.style.left = '0px'; tip.style.top = '0px';
    tip.classList.add('show');
    place(el);
  }
  function place(el) {
    const r = el.getBoundingClientRect();
    const tw = tip.offsetWidth, th = tip.offsetHeight, pad = 10;
    let left = r.left + r.width / 2 - tw / 2;
    left = Math.max(pad, Math.min(left, window.innerWidth - tw - pad));
    let top = r.bottom + 8;
    if (top + th > window.innerHeight - pad) top = r.top - th - 8;
    tip.style.left = left + 'px'; tip.style.top = Math.max(pad, top) + 'px';
  }
  const hide = () => { tip.classList.remove('show'); current = null; };
  document.addEventListener('mouseover', e => { const el = e.target.closest('[data-mtip]'); if (el) show(el); });
  document.addEventListener('mouseout', e => { const el = e.target.closest('[data-mtip]'); if (el && !el.contains(e.relatedTarget)) hide(); });
  document.addEventListener('focusin', e => { const el = e.target.closest('[data-mtip]'); if (el) show(el); });
  document.addEventListener('focusout', e => { if (e.target.closest('[data-mtip]')) hide(); });
  /* Al desplazar, la tarjeta acompaña al icono en lugar de desaparecer. */
  document.addEventListener('scroll', () => { if (current && tip.classList.contains('show')) place(current); }, true);
}

/* Bloque del detalle, encima de las pestañas. */
/* Análisis del candidato: el de cada búsqueda que lo trajo, del más reciente al más antiguo. */
function analysesOf(c) {
  const list = (ANALYSIS_HISTORY[c.id] || []).slice();
  if (c.match && c.match.run && !c.analyzing) list.push(c.match);
  return list.sort((a, b) => b.run.at - a.run.at);
}
function fillDrawerMatch(c) {
  const box = document.getElementById('drawerMatch'); if (!box) return;
  const all = analysesOf(c);
  /* El bloque muestra el de la búsqueda en pantalla; desde el pool, el más reciente. */
  const m = (SEARCH.ai && c.match && c.match.run === AI_RUN && !c.analyzing) ? c.match : all[0];
  c.shown = m;
  if (m && m.off && !c.analyzing) {
    box.hidden = false; box.className = 'drawer-match m-na';
    box.innerHTML = `
      <div class="drawer-match-head">
        ${matchRing(null, 54)}
        <div class="drawer-match-sum">
          <div class="drawer-match-verdict">${svgIco(MATCH_OVERALL_ICON, 13)} Off-target — a different function</div>
          <div class="drawer-match-reason">${m.reason}</div>
          ${m.run ? `<div class="drawer-match-src">${runSource(m.run)}</div>` : ''}
        </div>
      </div>`;
    return;
  }
  if (!m || c.analyzing) { box.hidden = true; box.innerHTML = ''; return; }
  const band = matchBand(m.score);
  box.hidden = false;
  box.className = `drawer-match m-${band}`;
  box.innerHTML = `
    <div class="drawer-match-head">
      <span tabindex="0" data-mtip="${c.id}:overall">${matchRing(m.score, 54)}</span>
      <div class="drawer-match-sum">
        <div class="drawer-match-verdict">${svgIco(MATCH_OVERALL_ICON, 13)} ${MATCH_VERDICT[band]}</div>
        <div class="drawer-match-reason">${m.reason}</div>
        ${m.run ? `<div class="drawer-match-src">${runSource(m.run)}</div>` : ''}
      </div>
    </div>
    <div class="drawer-match-grid">${MATCH_CRITERIA.map(k => {
      const cr = m.criteria[k.key];
      const b = cr.na ? 'na' : matchBand(cr.score);
      return `<div class="m-tile m-${b}" tabindex="0" data-mtip="${c.id}:${k.key}">${svgIco(k.icon, 16)}<b>${cr.na ? 'N/A' : cr.score}</b><span>${k.label}</span></div>`;
    }).join('')}</div>`;
}


/* Copiado de rbac.js de Solvo Platform UI — Release 3, sin cambios. */
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



/* ----------------- Progreso de la AI Search (barra fija en el footer) ----------------- */
const ICO_DONE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>';
const ICO_WARN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>';
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
function showAiProgress(state, found, analyzing = 0) {
  const el = document.getElementById('aiProgress'); if (!el || !AI_RUN) return;
  const set = (sel, html) => { el.querySelector(sel).innerHTML = html; };
  const S = {
    running: { cls: 'is-running', ico: '<span class="spinner"></span>',
               txt: `Searching candidates · <b>${found}</b> so far${analyzing ? ` · analyzing ${analyzing}` : ''}` },
    done:    { cls: 'is-done', ico: ICO_DONE, txt: `Search complete · <b>${plural(found, 'candidate')}</b>, sorted by AI match` },
    partial: { cls: 'is-warn', ico: ICO_WARN, txt: `Partial result · <b>${plural(found, 'candidate')}</b> — LinkedIn limited the search before it finished` },
    empty:   { cls: 'is-warn', ico: ICO_WARN, txt: 'No candidates matched · try a broader description or more cities' },
    error:   { cls: 'is-error', ico: ICO_WARN, txt: 'The search could not run' },
  }[state];
  el.className = `ai-progress ${S.cls}`;
  set('[data-p-ico]', S.ico);
  set('[data-p-status]', S.txt);
  set('[data-p-label]', `AI Search · ${AI_RUN.label}`);
  set('[data-p-action]', state === 'error' ? '<button type="button" class="btn btn-secondary btn-sm" onclick="submitAiSearch()">Retry</button>' : '');
  el.hidden = false;
  document.body.classList.add('has-ai-progress');
}
function hideAiProgress() {
  const el = document.getElementById('aiProgress'); if (el) el.hidden = true;
  document.body.classList.remove('has-ai-progress');
}


/* ========================================================================
   Perfil normalizado del candidato (FSRP-1 lo calcula en el flujo; acá se
   replica para la demo). Lo que sale de la fuente se calcula sin IA: años de
   experiencia, cargo y empresa actual, experiencia remota e idiomas con su
   nivel. Formación y habilidades canónicas las resuelve la IA en el flujo.
   ======================================================================== */
const LANG_CANON = { espanol: 'Spanish', spanish: 'Spanish', ingles: 'English', english: 'English',
  portugues: 'Portuguese', portuguese: 'Portuguese', frances: 'French', french: 'French',
  tagalo: 'Tagalog', tagalog: 'Tagalog', italiano: 'Italian', italian: 'Italian', aleman: 'German', german: 'German' };
const LEVELS = ['elementary', 'limited_working', 'professional_working', 'full_professional', 'native_bilingual'];
const LEVEL_LABEL = { elementary: 'Elementary', limited_working: 'Limited', professional_working: 'Professional',
  full_professional: 'Full professional', native_bilingual: 'Native' };
const LEVEL_FROM_TEXT = { 'elementary proficiency': 'elementary', 'limited working proficiency': 'limited_working',
  'professional working proficiency': 'professional_working', 'full professional proficiency': 'full_professional',
  'native or bilingual proficiency': 'native_bilingual' };
const EDU_LABEL = { secondary: 'Secondary', technical: 'Technical', bachelor: "Bachelor's", postgraduate: 'Postgraduate' };
/* Nombre canónico (inglés) y grupo de cada habilidad conocida; lo demás queda como técnica con su nombre. */
const SKILL_CANON = {
  'atencion al cliente': 'Customer Service', 'servicio al cliente': 'Customer Service', 'customer service': 'Customer Service',
  'liderazgo': 'Leadership', 'gestion de equipos': 'Team Leadership', 'trabajo en equipo': 'Teamwork',
  'comunicacion': 'Communication', 'comunicacion interna': 'Internal Communications', 'ventas': 'Sales',
  'redaccion': 'Writing', 'redaccion juridica': 'Legal Writing', 'litigio': 'Litigation', 'inventarios': 'Inventory Management',
  'negociacion': 'Negotiation', 'compras': 'Procurement', 'prospeccion': 'Prospecting', 'retail': 'Retail',
};
const TOOLS = new Set(['zendesk', 'gorgias', 'salesforce service cloud', 'salesforce', 'shopify', 'hubspot', 'intercom',
  'freshdesk', 'microsoft office', 'excel', 'crm', 'crm ticketing', 'swift', 'swiftui', 'uikit']);
const SOFT = new Set(['de-escalation', 'leadership', 'teamwork', 'communication', 'conflict resolution', 'active listening',
  'negotiation', 'coaching', 'objection handling', 'team leadership']);
const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
const REMOTE_DEMO = new Set([1, 4, 201, 211, 215, 217, 219]);   // cargos marcados Remote por la fuente en la demo

function monthIndex(txt) {
  if (!txt) return null;
  if (/present/i.test(txt)) { const d = new Date(); return d.getFullYear() * 12 + d.getMonth(); }
  const m = String(txt).match(/([A-Za-z]{3})[a-z]*\s+(\d{4})/); if (m) return +m[2] * 12 + (MONTHS[m[1].toLowerCase()] ?? 0);
  const y = String(txt).match(/(\d{4})/); return y ? +y[1] * 12 : null;
}

function normalizeProfile(c) {
  if (c.norm) return c.norm;
  const text = norm(`${c.headline || ''} ${c.about || ''}`);
  /* Idiomas: un elemento por idioma, nombre en inglés, nivel de la fuente o del texto. */
  const langs = new Map();
  const fromText = new Set();
  (c.languages || []).forEach(l => {
    const raw = typeof l === 'string' ? l : (l.name || '');
    const inParen = (raw.match(/\(([^)]+)\)/) || [])[1];
    const name = LANG_CANON[norm(raw.replace(/\(.*\)/, '').trim())] || raw.replace(/\(.*\)/, '').trim();
    const lvl = LEVEL_FROM_TEXT[norm((l && l.proficiency) || inParen || '')] || null;
    const prev = langs.get(name);
    if (!prev || LEVELS.indexOf(lvl) > LEVELS.indexOf(prev)) langs.set(name, lvl);
  });
  const cefr = text.match(/\b(ingles|english)\b[^.]{0,20}\b(b2|c1|c2)\b|\b(b2|c1|c2)\b[^.]{0,12}\b(ingles|english)\b/);
  if (cefr) {
    const lv = { b2: 'professional_working', c1: 'full_professional', c2: 'native_bilingual' }[cefr[2] || cefr[3]];
    if (!langs.has('English')) { langs.set('English', lv); fromText.add('English'); }
    else if (langs.get('English') == null) langs.set('English', lv);
  }
  const languages = [...langs].map(([language, level]) => ({ language, level, source: fromText.has(language) ? 'text' : 'profile' }));
  /* Años de experiencia: meses cubiertos por los cargos, sin solapes y sin prácticas. */
  const months = new Set();
  (c.experience || []).filter(e => !/intern/i.test(e.employmentType || '')).forEach(e => {
    const a = monthIndex(e.startDate), b = monthIndex(e.endDate);
    if (a != null && b != null) for (let m = a; m <= b; m++) months.add(m);
  });
  const years = months.size ? Math.round(months.size / 12 * 10) / 10 : null;
  /* Cargo y empresa actual: el vigente que empezó más recientemente. */
  const current = (c.experience || []).filter(e => /present/i.test(e.endDate || ''))
    .sort((a, b) => (monthIndex(b.startDate) || 0) - (monthIndex(a.startDate) || 0))[0];
  const remote = REMOTE_DEMO.has(c.id) || (c.experience || []).some(e => /remote/i.test(`${e.workplaceType || ''} ${e.location || ''}`));
  /* Formación: el nivel más alto (en el flujo lo resuelve la IA; "Bachiller" es secundaria o universitario según el país). */
  const rank = { secondary: 1, technical: 2, bachelor: 3, postgraduate: 4 };
  let edu = null, field = null;
  (c.education || []).forEach(e => {
    const d = norm(e.degree || '');
    const lv = /doctor|maestr|master|mba|especializ|posgrado/.test(d) ? 'postgraduate'
      : /tecnolog|tecnico|technical|diplomatura/.test(d) ? 'technical'
      : /profesional|licenciatura|bachelor|bachiller|grado|estudiante/.test(d) ? 'bachelor'
      : /secundaria|high school/.test(d) ? 'secondary' : null;
    if (lv && (!edu || rank[lv] > rank[edu])) { edu = lv; field = e.fieldOfStudy || null; }
  });
  /* Habilidades canónicas, sin duplicados entre idiomas y agrupadas. */
  const groups = { tools: new Set(), technical: new Set(), soft: new Set() };
  (c.skills || []).forEach(s => {
    const n = norm(s);
    const canon = SKILL_CANON[n] || s;
    const k = norm(canon);
    (TOOLS.has(k) ? groups.tools : SOFT.has(k) ? groups.soft : groups.technical).add(canon);
  });
  const profile = ASSIGNED_PROFILE[c.id] || c.profile || null;
  /* Ciudad del catálogo: la que corresponde a la ubicación del perfil; si trae solo el país,
     la de su cargo más reciente (en el flujo lo resuelve la IA, que también lee el about). */
  const cityIn = t => { const x = norm(t || ''); return ALL_CITIES.find(k => x.startsWith(norm(k.city))) || ALL_CITIES.find(k => x.includes(norm(k.city))); };
  const byRecency = (c.experience || []).slice().sort((a, b) => (monthIndex(b.startDate) || 0) - (monthIndex(a.startDate) || 0));
  const cat = cityIn(`${(c.locationParts && c.locationParts.city) || ''} | ${c.loc || ''}`)
    || byRecency.map(e => cityIn(e.location)).find(Boolean) || null;
  const roleTxt = norm(`${current ? current.position : ''} ${c.headline || ''}`);
  const seniority = /\b(manager|gerente|jefe|jefa|director|directora|head of|administrador de tienda)\b/.test(roleTxt) ? 'manager'
    : /\b(lead|lider|supervisor|supervisora|team leader|coordinador|coordinadora)\b/.test(roleTxt) ? 'lead'
    : /\b(junior|jr|trainee|intern|practicante|estudiante|student)\b/.test(roleTxt) || (years != null && years < 2) ? 'junior'
    : /\b(senior|sr)\b/.test(roleTxt) || (years != null && years >= 6) ? 'senior'
    : years == null ? null : 'mid';
  c.norm = {
    city: cat ? cat.city : null, country: cat ? cat.country : null,
    seniority,
    languages, years, edu, field, remote, profile, verticals: [...(PRIOR_VERTICALS[c.id] || [])],
    title: current ? current.position : null, company: current ? current.companyName : null,
    skills: { tools: [...groups.tools], technical: [...groups.technical], soft: [...groups.soft] },
  };
  return c.norm;
}
const langLabel = l => `${l.language}${l.level ? ` · ${LEVEL_LABEL[l.level]}` : ''}`;
const yearsLabel = y => y == null ? 'Not stated' : `${y < 1 ? '<1' : Math.floor(y)} year${Math.floor(y) === 1 ? '' : 's'}`;
const yearsBucket = y => y == null ? 'na' : y < 2 ? 'lt2' : y < 5 ? '2to5' : y < 10 ? '5to10' : 'gt10';


/* ----------------- Vertical y perfil asignado (demo) -----------------
   El perfil lo elige la IA entre los del catálogo (o `Otros`) leyendo el rol del
   candidato; la vertical sale del perfil. A un `Otros` la IA solo le pone vertical
   si su rol encaja en una; si no, queda sin vertical. */
const VERTICALS = ['Finance', 'Legal', 'IT', 'HR/Schedulers', 'CSR', 'Sales', 'Administrative', 'Marketing', 'Healthcare'];
const PROFILE_VERTICAL = {
  'Customer Service Representative': 'CSR', 'Sales Representative': 'Sales', 'Sales Development Representative': 'Sales',
  'Sales Specialist': 'Sales', 'Intake Specialist': 'Legal', 'Executive Assistant': 'Administrative',
  'Administrative Assistant': 'Administrative', 'Collections Specialist': 'Finance', 'Scheduler': 'HR/Schedulers',
  'Litigation Assistant': 'Legal', 'Senior Paralegal': 'Legal', 'Legal Assistant': 'Legal', 'Paralegal': 'Legal',
  'Marketing Assistant': 'Marketing', 'Software Developer': 'IT', 'HR Assistant': 'HR/Schedulers',
  'Procurement Specialist': 'Finance', 'CAD Designer': null, 'Content Moderator': null,
};
const CATALOG_PROFILES = Object.keys(PROFILE_VERTICAL).sort();
const ASSIGNED_PROFILE = {
  9: 'Customer Service Representative',
  201: 'Customer Service Representative', 202: 'Sales Representative', 203: 'Customer Service Representative',
  204: 'Otros', 205: 'Customer Service Representative', 206: 'Marketing Assistant', 207: 'Customer Service Representative',
  208: 'Marketing Assistant', 209: 'Software Developer', 210: 'Sales Representative', 211: 'Customer Service Representative',
  212: 'Procurement Specialist', 213: 'Legal Assistant', 214: 'Otros', 215: 'Customer Service Representative',
  216: 'HR Assistant', 217: 'Content Moderator', 218: 'Otros', 219: 'Customer Service Representative', 220: 'Otros',
};
const OTROS_VERTICAL = { 214: 'Sales' };


/* ----------------- Historial de análisis del candidato ----------------- */
function historyBlock(all, shown) {
  const others = all.filter(a => a !== shown);
  if (!others.length) return '';
  return `<div class="m-history"><div class="m-history-title">Analysis history <span>${all.length}</span></div>` +
    all.map(a => {
      const band = a.off ? 'na' : matchBand(a.score);
      return `<div class="m-history-row${a === shown ? ' is-shown' : ''} m-${band}">
        ${a.off ? '<span class="match-off">Off-target</span>' : matchRing(a.score, 26)}
        <div class="m-history-txt"><b>${a.off ? 'Off-target' : MATCH_VERDICT[band]}</b> · ${a.run.label}<br><span>${fmtRunDate(a.run.at)} · ${a.run.by || ''}</span></div>
      </div>`;
    }).join('') + '</div>';
}
/* Vertical de las búsquedas previas que lo encontraron (demo). */
const PRIOR_VERTICALS = { 1: ['CSR'], 2: ['CSR'], 3: ['Legal'], 4: ['CSR'], 5: ['CSR'], 6: ['CSR'], 7: ['CSR'], 8: ['Sales'], 9: ['CSR', 'Finance'], 203: ['CSR'] };
/* Análisis de búsquedas anteriores (demo): el mismo candidato, otra descripción, otro puntaje. */
const crit = (e, s, k, l, ed, u, why) => ({
  experience: { score: e, reason: why[0] }, seniority: { score: s, reason: why[1] }, skills: { score: k, reason: why[2] },
  languages: { score: l, reason: why[3] }, education: ed == null ? { na: true, reason: 'This search does not ask for a degree or a certification.' } : { score: ed, reason: why[4] },
  us: { score: u, reason: why[5] } });
const RUN_RETAIL = { label: 'Bilingual CSR · Retail support, Zendesk · English C1', at: new Date(2026, 10, 2, 9, 40), by: 'Carlos Ortega',
  vertical: 'CSR', cities: ['Bogotá', 'Medellín', 'Buenos Aires', 'Cebu'], pages: 2, language: 'English',
  description: 'Bilingual customer service agent for a US retail chain. 3+ years of inbound phone and chat support, Zendesk, English C1. Rotating shifts.' };
const ANALYSIS_HISTORY = {
  5: [{ score: 71, reason: 'Two years of bilingual chat and email support for a US fintech; solid English, but no Zendesk and no retail orders.',
        run: RUN_RETAIL,
        criteria: crit(72, 75, 55, 85, null, 74, ['Two years of inbound support, fintech rather than retail.', 'Agent level.', 'Intercom and internal tools; no Zendesk.', 'English at professional working proficiency.', '', 'US fintech customers.']) }],
  7: [{ score: 48, reason: 'Technical support for a SaaS product; customer-facing, but troubleshooting rather than retail service, and no Zendesk.',
        run: RUN_RETAIL,
        criteria: crit(45, 60, 40, 88, null, 50, ['Technical troubleshooting rather than retail service.', 'Agent level.', 'Ticketing in Jira; no Zendesk.', 'Full professional English.', '', 'Some US end users.']) }],
  203: [{ score: 88, reason: 'Three years handling US auto-insurance claims by phone in Salesforce Service Cloud — the core of this search.',
          run: { label: 'Insurance Claims Rep · Salesforce Service Cloud · English B2', at: new Date(2026, 9, 28, 10, 12), by: 'Laura Méndez',
                 vertical: 'CSR', cities: ['Barranquilla', 'Bogotá', 'Medellín'], pages: 2, language: 'English',
                 description: 'Claims Customer Service Representative for a US auto insurance carrier. 2+ years handling first notice of loss and claim status calls, Salesforce Service Cloud, English B2 or higher. Remote, US Eastern hours.' },
          criteria: crit(92, 85, 88, 72, null, 90, ['Claims intake and follow-up for a US insurer, three years.', 'Agent level, as asked.', 'Salesforce Service Cloud daily.', 'Professional working English, at the B2 asked.', '', 'US insurer, US hours.']) }],
  1: [{ score: 81, reason: 'Four years of bilingual support for US retail accounts on Zendesk and Salesforce, with C1 English.',
        run: { label: 'Bilingual CSR · Retail support, Zendesk · English C1', at: new Date(2026, 10, 2, 9, 40), by: 'Carlos Ortega',
               vertical: 'CSR', cities: ['Bogotá', 'Medellín'], pages: 2, language: 'English',
               description: 'Bilingual customer service agent for a US retail chain. 3+ years of inbound phone and chat support, Zendesk, English C1. Rotating shifts.' },
        criteria: crit(84, 80, 86, 88, null, 82, ['Four years of inbound support for US retail.', 'Agent level with tenure.', 'Zendesk and Salesforce Service Cloud.', 'C1 English, as asked.', '', 'US accounts throughout.']) },
      { off: true, reason: 'Customer service agent; the search asked for a collections specialist with negotiation targets.',
        run: { label: 'Collections Specialist · Early-stage debt · Spanish native', at: new Date(2026, 9, 21, 15, 5), by: 'Andrea Ramírez',
               vertical: 'Finance', cities: ['Bogotá', 'Cali'], pages: 1, language: 'Spanish',
               description: 'Collections specialist for early-stage consumer debt. Negotiation of payment agreements by phone, monthly recovery targets, native Spanish.' } }],
};


/* ----------------- Pestaña Searches: búsquedas asistidas que encontraron al candidato ----------------- */
let HISTORY_SHOWN = [];
function renderSearchHistory(c) {
  const box = document.getElementById('searchHistory'); if (!box) return;
  const all = analysesOf(c);
  HISTORY_SHOWN = all;
  setCount(document.getElementById('drawer'), '[data-d-searchcount]', all.length);
  box.innerHTML = all.length ? all.map((a, i) => {
    const band = a.off ? 'na' : matchBand(a.score);
    return `<button type="button" class="sh-row m-${band}" onclick="openSearchDetail(${i})">
      ${a.off ? '<span class="match-off">Off-target</span>' : matchRing(a.score, 34)}
      <span class="sh-txt">
        <b>${a.run.label}</b>
        <span class="sh-meta"><span class="sh-vertical">${a.run.vertical || '—'}</span>${a.off ? 'Off-target' : MATCH_VERDICT[band]} · ${fmtRunDate(a.run.at)} · ${a.run.by || ''}</span>
      </span>
      <svg class="sh-go" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </button>`;
  }).join('') : '<p class="tl-empty">No AI search has found this candidate yet.</p>';
}
/* Detalle de la búsqueda: qué pidió el reclutador y dónde buscó, con el resultado de este candidato. */
function openSearchDetail(i) {
  const a = HISTORY_SHOWN[i]; if (!a) return;
  const r = a.run, band = a.off ? 'na' : matchBand(a.score);
  const m = document.getElementById('searchModal');
  m.querySelector('[data-s-name]').textContent = r.label;
  const kv = (k, v) => `<div class="drawer-kv"><b>${k}</b><span>${v}</span></div>`;
  m.querySelector('[data-s-body]').innerHTML = `
    <div class="sd-result m-${band}">${a.off ? '<span class="match-off">Off-target</span>' : matchRing(a.score, 40)}
      <div><b>${a.off ? 'Off-target for this search' : MATCH_VERDICT[band] + ' for this candidate'}</b><p>${a.reason}</p></div></div>
    ${kv('Vertical', r.vertical || '—')}
    ${kv('Searched by', `${r.by || '—'} · ${fmtRunDate(r.at)}`)}
    ${kv('Cities', (r.cities || []).join(' · ') || '—')}
    ${kv('Pages per city', r.pages || '—')}
    ${kv('Language', r.language || 'Any language')}
    <div class="sd-desc"><span class="detail-label">Description</span><p>${r.description || '—'}</p></div>`;
  openModal('searchModal');
}

const SENIORITY_LABEL = { junior: 'Junior', mid: 'Mid', senior: 'Senior', lead: 'Lead', manager: 'Manager' };
