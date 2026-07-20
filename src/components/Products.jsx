import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Loader2, Search, X } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import { getProducts, supabase } from '../lib/supabase/client';
import { useLang } from '../App';

export default function Products({ onAddToCart }) {
  const { t } = useLang();
  const [activeCategory, setActiveCategory] = useState('tutti');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeDiet, setActiveDiet] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const searchRef = useRef(null);

  // Fetch products from Supabase on mount and when category changes
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        const category = activeCategory === 'tutti' ? undefined : activeCategory;
        const data = await getProducts(category);
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(t.products_error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();

    // Subscribe to real-time changes on products table
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        () => {
          // Refetch when any change happens
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeCategory]);

  const categoryLabels = {
    tutti: t.products_all,
    pane: t.products_bread,
    dolci: t.products_sweets,
    specialita: t.products_specialty,
  };

  const yearsOfTradition = new Date().getFullYear() - 1977;

  // Client-side search filter
  const searchLower = search.trim().toLowerCase();
  const filteredProducts = searchLower
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
      )
    : products;

  // Dietary filter
  const dietFiltered = activeDiet
    ? filteredProducts.filter((p) => {
        if (activeDiet === 'vegan') return p.dietary?.includes('vegan');
        if (activeDiet === 'senza_lattosio') return p.dietary?.includes('senza_lattosio');
        if (activeDiet === 'integrale') return p.dietary?.includes('integrale');
        return true;
      })
    : filteredProducts;

  // When category changes, reset search and diet filter
  const handleCategoryChange = (key) => {
    setActiveCategory(key);
    setSearch('');
    setActiveDiet(null);
  };

  if (loading) {
    return (
      <section id="prodotti" className="py-16 sm:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary mb-4" />
            <p className="text-text-muted">{t.products_loading || 'Caricamento prodotti...'}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="prodotti" className="py-16 sm:py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ═══ Section Title ═══ */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="ornament-divider mb-5">
            <span className="text-text-dim text-[11px] tracking-[0.25em] uppercase whitespace-nowrap">
              {yearsOfTradition} {t.products_tradition}
            </span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-primary tracking-tight">
            {t.products_title}
          </h2>
          <p className="text-text-muted mt-4 max-w-lg mx-auto text-sm sm:text-base">
            {t.products_subtitle}
          </p>
        </div>

        {/* ═══ Search + Category Tabs ═══ */}
        <div className="flex flex-col items-center gap-4 mb-10 sm:mb-14">

          {/* Search input */}
          <div className="relative w-full max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim/60 pointer-events-none" />
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.search_placeholder}
              aria-label={t.search_aria_label}
              className="w-full bg-white/[0.04] border border-border rounded-full pl-9 pr-9 py-2.5 text-sm text-text placeholder:text-text-dim/60 focus:outline-none focus:border-primary/50 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim/60 hover:text-text transition-colors"
                aria-label={t.search_clear}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {Object.keys(categoryLabels).map((key) => (
              <button
                key={key}
                onClick={() => handleCategoryChange(key)}
                className={`tab-pill px-5 sm:px-6 py-2.5 rounded-full text-sm font-medium border ${
                  activeCategory === key
                    ? 'active'
                    : 'text-text-muted bg-transparent border-border hover:border-primary/30'
                }`}
              >
                {categoryLabels[key]}
              </button>
            ))}
          </div>

          {/* ═══ Dietary filter pills ═══ */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveDiet(null)}
              className={`tab-pill px-4 py-2 rounded-full text-xs font-medium border ${
                !activeDiet
                  ? 'active'
                  : 'text-text-muted bg-transparent border-border hover:border-primary/30'
              }`}
            >
              Tutti
            </button>
            <button
              onClick={() => setActiveDiet('vegan')}
              className={`tab-pill px-4 py-2 rounded-full text-xs font-medium border ${
                activeDiet === 'vegan'
                  ? 'bg-green-500/20 border-green-500/40 text-green-400'
                  : 'text-text-muted bg-transparent border-border hover:border-primary/30'
              }`}
            >
              {t.filter_vegan}
            </button>
            <button
              onClick={() => setActiveDiet('senza_lattosio')}
              className={`tab-pill px-4 py-2 rounded-full text-xs font-medium border ${
                activeDiet === 'senza_lattosio'
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                  : 'text-text-muted bg-transparent border-border hover:border-primary/30'
              }`}
            >
              {t.filter_senza_lattosio}
            </button>
            <button
              onClick={() => setActiveDiet('integrale')}
              className={`tab-pill px-4 py-2 rounded-full text-xs font-medium border ${
                activeDiet === 'integrale'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'text-text-muted bg-transparent border-border hover:border-primary/30'
              }`}
            >
              {t.filter_integrale}
            </button>
          </div>
        </div>

        {/* ═══ Error State ═══ */}
        {error && (
          <div className="text-center py-12 mb-8 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* ═══ Search result count ═══ */}
        {search && (
          <p className="text-center text-text-dim text-sm mb-6">
            {dietFiltered.length === 0
              ? t.search_no_results
              : `${dietFiltered.length} ${t.search_results_count}${dietFiltered.length === 1 ? 'o' : 'i'} per "${search}"`}
          </p>
        )}

        {/* ═══ Product Grid ═══ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {dietFiltered.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <ProductCard product={product} onAdd={onAddToCart} onClick={() => setSelectedProduct(product)} />
            </div>
          ))}
        </div>

        {/* ═══ Empty State ═══ */}
        {dietFiltered.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white/[0.04] rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={28} className="text-text-dim" />
            </div>
            <p className="text-text-muted text-lg">
              {search ? `${t.search_no_results_for} "${search}"` : t.products_empty}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="mt-3 text-primary text-sm hover:underline">
                {t.search_clear_all}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={onAddToCart}
      />
    </section>
  );
}
