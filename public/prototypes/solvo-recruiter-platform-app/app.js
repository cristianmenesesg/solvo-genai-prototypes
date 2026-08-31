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
  if (!u) { window.location.href = 'index.html'; return null; }
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
  sparkle: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"></path><circle cx="12" cy="12" r="3.2"></circle></svg>'
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
const PROFILES = [
  'Customer Service Representative', 'Sales Representative', 'Legal Assistant', 'Recruiter', 'Scheduler',
];
const NO_RESULT_PROFILE = 'Legal Assistant'; // expone el estado vacío de forma natural

const CANDIDATES = [
  { id:1, first:'María', last:'Restrepo', loc:'Bogotá, Colombia', verified:true,
    headline:'Bilingual Customer Service Representative | English C1',
    skills:['Customer Service','Bilingual English','Zendesk'], languages:['Español','Inglés'], email:'maria.restrepo@gmail.com',
    about:'Asesora de servicio al cliente con 4 años en BPO atendiendo cuentas en EE. UU. Inglés C1. #OpenToWork buscando rol remoto.' },
  { id:2, first:'Juan', last:'Pérez', loc:'Medellín, Colombia', verified:false,
    headline:'Customer Support Specialist | Call Center',
    skills:['Call Center','CRM','Customer Support'], languages:['Español','Inglés'], email:'juanperez88@outlook.com',
    about:'Especialista en soporte con experiencia en call center inbound/outbound. Abierto a nuevas oportunidades remotas.' },
  { id:3, first:'Andrea', last:'Gómez', loc:'Ciudad de México, México', verified:true,
    headline:'Customer Experience Associate | SaaS',
    skills:['CX','SaaS','Bilingual English'], languages:['Español','Inglés'], email:null,
    about:'Asociada de experiencia de cliente en SaaS. Inglés avanzado. Disponible de inmediato.' },
  { id:4, first:'Carlos', last:'Villanueva', loc:'Manila, Filipinas', verified:true,
    headline:'Customer Service Representative | E-commerce',
    skills:['E-commerce','Customer Service','Shopify'], languages:['Inglés','Tagalo'], email:'carlos.v@proton.me',
    about:'CSR with 5 years in e-commerce support for US brands. Open to work, remote-first.' },
  { id:5, first:'Sofía', last:'Hernández', loc:'Buenos Aires, Argentina', verified:false,
    headline:'Bilingual Support Agent | Fintech',
    skills:['Fintech','Bilingual English','Support'], languages:['Español','Inglés'], email:null,
    about:'Agente de soporte bilingüe en fintech. Buscando crecer en un equipo internacional.' },
  { id:6, first:'Daniel', last:'Mokoena', loc:'Johannesburg, Sudáfrica', verified:true,
    headline:'Customer Care Representative | Telecom',
    skills:['Telecom','Customer Care','English'], languages:['Inglés'], email:'d.mokoena@gmail.com',
    about:'Customer care rep in telecom. Native English. Actively looking for remote roles.' },
  { id:7, first:'Valentina', last:'Cruz', loc:'Cali, Colombia', verified:false,
    headline:'Inbound Support Representative | Bilingual',
    skills:['Inbound','Bilingual English','Zendesk'], languages:['Español','Inglés'], email:null,
    about:'Representante de soporte inbound con inglés C1. Open to work.' },
  { id:8, first:'Miguel', last:'Santos', loc:'Cebú, Filipinas', verified:true,
    headline:'Technical Support Representative | B2B SaaS',
    skills:['Technical Support','SaaS','Troubleshooting'], languages:['Inglés','Tagalo'], email:'miguel.santos@gmail.com',
    about:'Technical support rep for B2B SaaS, 6 years. Open to new remote opportunities.' },
  { id:9, first:'Laura', last:'Jiménez', loc:'Guadalajara, México', verified:false,
    headline:'Customer Service Agent | Logistics',
    skills:['Logistics','Customer Service','Bilingual English'], languages:['Español','Inglés'], email:null,
    about:'Agente de servicio al cliente en logística. Inglés avanzado, disponible para roles remotos.' },
];
// El email ya viene capturado por el pipeline (FTPS-1); true = el pipeline lo capturó, false = quedó sin email.
const EMAIL_RESOLUTION = { 1:true,2:true,3:false,4:true,5:false,6:true,7:false,8:true,9:false };
const initials = c => (c.first[0] + c.last[0]).toUpperCase();
const chips = arr => `<div class="cand-chips">${arr.map(s => `<span class="cand-chip">${s}</span>`).join('')}</div>`;
const candCountry = c => c.loc.split(',').pop().trim();

