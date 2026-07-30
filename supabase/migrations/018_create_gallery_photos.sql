-- ═══════════════════════════════════════════════════════════
-- 018 — Gallery Photos Table
-- Panificio Da Sergio — CRM Database
-- Memorizza le foto della galleria "La Nostra Arte Artigianale"
-- con supporto per upload/rimozione dalla dashboard admin
-- ═══════════════════════════════════════════════════════════

-- ── Gallery Photos ──
create table gallery_photos (
  id                bigint generated always as identity primary key,
  image_url         text not null,
  alt_it            text not null default '',
  alt_en            text not null default '',
  sort_order        int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table gallery_photos is 'Foto della galleria "La Nostra Arte Artigianale" — gestibili dalla dashboard admin';

-- Index per ordinamento
create index idx_gallery_photos_sort on gallery_photos(sort_order);

-- ═══════════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════════

-- RLS: abilita row level security
alter table gallery_photos enable row level security;

-- Policy: TUTTI (anon + authenticated) possono LEGGERE
create policy "public_read_gallery_photos"
on gallery_photos
for select
to anon, authenticated
using (true);

-- Policy: solo utenti autenticati possono INSERIRE
create policy "auth_insert_gallery_photos"
on gallery_photos
for insert
to authenticated
with check (true);

-- Policy: solo utenti autenticati possono MODIFICARE
create policy "auth_update_gallery_photos"
on gallery_photos
for update
to authenticated
using (true)
with check (true);

-- Policy: solo utenti autenticati possono ELIMINARE
create policy "auth_delete_gallery_photos"
on gallery_photos
for delete
to authenticated
using (true);

-- ═══════════════════════════════════════════════════════════
-- Seed: migra le foto statiche esistenti nel DB
-- ═══════════════════════════════════════════════════════════
insert into gallery_photos (image_url, alt_it, alt_en, sort_order) values
  ('/images/IMG-20260415-WA0000.jpg', 'Pane artigianale appena sfornato — Panificio Da Sergio Chioggia', 'Freshly baked artisan bread — Panificio Da Sergio Chioggia', 1),
  ('/images/IMG-20260415-WA0001.jpg', 'Prodotti da forno tradizionali — Panificio artigianale Chioggia', 'Traditional bakery products — Artisan bakery Chioggia', 2),
  ('/images/IMG-20260415-WA0002.jpg', 'Dolci tipici veneziani — Panificio Da Sergio', 'Traditional Venetian sweets — Panificio Da Sergio', 3),
  ('/images/IMG-20260415-WA0007.jpg', 'Forno e lavorazione artigianale — Panificio Da Sergio Chioggia', 'Oven and artisan processing — Panificio Da Sergio Chioggia', 4),
  ('/images/IMG-20260415-WA0008.jpg', 'Biscotti e dolci artigianali — Panificio Da Sergio Chioggia', 'Artisan biscuits and pastries — Panificio Da Sergio Chioggia', 5),
  ('/images/IMG-20260411-WA0005.jpg', 'Specialità del Panificio Da Sergio — Chioggia', 'Specialties of Panificio Da Sergio — Chioggia', 6),
  ('/images/IMG-20260411-WA0006.jpg', 'Pane e prodotti tipici — Panificio Da Sergio', 'Bread and typical products — Panificio Da Sergio', 7),
  ('/images/IMG-20260410-WA0013.jpg', 'Dolci e biscotti artigianali — Panificio Da Sergio Chioggia', 'Artisan pastries and biscuits — Panificio Da Sergio Chioggia', 8),
  ('/images/IMG-20260415-WA0015.jpg', 'Interno del Panificio Da Sergio — Chioggia', 'Inside Panificio Da Sergio — Chioggia', 9);
