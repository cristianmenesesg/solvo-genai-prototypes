// ============================================================
// build-zips.mjs — genera un zip por prototipo desde public/prototypes/
// (ya arreglado por prep) + un README. Salida: public/downloads/<bundle>.zip
// ============================================================
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import JSZip from 'jszip'
import { products } from '../src/catalog.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.resolve(__dirname, '..')
const OUT_PROTOS = path.join(SITE, 'public', 'prototypes')
const OUT_DL = path.join(SITE, 'public', 'downloads')

async function walk(dir, base = dir) {
  const out = []
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...(await walk(p, base)))
    else out.push({ rel: path.relative(base, p), abs: p })
  }
  return out
}

function readme(prod, proto) {
  const entry = proto.versions[0]?.file || 'index.html'
  const vers = proto.versions.map((v) => `- ${v.label}: \`${v.file}\``).join('\n')
  return `# ${proto.nombre} — prototipo

Prototipo de **${prod.nombre}** (Solvo GenAI). Design system: \`${prod.designSystem}\`.

## Versiones
${vers}

## Cómo abrir
Es un sitio HTML estático y self-contained.
- Rápido: abrí \`${entry}\` en el navegador.
- Recomendado (sobre todo apps/decks con navegación): serví la carpeta y andá a http://localhost:3000
  \`\`\`bash
  npx serve .
  \`\`\`
${proto.notas ? `\n> ${proto.notas}\n` : ''}`
}

async function main() {
  // In-place: sobrescribir + podar (no rm -rf del dir servido — ver prep).
  await fs.mkdir(OUT_DL, { recursive: true })
  const expected = new Set(products.flatMap((p) => p.prototipos.map((x) => `${x.bundle}.zip`)))
  for (const e of await fs.readdir(OUT_DL)) {
    if (!expected.has(e)) await fs.rm(path.join(OUT_DL, e), { force: true })
  }
  let n = 0
  for (const prod of products) {
    for (const proto of prod.prototipos) {
      const dir = path.join(OUT_PROTOS, proto.bundle)
      const zip = new JSZip()
      const root = zip.folder(proto.bundle)
      for (const f of await walk(dir)) {
        root.file(f.rel.split(path.sep).join('/'), await fs.readFile(f.abs))
      }
      root.file('README.md', readme(prod, proto))
      const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
      await fs.writeFile(path.join(OUT_DL, `${proto.bundle}.zip`), buf)
      n++
    }
  }
  console.log(`✓ zips: ${n} → public/downloads/`)
}

main().catch((e) => { console.error(e); process.exit(1) })
