import { useEffect } from 'react';
import { X, Check, Share2, MessageCircle } from 'lucide-react';
import { BUSINESS } from '../lib/config';
import { useLang } from '../App';
import useFocusTrap from '../lib/useFocusTrap';
import { imageUrl } from '../lib/images';

// Allergen labels (same as ProductCard)
const ALLERGEN_LABELS = {
  glutine:       { key: 'allergen_glutine',  color: 'bg-amber-500/10 text-amber-400  border-amber-500/20' },
  lattosio:      { key: 'allergen_latte',    color: 'bg-blue-500/10  text-blue-400   border-blue-500/20'  },
  uova:          { key: 'allergen_uova',     color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  frutta_guscio: { key: 'allergen_frutta_guscio', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  arachidi:      { key: 'allergen_arachidi', color: 'bg-red-500/10   text-red-400    border-red-500/20'   },
  sesamo:        { key: 'allergen_sesamo',   color: 'bg-lime-500/10  text-lime-400   border-lime-500/20'  },
  soia:          { key: 'allergen_soia',     color: 'bg-green-500/10 text-green-400  border-green-500/20' },
  sedano:        { key: 'allergen_sedano',   color: 'bg-teal-500/10  text-teal-400   border-teal-500/20'  },
};

function formatPrice(price, unit) {
  const formatted = new Intl.NumberFormat('it-IT', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
  }).format(price);
  return `${formatted} ${unit}`;
}

export default function ProductModal({ product, onClose, onAddToCart }) {
  const { t } = useLang();
  const focusTrapRef = useFocusTrap(!!product);

  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  // Close on Escape
  useEffect(() => {
    if (!product) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [product, onClose]);

  if (!product) return null;

  const allergenList = Array.isArray(product.allergens) ? product.allergens : [];
  const displayImage = imageUrl(product.image_url || '/images/placeholder-product.svg');
  const displayPrice = formatPrice(product.price, product.unit);

  const handleShare = () => {
    const message = `Ciao! Ho visto questo prodotto sul sito del Panificio Da Sergio e volevo condividerlo con te 🍞\n\n*${product.name}*\n${product.description ? product.description + '\n' : ''}Prezzo: ${displayPrice}\n\nOrdina su WhatsApp: https://wa.me/${BUSINESS.whatsappNumber}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsApp = () => {
    const message = `Vorrei ordinare: *${product.name}* (${displayPrice})`;
    window.open(`https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      ref={focusTrapRef}
      className="fixed inset-0 z-[100] bg-bg/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      tabIndex={-1}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[101] text-text-dim hover:text-text p-2 rounded-full hover:bg-white/5 transition-all duration-200"
        aria-label={t.gallery_close}
      >
        <X size={28} />
      </button>

      {/* Modal Content */}
      <div className="bg-bg-card border border-border rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50 animate-scale-in">
        {/* Image */}
        <div className="relative aspect-square bg-bg-elevated rounded-t-2xl overflow-hidden">
          <img
            src={displayImage}
            alt={`${product.name} — Panificio Da Sergio`}
            className="w-full h-full object-cover"
          />
          {product.is_featured && (
            <div className="absolute top-4 left-4 bg-primary/90 text-bg text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {t.product_of_day}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="font-heading text-2xl sm:text-3xl text-primary tracking-tight">
              {product.name}
            </h2>
            <div className="text-right shrink-0">
              <span className="text-primary font-bold text-2xl">{displayPrice}</span>
            </div>
          </div>

          {product.description && (
            <p className="text-text-muted text-sm sm:text-base leading-relaxed mb-6">
              {product.description}
            </p>
          )}

          {/* Allergens */}
          {allergenList.length > 0 && (
            <div className="mb-6">
              <h4 className="text-text-dim text-xs uppercase tracking-wider mb-2 font-semibold">
                {t.allergen_title || 'Allergeni'}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {allergenList.map((a) => {
                  const info = ALLERGEN_LABELS[a];
                  return info ? (
                    <span
                      key={a}
                      className={`text-[10px] font-semibold px-2 py-1 rounded border uppercase tracking-wide ${info.color}`}
                    >
                      {t[info.key]}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Ingredients */}
          {product.ingredients && (
            <div className="mb-6">
              <h4 className="text-text-dim text-xs uppercase tracking-wider mb-2 font-semibold">
                {t.ingredient_title || 'Ingredienti'}
              </h4>
              <p className="text-text-muted text-sm leading-relaxed">
                {Array.isArray(product.ingredients) ? product.ingredients.join(', ') : product.ingredients}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => { onAddToCart(product); onClose(); }}
              className="flex-1 bg-primary text-bg font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 text-sm shadow-md hover:bg-primary-light hover:shadow-lg hover:shadow-primary/20"
            >
              <Check size={18} />
              {t.products_add_cart}
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-[#25d366]/30 text-[#25d366] hover:bg-[#25d366]/5 transition-all duration-300 text-sm font-bold"
            >
              <MessageCircle size={18} />
              WhatsApp
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center w-12 rounded-xl border border-border text-text-dim hover:text-[#25d366] hover:border-[#25d366]/30 transition-all duration-300"
              aria-label={t.product_share_whatsapp}
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
