'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase-client';
import { useToast } from '@/components/ToastProvider';
import ProductForm from '@/components/ProductForm';
import { importProductsFromExcel, exportProductsToExcel, downloadProductTemplate, type ExcelImportResult } from '@/lib/excel-utils';
import { Search, ToggleLeft, ToggleRight, Plus, Trash2, Upload, Download, FileSpreadsheet, Star } from 'lucide-react';

interface Product {
  id: number; name: string; slug: string; description: string;
  category: string; price: number; unit: string; image_url: string | null;
  is_available: boolean; is_featured: boolean; allergens: string[];
  stock_weight_kg: number | null; low_stock_threshold_kg: number; display_order: number;
}

const categoryLabels: Record<string, string> = {
  pane: 'Pane', dolci: 'Dolci', specialita: 'Specialità', salato: 'Salato', stagionale: 'Stagionale',
};
const categoryColors: Record<string, string> = {
  pane: 'bg-amber-500/10 text-amber-400', dolci: 'bg-pink-500/10 text-pink-400',
  specialita: 'bg-primary/10 text-primary', salato: 'bg-blue-500/10 text-blue-400',
  stagionale: 'bg-purple-500/10 text-purple-400',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { success, error: toastError } = useToast();

  async function fetchProducts() {
    setLoading(true);
    const supabase = createBrowserClient();
    const { data } = await supabase.from('products').select('*').order('display_order', { ascending: true });
    setProducts(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchProducts(); }, []);

  const toggleAvailability = async (product: Product) => {
    const supabase = createBrowserClient();
    const newVal = !product.is_available;
    const { error } = await supabase.from('products').update({ is_available: newVal }).eq('id', product.id);
    if (error) { toastError('Errore', error.message); return; }
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_available: newVal } : p));
    success(newVal ? 'Prodotto disponibile' : 'Prodotto nascosto', product.name);
  };

  const toggleFeatured = async (product: Product) => {
    const supabase = createBrowserClient();
    const newVal = !product.is_featured;
    // Se si attiva il featured, prima rimuovilo dagli altri
    if (newVal) {
      await supabase.from('products').update({ is_featured: false }).neq('id', product.id);
      setProducts(prev => prev.map(p => ({ ...p, is_featured: false })));
    }
    const { error } = await supabase.from('products').update({ is_featured: newVal }).eq('id', product.id);
    if (error) { toastError('Errore', error.message); return; }
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_featured: newVal } : p));
    success(newVal ? '✦ Prodotto del giorno impostato' : 'Rimosso da prodotto del giorno', product.name);
  };

  const updateStock = async (product: Product, kg: number) => {
    const supabase = createBrowserClient();
    const { error } = await supabase.from('products').update({ stock_weight_kg: kg }).eq('id', product.id);
    if (error) { toastError('Errore', error.message); return; }
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock_weight_kg: kg } : p));
    success('Giacenza aggiornata', `${product.name}: ${kg} kg`);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Eliminare "${product.name}"? Questa azione non può essere annullata.`)) return;
    const supabase = createBrowserClient();
    const { error } = await supabase.from('products').delete().eq('id', product.id);
    if (error) { toastError('Errore', error.message); return; }
    setProducts(prev => prev.filter(p => p.id !== product.id));
    success('Prodotto eliminato', product.name);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const result = await importProductsFromExcel(file);
      
      if (result.success > 0) {
        success('Import completato', `${result.success} prodotti importati`);
      }
      if (result.failed > 0) {
        toastError('Errori import', `${result.failed} righe fallite`);
      }
      if (result.errors.length > 0) {
        console.error('Import errors:', result.errors);
      }
      
      fetchProducts();
    } catch (err: any) {
      toastError('Errore import', err.message);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      await exportProductsToExcel();
      success('Esportazione completata', 'File Excel scaricato');
    } catch (err: any) {
      toastError('Errore esportazione', err.message);
    } finally {
      setExporting(false);
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())) &&
    (catFilter === 'all' || p.category === catFilter)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-2xl text-[#f0ece6]">Prodotti</h1>
            <p className="text-[#7a7570] text-sm mt-1">
              {products.length} prodotti · {products.filter(p => p.is_available).length} disponibili
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Import/Export buttons */}
            <label className="flex items-center gap-2 px-3 py-2.5 bg-[#161616] border border-[#2a2725] rounded-xl text-sm text-[#a8a39e] hover:border-primary cursor-pointer transition-colors">
              <Upload size={16} />
              Importa Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportExcel}
                disabled={importing}
                className="hidden"
              />
            </label>
            <button
              onClick={handleExportExcel}
              disabled={exporting}
              className="flex items-center gap-2 px-3 py-2.5 bg-[#161616] border border-[#2a2725] rounded-xl text-sm text-[#a8a39e] hover:border-primary transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              Esporta
            </button>
            <button
              onClick={downloadProductTemplate}
              className="flex items-center gap-2 px-3 py-2.5 bg-[#161616] border border-[#2a2725] rounded-xl text-sm text-[#a8a39e] hover:border-primary transition-colors"
            >
              <FileSpreadsheet size={16} />
              Template
            </button>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-[#0e0e0e] rounded-xl text-sm font-bold hover:bg-primary-light transition-colors shadow-lg shadow-primary/20"
            >
              <Plus size={18} />
              Aggiungi
            </button>
          </div>
        </div>
        <div className="section-line mt-3" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a5650]" />
          <input
            type="text" placeholder="Cerca prodotto..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#161616] border border-[#2a2725] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f0ece6] placeholder:text-[#5a5650] focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                catFilter === cat ? 'bg-primary/10 text-primary border-primary/30' : 'bg-transparent text-[#9a9590] border-[#2a2725] hover:border-[#3a3530]'
              }`}
            >
              {cat === 'all' ? 'Tutti' : categoryLabels[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-[#5a5650]">Caricamento...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#5a5650]">Nessun prodotto trovato</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(product => (
            <div
              key={product.id}
              className={`bg-[#161616] rounded-2xl border overflow-hidden transition-all duration-300 ${
                product.is_available ? 'border-[#2a2725] hover:border-primary/20' : 'border-red-500/15 opacity-60'
              }`}
            >
              {/* Image */}
              <div className="aspect-[4/3] bg-[#0e0e0e] flex items-center justify-center relative">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4a574" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}

                {/* Featured badge */}
                {product.is_featured && (
                  <div className="absolute top-3 left-3 bg-primary text-[#0e0e0e] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    ✦ Del Giorno
                  </div>
                )}

                {/* Featured toggle + Availability toggle */}
                <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                  <button
                    onClick={() => toggleFeatured(product)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors drop-shadow-lg ${
                      product.is_featured
                        ? 'bg-primary text-[#0e0e0e]'
                        : 'bg-[#0e0e0e]/70 text-[#5a5650] hover:text-primary'
                    }`}
                    title={product.is_featured ? 'Rimuovi da prodotto del giorno' : 'Imposta come prodotto del giorno'}
                  >
                    <Star size={14} className={product.is_featured ? 'fill-current' : ''} />
                  </button>
                  <button
                    onClick={() => toggleAvailability(product)}
                    aria-label={product.is_available ? 'Nascondi prodotto' : 'Mostra prodotto'}
                  >
                    {product.is_available ? (
                      <ToggleRight size={28} className="text-green-400 drop-shadow-lg" />
                    ) : (
                      <ToggleLeft size={28} className="text-red-400 drop-shadow-lg" />
                    )}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-heading text-base text-[#f0ece6]">{product.name}</h3>
                  {/* Action buttons */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-1.5 rounded-lg text-[#5a5650] hover:text-primary hover:bg-primary/10 transition-colors"
                      aria-label="Modifica prodotto"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="p-1.5 rounded-lg text-[#5a5650] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      aria-label="Elimina prodotto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-[#7a7570] text-sm line-clamp-2 mb-4 leading-relaxed">{product.description}</p>

                {/* Price + Category */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-primary font-bold text-lg">{Number(product.price).toFixed(2).replace('.', ',')}€</span>
                    <span className="text-[#5a5650] text-xs ml-1">/ {product.unit}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColors[product.category] || 'bg-white/5 text-[#5a5650]'}`}>
                    {categoryLabels[product.category] || product.category}
                  </span>
                </div>

                {/* Stock */}
                {product.stock_weight_kg !== null && (
                  <div className="pt-4 border-t border-[#2a2725]/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#7a7570] text-xs">Giacenza</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateStock(product, Math.max(0, (product.stock_weight_kg || 0) - 0.5))}
                          className="w-6 h-6 rounded bg-white/5 border border-[#2a2725] flex items-center justify-center text-[#5a5650] hover:text-primary transition-colors text-xs font-bold"
                        >−</button>
                        <span className="text-[#f0ece6] text-sm font-medium w-12 text-center">
                          {product.stock_weight_kg} kg
                        </span>
                        <button
                          onClick={() => updateStock(product, (product.stock_weight_kg || 0) + 0.5)}
                          className="w-6 h-6 rounded bg-white/5 border border-[#2a2725] flex items-center justify-center text-[#5a5650] hover:text-primary transition-colors text-xs font-bold"
                        >+</button>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-[#0e0e0e] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          product.stock_weight_kg <= product.low_stock_threshold_kg ? 'bg-amber-400' : 'bg-green-400'
                        }`}
                        style={{ width: `${Math.min((product.stock_weight_kg / Math.max(product.low_stock_threshold_kg * 3, 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Form Modal */}
      <ProductForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        product={editingProduct}
        onSuccess={fetchProducts}
      />
    </div>
  );
}
