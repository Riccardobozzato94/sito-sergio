'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase-client';
import { useToast } from '@/components/ToastProvider';
import { Save, RefreshCw, Search, FileText, Globe, BarChart3, Tag, X, Check, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

// ── Content sections metadata ──
const CONTENT_SECTIONS = [
  { id: 'hero', label: '🏠 Hero' },
  { id: 'nav', label: '🧭 Navigazione' },
  { id: 'about', label: '📖 Chi Siamo' },
  { id: 'howto', label: '📋 Come Ordinare' },
  { id: 'products', label: '🥖 Prodotti' },
  { id: 'gallery', label: '🖼️ Gallery' },
  { id: 'reviews', label: '⭐ Recensioni' },
  { id: 'contacts', label: '📞 Contatti' },
  { id: 'hours', label: '🕐 Orari' },
  { id: 'footer', label: '🔻 Footer' },
  { id: 'cart', label: '🛒 Carrello' },
  { id: 'seo', label: '🔍 SEO' },
];

// ── Settings labels ──
const SETTING_LABELS: Record<string, string> = {
  social_facebook: 'Facebook URL',
  social_instagram: 'Instagram URL',
  social_tripadvisor: 'TripAdvisor URL',
  social_google_reviews: 'Google Reviews URL',
  social_whatsapp: 'Numero WhatsApp (con prefisso)',
  business_address: 'Indirizzo',
  business_phone: 'Telefono',
  business_email: 'Email',
  business_website: 'Sito Web',
  business_partita_iva: 'P.IVA',
  business_hours_mon: 'Orario Lunedì',
  business_hours_mon_fri: 'Orario Mar-Ven',
  business_hours_sat: 'Orario Sabato',
  business_hours_sun: 'Orario Domenica',
  analytics_ga_id: 'Google Analytics ID',
  analytics_meta_pixel: 'Meta Pixel ID',
  seo_og_image: 'Immagine Open Graph',
  seo_og_title: 'Titolo Open Graph',
  seo_og_description: 'Descrizione Open Graph',
};

const TABS = [
  { id: 'texts', label: 'Testi del Sito', icon: FileText },
  { id: 'settings', label: 'Social & Impostazioni', icon: Globe },
  { id: 'analytics', label: 'Analytics & SEO', icon: BarChart3 },
];

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────
interface SiteContentRow {
  id: number;
  section: string;
  key: string;
  value_it: string;
  value_en: string;
  updated_at?: string;
}

interface SettingsRow {
  id: number;
  key: string;
  value: string;
  section: string;
  label: string;
  type: string;
}

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState('texts');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl text-[#f0ece6]">Gestione Contenuti</h1>
        <p className="text-[#7a7570] text-sm mt-1">
          Modifica testi del sito, social link, analytics e dati attività.
        </p>
        <div className="section-line mt-4" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#161616] rounded-xl p-1 border border-[#2a2725] w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-[#0e0e0e] shadow-lg shadow-primary/20'
                  : 'text-[#9a9590] hover:text-[#f0ece6] hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      {activeTab === 'texts' && <TextsPanel />}
      {activeTab === 'settings' && <SettingsPanel />}
      {activeTab === 'analytics' && <AnalyticsPanel />}
    </div>
  );
}

