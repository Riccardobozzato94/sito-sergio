// ═══════════════════════════════════════════════════════════
// Admin API — Operations for the admin dashboard
// Falls back to localStorage demo data when Supabase is not configured
// ═══════════════════════════════════════════════════════════

import { supabase, isConfigured } from './supabase/client';

// ═══════════════════════════════════════════════════════════
// Direct Supabase REST API — bypasses supabase-js client
// session management. Uses JWT from app's localStorage for Auth,
// but also works with just the anon key for permitted operations.
// ═══════════════════════════════════════════════════════════

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/** Recupera il JWT salvato in admin-session */
function storedToken() {
  const s = loadLocal('session', null);
  return (s && s.access_token && s.access_token !== 'demo-token') ? s.access_token : null;
}

/** Prepara headers standard per le REST API di Supabase.
 *  Usa solo l'anon key (non il JWT utente) perché le policy RLS
 *  per il ruolo anon permettono già tutte le operazioni CRUD.
 *  Mandare il JWT farebbe scattare il ruolo authenticated che
 *  potrebbe non avere le stesse policy, causando update silenziosi
 *  che tornano [] invece di aggiornare davvero. */
function apiHeaders() {
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };
}

/** Fa una chiamata HTTP diretta a Supabase REST API.
 *  Restituisce l'array JSON parsato ([] se risposta vuota).
 *  Lancia errore per HTTP non-ok. */
async function rest(method, path, body) {
  if (!SUPABASE_URL) throw new Error('Supabase non configurato');
  const url = SUPABASE_URL + '/rest/v1/' + path;
  console.log(`[rest] ${method} ${url}`, body ? JSON.stringify(body).slice(0,200) : '');
  const res = await fetch(url, {
    method,
    headers: apiHeaders(),
    body: body ? JSON.stringify(body) : void 0,
  });
  const txt = await res.text();
  console.log(`[rest] Response status: ${res.status}, body length: ${txt.length}`);
  if (!res.ok) {
    let msg = txt;
    try { const j = JSON.parse(txt); msg = j.message || j.msg || txt; } catch {}
    console.error(`[rest] HTTP ${res.status}: ${msg}`);
    throw new Error(msg);
  }
  if (!txt || txt === '[]') {
    console.log('[rest] Empty response, returning []');
    return [];
  }
  try {
    const parsed = JSON.parse(txt);
    console.log(`[rest] Parsed ${Array.isArray(parsed) ? parsed.length + ' items' : 'object'}`);
    return parsed;
  } catch (e) {
    console.error('[rest] JSON parse error:', e.message, 'text:', txt.slice(0, 300));
    return [];
  }
}

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
  // Try Supabase auth first if configured
  if (isConfigured) {
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (result.data?.session) {
        saveLocal('session', {
          user: result.data.session.user,
          access_token: result.data.session.access_token,
          refresh_token: result.data.session.refresh_token,
          expires_at: Date.parse(result.data.session.expires_at) || (Date.now() + 3600000),
        });
      }
      return result.data;
    } catch (e) {
      // Se Supabase Auth fallisce, prova il fallback demo (solo per le credenziali demo)
      if (!(email === DEMO_USER.email && password === DEMO_USER.password)) {
        throw e;
      }
    }
  }

  // Fallback demo credentials (funziona anche offline / senza Supabase)
  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    const session = { user: { email: email }, access_token: 'demo-token', expires_at: Date.now() + 86400000 };
    saveLocal('session', session);
    return { session: session };
  }
  throw new Error('Credenziali non valide. Prova: admin@panificio.it / admin123');
}

export async function signOut() {
  localStorage.removeItem('admin-session');
  if (isConfigured) {
    const result = await supabase.auth.signOut();
    if (result.error) throw result.error;
  }
}

