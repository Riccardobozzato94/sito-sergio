'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase-client';
import { useToast } from '@/components/ToastProvider';
import { generateSlug } from '@/lib/utils';
import { X, Upload, Loader2, Save, AlertCircle, Star } from 'lucide-react';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: () => void;
}

// EU 14 major allergens (Reg. 1169/2011)
const ALLERGEN_OPTIONS = [
  { value: 'glutine',       label: 'Glutine (frumento, segale, orzo…)' },
  { value: 'lattosio',      label: 'Latte e derivati' },
  { value: 'uova',          label: 'Uova' },
  { value: 'frutta_guscio', label: 'Frutta a guscio' },
  { value: 'arachidi',      label: 'Arachidi' },
  { value: 'sesamo',        label: 'Semi di sesamo' },
  { value: 'soia',          label: 'Soia' },
  { value: 'sedano',        label: 'Sedano' },
] as const;

interface Product {
  id?: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  allergens: string[];
  dietary?: string[];
  ingredients?: string;
  stock_weight_kg: number | null;
  low_stock_threshold_kg: number;
  display_order: number;
}

const categories = [
  { value: 'pane', label: 'Pane' },
  { value: 'dolci', label: 'Dolci' },
  { value: 'specialita', label: 'Specialità' },
  { value: 'salato', label: 'Salato' },
  { value: 'stagionale', label: 'Stagionale' },
];

const emptyProduct: Omit<Product, 'id'> = {
  name: '',
  slug: '',
  description: '',
  category: 'dolci',
  price: 0,
  unit: 'al kg',
  image_url: null,
  is_available: true,
  is_featured: false,
  allergens: [],
  dietary: [],
  ingredients: '',
  stock_weight_kg: null,
  low_stock_threshold_kg: 1.0,
  display_order: 0,
};

