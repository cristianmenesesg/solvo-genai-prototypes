# Solvo GenAI · Prototipos

Sitio showcase que centraliza los prototipos HTML **por producto**, con **design system swappable por producto** (definido en código, no desde el front), **dark mode** en las apps y **descarga de zip** por prototipo. Deployable a Vercel (Vite / estático).

## Comandos

```bash
npm install
npm run dev      # http://localhost:5173  (prebuild arma los zips de descarga)
npm run build    # prebuild → zips + vite build -> dist/
npm run preview  # sirve dist/
npm run tokens   # re-vendoriza el design system desde el vault (solo cuando cambia el DS)
npm run zips     # regenera los zips a mano (normalmente no hace falta)
```

> **Los prototipos viven acá** (`public/prototypes/<bundle>/`), son la fuente canónica y se editan en el repo. No hay `npm run sync` ni copia desde el vault.
>
> - `public/prototypes/` y `public/design-system/` **se commitean** (Vercel compila el repo sin el vault, así que necesita todo servido).
> - Los zips (`public/downloads/`) **no se commitean**: los genera el hook `prebuild` (`build-zips.mjs`) en cada `dev`/`build`.
> - `npm run tokens` **lee del vault softgic** (`../../shared/design-system`) y re-vendoriza el DS + reescribe el `tokens.css`/`logo.png` de cada bundle in-place. Solo corre dentro del workspace y solo hace falta cuando cambia el design system.

## Arquitectura

- [`src/catalog.js`](src/catalog.js) — **manifiesto, fuente de verdad**: `products[] → prototipos[] → versions[]`. Define nombre, bundle de origen, pestañas de versión, notas y el `designSystem` del producto.
- [`src/main.js`](src/main.js) + [`src/chrome.css`](src/chrome.css) — hub SPA (hash routing): cards por producto, visor iframe, tabs de versión, botón de descarga. El chrome consume el contrato de tokens.
- [`src/theme/contract.css`](src/theme/contract.css) — normaliza el contrato entre brands (fallbacks para los tokens que solo define solvo-genai).
- [`scripts/vendor-tokens.mjs`](scripts/vendor-tokens.mjs) — re-vendoriza el design system (`shared/design-system` del vault) a `public/design-system/` y reescribe el `tokens.css`/`logo.png` de cada bundle **in-place** (contract + brand del producto). No copia ni mueve prototipos.
- [`scripts/build-zips.mjs`](scripts/build-zips.mjs) — un zip por prototipo (+ README de cómo abrirlo) en `public/downloads/`. Corre en el hook `prebuild`.
- `vite.config.js` — `appType: 'mpa'`: sin SPA-fallback, un path inexistente da 404 real (nunca el hub dentro del iframe).

## Cómo cambiar el design system de un producto

1. Editar `designSystem` del producto en `src/catalog.js` (`'solvo-global' | 'solvo-genai' | 'softgic'`).
2. `npm run tokens` — regenera el `tokens.css` de cada bundle de ese producto con el brand nuevo.
3. Commit + push → deploy.

No hay switcher en el front (decisión de producto): el brand se define solo acá.

## Cómo están theminizadas las apps (Platform UI / Recruiter)

Fuente canónica: `public/prototypes/solvo-platform-ui/` y `public/prototypes/solvo-recruiter-platform-app/`. Cada página carga, en este orden:

```html
<link rel="stylesheet" href="tokens.css" />   <!-- tokens del brand (lo escribe vendor-tokens según designSystem) -->
<link rel="stylesheet" href="theme.css" />    <!-- tokens de estado (--status-*), --focus-ring y [data-theme='dark'] -->
<link rel="stylesheet" href="styles.css">     <!-- estilos de la app; su :root es un BRIDGE a los tokens -->
<script src="theme.js"></script>              <!-- anti-flash + toggle flotante claro/oscuro (localStorage) -->
```

- **Bridge**: el `:root` de `styles.css` mapea las variables históricas de la app (`--bg-primary`, `--accent-primary`, `--spacing-*`, …) a los tokens del DS (`--bg-body`, `--color-primary`, `--space-*`, …). Los componentes no cambiaron de nombres; heredan la marca y responden a `[data-theme]`.
- **Dark mode**: `theme.css` overridea superficies/texto/bordes y tints semánticos en `[data-theme='dark']`, conservando los hues de marca. Claro por defecto.
- Ambas apps comparten `styles.css` idéntico — si editás uno, copialo al otro bundle.

## Cómo refactorizar / agregar un prototipo

1. Editar o crear el bundle en `public/prototypes/<bundle>/` (fuente canónica; se edita acá directamente).
2. Reglas para que el theming funcione:
   - Consumir tokens del DS (`--color-*`, `--bg-*`, `--text-*`, `--radius-*`, `--shadow-*`); estados con `--status-*-bg/-fg` (definidos en `theme.css`).
   - **No hardcodear hex** de colores de estado ni de marca.
   - Linkear `tokens.css` local (lo escribe `vendor-tokens` con el brand del producto).
3. Registrarlo/ajustarlo en `src/catalog.js` (bundle, versiones, notas).
4. Si es un bundle nuevo: `npm run tokens` para escribirle el `tokens.css`/`logo.png`. Verificar en `npm run dev` → commit + push.

## Deploy (Vercel) y submódulo

1. Crear el repo remoto de este sitio y hacer push (`git remote add origin <url> && git push -u origin main`).
2. Importar en Vercel — framework **Vite**, build `npm run build`, output `dist` (el CSP va en `vercel.json`).
3. Registrar como submódulo en el vault: `git submodule add <url> websites/solvo-genai-prototypes`.

Ciclo: editar prototipos en `public/prototypes/` → commit/push del sitio (deploy) → bump del puntero del submódulo en softgic. `npm run tokens` solo cuando cambie el design system.
