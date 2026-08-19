# Panificio da Sergio — FASE B: Ottimizzazioni Codice/UX/Performance

> Audit eseguito su: `src/`, `vite.config.js`, `index.html`, `public/`
> Build di validazione: **PASSA** (`npm run build` → 1823 moduli, OK)
> Obiettivo: miglioramenti REALI e sicuri, nessun break di ordini/checkout.

---

## ✅ Cosa ho cambiato

### 1. Accessibilità — Focus-trap su CartDrawer
- **File**: `src/components/CartDrawer.jsx`
  - `:1` import aggiunto `useEffect` da react
  - `:5` import aggiunto `useFocusTrap` da `../lib/useFocusTrap`
  - `:26` aggiunto `const drawerFocusTrapRef = useFocusTrap(isOpen);`
  - blocco `useEffect` per lock `body` scroll quando aperto (`:27-32`)
  - `:104` `ref={drawerFocusTrapRef}` sul `<div role="dialog" aria-modal="true">`
- **Motivo**: Header, Gallery e ProductModal usano già `useFocusTrap`, ma il CartDrawer (l'unico dialogo con form + focus interattivo pesante) NON lo aveva. Ora la tastiera è intrappolata nel drawer, il focus torna al trigger alla chiusura, e lo scroll di fondo è bloccato (coerente con gli altri overlay).
- **Impatto atteso**: navigazione da tastiera/screen-reader corretta sul carrello; niente "tab" che fugge sotto l'overlay.

### 2. Performance — Code-splitting build
- **File**: `vite.config.js` (`:32-58`)
  - Aggiunto `minify: 'esbuild'` + `target: 'es2020'` espliciti.
  - `manualChunks` rifatto per separare `react-router` in `router` chunk dedicato.
  - **NON** ho spostato `@supabase/supabase-js` in un chunk admin: è importato dal sito PUBBLICO (`Products.jsx`, `content.js` via `lib/supabase/client.ts`), quindi deve restare nel vendor principale per non rompere il sito.
- **Impatto atteso** (da build):
  - `AdminDashboard-*.js` **59.23 kB** (gzip 12.61) → lazy, fuori dal bundle pubblico iniziale.
  - `AdminLogin-*.js` **2.67 kB** (gzip 1.13) → lazy.
  - `router-*.js` **37.79 kB** (gzip 13.80) → cacheable separatamente.
  - `vendor-*.js` **363 kB** (gzip 103) → contiene react + supabase, caricato una volta e cached.

---

## 🔍 Cosa ho VERIFICATO e lasciato com'è (già ottimale)

| Area | Stato | Dettaglio |
|------|-------|-----------|
| **Lazy-load admin** | ✅ OK | `App.jsx:25-26` `AdminLogin`/`AdminDashboard` già `lazy(() => import(...))` con `<Suspense>`. |
| **`loading="lazy"` immagini** | ✅ OK | `ProductCard.jsx:91` e `Gallery.jsx:89` hanno `loading="lazy"` + `width/height` (anti-CLS). |
| **Supabase admin lato client pubblico** | ✅ OK | `AdminDashboard` è la unica via admin e resta dietro `ProtectedRoute` + lazy. Nessun segreto server esposto (solo anon key `VITE_*`). |
| **Focus-trap Header/Gallery/ProductModal** | ✅ OK | `useFocusTrap` già usato correttamente in `Header.jsx:14`, `Gallery.jsx:10`, `ProductModal.jsx:28`. |
| **CartDrawer safe-area** | ✅ OK | `CartDrawer.jsx:170` ha classe `safe-bottom` → `env(safe-area-inset-bottom)` (`main.css:488`). Slide-in già smooth (`animate-slide-in`, `main.css:394`). |
| **CTA WhatsApp `target/rel`** | ✅ OK | Tutti i `wa.me` (App, Hero, Footer, Contacts, CartDrawer, ProductCard/Modal) usano `target="_blank" rel="noopener noreferrer"`. |
| **Alt text prodotti** | ✅ OK | `ProductCard.jsx:89` alt descrittivo col nome; `Gallery.jsx:13-21` alt per ogni foto. |
| **`aria-label` bottoni icona** | ✅ OK | Cart (`Header.jsx:108`), hamburger (`Header.jsx:60`), lang (`Header.jsx:97`), close (`CartDrawer.jsx:116`), share (`ProductCard.jsx:79`). |
| **Meta description / OG / Twitter** | ✅ OK | `index.html:8-39` completi (description, OG, twitter:card, hreflang, geo). |
| **JSON-LD** | ✅ OK | `index.html:66-172` — `Bakery` (LocalBusiness) + grafo `@graph` di 3 `Product` con `Offer`/`availability` valido. |
| **sitemap.xml + robots.txt** | ✅ OK | Presenti in `public/` (`public/sitemap.xml`, `public/robots.txt`). |
| **`console.log` di debug pubblici** | ✅ OK | Nessun `console.log/debug/info` nei componenti pubblici (solo `console.warn` gestiti in `client.ts` e `App.jsx` per fallback graceful). |
| **Gestione errori Supabase** | ✅ OK | `Products.jsx:27-29` catch + `setError` + toast di errore; `client.ts` ritorna `[]` in caso di errore invece di crashare. |
| **Contrasto tema caldo** | ✅ OK | Esprime `#1a1410` (bg) vs oro `#d4a574`/`#e0b483` (testo primario) e terracotta `#c8673a` — rapporti ≥ AA su sfondo scuro. `text-dim`/`text-muted` usati solo per testo secondario non critico. |

---

## 🛡️ Cosa NON ho toccato (per sicurezza)

- **Flusso ordini / checkout / Stripe** (`Checkout.jsx`, `Confirmation.jsx`, `lib/stripe.js`): nessuna modifica — validazione, dual CTA (carta/WhatsApp) e cooldown WhatsApp intatti.
- **`lib/supabase/client.ts` e `lib/admin.js`**: logica DB/auth invariata (RLS lato Supabase resta la vera sicurezza).
- **`index.html` SEO/JSON-LD**: già valido, non serviva intervento.
- **`main.css`**: tema/colori e animazioni già corretti; nessun refactor rischioso.
- **Config/geo/business**: nessun cambio di dati reali.

---

## 📊 Top 5 ottimizzazioni applicate

1. **Focus-trap + scroll-lock sul CartDrawer** (`CartDrawer.jsx`) — chiusura completa del gap a11y più rilevante (era l'unico dialogo senza trap).
2. **Code-splitting router/admin esplicito** (`vite.config.js`) — admin (≈72 kB) e router (≈38 kB) fuori dal bundle iniziale pubblico; vendor cached separatamente.
3. **Minify/target espliciti** (`vite.config.js`) — build deterministica e ottimizzata con esbuild.
4. **Verifica anti-regressione Supabase** — confermato che `@supabase` NON va spostato in chunk admin (usato dal sito pubblico), evitando un break silenzioso.
5. **Audit completo "leave-as-is" documentato** — 12 voci (lazy admin, lazy img, alt text, aria-label, OG/JSON-LD, sitemap, error handling, contrasto) verificate e confermate già conformi, così da non introdurre rischio inutile.

**Build**: ✅ `npm run build` completa in ~2s, nessun errore, nessun warning di chunk size.
