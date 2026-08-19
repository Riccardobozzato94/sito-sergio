# Checklist Produzione — Panificio Da Sergio

> Per: Riccardo | FASE C — messa in produzione
> Da eseguire in ordine. Ogni blocco è indipendente ma l'ordine consigliato è A → B → C → E.
> NON modificare il codice del sito: questi passi sono solo configurazione esterna (Supabase, Stripe, deploy).

---

## A. Migrazioni Database Supabase (OBBLIGATORIO)

Apri il SQL Editor di Supabase e incolla/esegui i 4 file **in questo ordine**:

| # | File | Dove si trova |
|---|------|---------------|
| 1 | `000_extensions.sql` | `supabase/migrations/` |
| 2 | `001_orders_content.sql` | `supabase/migrations/` |
| 3 | `002_expand_content.sql` | `supabase/migrations/` |
| 4 | `003_site_storage.sql` | `supabase/migrations/` |

Link SQL Editor: https://supabase.com/dashboard/project/gohhqrbcaqvpkcltazzk/sql/new

> ⚠️ Attenzione: NON eseguire i file dentro `supabase/migrations/crm/` — sono per un progetto futuro separato e romperebbero il sito.

Oppure per il solo file `001` (gli altri vanno incollati a mano):
```bash
node scripts/migrate.js
```

### Creare l'utente admin (lo zio)
1. Supabase → Authentication → Users → **Add User**
2. Email: `sergio@panificiodasergio.it` (o altra a tua scelta)
3. Password sicura (salvala, servirà allo zio per il login admin)
4. Spunta "Auto Confirm User" (o conferma la email)

---

## B. Account Stripe (OBBLIGATORIO per pagamenti con carta)

1. Registrati su https://dashboard.stripe.com/ e completa la verifica dell'attività.
2. Recupera le chiavi in **Developers → API keys**:
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...` (clicca "Reveal")
3. Aggiungi al `.env` locale del sito:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```
4. Deploy della Edge Function + segreti:
   ```bash
   npx supabase functions deploy create-checkout
   npx supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   npx supabase secrets set SITE_URL=https://panificiodasergio.it
   ```

> Se Stripe non è ancora pronto, il sito cade automaticamente su WhatsApp (già gestito in `Checkout.jsx`). Nessun errore a schermo.

---

## C. Storage Bucket (già creato dalla migrazione 003, verifica)

Dopo aver eseguito `003_site_storage.sql`, su Supabase → Storage deve esistere il bucket `product-images`:
- Private (non pubblico)
- Policy RLS: lettura pubblica, scrittura solo admin
- Limite 5 MB, formati png/jpeg/webp/gif

Verifica che `src/lib/admin.js` usi **signed URL** (coerente col bucket privato). Già fatto nella FASE A.

---

## D. Foto prodotti (RACCOMANDATO)

Le foto placeholder ci sono già, ma servono 12-15 foto reali (le scatta lo zio o un fotografo).
Si caricano da Admin → Prodotti → Modifica → Upload (finiscono nel bucket `product-images`).
Ricorda di scattare anche foto del negozio per Google Business e social (vedi `SOCIAL-KIT.md`).

---

## E. Deploy Produzione (quando tutto sopra è pronto)

```bash
npm run build
```

Carica la cartella `dist/` su **Netlify** o **Vercel** (o Cloudflare Pages).
Il sito usa `HashRouter`, quindi il redirect SPA è automatico (tutte le rotte → `index.html`).

### Variabili d'ambiente da impostare sulla piattaforma
```
VITE_SUPABASE_URL=https://<tuo-progetto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Dominio
- Configura `panificiodasergio.it` sulla piattaforma di deploy (DNS/AXFR o nameserver).
- Verifica che `SITE_URL` (segreto Edge Function) punti al dominio definitivo.

---

## F. Post-deploy (verifiche rapide)
- [ ] Apro `https://panificiodasergio.it` da telefono: hero leggibile, menu hamburger funziona.
- [ ] Provo ad aggiungere un prodotto al carrello → "Ordina su WhatsApp" apre la chat con ordine formattato.
- [ ] Provo "Paga con carta" → redirect a Stripe → torna a `/confirmation`.
- [ ] Login admin (`/admin/login`) con utente creato al punto A.
- [ ] Carico una foto di prova da Admin → Prodotti e la vedo sul sito pubblico.
- [ ] Google Maps / OpenStreetMap embed visibile nella pagina Contatti.

---

## Riepilogo comandi copia-incolla

```bash
# 1. Migrazione automatica (solo 001)
node scripts/migrate.js

# 2. Deploy Edge Function Stripe
npx supabase functions deploy create-checkout
npx supabase secrets set STRIPE_SECRET_KEY=sk_live_...
npx supabase secrets set SITE_URL=https://panificiodasergio.it

# 3. Build di produzione
npm run build
```

---

*Nota: questo file è la sintesi operativa. Il dettaglio tecnico delle migrazioni è in `PANIFICIO-PRODUZIONE-STATUS.md`.*
