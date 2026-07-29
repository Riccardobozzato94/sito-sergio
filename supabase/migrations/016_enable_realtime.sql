-- ═══════════════════════════════════════════════════════════
-- 016 — Enable Realtime for orders & customers
-- Panificio Da Sergio — CRM Database
--
-- Aggiunge le tabelle orders e customers alla pubblicazione
-- supabase_realtime per permettere notifiche in tempo reale
-- sulla dashboard admin.
-- ═══════════════════════════════════════════════════════════

-- Enable Realtime for orders (new order notifications)
alter publication supabase_realtime add table public.orders;

-- Enable Realtime for customers (new customer notifications)
alter publication supabase_realtime add table public.customers;

-- Enable Realtime for products (when admin updates a product)
alter publication supabase_realtime add table public.products;
