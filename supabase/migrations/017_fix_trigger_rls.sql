-- ═══════════════════════════════════════════════════════════
-- 017 — Fix trigger RLS: add security definer to all triggers
--         that write to analytics_daily
-- Panificio Da Sergio — CRM Database
--
-- Le funzioni trigger girano col ruolo dell'utente che ha
-- eseguito l'operazione (es. anon). Senza security definer,
-- non possono scrivere su analytics_daily se RLS lo blocca.
-- ═══════════════════════════════════════════════════════════

-- Fix: on_customer_created — serve security definer
-- perché insert in analytics_daily richiede privilegi
create or replace function public.on_customer_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.analytics_daily (date)
  values (new.created_at::date)
  on conflict (date) do nothing;
  return new;
end;
$$;

-- Fix: on_order_created — chiama rollup_daily_analytics
-- che fa insert in analytics_daily
create or replace function public.on_order_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.rollup_daily_analytics(new.created_at::date);
  return new;
end;
$$;

-- Fix: on_order_status_change — chiama rollup_daily_analytics
-- e update_customer_stats e add_loyalty_points
create or replace function public.on_order_status_change()
returns trigger
language plpgsql
security definer
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
