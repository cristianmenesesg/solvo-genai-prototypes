# Solvo GenAI · Prototipos

Sitio showcase que centraliza los prototipos HTML **por producto**, con **design system swappable** por producto y **descarga de zip** por prototipo. Deployable a Vercel (Vite / estático).

## Desarrollo

```bash
npm install
npm run sync     # regenera public/ desde el vault softgic (prototipos + design-system + zips)
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # sirve dist/
```

> `npm run sync` **lee del vault de softgic** (`../../prototipos` y `../../shared/design-system`). Solo corre en el workspace de softgic. Su salida (`public/prototypes`, `public/downloads`, `public/design-system`) **se commitea** a este repo, para que Vercel solo tenga que correr `vite build`.

## Design system por producto

Cada producto define su `designSystem` en [`src/catalog.js`](src/catalog.js) (`solvo-global` | `solvo-genai` | `softgic`). Cambiarlo ahí y correr `npm run sync` **re-themea globalmente** los prototipos de ese producto (los que consumen el contrato de tokens) y su chrome en el sitio.

## Estructura

- `src/catalog.js` — manifiesto: productos → prototipos → versiones (fuente de verdad).
- `src/main.js` · `src/chrome.css` — UI del hub (router, cards, tabs, iframe, descarga, brand-switcher).
- `scripts/prep-prototypes.mjs` — copia/arregla los bundles y vendoriza el design system a `public/`.
- `scripts/build-zips.mjs` — genera un zip por prototipo en `public/downloads/`.
- `public/` — contenido generado (commiteado): `prototypes/`, `downloads/`, `design-system/`.

## Deploy (Vercel)

1. Crear el repo remoto de este sitio y hacer push.
2. Importar en Vercel (framework: **Vite**; build `npm run build`; output `dist`).
3. En el vault softgic, registrar como submódulo: `git submodule add <url> websites/solvo-genai-prototypes`.

Ciclo: editar acá → `npm run sync` si cambiaron prototipos → commit/push (deploy) → bump del puntero del submódulo en softgic.
