/* ========================================================================
   Solvo Recruiter Platform — Prototipo
   Diseño reusado de shared/prototipos/solvo-platform (tema oscuro, Inter).
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
    { id: 'candidatos', label: 'Búsqueda de candidatos', href: 'candidatos.html',
      icon: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>' },
  ];
  const adminItems = [
    { id: 'perfiles', label: 'Perfiles de búsqueda', href: 'perfiles.html',
      icon: '<path d="M3 3h7v7H3z"></path><path d="M14 3h7v7h-7z"></path><path d="M14 14h7v7h-7z"></path><path d="M3 14h7v7H3z"></path>' },
    { id: 'parametros', label: 'Parámetros', href: 'parametros.html',
      icon: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>' },
  ];
  const item = (it) => `<a href="${it.href}" class="nav-item${activePage === it.id ? ' active' : ''}">
      <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${it.icon}</svg>
      <span>${it.label}</span></a>`;

  const adminSection = canAccessAdmin()
    ? `<div class="nav-section"><span class="nav-section-title">Administración</span>${adminItems.map(item).join('')}</div>` : '';

  const html = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo"><div class="logo-icon">SRP</div><span class="logo-text">Solvo Recruiter Platform</span></div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section"><span class="nav-section-title">Reclutamiento</span>${navItems.map(item).join('')}</div>
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
        <button class="btn-logout" onclick="logout()" title="Cerrar sesión">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line>
          </svg>
        </button>
      </div>
    </aside>`;
  const c = document.getElementById('sidebar-container');
  if (c) c.innerHTML = html;
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
    input.placeholder = tags.length >= MAX ? 'Máx 3 keywords' : 'keyword + Enter';
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

  if (!profile) { showToast('Elegí un perfil de búsqueda', 'info'); return; }

  // estado sin resultados
  if (profile === NO_RESULT_PROFILE) {
    card.style.display = 'none'; note.style.display = 'none'; if (ind) ind.style.display = 'none';
    empty.style.display = 'flex';
    document.getElementById('emptyTitle').textContent = 'Sin candidatos para esta búsqueda';
    document.getElementById('emptyMsg').textContent = 'No hay candidatos open-to-work para “' + profile + '” con esas keywords. Probá otro perfil o quitá keywords.';
    return;
  }

  empty.style.display = 'none';
  card.style.display = 'block';
  if (ind) ind.style.display = 'flex';
  note.style.display = 'flex';
  document.querySelector('[data-note]').textContent = 'Mostrando vigentes y re-validando open-to-work de los vencidos en segundo plano…';
  tbody.innerHTML = '';
  clearFilters();          // arranca sin filtros aplicados
  populateFilterOptions(); // idioma y localización según el conjunto de resultados
  updateCount(0);

  CANDIDATES.forEach((c, idx) => {
    setTimeout(() => {
      const hasEmail = EMAIL_RESOLUTION[c.id];
      const tr = document.createElement('tr');
      tr.className = 'cand-row';
      tr.style.cursor = 'pointer';
      tr.dataset.text = (c.headline + ' ' + c.about + ' ' + c.skills.join(' ')).toLowerCase();
      tr.dataset.langs = c.languages.join('|');
      tr.dataset.country = candCountry(c);
      tr.dataset.email = hasEmail ? '1' : '0';
      tr.innerHTML = `
        <td class="cand-check" onclick="event.stopPropagation()"><input type="checkbox" data-id="${c.id}"></td>
        <td><div class="cand-name"><span class="cand-avatar">${initials(c)}</span>
            <div><span class="font-medium">${c.first} ${c.last}</span><br><span class="text-muted cand-loc">${c.loc}</span></div></div></td>
        <td>${c.headline}</td>
        <td>${chips(c.skills)}</td>
        <td>${chips(c.languages)}</td>
        <td>${c.verified ? '<span class="badge badge-success">Verificado</span>' : '<span class="badge badge-neutral">—</span>'}</td>
        <td class="cand-email">${hasEmail ? `<span class="email-cell">${c.email}</span>` : `<span class="email-cell email-none">sin email</span>`}</td>
        <td onclick="event.stopPropagation()"><a class="cand-li" href="#" target="_blank" rel="noopener">LinkedIn ↗</a></td>`;
      tr.addEventListener('click', () => { fillDrawer(c); openDrawer(); });
      tbody.appendChild(tr);
      applyFilters(); // aplica los filtros activos también a las filas que van llegando
      if (idx === CANDIDATES.length - 1) { note.style.display = 'none'; if (ind) ind.style.display = 'none'; }
    }, 300 + idx * 240);
  });

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
    const langs = [...new Set(CANDIDATES.flatMap(c => c.languages))].sort();
    langSel.innerHTML = '<option value="">Todos los idiomas</option>' + langs.map(l => `<option>${l}</option>`).join('');
  }
  if (locSel) {
    const locs = [...new Set(CANDIDATES.map(candCountry))].sort();
    locSel.innerHTML = '<option value="">Todas las localizaciones</option>' + locs.map(l => `<option>${l}</option>`).join('');
  }
}
function applyFilters() {
  const rows = document.querySelectorAll('#candRows tr');
  if (!rows.length) { updateCount(0); return; }
  const q = (document.getElementById('fltText')?.value || '').trim().toLowerCase();
  const lang = document.getElementById('fltLang')?.value || '';
  const loc = document.getElementById('fltLoc')?.value || '';
  const onlyEmail = document.getElementById('fltEmail')?.checked;
  let visible = 0;
  rows.forEach(tr => {
    let show = true;
    if (q && !tr.dataset.text.includes(q)) show = false;
    if (lang && !tr.dataset.langs.split('|').includes(lang)) show = false;
    if (loc && tr.dataset.country !== loc) show = false;
    if (onlyEmail && tr.dataset.email !== '1') show = false;
    tr.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  updateCount(visible);
}
function clearFilters() {
  const t = document.getElementById('fltText'); if (t) t.value = '';
  const l = document.getElementById('fltLang'); if (l) l.value = '';
  const o = document.getElementById('fltLoc'); if (o) o.value = '';
  const e = document.getElementById('fltEmail'); if (e) e.checked = false;
  applyFilters();
}
function initFilters() {
  document.getElementById('fltText')?.addEventListener('input', applyFilters);
  document.getElementById('fltLang')?.addEventListener('change', applyFilters);
  document.getElementById('fltLoc')?.addEventListener('change', applyFilters);
  document.getElementById('fltEmail')?.addEventListener('change', applyFilters);
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
      : `<div class="combo-option" style="color:var(--text-muted); cursor:default;">Sin perfiles</div>`;
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
function updateCount(n) {
  const el = document.getElementById('resultCount');
  if (el) el.textContent = n + ' candidato' + (n === 1 ? '' : 's');
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
  d.querySelector('[data-d-verified]').textContent = c.verified ? 'Sí' : 'No';
  d.querySelector('[data-d-email]').textContent = EMAIL_RESOLUTION[c.id] ? c.email : 'sin email';
  d.querySelector('[data-d-skills]').innerHTML = chips(c.skills);
}

/* ----------------- Outreach ----------------- */
function openOutreach() {
  if (!SELECTED.size) return;
  document.querySelector('#modalOutreach [data-out-count]').textContent = SELECTED.size;
  openModal('modalOutreach');
}
function confirmOutreach() {
  closeModal('modalOutreach');
  let withEmail = 0; SELECTED.forEach(id => { if (EMAIL_RESOLUTION[id]) withEmail++; });
  const skipped = SELECTED.size - withEmail;
  showToast(`Outreach enviado: ${withEmail} enviados${skipped ? `, ${skipped} omitidos sin email` : ''}`, skipped ? 'info' : 'success');
}
