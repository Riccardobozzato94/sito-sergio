# Panificio Da Sergio — Stato Progetto Completo

> Ultimo aggiornamento: 11 Luglio 2026 | Preview: `http://localhost:4173`

---

## ✅ Cosa Funziona Ora

### 1. Sito Pubblico (Mobile-First, Warm Theme)
- **Home/Hero**: Paralasse dorata, tipografia editoriale Playfair Display, CTA "Scopri prodotti" + "Ordina su WhatsApp"
- **Prodotti**: Grid responsive, card calde con allergeni, badge "Del Giorno", condivisione WhatsApp, fallback immagine SVG
- **Chi Siamo / Come Ordinare / Galleria / Recensioni / Orari / Contatti**: Tutti rifatti con palette calda (espresso #1a1410, oro #d4a574, terracotta #c8673a)
- **Navbar**: Hamburger menu mobile full-screen, logo centrato, carrello + lang switcher
- **Footer**: Contatti, social, newsletter → WhatsApp, orari, copyright
- **Cookie Banner / Privacy Policy / Toast carrello**: Integrati
- **SEO/GEO**: Meta tag, Open Graph, JSON-LD (LocalBusiness + 3 Product), sitemap.xml con hreflang, geo.position aggiornato (45.22202, 12.27988)
- **Storytelling i18n**: Testi IT/EN riscritti per conversione (sensoriali, emotivi, veneziani)

### 2. Carrello + Checkout Stripe
- **CartDrawer**: Slide-in da destra, quantity picker, consegna (ritiro/spedizione/prenota), validazione nome/email/telefono
- **Due vie d'ordine**:
  1. **Paga con Carta** → redirect a `/checkout` → Stripe Checkout Session → torna a `/confirmation`
  2. **WhatsApp** → apre `wa.me` con messaggio formattato (fallback se Stripe non configurato)
- **Checkout page**: Riepilogo ordine, dati cliente, metodo consegna, pulsante "Paga X€" → Stripe
- **Confirmation page**: Successo/Annullato/Errore con info ritiro e link WhatsApp

### 3. Dashboard Admin (Solo Sergio)
- **Login**: `/admin/login` → Supabase Auth (email/password)
- **Protected routes**: `/admin` → `ProtectedRoute` verifica sessione
- **Sidebar navigazione** (mobile: drawer):
  - **Prodotti**: CRUD completo (nome, descrizione, categoria, prezzo, unità, disponibile, in evidenza, allergeni, ordine, upload immagine → Supabase Storage `product-images`)
  - **Ordini**: Lista con dettagli espandibili, cambio stato (pending → paid → preparing → ready → completed/cancelled), payment_status
  - **Testi Sito**: Editor sezioni/chiavi (hero, about, footer) con valori IT/EN salvati in `site_content` table

### 4. Database Supabase (Migrazione da eseguire)
- `orders` table + RLS (insert pubblico, select/update solo admin)
- `site_content` table + RLS (select pubblico, write admin)
- `products` RLS abilitato (select pubblico, insert/update/delete admin)
- Indice `display_order` sui prodotti

### 5. Edge Function Stripe
- `supabase/functions/create-checkout/index.ts`: Crea Checkout Session, salva ordine in DB, ritorna `session.id`
- Secret necessari: `STRIPE_SECRET_KEY`, `SITE_URL`

---

## 📋 Checklist Operativo (Cosa Fare Ora)

### A. Eseguire Migrazione Database
```bash
# Opzione 1: Script automatico (richiede password DB)
node scripts/migrate.js

# Opzione 2: Manuale in Supabase Dashboard
# 1. Vai su SQL Editor
# 2. Incolla contenuto di supabase/migrations/001_orders_content.sql
# 3. Esegui
```
**Poi**: Crea utente admin in Authentication → Users → Add User (es. `sergio@panificiodasergio.it`)

### B. Configurare Stripe
1. Crea account su stripe.com
2. Ottieni `pk_live_...` (Publishable) e `sk_live_...` (Secret)
3. Aggiungi a `.env`:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```
4. Deploy Edge Function:
   ```bash
   npx supabase functions deploy create-checkout
   npx supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   npx supabase secrets set SITE_URL=https://panificiodasergio.it
   ```

### C. Supabase Storage Bucket
In Dashboard → Storage → Create bucket `product-images` (public: false, RLS: admin può upload/leggi)

### D. Foto Prodotti
- Scatta 12-15 foto (bussolà, pevarini, torta nonna, pane, ecc.)
- In Admin → Prodotti: modifica ciascuno → carica immagine

### E. Deploy Produzione
```bash
npm run build
# Carica cartella dist/ su Netlify/Vercel/Cloudflare Pages
# Imposta variabili d'ambiente in piattaforma:
# VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_STRIPE_PUBLISHABLE_KEY
```

---

## 📁 Struttura File Chiave

```
Panificio da Sergio/
├── src/
│   ├── App.jsx                    # Root: CartProvider, HashRouter, routes
│   ├── main.css                   # Tema caldo completo (CSS custom props)
│   ├── components/
│   │   ├── Header.jsx             # Hamburger mobile, cart count, lang
│   │   ├── Hero.jsx               # Paralasse, golden hour overlay
│   │   ├── ProductCard.jsx        # Card calda, allergeni, share, featured
│   │   ├── CartDrawer.jsx         # Slide-in, checkout/WhatsApp dual CTA
│   │   ├── Checkout.jsx           # Form + Stripe redirect
│   │   ├── Confirmation.jsx       # Successo/annullato/errore
│   │   ├── Contacts.jsx           # OpenStreetMap embed + link Google Maps
│   │   └── ... (tutte le sezioni rifatte)
│   ├── pages/
│   │   ├── AdminLogin.jsx
│   │   ├── AdminDashboard.jsx     # Shell + sidebar
│   │   ├── AdminProducts.jsx      # CRUD prodotti + upload
│   │   ├── AdminOrders.jsx        # Lista ordini + stati
│   │   ├── AdminContent.jsx       # Editor testi IT/EN
│   │   ├── Checkout.jsx
│   │   └── Confirmation.jsx
│   ├── lib/
│   │   ├── admin.js               # API admin (products, orders, content, upload)
│   │   ├── stripe.js              # Stripe client + createCheckoutSession
│   │   └── supabase/client.ts     # Client + types + getProducts
│   └── i18n.js                    # Traduzioni IT/EN storytelling
├── supabase/
│   ├── migrations/
│   │   └── 001_orders_content.sql # ESEGUIRE QUESTO
│   └── functions/
│       └── create-checkout/
│           └── index.ts           # Edge Function Stripe
├── scripts/
│   └── migrate.js                 # Script migrazione (chiede pwd DB)
├── public/images/
│   ├── placeholder-product.svg    # Fallback warm SVG
│   └── hero-bg.jpg, bussola.jpg... (foto reali da sostituire)
├── index.html                     # SEO/GEO/JSON-LD completo
├── sitemap.xml                    # hreflang + immagini
├── STRATEGIA-DIGITALE.md          # WhatsApp templates, social, KPI
└── .env                           # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_STRIPE_PUBLISHABLE_KEY
```

---

## 🔗 URL Utili

| Servizio | Link |
|----------|------|
| Supabase Dashboard | https://supabase.com/dashboard/project/gohhqrbcaqvpkcltazzk |
| Supabase SQL Editor | https://supabase.com/dashboard/project/gohhqrbcaqvpkcltazzk/sql/new |
| Supabase Auth Users | https://supabase.com/dashboard/project/gohhqrbcaqvpkcltazzk/auth/users |
| Supabase Storage | https://supabase.com/dashboard/project/gohhqrbcaqvpkcltazzk/storage/buckets |
| Supabase Edge Functions | https://supabase.com/dashboard/project/gohhqrbcaqvpkcltazzk/functions |
| Google Maps (business) | https://business.google.com/ |
| Stripe Dashboard | https://dashboard.stripe.com/ |

---

## 🎯 Prossimi Passi Prioritari

1. **Oggi**: Esegui migrazione SQL + crea utente admin Supabase
2. **Oggi/Domani**: Configura Stripe + deploy Edge Function
3. **Questa settimana**: Foto prodotti + carica in Admin
4. **Deploy**: Netlify/Vercel + variabili d'ambiente
5. **Social**: Apri Instagram/FB, inizia calendario editoriale (vedi STRATEGIA-DIGITALE.md)

---

## 📱 Mobile Test Checklist

- [x] Hero: testo leggibile, CTA tappabili (min 48px)
- [x] Navbar: hamburger apre drawer full-screen
- [x] Prodotti: grid 1 col → 2 col → 3 col → 4 col
- [x] CartDrawer: slide-in, scroll interno, safe-area bottom
- [x] Checkout: form impilato, input grandi, pulsante full-width
- [x] Admin: login centrato, sidebar drawer mobile, form responsive
- [x] Mappa: OpenStreetMap iframe responsive 16:9
- [x] Footer: stack verticale, link toccabili

---

*Generato automaticamente. Per domande: apri `STRATEGIA-DIGITALE.md` per WhatsApp templates, social plan, KPI.*