// ══════════════════════════════════════════
// TAB 1: TESTI DEL SITO (site_content)
// ══════════════════════════════════════════
function TextsPanel() {
  const { success, error: toastError } = useToast();
  const [entries, setEntries] = useState<SiteContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [editMode, setEditMode] = useState<Record<number, { value_it: string; value_en: string }>>({});
  const [search, setSearch] = useState('');

  async function loadContent() {
    setLoading(true);
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('section', { ascending: true })
      .order('key', { ascending: true });
    if (error) { toastError('Errore', error.message); return; }
    setEntries(data || []);
    setLoading(false);
  }

  useEffect(() => { loadContent(); }, []);

  // Auto-expand all sections
  useEffect(() => {
    if (entries.length > 0) {
      const sections = [...new Set(entries.map(e => e.section))];
      const expanded: Record<string, boolean> = {};
      sections.forEach(s => { expanded[s] = true; });
      setExpandedSections(expanded);
    }
  }, [loading]);

  function getSectionLabel(id: string) {
    return CONTENT_SECTIONS.find(s => s.id === id)?.label || id;
  }

  // Group by section
  const grouped: Record<string, SiteContentRow[]> = {};
  for (const entry of entries) {
    const section = entry.section || 'other';
    if (!grouped[section]) grouped[section] = [];
    // Apply search filter
    if (search) {
      const q = search.toLowerCase();
      if (
        entry.key.toLowerCase().includes(q) ||
        (entry.value_it || '').toLowerCase().includes(q) ||
        (entry.value_en || '').toLowerCase().includes(q)
      ) {
        grouped[section].push(entry);
      }
    } else {
      grouped[section].push(entry);
    }
  }

  // Remove empty sections after filtering
  for (const key of Object.keys(grouped)) {
    if (grouped[key].length === 0) delete grouped[key];
  }

  if (loading) {
    return (
      <div className="text-center py-16 text-[#5a5650]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
        Caricamento contenuti...
      </div>
    );
  }

  return (
    <div>
      {/* Search + Refresh */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a5650]" />
          <input
            type="text"
            placeholder="Cerca testo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#161616] border border-[#2a2725] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#f0ece6] placeholder:text-[#5a5650] focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <button
          onClick={loadContent}
          className="p-2.5 rounded-xl border border-[#2a2725] text-[#9a9590] hover:text-[#f0ece6] hover:border-white/20 transition-all"
          title="Ricarica"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Content sections */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 text-[#5a5650]">
          <FileText size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">Nessun contenuto trovato</p>
        </div>
      ) : (
        Object.entries(grouped).map(([section, items]) => {
          const isExpanded = expandedSections[section];
          return (
            <div key={section} className="mb-3">
              {/* Section header */}
              <button
                onClick={() => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))}
                className="w-full flex items-center gap-2 py-2.5 px-1 border-b border-[#2a2725]/50 hover:bg-white/[0.01] rounded-lg transition-colors"
              >
                {isExpanded ? <ChevronDown size={14} className="text-[#5a5650]" /> : <ChevronRight size={14} className="text-[#5a5650]" />}
                <h2 className="text-primary font-heading text-xs uppercase tracking-widest">{getSectionLabel(section)}</h2>
                <span className="text-[#5a5650] text-[10px] bg-white/5 px-2 py-0.5 rounded-full ml-1">{items.length}</span>
              </button>

              {isExpanded && (
                <div className="space-y-1.5 mt-1.5">
                  {items.map(entry => {
                    const isEditing = !!editMode[entry.id];
                    const edits = editMode[entry.id];

                    return (
                      <div
                        key={entry.id}
                        className={`rounded-xl overflow-hidden transition-all ${
                          isEditing
                            ? 'bg-[#25201a] border border-primary/20 shadow-lg shadow-primary/5'
                            : 'bg-[#161616] border border-[#2a2725] hover:border-[#3a3530]'
                        }`}
                      >
                        {isEditing ? (
                          /* EDIT MODE */
                          <div className="p-4 sm:p-5">
                            <div className="flex items-center justify-between mb-4">
                              <code className="text-[#9a9590] text-[11px] font-mono">{entry.key}</code>
                              <button
                                onClick={() => {
                                  const next = { ...editMode };
                                  delete next[entry.id];
                                  setEditMode(next);
                                }}
                                className="text-[#5a5650] hover:text-[#f0ece6] p-1 rounded hover:bg-white/[0.06] transition-all"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <label className="flex items-center gap-1.5 text-[#9a9590] text-[10px] uppercase tracking-wider mb-1.5">
                                  <span className="inline-block w-4 h-2.5 bg-blue-600 rounded-sm" />
                                  Italiano
                                </label>
                                <textarea
                                  value={edits?.value_it || ''}
                                  onChange={e => setEditMode(prev => ({
                                    ...prev,
                                    [entry.id]: { ...prev[entry.id], value_it: e.target.value },
                                  }))}
                                  rows={3}
                                  className="w-full bg-[#0e0e0e] border border-[#2a2725] rounded-lg px-3.5 py-2.5 text-sm text-[#f0ece6] focus:outline-none focus:border-primary resize-none transition-colors"
                                />
                              </div>
                              <div>
                                <label className="flex items-center gap-1.5 text-[#9a9590] text-[10px] uppercase tracking-wider mb-1.5">
                                  <span className="inline-block w-4 h-2.5 bg-red-600 rounded-sm" />
                                  English
                                </label>
                                <textarea
                                  value={edits?.value_en || ''}
                                  onChange={e => setEditMode(prev => ({
                                    ...prev,
                                    [entry.id]: { ...prev[entry.id], value_en: e.target.value },
                                  }))}
                                  rows={3}
                                  className="w-full bg-[#0e0e0e] border border-[#2a2725] rounded-lg px-3.5 py-2.5 text-sm text-[#f0ece6] focus:outline-none focus:border-primary resize-none transition-colors"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#2a2725]/50">
                              <button
                                onClick={() => {
                                  const next = { ...editMode };
                                  delete next[entry.id];
                                  setEditMode(next);
                                }}
                                className="px-4 py-2 rounded-lg border border-[#2a2725] text-[#9a9590] hover:text-[#f0ece6] text-xs transition-colors"
                              >
                                Annulla
                              </button>
                              <button
                                onClick={async () => {
                                  const edits = editMode[entry.id];
                                  if (!edits) return;
                                  setSaving(entry.id);
                                  const supabase = createBrowserClient();
                                  const { error } = await supabase
                                    .from('site_content')
                                    .update({ value_it: edits.value_it, value_en: edits.value_en, updated_at: new Date().toISOString() })
                                    .eq('id', entry.id);
                                  if (error) { toastError('Errore', error.message); } else { success('Testo aggiornato', entry.key); }
                                  const next = { ...editMode };
                                  delete next[entry.id];
                                  setEditMode(next);
                                  await loadContent();
                                  setSaving(null);
                                }}
                                disabled={saving === entry.id}
                                className="px-5 py-2 rounded-lg bg-primary text-[#0e0e0e] font-bold text-xs hover:bg-primary-light disabled:opacity-50 flex items-center gap-1.5 transition-all"
                              >
                                {saving === entry.id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-[#0e0e0e]/30 border-t-[#0e0e0e] rounded-full animate-spin" />
                                ) : <Save size={14} />}
                                {saving === entry.id ? 'Salvataggio...' : 'Salva'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* VIEW MODE */
                          <button
                            onClick={() => {
                              setEditMode(prev => ({
                                ...prev,
                                [entry.id]: { value_it: entry.value_it || '', value_en: entry.value_en || '' },
                              }));
                            }}
                            className="w-full text-left p-3.5 hover:bg-white/[0.02] transition-colors"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Tag size={10} className="text-[#5a5650]" />
                              <code className="text-[#9a9590] text-[10px] font-mono">{entry.key}</code>
                              {entry.updated_at && (
                                <span className="text-[#5a5650] text-[9px] font-mono ml-auto">
                                  {new Date(entry.updated_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                                </span>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-start gap-2.5">
                                <span className="text-[9px] font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded shrink-0 mt-0.5">IT</span>
                                <p className="text-[#f0ece6]/90 text-sm leading-relaxed line-clamp-2">
                                  {entry.value_it || <span className="text-[#5a5650] italic">vuoto</span>}
                                </p>
                              </div>
                              <div className="flex items-start gap-2.5">
                                <span className="text-[9px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded shrink-0 mt-0.5">EN</span>
                                <p className="text-[#9a9590] text-sm leading-relaxed line-clamp-2">
                                  {entry.value_en || <span className="text-[#5a5650] italic">empty</span>}
                                </p>
                              </div>
                            </div>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// TAB 2: SOCIAL & IMPOSTAZIONI
// ══════════════════════════════════════════
function SettingsPanel() {
  const { success, error: toastError } = useToast();
  const [settings, setSettings] = useState<SettingsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Record<number, string>>({});

  async function load() {
    setLoading(true);
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('section', '_setting')
      .order('key', { ascending: true });
    if (error) { toastError('Errore', error.message); return; }
    setSettings(data || []);
    const vals: Record<number, string> = {};
    (data || []).forEach((s: any) => { vals[s.id] = s.value_it || ''; });
    setEditValues(vals);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const grouped: Record<string, SettingsRow[]> = {};
  for (const s of settings) {
    const section = SETTING_SECTIONS[s.key] || 'general';
    if (!grouped[section]) grouped[section] = [];
    grouped[section].push(s);
  }

  if (loading) {
    return <div className="text-center py-16 text-[#5a5650]">Caricamento impostazioni...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Social */}
      {grouped.social && (
        <div className="bg-[#161616] rounded-2xl border border-[#2a2725] p-5">
          <h3 className="font-heading text-primary text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
            <Globe size={14} />
            Social Media
          </h3>
          <div className="space-y-4">
            {grouped.social.map(setting => (
              <SettingsField
                key={setting.id}
                setting={setting}
                value={editValues[setting.id] || ''}
                onChange={val => setEditValues(prev => ({ ...prev, [setting.id]: val }))}
                onSave={async () => {
                  setSavingId(setting.id);
                  const supabase = createBrowserClient();
                  const { error } = await supabase
                    .from('site_content')
                    .update({ value_it: editValues[setting.id] || '', updated_at: new Date().toISOString() })
                    .eq('id', setting.id);
                  if (error) { toastError('Errore', error.message); } else { success('Salvato', setting.key); }
                  setSavingId(null);
                }}
                saving={savingId === setting.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Business */}
      {grouped.business && (
        <div className="bg-[#161616] rounded-2xl border border-[#2a2725] p-5">
          <h3 className="font-heading text-primary text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileText size={14} />
            Dati Attività
          </h3>
          <div className="space-y-4">
            {grouped.business.map(setting => (
              <SettingsField
                key={setting.id}
                setting={setting}
                value={editValues[setting.id] || ''}
                onChange={val => setEditValues(prev => ({ ...prev, [setting.id]: val }))}
                onSave={async () => {
                  setSavingId(setting.id);
                  const supabase = createBrowserClient();
                  const { error } = await supabase
                    .from('site_content')
                    .update({ value_it: editValues[setting.id] || '', updated_at: new Date().toISOString() })
                    .eq('id', setting.id);
                  if (error) { toastError('Errore', error.message); } else { success('Salvato', setting.key); }
                  setSavingId(null);
                }}
                saving={savingId === setting.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// TAB 3: ANALYTICS & SEO
// ══════════════════════════════════════════
function AnalyticsPanel() {
  const { success, error: toastError } = useToast();
  const [settings, setSettings] = useState<SettingsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Record<number, string>>({});

  async function load() {
    setLoading(true);
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('section', '_setting')
      .order('key', { ascending: true });
    if (error) { toastError('Errore', error.message); return; }
    setSettings(data || []);
    const vals: Record<number, string> = {};
    (data || []).forEach((s: any) => { vals[s.id] = s.value_it || ''; });
    setEditValues(vals);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const grouped: Record<string, SettingsRow[]> = {};
  for (const s of settings) {
    const section = SETTING_SECTIONS[s.key] || 'general';
    if (!grouped[section]) grouped[section] = [];
    grouped[section].push(s);
    console.log('setting', s.key, '-> section', section);
  }

  if (loading) {
    return <div className="text-center py-16 text-[#5a5650]">Caricamento...</div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      {grouped.analytics && (
        <div className="bg-[#161616] rounded-2xl border border-[#2a2725] p-5">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#2a2725]/50">
            <BarChart3 size={16} className="text-primary" />
            <h3 className="font-heading text-primary text-xs uppercase tracking-widest">Analytics</h3>
          </div>
          <div className="space-y-4">
            {grouped.analytics.map(setting => (
              <SettingsField
                key={setting.id}
                setting={setting}
                value={editValues[setting.id] || ''}
                onChange={val => setEditValues(prev => ({ ...prev, [setting.id]: val }))}
                onSave={async () => {
                  setSavingId(setting.id);
                  const supabase = createBrowserClient();
                  const { error } = await supabase
                    .from('site_content')
                    .update({ value_it: editValues[setting.id] || '', updated_at: new Date().toISOString() })
                    .eq('id', setting.id);
                  if (error) { toastError('Errore', error.message); } else { success('Salvato', setting.key); }
                  setSavingId(null);
                }}
                saving={savingId === setting.id}
              />
            ))}
          </div>
        </div>
      )}

      {grouped.seo && (
        <div className="bg-[#161616] rounded-2xl border border-[#2a2725] p-5">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#2a2725]/50">
            <Tag size={16} className="text-primary" />
            <h3 className="font-heading text-primary text-xs uppercase tracking-widest">SEO & Condivisione</h3>
          </div>
          <div className="space-y-4">
            {grouped.seo.map(setting => (
              <SettingsField
                key={setting.id}
                setting={setting}
                value={editValues[setting.id] || ''}
                onChange={val => setEditValues(prev => ({ ...prev, [setting.id]: val }))}
                onSave={async () => {
                  setSavingId(setting.id);
                  const supabase = createBrowserClient();
                  const { error } = await supabase
                    .from('site_content')
                    .update({ value_it: editValues[setting.id] || '', updated_at: new Date().toISOString() })
                    .eq('id', setting.id);
                  if (error) { toastError('Errore', error.message); } else { success('Salvato', setting.key); }
                  setSavingId(null);
                }}
                saving={savingId === setting.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// Shared: single settings field
// ══════════════════════════════════════════
function SettingsField({ setting, value, onChange, onSave, saving }: {
  setting: any;
  value: string;
  onChange: (val: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const label = SETTING_LABELS[setting.key] || setting.key;
  const isUrl = setting.key.includes('facebook') || setting.key.includes('instagram') || setting.key.includes('tripadvisor') || setting.key.includes('google') || setting.key.includes('website');
  const isMultiline = setting.key.includes('hours') || setting.key.includes('address') || setting.key.includes('description');

  return (
    <div>
      <label className="text-[#9a9590] text-[11px] mb-1.5 block font-medium">{label}</label>
      <div className="flex gap-2">
        {isMultiline ? (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={2}
            className="flex-1 bg-[#0e0e0e] border border-[#2a2725] rounded-lg px-3 py-2 text-sm text-[#f0ece6] focus:outline-none focus:border-primary resize-none transition-colors"
          />
        ) : (
          <input
            type={isUrl ? 'url' : 'text'}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={isUrl ? 'https://...' : ''}
            className="flex-1 bg-[#0e0e0e] border border-[#2a2725] rounded-lg px-3 py-2 text-sm text-[#f0ece6] placeholder:text-[#5a5650] focus:outline-none focus:border-primary transition-colors"
          />
        )}
        <button
          onClick={onSave}
          disabled={saving}
          className="px-3 rounded-lg bg-primary text-[#0e0e0e] font-bold text-xs hover:bg-primary-light disabled:opacity-50 flex items-center justify-center transition-all shrink-0"
        >
          {saving ? <div className="w-3.5 h-3.5 border-2 border-[#0e0e0e]/30 border-t-[#0e0e0e] rounded-full animate-spin" /> : <Save size={14} />}
        </button>
      </div>
      {isUrl && value && (
        <a href={value} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary/60 hover:text-primary text-[10px] mt-1 transition-colors">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Apri link
        </a>
      )}
    </div>
  );
}

// ── Settings section mapping ──
const SETTING_SECTIONS: Record<string, string> = {
  social_facebook: 'social',
  social_instagram: 'social',
  social_tripadvisor: 'social',
  social_google_reviews: 'social',
  social_whatsapp: 'social',
  business_address: 'business',
  business_phone: 'business',
  business_email: 'business',
  business_website: 'business',
  business_hours_mon: 'business',
  business_hours_mon_fri: 'business',
  business_hours_sat: 'business',
  business_hours_sun: 'business',
  business_partita_iva: 'business',
  analytics_ga_id: 'analytics',
  analytics_meta_pixel: 'analytics',
  seo_og_image: 'seo',
  seo_og_title: 'seo',
  seo_og_description: 'seo',
};
