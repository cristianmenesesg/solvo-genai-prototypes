// ============================================================
// MANIFIESTO — fuente de verdad del showcase.
// productos[] → prototipos[] → versions[]
//
// - designSystem: brand aplicado a los prototipos del producto que
//   consumen el contrato de tokens (y al chrome al ver ese producto).
//   Valores: 'solvo-global' | 'solvo-genai' | 'softgic'.
//   Cambiarlo aquí + `npm run tokens` = swap global de ese producto.
// - tokens (por prototipo, solo solvo-global): 'marketing' | 'platform'.
//   Elige cuál de los dos sistemas del brand se inyecta al bundle
//   (default 'marketing'). Ver shared/design-system/solvo-global/README.md.
// - bundle: carpeta del prototipo en public/prototypes/ (fuente canónica).
// - versions: pestañas del visor. `file` es relativo a la raíz del bundle.
// - multipage: el prototipo navega entre páginas (deck/app); el visor abre el entry.
// - remapApp: aplica el bridge de tokens (apps con design system propio).
// ============================================================

export const hub = {
  brand: 'solvo-genai',
  nombre: 'Solvo GenAI · Prototipos',
}

export const brands = ['solvo-global', 'solvo-genai', 'softgic']

export const products = [
  {
    id: 'solvo-sales-platform',
    nombre: 'Solvo Sales Platform',
    descripcion: 'Prospección comercial: cold outreach, landing de agendamiento y la plataforma interna.',
    designSystem: 'solvo-global',
    prototipos: [
      {
        id: 'booking-landing-mvp',
        nombre: 'Booking landing page — MVP',
        categoria: 'Landing',
        bundle: 'email-cold-outreach-booking-landing-mvp',
        multipage: true,
        notas: 'Al agendar, la landing navega a la página de confirmación (mismo flujo).',
        versions: [{ label: 'Landing', file: 'landing.html' }],
      },
      {
        id: 'booking-landing-release-2',
        nombre: 'Booking landing page — Release 2',
        categoria: 'Landing',
        bundle: 'email-cold-outreach-booking-landing-release-2',
        multipage: true,
        notas: 'Agendamiento + showcase de candidatos; al confirmar navega a la página de confirmación.',
        versions: [{ label: 'Landing', file: 'landing-v2.html' }],
      },
      {
        id: 'cold-email',
        nombre: 'Cold email',
        categoria: 'Email',
        bundle: 'email-cold-outreach-cold-email',
        versions: [
          { label: 'Preview', file: 'brevo-cold-email-landing-cta-preview.html' },
          { label: 'Email (Brevo)', file: 'brevo-cold-email-landing-cta.html' },
        ],
      },
      {
        id: 'booking-confirmation',
        nombre: 'Booking confirmation (email)',
        categoria: 'Email',
        bundle: 'email-cold-outreach-booking-confirmation',
        versions: [
          { label: 'Preview', file: 'brevo-booking-confirmation-preview.html' },
          { label: 'Prospecto', file: 'brevo-booking-confirmation-prospect.html' },
          { label: 'Cuenta (interno)', file: 'brevo-booking-confirmation-account.html' },
        ],
      },
      {
        id: 'platform-ui',
        nombre: 'Platform UI (backoffice)',
        categoria: 'App',
        bundle: 'solvo-platform-ui',
        tokens: 'platform',
        multipage: true,
        notas: 'Arranca en el login; usá el selector de usuario demo para entrar.',
        versions: [{ label: 'App', file: 'index.html' }],
      },
    ],
  },
  {
    id: 'solvo-recruiter-platform',
    nombre: 'Solvo Recruiter Platform',
    descripcion: 'Reclutamiento: detección de talento open-to-work y la app de reclutadores.',
    designSystem: 'solvo-global',
    prototipos: [
      {
        id: 'talent-pool-poc',
        nombre: 'Talent Pool POC (deck)',
        categoria: 'Deck',
        bundle: 'talent-pool-scraping-poc-deck',
        multipage: true,
        versions: [{ label: 'Deck', file: 'index.html' }],
      },
      {
        id: 'recruiter-app',
        nombre: 'Recruiter Platform (app)',
        categoria: 'App',
        bundle: 'solvo-recruiter-platform-app',
        tokens: 'platform',
        multipage: true,
        notas: 'Arranca en el login; usá el selector de usuario demo para entrar.',
        versions: [{ label: 'App', file: 'index.html' }],
      },
    ],
  },
]

// Helpers
export const findProduct = (pid) => products.find((p) => p.id === pid)
export const findPrototype = (pid, proto) =>
  findProduct(pid)?.prototipos.find((x) => x.id === proto)
