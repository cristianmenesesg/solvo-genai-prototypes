// ============================================================
// vendor-tokens.mjs — vendoriza el design system (shared/design-system del
// vault softgic) hacia public/ y (re)escribe el tokens.css + logo de cada
// bundle IN-PLACE en public/prototypes/.
//
// Los prototipos VIVEN en este repo (public/prototypes/ es la fuente canónica):
// este script NO los copia ni los mueve — solo aplica el brand del catálogo.
// Correr únicamente cuando cambie el design system (raro), no al editar un
// prototipo. Requiere el workspace del vault (lee ../../shared/design-system);
// Vercel no lo corre — la salida ya va commiteada.
//
// Lee de:  ../../shared/design-system   ·   src/theme/contract.css   ·   src/catalog.js
// Escribe: public/design-system/  y  public/prototypes/<bundle>/{tokens.css,logo.png}
// ============================================================
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { products, brands } from '../src/catalog.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.resolve(__dirname, '..')
const VAULT = path.resolve(SITE, '..', '..')
const SRC_DS = path.join(VAULT, 'shared', 'design-system')
const PUB = path.join(SITE, 'public')
const OUT_PROTOS = path.join(PUB, 'prototypes')
const OUT_DS = path.join(PUB, 'design-system')
const CONTRACT = path.join(SITE, 'src', 'theme', 'contract.css')

const LOGO_FILE = {
  'solvo-global': 'SolvoGlobal_Logo_Color.png',
  'solvo-genai': 'SolvoGenAI_Logo_Color.png',
  softgic: 'Softgic_Logo_Color-scaled.png',
}

const exists = (p) => fs.access(p).then(() => true).catch(() => false)

// solvo-global tiene dos sistemas sobre core/ (ver shared/design-system/solvo-global/README.md).
// Los tokens del brand se arman concatenando core + la capa del sistema; el resto
// de brands mantiene su tokens.css plano. `variant` viene de proto.tokens en el catálogo.
async function readBrandTokens(brand, variant = 'marketing') {
  if (brand === 'solvo-global') {
    const core = await fs.readFile(path.join(SRC_DS, brand, 'core', 'tokens.css'), 'utf8')
    const layer = await fs.readFile(path.join(SRC_DS, brand, variant, 'tokens.css'), 'utf8')
    return core + '\n' + layer.replace(/@import url\('\.\.\/core\/tokens\.css'\);\s*/, '')
  }
  return fs.readFile(path.join(SRC_DS, brand, 'tokens.css'), 'utf8')
}

async function listHtml(dir) {
  const out = []
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...(await listHtml(p)))
    else if (e.name.endsWith('.html')) out.push(p)
  }
  return out
}

async function pruneStaleChildren(root, expected) {
  if (!(await exists(root))) return
  for (const e of await fs.readdir(root)) {
    if (!expected.has(e)) await fs.rm(path.join(root, e), { recursive: true, force: true })
  }
}

async function main() {
  if (!(await exists(SRC_DS))) {
    console.error(
      '✗ No se encontró ../../shared/design-system.\n' +
      '  vendor-tokens solo re-vendoriza el design system y necesita el workspace del vault.\n' +
      '  Los prototipos ya viven en public/prototypes/ — para editarlos no hace falta correr nada.'
    )
    process.exit(1)
  }

  await fs.mkdir(OUT_DS, { recursive: true })
  await pruneStaleChildren(OUT_DS, new Set([...brands, 'contract.css']))

  // 1) Vendorizar design system: contract + tokens por brand + logo
  await fs.copyFile(CONTRACT, path.join(OUT_DS, 'contract.css'))
  const tokensByBrand = {}
  for (const b of brands) {
    tokensByBrand[b] = await readBrandTokens(b)
    await fs.mkdir(path.join(OUT_DS, b), { recursive: true })
    await fs.writeFile(path.join(OUT_DS, b, 'tokens.css'), tokensByBrand[b])
    const logoSrc = path.join(SRC_DS, b, 'assets', 'logos', LOGO_FILE[b])
    if (await exists(logoSrc)) {
      await fs.mkdir(path.join(OUT_DS, b, 'logos'), { recursive: true })
      await fs.copyFile(logoSrc, path.join(OUT_DS, b, 'logos', LOGO_FILE[b]))
    }
  }
  const contractCss = await fs.readFile(CONTRACT, 'utf8')

  // 2) Aplicar el brand del producto a cada bundle IN-PLACE (sin copiar del vault)
  let count = 0
  for (const prod of products) {
    const ds = prod.designSystem
    for (const proto of prod.prototipos) {
      const dst = path.join(OUT_PROTOS, proto.bundle)
      if (!(await exists(dst))) {
        console.warn(`  ! ${proto.bundle}: registrado en el catálogo pero ausente en public/prototypes/`)
        continue
      }

      const htmls = await listHtml(dst)
      const combined = (await Promise.all(htmls.map((h) => fs.readFile(h, 'utf8')))).join('\n')
      const needsTokens = /tokens\.css|design-system/.test(combined)

      // tokens.css local del bundle = contrato + brand del producto
      // (para solvo-global, la variante marketing|platform que declare el prototipo)
      if (needsTokens) {
        const tokens = proto.tokens ? await readBrandTokens(ds, proto.tokens) : tokensByBrand[ds]
        await fs.writeFile(path.join(dst, 'tokens.css'), `${contractCss}\n${tokens}`)
      }

      // logo local (para arreglar refs rotas)
      const logoSrc = path.join(SRC_DS, ds, 'assets', 'logos', LOGO_FILE[ds])
      if (await exists(logoSrc)) {
        await fs.copyFile(logoSrc, path.join(dst, 'logo.png'))
        const expected = path.join(dst, 'SolvoGlobal_Logo_Color.png')
        if (!(await exists(expected))) await fs.copyFile(logoSrc, expected)
      }

      // fijar refs a local (idempotente): design-system/*/tokens.css -> tokens.css, logos -> logo.png
      for (const h of htmls) {
        let html = await fs.readFile(h, 'utf8')
        html = html.replace(/(href=["'])[^"']*design-system\/[^"']*tokens\.css(["'])/g, '$1tokens.css$2')
        html = html.replace(/((?:src|href)=["'])[^"']*design-system\/[^"']*logos\/[^"']+\.png(["'])/g, '$1logo.png$2')
        html = html.replace(/((?:src|href)=["'])[^"']*assets\/img\/[^"']*\.png(["'])/g, '$1logo.png$2')
        await fs.writeFile(h, html)
      }
      count++
    }
  }
  console.log(`✓ tokens: design-system vendorizado (${brands.join(', ')}) · ${count} bundles rebrandeados in-place`)
}

main().catch((e) => { console.error(e); process.exit(1) })
