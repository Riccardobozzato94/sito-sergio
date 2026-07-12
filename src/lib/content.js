// ═══════════════════════════════════════════════════════════
// Dynamic Content — Loads site_content and site_settings from
// Supabase, merges with i18n defaults and config.js defaults.
// ═══════════════════════════════════════════════════════════

import { supabase } from './supabase/client';
import { translations } from './i18n';
import { BUSINESS, SOCIAL, HOURS } from './config';

// ── Key mapping: section.key -> translation_key ──
// Maps site_content (section, key) to the flat key used in i18n.js
const SECTION_KEY_MAP = {
  'hero.slogan': 'hero_slogan',
  'hero.description': 'hero_description',
  'hero.cta_products': 'hero_cta_products',
  'hero.cta_whatsapp': 'hero_cta_whatsapp',
  'hero.since': 'hero_since',
  'nav.home': 'nav_home',
  'nav.prodotti': 'nav_prodotti',
  'nav.chi_siamo': 'nav_chi_siamo',
  'nav.contatti': 'nav_contatti',
  'howto.title': 'howto_title',
  'howto.subtitle': 'howto_subtitle',
  'howto.step1_title': 'howto_step1_title',
  'howto.step1_desc': 'howto_step1_desc',
  'howto.step2_title': 'howto_step2_title',
  'howto.step2_desc': 'howto_step2_desc',
  'howto.step3_title': 'howto_step3_title',
  'howto.step3_desc': 'howto_step3_desc',
  'products.title': 'products_title',
  'products.subtitle': 'products_subtitle',
  'products.tradition': 'products_tradition',
  'products.all': 'products_all',
  'products.bread': 'products_bread',
  'products.sweets': 'products_sweets',
  'products.specialty': 'products_specialty',
  'products.add_cart': 'products_add_cart',
  'products.added': 'products_added',
  'products.empty': 'products_empty',
  'about.title': 'about_title',
  'about.subtitle': 'about_subtitle',
  'about.story_title': 'about_story_title',
  'about.story_p1': 'about_story_p1',
  'about.story_p2': 'about_story_p2',
  'about.story_p3': 'about_story_p3',
  'about.values_title': 'about_values_title',
  'about.value1_title': 'about_value1_title',
  'about.value1_desc': 'about_value1_desc',
  'about.value2_title': 'about_value2_title',
  'about.value2_desc': 'about_value2_desc',
  'about.value3_title': 'about_value3_title',
  'about.value3_desc': 'about_value3_desc',
  'about.process_title': 'about_process_title',
  'about.process_step1': 'about_process_step1',
  'about.process_step2': 'about_process_step2',
  'about.process_step3': 'about_process_step3',
  'about.process_step4': 'about_process_step4',
  'about.quote_text': 'quote_text',
  'about.quote_author': 'quote_author',
  'gallery.title': 'gallery_title',
  'gallery.subtitle': 'gallery_subtitle',
  'reviews.title': 'reviews_title',
  'reviews.subtitle': 'reviews_subtitle',
  'reviews.count': 'reviews_count',
  'reviews.from': 'reviews_from',
  'reviews.tripadvisor': 'reviews_tripadvisor',
  'reviews.google': 'reviews_google',
  'reviews.see_all_ta': 'reviews_see_all_ta',
  'reviews.see_all_google': 'reviews_see_all_google',
  'contacts.title': 'contacts_title',
  'contacts.subtitle': 'contacts_subtitle',
  'contacts.address_label': 'contacts_address',
  'contacts.phone_label': 'contacts_phone',
  'contacts.email_label': 'contacts_email',
  'contacts.whatsapp_label': 'contacts_whatsapp',
  'contacts.write': 'contacts_write',
  'contacts.map_title': 'contacts_map',
  'contacts.maps_link': 'contacts_maps_link',
  'hours.section_title': 'hours_section_title',
  'hours.subtitle': 'hours_subtitle',
  'hours.open': 'hours_open',
  'hours.closed': 'hours_closed',
  'hours.today': 'hours_today',
  'footer.contacts_title': 'footer_contacts',
  'footer.social_title': 'footer_social',
  'footer.hours_title': 'footer_hours',
  'footer.newsletter_title': 'footer_newsletter',
  'footer.newsletter_text': 'footer_newsletter_text',
  'footer.newsletter_btn': 'footer_newsletter_btn',
  'footer.since': 'footer_since',
  'footer.copyright': 'footer_copyright',
  'footer.tagline': 'footer_tagline',
  'cart.title': 'cart_title',
  'cart.empty_title': 'cart_empty_title',
  'cart.empty_text': 'cart_empty_text',
  'cart.name_placeholder': 'cart_name_placeholder',
  'cart.phone_placeholder': 'cart_phone_placeholder',
  'cart.pickup_label': 'cart_pickup_label',
  'cart.pickup_morning': 'cart_pickup_morning',
  'cart.pickup_afternoon': 'cart_pickup_afternoon',
  'cart.pickup_store': 'cart_pickup_store',
  'cart.notes_placeholder': 'cart_notes_placeholder',
  'cart.total': 'cart_total',
  'cart.whatsapp_btn': 'cart_whatsapp_btn',
  'cart.alert_required': 'cart_alert_required',
  'cart.added_toast': 'cart_added_toast',
  'hours.section_title': 'hours_section_title',
  'hours.open': 'hours_open',
  'hours.closed': 'hours_closed',
  'hours.today': 'hours_today',
};

