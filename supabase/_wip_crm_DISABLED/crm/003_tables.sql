-- ═══════════════════════════════════════════════════════════
-- 003 — Tables
-- Panificio Da Sergio — CRM Database
-- Best practices applied:
--   • bigint generated always as identity for PKs (not uuid for perf)
--   • text instead of varchar (no artificial limits)
--   • timestamptz for all timestamps (timezone-aware)
--   • numeric(10,2) for money (exact decimal, no float)
--   • check constraints for data integrity
--   • NOT NULL where appropriate
--   • generated columns for computed values
-- ═══════════════════════════════════════════════════════════

-- ── Customers ──
create table customers (
  id                bigint generated always as identity primary key,
  name              text not null check (char_length(name) >= 2),
  phone             text,
  email             text,
  notes             text default '',
  loyalty_points    int not null default 0 check (loyalty_points >= 0),
  is_vip            boolean not null default false,
  total_orders      int not null default 0 check (total_orders >= 0),
  total_spent       numeric(10,2) not null default 0 check (total_spent >= 0),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- Unique constraints
  constraint uq_customers_phone unique (phone),
  constraint uq_customers_email unique (email),

  -- At least one contact method
  constraint chk_customers_contact check (phone is not null or email is not null)
);

comment on table customers is 'Clienti del panificio — dati anagrafici, fedeltà, storico';

-- ── Products ──
create table products (
  id                bigint generated always as identity primary key,
  name              text not null check (char_length(name) >= 2),
  slug              text not null unique check (char_length(slug) >= 2),
  description       text not null default '',
  category          product_category not null,
  price             numeric(10,2) not null check (price > 0),
  unit              text not null default 'al kg' check (char_length(unit) >= 2),
  image_url         text,
  is_available      boolean not null default true,
  stock_weight_kg   numeric(8,2) default 0 check (stock_weight_kg >= 0),
  low_stock_threshold_kg numeric(8,2) not null default 1.0 check (low_stock_threshold_kg >= 0),
  display_order     int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table products is 'Catalogo prodotti — prezzo, disponibilità, giacenza';

-- ── Orders ──
create table orders (
  id                bigint generated always as identity primary key,
  customer_id       bigint references customers(id) on delete set null,
  status            order_status not null default 'pending',
  delivery_method   delivery_method not null,
  subtotal          numeric(10,2) not null check (subtotal >= 0),
  shipping          numeric(10,2) not null default 0 check (shipping >= 0),
  total             numeric(10,2) not null check (total >= 0),
  pickup_time       text,
  notes             text default '',
  whatsapp_sent     boolean not null default false,
  whatsapp_message_id text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  completed_at      timestamptz
);

comment on table orders is 'Ordini — stato, totale, modalità di consegna';

-- ── Order Items (line items) ──
create table order_items (
  id                bigint generated always as identity primary key,
  order_id          bigint not null references orders(id) on delete cascade,
  product_id        bigint not null references products(id) on delete restrict,
  quantity          numeric(8,2) not null check (quantity > 0),
  unit_price        numeric(10,2) not null check (unit_price > 0),
  subtotal          numeric(10,2) not null generated always as (quantity * unit_price) stored
);

comment on table order_items is 'Righe d''ordine — prodotto, quantità, prezzo unitario';

-- ── Inventory (daily stock tracking) ──
create table inventory (
  id                bigint generated always as identity primary key,
  product_id        bigint not null references products(id) on delete cascade,
  date              date not null default current_date,
  quantity_in_kg    numeric(8,2) not null default 0 check (quantity_in_kg >= 0),
  quantity_sold_kg  numeric(8,2) not null default 0 check (quantity_sold_kg >= 0),
  wasted_kg         numeric(8,2) not null default 0 check (wasted_kg >= 0),
  restocked_kg      numeric(8,2) not null default 0 check (restocked_kg >= 0),
  notes             text default '',

  -- One inventory record per product per day
  constraint uq_inventory_product_date unique (product_id, date)
);

comment on table inventory is 'Giacenza giornaliera — produzione, vendite, sprechi';

-- ── Promotions ──
create table promotions (
  id                bigint generated always as identity primary key,
  title             text not null check (char_length(title) >= 3),
  description       text not null default '',
  discount_pct      numeric(5,2) not null check (discount_pct > 0 and discount_pct <= 100),
  valid_from        timestamptz not null,
  valid_to          timestamptz not null,
  is_active         boolean not null default true,
  product_ids       bigint[] default '{}',
  created_at        timestamptz not null default now(),

  constraint chk_promo_dates check (valid_to > valid_from)
);

comment on table promotions is 'Promozioni — sconto %, validità, prodotti applicati';

-- ── CRM Users (staff/admin access) ──
create table crm_users (
  id                uuid not null primary key references auth.users(id) on delete cascade,
  role              user_role not null default 'viewer',
  full_name         text not null default '',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table crm_users is 'Utenti CRM — ruoli admin/staff/viewer collegati a Supabase auth';

-- ── Analytics Daily Rollup (materialized daily stats) ──
create table analytics_daily (
  date              date not null primary key,
  total_orders      int not null default 0,
  total_revenue     numeric(10,2) not null default 0,
  avg_order_value   numeric(10,2) not null default 0,
  new_customers     int not null default 0,
  completed_orders  int not null default 0,
  cancelled_orders  int not null default 0
);

comment on table analytics_daily is 'Statistiche giornaliere materializzate — ordinato da trigger';
