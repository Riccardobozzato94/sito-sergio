-- ═══════════════════════════════════════════════════════════
-- 001 — Enable Extensions
-- Panificio Da Sergio — CRM Database
-- ═══════════════════════════════════════════════════════════

-- UUID generation (supabase enables by default, but explicit is better)
create extension if not exists "uuid-ossp";

-- Full-text search for product/customer search
create extension if not exists "pg_trgm";

-- Realtime: supabase handles this via publication, but we ensure the role exists
-- Note: Supabase auto-creates `supabase_realtime` publication
