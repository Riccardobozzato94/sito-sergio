-- ═══════════════════════════════════════════════════════════
-- 019 — Storage Bucket: gallery-images
-- Panificio Da Sergio — CRM Database
-- Policy RLS per il bucket gallery-images (foto della galleria)
-- ═══════════════════════════════════════════════════════════
-- Nota: il bucket va creato manualmente dal Dashboard:
--   https://supabase.com/dashboard/project/gohhqrbcaqvpkcltazzk/storage/buckets
--   → Crea bucket → Nome: "gallery-images" → Public: OFF
-- ═══════════════════════════════════════════════════════════

-- Policy: TUTTI (anon + authenticated) possono LEGGERE le immagini
create policy "public_read_gallery_images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'gallery-images');

-- Policy: utenti autenticati possono UPLOADARE file
create policy "auth_upload_gallery_images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'gallery-images');

-- Policy: utenti autenticati possono ELIMINARE file
create policy "auth_delete_gallery_images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'gallery-images');

-- Policy: utenti autenticati possono AGGIORNARE file
create policy "auth_update_gallery_images"
on storage.objects
for update
to authenticated
using (bucket_id = 'gallery-images')
with check (bucket_id = 'gallery-images');
