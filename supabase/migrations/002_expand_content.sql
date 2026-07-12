-- ════════════════════════════════════════════════════════════
-- MIGRATION 002: Expand site_content + new site_settings table
-- Run in Supabase SQL Editor (service_role required)
-- ════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────
-- PART 1: Add many more keys to site_content for ALL sections
-- ────────────────────────────────────────────────────────────

-- Hero
INSERT INTO site_content (section, key, value_it, value_en) VALUES
  ('hero', 'cta_products', 'SCOPRI I PRODOTTI', 'DISCOVER PRODUCTS'),
  ('hero', 'cta_whatsapp', 'ORDINA SU WHATSAPP', 'ORDER ON WHATSAPP'),
  ('hero', 'since', 'Dal', 'Since')
ON CONFLICT (section, key) DO NOTHING;

-- Navigation
INSERT INTO site_content (section, key, value_it, value_en) VALUES
  ('nav', 'home', 'Home', 'Home'),
  ('nav', 'prodotti', 'Prodotti', 'Products'),
  ('nav', 'chi_siamo', 'Chi Siamo', 'About Us'),
  ('nav', 'contatti', 'Contatti', 'Contact')
ON CONFLICT (section, key) DO NOTHING;

-- How To Order
INSERT INTO site_content (section, key, value_it, value_en) VALUES
  ('howto', 'title', 'Come Ordinare', 'How to Order'),
  ('howto', 'subtitle', 'Scegliete i prodotti, contattate Sergio su WhatsApp e passate a ritirare.', 'Pick your products, message Sergio on WhatsApp, and pick them up.'),
  ('howto', 'step1_title', 'Scegli i Prodotti', 'Choose Products'),
  ('howto', 'step1_desc', 'Perdetevi tra le nostre specialità. Ogni prodotto ha una storia.', 'Lose yourself in our specialties. Every product has a story.'),
  ('howto', 'step2_title', 'Invia su WhatsApp', 'Send via WhatsApp'),
  ('howto', 'step2_desc', 'Un clic e l''ordine arriva direttamente a Sergio. Preparerà tutto con cura.', 'One click and your order goes straight to Sergio. He''ll prepare everything with care.'),
  ('howto', 'step3_title', 'Ritira in Negozio', 'Pick Up in Store'),
  ('howto', 'step3_desc', 'Passate a trovarci in Calle Ponte Caneva 626. Il profumo vi guiderà.', 'Come see us at Calle Ponte Caneva 626. The scent will guide you.')
ON CONFLICT (section, key) DO NOTHING;

-- Products section
INSERT INTO site_content (section, key, value_it, value_en) VALUES
  ('products', 'title', 'Le Nostre Specialità', 'Our Specialties'),
  ('products', 'subtitle', 'Lasciatevi guidare dal profumo: pane fragrante, biscotti tradizionali e dolci che sanno di casa', 'Follow the scent: fragrant bread, traditional cookies, and sweets that taste like home'),
  ('products', 'tradition', 'anni di tradizione artigianale', 'years of artisan tradition'),
  ('products', 'all', 'Tutti', 'All'),
  ('products', 'bread', 'Pane', 'Bread'),
  ('products', 'sweets', 'Dolci', 'Sweets'),
  ('products', 'specialty', 'Specialità', 'Specialties'),
  ('products', 'add_cart', 'Aggiungi al Carrello', 'Add to Cart'),
  ('products', 'added', '✓ Aggiunto!', '✓ Added!'),
  ('products', 'empty', 'Nessun prodotto in questa categoria', 'No products in this category')
ON CONFLICT (section, key) DO NOTHING;

