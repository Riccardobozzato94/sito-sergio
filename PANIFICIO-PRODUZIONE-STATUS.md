# Panificio Da Sergio — Stato Produzione (FASE A)

> Generato: 16 Luglio 2026 | Obiettivo: preparazione al deploy (NON deploy eseguito)
> Build di test locale: ✅ `npm run build` compila senza errori (1823 moduli, ~2.6s)

---

## ✅ Cosa è PRONTO

### 1. Migrazione SQL (sito / FASE A) — `supabase/migrations/`
Ordine di esecuzione consigliato (incollare in Supabase SQL Editor, in sequenza):

| File | Contenuto | Stato |
|------|-----------|-------|
| `000_extensions.sql` | `uuid-ossp`, `pg_trgm` | ✅ presente |
| `001_orders_content.sql` | `orders` (id SERIAL, items JSONB, RLS insert pubblico / read+update admin), `site_content` (RLS pubblico in lettura / admin scrittura), `products` RLS, indice `display_order`, seed i18n | ✅ verificato/completo |
| `002_expand_content.sql` | seed completo `site_content` (tutte le sezioni IT/EN) + tabella `site_settings` (RLS) | ✅ verificato/completo |
| `003_site_storage.sql` | **NUOVO** — bucket `product-images` (private) + RLS (lettura pubblica, scrittura solo admin) | ✅ creato |

Tutti e 4 i file sono pronti da incollare nel SQL Editor. Nessuno richiede intervento.

