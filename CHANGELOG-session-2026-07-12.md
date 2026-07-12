# Changelog — Sessione 2026-07-12

## Admin UI — Miglioramenti completati

### `AdminHome.jsx` (NUOVO)
- Dashboard home con KPI: prodotti totali, ordini per stato, fatturato, ordini recenti
- Azioni rapide (aggiungi prodotto, ordini in attesa, testi sito)

### `AdminDashboard.jsx` (RISC RITTO)
- Nuova navigazione tabellare: **Dashboard**, Prodotti, Ordini, Contenuti
- Badge in tempo reale con conteggio ordini in attesa (polling ogni 30s)

### `AdminProducts.jsx` (MIGLIORATO)
- Campo di ricerca per nome prodotto
- Filtri a tabs per **stato** (Attivo/Bozza/Archiviato) con badge conteggi
- Filtri a tabs per **categoria** (Pane/Pizza/Dolci) con badge conteggi
- Pulsante "Cancella filtri" rapido
- Totale prodotti visibile a piè di lista
- Smart empty states contestuali (nessun risultato / nessun filtro)

### `AdminOrders.jsx` (RISC RITTO)
- Filtri per stato ordine a tabs con badge conteggi
- Ricerca su nome, email, telefono, #id ordine
- Ordinamento toggle (più recenti / più vecchi)
- Esportazione CSV con tutti i campi
- Dettagli espandibili per ogni ordine:
  - Prodotti ordinati (nome, quantità, prezzo)
  - Informazioni pagamento (metodo, stato, totale)
  - Workflow ordine (storico stati)
- Badge colore per stato ordine

### `AdminContent.jsx` (MIGLIORATO)
- Edit inline con doppio textarea (IT/EN)
- Character count in tempo reale per ogni lingua
- Sezioni raggruppate (Hero, Chi Siamo, Footer)
- Indicatori visivi IT/EN con bandierine colorate
- Data ultima modifica visibile

## Stato Build
✅ Build riuscita — `npm run build` senza errori
✅ Preview live su `http://localhost:4173`

## Bloccante
**Stripe non configurato** — mancano le chiavi API da parte del cliente per completare il checkout.

## Credenziali Admin
- Email: `sergio@panificiodasergio.it`
- Password: `Sergio2026!`
- Login: `http://localhost:4173/#/admin/login`

---

# Seconda parte — Contenuti dinamici completi

## Database
- **92 righe site_content** aggiunte (sezioni: hero, nav, howto, products, about, gallery, reviews, contacts, hours, footer, cart, seo) — tutte bilingue IT/EN
- **15 impostazioni** inserite con section=`_setting` (social, business, analytics, seo)
- Seed eseguito via script Node.js con service_role key

## Sistema dinamico (`src/lib/content.js`)
- `fetchSiteContent()` / `fetchSiteSettings()` — carica da Supabase
- `mergeTranslations(lang, rows)` — fonde sito_content con i18n.js (dynamic override)
- `mergeSettings(rows)` — fonde _setting con config.js
- Mappatura completa section.key → translation_key in SECTION_KEY_MAP

## AdminContent.jsx — Riscritto con 3 tab

### Tab 1: Testi del Sito
- 12 sezioni collassabili (hero, nav, howto, products, about, gallery, reviews, contacts, hours, footer, cart, seo)
- Search testuale su chiave, IT ed EN
- Edit inline con doppio textarea, character count, salvataggio individuale
- Badge "X in modifica" per sezione

### Tab 2: Social & Contatti
- Social: Facebook, Instagram, TripAdvisor, Google Reviews, WhatsApp
- Business: indirizzo, telefono, email, sito web, orari (Lun-Ven, Sab, Dom)
- Campi URL con link esterno, campi multilinea per indirizzo/orari
- Salvataggio individuale per campo

### Tab 3: Analytics & SEO
- Google Analytics ID, Meta Pixel ID
- Open Graph: immagine, titolo, descrizione
- Character count per campi descrizione
- Nota informativa: cookie banner nascosto se GA/Meta non configurati

## Componenti aggiornati (leggono dati dinamici con fallback a config.js)
- `Footer.jsx` — social links, orari, business info
- `Contacts.jsx` — indirizzo, telefono, email, WhatsApp
- `OpeningHours.jsx` — orari
- `Header.jsx` — business name, slogan
- `Hero.jsx` — numero WhatsApp
- `CookieBanner.jsx` — GA ID, Meta Pixel (banner nascosto se non configurati)
- `App.jsx` — SettingsContext provider, fetch dinamico all'avvio

## Build
- ✅ Build riuscita — `npm run build` senza errori
- ✅ Preview live su `http://localhost:4173`