export async function getSession() {
  const localSession = loadLocal('session', null);
  if (localSession && localSession.expires_at > Date.now()) {
    // Ensure supabase client has this session (in case it was lost)
    if (isConfigured && localSession.access_token && localSession.access_token !== 'demo-token') {
      supabase.auth.setSession({
        access_token: localSession.access_token,
        refresh_token: localSession.refresh_token || '',
      }).catch(function() {
        // Silently ignore — the fallback will handle it
      });
    }
    return localSession;
  }
  if (localSession) {
    localStorage.removeItem('admin-session');
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
  const data = await rest('GET', 'products?select=*&order=display_order.asc');
  if (!data) return [];
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
  const safe = sanitizeProductPayload({ ...product, slug });
  const data = await rest('POST', 'products?select=id,name,slug', safe);
  if (!data || data.length === 0) throw new Error('Inserimento fallito: nessuna riga creata.');
  return data[0];
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

  if (updates.name) updates.slug = generateSlug(updates.name);
  const keys = Object.keys(updates);

  // Se non ci sono campi da aggiornare, esci senza errore
  if (keys.length === 0) return { id };

  // Manda il payload direttamente
  const data = await rest('PATCH', 'products?id=eq.' + Number(id) + '&select=id,name,slug', updates);

  // Fallback supabase-js
  if (!data || data.length === 0) {
    if (isConfigured) {
      const result = await supabase.from('products').update(updates).eq('id', Number(id)).select('id,name,slug');
      if (!result.error && result.data && result.data.length > 0) return result.data[0];
    }
  }
  if (!data || data.length === 0) throw new Error('Nessun prodotto aggiornato: ID non trovato o permessi insufficienti.');
  return data[0];
}

export async function deleteProduct(id) {
  if (!isConfigured) {
    let products = loadLocal('products', DEMO_PRODUCTS);
    products = products.filter(function(p) { return p.id !== id; });
    saveLocal('products', products);
    return;
  }

  try {
    const data = await rest('DELETE', 'products?id=eq.' + Number(id) + '&select=id');
    if (!data || data.length === 0) throw new Error('Nessuna riga eliminata.');
  } catch (e) {
    if (e.message && e.message.indexOf('foreign key') !== -1)
      throw new Error('Prodotto presente in ordini esistenti. Rimuovi prima i riferimenti.');
    if (e.message && e.message.indexOf('Nessuna riga') !== -1)
      throw new Error('Nessuna riga eliminata: potresti non avere i permessi necessari.');
    throw e;
  }
}

// ── ORDERS ──

export async function getOrders() {
  if (!isConfigured) return loadLocal('orders', DEMO_ORDERS);
  const data = await rest('GET', 'orders?select=*&order=created_at.desc');
  if (!data) return [];
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

  const data = await rest('PATCH', 'orders?id=eq.' + id + '&select=id', updates);
  if (!data || data.length === 0) throw new Error('Nessun ordine aggiornato: ID non trovato.');
  return data[0];
}

// ── SITE CONTENT ──

export async function getSiteContent() {
  if (!isConfigured) return loadLocal('content', DEMO_CONTENT);
  const data = await rest('GET', 'site_content?select=*&order=section.asc');
  if (!data) return [];
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
  const data = await rest('PATCH', 'site_content?id=eq.' + id + '&select=id', {
    value_it: value_it, value_en: value_en, updated_at: new Date().toISOString()
  });
  if (!data || data.length === 0) throw new Error('Nessun contenuto aggiornato: ID non trovato.');
  return data[0];
}

// ── SITE SETTINGS ──

export async function getSiteSettings() {
  if (!isConfigured) return loadLocal('settings', DEMO_SETTINGS);
  const data = await rest('GET', 'site_content?select=*&section=eq._setting&order=key.asc');
  if (!data) return [];
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
  const data = await rest('PATCH', 'site_content?id=eq.' + id + '&select=id', {
    value_it: value, value_en: value, updated_at: new Date().toISOString()
  });
  if (!data || data.length === 0) throw new Error('Nessuna impostazione aggiornata: ID non trovato.');
  return data[0];
}

// ── CUSTOMERS ──

export async function getCustomers() {
  if (!isConfigured) return [];
  const data = await rest('GET', 'customers?select=*&order=name.asc');
  return data || [];
}

export async function createCustomer(data) {
  if (!isConfigured) {
    throw new Error('Modalità demo: impossibile creare clienti.');
  }
  const result = await rest('POST', 'customers?select=*', data);
  if (!result || result.length === 0) throw new Error('Creazione cliente fallita.');
  return result[0];
}

export async function updateCustomer(id, updates) {
  if (!isConfigured) throw new Error('Modalità demo: impossibile aggiornare clienti.');
  const data = await rest('PATCH', 'customers?id=eq.' + Number(id) + '&select=*', updates);
  if (!data || data.length === 0) throw new Error('Nessun cliente aggiornato: ID non trovato.');
  return data[0];
}

export async function deleteCustomer(id) {
  if (!isConfigured) throw new Error('Modalità demo: impossibile eliminare clienti.');
  const data = await rest('DELETE', 'customers?id=eq.' + Number(id) + '&select=id');
  if (!data || data.length === 0) throw new Error('Nessun cliente eliminato.');
  return data[0];
}

/** Importa clienti da testo CSV (nome;telefono;email;note).
 *  Ignora la prima riga (header). Salta righe vuote. */
export async function importCustomersCSV(csvText) {
  if (!isConfigured) throw new Error('Modalità demo: impossibile importare clienti.');
  const lines = csvText.split('\n').filter(Boolean);
  const rows = lines.slice(1); // skip header
  const results = { imported: 0, skipped: 0, errors: [] };
  for (const line of rows) {
    const parts = line.split(';').map(s => s.trim());
    const [name, phone, email, notes] = parts;
    if (!name) { results.skipped++; continue; }
    try {
      await createCustomer({ name, phone: phone || null, email: email || null, notes: notes || '' });
      results.imported++;
    } catch (e) {
      // Skip duplicates silently
      if (e.message && (e.message.indexOf('uq_customers_phone') !== -1 || e.message.indexOf('uq_customers_email') !== -1)) {
        results.skipped++;
      } else {
        results.errors.push(name + ': ' + e.message);
      }
    }
  }
  return results;
}

/** Restituisce gli ordini di un cliente */
export async function getCustomerOrders(customerId) {
  if (!isConfigured) return [];
  const data = await rest('GET', 'orders?select=*&customer_id=eq.' + Number(customerId) + '&order=created_at.desc');
  return data || [];
}

// ── IMAGE UPLOAD ──

/**
 * Carica un singolo file immagine su Supabase Storage e ne restituisce l'URL pubblico.
 */
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

  const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
  if (!urlData || !urlData.publicUrl) throw new Error('URL immagine non generato');
  return urlData.publicUrl;
}

