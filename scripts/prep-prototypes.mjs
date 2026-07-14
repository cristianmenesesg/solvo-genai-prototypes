// ============================================================
// prep-prototypes.mjs — sincroniza los prototipos del vault softgic
// hacia public/ del sitio, arreglando gaps y aplicando el design system.
// Lee de:  ../../prototipos  y  ../../shared/design-system
// Escribe: public/prototypes/<bundle>/  y  public/design-system/
// ============================================================
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { products, brands } from '../src/catalog.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.resolve(__dirname, '..')
const VAULT = path.resolve(SITE, '..', '..')
const SRC_PROTOS = path.join(VAULT, 'prototipos')
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

async function copyDir(src, dst) {
  await fs.mkdir(dst, { recursive: true })
  for (const e of await fs.readdir(src, { withFileTypes: true })) {
    if (e.name === '.git' || e.name.endsWith('.zip')) continue
    const s = path.join(src, e.name), d = path.join(dst, e.name)
    if (e.isDirectory()) await copyDir(s, d)
    else await fs.copyFile(s, d)
  }
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

// Sync IN-PLACE: sobrescribe y poda, sin borrar/recrear carpetas que
// siguen existiendo. Importante para `vite dev`: un rm -rf del árbol
// servido mata el watcher de public/ y el server queda ciego (404s)
// hasta reiniciar. Generated files (tokens.css, logo.png, ...) se podan
// aquí y se regeneran después en el mismo run.
async function walkRel(dir, base = dir) {
  const out = []
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    if (e.name === '.git' || e.name.endsWith('.zip')) continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...(await walkRel(p, base)))
    else out.push(path.relative(base, p))
  }
  return out
}

async function removeEmptyDirs(dir, isRoot = true) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) await removeEmptyDirs(path.join(dir, e.name), false)
  }
  if (!isRoot && (await fs.readdir(dir)).length === 0) await fs.rmdir(dir)
}

async function syncBundle(src, dst) {
  if (await exists(dst)) {
    const srcSet = new Set(await walkRel(src))
    for (const rel of await walkRel(dst)) {
      if (!srcSet.has(rel)) await fs.rm(path.join(dst, rel), { force: true })
    }
    await removeEmptyDirs(dst)
  }
  await copyDir(src, dst)
}

async function pruneStaleChildren(root, expected) {
  if (!(await exists(root))) return
  for (const e of await fs.readdir(root)) {
    if (!expected.has(e)) await fs.rm(path.join(root, e), { recursive: true, force: true })
  }
}

async function main() {
  await fs.mkdir(OUT_PROTOS, { recursive: true })
  // podar bundles que ya no están en el catálogo (sí es seguro: dejan de existir)
  const expectedBundles = new Set(products.flatMap((p) => p.prototipos.map((x) => x.bundle)))
  await pruneStaleChildren(OUT_PROTOS, expectedBundles)
  await pruneStaleChildren(OUT_DS, new Set([...brands, 'contract.css']))

  // 1) Vendorizar design system: contract + tokens por brand + logo
  await fs.mkdir(OUT_DS, { recursive: true })
  await fs.copyFile(CONTRACT, path.join(OUT_DS, 'contract.css'))
  const tokensByBrand = {}
  for (const b of brands) {
    tokensByBrand[b] = await fs.readFile(path.join(SRC_DS, b, 'tokens.css'), 'utf8')
    await fs.mkdir(path.join(OUT_DS, b), { recursive: true })
    await fs.writeFile(path.join(OUT_DS, b, 'tokens.css'), tokensByBrand[b])
    const logoSrc = path.join(SRC_DS, b, 'assets', 'logos', LOGO_FILE[b])
    if (await exists(logoSrc)) {
      await fs.mkdir(path.join(OUT_DS, b, 'logos'), { recursive: true })
      await fs.copyFile(logoSrc, path.join(OUT_DS, b, 'logos', LOGO_FILE[b]))
    }
  }
  const contractCss = await fs.readFile(CONTRACT, 'utf8')

  // 2) Por prototipo
  let count = 0
  for (const prod of products) {
    const ds = prod.designSystem
    const brandTokens = `${contractCss}\n${tokensByBrand[ds]}`
    for (const proto of prod.prototipos) {
      const src = path.join(SRC_PROTOS, proto.bundle)
      const dst = path.join(OUT_PROTOS, proto.bundle)
      await syncBundle(src, dst)

      const htmls = await listHtml(dst)
      const combined = (await Promise.all(htmls.map((h) => fs.readFile(h, 'utf8')))).join('\n')
      const needsTokens = /tokens\.css|design-system/.test(combined)

      // tokens.css local del bundle = contrato + brand del producto
      if (needsTokens) await fs.writeFile(path.join(dst, 'tokens.css'), brandTokens)

      // logo local (para arreglar refs rotas)
      const logoSrc = path.join(SRC_DS, ds, 'assets', 'logos', LOGO_FILE[ds])
      if (await exists(logoSrc)) {
        await fs.copyFile(logoSrc, path.join(dst, 'logo.png'))
        // nombres esperados por algunos HTML
        const expected = path.join(dst, 'SolvoGlobal_Logo_Color.png')
        if (!(await exists(expected))) await fs.copyFile(logoSrc, expected)
      }

      // Transformar cada HTML
      for (const h of htmls) {
        let html = await fs.readFile(h, 'utf8')
        // rutas rotas a tokens.css del design-system -> local
        html = html.replace(/(href=["'])[^"']*design-system\/[^"']*tokens\.css(["'])/g, '$1tokens.css$2')
        // logos del design-system o assets/img -> local logo.png
        html = html.replace(/((?:src|href)=["'])[^"']*design-system\/[^"']*logos\/[^"']+\.png(["'])/g, '$1logo.png$2')
        html = html.replace(/((?:src|href)=["'])[^"']*assets\/img\/[^"']*\.png(["'])/g, '$1logo.png$2')
        await fs.writeFile(h, html)
      }
      count++
    }
  }
  console.log(`✓ prep: ${count} prototipos → public/prototypes/  ·  design-system vendorizado (${brands.join(', ')})`)
}

main().catch((e) => { console.error(e); process.exit(1) })
