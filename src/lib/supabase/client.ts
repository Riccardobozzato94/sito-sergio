// ═══════════════════════════════════════════════════════════
// Supabase Client — Website Integration (optional)
// Panificio Da Sergio
// ═══════════════════════════════════════════════════════════
// If VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env,
// the site will use Supabase for product data and orders.
// Otherwise, it gracefully falls back to static/empty data.
// ═══════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'The site will run in offline/static mode. ' +
    'Set them in .env to enable the full CRM integration.'
  );
}

// Dummy client that fails gracefully
function createDummyClient() {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
          single: () => Promise.resolve({ data: null, error: null }),
        }),
        single: () => Promise.resolve({ data: null, error: null }),
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    }),
    channel: () => ({
      on: () => ({
        subscribe: () => ({ unsubscribe: () => {} }),
      }),
    }),
    removeChannel: () => {},
    rpc: () => Promise.resolve({ data: null, error: null }),
  };
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : createDummyClient();

// ═══════════════════════════════════════════════════════════
// Database Types
// ═══════════════════════════════════════════════════════════

export type ProductCategory = 'pane' | 'dolci' | 'specialita' | 'salato' | 'stagionale';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type DeliveryMethod = 'pickup' | 'courier' | 'reservation';

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: ProductCategory;
  price: number;
  unit: string;
  image_url: string | null;
  is_available: boolean;
  stock_weight_kg: number | null;
}

export interface Order {
  id: number;
  customer_id: number | null;
  status: OrderStatus;
  delivery_method: DeliveryMethod;
  subtotal: number;
  shipping: number;
  total: number;
  pickup_time: string | null;
  notes: string | null;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════
// Helper: Fetch Available Products
// ═══════════════════════════════════════════════════════════

export async function getProducts(category?: ProductCategory) {
  if (!isConfigured) return [];

  let query = supabase
    .from('products')
    .select('id, name, slug, description, category, price, unit, image_url, is_available, stock_weight_kg')
    .eq('is_available', true)
    .order('display_order', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) {
    console.warn('[Supabase] Error fetching products:', error.message);
    return [];
  }
  return data as Product[];
}

// ═══════════════════════════════════════════════════════════
// Helper: Search Products
// ═══════════════════════════════════════════════════════════

export async function searchProducts(query: string) {
  if (!isConfigured) return [];
  const { data, error } = await supabase.rpc('search_products', {
    p_query: query,
  });
  if (error) {
    console.warn('[Supabase] Error searching products:', error.message);
    return [];
  }
  return data;
}