/**
 * Carica più file immagine contemporaneamente.
 * Restituisce un array di URL pubblici.
 */
export async function uploadProductImages(files, productId) {
  const urls = [];
  for (const file of files) {
    const url = await uploadProductImage(file, productId);
    urls.push(url);
  }
  return urls;
}

/**
 * Serializza un array di URL immagine in formato da salvare su `image_url`.
 * Produce un JSON string array, oppure una stringa singola se c'è 1 solo URL.
 */
export function serializeImageUrls(urls) {
  if (!urls || urls.length === 0) return '';
  if (urls.length === 1) return urls[0];
  return JSON.stringify(urls);
}

// ── GALLERY PHOTOS ──

/** Recupera tutte le foto della galleria, ordinate per sort_order */
export async function getGalleryPhotos() {
  console.log('[getGalleryPhotos] isConfigured:', isConfigured, 'SUPABASE_URL:', !!SUPABASE_URL);
  if (!isConfigured) {
    console.log('[getGalleryPhotos] DEMO MODE — returning localStorage or static fallback');
    const local = loadLocal('gallery', null);
    const result = local && local.length > 0 ? local : [
      { id:1, image_url:'/images/IMG-20260415-WA0000.jpg', alt_it:'Pane artigianale appena sfornato — Panificio Da Sergio Chioggia', alt_en:'Freshly baked artisan bread — Panificio Da Sergio Chioggia', sort_order:1 },
      { id:2, image_url:'/images/IMG-20260415-WA0001.jpg', alt_it:'Prodotti da forno tradizionali — Panificio artigianale Chioggia', alt_en:'Traditional bakery products — Artisan bakery Chioggia', sort_order:2 },
      { id:3, image_url:'/images/IMG-20260415-WA0002.jpg', alt_it:'Dolci tipici veneziani — Panificio Da Sergio', alt_en:'Traditional Venetian sweets — Panificio Da Sergio', sort_order:3 },
      { id:4, image_url:'/images/IMG-20260415-WA0007.jpg', alt_it:'Forno e lavorazione artigianale — Panificio Da Sergio Chioggia', alt_en:'Oven and artisan processing — Panificio Da Sergio Chioggia', sort_order:4 },
      { id:5, image_url:'/images/IMG-20260415-WA0008.jpg', alt_it:'Biscotti e dolci artigianali — Panificio Da Sergio Chioggia', alt_en:'Artisan biscuits and pastries — Panificio Da Sergio Chioggia', sort_order:5 },
      { id:6, image_url:'/images/IMG-20260411-WA0005.jpg', alt_it:'Specialità del Panificio Da Sergio — Chioggia', alt_en:'Specialties of Panificio Da Sergio — Chioggia', sort_order:6 },
      { id:7, image_url:'/images/IMG-20260411-WA0006.jpg', alt_it:'Pane e prodotti tipici — Panificio Da Sergio', alt_en:'Bread and typical products — Panificio Da Sergio', sort_order:7 },
      { id:8, image_url:'/images/IMG-20260410-WA0013.jpg', alt_it:'Dolci e biscotti artigianali — Panificio Da Sergio Chioggia', alt_en:'Artisan pastries and biscuits — Panificio Da Sergio Chioggia', sort_order:8 },
      { id:9, image_url:'/images/IMG-20260415-WA0015.jpg', alt_it:'Interno del Panificio Da Sergio — Chioggia', alt_en:'Inside Panificio Da Sergio — Chioggia', sort_order:9 },
    ];
    console.log('[getGalleryPhotos] DEMO result:', result ? result.length + ' photos' : 'null/undefined');
    return result;
  }
  try {
    console.log('[getGalleryPhotos] Calling REST API...');
    const data = await rest('GET', 'gallery_photos?select=*&order=sort_order.asc');
    console.log('[getGalleryPhotos] REST API result:', data ? data.length + ' photos' : 'null', data);
    if (!data || data.length === 0) {
      // Fallback: prova via supabase-js
      console.log('[getGalleryPhotos] REST returned empty, trying supabase-js fallback...');
      const { data: supabaseData, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) {
        console.error('[getGalleryPhotos] supabase-js fallback error:', error);
        throw error;
      }
      console.log('[getGalleryPhotos] supabase-js fallback result:', supabaseData ? supabaseData.length + ' photos' : 'null');
      return supabaseData || [];
    }
    return data;
  } catch (e) {
    console.error('[getGalleryPhotos] Error:', e);
    throw e;
  }
}

