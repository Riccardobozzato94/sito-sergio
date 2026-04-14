# 🏗️ Panificio Da Sergio — Architettura CRM + App Mobile

## Panoramice

Questo documento descrive l'architettura completa per il sistema CRM e le app mobile
(iOS/Android) del Panificio Da Sergio. Il sito web esistente (`sito sergio/`) rimane
il frontend pubblico. Il CRM e le app aggiungeranno gestione ordini, clienti, inventario
e comunicazione.

---

## 1. Stack Tecnologico Consigliato

### Backend API
| Component | Scelta | Motivo |
|-----------|--------|--------|
| **Framework** | **Supabase** (PostgreSQL + Edge Functions) | Database relazionale, auth real-time, row-level security, funzioni serverless, gratis per iniziare |
| **Database** | PostgreSQL 15+ (via Supabase) | Robustezza, JSON support, full-text search |
| **Auth** | Supabase Auth (email + phone + OAuth) | Supporto nativo per login con numero di telefono |
| **Real-time** | Supabase Realtime (WebSocket) | Aggiornamenti live per ordini e dashboard |
| **Storage** | Supabase Storage (prodotti, receipts) | Immagini prodotti, documenti |
| **SMS/WhatsApp** | WhatsApp Business API (Meta) + Twilio | Invio conferme ordini, notifiche push |

### App Mobile
| Component | Scelta | Motivo |
|-----------|--------|--------|
| **Framework** | **Expo (React Native)** | Codebase singolo iOS+Android, hot reload, EAS Build |
| **Navigation** | Expo Router (file-based) | Routing moderno, deep linking, shared con Next.js |
| **UI** | NativeWind (Tailwind per RN) | Stesso stile del sito web, consistenza brand |
| **State** | Zustand + TanStack Query | Leggero, performante, cache automatica |
| **Push Notifications** | Expo Notifications (FCM + APNs) | Notifiche native iOS/Android |
| **Offline** | WatermelonDB / MMKV | Cache locale per ordini e catalogo |

### CRM Dashboard (Web Admin)
| Component | Scelta | Motivo |
|-----------|--------|--------|
| **Framework** | **Next.js 15** (App Router) | SSR, API routes, ottimizzato per dashboard |
| **UI** | shadcn/ui + Tailwind | Componenti accessibili, temi dark/light |
| **Charts** | Recharts | Grafici ordini, trend vendite |
| **Data Table** | TanStack Table | Ordinamento, filtri, paginazione |
| **Auth** | Supabase Auth | Stesso backend dell'app mobile |

---

## 2. Database Schema

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    customers    │       │     orders      │       │   order_items   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (uuid) PK   │◄──────│ id (uuid) PK    │◄──────│ id (uuid) PK    │
│ name            │       │ customer_id FK  │       │ order_id FK     │
│ phone           │       │ status          │       │ product_id FK   │
│ email           │       │ total           │       │ quantity        │
│ notes           │       │ delivery_method │       │ unit_price      │
│ created_at      │       │ pickup_time     │       │ subtotal        │
│ loyalty_points  │       │ notes           │       └─────────────────┘
│ is_vip          │       │ whatsapp_sent   │
└─────────────────┘       │ created_at      │       ┌─────────────────┐
                          │ updated_at      │       │    products     │
                          └─────────────────┘       ├─────────────────┤
                                   │                │ id (uuid) PK    │
                                   │                │ name            │
                          ┌────────▼────────┐       │ description     │
                          │    analytics    │       │ category        │
                          ├─────────────────┤       │ price_per_kg    │
                          │ id (uuid) PK   │       │ image_url       │
                          │ date            │       │ is_available    │
                          │ total_orders    │       │ stock_weight_kg │
                          │ total_revenue   │       │ created_at      │
                          │ avg_order_value │       └─────────────────┘
                          └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│    promotions   │       │    inventory    │
