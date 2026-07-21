import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client - usa @supabase/supabase-js per compatibilità con static export.
// @supabase/ssr non funziona con output:'export' (manca runtime Next.js).
export function createBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}