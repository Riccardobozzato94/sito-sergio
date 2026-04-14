import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Loader2, Search, X } from 'lucide-react';
import ProductCard from './ProductCard';
import { getProducts, supabase } from '../lib/supabase/client';
import { useLang } from '../App';

export default function Products({ onAddToCart }) {
  const { t } = useLang();
  const [activeCategory, setActiveCategory] = useState('tutti');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
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
        setError('Errore nel caricamento dei prodotti');
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

  // Client-side search filter (runs after fetch, no extra DB call)
  const searchLower = search.trim().toLowerCase();
  const filteredProducts = searchLower
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
      )
    : products;

  // When category changes, reset search
  const handleCategoryChange = (key) => {
    setActiveCategory(key);
    setSearch('');
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
            <span className="text-white/50 text-[11px] tracking-[0.25em] uppercase whitespace-nowrap">
              {yearsOfTradition} {t.products_tradition}
            </span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-primary tracking-wide">
            {t.products_title}
          </h2>
          <p className="text-white/65 mt-4 max-w-lg mx-auto text-sm sm:text-base">
            {t.products_subtitle}
          </p>
        </div>

        {/* ═══ Search + Category Tabs ═══ */}
        <div className="flex flex-col items-center gap-4 mb-10 sm:mb-14">

          {/* Search input */}
          <div className="relative w-full max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none" />
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca un prodotto..."
              aria-label="Cerca prodotti"
              className="w-full bg-white/5 border border-[#2a2725] rounded-full pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-primary/50 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white transition-colors"
                aria-label="Cancella ricerca"
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
                className={`tab-pill px-5 sm:px-6 py-2.5 rounded-full text-sm font-medium border border-[#2a2725] ${
                  activeCategory === key
                    ? 'active'
                    : 'text-text-muted bg-transparent hover:border-primary/30'
                }`}
              >
                {categoryLabels[key]}
              </button>
            ))}
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
          <p className="text-center text-white/45 text-sm mb-6">
            {filteredProducts.length === 0
              ? 'Nessun prodotto trovato'
              : `${filteredProducts.length} risultat${filteredProducts.length === 1 ? 'o' : 'i'} per "${search}"`}
          </p>
        )}

        {/* ═══ Product Grid ═══ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <ProductCard product={product} onAdd={onAddToCart} />
            </div>
          ))}
        </div>

        {/* ═══ Empty State ═══ */}
        {filteredProducts.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={28} className="text-text-dim" />
            </div>
            <p className="text-white/65 text-lg">
              {search ? `Nessun risultato per "${search}"` : t.products_empty}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="mt-3 text-primary text-sm hover:underline">
                Cancella ricerca
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