/* ----------------- Búsqueda: tag input (máx 3) ----------------- */
function initTags() {
  const box = document.getElementById('tagbox'); if (!box) return;
  const input = box.querySelector('input'); const MAX = 3; const tags = ['bilingual'];
  function render() {
    box.querySelectorAll('.tag-chip').forEach(t => t.remove());
    tags.forEach((t, i) => {
      const el = document.createElement('span'); el.className = 'tag-chip';
      el.innerHTML = `${t} <span class="tag-chip-remove" data-i="${i}">&times;</span>`;
      box.insertBefore(el, input);
    });
    input.placeholder = tags.length >= MAX ? 'Max 3 keywords' : 'keyword + Enter';
    input.disabled = tags.length >= MAX;
  }
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim() && tags.length < MAX) { e.preventDefault(); tags.push(input.value.trim()); input.value = ''; render(); }
    else if (e.key === 'Backspace' && !input.value && tags.length) { tags.pop(); render(); }
  });
  box.addEventListener('click', e => {
    if (e.target.classList.contains('tag-chip-remove')) { tags.splice(+e.target.dataset.i, 1); render(); }
    else input.focus();
  });
  render();
}

/* ----------------- Búsqueda: demo progresiva ----------------- */
const SELECTED = new Set();
function runSearch() {
  const tbody = document.getElementById('candRows'); if (!tbody) return;
  SELECTED.clear(); updateBulk();
  const profile = (document.getElementById('profileInput')?.value || '').trim();
  const empty = document.getElementById('emptyState');
  const card = document.getElementById('resultsCard');
  const note = document.getElementById('loadNote');
  const ind = document.getElementById('searchIndicator');

  if (!profile) { showToast('Pick a search profile to start', 'info'); return; }

  // estado sin resultados
  if (profile === NO_RESULT_PROFILE) {
    card.style.display = 'none'; note.style.display = 'none'; if (ind) ind.style.display = 'none';
    empty.style.display = 'flex';
    document.getElementById('emptyTitle').textContent = 'No candidates found';
    document.getElementById('emptyMsg').textContent = 'No one open to work matches “' + profile + '” with those keywords. Try another profile or remove a keyword.';
    return;
  }

  empty.style.display = 'none';
  card.style.display = 'block';
  const aip = document.getElementById('aiPanel'); if (aip) aip.style.display = 'none';
  if (ind) ind.style.display = 'flex';
  note.style.display = 'flex';
  document.querySelector('[data-note]').textContent = 'Checking which candidates are still open to work — more may appear as we go…';
  tbody.innerHTML = '';
  clearFilters();          // arranca sin filtros aplicados y en la página 1
  populateFilterOptions(); // idioma y localización según el conjunto de resultados

  CANDIDATES.forEach((c, idx) => {
    setTimeout(() => {
      tbody.appendChild(buildCandRow(c));
      applyFilters(); // aplica los filtros activos también a las filas que van llegando
      if (idx === CANDIDATES.length - 1) { note.style.display = 'none'; if (ind) ind.style.display = 'none'; }
    }, 300 + idx * 240);
  });

  bindRowSelection(tbody);
}

/* La selección por casilla la usan tanto la búsqueda por perfil como AI Search. */
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

/* ----------------- Filtros del listado (client-side, HUTPS-4.6-FE) ----------------- */
function populateFilterOptions() {
  const langSel = document.getElementById('fltLang');
  const locSel = document.getElementById('fltLoc');
  if (langSel) {
    const langs = [...new Set(ALL_CANDS().flatMap(c => c.languages))].sort();
    langSel.innerHTML = '<option value="">All languages</option>' + langs.map(l => `<option>${l}</option>`).join('');
  }
  if (locSel) {
    const locs = [...new Set(ALL_CANDS().map(candCountry))].sort();
    locSel.innerHTML = '<option value="">All locations</option>' + locs.map(l => `<option>${l}</option>`).join('');
  }
}
/* Paginación del listado: se aplica sobre el resultado ya filtrado, en el cliente.
   El contador total vive en el pager (no hay línea de conteo aparte). */
const CAND_PAGE_SIZE = 5;
let candPage = 0;
/* Filas que pasan los filtros activos: es lo que exporta el botón Export. */
let LAST_MATCHES = [];

