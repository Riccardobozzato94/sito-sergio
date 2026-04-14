# Panificio Da Sergio — Sito Web

Sito e-commerce con ordine via WhatsApp per il Panificio Da Sergio.
Tema scuro lussuoso, responsive, mobile-first.

## Avvio Sviluppo

```bash
npm install
npm run dev
```

Il sito sarà disponibile su http://localhost:5173

## Build Produzione

```bash
npm run build
```

L'output sarà in `dist/`.

## Come Aggiornare il Sito (Senza Toccare il Codice)

Tutti i dati modificabili sono in **`src/lib/config.js`**. Basta cambiare i valori lì e il sito si aggiorna.

### Aggiungere/Modificare Prodotti
In `config.js`, modifica l'array `PRODUCTS`:

```js
export const PRODUCTS = [
  {
    id: "nuovo-prodotto",        // ID univoco, senza spazi
    name: "Nome Prodotto",       // Nome visibile
    description: "Descrizione",  // Testo sotto il nome
    price: "20€ al kg",          // Testo prezzo completo
    priceLabel: "20€",           // Prezzo evidenziato
    unit: "al kg",               // Unità di misura
    image: "/images/nome-foto.jpg", // Percorso immagine
    category: "dolci",           // Categoria: "pane", "dolci", "specialita"
  },
  // ...altri prodotti
];
```

### Sostituire le Foto

Le foto vanno in **`public/images/`**. I nomi file devono corrispondere a quelli in `config.js`:

| Foto | Nome file |
|------|-----------|
| Hero background | `hero-bg.jpg` |
| Vetrina negozio | `storefront.jpg` |
| Bussolà | `bussola.jpg` |
| Biscotti Mandorle | `biscotti-mandorle.jpg` |
| Torta della Nonna | `torta-nonna.jpg` |
| Biscotti a S | `biscotti-s.jpg` |
| Torte Mandorla | `torte-mandorla.jpg` |
| Papini | `papini.jpg` |
| Pevarini | `pevarini.jpg` |
| Galleria 1-6 | `gallery-1.jpg` fino a `gallery-6.jpg` |

Per sostituire: **copia il file JPG/PNG nella cartella `public/images/` con lo stesso nome**.

### Modificare Orari
In `config.js`, modifica l'array `HOURS`.

### Modificare Contatti
In `config.js`, modifica l'oggetto `BUSINESS` (telefono, email, WhatsApp, indirizzo).

### Modificare Social
In `config.js`, modifica l'oggetto `SOCIAL` (URL Facebook, Instagram, YouTube).

### Modificare Testo Citazione
In `config.js`, modifica l'oggetto `QUOTE`.

## Struttura

```
sito sergio/
├── src/
│   ├── lib/config.js       ← TUTTO MODIFICABILE QUI
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── Products.jsx
│   │   ├── ProductCard.jsx
│   │   ├── Gallery.jsx
│   │   ├── QuoteSection.jsx
│   │   ├── Contacts.jsx
│   │   ├── Footer.jsx
│   │   └── CartDrawer.jsx
│   ├── App.jsx
│   └── main.css
├── public/images/          ← FOTO QUI
├── index.html
├── vite.config.js
└── package.json
```
