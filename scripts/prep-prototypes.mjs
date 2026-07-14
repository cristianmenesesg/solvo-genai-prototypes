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

// :root re-mapeado para las apps con design system propio (oscuro/Inter).
// Mapea sus variables al contrato; omite --text-*/--radius-*/--shadow-* para
// que fluya el valor del brand (evita colisiones de nombre).
const APP_ROOT = `:root {
  /* Re-mapeado al contrato del design system (theming swappable por producto). */
  --bg-primary: var(--bg-body);
  --bg-secondary: var(--bg-muted);
  --bg-tertiary: var(--bg-muted);
  --bg-card: var(--bg-surface);
  --bg-hover: var(--bg-muted);
  --border-color: var(--border-default);
  --border-light: var(--border-strong, var(--border-default));
  --accent-primary: var(--color-primary);
  --accent-secondary: var(--color-secondary);
  --accent-success: var(--color-success);
  --accent-warning: var(--color-warning);
  --accent-danger: var(--color-error);
  --accent-info: var(--color-info);
  --font-family: var(--font-body);
  --font-size-xs: var(--text-xs);
  --font-size-sm: var(--text-sm);
  --font-size-base: var(--text-base);
  --font-size-lg: var(--text-lg);
  --font-size-xl: var(--text-xl);
  --font-size-2xl: var(--text-2xl);
  --font-size-3xl: var(--text-3xl);
  --spacing-xs: var(--space-1);
  --spacing-sm: var(--space-2);
  --spacing-md: var(--space-4);
  --spacing-lg: var(--space-6);
  --spacing-xl: var(--space-8);
  --spacing-2xl: var(--space-12);
  --sidebar-width: 220px;
  --header-height: 56px;
}`

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

async function main() {
  await fs.rm(OUT_PROTOS, { recursive: true, force: true })
  await fs.rm(OUT_DS, { recursive: true, force: true })
  await fs.mkdir(OUT_PROTOS, { recursive: true })

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
      await copyDir(src, dst)

      // Flatten source/ (caso landing)
      const srcDir = path.join(dst, 'source')
      if (await exists(srcDir)) {
        for (const e of await fs.readdir(srcDir)) {
          await fs.rename(path.join(srcDir, e), path.join(dst, e))
        }
        await fs.rm(srcDir, { recursive: true, force: true })
      }

      const htmls = await listHtml(dst)
      const combined = (await Promise.all(htmls.map((h) => fs.readFile(h, 'utf8')))).join('\n')
      const needsTokens = /tokens\.css|design-system/.test(combined) || proto.remapApp

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

      // app re-mapeada: reescribir su :root e inyectar tokens.css antes de styles.css
      if (proto.remapApp) {
        const stylesPath = path.join(dst, 'styles.css')
        if (await exists(stylesPath)) {
          let css = await fs.readFile(stylesPath, 'utf8')
          css = css.replace(/:root\s*\{[^}]*\}/, APP_ROOT)
          await fs.writeFile(stylesPath, css)
        }
      }

      // Transformar cada HTML
      for (const h of htmls) {
        let html = await fs.readFile(h, 'utf8')
        // rutas rotas a tokens.css del design-system -> local
        html = html.replace(/(href=["'])[^"']*design-system\/[^"']*tokens\.css(["'])/g, '$1tokens.css$2')
        // logos del design-system o assets/img -> local logo.png
        html = html.replace(/((?:src|href)=["'])[^"']*design-system\/[^"']*logos\/[^"']+\.png(["'])/g, '$1logo.png$2')
        html = html.replace(/((?:src|href)=["'])[^"']*assets\/img\/[^"']*\.png(["'])/g, '$1logo.png$2')
        // apps: inyectar tokens.css al inicio del <head>
        if (proto.remapApp) {
          html = html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}\n  <link rel="stylesheet" href="tokens.css" />`)
        }
        await fs.writeFile(h, html)
      }
      count++
    }
  }
  console.log(`✓ prep: ${count} prototipos → public/prototypes/  ·  design-system vendorizado (${brands.join(', ')})`)
}

main().catch((e) => { console.error(e); process.exit(1) })