### 2. Edge Function Stripe — `supabase/functions/create-checkout/index.ts`
✅ Completa e verificata. Logica presente:
- Crea Stripe Checkout Session (mode `payment`, EUR, card/ideal/bancontact)
- Salva ordine in `orders` (con `payment_intent_id`)
- Gestione errori try/catch + CORS preflight
- Validazione payload (items non vuoto, nome+email obbligatori)
- Usa `STRIPE_SECRET_KEY` e `SITE_URL` env (presenti), più `SUPABASE_URL`/`SUPABASE_SERVICE_KEY` (forniti auto dall'ambiente Edge Function)

### 3. Storage bucket — `supabase/migrations/003_site_storage.sql`
✅ Creato. Bucket `product-images` **private** con policy RLS:
- `SELECT` pubblico (il sito mostra le foto a tutti i visitatori)
- `INSERT/UPDATE/DELETE` solo admin autenticati
- Limite 5 MB, MIME png/jpeg/webp/gif

`src/lib/admin.js` aggiornato per usare **signed URL** (1 anno) al posto di `getPublicUrl`, coerente col bucket privato.

### 4. Foto prodotti placeholder — `public/images/`
✅ Tutte le foto principali esistono già (JPG caldi): `bussola.jpg`, `pevarini.jpg`, `torta-nonna.jpg`, `biscotti-mandorle.jpg`, `papini.jpg`, `torte-mandorla.jpg`, `biscotti-s.jpg`, più gallery e hero.
✅ `placeholder-product.svg` presente (fallback warm).
✅ Aggiunto `pane.svg` come placeholder caldo per la categoria pane (prima mancante).
Tutti i componenti usano `/images/placeholder-product.svg` come fallback quando `image_url` è vuoto.

### 5. `.env.example`
✅ Aggiornato con TUTTE le variabili: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`, note sui segreti Edge Function (`STRIPE_SECRET_KEY`, `SITE_URL`) e Resend opzionale. Placeholder chiari.

### 6. Script migrazione — `scripts/migrate.js`
✅ Funzionante (usa `pg`, già in `node_modules`). Esegue solo `001_orders_content.sql` (quella del sito) e salta graceful gli "already exists". Richiede la password DB Supabase.

### Build / Dev
✅ `npm install` già eseguito (node_modules presente).
✅ `npm run build` compila (test locale, modalità NON produzione).
✅ `npm run dev` avviabile (Vite, porta 5173).

---

## ⚠️ COSA RIMANE DA FARE MANUALMENTE (umano)

### A. Eseguire le migrazioni nel DB Supabase (obbligatorio)
1. Apri Supabase SQL Editor: https://supabase.com/dashboard/project/gohhqrbcaqvpkcltazzk/sql/new
2. Incolla ed esegui in ordine: `000_extensions.sql` → `001_orders_content.sql` → `002_expand_content.sql` → `003_site_storage.sql`
   (Oppure: `node scripts/migrate.js` per il solo 001; gli altri 3 vanno incollati a mano)
3. **Crea l'utente admin**: Authentication → Users → Add User → es. `sergio@panificiodasergio.it` + password sicura.
   Il sito AdminLogin usa Supabase Auth; l'RLS del sito si basa su `auth.role()='authenticated'`, quindi basta un utente autenticato (non serve la tabella `crm_users`).

### B. Configurare Stripe (obbligatorio per pagamenti)
1. Crea account su stripe.com → ottieni `pk_live_...` e `sk_live_...`
2. Metti `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...` nel `.env` del sito (e nelle variabili d'ambiente della piattaforma di deploy)
3. Deploy Edge Function + segreti:
   ```bash
   npx supabase functions deploy create-checkout
   npx supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   npx supabase secrets set SITE_URL=https://panificiodasergio.it
   ```
   (senza questi, il checkout cade gracefully su WhatsApp — già gestito in `Checkout.jsx`)

### C. Foto reali prodotti (raccomandato)
- Le foto placeholder ci sono, ma servono 12-15 foto reali (Sergio le scatta).
- Si caricano da Admin → Prodotti → modifica prodotto → upload (finiscono nel bucket `product-images`).

### D. Deploy produzione (quando pronto)
```bash
npm run build
# Carica la cartella dist/ su Netlify / Vercel / Cloudflare Pages
# Imposta variabili d'ambiente sulla piattaforma:
#   VITE_SUPABASE_URL
#   VITE_SUPABASE_ANON_KEY
#   VITE_STRIPE_PUBLISHABLE_KEY
# Configura il dominio (es. panificiodasergio.it) e il redirect SPA:
#   tutte le rotte → index.html (il sito usa HashRouter, quindi è automatico)
```

---

## 🧯 CONFLITTO RISOLTO (importante leggere)
Il progetto conteneva DUE set di migrazioni incompatibili sullo stesso DB:
- **Serie sito** (`001`/`002`): `orders` con `items JSONB`, `site_content`, `site_settings`, RLS `auth.role()='authenticated'`. Usata da `src/lib/admin.js`, `create-checkout`, `notify-new-order`, AdminContent.
- **Serie CRM** (`002_enums_types` → `009`): ricrea `orders`/`products` con schema bigint + `order_items` separata + RLS `has_crm_access()`.

Eseguirle insieme avrebbe **rotto il sito** (la `003_tables.sql` del CRM fallisce su `orders` già esistente e le policy RLS confliggono).

**Azione presa**: le migrazioni CRM sono state spostate in `supabase/migrations/crm/` così NON vengono eseguite per il sito. Il CRM è un progetto futuro separato (vedi `ARCHITECTURE.md`) e andrà su un DB/dataset dedicato o con prefisso tabelle diverso. Non toccare `supabase/migrations/crm/` per la FASE A del sito.

---

## 📋 Checklist finale
- [x] Migrazioni sito pronte (000→003)
- [x] Edge Function create-checkout completa
- [x] Storage bucket product-images (private + RLS) pronto
- [x] Foto placeholder presenti + pane.svg aggiunto
- [x] .env.example completo
- [x] scripts/migrate.js funzionante
- [x] Build di test locale OK
- [ ] **UMANO**: eseguire migrazioni in Supabase SQL Editor
- [ ] **UMANO**: creare utente admin Supabase
- [ ] **UMANO**: account Stripe + segreti Edge Function
- [ ] **UMANO**: deploy su piattaforma + variabili d'ambiente
- [ ] **UMANO (raccom.)**: foto prodotti reali
