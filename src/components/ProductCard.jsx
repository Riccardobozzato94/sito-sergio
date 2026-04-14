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
  glutine:       { label: 'Glutine',  color: 'bg-amber-500/15 text-amber-400  border-amber-500/20' },
  lattosio:      { label: 'Latte',    color: 'bg-blue-500/15  text-blue-400   border-blue-500/20'  },
  uova:          { label: 'Uova',     color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  frutta_guscio: { label: 'Frutta s.guscio', color: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  arachidi:      { label: 'Arachidi', color: 'bg-red-500/15   text-red-400    border-red-500/20'   },
  sesamo:        { label: 'Sesamo',   color: 'bg-lime-500/15  text-lime-400   border-lime-500/20'  },
  soia:          { label: 'Soia',     color: 'bg-green-500/15 text-green-400  border-green-500/20' },
  sedano:        { label: 'Sedano',   color: 'bg-teal-500/15  text-teal-400   border-teal-500/20'  },
};

export default function ProductCard({ product, onAdd }) {
  const { t } = useLang();
  const [justAdded, setJustAdded] = useState(false);
  const [shareJustCopied, setShareJustCopied] = useState(false);

  const displayImage = product.image_url || '/images/placeholder-product.jpg';
  const displayPrice = formatPrice(product.price, product.unit);

  const handleAdd = (e) => {
    e.stopPropagation();
    onAdd(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const message = `Ciao! Ho visto questo prodotto sul sito del Panificio Da Sergio e volevo condividerlo con te 🍞\n\n*${product.name}*\n${product.description ? product.description + '\n' : ''}Prezzo: ${displayPrice}\n\nOrdina su WhatsApp: https://wa.me/${BUSINESS.whatsappNumber}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setShareJustCopied(true);
    setTimeout(() => setShareJustCopied(false), 2000);
  };

  // Allergeni presenti nel prodotto (array o undefined se DB non ancora aggiornato)
  const allergenList = Array.isArray(product.allergens) ? product.allergens : [];

  return (
    <article className="product-card rounded-2xl overflow-hidden border border-[#2a2725]/60 group relative" role="article" aria-label={product.name}>

      {/* ═══ Badge "Del Giorno" ═══ */}
      {product.is_featured && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-primary text-[#0e0e0e] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-primary/30 uppercase tracking-wide">
          ✦ Del Giorno
        </div>
      )}

      {/* ═══ Share button ═══ */}
      <button
        onClick={handleShare}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 ${
          shareJustCopied
            ? 'bg-green-500 text-white'
            : 'bg-[#0e0e0e]/80 backdrop-blur-sm text-white/70 hover:text-white hover:bg-[#25d366]'
        }`}
        aria-label={`Condividi ${product.name} su WhatsApp`}
        title="Condividi su WhatsApp"
      >
        {shareJustCopied ? <Check size={14} /> : <Share2 size={13} />}
      </button>

      {/* ═══ Image ═══ */}
      <div className="card-image-wrapper aspect-square bg-[#1a1a1a]">
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
        <h3 className="font-heading text-white text-lg sm:text-xl mb-2 tracking-wide">
          {product.name}
        </h3>
        <p className="text-white/65 text-sm mb-3 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-primary font-bold text-xl">{displayPrice}</span>
          <span className="text-white/50 text-xs uppercase tracking-wide">{product.unit}</span>
        </div>

        {/* ═══ Allergen badges ═══ */}
        {allergenList.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mb-3">
            {allergenList.map((a) => {
              const info = ALLERGEN_LABELS[a];
              return info ? (
                <span
                  key={a}
                  title={`Contiene: ${info.label}`}
                  className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wide ${info.color}`}
                >
                  {info.label}
                </span>
              ) : null;
            })}
          </div>
        )}

        {/* Add to Cart — with feedback */}
        <button
          onClick={handleAdd}
          disabled={justAdded}
          className={`w-full font-bold text-sm py-3 rounded-xl transition-all duration-300 shadow-md ${
            justAdded
              ? 'bg-green-600 text-white shadow-green-600/20 cursor-default'
              : 'bg-[#d4a574] text-[#0e0e0e] shadow-[#d4a574]/15 hover:bg-[#e2be96] hover:shadow-[#d4a574]/30'
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