-- About (additional)
INSERT INTO site_content (section, key, value_it, value_en) VALUES
  ('about', 'title', 'Chi Siamo', 'About Us'),
  ('about', 'subtitle', 'La storia di una famiglia che ha fatto del pane la sua vita. Dal 1977.', 'The story of a family who made bread their life. Since 1977.'),
  ('about', 'story_title', 'La Nostra Storia', 'Our Story'),
  ('about', 'story_p3', 'Non troverete conservanti nei nostri prodotti. Non troverete fretta nei nostri gesti. Solo ingredienti veri, lievitazione lenta e il tempo che serve — perché il pane buono non si può imbrogliare.', 'You won''t find preservatives in our products. You won''t find hurry in our movements. Only real ingredients, slow fermentation, and all the time it takes — because good bread cannot be rushed.'),
  ('about', 'values_title', 'I Nostri Valori', 'Our Values'),
  ('about', 'value1_title', 'Tradizione', 'Tradition'),
  ('about', 'value1_desc', 'Ricette che non cambiano da quasi cinquant''anni. Perché la vera tradizione non si migliora: si custodisce.', 'Recipes unchanged for nearly fifty years. Because true tradition isn''t improved — it''s cherished.'),
  ('about', 'value2_title', 'Qualità', 'Quality'),
  ('about', 'value2_desc', 'Solo ingredienti locali, selezionati uno a uno. Lavorazione interamente artigianale, zero conservanti.', 'Only local ingredients, selected one by one. Entirely artisan craftsmanship, zero preservatives.'),
  ('about', 'value3_title', 'Passione', 'Passion'),
  ('about', 'value3_desc', 'Ci svegliamo ogni mattina con la stessa voglia del primo giorno: sfornare il pane più buono possibile.', 'We wake up every morning with the same fire as day one: to bake the best bread possible.'),
  ('about', 'process_title', 'Il Nostro Processo', 'Our Process'),
  ('about', 'process_step1', 'Selezione ingredienti', 'Ingredient selection'),
  ('about', 'process_step2', 'Impasto a mano', 'Hand kneading'),
  ('about', 'process_step3', 'Lievitazione naturale', 'Natural leavening'),
  ('about', 'process_step4', 'Cottura tradizionale', 'Traditional baking'),
  ('about', 'quote_text', 'Ogni filone, ogni biscotto, ogni dolce che esce dal nostro forno porta con sé un pezzo di Chioggia, un pezzo di famiglia, un pezzo di cuore. Dal 1977, impastiamo con amore quello che portate in tavola.', 'Every loaf, every cookie, every sweet that comes out of our oven carries a piece of Chioggia, a piece of family, a piece of heart. Since 1977, we knead with love everything you bring to your table.'),
  ('about', 'quote_author', 'Sergio', 'Sergio')
ON CONFLICT (section, key) DO NOTHING;

-- Gallery
INSERT INTO site_content (section, key, value_it, value_en) VALUES
  ('gallery', 'title', 'La Nostra Arte Artigianale', 'Our Artisan Craft'),
  ('gallery', 'subtitle', 'Ogni foto racconta un momento di cura, di attenzione, di amore per l''artigianalità.', 'Every photo captures a moment of care, attention, and love for craftsmanship.')
ON CONFLICT (section, key) DO NOTHING;

-- Reviews
INSERT INTO site_content (section, key, value_it, value_en) VALUES
  ('reviews', 'title', 'Cosa Dicono i Nostri Clienti', 'What Our Customers Say'),
  ('reviews', 'subtitle', 'Il miglior premio? Vedervi sorridere mentre assaggiate le nostre specialità', 'The best reward? Seeing you smile as you taste our specialties'),
  ('reviews', 'count', 'recensioni', 'reviews'),
  ('reviews', 'from', 'Recensioni da', 'Reviews from'),
  ('reviews', 'tripadvisor', 'TripAdvisor', 'TripAdvisor'),
  ('reviews', 'google', 'Google', 'Google'),
  ('reviews', 'see_all_ta', 'Vedi tutte su TripAdvisor', 'See all on TripAdvisor'),
  ('reviews', 'see_all_google', 'Vedi tutte su Google', 'See all on Google')
ON CONFLICT (section, key) DO NOTHING;

