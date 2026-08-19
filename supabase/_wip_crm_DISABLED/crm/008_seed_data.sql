-- ═══════════════════════════════════════════════════════════
-- 008 — Seed Data
-- Panificio Da Sergio — CRM Database
-- Initial product catalog (matches website config.js)
-- ═══════════════════════════════════════════════════════════

-- ── Products ──
insert into products (name, slug, description, category, price, unit, image_url, display_order) values
  ('Bussolà', 'bussola',
   'Frollini artigianali a forma di anello, friabili e aromatici. Un dolce tipico di Chioggia, perfetto per la colazione o il tè.',
   'dolci', 2.20, 'al pacco', '/images/bussola.jpg', 1),

  ('Biscotti alle Mandorle', 'biscotti-alle-mandorle',
   'Biscotti croccanti con mandorle tostate e uvetta. Ricetta tradizionale veneta, ideali per accompagnare il caffè.',
   'dolci', 20.00, 'al kg', '/images/biscotti-mandorle.jpg', 2),

  ('Torta della Nonna', 'torta-della-nonna',
   'Soffice torta artigianale con crema pasticcera, ricoperta di zucchero a velo e mandorle tostate. Un classico della pasticceria italiana.',
   'dolci', 20.00, 'al kg', '/images/torta-nonna.jpg', 3),

  ('Biscotti a S', 'biscotti-a-s',
   'Classici biscotti friabili a forma di S, ideali per la colazione. Semplici, genuini e irresistibili.',
   'dolci', 20.00, 'al kg', '/images/biscotti-s.jpg', 4),

  ('Torte di Mandorla', 'torte-di-mandorla',
   'Torta morbida con mandorle pregiate del territorio Veneto. Ricetta tradizionale, perfetta per ogni occasione.',
   'dolci', 20.00, 'al kg', '/images/torte-mandorla.jpg', 5),

  ('Papini', 'papini',
   'Deliziosi frollini dorati, croccanti all''esterno e morbidi all''interno. Specialità artigianale difficile da trovare.',
   'dolci', 20.00, 'al kg', '/images/papini.jpg', 6),

  ('Pevarini', 'pevarini',
   'Classici biscotti friabili dalla forma inconfondibile. Dolce tipico veneziano, tradizione e gusto in ogni morso.',
   'dolci', 20.00, 'al kg', '/images/pevarini.jpg', 7);

-- ── Default admin user (run this after creating Supabase auth user) ──
-- Replace 'YOUR-USER-UUID' with the actual auth.users UUID
-- insert into crm_users (id, role, full_name)
-- values ('YOUR-USER-UUID', 'admin', 'Sergio');

-- ── Initial analytics entry for today ──
insert into analytics_daily (date)
values (current_date)
on conflict (date) do nothing;
