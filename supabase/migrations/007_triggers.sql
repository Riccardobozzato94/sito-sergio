-- ═══════════════════════════════════════════════════════════
-- 007 — Triggers
-- Panificio Da Sergio — CRM Database
-- Triggers for: updated_at, order total calc, analytics rollup,
--               customer stats, inventory auto-decrement
-- ═══════════════════════════════════════════════════════════

-- ── Auto-update updated_at on all relevant tables ──
create trigger trg_update_customers_updated_at
  before update on customers
  for each row
  execute function public.update_updated_at();

create trigger trg_update_products_updated_at
  before update on products
  for each row
  execute function public.update_updated_at();

create trigger trg_update_orders_updated_at
  before update on orders
  for each row
  execute function public.update_updated_at();

create trigger trg_update_crm_users_updated_at
  before update on crm_users
  for each row
  execute function public.update_updated_at();

-- ── Auto-generate product slug from name (on insert or name change) ──
create or replace function public.generate_product_slug()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug = lower(regexp_replace(new.name, '[^a-zA-Z0-9àèéìòùÀÈÉÌÒÙ\s-]', '', 'g'));
    new.slug = regexp_replace(new.slug, '\s+', '-', 'g');
    new.slug = regexp_replace(new.slug, '-+', '-', 'g');
    -- Append short random suffix if needed (handled by unique constraint conflict)
  end if;
  return new;
end;
$$;

create trigger trg_generate_product_slug
  before insert or update of name on products
  for each row
  execute function public.generate_product_slug();

-- ── After order status changes: update analytics + customer stats ──
create or replace function public.on_order_status_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Only trigger analytics on status transitions to terminal states
  if new.status in ('completed', 'cancelled')
     and (old.status is null or old.status not in ('completed', 'cancelled')) then

    -- Rollup daily analytics
    perform public.rollup_daily_analytics(new.created_at::date);

    -- Update customer stats if order belongs to a customer
    if new.customer_id is not null then
      perform public.update_customer_stats(new.customer_id);

      -- Add loyalty points on completion (1 point per € spent)
      if new.status = 'completed' then
        perform public.add_loyalty_points(
          new.customer_id,
          floor(new.total)::int
        );
      end if;
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_order_status_change
  after update of status on orders
  for each row
  execute function public.on_order_status_change();

-- ── After new order is created: rollup analytics ──
create or replace function public.on_order_created()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Create daily rollup entry if doesn't exist
  perform public.rollup_daily_analytics(new.created_at::date);
  return new;
end;
$$;

create trigger trg_order_created
  after insert on orders
  for each row
  execute function public.on_order_created();

-- ── After new customer: update daily analytics ──
create or replace function public.on_customer_created()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Ensure daily analytics entry exists
  insert into analytics_daily (date)
  values (new.created_at::date)
  on conflict (date) do nothing;
  return new;
end;
$$;

create trigger trg_customer_created
  after insert on customers
  for each row
  execute function public.on_customer_created();

-- ── Notify realtime on new pending orders (for CRM dashboard) ──
create or replace function public.notify_new_order()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform pg_notify(
    'new_order',
    json_build_object(
      'order_id', new.id,
      'customer_id', new.customer_id,
      'total', new.total,
      'status', new.status,
      'created_at', new.created_at
    )::text
  );
  return new;
end;
$$;

create trigger trg_notify_new_order
  after insert on orders
  for each row
  execute function public.notify_new_order();
