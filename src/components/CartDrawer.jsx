import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, MessageCircle, AlertCircle, Truck, Store, Calendar, CreditCard } from 'lucide-react';
import { BUSINESS } from '../lib/config';
import { getOrderHistory, saveOrderHistory } from '../lib/order-history';
import { useLang } from '../App';
import { imageUrl } from '../lib/images';

/** RFC-compliant email: requires at least 2-char TLD */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Throttle interval (ms) to prevent WhatsApp button spam */
const WHATSAPP_COOLDOWN_MS = 8_000;

export default function CartDrawer({ isOpen, onClose, items, onUpdateQuantity }) {
  const { t } = useLang();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    deliveryMethod: 'pickup',
    pickupTime: t.cart_pickup_morning,
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  const lastSentAt = useRef(0);

  const subtotal = items.reduce((sum, item) => {
    const price = item.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const shipping = formData.deliveryMethod === 'courier' ? (subtotal >= 50 ? 0 : 5.90) : 0;
  const total = subtotal + shipping;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = true;
    if (!formData.phone.trim()) newErrors.phone = true;
    if (!formData.email.trim()) {
      newErrors.email = true;
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.emailFormat = true;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendWhatsApp = useCallback(() => {
    const now = Date.now();
    if (isSending || now - lastSentAt.current < WHATSAPP_COOLDOWN_MS) return;
    if (!validate()) return;

    const methodLabels = {
      pickup: '🏪 Ritiro in negozio',
      courier: '🚚 Spedizione a domicilio',
      reservation: '📅 Prenotazione',
    };

    let message = `🍞 *Nuovo Ordine — Panificio Da Sergio*\n\n`;
    message += `👤 *Cliente:* ${formData.name}\n`;
    message += `📞 *Telefono:* ${formData.phone}\n`;
    message += `📧 *Email:* ${formData.email}\n`;
    message += `📦 *Consegna:* ${methodLabels[formData.deliveryMethod]}\n`;
    if (formData.deliveryMethod === 'pickup') {
      message += `🕐 *Orario:* ${formData.pickupTime}\n`;
    }
    message += `\n🛒 *Prodotti:*\n`;
    items.forEach((item) => {
      const itemTotal = (item.price * item.quantity).toFixed(2).replace('.', ',');
      message += `  • ${item.name} × ${item.quantity} — ${itemTotal}€\n`;
    });
    message += `\n💰 *Subtotale:* ${subtotal.toFixed(2).replace('.', ',')}€`;
    if (shipping > 0) {
      message += `\n🚚 *Spedizione:* ${shipping.toFixed(2).replace('.', ',')}€`;
    }
    message += `\n\n💵 *TOTALE:* ${total.toFixed(2).replace('.', ',')}€`;
    if (formData.notes.trim()) {
      message += `\n\n📝 *Note:* ${formData.notes}`;
    }
    message += `\n\n_Inviato dal sito panificiodasergio.it_`;

    setIsSending(true);
    lastSentAt.current = Date.now();

    saveOrderHistory(items);
    const url = `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    setTimeout(() => setIsSending(false), WHATSAPP_COOLDOWN_MS);
  }, [formData, items, isSending, t]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  return (
    <>
      {/* ═══ Overlay ═══ */}
      <div
        className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ═══ Drawer ═══ */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-[#1a1410]/95 backdrop-blur-2xl z-50 shadow-2xl shadow-black/60 border-l border-white/[0.04] animate-slide-in flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label={t.cart_title}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <h2 className="font-heading text-primary text-xl tracking-tight">{t.cart_title}</h2>
          <button
            onClick={onClose}
            className="text-text-dim hover:text-primary transition-colors duration-200 p-1 rounded-lg hover:bg-white/[0.04]"
            aria-label={t.cart_close}
          >
            <X size={20} />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 ? (
            <>
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-white/[0.04] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={24} className="text-text-dim" />
                </div>
                <p className="text-text-muted text-lg font-heading">{t.cart_empty_title}</p>
                <p className="text-text-dim text-sm mt-2">{t.cart_empty_text}</p>
              </div>
              {/* ═══ Last order reorder (only in empty cart) ═══ */}
              {(() => {
                try {
                  var history = getOrderHistory();
                  if (history.length === 0) return null;
                  var lastOrder = history[0];
                  var msg = 'Ciao! Vorrei riordinare il solito:\n';
                  lastOrder.items.forEach(function(item) {
                    msg += '  \u2022 ' + item.name + ' \u00d7 ' + item.quantity + '\n';
                  });
                  return (
                    <div className="mt-6 bg-white/[0.03] rounded-xl p-4 border border-border">
                      <p className="text-text-dim text-xs uppercase tracking-wider mb-3 font-semibold">
                        {t.reorder_title || 'I tuoi ultimi acquisti'}
                      </p>
                      <div className="space-y-1.5 mb-3">
                        {lastOrder.items.map(function(item) {
                          return (
                            <div key={item.id} className="flex items-center justify-between text-xs">
                              <span className="text-text-muted">{item.name} \u00d7 {item.quantity}</span>
                              <span className="text-text-dim">{item.price} \u20ac</span>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        onClick={function() {
                          var url = 'https://wa.me/' + BUSINESS.whatsappNumber + '?text=' + encodeURIComponent(msg);
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                        className="w-full text-xs font-semibold py-2 rounded-xl border border-[#25d366]/30 text-[#25d366] hover:bg-[#25d366]/5 transition-all"
                      >
                        {t.reorder_btn || 'Riordina'} via WhatsApp
                      </button>
                    </div>
                  );
                } catch(e) { return null; }
              })()}
            </>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-bg rounded-xl p-3 border border-border">
                <img
                  src={imageUrl(item.image_url || '/images/placeholder-product.svg')}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover bg-bg-elevated shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-text text-sm font-medium truncate">{item.name}</h4>
                  <p className="text-text-dim text-xs mt-0.5">
                    {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(item.price)} {item.unit}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center bg-bg-card border border-border rounded-md text-text-dim hover:text-primary hover:border-primary/30 transition-all duration-200"
                      aria-label={t.cart_decrease}
                    >
                      <Minus size={13} />
                    </button>
                    <span className="text-text text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center bg-bg-card border border-border rounded-md text-text-dim hover:text-primary hover:border-primary/30 transition-all duration-200"
                      aria-label={t.cart_increase}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ═══ Checkout Form ═══ */}
        {items.length > 0 && (
          <div className="border-t border-white/[0.04] p-5 space-y-3 bg-bg-subtle/60 backdrop-blur-md max-h-[60vh] overflow-y-auto safe-bottom">

            {/* ═══ Delivery Method Selection ═══ */}
            <div>
              <label className="text-text-dim text-xs uppercase tracking-wider mb-2 block">{t.cart_delivery_label}</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setFormData({ ...formData, deliveryMethod: 'pickup' })}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all duration-200 ${
                    formData.deliveryMethod === 'pickup'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-dim hover:border-white/20'
                  }`}
                >
                  <Store size={18} />
                  <span>{t.cart_delivery_pickup}</span>
                </button>

                <button
                  onClick={() => setFormData({ ...formData, deliveryMethod: 'courier' })}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all duration-200 ${
                    formData.deliveryMethod === 'courier'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-dim hover:border-white/20'
                  }`}
                >
                  <Truck size={18} />
                  <span>{t.cart_delivery_courier}</span>
                </button>

                <button
                  onClick={() => setFormData({ ...formData, deliveryMethod: 'reservation' })}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all duration-200 ${
                    formData.deliveryMethod === 'reservation'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-dim hover:border-white/20'
                  }`}
                >
                  <Calendar size={18} />
                  <span>{t.cart_delivery_reservation}</span>
                </button>
              </div>
            </div>

            {/* Courier info */}
            {formData.deliveryMethod === 'courier' && (
              <div className="bg-white/[0.03] border border-border rounded-xl p-3 text-xs text-text-muted leading-relaxed">
                <p className="text-text font-semibold mb-1">📦 {t.cart_courier_title}</p>
                <p dangerouslySetInnerHTML={{ __html: t.cart_courier_info }} />
              </div>
            )}

            {/* Reservation info */}
            {formData.deliveryMethod === 'reservation' && (
              <div className="bg-white/[0.03] border border-border rounded-xl p-3 text-xs text-text-muted leading-relaxed">
                <p className="text-text font-semibold mb-1">📅 {t.cart_reservation_title}</p>
                <p>{t.cart_reservation_info}</p>
              </div>
            )}

            {/* ═══ Contact Fields ═══ */}
            <div>
              <input
                type="text"
                placeholder={t.cart_name_placeholder}
                value={formData.name}
                onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors({}); }}
                className={`w-full bg-bg border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-dim/60 focus:outline-none focus:border-primary transition-colors duration-200 ${
                  errors.name ? 'border-red-500/50' : 'border-border'
                }`}
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {t.cart_field_required}
                </p>
              )}
            </div>

            <div>
              <input
                type="tel"
                inputMode="tel"
                placeholder={t.cart_phone_placeholder}
                value={formData.phone}
                onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setErrors({}); }}
                className={`w-full bg-bg border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-dim/60 focus:outline-none focus:border-primary transition-colors duration-200 ${
                  errors.phone ? 'border-red-500/50' : 'border-border'
                }`}
              />
              {errors.phone && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {t.cart_field_required}
                </p>
              )}
            </div>

            <div>
              <input
                type="email"
                inputMode="email"
                placeholder={t.cart_email_placeholder}
                value={formData.email}
                onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors({}); }}
                className={`w-full bg-bg border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-dim/60 focus:outline-none focus:border-primary transition-colors duration-200 ${
                  errors.email || errors.emailFormat ? 'border-red-500/50' : 'border-border'
                }`}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {t.cart_email_required}
                </p>
              )}
              {errors.emailFormat && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {t.cart_email_invalid}
                </p>
              )}
            </div>

            {/* Pickup time slots */}
            {formData.deliveryMethod === 'pickup' && (
              <div>
                <label className="text-text-dim text-xs uppercase tracking-wider mb-2 block">{t.slot_title}</label>
                <select
                  value={formData.pickupTime}
                  onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text focus:outline-none focus:border-primary transition-colors duration-200 appearance-none cursor-pointer"
                >
                  <option value={t.slot_today_12}>{t.slot_today_12}</option>
                  <option value={t.slot_today_17}>{t.slot_today_17}</option>
                  <option value={t.slot_tomorrow_07}>{t.slot_tomorrow_07}</option>
                  <option value={t.slot_tomorrow_12}>{t.slot_tomorrow_12}</option>
                  <option value={t.slot_tomorrow_17}>{t.slot_tomorrow_17}</option>
                </select>
              </div>
            )}

            {/* Cutoff message */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 text-xs text-amber-300">
              {t.cutoff_message}
            </div>

            {/* Notes */}
            <textarea
              placeholder={t.cart_notes_placeholder}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-dim/50 focus:outline-none focus:border-primary transition-colors duration-200 resize-none"
            />

            {/* Totale */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="font-heading text-text-muted text-base">{t.cart_total}</span>
              <div className="text-right">
                <span className="font-heading text-primary text-2xl font-bold">
                  {total.toFixed(2).replace('.', ',')}€
                </span>
                {shipping > 0 && (
                  <p className="text-text-dim text-[10px] mt-0.5">incl. {shipping.toFixed(2).replace('.', ',')}€ spedizione</p>
                )}
              </div>
            </div>

            {subtotal < 5 && subtotal > 0 && (
              <p className="text-amber-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {t.min_order_error}
              </p>
            )}

            {/* ═══ Checkout / WhatsApp actions ═══ */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  if (!validate()) return;
                  onClose();
                  navigate('/checkout');
                }}
                className="w-full bg-primary text-bg font-bold py-3.5 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 text-sm shadow-md hover:bg-primary-light hover:shadow-lg hover:shadow-primary/20"
              >
                <CreditCard size={18} />
                {t.cart_stripe_btn}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.04]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#1a1410]/95 px-3 text-text-dim text-[10px] uppercase tracking-wider">{t.cart_or}</span>
                </div>
              </div>

              <button
                onClick={handleSendWhatsApp}
                disabled={isSending || subtotal < 5}
                aria-busy={isSending}
                className={`w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 text-sm border ${
                  isSending
                    ? 'border-white/10 text-text-dim cursor-not-allowed'
                    : 'border-[#25d366]/30 text-[#25d366] hover:bg-[#25d366]/5 hover:border-[#25d366]/60'
                } ${subtotal < 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {isSending ? t.cart_send : t.cart_order_whatsapp}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