function applyFilters() {
  const rows = [...document.querySelectorAll('#candRows tr')];
  const q = (document.getElementById('fltText')?.value || '').trim().toLowerCase();
  const lang = document.getElementById('fltLang')?.value || '';
  const loc = document.getElementById('fltLoc')?.value || '';
  const onlyEmail = document.getElementById('fltEmail')?.checked;
  const status = document.getElementById('fltStatus')?.value || '';
  const expF = document.getElementById('fltExport')?.value || 'none';

  const matches = rows.filter(tr => {
    if (q && !tr.dataset.text.includes(q)) return false;
    if (lang && !tr.dataset.langs.split('|').includes(lang)) return false;
    if (loc && tr.dataset.country !== loc) return false;
    if (onlyEmail && tr.dataset.email !== '1') return false;
    if (status && tr.dataset.status !== status) return false;
    if (expF !== 'all' && tr.dataset.exp !== expF) return false;
    return true;
  });
  LAST_MATCHES = matches;

  const pages = Math.max(1, Math.ceil(matches.length / CAND_PAGE_SIZE));
  candPage = Math.min(Math.max(candPage, 0), pages - 1);
  const start = candPage * CAND_PAGE_SIZE;
  const slice = matches.slice(start, start + CAND_PAGE_SIZE);

  rows.forEach(tr => { tr.style.display = 'none'; });
  slice.forEach(tr => { tr.style.display = ''; });

  renderCandPager(matches.length, pages, start, slice.length);
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
function clearFilters() {
  const t = document.getElementById('fltText'); if (t) t.value = '';
  const l = document.getElementById('fltLang'); if (l) l.value = '';
  const o = document.getElementById('fltLoc'); if (o) o.value = '';
  const e = document.getElementById('fltEmail'); if (e) e.checked = false;
  const st = document.getElementById('fltStatus'); if (st) st.value = '';
  const ex = document.getElementById('fltExport'); if (ex) ex.value = 'none';
  candPage = 0;
  applyFilters();
}
function initFilters() {
  const refilter = () => { candPage = 0; applyFilters(); };  // filtrar vuelve a la página 1
  document.getElementById('fltText')?.addEventListener('input', refilter);
  document.getElementById('fltLang')?.addEventListener('change', refilter);
  document.getElementById('fltLoc')?.addEventListener('change', refilter);
  document.getElementById('fltEmail')?.addEventListener('change', refilter);
  document.getElementById('fltStatus')?.addEventListener('change', refilter);
  document.getElementById('fltExport')?.addEventListener('change', refilter);
  document.getElementById('candPrev')?.addEventListener('click', () => { if (candPage > 0) { candPage--; applyFilters(); } });
  document.getElementById('candNext')?.addEventListener('click', () => { candPage++; applyFilters(); });
}

/* ----------------- Searchbox de perfiles (autocomplete, HUTPS-4.3-BE) ----------------- */
function initProfileCombo() {
  const combo = document.getElementById('profileCombo');
  const input = document.getElementById('profileInput');
  const list = document.getElementById('profileComboList');
  if (!combo || !input || !list) return;
  function render() {
    const q = input.value.trim().toLowerCase();
    const items = PROFILES.filter(p => p.toLowerCase().includes(q));
    list.innerHTML = items.length
      ? items.map(p => `<button type="button" class="combo-option" data-p="${p}">${p}</button>`).join('')
      : `<div class="combo-option" style="color:var(--text-muted); cursor:default;">No profiles</div>`;
  }
  input.addEventListener('focus', () => { render(); combo.classList.add('open'); });
  input.addEventListener('input', () => { render(); combo.classList.add('open'); });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); combo.classList.remove('open'); } });
  list.addEventListener('click', e => {
    const opt = e.target.closest('.combo-option[data-p]'); if (!opt) return;
    input.value = opt.dataset.p; combo.classList.remove('open');
  });
  document.addEventListener('click', e => { if (!e.target.closest('#profileCombo')) combo.classList.remove('open'); });
  input.value = PROFILES[0]; // preselección para la demo
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
  d.querySelector('[data-d-about]').textContent = c.about;
  d.querySelector('[data-d-loc]').textContent = c.loc;
  const langEl = d.querySelector('[data-d-langs]'); if (langEl) langEl.textContent = c.languages.join(', ');
  d.querySelector('[data-d-email]').textContent = hasEmailFor(c.id) ? c.email : 'no email';
  d.querySelector('[data-d-skills]').innerHTML = chips(c.skills);
  DRAWER_ID = c.id;
  const st = candState(c.id);
  const stEl = d.querySelector('[data-d-status]'); if (stEl) stEl.innerHTML = statusBadge(st.status);
  const expEl = d.querySelector('[data-d-export]');
  if (expEl) expEl.innerHTML = st.exp
    ? `${shortName(st.exp.by)} · ${shortDate(st.exp.at)}${st.exp.times > 1 ? ` · ${st.exp.times} times` : ''}`
    : 'Never exported';
  renderNotes();
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
const ACTIVE_CITIES = [
  { city:'Bogotá', country:'Colombia' },
  { city:'Medellín', country:'Colombia' },
  { city:'Medellín Area Metropolitana', country:'Colombia' },
  { city:'Barranquilla', country:'Colombia' },
  { city:'Buenos Aires', country:'Argentina' },
  { city:'Córdoba, Argentina', country:'Argentina' },
  { city:'Chihuahua', country:'México' },
  { city:'Mérida', country:'México' },
  { city:'Lima', country:'Perú' },
  { city:'Nairobi', country:'Kenia' },
];

