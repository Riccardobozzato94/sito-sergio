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
  { id:5, name:"Biscotti di Mandorle", slug:"biscotti-mandorle", category:"dolci", price:25, unit:"al kg", image_url:"/images/biscotti-mandorle.jpg", is_available:true, is_featured:false, allergens:["frutta_guscio","uova"], dietary:["senza_lattosio","vegan"], ingredients:"Mandorle, zucchero, albume, farina di riso", display_order:5, description:"Biscotti friabili alle mandorle, senza lattosio." },
  { id:6, name:"Torte di Mandorla", slug:"torte-mandorla", category:"dolci", price:20, unit:"al kg", image_url:"/images/tortamandorle1.jpg", is_available:true, is_featured:false, allergens:["frutta_guscio","uova"], dietary:["senza_lattosio"], ingredients:"Mandorle, uova, zucchero, farina, limone", display_order:6, description:"Torta soffice alle mandorle, senza lattosio." },
  { id:7, name:"Pane di segale", slug:"pane-segale", category:"pane", price:6, unit:"al kg", image_url:null, is_available:true, is_featured:false, allergens:["glutine"], dietary:["vegan"], ingredients:"Farina di segale, acqua, lievito madre, sale", display_order:7, description:"Pane dal sapore intenso e deciso." },
  { id:8, name:"Pane integrale", slug:"pane-integrale", category:"pane", price:5.50, unit:"al kg", image_url:null, is_available:true, is_featured:false, allergens:["glutine"], dietary:["vegan","integrale"], ingredients:"Farina integrale, acqua, lievito madre, sale", display_order:8, description:"Pane genuino con farina integrale macinata a pietra." },
  { id:9, name:"Bussola Chioggiotta", slug:"bussola-alt", category:"dolci", price:2.50, unit:"al pezzo", image_url:"/images/bussola-alt.jpg", is_available:true, is_featured:false, allergens:["glutine","uova","lattosio"], dietary:[], ingredients:"Farina, burro, uova, zucchero, scorza di limone", display_order:9, description:"Variante della classica bussol\u00e0, pi\u00f9 grande e morbida." },
];

const DEMO_ORDERS = [
  { id:2847, customer_name:"Marco Rossi", customer_phone:"+39 333 1234567", customer_email:"marco@email.com", delivery_method:"pickup", pickup_time:"Oggi 12:00-13:00", notes:"", subtotal:14.50, shipping:0, total:14.50, status:"preparing", payment_status:"paid", created_at:new Date(Date.now()-3600000).toISOString(), items:[{name:"Bussol\u00e0",quantity:2,price:2.20},{name:"Pevarini",quantity:1,price:10}] },
  { id:2846, name:"Anna Bianchi", customer_phone:"+39 345 9876543", customer_email:"anna@email.com", delivery_method:"pickup", pickup_time:"Oggi 17:00-19:00", notes:"", subtotal:20, shipping:0, total:20, status:"ready", payment_status:"paid", created_at:new Date(Date.now()-7200000).toISOString(), items:[{name:"Torta della Nonna",quantity:1,price:20}] },
  { id:2845, name:"Luca Verdi", customer_phone:"+39 320 4567890", customer_email:"luca@email.com", delivery_method:"courier", pickup_time:"", notes:"Consegnare in portineria", subtotal:18, shipping:5.90, total:23.90, status:"pending", payment_status:"unpaid", created_at:new Date(Date.now()-1800000).toISOString(), items:[{name:"Papini",quantity:1,price:22},{name:"Pane integrale",quantity:2,price:5.50}] },
  { id:2844, name:"Elena Neri", customer_phone:"+39 347 1122334", customer_email:"elena@email.com", delivery_method:"pickup", pickup_time:"Domani 07:00-10:00", notes:"", subtotal:25, shipping:0, total:25, status:"completed", payment_status:"paid", created_at:new Date(Date.now()-86400000).toISOString(), items:[{name:"Biscotti di Mandorle",quantity:1,price:25}] },
  { id:2843, name:"Paolo Gialli", customer_phone:"+39 339 9988776", customer_email:"paolo@email.com", delivery_method:"reservation", pickup_time:"", notes:"Volevo sapere se avete il pane di segale disponibile", subtotal:12, shipping:0, total:12, status:"pending", payment_status:"unpaid", created_at:new Date(Date.now()-3600000).toISOString(), items:[{name:"Pane di segale",quantity:2,price:6}] },
];

const DEMO_CONTENT = [
  { id:1, section:"hero", key:"hero_slogan", value_it:"L'autentico sapore di Chioggia", value_en:"The authentic taste of Chioggia" },
  { id:2, section:"seo", key:"seo_title", value_it:"Panificio Da Sergio — Chioggia dal 1977", value_en:"Panificio Da Sergio — Chioggia since 1977" },
];

// ── Storage helpers ──

function loadLocal(key, fallback) {
  try {
    var data = localStorage.getItem('admin-' + key);
    if (data) return JSON.parse(data);
  } catch(e) {}
  return fallback;
}

function saveLocal(key, data) {
  try { localStorage.setItem('admin-' + key, JSON.stringify(data)); } catch(e) {}
}

// ── AUTH ──

var DEMO_USER = { email: 'admin@panificio.it', password: 'admin123' };

export async function signIn(email, password) {
  if (!isConfigured) {
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      var session = { user: { email: email }, access_token: 'demo-token', expires_at: Date.now() + 86400000 };
      saveLocal('session', session);
      return { session: session };
    }
    throw new Error('Credenziali non valide. Prova: admin@panificio.it / admin123');
  }
  var result = await supabase.auth.signInWithPassword({ email, password });
  if (result.error) throw result.error;
  return result.data;
}

