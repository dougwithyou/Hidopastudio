/* Shared content layer for home.html + admin.html.
   DEFAULT_CONTENT ships baked into the page so it always renders fully,
   even before Supabase is reachable. When Supabase has a saved row,
   applyContent() overwrites any element tagged with data-key / data-key-img
   with the live value. Admin edits write the same shape back to Supabase. */

const SUPABASE_URL = 'https://sskueaqnehlnpgubofpy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNza3VlYXFuZWhsbnBndWJvZnB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4NDM1NjAsImV4cCI6MjEwNTQxOTU2MH0.4h7C2A_BJQh6u1PTS7ZrOcGCYwBMbrsuAP2-jpz9etg';
const CONTENT_ROW_ID = 'home';

const DEFAULT_CONTENT = {
  nav: {
    cta_label: 'Reservar',
    cta_href: 'book-sessions.html',
  },
  hero: {
    eyebrow: 'DMV · Fotografía & Video · Bilingüe',
    title: 'Momentos reales. Historias reales.',
    subtitle: 'Doug & Paola — DOPA Studio. Documentamos bodas, sesiones y eventos en Washington DC, Maryland y Virginia.',
    cta_primary_label: 'Agenda tu sesión',
    cta_primary_href: 'book-sessions.html',
    cta_secondary_label: 'Ver bodas',
    cta_secondary_href: 'weddings.html',
    image: 'assets/images/weddings-hero.jpg',
  },
  trust: {
    items: ['Washington DC', 'Maryland', 'Virginia', 'Bilingüe · EN/ES', '100% editadas, sin límite'],
  },
  features: {
    eyebrow: 'Servicios',
    title: 'Todo lo que necesitas para tu historia',
    cards: [
      {
        title: 'Weddings',
        copy: 'Bodas documentadas de principio a fin, entregadas completamente editadas.',
        href: 'weddings.html',
        tone: '#a9836f',
      },
      {
        title: 'Book & Sessions',
        copy: 'Retratos, maternidad y sesiones en casa — agenda tu fecha.',
        href: 'book-sessions.html',
        tone: '#7a7658',
      },
      {
        title: 'Events',
        copy: 'Cobertura completa de tu evento, sin límite de fotos entregadas.',
        href: 'events.html',
        tone: '#ab8f72',
      },
    ],
    highlight: {
      eyebrow: 'hidopaLab',
      title: 'Content para tu marca, sin contratar equipo completo',
      copy: 'Membresía por niveles que combina creación de contenido con manejo de redes sociales — una alternativa más económica que contratar personal a tiempo completo.',
      cta_label: 'Conoce hidopaLab',
      cta_href: 'content-lab.html',
      tone: '#8c6f52',
    },
  },
  benefits: {
    eyebrow: 'Por qué DOPA Studio',
    title: 'Hecho con intención, de principio a fin',
    image: 'assets/images/weddings-hero.jpg',
    items: [
      { title: 'Bilingüe de verdad', copy: 'Español e inglés como parte de la marca, no como traducción — nos comunicamos como tú lo haces.' },
      { title: 'Sin límite de fotos', copy: 'Todas las fotos de tu evento, entregadas 100% editadas. Sin paquetes con tope.' },
      { title: 'Depósito simple', copy: '50% para reservar tu fecha, el resto el día del evento. Sin sorpresas.' },
      { title: 'Área DMV completa', copy: 'Washington DC, Maryland y Virginia — donde estés, llegamos.' },
    ],
  },
  testimonials: {
    eyebrow: 'Clientes',
    title: 'Lo que dicen de nosotros',
    pending_note: 'Reseñas reales próximamente — este espacio ya está listo para recibirlas.',
    items: [
      { quote: '', author: '', role: '' },
      { quote: '', author: '', role: '' },
      { quote: '', author: '', role: '' },
    ],
  },
  faq: {
    eyebrow: 'Preguntas frecuentes',
    title: 'Todo lo que necesitas saber',
    items: [
      { q: '¿Cómo funciona el depósito?', a: 'Pedimos un 50% para reservar tu fecha, y el saldo restante se paga el día del evento.' },
      { q: '¿Cuántas fotos recibo?', a: 'Todas las fotos del evento, entregadas 100% editadas — sin límite de cantidad.' },
      { q: '¿En qué áreas trabajan?', a: 'Cubrimos todo el área DMV: Washington DC, Maryland y Virginia.' },
      { q: '¿Hablan español?', a: 'Sí — DOPA Studio es bilingüe de verdad, en inglés y español, en cada parte del proceso.' },
      { q: '¿Qué es hidopaLab?', a: 'Nuestra membresía de contenido y manejo de redes sociales para marcas, pensada como alternativa a contratar personal a tiempo completo.' },
    ],
  },
  final_cta: {
    title: '¿Hablamos de tu historia?',
    copy: 'Cuéntanos qué estás planeando y te respondemos pronto.',
    cta_primary_label: 'WhatsApp',
    cta_primary_href: '#',
    cta_secondary_label: 'Instagram',
    cta_secondary_href: '#',
    image: 'assets/images/weddings-hero.jpg',
  },
  footer: {
    area: 'DOPA Studio · DC · Maryland · Virginia',
    copyright: '© 2026 DOPA Studio',
  },
};

function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

async function fetchSiteContent() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/site_content?id=eq.${CONTENT_ROW_ID}&select=data`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows && rows[0] ? rows[0].data : null;
  } catch (e) {
    return null;
  }
}

function applyContent(data) {
  if (!data) return;
  document.querySelectorAll('[data-key]').forEach((el) => {
    const value = getByPath(data, el.dataset.key);
    if (value === undefined || value === null || value === '') return;
    if (el.dataset.keyAttr) {
      el.setAttribute(el.dataset.keyAttr, value);
    } else {
      el.textContent = value;
    }
  });
  document.querySelectorAll('[data-key-bg]').forEach((el) => {
    const value = getByPath(data, el.dataset.keyBg);
    if (value) el.style.backgroundImage = `url('${value}')`;
  });
  document.querySelectorAll('[data-key-href]').forEach((el) => {
    const value = getByPath(data, el.dataset.keyHref);
    if (value) el.setAttribute('href', value);
  });
}

async function loadAndApplyContent() {
  const data = await fetchSiteContent();
  if (data) applyContent(data);
  return data;
}
