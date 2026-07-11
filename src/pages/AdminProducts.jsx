import { useState, useEffect, useRef } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from '../lib/admin';
import { Plus, Pencil, Trash2, X, Check, ImageUp, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  { value: 'dolci', label: 'Dolci' },
  { value: 'pane', label: 'Pane' },
  { value: 'specialita', label: 'Specialità' },
  { value: 'salato', label: 'Salato' },
  { value: 'stagionale', label: 'Stagionale' },
];

const ALLERGEN_OPTIONS = [
  'glutine', 'lattosio', 'uova', 'frutta_guscio',
  'arachidi', 'sesamo', 'soia', 'sedano',
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
  display_order: 0,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | product id
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data || []);
    } catch (err) {
      setError('Errore caricamento prodotti');
    } finally {
      setLoading(false);
    }
  }

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
      };

      if (editing === 'new') {
        await createProduct(payload);
      } else {
        await updateProduct(editing, payload);
      }

      setSuccess(editing === 'new' ? 'Prodotto creato!' : 'Prodotto aggiornato!');
      await loadProducts();
      cancelEdit();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Eliminare "${name}"?`)) return;
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
    } finally {
      setUploading(false);
    }
  }

  function toggleAllergen(allergen) {
    setForm((f) => ({
      ...f,
      allergens: f.allergens.includes(allergen)
        ? f.allergens.filter((a) => a !== allergen)
        : [...f.allergens, allergen],
    }));
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-white tracking-tight">Prodotti</h1>
        {!editing && (
          <button
            onClick={startNew}
            className="bg-primary text-bg font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:bg-primary-light transition-all"
          >
            <Plus size={16} />
            Nuovo Prodotto
          </button>
        )}
      </div>

      {/* Success / Error */}
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
            {/* Name */}
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

            {/* Category */}
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

            {/* Price */}
            <div>
              <label className="text-text-dim text-xs uppercase tracking-wider block mb-1.5">Prezzo (€) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>

            {/* Unit */}
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

            {/* Description */}
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

            {/* Display Order */}
            <div>
              <label className="text-text-dim text-xs uppercase tracking-wider block mb-1.5">Ordine</label>
              <input
                type="number"
                min="0"
                value={form.display_order}
                onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.value }))}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>

            {/* Toggles */}
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

            {/* Allergens */}
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

            {/* Image Upload */}
            <div className="sm:col-span-2">
              <label className="text-text-dim text-xs uppercase tracking-wider block mb-1.5">Immagine</label>
              <div className="flex items-center gap-4">
                {form.image_url && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-bg border border-border shrink-0">
                    <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
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

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/[0.04]">
            <button
              onClick={cancelEdit}
              className="px-6 py-2.5 rounded-xl border border-border text-text-dim hover:text-white hover:border-white/20 transition-all text-sm"
            >
              Annulla
            </button>
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

      {/* ═══ Products List ═══ */}
      <div className="space-y-2">
        {products.length === 0 ? (
          <div className="text-center py-16 text-text-dim">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p>Nessun prodotto ancora</p>
          </div>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-4 bg-[#201c17] border rounded-xl p-3 sm:p-4 transition-all ${
                !p.is_available ? 'border-red-500/10 opacity-60' : 'border-white/[0.04]'
              }`}
            >
              {/* Image thumbnail */}
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-bg border border-white/[0.04] shrink-0">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-dim text-xs">
                    ?
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-heading text-sm truncate">{p.name}</h3>
                  {p.is_featured && (
                    <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">Del Giorno</span>
                  )}
                  {!p.is_available && (
                    <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Non disp.</span>
                  )}
                </div>
                <p className="text-text-dim text-xs truncate mt-0.5">{p.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-primary text-sm font-bold">
                    {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(p.price)}
                  </span>
                  <span className="text-text-dim text-[10px] uppercase">{p.category}</span>
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
    </div>
  );
}

const Package = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <path d="M3.3 7 12 12l8.7-5" /><path d="M12 22V12" />
  </svg>
);
