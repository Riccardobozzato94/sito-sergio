import { useState, useEffect } from 'react';
import {
  getSiteContent, updateSiteContent,
  getSiteSettings, updateSiteSetting,
} from '../lib/admin';
import { CONTENT_SECTIONS } from '../lib/content';
import {
  FileText, Check, AlertCircle, Save, RefreshCw, Globe,
  ChevronDown, ChevronRight, Search, ExternalLink,
  MapPin, BarChart3, Tag, Image,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// TABS CONFIG
// ═══════════════════════════════════════════════════════════
const TABS = [
  { id: 'texts', label: 'Testi del Sito', icon: FileText },
  { id: 'social', label: 'Social & Contatti', icon: Globe },
  { id: 'analytics', label: 'Analytics & SEO', icon: BarChart3 },
  { id: 'gallery', label: 'Galleria', icon: Image },
];

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function AdminContent() {
  const [activeTab, setActiveTab] = useState('texts');

  return (
    <div>
      {/* ═══ Header ═══ */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading text-white tracking-tight">Gestione Contenuti</h1>
        <p className="text-text-dim text-sm mt-1">Modifica testi, social link, analytics e dati attività del sito.</p>
      </div>

      {/* ═══ Tabs ═══ */}
      <div className="flex gap-1 mb-6 bg-white/[0.02] rounded-xl p-1 border border-white/[0.04]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex-1 sm:flex-none justify-center ${
                activeTab === tab.id
                  ? 'bg-primary text-bg shadow-lg shadow-primary/20'
                  : 'text-text-dim hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ═══ Tab Panels ═══ */}
      {activeTab === 'texts' && <TextsPanel />}
      {activeTab === 'social' && <SocialPanel />}
      {activeTab === 'analytics' && <AnalyticsPanel />}
      {activeTab === 'gallery' && <GalleryPanel />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB 1: TESTI DEL SITO
// ═══════════════════════════════════════════════════════════
function TextsPanel() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // id of entry being saved
  const [expandedSections, setExpandedSections] = useState({});
  const [editMode, setEditMode] = useState({}); // { id: { value_it, value_en } }
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadContent(); }, []);

  async function loadContent() {
    try {
      setLoading(true);
      const data = await getSiteContent();
      setEntries(data || []);
    } catch (err) {
      setError('Errore caricamento contenuti: ' + err.message);
    } finally { setLoading(false); }
  }

  function toggleSection(section) {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }

  // Auto-expand sections with content
  useEffect(() => {
    if (entries.length > 0) {
      const sections = [...new Set(entries.map(e => e.section))];
      const expanded = {};
      sections.forEach(s => { expanded[s] = true; });
      setExpandedSections(expanded);
    }
  }, [loading]);

  function startEdit(entry) {
    setEditMode(prev => ({
      ...prev,
      [entry.id]: { value_it: entry.value_it || '', value_en: entry.value_en || '' },
    }));
  }

  function cancelEdit(id) {
    setEditMode(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function updateEdit(id, field, value) {
    setEditMode(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value },
    }));
  }

  async function handleSave(id) {
    const edits = editMode[id];
    if (!edits) return;
    setSaving(id);
    try {
      await updateSiteContent(id, edits.value_it, edits.value_en);
      setSuccess('Testo aggiornato!');
      cancelEdit(id);
      await loadContent();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.message || 'Errore salvataggio');
      setTimeout(() => setError(''), 3000);
    } finally { setSaving(null); }
  }

  // Group by section
  const grouped = entries.reduce((acc, entry) => {
    const section = entry.section || 'other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(entry);
    return acc;
  }, {});

  // Filter by search
  const filteredGrouped = {};
  for (const [section, items] of Object.entries(grouped)) {
    if (!searchQuery) {
      filteredGrouped[section] = items;
    } else {
      const q = searchQuery.toLowerCase();
      const matched = items.filter(item =>
        item.key.toLowerCase().includes(q) ||
        (item.value_it || '').toLowerCase().includes(q) ||
        (item.value_en || '').toLowerCase().includes(q)
      );
      if (matched.length > 0) {
        filteredGrouped[section] = matched;
      }
    }
  }

  // Find section label
  function getSectionLabel(sectionId) {
    const found = CONTENT_SECTIONS.find(s => s.id === sectionId);
    return found ? found.label : `📁 ${sectionId}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* ═══ Notifications ═══ */}
      {success && (
        <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-2 animate-fade-in">
          <Check size={16} className="text-green-400 shrink-0" />
          <span className="text-green-400 text-sm">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* ═══ Search + Refresh ═══ */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            type="text"
            placeholder="Cerca testo o parola chiave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-text-dim/50 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <button
          onClick={loadContent}
          className="p-2.5 rounded-xl border border-border text-text-dim hover:text-white hover:border-white/20 transition-all"
          title="Ricarica"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* ═══ Content Sections ═══ */}
      {Object.keys(filteredGrouped).length === 0 ? (
        <div className="text-center py-20 text-text-dim">
          <FileText size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">
            {searchQuery ? 'Nessun testo trovato per questa ricerca' : 'Ancora nessun contenuto editabile'}
          </p>
          <p className="text-text-dim text-xs mt-1">
            {searchQuery
              ? 'Prova con altre parole chiave'
              : 'Esegui la migration SQL per popolare i dati iniziali'}
          </p>
        </div>
      ) : (
        Object.entries(filteredGrouped).map(([section, items]) => {
          const isExpanded = expandedSections[section];
          const totalItems = items.length;
          const editingCount = items.filter(item => editMode[item.id]).length;
          return (
            <div key={section} className="mb-3">
              {/* Section header — collapsible */}
              <button
                onClick={() => toggleSection(section)}
                className="w-full flex items-center gap-2 py-2.5 px-1 border-b border-white/[0.04] hover:bg-white/[0.01] rounded-lg transition-colors group"
              >
                {isExpanded ? <ChevronDown size={14} className="text-text-dim" /> : <ChevronRight size={14} className="text-text-dim" />}
                <h2 className="text-primary font-heading text-xs uppercase tracking-widest">
                  {getSectionLabel(section)}
                </h2>
                <span className="text-text-dim text-[10px] bg-white/5 px-2 py-0.5 rounded-full ml-1">
                  {totalItems}
                </span>
                {editingCount > 0 && (
                  <span className="text-yellow-400 text-[10px] bg-yellow-400/10 px-2 py-0.5 rounded-full">
                    {editingCount} in modifica
                  </span>
                )}
              </button>

              {/* Items */}
              {isExpanded && (
                <div className="space-y-1.5 mt-1.5">
                  {items.map((entry) => {
                    const isEditing = !!editMode[entry.id];
                    const edits = editMode[entry.id];

                    return (
                      <div
                        key={entry.id}
                        className={`rounded-xl overflow-hidden transition-all duration-200 ${
                          isEditing
                            ? 'bg-[#25201a] border border-primary/20 shadow-lg shadow-primary/5'
                            : 'bg-[#201c17] border border-white/[0.04] hover:border-white/[0.08]'
                        }`}
                      >
                        {isEditing ? (
                          /* ═══ EDIT MODE ═══ */
                          <div className="p-4 sm:p-5">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Tag size={12} className="text-primary/60" />
                                <code className="text-text-dim text-[11px] font-mono">{entry.key}</code>
                              </div>
                              <button
                                onClick={() => cancelEdit(entry.id)}
                                className="text-text-dim hover:text-white p-1 rounded hover:bg-white/[0.06] transition-all"
                              >
                                <X size={14} />
                              </button>
                            </div>

                            <div className="space-y-4">
                              {/* Italian */}
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="flex items-center gap-1.5 text-text-dim text-[10px] uppercase tracking-wider">
                                    <span className="inline-block w-4 h-2.5 bg-blue-600 rounded-sm" />
                                    Italiano
                                  </label>
                                  <span className="text-text-dim text-[10px] tabular-nums font-mono">
                                    {(edits?.value_it || '').length} caratteri
                                  </span>
                                </div>
                                <textarea
                                  value={edits?.value_it || ''}
                                  onChange={(e) => updateEdit(entry.id, 'value_it', e.target.value)}
                                  rows={3}
                                  className="w-full bg-bg border border-border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary resize-none transition-colors"
                                  placeholder="Testo in italiano..."
                                />
                              </div>

                              {/* English */}
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="flex items-center gap-1.5 text-text-dim text-[10px] uppercase tracking-wider">
                                    <span className="inline-block w-4 h-2.5 bg-red-600 rounded-sm" />
                                    English
                                  </label>
                                  <span className="text-text-dim text-[10px] tabular-nums font-mono">
                                    {(edits?.value_en || '').length} caratteri
                                  </span>
                                </div>
                                <textarea
                                  value={edits?.value_en || ''}
                                  onChange={(e) => updateEdit(entry.id, 'value_en', e.target.value)}
                                  rows={3}
                                  className="w-full bg-bg border border-border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary resize-none transition-colors"
                                  placeholder="Text in English..."
                                />
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-white/[0.04]">
                              <button
                                onClick={() => cancelEdit(entry.id)}
                                className="px-4 py-2 rounded-lg border border-border text-text-dim hover:text-white text-xs transition-colors"
                              >
                                Annulla
                              </button>
                              <button
                                onClick={() => handleSave(entry.id)}
                                disabled={saving === entry.id}
                                className="px-5 py-2 rounded-lg bg-primary text-bg font-bold text-xs hover:bg-primary-light disabled:opacity-50 flex items-center gap-1.5 transition-all"
                              >
                                {saving === entry.id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                                ) : (
                                  <Save size={14} />
                                )}
                                {saving === entry.id ? 'Salvataggio...' : 'Salva'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ═══ VIEW MODE ═══ */
                          <button
                            onClick={() => startEdit(entry)}
                            className="w-full text-left p-3.5 hover:bg-white/[0.02] transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Tag size={10} className="text-text-dim/40" />
                                <code className="text-text-dim text-[10px] font-mono">{entry.key}</code>
                              </div>
                              <div className="flex items-center gap-2">
                                {entry.updated_at && (
                                  <span className="text-text-dim text-[9px] font-mono">
                                    {new Date(entry.updated_at).toLocaleDateString('it-IT', {
                                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                                    })}
                                  </span>
                                )}
                                <span className="text-text-dim/40 hover:text-primary transition-colors">
                                  <ExternalLink size={11} />
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-start gap-2.5">
                                <span className="text-[9px] font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded shrink-0 mt-0.5 leading-none">IT</span>
                                <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
                                  {entry.value_it || <span className="text-text-dim italic">vuoto</span>}
                                </p>
                              </div>
                              <div className="flex items-start gap-2.5">
                                <span className="text-[9px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded shrink-0 mt-0.5 leading-none">EN</span>
                                <p className="text-text-dim text-sm leading-relaxed line-clamp-2">
                                  {entry.value_en || <span className="text-text-dim italic">empty</span>}
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

// ═══ Settings label map (for site_content based settings) ═══
const SETTING_LABELS = {
  social_facebook: 'Facebook URL',
  social_instagram: 'Instagram URL',
  social_tripadvisor: 'TripAdvisor URL',
  social_google_reviews: 'Google Reviews URL',
  social_whatsapp: 'Numero WhatsApp (con prefisso internazionale)',
  business_address: 'Indirizzo',
  business_phone: 'Telefono',
  business_email: 'Email',
  business_website: 'Sito Web',
  business_hours_mon: 'Orario Lunedì (es. "Chiuso")',
  business_hours_mon_fri: 'Orario Mar-Ven',
  business_partita_iva: 'P.IVA / Codice Fiscale',
  business_hours_sat: 'Orario Sabato',
  business_hours_sun: 'Orario Domenica',
  analytics_ga_id: 'Google Analytics ID (es. G-XXXXXXXXXX)',
  analytics_meta_pixel: 'Meta Pixel ID (es. 1234567890)',
  seo_og_image: 'Immagine Open Graph',
  seo_og_title: 'Titolo Open Graph',
  seo_og_description: 'Descrizione Open Graph',
};

const SETTING_SECTIONS = {
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

function isUrl(key) {
  return key.includes('facebook') || key.includes('instagram') || key.includes('tripadvisor') || key.includes('google') || key.includes('website');
}

function isMultiline(key) {
  return key.includes('hours') || key.includes('address') || key.includes('description');
}

// ═══════════════════════════════════════════════════════════
// TAB 2: SOCIAL & CONTATTI
// ═══════════════════════════════════════════════════════════
function SocialPanel() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await getSiteSettings();
      setSettings(data || []);
      // Init edit values from value_it (settings stored in site_content)
      const vals = {};
      (data || []).forEach(s => { vals[s.id] = s.value_it || ''; });
      setEditValues(vals);
    } catch (err) {
      setError('Errore caricamento: ' + err.message);
    } finally { setLoading(false); }
  }

  function handleChange(id, value) {
    setEditValues(prev => ({ ...prev, [id]: value }));
  }

  async function handleSave(id) {
    setSavingId(id);
    try {
      await updateSiteSetting(id, editValues[id] || '');
      setSuccess('Impostazione aggiornata!');
      await load();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.message || 'Errore salvataggio');
      setTimeout(() => setError(''), 3000);
    } finally { setSavingId(null); }
  }

  // Group by derived section
  const grouped = settings.reduce((acc, s) => {
    const section = SETTING_SECTIONS[s.key] || 'general';
    if (!acc[section]) acc[section] = [];
    acc[section].push(s);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Notifications */}
      {success && (
        <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-2">
          <Check size={16} className="text-green-400 shrink-0" />
          <span className="text-green-400 text-sm">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ═══ SOCIAL MEDIA ═══ */}
        {grouped.social && (
          <div className="bg-[#201c17] border border-white/[0.04] rounded-xl p-5">
            <h3 className="font-heading text-primary text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
              <Globe size={14} />
              Social Media
            </h3>
            <div className="space-y-4">
              {grouped.social.map(setting => (
                <SocialField
                  key={setting.id}
                  setting={setting}
                  value={editValues[setting.id] || ''}
                  onChange={(val) => handleChange(setting.id, val)}
                  onSave={() => handleSave(setting.id)}
                  saving={savingId === setting.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* ═══ BUSINESS INFO ═══ */}
        {grouped.business && (
          <div className="bg-[#201c17] border border-white/[0.04] rounded-xl p-5">
            <h3 className="font-heading text-primary text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
              <MapPin size={14} />
              Dati Attività
            </h3>
            <div className="space-y-4">
              {grouped.business.map(setting => (
                <SocialField
                  key={setting.id}
                  setting={setting}
                  value={editValues[setting.id] || ''}
                  onChange={(val) => handleChange(setting.id, val)}
                  onSave={() => handleSave(setting.id)}
                  saving={savingId === setting.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Single setting field with inline save
function SocialField({ setting, value, onChange, onSave, saving }) {
  const url = isUrl(setting.key);
  const multiline = isMultiline(setting.key);
  const label = SETTING_LABELS[setting.key] || setting.key;

  return (
    <div>
      <label className="block text-text-dim text-[11px] mb-1.5 font-medium">{label}</label>
      <div className="flex gap-2">
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={2}
            className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-text-dim/40 focus:outline-none focus:border-primary resize-none transition-colors"
          />
        ) : (
          <input
            type={url ? 'url' : 'text'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={url ? 'https://...' : ''}
            className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-text-dim/40 focus:outline-none focus:border-primary transition-colors"
          />
        )}
        <button
          onClick={onSave}
          disabled={saving}
          className="px-3 rounded-lg bg-primary text-bg font-bold text-xs hover:bg-primary-light disabled:opacity-50 flex items-center justify-center transition-all shrink-0"
        >
          {saving ? (
            <div className="w-3.5 h-3.5 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
          ) : (
            <Save size={14} />
          )}
        </button>
      </div>
      {url && value && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary/60 hover:text-primary text-[10px] mt-1 transition-colors"
        >
          <ExternalLink size={10} />
          Apri link
        </a>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB 3: ANALYTICS & SEO
// ═══════════════════════════════════════════════════════════
function AnalyticsPanel() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await getSiteSettings();
      setSettings(data || []);
      const vals = {};
      (data || []).forEach(s => { vals[s.id] = s.value_it || ''; });
      setEditValues(vals);
    } catch (err) {
      setError('Errore caricamento: ' + err.message);
    } finally { setLoading(false); }
  }

  function handleChange(id, value) {
    setEditValues(prev => ({ ...prev, [id]: value }));
  }

  async function handleSave(id) {
    setSavingId(id);
    try {
      await updateSiteSetting(id, editValues[id] || '');
      setSuccess('Impostazione aggiornata!');
      await load();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.message || 'Errore salvataggio');
      setTimeout(() => setError(''), 3000);
    } finally { setSavingId(null); }
  }

  const grouped = settings.reduce((acc, s) => {
    const section = SETTING_SECTIONS[s.key] || 'general';
    if (!acc[section]) acc[section] = [];
    acc[section].push(s);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Notifications */}
      {success && (
        <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-2">
          <Check size={16} className="text-green-400 shrink-0" />
          <span className="text-green-400 text-sm">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Analytics section */}
        {grouped.analytics && (
          <div className="bg-[#201c17] border border-white/[0.04] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/[0.04]">
              <BarChart3 size={16} className="text-primary" />
              <h3 className="font-heading text-primary text-xs uppercase tracking-widest">Analytics</h3>
              <span className="text-text-dim text-[10px] bg-white/5 px-2 py-0.5 rounded-full ml-auto">
                {grouped.analytics.length}
              </span>
            </div>
            <div className="space-y-4">
              {grouped.analytics.map(setting => (
                <AnalyticsField
                  key={setting.id}
                  setting={setting}
                  value={editValues[setting.id] || ''}
                  onChange={(val) => handleChange(setting.id, val)}
                  onSave={() => handleSave(setting.id)}
                  saving={savingId === setting.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* SEO section */}
        {grouped.seo && (
          <div className="bg-[#201c17] border border-white/[0.04] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/[0.04]">
              <Tag size={16} className="text-primary" />
              <h3 className="font-heading text-primary text-xs uppercase tracking-widest">SEO & Condivisione</h3>
              <span className="text-text-dim text-[10px] bg-white/5 px-2 py-0.5 rounded-full ml-auto">
                {grouped.seo.length}
              </span>
            </div>
            <div className="space-y-4">
              {grouped.seo.map(setting => (
                <AnalyticsField
                  key={setting.id}
                  setting={setting}
                  value={editValues[setting.id] || ''}
                  onChange={(val) => handleChange(setting.id, val)}
                  onSave={() => handleSave(setting.id)}
                  saving={savingId === setting.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Helper info */}
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
          <p className="text-text-dim text-xs leading-relaxed">
            <strong className="text-primary">💡 Nota:</strong> Le impostazioni Analytics e SEO vengono caricate
            dinamicamente dal database. Se non configurati, Google Analytics e Meta Pixel non verranno attivati
            sul sito. Il cookie banner apparirà solo se almeno uno dei due è configurato.
          </p>
        </div>
      </div>
    </div>
  );
}

function AnalyticsField({ setting, value, onChange, onSave, saving }) {
  const multiline = isMultiline(setting.key);
  const label = SETTING_LABELS[setting.key] || setting.key;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-text-dim text-[11px] font-medium">{label}</label>
        {value && (
          <span className="text-text-dim text-[10px] font-mono tabular-nums">{value.length} caratteri</span>
        )}
      </div>
      <div className="flex gap-2">
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={2}
            className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-text-dim/40 focus:outline-none focus:border-primary resize-none transition-colors"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-text-dim/40 focus:outline-none focus:border-primary transition-colors font-mono text-xs"
          />
        )}
        <button
          onClick={onSave}
          disabled={saving}
          className="px-3 rounded-lg bg-primary text-bg font-bold text-xs hover:bg-primary-light disabled:opacity-50 flex items-center justify-center transition-all shrink-0"
        >
          {saving ? (
            <div className="w-3.5 h-3.5 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
          ) : (
            <Save size={14} />
          )}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB 4: GALLERIA FOTO
// ═══════════════════════════════════════════════════════════
function GalleryPanel() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editAlts, setEditAlts] = useState({}); // { id: { alt_it, alt_en } }

  useEffect(() => { loadPhotos(); }, []);

  async function loadPhotos() {
    try {
      setLoading(true);
      const { getGalleryPhotos } = await import('../lib/admin');
      const data = await getGalleryPhotos();
      setPhotos(data || []);
      // Init edit alts
      const alts = {};
      (data || []).forEach(function(p) {
        alts[p.id] = { alt_it: p.alt_it || '', alt_en: p.alt_en || '' };
      });
      setEditAlts(alts);
    } catch (err) {
      setError('Errore caricamento foto: ' + err.message);
      setTimeout(function() { setError(''); }, 3000);
    } finally { setLoading(false); }
  }

  // ── Upload new photo ──
  async function handleUpload(files) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      const { uploadGalleryImage, createGalleryPhoto } = await import('../lib/admin');
      for (const file of files) {
        const imageUrl = await uploadGalleryImage(file);
        await createGalleryPhoto({
          image_url: imageUrl,
          alt_it: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
          alt_en: '',
          sort_order: photos.length + 1,
        });
      }
      setSuccess(files.length + (files.length === 1 ? ' foto caricata' : ' foto caricate') + '!');
      await loadPhotos();
      setTimeout(function() { setSuccess(''); }, 3000);
    } catch (err) {
      console.error('[Gallery] Upload error:', err);
      setError('Errore upload: ' + (err.message || 'sconosciuto'));
      setTimeout(function() { setError(''); }, 4000);
    } finally { setUploading(false); }
  }

  // ── Save alt text ──
  async function handleSaveAlt(id) {
    const alts = editAlts[id];
    if (!alts) return;
    setSavingId(id);
    try {
      const { updateGalleryPhoto } = await import('../lib/admin');
      await updateGalleryPhoto(id, { alt_it: alts.alt_it, alt_en: alts.alt_en });
      setSuccess('Didascalia aggiornata!');
      setTimeout(function() { setSuccess(''); }, 2500);
    } catch (err) {
      setError('Errore salvataggio: ' + err.message);
      setTimeout(function() { setError(''); }, 3000);
    } finally { setSavingId(null); }
  }

  // ── Delete photo ──
  async function handleDelete(id) {
    if (!window.confirm('Eliminare questa foto dalla galleria?')) return;
    setDeletingId(id);
    try {
      const { deleteGalleryPhoto } = await import('../lib/admin');
      await deleteGalleryPhoto(id);
      setSuccess('Foto eliminata!');
      await loadPhotos();
      setTimeout(function() { setSuccess(''); }, 2500);
    } catch (err) {
      setError('Errore eliminazione: ' + err.message);
      setTimeout(function() { setError(''); }, 3000);
    } finally { setDeletingId(null); }
  }

  // ── Move photo up/down ──
  async function handleReorder(id, direction) {
    const idx = photos.findIndex(function(p) { return p.id === id; });
    if (idx === -1) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= photos.length) return;

    const swapped = [...photos];
    const temp = swapped[idx];
    swapped[idx] = swapped[newIdx];
    swapped[newIdx] = temp;

    // Update sort_order
    const orderedIds = swapped.map(function(p) { return p.id; });
    try {
      const { reorderGalleryPhotos } = await import('../lib/admin');
      await reorderGalleryPhotos(orderedIds);
      setSuccess('Ordine aggiornato!');
      await loadPhotos();
      setTimeout(function() { setSuccess(''); }, 2500);
    } catch (err) {
      setError('Errore riordino: ' + err.message);
      setTimeout(function() { setError(''); }, 3000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* ═══ Notifications ═══ */}
      {success && (
        <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-2 animate-fade-in">
          <Check size={16} className="text-green-400 shrink-0" />
          <span className="text-green-400 text-sm">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* ═══ Upload Area ═══ */}
      <div className="bg-[#201c17] border border-white/[0.04] rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Image size={16} className="text-primary" />
          <h3 className="font-heading text-primary text-xs uppercase tracking-widest">Aggiungi Foto</h3>
        </div>
        <label className={`flex flex-col items-center justify-center border-2 border-dashed border-white/[0.08] rounded-xl py-8 px-4 cursor-pointer hover:border-primary/40 hover:bg-white/[0.02] transition-all duration-200 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <svg className="w-10 h-10 text-text-dim mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          {uploading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-text-dim text-sm">Caricamento in corso...</span>
            </div>
          ) : (
            <>
              <span className="text-white text-sm font-medium mb-1">Clicca per caricare foto</span>
              <span className="text-text-dim text-[11px]">JPG, PNG, WebP — Max 5MB ciascuna</span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={uploading}
            onChange={function(e) { handleUpload(e.target.files); e.target.value = ''; }}
            className="hidden"
          />
        </label>
      </div>

      {/* ═══ Photo Grid ═══ */}
      {photos.length === 0 ? (
        <div className="text-center py-16 text-text-dim">
          <Image size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">Nessuna foto nella galleria</p>
          <p className="text-text-dim text-xs mt-1">Carica la prima foto usando il pulsante sopra.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-text-dim text-xs">
              <span className="text-white font-bold tabular-nums">{photos.length}</span> foto
            </p>
            <button
              onClick={loadPhotos}
              className="p-2 rounded-lg border border-border text-text-dim hover:text-white hover:border-white/20 transition-all"
              title="Ricarica"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map(function(photo, index) {
              const alts = editAlts[photo.id] || { alt_it: '', alt_en: '' };
              return (
                <div key={photo.id} className="bg-[#201c17] border border-white/[0.04] rounded-xl overflow-hidden group">
                  {/* Image preview */}
                  <div className="relative aspect-[4/3] bg-bg overflow-hidden">
                    <img
                      src={photo.image_url}
                      alt={photo.alt_it || 'Foto galleria'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {/* Overlay actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={function() { handleReorder(photo.id, -1); }}
                        disabled={index === 0}
                        className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 disabled:opacity-20 transition-all"
                        title="Sposta su"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
                      </button>
                      <button
                        onClick={function() { handleReorder(photo.id, 1); }}
                        disabled={index === photos.length - 1}
                        className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 disabled:opacity-20 transition-all"
                        title="Sposta giù"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                      </button>
                      <button
                        onClick={function() { handleDelete(photo.id); }}
                        disabled={deletingId === photo.id}
                        className="p-2 rounded-lg bg-red-500/40 text-white hover:bg-red-500/60 transition-all"
                        title="Elimina foto"
                      >
                        {deletingId === photo.id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                        )}
                      </button>
                    </div>
                    {/* Sort order badge */}
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums">
                      #{photo.sort_order || index + 1}
                    </div>
                  </div>

                  {/* Alt text editor */}
                  <div className="p-3 space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded leading-none">IT</span>
                        <span className="text-text-dim text-[9px] tabular-nums">{(alts.alt_it || '').length}</span>
                      </div>
                      <input
                        type="text"
                        value={alts.alt_it}
                        onChange={function(e) {
                          setEditAlts(function(prev) { return { ...prev, [photo.id]: { ...(prev[photo.id] || {}), alt_it: e.target.value } }; });
                        }}
                        className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-text-dim/40 focus:outline-none focus:border-primary transition-colors"
                        placeholder="Didascalia italiana..."
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded leading-none">EN</span>
                        <span className="text-text-dim text-[9px] tabular-nums">{(alts.alt_en || '').length}</span>
                      </div>
                      <input
                        type="text"
                        value={alts.alt_en}
                        onChange={function(e) {
                          setEditAlts(function(prev) { return { ...prev, [photo.id]: { ...(prev[photo.id] || {}), alt_en: e.target.value } }; });
                        }}
                        className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-text-dim/40 focus:outline-none focus:border-primary transition-colors"
                        placeholder="English caption..."
                      />
                    </div>
                    <button
                      onClick={function() { handleSaveAlt(photo.id); }}
                      disabled={savingId === photo.id}
                      className="w-full py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[11px] font-bold hover:bg-primary/20 disabled:opacity-50 flex items-center justify-center gap-1 transition-all"
                    >
                      {savingId === photo.id ? (
                        <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      ) : (
                        <Save size={12} />
                      )}
                      {savingId === photo.id ? 'Salvataggio...' : 'Salva didascalia'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ X icon (inline SVG) ═══
function X({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