-- Contacts
INSERT INTO site_content (section, key, value_it, value_en) VALUES
  ('contacts', 'title', 'Contattaci', 'Contact Us'),
  ('contacts', 'subtitle', 'Venite a trovarci in Calle Ponte Caneva 626, nel cuore di Chioggia. O scriveteci su WhatsApp.', 'Come find us at Calle Ponte Caneva 626, in the heart of Chioggia. Or message us on WhatsApp.'),
  ('contacts', 'address_label', 'Indirizzo', 'Address'),
  ('contacts', 'phone_label', 'Telefono', 'Phone'),
  ('contacts', 'email_label', 'Email', 'Email'),
  ('contacts', 'whatsapp_label', 'WhatsApp', 'WhatsApp'),
  ('contacts', 'write', 'Scrivici su WhatsApp →', 'Message us on WhatsApp →'),
  ('contacts', 'map_title', 'Dove Siamo', 'Find Us'),
  ('contacts', 'maps_link', 'Apri in Google Maps →', 'Open in Google Maps →')
ON CONFLICT (section, key) DO NOTHING;

-- Hours section
INSERT INTO site_content (section, key, value_it, value_en) VALUES
  ('hours', 'section_title', 'Orari', 'Hours'),
  ('hours', 'subtitle', 'Venite a trovarci — il profumo del pane fresco vi accoglierà', 'Come find us — the scent of fresh bread will welcome you'),
  ('hours', 'open', 'Aperto', 'Open'),
  ('hours', 'closed', 'Chiuso', 'Closed'),
  ('hours', 'today', 'Oggi', 'Today')
ON CONFLICT (section, key) DO NOTHING;

-- Footer (additional)
INSERT INTO site_content (section, key, value_it, value_en) VALUES
  ('footer', 'contacts_title', 'CONTATTI', 'CONTACTS'),
  ('footer', 'social_title', 'SEGUICI', 'FOLLOW US'),
  ('footer', 'hours_title', 'ORARI DI APERTURA', 'OPENING HOURS'),
  ('footer', 'newsletter_title', 'NEWSLETTER', 'NEWSLETTER'),
  ('footer', 'newsletter_text', 'Unitevi alla famiglia Panificio Da Sergio: novità, promozioni e storie dalla nostra cucina, direttamente su WhatsApp.', 'Join the Panificio Da Sergio family: news, promotions, and stories from our kitchen, straight to WhatsApp.'),
  ('footer', 'newsletter_btn', 'Scrivici su WhatsApp', 'Message us on WhatsApp'),
  ('footer', 'since', 'Dal', 'Since'),
  ('footer', 'copyright', 'Tutti i diritti riservati.', 'All rights reserved.')
ON CONFLICT (section, key) DO NOTHING;

-- Cart
INSERT INTO site_content (section, key, value_it, value_en) VALUES
  ('cart', 'title', 'Il Tuo Ordine', 'Your Order'),
  ('cart', 'empty_title', 'Il carrello è vuoto... per ora!', 'Cart is empty... for now!'),
  ('cart', 'empty_text', 'Forza, riempilo di bontà!', 'Go on, fill it with goodness!'),
  ('cart', 'name_placeholder', 'Il tuo nome', 'Your name'),
  ('cart', 'phone_placeholder', 'Numero di telefono', 'Phone number'),
  ('cart', 'pickup_label', 'Quando ritiri?', 'When will you pick up?'),
  ('cart', 'pickup_morning', 'Mattina (8:00–12:00)', 'Morning (8:00–12:00)'),
  ('cart', 'pickup_afternoon', 'Pomeriggio (14:00–19:00)', 'Afternoon (14:00–19:00)'),
  ('cart', 'pickup_store', 'Passo io in negozio', 'I''ll come to the shop'),
  ('cart', 'notes_placeholder', 'Allergie, preferenze, quantità speciali — diteci tutto, Sergio legge ogni nota', 'Allergies, preferences, special quantities — tell us everything, Sergio reads every note'),
  ('cart', 'total', 'Totale Stimato', 'Estimated Total'),
  ('cart', 'whatsapp_btn', 'Invia Ordine su WhatsApp', 'Send Order via WhatsApp'),
  ('cart', 'alert_required', 'Servono nome e telefono per mandare l''ordine a Sergio.', 'We need your name and phone to send the order to Sergio.'),
  ('cart', 'added_toast', '✓ Aggiunto al carrello!', '✓ Added to cart!')
ON CONFLICT (section, key) DO NOTHING;

