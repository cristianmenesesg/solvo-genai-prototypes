// ============================================================
// MANIFIESTO — fuente de verdad del showcase.
// productos[] → prototipos[] → versions[]
//
// - designSystem: brand aplicado a los prototipos del producto que
//   consumen el contrato de tokens (y al chrome al ver ese producto).
//   Valores: 'solvo-global' | 'solvo-genai' | 'softgic'.
//   Cambiarlo aquí + `npm run sync` = swap global de ese producto.
// - bundle: carpeta origen en ../../prototipos/ (y destino en public/prototypes/).
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
        id: 'landing',
        nombre: 'Landing de agendamiento',
        categoria: 'Landing',
        bundle: 'email-cold-outreach-landing',
        versions: [
          { label: 'Release 1', file: 'landing.html' },
          { label: 'Release 2 · estándar', file: 'landing-v2.html' },
          { label: 'Release 2 · quickbook', file: 'landing-v2-quickbook.html' },
        ],
      },
      {
        id: 'cold-email',
        nombre: 'Cold email',
        categoria: 'Email',
        bundle: 'email-cold-outreach-cold-email',
        versions: [
          { label: 'Overview', file: 'cold-email-preview.html' },
          { label: 'Template (booking inline)', file: 'brevo-template.html' },
          { label: 'CTA a landing', file: 'brevo-cold-email-landing-cta.html' },
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
        id: 'funnel-poc-deck',
        nombre: 'Funnel POC (deck)',
        categoria: 'Deck',
        bundle: 'email-cold-outreach-funnel-deck',
        multipage: true,
        versions: [{ label: 'Deck', file: 'index.html' }],
      },
      {
        id: 'platform-ui',
        nombre: 'Platform UI (backoffice)',
        categoria: 'App',
        bundle: 'solvo-platform-ui',
        multipage: true,
        remapApp: true,
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
        multipage: true,
        remapApp: true,
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
