-- ═══════════════════════════════════════════════════════════
-- 014 — Fix customer trigger search_path
-- Panificio Da Sergio — CRM Database
--
-- Il trigger trg_customer_created usa la funzione
-- on_customer_created() con set search_path = '',
-- ma referenzia analytics_daily senza public. prefix.
-- Questo causa errore 42P01 su INSERT in customers.
-- ═══════════════════════════════════════════════════════════

-- Replace the broken function with schema-qualified table reference
create or replace function public.on_customer_created()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Ensure daily analytics entry exists — schema-qualified!
  insert into public.analytics_daily (date)
  values (new.created_at::date)
  on conflict (date) do nothing;
  return new;
end;
$$;

-- Also fix any other functions that might have the same issue
create or replace function public.on_order_created()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform public.rollup_daily_analytics(new.created_at::date);
  return new;
end;
$$;

create or replace function public.on_order_status_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status in ('completed', 'cancelled')
     and (old.status is null or old.status not in ('completed', 'cancelled')) then
    perform public.rollup_daily_analytics(new.created_at::date);
    if new.customer_id is not null then
      perform public.update_customer_stats(new.customer_id);
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
