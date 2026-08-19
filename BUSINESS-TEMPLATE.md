# 🍞 BUSINESS TEMPLATE — Come adattare il sito a un nuovo locale

Questo progetto è un **template riutilizzabile** per panifici, pasticcerie,
pizzerie e ristoranti. Il codice NON cambia mai: cambiano solo i **dati business**.
Usa `scaffold-local-business.ps1` per generare una nuova copia, poi completa
questa checklist.

## 1. Dati anagrafici — `src/lib/config.js`
| Campo | Dove | Note |
|-------|------|------|
| `BUSINESS.name` | config.js | Nome del locale |
| `BUSINESS.slogan` | config.js | Tagline |
| `BUSINESS.since` | config.js | Anno fondazione |
| `BUSINESS.address` | config.js | Indirizzo completo |
| `BUSINESS.phone` | config.js | Telefono (con prefisso, senza +) |
| `BUSINESS.email` | config.js | Email |
| `BUSINESS.whatsappNumber` | config.js | Numero WhatsApp (senza +) |
| `BUSINESS.website` | config.js | Sito web se esiste |
| `HOURS` | config.js | Orari di apertura (array) |
| `SOCIAL.facebook/instagram/...` | config.js | URL social (null = icona nascosta) |

## 2. Foto — `public/images/`
Sostituisci i file JPG/PNG con gli stessi nomi:
| Nome file | Uso |
|-----------|-----|
| `hero-bg.jpg` | Sfondo hero |
| `storefront.jpg` | Vetrina negozio |
| `bussola.jpg`, `biscotti-mandorle.jpg`, `torta-nonna.jpg`, `biscotti-s.jpg`, `torte-mandorla.jpg`, `papini.jpg`, `pevarini.jpg` | Prodotti in evidenza |
| `gallery-1.jpg` … `gallery-9.jpg` | Galleria |
| `og-image.svg` | Anteprima social (modifica testo/colore) |

> Le foto dei **prodotti reali** sono gestite dal CRM (tabella `products` in
> Supabase) se attivi l'admin. Altrimenti il sito mostra solo quelle statiche.

## 3. Prodotti — due modi
- **Modo A (statico, no DB):** modifica l'array `PRODUCTS` in `src/lib/config.js`
  (vedi README originale). ⚠️ Nota: il sito corrente legge da Supabase se
  `VITE_SUPABASE_URL` è settato; in caso contrario mostra lista vuota. Per il
  modo statico devi anche disattivare la chiamata `getProducts()` in `Products.jsx`.
- **Modo B (CRM, consigliato):** crea le tabelle Supabase (vedi DEPLOY-CHECKLIST.md)
  e gestisci i prodotti dall'admin. Le immagini vanno nel bucket `product-images`.

## 4. Testi tradotti — `site_content` (solo se usi Supabase)
Le migrazioni `001` + `002` popolano `site_content` con tutti i testi IT/EN.
Per tradurre o cambiare frasi, usa l'admin oppure edita direttamente in SQL Editor.

## 5. Dominio & Deploy
Vedi `DEPLOY-CHECKLIST.md`. Camera: Vercel (`vercel.json` già presente).
Ricorda di cambiare `SITE_URL` e le env vars Vercel col tuo progetto Supabase.

## 6. Pagamenti (opzionale)
Disattivati di default (solo WhatsApp). Per attivare Stripe: vedi sezione
"Attivare Stripe" in DEPLOY-CHECKLIST.md.
