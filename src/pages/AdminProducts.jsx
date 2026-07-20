import { useState, useEffect, useRef, useMemo } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from '../lib/admin';
import { Plus, Pencil, Trash2, X, Check, ImageUp, AlertCircle, Search, Filter, Eye } from 'lucide-react';

const CATEGORIES = [
  { value: 'dolci', label: 'Dolci' },
  { value: 'pane', label: 'Pane' },
  { value: 'specialita', label: 'Specialità' },
  { value: 'salato', label: 'Salato' },
  { value: 'stagionale', label: 'Stagionale' },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'Tutti' },
  { value: 'available', label: 'Disponibili' },
  { value: 'unavailable', label: 'Non disp.' },
  { value: 'featured', label: 'Del Giorno' },
];

const ALLERGEN_OPTIONS = [
  'glutine', 'lattosio', 'uova', 'frutta_guscio',
  'arachidi', 'sesamo', 'soia', 'sedano',
];

const DIETARY_OPTIONS = [
  { value: 'vegan', label: 'Vegano' },
  { value: 'senza_lattosio', label: 'Senza Lattosio' },
  { value: 'integrale', label: 'Integrale' },
];

const emptyProduct = {
  name: '',
  description: '',
  category: 'dolci',
  price: 0,
  unit: 'al kg',
  image_url: '',
  is_available: true,
  is_featured: false,
  allergens: [],
  dietary: [],
  ingredients: '',
  display_order: 0,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data || []);
    } catch (err) {
      setError('Errore caricamento prodotti');
    } finally { setLoading(false); }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesSearch =
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      // Status filter
      if (statusFilter === 'available' && !p.is_available) return false;
      if (statusFilter === 'unavailable' && p.is_available) return false;
      if (statusFilter === 'featured' && !p.is_featured) return false;
      // Category filter
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      return true;
    });
  }, [products, search, statusFilter, categoryFilter]);

  function startNew() {
    setForm({ ...emptyProduct, display_order: products.length + 1 });
    setEditing('new');
    setError('');
  }

  function startEdit(product) {
    setForm({
      name: product.name || '',
      description: product.description || '',
      category: product.category || 'dolci',
      price: product.price || 0,
      unit: product.unit || 'al kg',
      image_url: product.image_url || '',
      is_available: product.is_available ?? true,
      is_featured: product.is_featured ?? false,
      allergens: product.allergens || [],
      dietary: product.dietary || [],
      ingredients: product.ingredients || '',
      display_order: product.display_order ?? 0,
    });
    setEditing(product.id);
    setError('');
  }

  function cancelEdit() {
    setEditing(null);
    setForm(emptyProduct);
    setError('');
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Il nome è obbligatorio'); return; }
    if (!form.price || form.price <= 0) { setError('Il prezzo deve essere maggiore di 0'); return; }
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        display_order: parseInt(form.display_order) || 0,
        dietary: form.dietary || [],
        ingredients: form.ingredients || '',
      };
      if (editing === 'new') await createProduct(payload);
      else await updateProduct(editing, payload);
      setSuccess(editing === 'new' ? 'Prodotto creato!' : 'Prodotto aggiornato!');
      await loadProducts();
      cancelEdit();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Errore durante il salvataggio');
    } finally { setSaving(false); }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Eliminare definitivamente "${name}"?`)) return;
    try {
      await deleteProduct(id);
      setSuccess('Prodotto eliminato');
      await loadProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Errore eliminazione');
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!editing || editing === 'new') {
      setError('Salva prima il prodotto, poi aggiungi l\'immagine');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadProductImage(file, editing);
      await updateProduct(editing, { image_url: url });
      setForm((f) => ({ ...f, image_url: url }));
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Errore upload immagine');
    } finally { setUploading(false); }
  }

  function toggleAllergen(allergen) {
    setForm((f) => ({
      ...f,
      allergens: f.allergens.includes(allergen)
        ? f.allergens.filter((a) => a !== allergen)
        : [...f.allergens, allergen],
    }));
  }

  function toggleDietary(diet) {
    setForm((f) => ({
      ...f,
      dietary: f.dietary?.includes(diet)
        ? f.dietary.filter((d) => d !== diet)
        : [...(f.dietary || []), diet],
    }));
  }

  // Count by category for filter badges
  const categoryCounts = useMemo(() => {
    const counts = { all: products.length };
    CATEGORIES.forEach((c) => {
      counts[c.value] = products.filter((p) => p.category === c.value).length;
    });
    return counts;
  }, [products]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* ═══ Header ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-heading text-white tracking-tight">Prodotti</h1>
          <p className="text-text-dim text-xs mt-1">{products.length} prodotti totali</p>
        </div>
        {!editing && (
          <button
            onClick={startNew}
            className="bg-primary text-bg font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:bg-primary-light transition-all self-start sm:self-auto"
          >
            <Plus size={16} />
            Nuovo Prodotto
          </button>
        )}
      </div>

      {/* ═══ Notifications ═══ */}
      {success && (
        <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-2">
          <Check size={16} className="text-green-400" />
          <span className="text-green-400 text-sm">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* ═══ Form (when editing) ═══ */}
      {editing && (
        <div className="bg-[#201c17] border border-white/[0.04] rounded-2xl p-4 sm:p-6 mb-6">
          <h2 className="text-primary font-heading text-lg mb-4">
            {editing === 'new' ? 'Nuovo Prodotto' : 'Modifica Prodotto'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-text-dim text-xs uppercase tracking-wider block mb-1.5">Nome *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-dim/50 focus:outline-none focus:border-primary"
                placeholder="Es. Bussolà"
              />
            </div>
            <div>
              <label className="text-text-dim text-xs uppercase tracking-wider block mb-1.5">Categoria</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-text-dim text-xs uppercase tracking-wider block mb-1.5">Prezzo (€) *</label>
              <input
                type="number" step="0.01" min="0"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-text-dim text-xs uppercase tracking-wider block mb-1.5">Unità</label>
              <select
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option value="al kg">al kg</option>
                <option value="al pezzo">al pezzo</option>
                <option value="al pacco">al pacco</option>
                <option value="al vassoio">al vassoio</option>
                <option value="cad.">cad.</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-text-dim text-xs uppercase tracking-wider block mb-1.5">Descrizione</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-dim/50 focus:outline-none focus:border-primary resize-none"
                placeholder="Descrizione del prodotto..."
              />
            </div>
            <div>
              <label className="text-text-dim text-xs uppercase tracking-wider block mb-1.5">Ordine</label>
              <input
                type="number" min="0"
                value={form.display_order}
                onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.value }))}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={(e) => setForm((f) => ({ ...f, is_available: e.target.checked }))}
                  className="w-4 h-4 rounded border-border bg-bg text-primary focus:ring-primary"
                />
                Disponibile
              </label>
              <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
                  className="w-4 h-4 rounded border-border bg-bg text-primary focus:ring-primary"
                />
                In evidenza (Del Giorno)
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="text-text-dim text-xs uppercase tracking-wider block mb-2">Allergeni</label>
              <div className="flex flex-wrap gap-2">
                {ALLERGEN_OPTIONS.map((a) => (
                  <button
                    key={a}
                    onClick={() => toggleAllergen(a)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      form.allergens.includes(a)
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'bg-bg text-text-dim border-border hover:border-white/20'
                    }`}
                  >
                    {a === 'frutta_guscio' ? 'Frutta a guscio' : a.charAt(0).toUpperCase() + a.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-text-dim text-xs uppercase tracking-wider block mb-1.5">Ingredienti</label>
              <textarea
                value={form.ingredients || ''}
                onChange={(e) => setForm((f) => ({ ...f, ingredients: e.target.value }))}
                rows={2}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-dim/50 focus:outline-none focus:border-primary resize-none"
                placeholder="Es. Farina di grano tenero, burro, uova, zucchero, limone..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-text-dim text-xs uppercase tracking-wider block mb-2">Dieta / Tipologia</label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => toggleDietary(d.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      form.dietary?.includes(d.value)
                        ? 'bg-green-500/10 text-green-400 border-green-500/30'
                        : 'bg-bg text-text-dim border-border hover:border-white/20'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-text-dim text-xs uppercase tracking-wider block mb-1.5">Immagine</label>
              <div className="flex items-center gap-4">
                {form.image_url && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-bg border border-border shrink-0">
                    <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-text-dim hover:text-white hover:border-white/20 transition-all text-sm disabled:opacity-50"
                >
                  <ImageUp size={16} />
                  {uploading ? 'Caricamento...' : form.image_url ? 'Cambia immagine' : 'Carica immagine'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/[0.04]">
            <button onClick={cancelEdit} className="px-6 py-2.5 rounded-xl border border-border text-text-dim hover:text-white hover:border-white/20 transition-all text-sm">Annulla</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-bg font-bold px-6 py-2.5 rounded-xl hover:bg-primary-light transition-all text-sm disabled:opacity-50"
            >
              {saving ? 'Salvataggio...' : editing === 'new' ? 'Crea Prodotto' : 'Salva Modifiche'}
            </button>
          </div>
        </div>
      )}

      {/* ═══ Search & Filters ═══ */}
      {!editing && (
        <>
          {/* Search bar */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca prodotti per nome, categoria..."
              className="w-full bg-[#201c17] border border-white/[0.04] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-text-dim/50 focus:outline-none focus:border-primary/30 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-dim hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status filter tabs */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  statusFilter === f.value
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-bg text-text-dim border-border hover:border-white/20 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Category filter tabs */}
          <div className="flex flex-wrap gap-1.5 mb-4 overflow-x-auto pb-1">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all shrink-0 ${
                categoryFilter === 'all'
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-bg text-text-dim border-border hover:border-white/20 hover:text-white'
              }`}
            >
              Tutti <span className="text-[10px] opacity-60">({categoryCounts.all})</span>
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategoryFilter(c.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all shrink-0 ${
                  categoryFilter === c.value
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-bg text-text-dim border-border hover:border-white/20 hover:text-white'
                }`}
              >
                {c.label} <span className="text-[10px] opacity-60">({categoryCounts[c.value]})</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ═══ Products Grid ═══ */}
      <div className="space-y-2">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-text-dim">
            {search || statusFilter !== 'all' || categoryFilter !== 'all' ? (
              <>
                <Search size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nessun prodotto corrisponde ai filtri</p>
                <button
                  onClick={() => { setSearch(''); setStatusFilter('all'); setCategoryFilter('all'); }}
                  className="text-primary text-xs hover:underline mt-2"
                >
                  Cancella filtri
                </button>
              </>
            ) : (
              <>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-30">
                  <path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <path d="M3.3 7 12 12l8.7-5" /><path d="M12 22V12" />
                </svg>
                <p className="text-sm">Nessun prodotto ancora</p>
                <button onClick={startNew} className="text-primary text-xs hover:underline mt-2">Crea il primo prodotto</button>
              </>
            )}
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-4 bg-[#201c17] border rounded-xl p-3 sm:p-4 transition-all ${
                !p.is_available ? 'border-red-500/10 opacity-60' : 'border-white/[0.04]'
              }`}
            >
              {/* Image */}
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-bg border border-white/[0.04] shrink-0">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-dim text-lg">🥖</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-white font-heading text-sm truncate">{p.name}</h3>
                  <div className="flex gap-1">
                    {p.is_featured && (
                      <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">Del Giorno</span>
                    )}
                    {!p.is_available && (
                      <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Non disp.</span>
                    )}
                  </div>
                </div>
                <p className="text-text-dim text-xs truncate mt-0.5">{p.description || '—'}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-primary text-sm font-bold tabular-nums">
                    {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(p.price)}
                  </span>
                  <span className="text-[10px] bg-white/5 text-text-dim px-1.5 py-0.5 rounded uppercase">{p.category}</span>
                  {p.unit && <span className="text-[10px] text-text-dim">{p.unit}</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => startEdit(p)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-text-dim hover:text-white hover:bg-white/[0.06] transition-all"
                  title="Modifica"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-text-dim hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Elimina"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ═══ Totals bar ═══ */}
      {!editing && filteredProducts.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-text-dim text-[10px]">
            Mostrati {filteredProducts.length} di {products.length} prodotti
            {(search || statusFilter !== 'all' || categoryFilter !== 'all') && (
              <button
                onClick={() => { setSearch(''); setStatusFilter('all'); setCategoryFilter('all'); }}
                className="text-primary hover:underline ml-2"
              >
                Cancella filtri
              </button>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

const Package = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <path d="M3.3 7 12 12l8.7-5" /><path d="M12 22V12" />
  </svg>
);
