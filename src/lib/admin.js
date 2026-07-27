// ═══════════════════════════════════════════════════════════
// Admin API — Operations for the admin dashboard
// Falls back to localStorage demo data when Supabase is not configured
// ═══════════════════════════════════════════════════════════

import { supabase, isConfigured } from './supabase/client';

// ── Demo data for offline mode ──

const DEMO_PRODUCTS = [
  { id:1, name:"Bussol\u00e0", slug:"bussola", category:"dolci", price:2.20, unit:"al pezzo", image_url:"/images/bussola.jpg", is_available:true, is_featured:true, allergens:["glutine","uova","lattosio"], dietary:[], ingredients:"Farina di grano tenero, burro, uova, zucchero, limone, vaniglia", display_order:1, description:"Frollini artigianali a forma di anello, tipici di Chioggia." },
  { id:2, name:"Torta della Nonna", slug:"torta-nonna", category:"dolci", price:20, unit:"al kg", image_url:"/images/torta-nonna.jpg", is_available:true, is_featured:true, allergens:["glutine","lattosio","uova","frutta_guscio"], dietary:[], ingredients:"Pasta frolla, crema pasticcera, pinoli, zucchero a velo", display_order:2, description:"Soffice torta con crema pasticcera e pinoli tostati." },
  { id:3, name:"Pevarini", slug:"pevarini", category:"dolci", price:20, unit:"al kg", image_url:"/images/pevarini.jpg", is_available:true, is_featured:true, allergens:["glutine","frutta_guscio"], dietary:["vegan"], ingredients:"Farina, mandorle, miele, spezie, cannella", display_order:3, description:"Biscotti friabili veneziani, tradizione e gusto." },
  { id:4, name:"Papini", slug:"papini", category:"dolci", price:22, unit:"al kg", image_url:"/images/papini.jpg", is_available:true, is_featured:false, allergens:["glutine","uova","lattosio"], dietary:[], ingredients:"Farina, burro, uova, zucchero, mandorle", display_order:4, description:"Biscotti tradizionali veneziani, croccanti fuori e morbidi dentro." },
  { id:5, name:"Biscotti di Mandorle", slug:"biscotti-mandorle", category:"dolci", price:25, unit:"al kg", image_url:null, is_available:true, is_featured:false, allergens:["frutta_guscio","uova"], dietary:["senza_lattosio","vegan"], ingredients:"Mandorle, zucchero, albume, farina di riso", display_order:5, description:"Biscotti friabili alle mandorle, senza lattosio." },
  { id:6, name:"Torte di Mandorla", slug:"torte-mandorla", category:"dolci", price:20, unit:"al kg", image_url:"/images/tortamandorle1.jpg", is_available:true, is_featured:false, allergens:["frutta_guscio","uova"], dietary:["senza_lattosio"], ingredients:"Mandorle, uova, zucchero, farina, limone", display_order:6, description:"Torta soffice alle mandorle, senza lattosio." },
  { id:7, name:"Pane di segale", slug:"pane-segale", category:"pane", price:6, unit:"al kg", image_url:null, is_available:true, is_featured:false, allergens:["glutine"], dietary:["vegan"], ingredients:"Farina di segale, acqua, lievito madre, sale", display_order:7, description:"Pane dal sapore intenso e deciso." },
  { id:8, name:"Pane integrale", slug:"pane-integrale", category:"pane", price:5.50, unit:"al kg", image_url:null, is_available:true, is_featured:false, allergens:["glutine"], dietary:["vegan","integrale"], ingredients:"Farina integrale, acqua, lievito madre, sale", display_order:8, description:"Pane genuino con farina integrale macinata a pietra." },
  { id:9, name:"Bussola Chioggiotta", slug:"bussola-alt", category:"dolci", price:2.50, unit:"al pezzo", image_url:"/images/bussola-alt.jpg", is_available:true, is_featured:false, allergens:["glutine","uova","lattosio"], dietary:[], ingredients:"Farina, burro, uova, zucchero, scorza di limone", display_order:9, description:"Variante della classica bussol\u00e0, pi\u00f9 grande e morbida." },
];

