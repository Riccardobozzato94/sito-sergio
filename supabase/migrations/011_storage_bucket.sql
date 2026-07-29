-- ═══════════════════════════════════════════════════════════
-- 011 — Storage Bucket: product-images
-- Panificio Da Sergio — CRM Database
-- Policy RLS per il bucket product-images
-- ═══════════════════════════════════════════════════════════
-- Nota: il bucket va creato manualmente dal Dashboard:
--   https://supabase.com/dashboard/project/gohhqrbcaqvpkcltazzk/storage/buckets
--   → Crea bucket → Nome: "product-images" → Public: OFF
-- ═══════════════════════════════════════════════════════════

-- Policy: TUTTI (anon + authenticated) possono LEGGERE le immagini
-- Necessario per visualizzare le foto dei prodotti sul sito pubblico
create policy "public_read_product_images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'product-images');

-- Policy: utenti autenticati possono UPLOADARE file
create policy "auth_upload_product_images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'product-images');

-- Policy: utenti autenticati possono ELIMINARE file
create policy "auth_delete_product_images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-images');

-- Policy: utenti autenticati possono AGGIORNARE file
create policy "auth_update_product_images"
on storage.objects
for update
to authenticated
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');
