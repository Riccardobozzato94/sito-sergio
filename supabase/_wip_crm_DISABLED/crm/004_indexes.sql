-- ═══════════════════════════════════════════════════════════
-- 004 — Indexes
-- Panificio Da Sergio — CRM Database
-- Best practices applied:
--   • ALL foreign keys indexed (Postgres does NOT auto-index FKs)
--   • Partial indexes for common filters (smaller + faster)
--   • Composite indexes for common query patterns
--   • pg_trgm indexes for text search
-- ═══════════════════════════════════════════════════════════

-- ── FK Indexes (CRITICAL — Postgres does NOT auto-index FKs) ──

create index idx_orders_customer_id on orders (customer_id);
create index idx_order_items_order_id on order_items (order_id);
create index idx_order_items_product_id on order_items (product_id);
create index idx_inventory_product_id on inventory (product_id);

-- ── Partial Indexes (highly selective queries) ──

-- Pending orders — only index rows that need attention
create index idx_orders_pending on orders (created_at asc)
where status = 'pending';

-- Active orders (not completed/cancelled) — CRM dashboard default view
create index idx_orders_active on orders (status, created_at desc)
where status not in ('completed', 'cancelled');

-- Available products — catalog queries only care about available items
create index idx_products_available on products (display_order, category)
where is_available = true;

-- Active promotions — only current/future promos matter
create index idx_promotions_active on promotions (valid_from, valid_to)
where is_active = true;

-- ── Composite Indexes (common query patterns) ──

-- Orders by date range + status (CRM dashboard, analytics)
create index idx_orders_date_status on orders (created_at desc, status);

-- Orders by customer + date (customer history)
create index idx_orders_customer_date on orders (customer_id, created_at desc);

-- Inventory by date range for product reports
create index idx_inventory_date on inventory (date desc, product_id);

-- ── Search Indexes (pg_trgm for text search) ──

-- Customer name search
create index idx_customers_name_trgm on customers using gin (name gin_trgm_ops);

-- Product name search
create index idx_products_name_trgm on products using gin (name gin_trgm_ops);

-- ── Normal Indexes ──

-- VIP customers for targeted promotions
create index idx_customers_vip on customers (is_vip) where is_vip = true;

-- CRM users by role
create index idx_crm_users_role on crm_users (role);