const REQUIRED_LANGS = ['English', 'Spanish', 'Portuguese', 'French'];

/* Tarifa vigente de la fuente — en operación la mantiene el admin en Parameters. */
const RATE = { perPage: 0.10, perProfile: 0.004, perEmail: 0.01, profilesPerPage: 25, otwYield: 0.28 };
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
  tr.dataset.text = (c.headline + ' ' + c.about + ' ' + c.skills.join(' ')).toLowerCase();
  tr.dataset.langs = c.languages.join('|');
  tr.dataset.country = candCountry(c);
  tr.dataset.email = hasEmail ? '1' : '0';
  tr.dataset.status = st.status;
  tr.dataset.exp = expOwner(st.exp);
  tr.innerHTML = `
    <td class="cand-check" onclick="event.stopPropagation()"><input type="checkbox" data-id="${c.id}"></td>
    <td><div class="cand-name"><span class="cand-avatar">${initials(c)}</span>
        <div><span class="font-medium">${c.first} ${c.last}</span>${st.notes.length ? noteDot(st.notes.length) : ''}<br><span class="text-muted cand-loc">${c.loc}</span></div></div></td>
    <td>${c.headline}</td>
    <td>${chips(c.skills)}</td>
    <td>${chips(c.languages)}</td>
    <td class="cand-email">${hasEmail ? `<span class="email-cell">${c.email}</span>` : `<span class="email-cell email-none">no email</span>`}</td>
    <td data-cell="status">${statusBadge(st.status)}</td>
    <td data-cell="export">${exportCell(st.exp)}</td>
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
  tr.querySelector('[data-cell="status"]').innerHTML = statusBadge(st.status);
  tr.querySelector('[data-cell="export"]').innerHTML = exportCell(st.exp);
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

/* Traduce el texto libre a criterios + tres consultas jerárquicas. */
function interpretDescription(raw, langHint) {
  const text = raw.toLowerCase();
  const roles = matchLex(text, LEX.roles);
  const skills = matchLex(text, LEX.skills);
  const industries = matchLex(text, LEX.industries);
  const seniority = matchLex(text, LEX.seniority);
  const langs = matchLex(text, LEX.languages);
  if (langHint && !langs.includes(langHint)) langs.unshift(langHint);

  const yearsMatch = text.match(/(\d+)\s*\+?\s*(años|years|year|año)/);
  const years = yearsMatch ? parseInt(yearsMatch[1], 10) : null;

  /* Si el texto no dispara ningún rol conocido, se destilan las palabras con
     contenido y se usan como frase de búsqueda: es lo que haría el modelo ante
     una descripción atípica, en vez de mandar la oración entera a la fuente. */
  const roleTerms = roles.length ? roles : keyTerms(raw);
  const roleFromText = !roles.length;

  const OTW = '("Open to work" OR "#OpenToWork" OR "Búsqueda activa")';
  const NOT_REC = 'NOT (recruiter OR reclutador OR "talent acquisition")';
  const q = arr => arr.map(t => `"${t}"`).join(' OR ');

  const levels = [
    { name: 'Specific',
      query: `(${q(roleTerms)}) AND ${OTW}` +
             (skills.length ? ` AND (${q(skills.slice(0, 2))})` : '') +
             (langs.length ? ` AND "${langs[0]}"` : '') + ` ${NOT_REC}` },
    { name: 'Broader',
      query: `(${q(roleTerms)}) AND ${OTW}` +
             (skills.length ? ` AND (${q(skills.slice(0, 1))})` : '') + ` ${NOT_REC}` },
    { name: 'Generic',
      query: `(${q(roleTerms)}) AND ${OTW} ${NOT_REC}` },
  ];

  const keywords = [...roleTerms, ...skills, ...industries, ...seniority, ...langs];
  const discarded = descartes(raw, keywords);
  return { keywords, discarded, levels };
}

/* Lo que el modelo leyó y decidió no usar: describe al puesto, no al candidato. */
const RUIDO = ['remoto','remote','full time','tiempo completo','beneficios','seguro','pto',
  'vacaciones','salario','comisión','ambiente','crecimiento','proactiv','responsab','puntual',
  'detallista','organizad','bajo presión','multitarea','atención al detalle','años de experiencia',
  'microsoft office','contrato','quincenal','estabilidad'];
function descartes(raw, usados) {
  const t = raw.toLowerCase();
  const hit = RUIDO.filter(r => t.includes(r));
  const uniq = [...new Set(hit)].slice(0, 6);
  return uniq.map(x => x.charAt(0).toUpperCase() + x.slice(1));
}

/* ----------------- Estimación de alcance y costo ----------------- */
function estimate(pages, cityCount) {
  const totalPages = pages * cityCount;
  const maxCands = totalPages * RATE.profilesPerPage;
  const expected = Math.round(maxCands * RATE.otwYield);
  const searchCost = totalPages * (RATE.perPage + RATE.profilesPerPage * RATE.perProfile);
  const emailCost = expected * RATE.perEmail;
  return { totalPages, maxCands, expected, searchCost, emailCost, total: searchCost + emailCost };
}
const budgetLeft = () => BUDGET.cap - BUDGET.spent;

/* ----------------- Candidatos que trae la búsqueda asistida (mock) ----------------- */
const AI_POOL = [
  { id:101, first:'Camila', last:'Ospina', loc:'Bogotá, Colombia', verified:true, emailKnown:true,
    headline:'Paralegal | Immigration & Family Law', email:'camila.ospina@gmail.com',
    skills:['Immigration Law','Case Management','Drafting'], languages:['Español','Inglés'],
    about:'Paralegal con 5 años en firmas de inmigración. Manejo de expedientes USCIS. Inglés C1. Open to work.' },
  { id:102, first:'Tomás', last:'Aguirre', loc:'Buenos Aires, Argentina', verified:true, emailKnown:true,
    headline:'Legal Assistant | Personal Injury', email:'tomas.aguirre@outlook.com',
    skills:['Personal Injury','Litigation','Case Management'], languages:['Español','Inglés'],
    about:'Asistente legal especializado en personal injury para firmas de EE. UU. Redacción de demandas.' },
  { id:103, first:'Daniela', last:'Rojas', loc:'Medellín, Colombia', verified:false, emailKnown:false,
    headline:'Paralegal | Corporate & Contracts', email:null,
    skills:['Drafting','Case Management'], languages:['Español','Inglés'],
    about:'Paralegal corporativa, revisión y redacción de contratos. Inglés avanzado, disponible de inmediato.' },
  { id:104, first:'Andrés', last:'Quispe', loc:'Lima, Perú', verified:true, emailKnown:true,
    headline:'Legal Assistant | Immigration Law', email:'a.quispe@proton.me',
    skills:['Immigration Law','Drafting'], languages:['Español','Inglés'],
    about:'Asistente jurídico con foco migratorio. Preparación de peticiones y seguimiento de casos.' },
  { id:105, first:'Lucía', last:'Ferreira', loc:'Córdoba, Argentina', verified:false, emailKnown:true,
    headline:'Paralegal | Litigation Support', email:'lucia.ferreira@gmail.com',
    skills:['Litigation','Case Management','Drafting'], languages:['Español','Inglés','Portugués'],
    about:'Paralegal con experiencia en litigio civil. Soporte a abogados en descubrimiento de prueba.' },
  { id:106, first:'Jorge', last:'Betancur', loc:'Barranquilla, Colombia', verified:true, emailKnown:false,
    headline:'Legal Assistant | Bilingual', email:null,
    skills:['Case Management'], languages:['Español','Inglés'],
    about:'Asistente legal bilingüe. Atención a clientes y gestión documental para firma en Florida.' },
  { id:107, first:'Paula', last:'Ncube', loc:'Nairobi, Kenia', verified:true, emailKnown:true,
    headline:'Legal Assistant | Contracts & Compliance', email:'p.ncube@gmail.com',
    skills:['Drafting','Case Management'], languages:['Inglés'],
    about:'Legal assistant supporting US-based contract review. Native English, remote-first.' },
  { id:108, first:'Ricardo', last:'Salas', loc:'Chihuahua, México', verified:false, emailKnown:true,
    headline:'Paralegal | Immigration', email:'ricardo.salas@hotmail.com',
    skills:['Immigration Law','Drafting'], languages:['Español','Inglés'],
    about:'Paralegal migratorio con 3 años en despacho binacional. Buscando rol remoto.' },
  { id:109, first:'Mariana', last:'Duarte', loc:'Mérida, México', verified:true, emailKnown:false,
    headline:'Legal Support Specialist | Family Law', email:null,
    skills:['Case Management','Drafting'], languages:['Español','Inglés'],
    about:'Soporte legal en derecho de familia. Inglés B2, disponible medio tiempo o completo.' },
  { id:110, first:'Sebastián', last:'Rivas', loc:'Medellín Area Metropolitana, Colombia', verified:false, emailKnown:true,
    headline:'Paralegal Assistant | Real Estate Closings', email:'seb.rivas@gmail.com',
    skills:['Drafting','Case Management'], languages:['Español','Inglés'],
    about:'Asistente paralegal en cierres inmobiliarios para clientes de EE. UU.' },
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
  const prof = document.getElementById('aiProfile');
  if (prof && !prof.options.length) prof.innerHTML = PROFILES.map(p => `<option>${p}</option>`).join('');
  updateAiEstimate();
  openModal('aiModal');
}

function renderAiCities() {
  const wrap = document.getElementById('aiCities');
  if (!wrap) return;
  wrap.innerHTML = ACTIVE_CITIES.map(c => {
    const on = AI_FORM.cities.has(c.city);
    return `<button type="button" class="city-chip${on ? ' on' : ''}" data-city="${c.city}">
        ${c.city}<span class="city-country">${c.country}</span></button>`;
  }).join('');
  wrap.onclick = e => {
    const b = e.target.closest('.city-chip'); if (!b) return;
    const city = b.dataset.city;
    AI_FORM.cities.has(city) ? AI_FORM.cities.delete(city) : AI_FORM.cities.add(city);
    renderAiCities(); updateAiEstimate();
  };
}

function updateAiEstimate() {
  const pages = +(document.getElementById('aiPages')?.value || AI_FORM.pages);
  AI_FORM.pages = pages;
  const cities = AI_FORM.cities.size;
  const est = estimate(pages, cities);
  const left = budgetLeft();

  const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  set('aiMath', cities
    ? `<b>${pages}</b> page${pages === 1 ? '' : 's'} × <b>${cities}</b> cit${cities === 1 ? 'y' : 'ies'} = <b>${est.totalPages}</b> pages`
    : 'Pick at least one city');
  set('aiCands', cities ? `up to <b>${est.maxCands}</b> candidates · <b>~${est.expected}</b> expected available` : '—');
  set('aiCost', cities ? `<b>${money(est.total)}</b>` : '—');
  set('aiCostBreak', cities
    ? `search ${money(est.searchCost)} (capped by your pages) + email ~${money(est.emailCost)} (only for available ones)`
    : '');
  set('aiBudget', `${money(left)} left of ${money(BUDGET.cap)} this period`);

  const over = cities && est.total > left;
  const btn = document.getElementById('aiSubmit');
  const warn = document.getElementById('aiBudgetWarn');
  if (btn) btn.disabled = !cities || over;
  if (warn) {
    warn.style.display = over ? 'flex' : 'none';
    warn.innerHTML = over
      ? `This search would cost ${money(est.total)} and only ${money(left)} is left. Reduce pages or cities.` : '';
  }
  document.getElementById('aiBudgetBar')?.style.setProperty('--pct', (BUDGET.spent / BUDGET.cap * 100).toFixed(1) + '%');
}

function submitAiSearch() {
  const desc = (document.getElementById('aiDesc')?.value || '').trim();
  if (!desc) { showToast('Describe the profile you need', 'info'); return; }
  if (!AI_FORM.cities.size) { showToast('Pick at least one city', 'info'); return; }
  const est = estimate(AI_FORM.pages, AI_FORM.cities.size);
  closeModal('aiModal');
  openConfirmPopup({
    title: 'Start AI search',
    message: `We'll search LinkedIn live across <b>${AI_FORM.cities.size}</b> cit${AI_FORM.cities.size === 1 ? 'y' : 'ies'}, up to <b>${AI_FORM.pages}</b> page${AI_FORM.pages === 1 ? '' : 's'} each. Candidates will appear in the table as we find them.`,
    highlight: `Estimated cost up to ${money(est.total)}`,
    icon: 'sparkle',
    confirmLabel: 'Search now',
    onConfirm: () => runAiSearch(desc, document.getElementById('aiLang')?.value || '')
  });
}

