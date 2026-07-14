import './chrome.css'
import { products, findProduct, findPrototype, hub, brands } from './catalog.js'

const app = document.getElementById('app')
const brandLink = document.getElementById('brand-tokens')

const setBrand = (ds) => { if (ds && brandLink) brandLink.href = `/design-system/${ds}/tokens.css` }
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

const topbar = (right = '') => `
  <div class="topbar">
    <a class="brand" href="#/"><span class="dot"></span> ${esc(hub.nombre)}</a>
    <div>${right}</div>
  </div>`

const brandSwitch = (current) => `
  <label class="brand-switch">brand (preview)
    <select id="brandSel">${brands.map((b) => `<option value="${b}" ${b === current ? 'selected' : ''}>${b}</option>`).join('')}</select>
  </label>`

function wireBrandSel() {
  const sel = document.getElementById('brandSel')
  if (sel) sel.addEventListener('change', () => setBrand(sel.value))
}

function renderHome() {
  setBrand(hub.brand)
  const cards = products.map((p) => `
    <a class="card" href="#/p/${p.id}">
      <h3>${esc(p.nombre)}</h3>
      <p>${esc(p.descripcion)}</p>
      <div class="meta">
        <span class="badge accent">${p.prototipos.length} prototipos</span>
        <span class="badge">DS · ${esc(p.designSystem)}</span>
      </div>
    </a>`).join('')
  app.innerHTML = topbar() + `
    <div class="wrap">
      <div class="hero">
        <h1>Prototipos</h1>
        <p>Explorá los prototipos por producto. Cada uno se ve embebido, con sus versiones, y se descarga como zip listo para desarrollo.</p>
      </div>
      <div class="section-title">Productos</div>
      <div class="grid">${cards}</div>
    </div>`
}

function renderProduct(pid) {
  const p = findProduct(pid)
  if (!p) return renderHome()
  setBrand(p.designSystem)
  const cards = p.prototipos.map((x) => `
    <a class="card" href="#/p/${p.id}/${x.id}">
      <h3>${esc(x.nombre)}</h3>
      <div class="meta">
        <span class="badge accent">${esc(x.categoria)}</span>
        <span class="badge">${x.versions.length} ${x.versions.length === 1 ? 'vista' : 'versiones'}</span>
      </div>
    </a>`).join('')
  app.innerHTML = topbar(brandSwitch(p.designSystem)) + `
    <div class="wrap">
      <div class="crumbs"><a href="#/">Productos</a><span class="sep">/</span><span>${esc(p.nombre)}</span></div>
      <div class="hero"><h1>${esc(p.nombre)}</h1><p>${esc(p.descripcion)}</p></div>
      <div class="section-title">Prototipos</div>
      <div class="grid">${cards}</div>
    </div>`
  wireBrandSel()
}

function renderPrototype(pid, protoId) {
  const p = findProduct(pid)
  const x = findPrototype(pid, protoId)
  if (!p || !x) return renderHome()
  setBrand(p.designSystem)
  const tabs = x.versions.length > 1
    ? `<div class="tabs">${x.versions.map((v, i) => `<button class="tab ${i === 0 ? 'active' : ''}" data-i="${i}">${esc(v.label)}</button>`).join('')}</div>`
    : ''
  app.innerHTML = topbar(brandSwitch(p.designSystem)) + `
    <div class="wrap">
      <div class="crumbs"><a href="#/">Productos</a><span class="sep">/</span><a href="#/p/${p.id}">${esc(p.nombre)}</a><span class="sep">/</span><span>${esc(x.nombre)}</span></div>
      <div class="proto-head">
        <div><h1>${esc(x.nombre)}</h1>${x.notas ? `<div class="note">${esc(x.notas)}</div>` : ''}</div>
        <div class="toolbar">
          <a class="btn" id="openNew" href="#" target="_blank" rel="noopener">Abrir ↗</a>
          <a class="btn primary" href="/downloads/${x.bundle}.zip" download>Descargar zip</a>
        </div>
      </div>
      ${tabs}
      <div class="viewer">
        <div class="bar"><span class="dots"><i></i><i></i><i></i></span><span class="url" id="vurl"></span></div>
        <iframe id="frame" title="${esc(x.nombre)}"></iframe>
      </div>
    </div>`
  const setVer = (i) => {
    const url = `/prototypes/${x.bundle}/${x.versions[i].file}`
    document.getElementById('frame').src = url
    document.getElementById('vurl').textContent = url
    document.getElementById('openNew').href = url
    app.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', Number(t.dataset.i) === i))
  }
  app.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => setVer(Number(t.dataset.i))))
  setVer(0)
  wireBrandSel()
}

function route() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  window.scrollTo(0, 0)
  if (parts[0] === 'p' && parts[2]) return renderPrototype(parts[1], parts[2])
  if (parts[0] === 'p' && parts[1]) return renderProduct(parts[1])
  renderHome()
}

window.addEventListener('hashchange', route)
route()
