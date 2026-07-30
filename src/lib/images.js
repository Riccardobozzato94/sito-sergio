// ═══════════════════════════════════════════════════════════
// IMAGES — Gestione percorsi immagini
// Usa BASE_URL di Vite per funzionare sia in dev che su
// GitHub Pages (dove il sito è servito da /sito-sergio/)
// ═══════════════════════════════════════════════════════════

/**
 * Restituisce il path corretto per un'immagine in public/images/
 * Esempio: img('hero-bg.jpg') → '/sito-sergio/images/hero-bg.jpg'
 */
export function img(name) {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}images/${name}`;
}

/**
 * Converte un path immagine relativo (es. '/images/bussola.jpg')
 * in un path assoluto con BASE_URL (es. '/sito-sergio/images/bussola.jpg').
 * Se il path è già un URL completo (http/https), lo lascia invariato.
 */
export function imageUrl(path) {
  if (!path) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = import.meta.env.BASE_URL || '/';
  // Se inizia con /, toglie lo slash iniziale per evitare doppi slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${cleanPath}`;
}

/**
 * Mappa delle foto reali → nome logico
 * Le chiavi sono i nomi file in public/images/
 * (le foto copiate da C:\Users\Ric\Desktop\foto)
 *
 * NOTA: Questa costante è il fallback statico.
 * Le foto vengono caricate dinamicamente da Supabase tramite
 * getGalleryPhotos() in admin.js, che usa questa come fallback.
 * Vedi anche fetchGalleryPhotos() più sotto per il caricamento dinamico.
 */
export const GALLERY_PHOTOS = [
  { src: img('IMG-20260415-WA0000.jpg'), alt: 'Pane artigianale appena sfornato — Panificio Da Sergio Chioggia' },
  { src: img('IMG-20260415-WA0001.jpg'), alt: 'Prodotti da forno tradizionali — Panificio artigianale Chioggia' },
  { src: img('IMG-20260415-WA0002.jpg'), alt: 'Dolci tipici veneziani — Panificio Da Sergio' },
  { src: img('IMG-20260415-WA0007.jpg'), alt: 'Forno e lavorazione artigianale — Panificio Da Sergio Chioggia' },
  { src: img('IMG-20260415-WA0008.jpg'), alt: 'Biscotti e dolci artigianali — Panificio Da Sergio Chioggia' },
  { src: img('IMG-20260411-WA0005.jpg'), alt: 'Specialità del Panificio Da Sergio — Chioggia' },
  { src: img('IMG-20260411-WA0006.jpg'), alt: 'Pane e prodotti tipici — Panificio Da Sergio' },
  { src: img('IMG-20260410-WA0013.jpg'), alt: 'Dolci e biscotti artigianali — Panificio Da Sergio Chioggia' },
  { src: img('IMG-20260415-WA0015.jpg'), alt: 'Interno del Panificio Da Sergio — Chioggia' },
];

/**
 * Carica le foto della galleria dal database Supabase.
 * Se Supabase non è configurato, usa il fallback statico GALLERY_PHOTOS.
 * Le foto vengono caricate con ordinamento per sort_order.
 * 
 * @returns {Promise<Array<{src: string, alt: string, id?: number}>>}
 */
export async function fetchGalleryPhotos() {
  try {
    const { getGalleryPhotos } = await import('./admin');
    const dbPhotos = await getGalleryPhotos();
    if (dbPhotos && dbPhotos.length > 0) {
      return dbPhotos.map(function(p) {
        return {
          id: p.id,
          src: imageUrl(p.image_url),
          alt: p.alt_it || p.alt_en || '',
        };
      });
    }
  } catch (e) {
    console.warn('[Gallery] Errore caricamento foto da DB, uso fallback statico:', e.message);
  }
  // Fallback statico
  return GALLERY_PHOTOS;
}