const DEMO_ORDERS = [
  { id:2847, customer_name:"Marco Rossi", customer_phone:"+39 333 1234567", customer_email:"marco@email.com", delivery_method:"pickup", pickup_time:"Oggi 12:00-13:00", notes:"", subtotal:14.50, shipping:0, total:14.50, status:"preparing", payment_status:"paid", created_at:new Date(Date.now()-3600000).toISOString(), items:[{name:"Bussol\u00e0",quantity:2,price:2.20},{name:"Pevarini",quantity:1,price:10}] },
  { id:2846, customer_name:"Anna Bianchi", customer_phone:"+39 345 9876543", customer_email:"anna@email.com", delivery_method:"pickup", pickup_time:"Oggi 17:00-19:00", notes:"", subtotal:20, shipping:0, total:20, status:"ready", payment_status:"paid", created_at:new Date(Date.now()-7200000).toISOString(), items:[{name:"Torta della Nonna",quantity:1,price:20}] },
  { id:2845, customer_name:"Luca Verdi", customer_phone:"+39 320 4567890", customer_email:"luca@email.com", delivery_method:"courier", pickup_time:"", notes:"Consegnare in portineria", subtotal:18, shipping:5.90, total:23.90, status:"pending", payment_status:"unpaid", created_at:new Date(Date.now()-1800000).toISOString(), items:[{name:"Papini",quantity:1,price:22},{name:"Pane integrale",quantity:2,price:5.50}] },
  { id:2844, customer_name:"Elena Neri", customer_phone:"+39 347 1122334", customer_email:"elena@email.com", delivery_method:"pickup", pickup_time:"Domani 07:00-10:00", notes:"", subtotal:25, shipping:0, total:25, status:"completed", payment_status:"paid", created_at:new Date(Date.now()-86400000).toISOString(), items:[{name:"Biscotti di Mandorle",quantity:1,price:25}] },
  { id:2843, customer_name:"Paolo Gialli", customer_phone:"+39 339 9988776", customer_email:"paolo@email.com", delivery_method:"reservation", pickup_time:"", notes:"Volevo sapere se avete il pane di segale disponibile", subtotal:12, shipping:0, total:12, status:"pending", payment_status:"unpaid", created_at:new Date(Date.now()-3600000).toISOString(), items:[{name:"Pane di segale",quantity:2,price:6}] },
];

const DEMO_CONTENT = [
  { id:1, section:"hero", key:"hero_slogan", value_it:"L'autentico sapore di Chioggia", value_en:"The authentic taste of Chioggia" },
  { id:2, section:"seo", key:"seo_title", value_it:"Panificio Da Sergio — Chioggia dal 1977", value_en:"Panificio Da Sergio — Chioggia since 1977" },
];

const DEMO_SETTINGS = [
  { id:101, section:"_setting", key:"social_facebook", value_it:"https://www.facebook.com/p/Panificio-da-Sergio-Chioggia-100057410531710", value_en:"" },
  { id:102, section:"_setting", key:"social_instagram", value_it:"", value_en:"" },
  { id:103, section:"_setting", key:"social_tripadvisor", value_it:"https://www.tripadvisor.it/Restaurant_Review-g194738-d7005470-Reviews-Panificio_da_Sergio-Chioggia_Veneto.html", value_en:"" },
  { id:104, section:"_setting", key:"social_google_reviews", value_it:"https://share.google/3atabYNGXSHpAWi9S", value_en:"" },
  { id:105, section:"_setting", key:"social_whatsapp", value_it:"39041401200", value_en:"" },
  { id:106, section:"_setting", key:"business_address", value_it:"Calle Ponte Caneva 626, 30015 Chioggia (VE)", value_en:"" },
  { id:107, section:"_setting", key:"business_phone", value_it:"+39 041401200", value_en:"" },
  { id:108, section:"_setting", key:"business_email", value_it:"giraldoalessandro1@gmail.com", value_en:"" },
  { id:109, section:"_setting", key:"business_website", value_it:"www.panificiodasergio.com", value_en:"" },
  { id:1095, section:"_setting", key:"business_partita_iva", value_it:"03729280275", value_en:"" },
  { id:1096, section:"_setting", key:"business_hours_mon", value_it:"Chiuso", value_en:"" },
  { id:110, section:"_setting", key:"business_hours_mon_fri", value_it:"10:00 - 19:00", value_en:"" },
  { id:111, section:"_setting", key:"business_hours_sat", value_it:"10:00 - 19:00", value_en:"" },
  { id:112, section:"_setting", key:"business_hours_sun", value_it:"10:00 - 19:00", value_en:"" },
  { id:113, section:"_setting", key:"analytics_ga_id", value_it:"G-XDRTPREPQX", value_en:"" },
  { id:114, section:"_setting", key:"analytics_meta_pixel", value_it:"", value_en:"" },
  { id:115, section:"_setting", key:"seo_og_image", value_it:"/images/og-image.svg", value_en:"" },
  { id:116, section:"_setting", key:"seo_og_title", value_it:"Panificio Da Sergio — Tradizione con Passione dal 1977", value_en:"" },
  { id:117, section:"_setting", key:"seo_og_description", value_it:"Pane fresco, biscotti artigianali e dolci tradizionali veneziani a Chioggia. Dal 1977 portiamo il sapore autentico dell'artigianalità sulle vostre tavole.", value_en:"" },
];