/** Crea una nuova foto galleria */
export async function createGalleryPhoto(data) {
  if (!isConfigured) {
    const photos = loadLocal('gallery', []);
    const maxId = photos.reduce(function(max, p) { return p.id > max ? p.id : max; }, 0);
    const maxOrder = photos.reduce(function(max, p) { return p.sort_order > max ? p.sort_order : max; }, 0);
    const newPhoto = { ...data, id: maxId + 1, sort_order: maxOrder + 1, created_at: new Date().toISOString() };
    photos.push(newPhoto);
    saveLocal('gallery', photos);
    return newPhoto;
  }
  const result = await rest('POST', 'gallery_photos?select=*', data);
  if (!result || result.length === 0) {
    // Fallback supabase-js (usa JWT utente autenticato)
    if (isConfigured) {
      const fb = await supabase.from('gallery_photos').insert(data).select('*');
      if (!fb.error && fb.data && fb.data.length > 0) return fb.data[0];
    }
    throw new Error('Creazione foto fallita.');
  }
  return result[0];
}

/** Aggiorna una foto galleria (alt, sort_order, ecc.) */
export async function updateGalleryPhoto(id, updates) {
  if (!isConfigured) {
    const photos = loadLocal('gallery', []);
    const idx = photos.findIndex(function(p) { return p.id === id; });
    if (idx === -1) throw new Error('Foto non trovata');
    photos[idx] = { ...photos[idx], ...updates, updated_at: new Date().toISOString() };
    saveLocal('gallery', photos);
    return photos[idx];
  }
  const data = await rest('PATCH', 'gallery_photos?id=eq.' + Number(id) + '&select=*', {
    ...updates,
    updated_at: new Date().toISOString(),
  });
  // Fallback supabase-js (usa JWT utente autenticato)
  if (!data || data.length === 0) {
    if (isConfigured) {
      const fb = await supabase.from('gallery_photos').update(updates).eq('id', Number(id)).select('*');
      if (!fb.error && fb.data && fb.data.length > 0) return fb.data[0];
    }
    throw new Error('Nessuna foto aggiornata: ID non trovato o permessi insufficienti.');
  }
  return data[0];
}

