-- ═══════════════════════════════════════════════════════════
-- MIGRATION: Orders + Site Content + RLS
-- Run this in Supabase SQL Editor (service_role required)
-- ═══════════════════════════════════════════════════════════

-- 1. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2) NOT NULL,
  shipping DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  delivery_method TEXT DEFAULT 'pickup',
  pickup_time TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'unpaid',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Anyone can insert an order (checkout)
CREATE POLICY "Anyone can insert orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Only authenticated admin can read/update orders
CREATE POLICY "Admin can read orders" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can update orders" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 2. SITE CONTENT TABLE (editable texts)
CREATE TABLE IF NOT EXISTS site_content (
  id SERIAL PRIMARY KEY,
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value_it TEXT NOT NULL DEFAULT '',
  value_en TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section, key)
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read site content
CREATE POLICY "Anyone can read site_content" ON site_content
  FOR SELECT USING (true);

-- Only admin can write
CREATE POLICY "Admin can insert site_content" ON site_content
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin can update site_content" ON site_content
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 3. PRODUCTS RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are insertable by authenticated users" ON products;
DROP POLICY IF EXISTS "Products are updatable by authenticated users" ON products;
DROP POLICY IF EXISTS "Products are deletable by authenticated users" ON products;

CREATE POLICY "Anyone can read products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Admin can insert products" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin can update products" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete products" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- 4. ADD display_order column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE products ADD COLUMN display_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- 5. Seed site_content with current i18n values (so admin panel can edit them)
INSERT INTO site_content (section, key, value_it, value_en) VALUES
  ('hero', 'slogan', 'L''autentico sapore di Chioggia', 'The authentic taste of Chioggia'),
  ('hero', 'description', 'Ogni mattina, prima dell''alba, il nostro forno si accende. Impastiamo a mano, con ingredienti selezionati e ricette di famiglia che si tramandano da generazioni. Pane, biscotti, dolci — il sapore vero di Chioggia.', 'Every morning before dawn, our oven fires up. We knead by hand, with selected ingredients and family recipes passed down through generations. Bread, cookies, sweets — the true taste of Chioggia.'),
  ('about', 'story_p1', 'Era il 1977 quando Sergio aprì il suo panificio nel cuore di Chioggia, con una ricetta che aveva imparato da suo padre e la voglia di portare sulla tavola di tutti il sapore autentico del pane artigianale. La Laguna rifletteva i colori del mattino e, come il sole sorgeva, il forno si accendeva per la prima volta.', 'It was 1977 when Sergio opened his bakery in the heart of Chioggia, with a recipe learned from his father and the desire to bring the authentic taste of artisan bread to everyone''s table. The lagoon reflected the morning colors and, as the sun rose, the oven was lit for the first time.'),
  ('about', 'story_p2', 'Quasi cinquant''anni dopo, le stesse mani — un po'' più segnate dal tempo — continuano a impastare con la stessa cura. Il bussolà, i pevarini, la torta della nonna: ogni prodotto racconta un pezzo della nostra terra, il Veneto. La laguna, le isole, la tradizione che non cambia perché è già perfetta così.', 'Nearly fifty years later, the same hands — a little more marked by time — continue to knead with the same care. The bussolà, pevarini, torta della nonna: each product tells a piece of our land, Veneto. The lagoon, the islands, tradition that doesn''t change because it''s already perfect.'),
  ('footer', 'tagline', 'Dal nostro forno alla vostra tavola', 'From our oven to your table')
ON CONFLICT (section, key) DO NOTHING;
