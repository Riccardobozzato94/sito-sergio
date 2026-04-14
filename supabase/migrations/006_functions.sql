-- ═══════════════════════════════════════════════════════════
-- 006 — Functions
-- Panificio Da Sergio — CRM Database
-- Functions for: loyalty, analytics, order processing, search
-- ═══════════════════════════════════════════════════════════

-- ── Auto-update updated_at timestamp ──
create or replace function public.update_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Loyalty: add points to customer ──
create or replace function public.add_loyalty_points(p_customer_id bigint, p_points int)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update customers
  set loyalty_points = loyalty_points + p_points
  where id = p_customer_id;
end;
$$;

-- ── Loyalty: redeem points for discount ──
create or replace function public.redeem_loyalty_points(p_customer_id bigint, p_points int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_points int;
begin
  select loyalty_points into current_points
  from customers
  where id = p_customer_id;

  if current_points >= p_points then
    update customers
    set loyalty_points = loyalty_points - p_points
    where id = p_customer_id;
    return true;
  end if;

  return false;
end;
$$;

-- ── Auto-calculate order total from items ──
create or replace function public.calculate_order_total(p_order_id bigint)
returns record
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_subtotal numeric(10,2);
  v_total numeric(10,2);
begin
  select coalesce(sum(subtotal), 0) into v_subtotal
  from order_items
  where order_id = p_order_id;

  select coalesce(subtotal, 0) + coalesce(shipping, 0) into v_total
  from orders
  where id = p_order_id;

  return (v_subtotal, v_total);
end;
$$;

-- ── Daily analytics rollup function (called by trigger) ──
create or replace function public.rollup_daily_analytics(p_date date)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into analytics_daily (
    date, total_orders, total_revenue, avg_order_value,
    new_customers, completed_orders, cancelled_orders
  )
  select
    p_date,
    -- Total orders on this date
    (select count(*) from orders where created_at::date = p_date),
    -- Total revenue (completed orders only)
    (select coalesce(sum(total), 0) from orders
     where created_at::date = p_date and status = 'completed'),
    -- Average order value
    (select coalesce(avg(total), 0) from orders
     where created_at::date = p_date and status = 'completed'),
    -- New customers
    (select count(*) from customers where created_at::date = p_date),
    -- Completed
    (select count(*) from orders where created_at::date = p_date and status = 'completed'),
    -- Cancelled
    (select count(*) from orders where created_at::date = p_date and status = 'cancelled')
  on conflict (date)
  do update set
    total_orders = excluded.total_orders,
    total_revenue = excluded.total_revenue,
    avg_order_value = excluded.avg_order_value,
    new_customers = excluded.new_customers,
    completed_orders = excluded.completed_orders,
    cancelled_orders = excluded.cancelled_orders;
end;
$$;

-- ── Customer stats update (after order completion) ──
create or replace function public.update_customer_stats(p_customer_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update customers
  set
    total_orders = (
      select count(*) from orders
      where customer_id = p_customer_id and status = 'completed'
    ),
    total_spent = (
      select coalesce(sum(total), 0) from orders
      where customer_id = p_customer_id and status = 'completed'
    ),
    is_vip = (
      select count(*) from orders
      where customer_id = p_customer_id and status = 'completed'
    ) >= 10
  where id = p_customer_id;
end;
$$;

-- ── Full-text search for products ──
create or replace function public.search_products(p_query text)
returns table (
  id bigint,
  name text,
  slug text,
  description text,
  category product_category,
  price numeric(10,2),
  image_url text,
  is_available boolean,
  similarity real
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  select
    p.id, p.name, p.slug, p.description, p.category,
    p.price, p.image_url, p.is_available,
    word_similarity(p_query, p.name) as similarity
  from products p
  where word_similarity(p_query, p.name) > 0.3
     or p.name ilike ('%' || p_query || '%')
  order by similarity desc, p.display_order asc;
end;
$$;

-- ── Full-text search for customers ──
create or replace function public.search_customers(p_query text)
returns table (
  id bigint,
  name text,
  phone text,
  email text,
  loyalty_points int,
  is_vip boolean,
  total_orders int,
  total_spent numeric(10,2),
  similarity real
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  select
    c.id, c.name, c.phone, c.email,
    c.loyalty_points, c.is_vip, c.total_orders, c.total_spent,
    greatest(
      word_similarity(p_query, c.name),
      case when c.phone is not null then word_similarity(p_query, c.phone) else 0 end,
      case when c.email is not null then word_similarity(p_query, c.email) else 0 end
    ) as similarity
  from customers c
  where word_similarity(p_query, c.name) > 0.2
     or (c.phone is not null and word_similarity(p_query, c.phone) > 0.2)
     or (c.email is not null and word_similarity(p_query, c.email) > 0.2)
  order by similarity desc, c.total_spent desc;
end;
$$;