/** Elimina una foto galleria */
export async function deleteGalleryPhoto(id) {
  if (!isConfigured) {
    let photos = loadLocal('gallery', []);
    photos = photos.filter(function(p) { return p.id !== id; });
    saveLocal('gallery', photos);
    return;
  }
  const data = await rest('DELETE', 'gallery_photos?id=eq.' + Number(id) + '&select=id');
  // Fallback supabase-js (usa JWT utente autenticato)
  if (!data || data.length === 0) {
    if (isConfigured) {
      const fb = await supabase.from('gallery_photos').delete().eq('id', Number(id)).select('id');
      if (!fb.error && fb.data && fb.data.length > 0) return fb.data[0];
    }
    throw new Error('Nessuna foto eliminata: ID non trovato o permessi insufficienti.');
  }
  return data[0];
}

/** Carica una foto per la galleria su Supabase Storage e restituisce l'URL pubblico */
export async function uploadGalleryImage(file) {
  if (!isConfigured) {
    console.warn('[Admin] Modalità demo: le immagini non vengono salvate. Configura Supabase per upload reali.');
    return URL.createObjectURL(file);
  }
  const ext = file.name.split('.').pop();
  const fileName = 'gallery-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
  const filePath = fileName;

  // Timeout 30s per evitare upload bloccato senza feedback
  const uploadPromise = supabase.storage.from('gallery-images').upload(filePath, file, {
    cacheControl: '86400',
    upsert: true,
    contentType: file.type || 'image/jpeg',
  });
  const timeout = new Promise(function(_, reject) {
    setTimeout(function() { reject(new Error('Timeout upload dopo 30s')); }, 30000);
  });
  const uploadResult = await Promise.race([uploadPromise, timeout]);

  if (uploadResult.error) throw new Error('Upload storage: ' + uploadResult.error.message);

  const { data: urlData } = supabase.storage.from('gallery-images').getPublicUrl(filePath);
  if (!urlData || !urlData.publicUrl) throw new Error('URL immagine non generato da storage');
  return urlData.publicUrl;
}

/** Riordina le foto della galleria. Accetta un array di { id, sort_order } */
export async function reorderGalleryPhotos(orderedIds) {
  if (!isConfigured) {
    const photos = loadLocal('gallery', []);
    for (let i = 0; i < orderedIds.length; i++) {
      const idx = photos.findIndex(function(p) { return p.id === orderedIds[i]; });
      if (idx !== -1) photos[idx].sort_order = i + 1;
    }
    saveLocal('gallery', photos);
    return;
  }
  // Esegue PATCH in parallelo per ogni foto via rest()
  const promises = orderedIds.map(function(id, index) {
    return rest('PATCH', 'gallery_photos?id=eq.' + Number(id) + '&select=id', {
      sort_order: index + 1,
      updated_at: new Date().toISOString(),
    }).catch(function() {
      // Se rest() fallisce (RLS anon), prova con supabase-js
      return supabase.from('gallery_photos').update({
        sort_order: index + 1,
        updated_at: new Date().toISOString(),
      }).eq('id', Number(id)).select('id');
    });
  });
  await Promise.all(promises);
}
