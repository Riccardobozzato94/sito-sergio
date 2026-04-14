import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: false, // No auth needed — anonymous orders only
    detectSessionInUrl: false,
  },
});

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  allergens: string[];
}

export async function getProducts(category?: string): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('id, name, description, category, price, unit, image_url, is_available, is_featured, allergens')
    .eq('is_available', true)
    .order('display_order', { ascending: true });

  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Product[];
}
