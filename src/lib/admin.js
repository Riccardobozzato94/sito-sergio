// ═══════════════════════════════════════════════════════════
// Admin API — Operations for the admin dashboard
// All operations use Supabase with the logged-in user's session
// ═══════════════════════════════════════════════════════════

import { supabase } from './supabase/client';

// ── AUTH ──

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

// ── PRODUCTS ──

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createProduct(product) {
  const slug = product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);

  const { data, error } = await supabase
    .from('products')
    .insert([{ ...product, slug }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ── ORDERS ──

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(id, status, paymentStatus) {
  const updates = { updated_at: new Date().toISOString() };
  if (status) updates.status = status;
  if (paymentStatus !== undefined) updates.payment_status = paymentStatus;

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── SITE CONTENT ──

export async function getSiteContent() {
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .order('section', { ascending: true });
  if (error) throw error;
  return data;
}

export async function updateSiteContent(id, value_it, value_en) {
  const { data, error } = await supabase
    .from('site_content')
    .update({ value_it, value_en, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── SITE SETTINGS (stored in site_content with section='_setting') ──

export async function getSiteSettings() {
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .eq('section', '_setting')
    .order('key', { ascending: true });
  if (error) throw error;
  return data;
}

export async function updateSiteSetting(id, value) {
  const { data, error } = await supabase
    .from('site_content')
    .update({ value_it: value, value_en: value, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── IMAGE UPLOAD (Supabase Storage) ──

export async function uploadProductImage(file, productId) {
  const ext = file.name.split('.').pop();
  const fileName = `product-${productId}-${Date.now()}.${ext}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '86400',
      upsert: true,
    });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}