/* ----------------- AI Search — ejecución ----------------- */
function runAiSearch(desc, langHint) {
  const tbody = document.getElementById('candRows'); if (!tbody) return;
  const crit = interpretDescription(desc, langHint);
  const cities = AI_FORM.cities.size;
  const pageBudget = AI_FORM.pages * cities;

  SELECTED.clear(); updateBulk();
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('resultsCard').style.display = 'block';
  tbody.innerHTML = '';
  clearFilters();
  populateFilterOptions();
  bindRowSelection(tbody);
  renderAiPanel(crit, 0);

  const note = document.getElementById('loadNote');
  const ind = document.getElementById('searchIndicator');
  const setNote = txt => { note.style.display = 'flex'; document.querySelector('[data-note]').textContent = txt; };
  if (ind) ind.style.display = 'flex';

  /* La ampliación consume el mismo presupuesto de páginas, no uno adicional. */
  const l1Pages = Math.max(1, Math.min(pageBudget, Math.round(pageBudget * 0.55)));
  const l2Pages = pageBudget - l1Pages;
  const spent = { pages: 0, profiles: 0, emails: 0 };
  const delivered = [];

  const scrapedFor = p => Math.round(p * RATE.profilesPerPage * 0.85);

  function deliver(list, from, done) {
    list.forEach((c, i) => {
      setTimeout(() => {
        delivered.push(c.id);
        if (c.emailKnown) spent.emails++;
        tbody.appendChild(buildCandRow(c));
        applyFilters();
        if (i === list.length - 1) done();
      }, from + i * 260);
    });
  }

  setNote(`Searching the most specific criteria across ${cities} cit${cities === 1 ? 'y' : 'ies'}…`);
  spent.pages += l1Pages; spent.profiles += scrapedFor(l1Pages);

  deliver(AI_POOL.slice(0, 4), 700, () => {
    if (delivered.length >= BROADEN_MIN || l2Pages < 1) return finish();
    /* Por debajo del mínimo: se amplía al criterio siguiente y se acumula sin duplicar. */
    renderAiPanel(crit, 1);
    setNote(`Only ${delivered.length} matched — broadening to a wider criteria with the pages left…`);
    spent.pages += l2Pages; spent.profiles += scrapedFor(l2Pages);
    setTimeout(() => deliver(AI_POOL.slice(4), 0, finish), 900);
  });

  function finish() {
    note.style.display = 'none';
    if (ind) ind.style.display = 'none';
    const real = spent.pages * RATE.perPage + spent.profiles * RATE.perProfile + spent.emails * RATE.perEmail;
    const est = estimate(AI_FORM.pages, cities);
    BUDGET.spent += real;
    saveBudget();
    /* Estado con que cierra el flujo: done · empty · partial · error. */
    const status = !delivered.length ? 'empty'
      : (spent.pages < pageBudget && delivered.length < BROADEN_MIN ? 'partial' : 'done');
    renderAiSpend(spent, real, est.total, status);
    if (status === 'empty') {
      showToast('No candidates matched. Try a broader description or add cities.', 'info');
    } else if (status === 'partial') {
      showToast(`${delivered.length} candidates added · the source limited usage before the budget ran out`, 'info');
    } else {
      showToast(`${delivered.length} candidates added · ${money(real)} spent of ${money(est.total)} estimated`, 'success');
    }
  }
}

