-- ═══════════════════════════════════════════════════════════
-- 002 — Custom Enum Types
-- Panificio Da Sergio — CRM Database
-- ═══════════════════════════════════════════════════════════

-- Order status lifecycle: pending → confirmed → preparing → ready → completed | cancelled
create type order_status as enum (
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'completed',
  'cancelled'
);

-- How the customer receives the order
create type delivery_method as enum (
  'pickup',
  'courier',
  'reservation'
);

-- Product category
create type product_category as enum (
  'pane',
  'dolci',
  'specialita',
  'salato',
  'stagionale'
);

-- CRM user role
create type user_role as enum (
  'admin',    -- Sergio / owner — full access
  'staff',    -- Employee — manage orders, view analytics
  'viewer'    -- Read-only — can view dashboard
);
