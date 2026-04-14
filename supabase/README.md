# 🗄️ Supabase Setup — Panificio Da Sergio

## Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **API Keys** (Settings → API)

### 2. Run Migrations

#### Option A: Via Supabase CLI (Recommended)

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Push all migrations
supabase db push
```

#### Option B: Via SQL Editor

1. Open Supabase Dashboard → SQL Editor
2. Run each migration file **in order** (001 → 008):
   - `supabase/migrations/001_extensions.sql`
   - `supabase/migrations/002_enums_types.sql`
   - `supabase/migrations/003_tables.sql`
   - `supabase/migrations/004_indexes.sql`
   - `supabase/migrations/005_rls_policies.sql`
   - `supabase/migrations/006_functions.sql`
   - `supabase/migrations/007_triggers.sql`
   - `supabase/migrations/008_seed_data.sql`

### 3. Create Admin User

1. Go to **Authentication → Users** in Supabase Dashboard
2. Create a new user (email/password for Sergio)
3. Copy the user's **UUID**
4. Run in SQL Editor:

```sql
insert into crm_users (id, role, full_name)
values ('PASTE-USER-UUID-HERE', 'admin', 'Sergio');
```

### 4. Enable Realtime

1. Go to **Database → Replication**
2. Enable replication for the `orders` table
3. This allows the CRM dashboard to receive real-time order notifications

### 5. Configure Environment Variables

#### Website (`.env` in sito sergio/):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

#### CRM Dashboard (`.env.local` in crm-dashboard/):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> ⚠️ **Never** expose the service role key in the website frontend. It's only used server-side in the CRM dashboard.

---

## Database Schema Overview

```
customers ──< orders >── order_items >── products
   │             │
   │             └─── analytics_daily (auto-rollup)
   │
   └─── inventory (daily tracking)

promotions (independent)
crm_users (auth-bound)
```

### Key Design Decisions

| Decision | Why |
|----------|-----|
| `bigint` PKs instead of `uuid` | Smaller indexes, faster joins, sequential writes |
| `text` over `varchar(n)` | Same perf, no artificial limits, cleaner SQL |
| `timestamptz` over `timestamp` | Timezone-aware, no DST bugs |
| `numeric(10,2)` over `float` | Exact decimal for money — no floating point errors |
| Generated columns (`order_items.subtotal`) | Computed at insert time, no application-side math |
| Partial indexes | 5-20x smaller indexes for highly selective queries |
| RLS with `(select auth.uid())` | 100x faster than `auth.uid()` called per row |
| `security definer` functions | Bypass RLS for internal operations safely |

---

## Row-Level Security (RLS) Matrix

| Table | Anon Read | Anon Write | Auth Read | Auth Write |
|-------|-----------|------------|-----------|------------|
| customers | ❌ | ✅ (checkout) | ✅ (CRM users) | ✅ (CRM users) |
| products | ✅ (available only) | ❌ | ✅ (all) | Admin only |
| orders | ❌ | ✅ (checkout) | ✅ (CRM users) | ✅ (CRM users) |
| order_items | ❌ | ✅ (checkout) | ✅ (CRM users) | — |
| inventory | ❌ | ❌ | ✅ (CRM users) | ✅ (CRM users) |
| promotions | ✅ (active only) | ❌ | ✅ (all) | Admin only |
| analytics_daily | ❌ | ❌ | ✅ (CRM users) | — |
| crm_users | ❌ | ❌ | Own profile | Admin only |

---

## Useful Queries

### Today's orders with customer details
```sql
select o.*, c.name, c.phone
from orders o
left join customers c on c.id = o.customer_id
where o.created_at::date = current_date
order by o.created_at desc;
```

### Top 10 customers by spending
```sql
select name, phone, total_orders, total_spent, loyalty_points
from customers
order by total_spent desc
limit 10;
```

### Products running low
```sql
select name, stock_weight_kg, low_stock_threshold_kg
from products
where stock_weight_kg <= low_stock_threshold_kg
  and is_available = true;
```

### Revenue by day (last 30 days)
```sql
select date, total_revenue, total_orders, avg_order_value
from analytics_daily
where date >= current_date - 30
order by date desc;
```

### Orders by status (summary)
```sql
select status, count(*) as count, sum(total) as revenue
from orders
group by status
order by count desc;
```

---

## Next Steps

1. ✅ Database schema + migrations (this folder)
2. ✅ Website Supabase client (`src/lib/supabase/client.ts`)
3. ✅ CRM Dashboard (`crm-dashboard/`)
4. ⏳ WhatsApp Business API integration
5. ⏳ Expo mobile app (iOS/Android)
6. ⏳ Stripe payment integration (for online orders)
