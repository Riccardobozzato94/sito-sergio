-- ═══════════════════════════════════════════════════════════
-- 003 — Storage: product-images bucket + RLS
-- Panificio Da Sergio — Sito pubblico (FASE A)
--
-- Il bucket è PRIVATE (non "public" di Supabase) ma le policy
-- RLS permettono la LETTURA PUBBLICA delle immagini (il sito
-- le mostra a tutti i visitatori) mentre l'UPLOAD/DELETE è
-- riservato agli admin autenticati.
--
-- Esegui dopo 001 e 002.
-- ═══════════════════════════════════════════════════════════

-- Crea il bucket privato (public = false)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  false,
  5242880,                                   -- 5 MB max
  array['image/png','image/jpeg','image/webp','image/gif']
)
on conflict (id) do update
  set public = false,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif'];

-- ── RLS sulle tabelle di storage ──
alter table storage.objects enable row level security;

-- Lettura pubblica: chiunque può vedere le immagini prodotto
drop policy if exists "Public can read product-images" on storage.objects;
create policy "Public can read product-images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'product-images');

-- Upload solo admin autenticati
drop policy if exists "Admin can upload product-images" on storage.objects;
create policy "Admin can upload product-images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'product-images');

-- Aggiornamento/eliminazione solo admin autenticati
drop policy if exists "Admin can update product-images" on storage.objects;
create policy "Admin can update product-images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

drop policy if exists "Admin can delete product-images" on storage.objects;
create policy "Admin can delete product-images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'product-images');