// ── Shared utility ──

/** Genera slug URL-safe da testo italiano (gestisce accenti) */
function generateSlug(name) {
  return (name || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // rimuove accenti (à→a, è→e, ecc.)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

// ── Allowed columns per le operazioni CRUD sui prodotti ──
const PRODUCT_ALLOWED_COLUMNS = [
  'name', 'slug', 'description', 'category', 'price', 'unit',
  'image_url', 'is_available', 'is_featured', 'allergens',
  'dietary', 'ingredients',
  'stock_weight_kg', 'low_stock_threshold_kg', 'display_order',
];

/** Filtra un oggetto tenendo solo le colonne consentite per la tabella products */
function sanitizeProductPayload(payload) {
  const safe = {};
  PRODUCT_ALLOWED_COLUMNS.forEach(function(col) {
    if (col in payload && payload[col] !== undefined) {
      safe[col] = payload[col];
    }
  });
  return safe;
}

// ── Storage helpers ──

function loadLocal(key, fallback) {
  try {
    const data = localStorage.getItem('admin-' + key);
    if (data) return JSON.parse(data);
  } catch(e) { /* ignore */ }
  return fallback;
}

function saveLocal(key, data) {
  try { localStorage.setItem('admin-' + key, JSON.stringify(data)); } catch(e) { /* ignore */ }
}

// ── AUTH ──

const DEMO_USER = { email: 'admin@panificio.it', password: 'admin123' };

export async function signIn(email, password) {
  // Always allow demo credentials for testing (works in all modes)
  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    const session = { user: { email: email }, access_token: 'demo-token', expires_at: Date.now() + 86400000 };
    saveLocal('session', session);
    return { session: session };
  }
  // Try Supabase auth if configured
  if (isConfigured) {
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) throw result.error;
    // Save session to localStorage for persistence
    if (result.data?.session) {
      saveLocal('session', {
        user: result.data.session.user,
        access_token: result.data.session.access_token,
        refresh_token: result.data.session.refresh_token,
        expires_at: Date.parse(result.data.session.expires_at) || (Date.now() + 3600000),
      });
    }
    return result.data;
  }
  throw new Error('Credenziali non valide. Prova: admin@panificio.it / admin123');
}

export async function signOut() {
  localStorage.removeItem('session');
  if (isConfigured) {
    const result = await supabase.auth.signOut();
    if (result.error) throw result.error;
  }
}

export async function getSession() {
  const localSession = loadLocal('session', null);
  if (localSession && localSession.expires_at > Date.now()) {
    return localSession;
  }
  if (localSession) {
    localStorage.removeItem('session');
  }
  if (isConfigured) {
    const result = await supabase.auth.getSession();
    if (result.error) throw result.error;
    return result.data.session;
  }
  return null;
}

// ── PRODUCTS ──