/* Panel de interpretación: qué entendió el modelo y con qué criterio está buscando. */
function renderAiPanel(crit, activeLevel) {
  const panel = document.getElementById('aiPanel'); if (!panel) return;
  panel.style.display = 'block';
  const kw = crit.keywords.map(k => `<span class="crit-chip">${k}</span>`).join('');
  const dis = crit.discarded.length
    ? `<div class="crit-discarded"><span class="crit-key">descartado</span>${crit.discarded.map(d => `<span class="crit-chip out">${d}</span>`).join('')}</div>` : '';
  panel.innerHTML = `
    <div class="ai-panel-head">
      <span class="ai-badge">AI Search</span>
      <span class="ai-panel-title">Palabras clave con que estamos buscando</span>
    </div>
    <div class="crit-chips">${kw}</div>
    ${dis}
    <div class="ai-levels">
      ${crit.levels.map((l, i) => `
        <div class="ai-level${i === activeLevel ? ' active' : ''}${i < activeLevel ? ' used' : ''}">
          <span class="ai-level-name">${i + 1}. ${l.name}${i === activeLevel ? ' · en curso' : (i < activeLevel ? ' · pocos resultados' : '')}</span>
          <code class="ai-level-query">${l.query.replace(/</g, '&lt;')}</code>
        </div>`).join('')}
    </div>
    <div id="aiSpend" class="ai-spend" style="display:none;"></div>`;
}