├─────────────────┤       ├─────────────────┤
│ id (uuid) PK   │       │ id (uuid) PK    │
│ title           │       │ product_id FK   │
│ description     │       │ date            │
│ discount_pct    │       │ quantity_in_kg  │
│ valid_from      │       │ quantity_sold   │
│ valid_to        │       │ wasted_kg       │
│ product_ids[]   │       │ restocked_kg    │
│ is_active       │       └─────────────────┘
└─────────────────┘
```

### Tabella: `customers`
```sql
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  loyalty_points INT DEFAULT 0,
  is_vip BOOLEAN DEFAULT FALSE,
  total_orders INT DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0
);
```

### Tabella: `orders`
```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  status TEXT NOT NULL DEFAULT 'pending',
  -- pending → confirmed → preparing → ready → completed / cancelled
  total NUMERIC(10,2) NOT NULL,
  delivery_method TEXT NOT NULL,
  -- pickup | courier | reservation
  pickup_time TEXT,
  notes TEXT,
  whatsapp_sent BOOLEAN DEFAULT FALSE,
  whatsapp_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Architettura API

### REST Endpoints (Supabase Edge Functions)

```
POST   /api/orders                    → Crea nuovo ordine (da sito/app)
GET    /api/orders                    → Lista ordini (CRM)
GET    /api/orders/:id                → Dettaglio ordine
PATCH  /api/orders/:id/status         → Aggiorna stato ordine
POST   /api/orders/:id/whatsapp       → Invia conferma WhatsApp

GET    /api/products                  → Lista prodotti (con filtro categoria)
POST   /api/products                  → Crea/modifica prodotto (CRM)
PATCH  /api/products/:id/availability → Toggle disponibilità
PATCH  /api/products/:id/stock        → Aggiorna giacenza

GET    /api/customers                 → Lista clienti (CRM)
GET    /api/customers/:id             → Profilo cliente + storico ordini
PATCH  /api/customers/:id/loyalty     → Aggiorna punti fedeltà

GET    /api/analytics/daily           → Vendite giornaliere
GET    /api/analytics/monthly         → Trend mensile
GET    /api/analytics/top-products    → Prodotti più venduti
GET    /api/analytics/customers       → Clienti più frequenti
```

### Real-time Subscriptions (WebSocket via Supabase)
```
orders:*          → CRM riceve aggiornamenti live quando arriva un nuovo ordine
inventory:*       → Alert quando stock < soglia minima
```

---

## 4. CRM Dashboard — Features

### 4.1 Dashboard Principale
- **KPI cards**: Ordini oggi, Ricavo oggi, Ordini in attesa, Clienti nuovi
- **Grafico vendite**: Ultimi 7/30/90 giorni
- **Ordini recenti**: Tabella con filtri per stato
- **Alert**: Prodotti in esaurimento, ordini non evasi

### 4.2 Gestione Ordini
- Lista ordini con filtri (stato, data, cliente)
- Dettaglio ordine con prodotti, dati cliente, note
- Cambio stato con un click (pending → confirmed → ready → completed)
- Pulsante "Invia WhatsApp" per conferma al cliente
- Stampa ricevuta

### 4.3 Gestione Clienti
- Lista clienti con ricerca
- Profilo cliente: dati, storico ordini, totale speso, punti fedeltà
- Tag VIP per clienti frequenti
- Export CSV

### 4.4 Gestione Prodotti
- Catalogo prodotti con immagini
- Toggle disponibilità (esaurito/disponibile)
- Gestione giacenza (kg disponibili)
- Prezzi e categorie

### 4.5 Analytics
- Vendite per periodo
- Prodotti più/meno venduti
- Orari di punta
- Clienti top spender
- Report mensile esportabile

### 4.6 Promozioni
- Crea promozioni (sconto %, valida da/a)
- Applica a prodotti specifici
- Notifica WhatsApp ai clienti iscritti

---

## 5. App Mobile — Features