export async function signOut() {
  if (!isConfigured) {
    localStorage.removeItem('admin-session');
    return;
  }
  var result = await supabase.auth.signOut();
  if (result.error) throw result.error;
}

export async function getSession() {
  if (!isConfigured) {
    var session = loadLocal('session', null);
    return session && session.expires_at > Date.now() ? session : null;
  }
  var result = await supabase.auth.getSession();
  if (result.error) throw result.error;
  return result.data.session;
}

// ── PRODUCTS ──

export async function getProducts() {
  if (!isConfigured) return loadLocal('products', DEMO_PRODUCTS);
  var result = await supabase.from('products').select('*').order('display_order', { ascending: true });
  if (result.error) throw result.error;
  return result.data;
}

export async function createProduct(product) {
  if (!isConfigured) {
    var products = loadLocal('products', DEMO_PRODUCTS);
    var maxId = products.reduce(function(max, p) { return p.id > max ? p.id : max; }, 0);
    var slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100);
    var newProduct = { ...product, id: maxId + 1, slug: slug };
    products.push(newProduct);
    saveLocal('products', products);
    return newProduct;
  }
  var slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100);
  var result = await supabase.from('products').insert([{ ...product, slug }]).select().single();
  if (result.error) throw result.error;
  return result.data;
}

export async function updateProduct(id, updates) {
  if (!isConfigured) {
    var products = loadLocal('products', DEMO_PRODUCTS);
    var idx = products.findIndex(function(p) { return p.id === id; });
    if (idx === -1) throw new Error('Prodotto non trovato');
    products[idx] = { ...products[idx], ...updates };
    saveLocal('products', products);
    return products[idx];
  }
  var result = await supabase.from('products').update(updates).eq('id', id).select().single();
  if (result.error) throw result.error;
  return result.data;
}

export async function deleteProduct(id) {
  if (!isConfigured) {
    var products = loadLocal('products', DEMO_PRODUCTS);
    products = products.filter(function(p) { return p.id !== id; });
    saveLocal('products', products);
    return;
  }
  var result = await supabase.from('products').delete().eq('id', id);
  if (result.error) throw result.error;
}

// ── ORDERS ──

export async function getOrders() {
  if (!isConfigured) return loadLocal('orders', DEMO_ORDERS);
  var result = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (result.error) throw result.error;
  return result.data;
}

export async function updateOrderStatus(id, status, paymentStatus) {
  var updates = { updated_at: new Date().toISOString() };
  if (status) updates.status = status;
  if (paymentStatus !== undefined) updates.payment_status = paymentStatus;

  if (!isConfigured) {
    var orders = loadLocal('orders', DEMO_ORDERS);
    var idx = orders.findIndex(function(o) { return o.id === id; });
    if (idx === -1) throw new Error('Ordine non trovato');
    orders[idx] = { ...orders[idx], ...updates };
    saveLocal('orders', orders);
    return orders[idx];
  }

  var result = await supabase.from('orders').update(updates).eq('id', id).select().single();
  if (result.error) throw result.error;
  return result.data;
}

// ── SITE CONTENT ──

export async function getSiteContent() {
  if (!isConfigured) return loadLocal('content', DEMO_CONTENT);
  var result = await supabase.from('site_content').select('*').order('section', { ascending: true });
  if (result.error) throw result.error;
  return result.data;
}

export async function updateSiteContent(id, value_it, value_en) {
  if (!isConfigured) {
    var content = loadLocal('content', DEMO_CONTENT);
    var idx = content.findIndex(function(c) { return c.id === id; });
    if (idx === -1) throw new Error('Contenuto non trovato');
    content[idx] = { ...content[idx], value_it: value_it, value_en: value_en, updated_at: new Date().toISOString() };
    saveLocal('content', content);
    return content[idx];
  }
  var result = await supabase.from('site_content').update({ value_it: value_it, value_en: value_en, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (result.error) throw result.error;
  return result.data;
}

// ── SITE SETTINGS ──

export async function getSiteSettings() {
  if (!isConfigured) return loadLocal('settings', []);
  var result = await supabase.from('site_content').select('*').eq('section', '_setting').order('key', { ascending: true });
  if (result.error) throw result.error;
  return result.data;
}

export async function updateSiteSetting(id, value) {
  if (!isConfigured) {
    var settings = loadLocal('settings', []);
    var idx = settings.findIndex(function(s) { return s.id === id; });
    if (idx === -1) throw new Error('Impostazione non trovata');
    settings[idx] = { ...settings[idx], value_it: value, value_en: value, updated_at: new Date().toISOString() };
    saveLocal('settings', settings);
    return settings[idx];
  }
  var result = await supabase.from('site_content').update({ value_it: value, value_en: value, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (result.error) throw result.error;
  return result.data;
}

// ── IMAGE UPLOAD ──

export async function uploadProductImage(file, productId) {
  if (!isConfigured) {
    // Return a fake URL (in reality the image won't be stored)
    return '/images/placeholder-product.svg';
  }
  var ext = file.name.split('.').pop();
  var fileName = 'product-' + productId + '-' + Date.now() + '.' + ext;
  var filePath = 'products/' + fileName;

  var uploadResult = await supabase.storage.from('product-images').upload(filePath, file, { cacheControl: '86400', upsert: true });
  if (uploadResult.error) throw uploadResult.error;

  var urlData = supabase.storage.from('product-images').getPublicUrl(filePath);
  return urlData.publicUrl;
}