// ── Settings key mapping: site_settings.key -> config.js path ──
const SETTINGS_KEY_MAP = {
  social_facebook: 'SOCIAL.facebook',
  social_instagram: 'SOCIAL.instagram',
  social_tripadvisor: 'SOCIAL.tripadvisor',
  social_google_reviews: 'SOCIAL.googleReviews',
  social_whatsapp: 'BUSINESS.whatsappNumber',
  business_address: 'BUSINESS.address',
  business_phone: 'BUSINESS.phone',
  business_email: 'BUSINESS.email',
  business_website: 'BUSINESS.website',
};

// ── SECTION GROUPS for organizing the admin panel ──
export const CONTENT_SECTIONS = [
  { id: 'hero', label: '🏠 Hero' },
  { id: 'nav', label: '🧭 Navigazione' },
  { id: 'howto', label: '📋 Come Ordinare' },
  { id: 'products', label: '🥖 Prodotti' },
  { id: 'about', label: '📖 Chi Siamo' },
  { id: 'gallery', label: '🖼️ Gallery' },
  { id: 'reviews', label: '⭐ Recensioni' },
  { id: 'contacts', label: '📞 Contatti' },
  { id: 'hours', label: '🕐 Orari' },
  { id: 'footer', label: '🔻 Footer' },
  { id: 'cart', label: '🛒 Carrello' },
  { id: 'seo', label: '🔍 SEO' },
];

export const SETTINGS_SECTIONS = [
  { id: 'social', label: '🌐 Social Media' },
  { id: 'business', label: '🏪 Attività' },
  { id: 'analytics', label: '📊 Analytics' },
  { id: 'seo', label: '🔍 SEO & Condivisione' },
];

// ── Fetch site_content from Supabase ──
export async function fetchSiteContent() {
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .order('section', { ascending: true })
    .order('key', { ascending: true });
  if (error) throw error;
  return data || [];
}

// ── Fetch site_settings from Supabase (stored in site_content with section='_setting') ──
export async function fetchSiteSettings() {
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .eq('section', '_setting')
    .order('key', { ascending: true });
  if (error) throw error;
  return data || [];
}

// ── Merge site_content with i18n defaults ──
// Returns a translations-like object with dynamic overrides
export function mergeTranslations(lang, contentRows) {
  // Start with static defaults
  const base = translations[lang] || translations.it;
  const merged = { ...base };

  if (!contentRows || contentRows.length === 0) return merged;

  // Override with dynamic content
  for (const row of contentRows) {
    const mapKey = `${row.section}.${row.key}`;
    const tKey = SECTION_KEY_MAP[mapKey];
    if (tKey && merged.hasOwnProperty(tKey)) {
      const value = lang === 'en' ? row.value_en : row.value_it;
      if (value && value.trim()) {
        merged[tKey] = value;
      }
    }
  }

  return merged;
}

// ── Merge site_settings (from site_content section='_setting') with config.js defaults ──
// settingsRows are rows from site_content with section='_setting'
// Each row has: { key, value_it (contains the value), value_en (same) }
export function mergeSettings(settingsRows) {
  const merged = {
    business: { ...BUSINESS },
    social: { ...SOCIAL },
    hours: [...HOURS],
    analytics: { gaId: '', metaPixel: '' },
    seo: { ogImage: '/images/og-image.jpg', ogTitle: '', ogDescription: '' },
  };

  if (!settingsRows || settingsRows.length === 0) return merged;

  for (const row of settingsRows) {
    const value = row.value_it || ''; // Settings use value_it for the value
    switch (row.key) {
      case 'social_facebook': merged.social.facebook = value || SOCIAL.facebook; break;
      case 'social_instagram': merged.social.instagram = value || SOCIAL.instagram; break;
      case 'social_tripadvisor': merged.social.tripadvisor = value || SOCIAL.tripadvisor; break;
      case 'social_google_reviews': merged.social.googleReviews = value || SOCIAL.googleReviews; break;
      case 'social_whatsapp': merged.business.whatsappNumber = value || BUSINESS.whatsappNumber; break;
      case 'business_address': merged.business.address = value || BUSINESS.address; break;
      case 'business_phone': merged.business.phone = value || BUSINESS.phone; break;
      case 'business_email': merged.business.email = value || BUSINESS.email; break;
      case 'business_website': merged.business.website = value || BUSINESS.website; break;
      case 'business_hours_mon_fri': merged.hours[0].hours = value || HOURS[0].hours; break;
      case 'business_hours_sat': merged.hours[5].hours = value || HOURS[5].hours; break;
      case 'business_hours_sun': merged.hours[6].hours = value || HOURS[6].hours; break;
      case 'analytics_ga_id': merged.analytics.gaId = value; break;
      case 'analytics_meta_pixel': merged.analytics.metaPixel = value; break;
      case 'seo_og_image': merged.seo.ogImage = value; break;
      case 'seo_og_title': merged.seo.ogTitle = value; break;
      case 'seo_og_description': merged.seo.ogDescription = value; break;
    }
  }

  return merged;
}

// ── Update hours weekday labels (Mon-Fri) ──
export function updateWeekdayHours(settings, newValue) {
  const dayLabels = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'];
  const enLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const updated = [...settings.hours];
  for (let i = 0; i < 5; i++) {
    if (updated[i]) {
      updated[i] = { ...updated[i], hours: newValue };
    }
  }
  return { ...settings, hours: updated };
}
