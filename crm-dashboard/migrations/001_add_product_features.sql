-- ═══════════════════════════════════════════════════════════
-- Migration 001 — Aggiunte campi prodotto: featured + allergens
-- Da eseguire in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. Prodotto del giorno / in evidenza
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- Solo un prodotto alla volta può essere "del giorno"
-- (enforced applicativamente, non a livello DB per flessibilità)
CREATE INDEX IF NOT EXISTS idx_products_featured
  ON products (is_featured) WHERE is_featured = true;

-- 2. Allergeni (array di stringhe — EU Regulation 1169/2011)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS allergens text[] NOT NULL DEFAULT '{}';

-- Indice GIN per query sul contenuto dell'array
CREATE INDEX IF NOT EXISTS idx_products_allergens
  ON products USING GIN (allergens);

-- 3. Aggiorna la funzione search_products per includere i nuovi campi
CREATE OR REPLACE FUNCTION search_products(p_query text)
RETURNS TABLE (
  id            int,
  name          text,
  slug          text,
  description   text,
  category      text,
  price         numeric,
  unit          text,
  image_url     text,
  is_available  boolean,
  is_featured   boolean,
  allergens     text[],
  similarity    real
)
LANGUAGE sql STABLE AS $$
  SELECT
    id, name, slug, description, category, price, unit, image_url,
    is_available, is_featured, allergens,
    greatest(
      similarity(name, p_query),
      similarity(description, p_query)
    ) AS similarity
  FROM products
  WHERE
    is_available = true
    AND (
      name        ILIKE '%' || p_query || '%'
      OR description ILIKE '%' || p_query || '%'
    )
  ORDER BY similarity DESC, display_order ASC
  LIMIT 50;
$$;
