// ═══════════════════════════════════════════════════════════
// Supabase Client — Website Integration
// Panificio Da Sergio
// ═══════════════════════════════════════════════════════════
// Used by the website to:
//   1. Create orders (instead of just WhatsApp)
//   2. Check product availability
//   3. Search products
// ═══════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // No user auth needed for website (anonymous orders)
    autoRefreshToken: false,
  },
});

// ═══════════════════════════════════════════════════════════
// Database Types (auto-generated — kept minimal here)
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
// Helper: Create Order from Cart
// ═══════════════════════════════════════════════════════════

export interface CartItem {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface OrderInput {
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  deliveryMethod: DeliveryMethod;
  pickupTime?: string;
  notes?: string;
  items: CartItem[];
}

export async function createOrder(input: OrderInput) {
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert({
      name: input.customer.name,
      phone: input.customer.phone,
      email: input.customer.email || null,
    })
    .select('id')
    .single();

  if (customerError) throw customerError;

  const subtotal = input.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const shipping = input.deliveryMethod === 'courier' ? 5.90 : 0;
  const total = subtotal + shipping;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: customer.id,
      status: 'pending',
      delivery_method: input.deliveryMethod,
      subtotal,
      shipping,
      total,
      pickup_time: input.pickupTime || null,
      notes: input.notes || null,
    })
    .select('id')
    .single();

  if (orderError) throw orderError;

  const orderItems = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return { orderId: order.id, customerId: customer.id };
}

// ═══════════════════════════════════════════════════════════
// Helper: Fetch Available Products
// ═══════════════════════════════════════════════════════════

export async function getProducts(category?: ProductCategory) {
  let query = supabase
    .from('products')
    .select('id, name, slug, description, category, price, unit, image_url, is_available, stock_weight_kg')
    .eq('is_available', true)
    .order('display_order', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Product[];
}

// ═══════════════════════════════════════════════════════════
// Helper: Search Products
// ═══════════════════════════════════════════════════════════

export async function searchProducts(query: string) {
  const { data, error } = await supabase.rpc('search_products', {
    p_query: query,
  });
  if (error) throw error;
  return data;
}
