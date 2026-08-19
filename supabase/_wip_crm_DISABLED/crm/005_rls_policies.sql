-- ═══════════════════════════════════════════════════════════
-- 005 — Row-Level Security Policies
-- Panificio Da Sergio — CRM Database
-- Best practices applied:
--   • RLS enabled on ALL tenant tables
--   • (select auth.uid()) pattern — called once, cached (100x faster)
--   • Role-based access via crm_users table
--   • Public read for products (website needs it)
--   • Public write only for orders (website checkout)
--   • Admin bypass for all policies
-- ═══════════════════════════════════════════════════════════

-- ── Helper function: check if user has CRM access ──
create or replace function public.has_crm_access()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.crm_users
    where id = (select auth.uid())
  );
$$;

-- ── Helper function: check if user is admin ──
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.crm_users
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ═══════════════════════════════════════════════════════════
-- Customers
-- ═══════════════════════════════════════════════════════════
alter table customers enable row level security;

-- CRM users can view all customers
create policy "crm_users_view_customers" on customers
  for select
  to authenticated
  using ((select public.has_crm_access()));

-- CRM users can insert/update customers
create policy "crm_users_manage_customers" on customers
  for all
  to authenticated
  using ((select public.has_crm_access()))
  with check ((select public.has_crm_access()));

-- Public can insert customers (website checkout)
create policy "public_insert_customers" on customers
  for insert
  to anon, authenticated
  with check (true);

-- ═══════════════════════════════════════════════════════════
-- Products
-- ═══════════════════════════════════════════════════════════
alter table products enable row level security;

-- Public read (website catalog)
create policy "public_read_products" on products
  for select
  to anon, authenticated
  using (is_available = true);

-- CRM users can see all products (including unavailable)
create policy "crm_read_all_products" on products
  for select
  to authenticated
  using ((select public.has_crm_access()));

-- Only admin can modify products
create policy "admin_manage_products" on products
  for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ═══════════════════════════════════════════════════════════
-- Orders
-- ═══════════════════════════════════════════════════════════
alter table orders enable row level security;

-- CRM users can view all orders
create policy "crm_view_orders" on orders
  for select
  to authenticated
  using ((select public.has_crm_access()));

-- CRM users can update orders (change status, notes)
create policy "crm_update_orders" on orders
  for update
  to authenticated
  using ((select public.has_crm_access()))
  with check ((select public.has_crm_access()));

-- Public can insert orders (website checkout)
create policy "public_insert_orders" on orders
  for insert
  to anon, authenticated
  with check (true);

-- Public can view their own orders (via phone match)
create policy "public_view_own_orders" on orders
  for select
  to anon, authenticated
  using (
    customer_id in (
      select id from customers
      where phone = current_setting('request.jwt.claims', true)::json->>'phone'
    )
  );

-- ═══════════════════════════════════════════════════════════
-- Order Items
-- ═══════════════════════════════════════════════════════════
alter table order_items enable row level security;

-- CRM users can view order items
create policy "crm_view_order_items" on order_items
  for select
  to authenticated
  using ((select public.has_crm_access()));

-- Public can insert order items (website checkout)
create policy "public_insert_order_items" on order_items
  for insert
  to anon, authenticated
  with check (true);

-- ═══════════════════════════════════════════════════════════
-- Inventory
-- ═══════════════════════════════════════════════════════════
alter table inventory enable row level security;

-- Only CRM users can view/modify inventory
create policy "crm_manage_inventory" on inventory
  for all
  to authenticated
  using ((select public.has_crm_access()))
  with check ((select public.has_crm_access()));

-- ═══════════════════════════════════════════════════════════
-- Promotions
-- ═══════════════════════════════════════════════════════════
alter table promotions enable row level security;

-- Public can view active promotions
create policy "public_read_active_promotions" on promotions
  for select
  to anon, authenticated
  using (is_active = true and valid_from <= now() and valid_to >= now());

-- CRM users can view all promotions
create policy "crm_read_all_promotions" on promotions
  for select
  to authenticated
  using ((select public.has_crm_access()));

-- Only admin can manage promotions
create policy "admin_manage_promotions" on promotions
  for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ═══════════════════════════════════════════════════════════
-- Analytics Daily (read-only for CRM users)
-- ═══════════════════════════════════════════════════════════
alter table analytics_daily enable row level security;

-- CRM users can view analytics
create policy "crm_read_analytics" on analytics_daily
  for select
  to authenticated
  using ((select public.has_crm_access()));

-- ═══════════════════════════════════════════════════════════
-- CRM Users (only admins can manage)
-- ═══════════════════════════════════════════════════════════
alter table crm_users enable row level security;

-- CRM users can view their own profile
create policy "users_view_own_profile" on crm_users
  for select
  to authenticated
  using (id = (select auth.uid()));

-- Only admins can view all users
create policy "admin_view_all_users" on crm_users
  for select
  to authenticated
  using ((select public.is_admin()));

-- Only admins can insert/update/delete users
create policy "admin_manage_users" on crm_users
  for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