export default function ProductForm({ isOpen, onClose, product, onSuccess }: ProductFormProps) {
  const { success, error: toastError } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Product>(product as Product || emptyProduct as Product);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData(emptyProduct as Product);
    }
    setErrors({});
  }, [product, isOpen]);

  const toggleAllergen = (value: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(value)
        ? prev.allergens.filter(a => a !== value)
        : [...prev.allergens, value],
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = 'Il nome deve avere almeno 2 caratteri';
    }
    if (formData.price <= 0) {
      newErrors.price = 'Il prezzo deve essere maggiore di 0';
    }
    if (formData.stock_weight_kg !== null && formData.stock_weight_kg < 0) {
      newErrors.stock_weight_kg = 'La giacenza non può essere negativa';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const supabase = createBrowserClient();
    const slug = generateSlug(formData.name);

    // Costruiamo solo i campi che esistono NELLA TABELLA reale di Supabase
    // (evitiamo di mandare colonne fantasma come 'dietary' o 'ingredients'
    //  che potrebbero non esistere nello schema cache di PostgREST)
    const dataToSave: Record<string, unknown> = {
      name: formData.name,
      slug,
      description: formData.description,
      category: formData.category,
      price: Number(formData.price),
      unit: formData.unit,
      image_url: formData.image_url,
      is_available: formData.is_available,
      is_featured: formData.is_featured,
      allergens: formData.allergens,
      stock_weight_kg: formData.stock_weight_kg !== null ? Number(formData.stock_weight_kg) : null,
      low_stock_threshold_kg: Number(formData.low_stock_threshold_kg),
      display_order: Number(formData.display_order),
    };

    try {
      let result;
      if (formData.id) {
        // Update — .select('id') invece di .select() per evitare
        // l'errore "schema cache" su colonne non allineate (es. dietary)
        result = await supabase
          .from('products')
          .update(dataToSave)
          .eq('id', formData.id)
          .select('id');
      } else {
        // Insert
        result = await supabase
          .from('products')
          .insert([dataToSave])
          .select('id');
      }

      if (result.error) throw result.error;

      // Verifica che il dato sia stato effettivamente scritto
      if (result.data && result.data.length === 0) {
        throw new Error('Nessuna riga aggiornata: potresti non avere i permessi per modificare questo prodotto.');
      }

      success(
        formData.id ? 'Prodotto aggiornato' : 'Prodotto creato',
        formData.name
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError('Errore', err.message || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toastError('Errore', 'Seleziona un file immagine valido');
      return;
    }

    setSaving(true);
    const supabase = createBrowserClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${generateSlug(formData.name || 'product')}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      success('Immagine caricata', file.name);
    } catch (err: any) {
      toastError('Errore upload', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#161616] border border-[#2a2725] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-[#161616] border-b border-[#2a2725] p-5 flex items-center justify-between z-10">
          <h2 className="font-heading text-xl text-[#f0ece6]">
            {formData.id ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#5a5650] hover:text-[#f0ece6] transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Image Upload */}
          <div>
            <label className="block text-[#a8a39e] text-xs uppercase tracking-wider mb-2">
              Immagine Prodotto
            </label>
            <div className="flex items-start gap-4">
              <div className="w-32 h-32 rounded-xl bg-[#0e0e0e] border border-[#2a2725] overflow-hidden flex items-center justify-center shrink-0">
                {formData.image_url ? (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload size={24} className="text-[#5a5650]" />
                )}
              </div>
              <div className="flex-1">
                <label className="block w-full">
                  <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0e0e0e] border border-[#2a2725] rounded-xl text-sm text-[#a8a39e] hover:border-primary cursor-pointer transition-colors">
                    <Upload size={16} />
                    Carica immagine
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {formData.image_url && (
                  <button
                    type="button"
                    onClick={async () => {
                      // Cancella il file dallo storage Supabase
                      const supabase = createBrowserClient();
                      const url = formData.image_url;
                      if (!url) return; // type guard: url could be null
                      // Estrai il percorso del file dall'URL pubblico
                      // URL formato: https://{project}.supabase.co/storage/v1/object/public/product-images/products/{fileName}
                      const matches = url.match(/\/product-images\/(.+)$/);
                      if (matches) {
                        const filePath = matches[1];
                        const { error: deleteError } = await supabase.storage
                          .from('product-images')
                          .remove([filePath]);
                        if (deleteError) {
                          toastError('Errore', 'Impossibile eliminare il file dallo storage');
                          return;
                        }
                      }
                      setFormData(prev => ({ ...prev, image_url: null }));
                      success('Immagine rimossa', '');
                    }}
                    className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Rimuovi immagine
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#a8a39e] text-xs uppercase tracking-wider mb-2">
                Nome Prodotto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Es: Bussolà"
                className={`w-full bg-[#0e0e0e] border rounded-xl px-4 py-3 text-sm text-[#f0ece6] placeholder:text-[#5a5650] focus:outline-none focus:border-primary transition-colors ${
                  errors.name ? 'border-red-500/50' : 'border-[#2a2725]'
                }`}
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[#a8a39e] text-xs uppercase tracking-wider mb-2">
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-[#0e0e0e] border border-[#2a2725] rounded-xl px-4 py-3 text-sm text-[#f0ece6] focus:outline-none focus:border-primary transition-colors"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[#a8a39e] text-xs uppercase tracking-wider mb-2">
              Descrizione
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrizione del prodotto..."
              rows={3}
              className="w-full bg-[#0e0e0e] border border-[#2a2725] rounded-xl px-4 py-3 text-sm text-[#f0ece6] placeholder:text-[#5a5650] focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Price + Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#a8a39e] text-xs uppercase tracking-wider mb-2">
                Prezzo (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price || ''}
                onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                className={`w-full bg-[#0e0e0e] border rounded-xl px-4 py-3 text-sm text-[#f0ece6] placeholder:text-[#5a5650] focus:outline-none focus:border-primary transition-colors ${
                  errors.price ? 'border-red-500/50' : 'border-[#2a2725]'
                }`}
              />
              {errors.price && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.price}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[#a8a39e] text-xs uppercase tracking-wider mb-2">
                Unità
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={e => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="al kg"
                className="w-full bg-[#0e0e0e] border border-[#2a2725] rounded-xl px-4 py-3 text-sm text-[#f0ece6] placeholder:text-[#5a5650] focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#a8a39e] text-xs uppercase tracking-wider mb-2">
                Ordine visualizzazione
              </label>
              <input
                type="number"
                value={formData.display_order || 0}
                onChange={e => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                className="w-full bg-[#0e0e0e] border border-[#2a2725] rounded-xl px-4 py-3 text-sm text-[#f0ece6] focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#a8a39e] text-xs uppercase tracking-wider mb-2">
                Giacenza (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.stock_weight_kg !== null ? formData.stock_weight_kg : ''}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  stock_weight_kg: e.target.value === '' ? null : parseFloat(e.target.value)
                }))}
                placeholder="Lascia vuoto se illimitato"
                className={`w-full bg-[#0e0e0e] border rounded-xl px-4 py-3 text-sm text-[#f0ece6] placeholder:text-[#5a5650] focus:outline-none focus:border-primary transition-colors ${
                  errors.stock_weight_kg ? 'border-red-500/50' : 'border-[#2a2725]'
                }`}
              />
              {errors.stock_weight_kg && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.stock_weight_kg}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[#a8a39e] text-xs uppercase tracking-wider mb-2">
                Soglia scorta bassa (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.low_stock_threshold_kg || 1.0}
                onChange={e => setFormData(prev => ({ ...prev, low_stock_threshold_kg: parseFloat(e.target.value) || 1.0 }))}
                className="w-full bg-[#0e0e0e] border border-[#2a2725] rounded-xl px-4 py-3 text-sm text-[#f0ece6] focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-3 p-4 bg-[#0e0e0e] rounded-xl border border-[#2a2725]">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, is_available: !prev.is_available }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                formData.is_available ? 'bg-green-500' : 'bg-[#2a2725]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  formData.is_available ? 'translate-x-6' : ''
                }`}
              />
            </button>
            <div>
              <p className="text-[#f0ece6] text-sm font-medium">
                {formData.is_available ? 'Prodotto disponibile' : 'Prodotto nascosto'}
              </p>
              <p className="text-[#5a5650] text-xs">
                {formData.is_available ? 'Visibile sul sito' : 'Nascosto ai clienti'}
              </p>
            </div>
          </div>

          {/* Featured (Prodotto del giorno) */}
          <div className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
            formData.is_featured
              ? 'bg-primary/5 border-primary/30'
              : 'bg-[#0e0e0e] border-[#2a2725]'
          }`}>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, is_featured: !prev.is_featured }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                formData.is_featured ? 'bg-primary' : 'bg-[#2a2725]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  formData.is_featured ? 'translate-x-6' : ''
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <Star size={16} className={formData.is_featured ? 'text-primary fill-primary' : 'text-[#5a5650]'} />
              <div>
                <p className={`text-sm font-medium ${formData.is_featured ? 'text-primary' : 'text-[#f0ece6]'}`}>
                  {formData.is_featured ? '✦ Prodotto del giorno' : 'Prodotto del giorno'}
                </p>
                <p className="text-[#5a5650] text-xs">
                  Mostra il badge dorato sulla card del sito
                </p>
              </div>
            </div>
          </div>

          {/* Allergeni */}
          <div>
            <label className="block text-[#a8a39e] text-xs uppercase tracking-wider mb-3">
              Allergeni (EU Reg. 1169/2011)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALLERGEN_OPTIONS.map(opt => {
                const active = formData.allergens.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleAllergen(opt.value)}
                    className={`text-left px-3 py-2.5 rounded-xl border text-xs transition-all ${
                      active
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                        : 'bg-[#0e0e0e] border-[#2a2725] text-[#7a7570] hover:border-[#3a3530]'
                    }`}
                  >
                    <span className="mr-1">{active ? '✓' : '○'}</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {formData.allergens.length > 0 && (
              <p className="text-[#5a5650] text-xs mt-2">
                {formData.allergens.length} allergene{formData.allergens.length > 1 ? 'i' : ''} selezionato{formData.allergens.length > 1 ? 'i' : ''}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#2a2725]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#2a2725] text-[#a8a39e] text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-primary text-[#0e0e0e] text-sm font-bold hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {formData.id ? 'Aggiorna' : 'Crea Prodotto'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
