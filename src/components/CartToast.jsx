import { useEffect, useState } from 'react';
import { Check, ShoppingBag } from 'lucide-react';
import { useLang } from '../App';

/**
 * CartToast — notification bar that slides in from the top when a product
 * is added to the cart.
 *
 * Props:
 *   toast: { id, productName } | null   — set by App.jsx addToCart()
 */
export default function CartToast({ toast }) {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(timer);
  }, [toast?.id]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`
        fixed top-[72px] left-1/2 -translate-x-1/2 z-[200]
        flex items-center gap-3
        bg-bg-card/95 backdrop-blur-xl
        border border-green-500/30
        text-text text-sm font-medium
        px-5 py-3 rounded-2xl
        shadow-2xl shadow-black/40
        transition-all duration-400 ease-out
        ${visible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
        }
      `}
    >
      {/* Green check icon */}
      <span className="w-7 h-7 rounded-full bg-green-500/15 flex items-center justify-center shrink-0">
        <Check size={14} className="text-green-400" />
      </span>

      {/* Message */}
      <span className="max-w-[200px] truncate">
        <span className="text-green-400 font-semibold">{toast.productName}</span>
        {' '}{t.cart_added_toast.replace('✓ ', '')}
      </span>

      {/* Cart icon */}
      <ShoppingBag size={15} className="text-text-dim shrink-0" />
    </div>
  );
}
