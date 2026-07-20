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

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

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
  is_featured?: boolean;
  allergens?: string[];
  dietary?: string[];
  ingredients?: string;
  display_order?: number;
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

// Static fallback products for offline/demo mode
const STATIC_PRODUCTS: Product[] = [
  { id:1, name:"Bussol\u00e0", slug:"bussola", category:"dolci", price:2.20, unit:"al pezzo", image_url:"/images/bussola.jpg", is_available:true, is_featured:true, allergens:["glutine","uova","lattosio"], dietary:[], ingredients:"Farina di grano tenero, burro, uova, zucchero, limone, vaniglia", stock_weight_kg:null, display_order:1, description:"Frollini artigianali a forma di anello, friabili e aromatici. Un dolce tipico di Chioggia, perfetto per la colazione o il t\u00e8." },
  { id:2, name:"Torta della Nonna", slug:"torta-nonna", category:"dolci", price:20, unit:"al kg", image_url:"/images/torta-nonna.jpg", is_available:true, is_featured:true, allergens:["glutine","lattosio","uova","frutta_guscio"], dietary:[], ingredients:"Pasta frolla, crema pasticcera, pinoli, zucchero a velo", stock_weight_kg:null, display_order:2, description:"Soffice torta artigianale con crema pasticcera, ricoperta di zucchero a velo e pinoli tostati." },
  { id:3, name:"Pevarini", slug:"pevarini", category:"dolci", price:20, unit:"al kg", image_url:"/images/pevarini.jpg", is_available:true, is_featured:true, allergens:["glutine","frutta_guscio"], dietary:["vegan"], ingredients:"Farina di grano, mandorle, miele, spezie, cannella", stock_weight_kg:null, display_order:3, description:"Classici biscotti friabili dalla forma inconfondibile. Dolce tipico veneziano, tradizione e gusto in ogni morso." },
  { id:4, name:"Papini", slug:"papini", category:"dolci", price:22, unit:"al kg", image_url:"/images/papini.jpg", is_available:true, is_featured:false, allergens:["glutine","uova","lattosio"], dietary:[], ingredients:"Farina di grano, burro, uova, zucchero, mandorle", stock_weight_kg:null, display_order:4, description:"Biscotti tradizionali veneziani, croccanti fuori e morbidi dentro. Ricetta originale tramandata da generazioni." },
  { id:5, name:"Biscotti di Mandorle", slug:"biscotti-mandorle", category:"dolci", price:25, unit:"al kg", image_url:"/images/biscotti-mandorle.jpg", is_available:true, is_featured:false, allergens:["frutta_guscio","uova"], dietary:["senza_lattosio","vegan"], ingredients:"Mandorle, zucchero, albume d'uovo, farina di riso", stock_weight_kg:null, display_order:5, description:"Biscotti friabili alle mandorle, senza lattosio. Perfetti per celiaci e intolleranti." },
  { id:6, name:"Torte di Mandorla", slug:"torte-mandorla", category:"dolci", price:20, unit:"al kg", image_url:"/images/tortamandorle1.jpg", is_available:true, is_featured:false, allergens:["frutta_guscio","uova"], dietary:["senza_lattosio"], ingredients:"Mandorle, uova, zucchero, farina, limone", stock_weight_kg:null, display_order:6, description:"Torta soffice alle mandorle, senza lattosio. Un classico della tradizione veneziana." },
  { id:7, name:"Pane di segale", slug:"pane-segale", category:"pane", price:6, unit:"al kg", image_url:"/images/placeholder-product.svg", is_available:true, is_featured:false, allergens:["glutine"], dietary:["vegan"], ingredients:"Farina di segale, acqua, lievito madre, sale", stock_weight_kg:null, display_order:7, description:"Pane dal sapore intenso e deciso, ideale per abbinamenti con salumi e formaggi." },
  { id:8, name:"Pane integrale", slug:"pane-integrale", category:"pane", price:5.50, unit:"al kg", image_url:"/images/placeholder-product.svg", is_available:true, is_featured:false, allergens:["glutine"], dietary:["vegan","integrale"], ingredients:"Farina integrale di grano, acqua, lievito madre, sale", stock_weight_kg:null, display_order:8, description:"Pane genuino con farina integrale macinata a pietra, ricco di fibre e dal sapore autentico." },
  { id:9, name:"Bussola Chioggiotta", slug:"bussola-alt", category:"dolci", price:2.50, unit:"al pezzo", image_url:"/images/bussola-alt.jpg", is_available:true, is_featured:false, allergens:["glutine","uova","lattosio"], dietary:[], ingredients:"Farina, burro, uova, zucchero, scorza di limone", stock_weight_kg:null, display_order:9, description:"Variante della classica bussol\u00e0, pi\u00f9 grande e morbida. Il dolce della domenica a Chioggia." },
];

export async function getProducts(category?: ProductCategory) {
  if (!isConfigured) {
    if (category) return STATIC_PRODUCTS.filter(p => p.category === category);
    return STATIC_PRODUCTS;
  }

  let query = supabase
    .from('products')
    .select('id, name, slug, description, category, price, unit, image_url, is_available, is_featured, allergens, dietary, ingredients, display_order, stock_weight_kg')
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