const AI_STATUS = {
  done:    { t:'Búsqueda completada', c:'var(--status-success-fg)' },
  empty:   { t:'Sin resultados', c:'var(--text-muted)' },
  partial: { t:'Resultado parcial — la fuente limitó el uso', c:'var(--status-warning-fg)' },
  error:   { t:'La búsqueda falló', c:'var(--status-error-fg)' },
};
function renderAiSpend(spent, real, est, status = 'done') {
  const el = document.getElementById('aiSpend'); if (!el) return;
  const st = AI_STATUS[status] || AI_STATUS.done;
  el.style.display = 'flex';
  el.innerHTML = `
    <span class="ai-status" style="color:${st.c}">${st.t}</span>
    <span><b>${spent.pages}</b> pages opened</span>
    <span><b>${spent.profiles}</b> profiles scraped</span>
    <span><b>${spent.emails}</b> emails captured</span>
    <span class="ai-spend-cost">Real cost <b>${money(real)}</b> vs ${money(est)} estimated</span>
    <span class="ai-spend-budget">${money(budgetLeft())} left of ${money(BUDGET.cap)}</span>`;
}


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
   siempre cobrado. La deduplicación es un factor único sobre los candidatos
   disponibles, porque la búsqueda se paga en bruto pero el email y la IA
   corren sobre filas ya deduplicadas en la base.
   ======================================================================== */
