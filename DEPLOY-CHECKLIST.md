# 🍞 Panificio Da Sergio — Deploy Checklist (Solo Ordine WhatsApp)

> Stato: **codice completo, build OK, schema DB semplice attivo.**
> Decisioni: niente pagamenti online (solo WhatsApp), niente deploy finché non richiesto,
> schema DB = `supabase/migrations/000→003` (il modulo `crm/` è isolato in `_wip_crm_DISABLED/`).

## Cosa è già fatto
- [x] Build di produzione (`npm run build`) → `dist/` generata, 0 errori
- [x] `.env` con Supabase URL + anon key reali
- [x] Migrazioni SQL coerenti con sito + edge function (`000_extensions`, `001_orders_content`, `002_expand_content`, `003_site_storage`)
- [x] Edge function `create-checkout` + `notify-new-order` presenti (NON deployate — servono solo se si attiva Stripe)
- [x] `vercel.json` pronto (rewrite SPA + security headers)
- [x] Modulo CRM orfano isolato in `supabase/_wip_crm_DISABLED/`

## Cosa manca per il go-live (quando deciderai di deployare)

### 1. Database Supabase
Le migrazioni NON si applicano da sole. Due opzioni:

**Opzione A — SQL Editor (semplice, consigliata per un solo cliente):**
1. Apri Supabase Dashboard → SQL Editor
2. Esegui in ordine:
   - `supabase/migrations/000_extensions.sql`
   - `supabase/migrations/001_orders_content.sql`
   - `supabase/migrations/002_expand_content.sql`
   - `supabase/migrations/003_site_storage.sql`
3. **NOTA:** `001` abilita RLS su `products` ma NON crea la tabella `products`.
   Se non esiste, creala PRIMA di `001` con:
   ```sql
   CREATE TABLE IF NOT EXISTS products (
     id SERIAL PRIMARY KEY,
     name TEXT NOT NULL,
     slug TEXT UNIQUE NOT NULL,
     description TEXT DEFAULT '',
     category TEXT DEFAULT 'pane',
     price NUMERIC(10,2) NOT NULL,
     unit TEXT DEFAULT 'al kg',
     image_url TEXT,
     is_available BOOLEAN DEFAULT true,
     display_order INTEGER DEFAULT 0
   );
   ```
4. Crea un admin user: Authentication → Users → Add User
   (es. sergio@panificiodasergio.it) e inserisci in `crm_users` SOLO se usi il CRM
   (altrimenti salta — il sito pubblico non richiede auth).

**Opzione B — Supabase CLI:**
```bash
supabase login
supabase link --project-ref gohhqrbcaqvpkcltazzk
supabase db push
```
⚠️ `supabase db push` legge solo `supabase/migrations/`. Il CRM isolato in
`_wip_crm_DISABLED/` NON viene toccato. Corretto.

### 2. Hosting (Vercel — c'è già `vercel.json`)
1. `vercel login` (account tuo)
2. `vercel` nella root del progetto
3. Imposta le env vars in Vercel Dashboard → Settings → Environment Variables:
   - `VITE_SUPABASE_URL` = https://gohhqrbcaqvpkcltazzk.supabase.co
   - `VITE_SUPABASE_ANON_KEY` = (la stessa del `.env`)
   - NON serve `VITE_STRIPE_PUBLISHABLE_KEY` (WhatsApp only)
4. Dominio: collega `panificiodasergio.it` / `www.panificiodasergio.it` in Vercel → Domains

### 3. Verifica post-deploy
- [ ] Il sito carica i prodotti da Supabase (non vuoto)
- [ ] "Ordina su WhatsApp" apre `wa.me/39041401200?text=...` con il carrello
- [ ] Admin login funziona (se usi CRM)
- [ ] Immagini prodotto visibili (bucket `product-images` + RLS pubblica)

## Attivare Stripe (solo se il cliente lo vuole in futuro)
1. Crea account Stripe, prendi `pk_live_xxx` (publishable) e `sk_live_xxx` (secret)
2. `.env`: `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx`
3. Vercel env: stessa var + `SITE_URL=https://panificiodasergio.it`
4. Deploy edge function:
   ```bash
   npx supabase functions deploy create-checkout
   npx supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
   npx supabase secrets set SITE_URL=https://panificiodasergio.it
   ```
5. ⚠️ Lo schema `orders` di `001` ha già `payment_intent_id` + `payment_status` →
   compatibile con `create-checkout`. Nessuna modifica DB necessaria.

## Note di sicurezza
- L'anon key è pubblica per design (RLS protegge i dati). Non esporre MAI la
  service_role key nel frontend.
- `create-checkout` usa `SUPABASE_SERVICE_KEY` lato edge function (server-side) → OK.
