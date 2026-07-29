-- ═══════════════════════════════════════════════════════════
-- 011 — Storage Bucket: product-images
-- Panificio Da Sergio — CRM Database
-- Crea il bucket product-images e imposta le policy RLS
-- ═══════════════════════════════════════════════════════════
-- ATTENZIONE: Se il bucket esiste già, la create_bucket fallisce.
-- Puoi ignorare l'errore "Duplicate" o creare il bucket manualmente da:
--   https://supabase.com/dashboard/project/gohhqrbcaqvpkcltazzk/storage/buckets
--   → Crea bucket → Nome: "product-images" → Public: OFF
-- ═══════════════════════════════════════════════════════════

-- Crea il bucket se non esiste (usa la funzione interna di Supabase)
-- Nota: può fallire con "Duplicate" se già creato manualmente
select storage.create_bucket(
  'product-images',                          -- id bucket
  'product-images',                          -- nome
  jsonb_build_object('public', false)        -- opzioni: non pubblico (RLS gestita da policy)
);

-- ═══════════════════════════════════════════════════════════
-- RLS sul bucket product-images
-- ═══════════════════════════════════════════════════════════
-- Policy: tutti (anon + authenticated) possono LEGGERE le immagini
-- Necessario per visualizzare le foto sul sito pubblico
create policy "public_read_product_images"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'product-images'
);

-- Policy: utenti CRM con ruolo admin/staff possono UPLOADARE file
create policy "crm_upload_product_images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.crm_users
    where id = (select auth.uid())
    and role in ('admin', 'staff')
  )
);

-- Policy: utenti CRM con ruolo admin/staff possono AGGIORNARE file
create policy "crm_update_product_images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.crm_users
    where id = (select auth.uid())
    and role in ('admin', 'staff')
  )
)
with check (
  bucket_id = 'product-images'
);

-- Policy: utenti CRM con ruolo admin/staff possono ELIMINARE file
create policy "crm_delete_product_images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.crm_users
    where id = (select auth.uid())
    and role in ('admin', 'staff')
  )
);