const COST_MODEL = {
  profilesPerPage: 25,     // máximo que entrega una página de la fuente
  pagesPerCombo: 1,        // hoy fijo en el pipeline; no es parámetro todavía
  otwYield: 0.28,          // rendimiento open-to-work observado (7 de 25)
  uniqueRate: 0.85,        // deduplicación básica entre combinaciones
  rateSearchPage: 0.10,
  rateProfile: 0.004,
  rateEmail: 0.010,
  rateBrightData: 0.0015,
  aiInTokens: 5000,        // instrucción + perfil completo del agente
  aiOutTokens: 350,
  aiInPer1M: 0.25,
  aiOutPer1M: 2.00,
};
/* Espejo del catálogo de perfiles de búsqueda (perfiles.html): 12 de 13 activos. */
const ACTIVE_PROFILES = 12;
const DAYS_PER_MONTH = 30.44;

function projectCost(o) {
  const m = { ...COST_MODEL, ...o };
  const combos = m.profiles * m.cities;
  const pages = combos * m.pagesPerCombo;
  const scraped = pages * m.profilesPerPage;
  const otw = scraped * m.otwYield;
  const unique = otw * m.uniqueRate;

  const search = pages * (m.rateSearchPage + m.profilesPerPage * m.rateProfile);
  const email = unique * m.rateEmail;
  const brightData = unique * m.rateBrightData;
  const ai = unique * (m.aiInTokens * m.aiInPer1M / 1e6 + m.aiOutTokens * m.aiOutPer1M / 1e6);

  const perRun = search + email + brightData + ai;
  const runsPerMonth = DAYS_PER_MONTH / m.frequencyDays;
  return {
    combos, pages, scraped,
    otw: Math.round(otw), unique: Math.round(unique),
    runsPerMonth,
    lines: [
      { key: 'search',     label: 'Candidate search',   vendor: 'Apify',       run: search },
      { key: 'email',      label: 'Email capture',      vendor: 'Apify',       run: email },
      { key: 'brightdata', label: 'Profile enrichment', vendor: 'Bright Data', run: brightData },
      { key: 'ai',         label: 'AI analysis',        vendor: 'gpt-5-mini',  run: ai },
    ],
    perRun,
    perMonth: perRun * runsPerMonth,
    aiTokensPerMonth: unique * (m.aiInTokens + m.aiOutTokens) * runsPerMonth,
  };
}
