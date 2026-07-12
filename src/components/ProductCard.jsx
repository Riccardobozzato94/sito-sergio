import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { BUSINESS } from '../lib/config';
import { useLang } from '../App';

// Helper: format price from database numeric field
function formatPrice(price, unit) {
  const formatted = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(price);
  return `${formatted} ${unit}`;
}

// EU 14 major allergens — icons and short labels
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

export default function ProductCard({ product, onAdd, onClick }) {
  const { t } = useLang();
  const [justAdded, setJustAdded] = useState(false);
  const [shareJustCopied, setShareJustCopied] = useState(false);

  const displayImage = product.image_url || '/images/placeholder-product.svg';
  const displayPrice = formatPrice(product.price, product.unit);

  const handleAdd = (e) => {
    e.stopPropagation();
    onAdd(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleCardClick = (e) => {
    // Don't open modal if clicking the add-to-cart or share buttons
    if (e.target.closest('button')) return;
    onClick?.();
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const message = `Ciao! Ho visto questo prodotto sul sito del Panificio Da Sergio e volevo condividerlo con te 🍞\n\n*${product.name}*\n${product.description ? product.description + '\n' : ''}Prezzo: ${displayPrice}\n\nOrdina su WhatsApp: https://wa.me/${BUSINESS.whatsappNumber}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setShareJustCopied(true);
    setTimeout(() => setShareJustCopied(false), 2000);
  };

  // Allergeni presenti nel prodotto
  const allergenList = Array.isArray(product.allergens) ? product.allergens : [];

  return (
    <article className="product-card rounded-2xl overflow-hidden group relative cursor-pointer" role="article" aria-label={product.name} onClick={handleCardClick}>

      {/* ═══ Badge "Del Giorno" — più elegante ═══ */}
      {product.is_featured && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-primary/90 text-bg text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg uppercase tracking-[0.08em]">
          {t.product_of_day}
        </div>
      )}

      {/* ═══ Share button — visible on hover AND touch ═══ */}
      <button
        onClick={handleShare}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100 ${
          shareJustCopied
            ? 'bg-green-500 text-white'
            : 'bg-bg/60 backdrop-blur-sm text-text-dim hover:text-white hover:bg-[#25d366]'
        }`}
        aria-label={`${t.product_share_label} ${product.name} WhatsApp`}
        title={t.product_share_whatsapp}
      >
        {shareJustCopied ? <Check size={14} /> : <Share2 size={13} />}
      </button>

      {/* ═══ Image ═══ */}
      <div className="card-image-wrapper aspect-square bg-bg-elevated">
        <img
          src={displayImage}
          alt={`${product.name} — Prodotto artigianale del Panificio Da Sergio, Chioggia`}
          className="img-cover"
          loading="lazy"
          width="400"
          height="400"
        />
      </div>

      {/* ═══ Info ═══ */}
      <div className="p-4 sm:p-5 text-center">
        <h3 className="font-heading text-white text-lg sm:text-xl mb-2 tracking-tight">
          {product.name}
        </h3>
        <p className="text-text-muted text-sm mb-3 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-primary font-bold text-xl tracking-tight">{displayPrice}</span>
          <span className="text-text-dim text-[10px] uppercase tracking-wider">{product.unit}</span>
        </div>

        {/* ═══ Allergen badges ═══ */}
        {allergenList.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mb-3">
            {allergenList.map((a) => {
              const info = ALLERGEN_LABELS[a];
              return info ? (
                <span
                  key={a}
                  title={`Contiene: ${t[info.key]}`}
                  className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wide ${info.color}`}
                >
                  {t[info.key]}
                </span>
              ) : null;
            })}
          </div>
        )}

        {/* Add to Cart */}
        <button
          onClick={handleAdd}
          disabled={justAdded}
          className={`w-full font-bold text-sm py-3 rounded-xl transition-all duration-300 shadow-md ${
            justAdded
              ? 'bg-green-600 text-white shadow-green-600/20 cursor-default'
              : 'bg-primary text-bg shadow-primary/15 hover:bg-primary-light hover:shadow-primary/30 hover:-translate-y-0.5'
          }`}
          aria-label={`${t.products_add_cart}: ${product.name}`}
        >
          {justAdded ? (
            <span className="inline-flex items-center gap-1.5">
              <Check size={16} />
              {t.products_added}
            </span>
          ) : (
            t.products_add_cart
          )}
        </button>
      </div>
    </article>
  );
}