export async function getProducts() {
  if (!isConfigured) return loadLocal('products', DEMO_PRODUCTS);
  const { data, error } = await supabase.from('products').select('*').order('display_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createProduct(product) {
  if (!isConfigured) {
    const products = loadLocal('products', DEMO_PRODUCTS);
    const maxId = products.reduce(function(max, p) { return p.id > max ? p.id : max; }, 0);
    const slug = generateSlug(product.name);
    const newProduct = { ...product, id: maxId + 1, slug: slug };
    products.push(newProduct);
    saveLocal('products', products);
    return newProduct;
  }

  const slug = generateSlug(product.name);
  const safeProduct = sanitizeProductPayload({ ...product, slug });

  const { data, error } = await supabase.from('products').insert([safeProduct]).select('id,name,slug').single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, updates) {
  if (!isConfigured) {
    const products = loadLocal('products', DEMO_PRODUCTS);
    const idx = products.findIndex(function(p) { return p.id === id; });
    if (idx === -1) throw new Error('Prodotto non trovato');
    products[idx] = { ...products[idx], ...updates };
    saveLocal('products', products);
    return products[idx];
  }

  // Se il nome cambia, rigenera lo slug
  if (updates.name) {
    updates.slug = generateSlug(updates.name);
  }

  const safeUpdates = sanitizeProductPayload(updates);

  const { data, error } = await supabase.from('products').update(safeUpdates).eq('id', Number(id)).select('id,name,slug').single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  if (!isConfigured) {
    let products = loadLocal('products', DEMO_PRODUCTS);
    products = products.filter(function(p) { return p.id !== id; });
    saveLocal('products', products);
    return;
  }

  const { data, error } = await supabase.from('products').delete().eq('id', Number(id)).select('id');
  if (error) {
    if (error.message && error.message.indexOf('foreign key') !== -1) {
      throw new Error('Prodotto presente in ordini esistenti. Rimuovi prima i riferimenti.');
    }
    throw error;
  }
  if (!data || data.length === 0) {
    throw new Error('Nessuna riga eliminata: potresti non avere i permessi necessari.');
  }
}

// ── ORDERS ──

export async function getOrders() {
  if (!isConfigured) return loadLocal('orders', DEMO_ORDERS);
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(id, status, paymentStatus) {
  const updates = { updated_at: new Date().toISOString() };
  if (status) updates.status = status;
  if (paymentStatus !== undefined) updates.payment_status = paymentStatus;

  if (!isConfigured) {
    const orders = loadLocal('orders', DEMO_ORDERS);
    const idx = orders.findIndex(function(o) { return o.id === id; });
    if (idx === -1) throw new Error('Ordine non trovato');
    orders[idx] = { ...orders[idx], ...updates };
    saveLocal('orders', orders);
    return orders[idx];
  }

  const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ── SITE CONTENT ──

export async function getSiteContent() {
  if (!isConfigured) return loadLocal('content', DEMO_CONTENT);
  const { data, error } = await supabase.from('site_content').select('*').order('section', { ascending: true });
  if (error) throw error;
  return data;
}

export async function updateSiteContent(id, value_it, value_en) {
  if (!isConfigured) {
    const content = loadLocal('content', DEMO_CONTENT);
    const idx = content.findIndex(function(c) { return c.id === id; });
    if (idx === -1) throw new Error('Contenuto non trovato');
    content[idx] = { ...content[idx], value_it: value_it, value_en: value_en, updated_at: new Date().toISOString() };
    saveLocal('content', content);
    return content[idx];
  }
  const { data, error } = await supabase.from('site_content').update({
    value_it: value_it, value_en: value_en, updated_at: new Date().toISOString()
  }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ── SITE SETTINGS ──

export async function getSiteSettings() {
  if (!isConfigured) return loadLocal('settings', DEMO_SETTINGS);
  const { data, error } = await supabase.from('site_content').select('*').eq('section', '_setting').order('key', { ascending: true });
  if (error) throw error;
  return data;
}

export async function updateSiteSetting(id, value) {
  if (!isConfigured) {
    const settings = loadLocal('settings', DEMO_SETTINGS);
    const idx = settings.findIndex(function(s) { return s.id === id; });
    if (idx === -1) {
      const fallback = DEMO_SETTINGS.find(function(s) { return s.id === id; }) || { id: id, section: '_setting', key: 'unknown', value_it: '', value_en: '' };
      settings.push({ ...fallback, value_it: value, value_en: value, updated_at: new Date().toISOString() });
      saveLocal('settings', settings);
      return settings[settings.length - 1];
    }
    settings[idx] = { ...settings[idx], value_it: value, value_en: value, updated_at: new Date().toISOString() };
    saveLocal('settings', settings);
    return settings[idx];
  }
  const { data, error } = await supabase.from('site_content').update({
    value_it: value, value_en: value, updated_at: new Date().toISOString()
  }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ── IMAGE UPLOAD ──

export async function uploadProductImage(file, productId) {
  if (!isConfigured) {
    console.warn('[Admin] Modalità demo: le immagini non vengono salvate. Configura Supabase per upload reali.');
    return '/images/placeholder-product.svg';
  }
  const ext = file.name.split('.').pop();
  const fileName = 'product-' + productId + '-' + Date.now() + '.' + ext;
  const filePath = 'products/' + fileName;

  const uploadResult = await supabase.storage.from('product-images').upload(filePath, file, {
    cacheControl: '86400', upsert: true,
  });
  if (uploadResult.error) throw uploadResult.error;

  const urlData = supabase.storage.from('product-images').getPublicUrl(filePath);
  return urlData.publicUrl;
}