-- SEO
INSERT INTO site_content (section, key, value_it, value_en) VALUES
  ('seo', 'meta_title', 'Panificio Da Sergio — Pane artigianale e dolci tradizionali a Chioggia', 'Panificio Da Sergio — Artisan bread and traditional sweets in Chioggia'),
  ('seo', 'meta_description', 'Dal 1977 il Panificio Da Sergio porta sulla tua tavola il vero sapore di Chioggia: pane artigianale, bussolà, pevarini e dolci tradizionali veneti. Impasto a mano, ingredienti locali, nessun conservante.', 'Since 1977, Panificio Da Sergio brings the true taste of Chioggia to your table: artisan bread, bussolà, pevarini, and traditional Venetian sweets. Hand-kneaded, local ingredients, no preservatives.'),
  ('seo', 'meta_keywords', 'panificio Chioggia, pane artigianale, bussolà, pevarini, dolci veneti, forno a legna, tradizione veneta', 'bakery Chioggia, artisan bread, bussolà, pevarini, Venetian sweets, wood-fired oven, Venetian tradition')
ON CONFLICT (section, key) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- PART 2: Create site_settings table (non-bilingual configs)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'text',
  label TEXT NOT NULL DEFAULT '',
  section TEXT NOT NULL DEFAULT 'general',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read site_settings" ON site_settings;
DROP POLICY IF EXISTS "Admin can insert site_settings" ON site_settings;
DROP POLICY IF EXISTS "Admin can update site_settings" ON site_settings;

CREATE POLICY "Anyone can read site_settings" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admin can insert site_settings" ON site_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin can update site_settings" ON site_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Seed defaults
INSERT INTO site_settings (key, value, type, label, section) VALUES
  ('social_facebook', 'https://www.facebook.com/p/Panificio-da-Sergio-Chioggia-100057410531710', 'url', 'Facebook URL', 'social'),
  ('social_instagram', '', 'url', 'Instagram URL', 'social'),
  ('social_tripadvisor', 'https://www.tripadvisor.it/Restaurant_Review-g194738-d7005470-Reviews-Panificio_da_Sergio-Chioggia_Veneto.html', 'url', 'TripAdvisor URL', 'social'),
  ('social_google_reviews', 'https://www.google.com/search?q=Panificio+Da+Sergio+Recensioni', 'url', 'Google Reviews URL', 'social'),
  ('social_whatsapp', '39041401200', 'text', 'Numero WhatsApp (con codice paese, senza +)', 'social')
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_settings (key, value, type, label, section) VALUES
  ('business_address', 'Calle Ponte Caneva 626, 30015 Chioggia (VE)', 'text', 'Indirizzo', 'business'),
  ('business_phone', '+39 041401200', 'text', 'Telefono', 'business'),
  ('business_email', 'info@panificiodasergio.it', 'text', 'Email', 'business'),
  ('business_website', 'www.panificiodasergio.com', 'text', 'Sito Web', 'business'),
  ('business_hours_mon_fri', '10:00 - 19:00', 'text', 'Orario Lun-Ven', 'business'),
  ('business_hours_sat', '10:00 - 19:00', 'text', 'Orario Sabato', 'business'),
  ('business_hours_sun', 'Chiuso', 'text', 'Orario Domenica', 'business')
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_settings (key, value, type, label, section) VALUES
  ('analytics_ga_id', '', 'text', 'Google Analytics ID (es. G-XXXXXXXXXX)', 'analytics'),
  ('analytics_meta_pixel', '', 'text', 'Meta Pixel ID (es. 1234567890)', 'analytics'),
  ('analytics_cookie_consent', 'true', 'boolean', 'Richiedi consenso cookie', 'analytics')
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_settings (key, value, type, label, section) VALUES
  ('seo_og_image', '/images/og-image.jpg', 'text', 'Immagine Open Graph (condivisione social)', 'seo'),
  ('seo_og_title', 'Panificio Da Sergio — Dal 1977 a Chioggia', 'text', 'Titolo Open Graph', 'seo'),
  ('seo_og_description', 'Il vero sapore di Chioggia: pane artigianale, bussolà e dolci tradizionali.', 'text', 'Descrizione Open Graph', 'seo')
ON CONFLICT (key) DO NOTHING;