### 5.1 App Cliente (iOS + Android)
- **Catalogo prodotti**: Sfoglia, cerca, filtra per categoria
- **Carrello**: Aggiungi/rimuovi, modifica quantità
- **Checkout**: Scegli ritiro/consegna, orari, note
- **Stato ordine**: Track in real-time (pending → ready)
- **Push notification**: "Il tuo ordine è pronto!"
- **Storico ordini**: Riordina con un tap
- **Profilo**: Dati, indirizzo di consegna, preferenze
- **Punti fedeltà**: Visualizza e riscatta punti

### 5.2 App Staff (solo Sergio/dipendenti)
- **Ordini in arrivo**: Notifica push per nuovo ordine
- **Gestione stato**: Conferma, prepara, segna come pronto
- **Inventario**: Segna prodotti esauriti, aggiorna giacenza
- **Dashboard rapida**: Vendite oggi, ordini pendenti

---

## 6. Integrazione WhatsApp Business API

### Flusso Ordine
```
1. Cliente ordina dal sito/app
2. Backend crea ordine in DB (status: pending)
3. CRM riceve notifica real-time
4. Sergio conferma ordine dal CRM/app staff
5. Backend invia messaggio WhatsApp al cliente:
   "✅ Ordine #1234 confermato! 
    Totale: 24,40€
    Ritiro: Mattina (8:00-12:00)
    Ti aspettiamo!"
6. Quando ordine è pronto → secondo messaggio:
   "🍞 Il tuo ordine è pronto! 
    Vieni a ritirare in negozio."
```

### Template WhatsApp (pre-approvati da Meta)
- `order_confirmed` → Conferma ordine
- `order_ready` → Ordine pronto per ritiro
- `promo_notification` → Promozioni speciali
- `loyalty_update` → Aggiornamento punti fedeltà

---

## 7. Fasi di Sviluppo

### Fase 1 — CRM Base (4-6 settimane)
- Setup Supabase (DB, Auth, Storage)
- Dashboard Next.js con shadcn/ui
- Gestione ordini (CRUD + cambio stato)
- Gestione clienti
- Gestione prodotti
- Analytics base

### Fase 2 — App Mobile Cliente (6-8 settimane)
- Setup Expo + NativeWind
- Catalogo + carrello
- Checkout + creazione ordine
- Push notifications
- Profilo + storico ordini
- Punti fedeltà

### Fase 3 — Integrazione WhatsApp (2-3 settimane)
- Setup WhatsApp Business API
- Template messages
- Automazione conferme
- Notifiche promo

### Fase 4 — App Staff + Avanzate (4-6 settimane)
- App staff per gestione ordini
- Inventario avanzato
- Promozioni
- Report avanzati
- Export dati

---

## 8. Costi Stimati (Mensili)

| Servizio | Piano | Costo/mese |
|----------|-------|------------|
| Supabase | Pro | $25 |
| Vercel (Next.js CRM) | Pro | $20 |
| EAS Build (Expo) | Production | $29 |
| WhatsApp Business API | Conversation-based | ~$0.005/msg |
| Domain + Hosting | — | ~$5 |
| **Totale stimato** | | **~$80-100/mese** |

---

## 9. Prossimi Passi

1. **Confermare lo stack** → Decidere se procedere con Supabase + Expo + Next.js
2. **Setup Supabase project** → Creare il progetto, tabelle, RLS policies
3. **Sviluppare CRM v1** → Dashboard ordini + prodotti + clienti
4. **Integrare sito esistente** → Collegare il form d'ordine del sito al DB Supabase
5. **Sviluppare app mobile** → Expo + NativeWind per iOS/Android
6. **WhatsApp API** → Richiedere accesso Meta Business, configurare template

---

> **Nota**: L'attuale sito web può essere integrato con Supabase gradualmente.
> Basta aggiungere `@supabase/supabase-js` al progetto Vite esistente
> e collegare il form del carrello alle tabelle del database invece di WhatsApp.
