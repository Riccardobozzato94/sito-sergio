import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Check } from 'lucide-react';
import { createCheckoutSession, getStripe } from '../lib/stripe';

export default function Checkout({ cart, onClearCart }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    deliveryMethod: 'pickup',
    pickupTime: 'Mattina (8:00–12:00)',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#1a1410] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-text-muted">Carrello vuoto</p>
          <a href="#/" className="text-primary text-sm hover:underline mt-2 inline-block">
            ← Torna al negozio
          </a>
        </div>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const shipping = form.deliveryMethod === 'courier' ? 5.9 : 0;
  const total = subtotal + shipping;

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nome obbligatorio';
    if (!form.email.trim()) errs.email = 'Email obbligatoria';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) errs.emailFormat = 'Email non valida';
    if (!form.phone.trim()) errs.phone = 'Telefono obbligatorio';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      const stripe = await getStripe();
      if (!stripe) {
        // No Stripe configured — fall back to WhatsApp
        const message = generateWhatsAppMessage();
        const url = `https://wa.me/39041401200?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        onClearCart();
        navigate('/');
        return;
      }

      const session = await createCheckoutSession(cart, form);
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (stripeError) {
        setError(stripeError.message);
      }
    } catch (err) {
      setError(err.message || 'Errore durante il checkout. Riprova.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1410]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-text-dim hover:text-primary transition-colors text-sm mb-6"
        >
          <ArrowLeft size={16} />
          Indietro
        </button>

        <h1 className="text-3xl font-heading text-primary tracking-tight mb-2">Checkout</h1>
        <p className="text-text-muted text-sm mb-8">Conferma i dati e procedi al pagamento</p>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ═══ Order Summary ═══ */}
          <div className="bg-[#201c17] border border-white/[0.04] rounded-2xl p-4 sm:p-6">
            <h2 className="text-white font-heading text-base mb-4">Riepilogo Ordine</h2>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">
                    {item.name} <span className="text-text-dim">×{item.quantity}</span>
                  </span>
                  <span className="text-white">
                    {(item.price * item.quantity).toFixed(2).replace('.', ',')}€
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/[0.04] mt-3 pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-text-dim">Subtotale</span>
                <span className="text-text-muted">{subtotal.toFixed(2).replace('.', ',')}€</span>
              </div>
              {shipping > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-dim">Spedizione</span>
                  <span className="text-text-muted">{shipping.toFixed(2).replace('.', ',')}€</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-1">
                <span className="text-white">Totale</span>
                <span className="text-primary">{total.toFixed(2).replace('.', ',')}€</span>
              </div>
            </div>
          </div>

          {/* ═══ Delivery ═══ */}
          <div className="bg-[#201c17] border border-white/[0.04] rounded-2xl p-4 sm:p-6">
            <h2 className="text-white font-heading text-base mb-4">Consegna</h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { value: 'pickup', label: 'Ritiro' },
                { value: 'courier', label: 'Spedizione' },
                { value: 'reservation', label: 'Prenota' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, deliveryMethod: opt.value }))}
                  className={`py-3 rounded-xl border text-xs font-medium transition-all ${
                    form.deliveryMethod === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-dim hover:border-white/20'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {form.deliveryMethod === 'pickup' && (
              <select
                value={form.pickupTime}
                onChange={(e) => setForm((f) => ({ ...f, pickupTime: e.target.value }))}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option>Mattina (8:00–12:00)</option>
                <option>Pomeriggio (14:00–19:00)</option>
              </select>
            )}

            {form.deliveryMethod === 'courier' && (
              <div className="bg-white/[0.03] border border-border rounded-xl p-3 text-xs text-text-muted">
                Spedizione 5,90€. Gratuita sopra 50€. Consegna 24-48h in tutta Italia.
              </div>
            )}
          </div>

          {/* ═══ Customer Info ═══ */}
          <div className="bg-[#201c17] border border-white/[0.04] rounded-2xl p-4 sm:p-6">
            <h2 className="text-white font-heading text-base mb-4">I Tuoi Dati</h2>
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Nome *"
                  className={`w-full bg-bg border rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-dim/50 focus:outline-none focus:border-primary ${errors.name ? 'border-red-500/50' : 'border-border'}`}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="Email *"
                  className={`w-full bg-bg border rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-dim/50 focus:outline-none focus:border-primary ${errors.email || errors.emailFormat ? 'border-red-500/50' : 'border-border'}`}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                {errors.emailFormat && <p className="text-red-400 text-xs mt-1">Inserisci un'email valida</p>}
              </div>
              <div>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="Telefono *"
                  className={`w-full bg-bg border rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-dim/50 focus:outline-none focus:border-primary ${errors.phone ? 'border-red-500/50' : 'border-border'}`}
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Note (allergie, preferenze...)"
                rows={2}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-dim/50 focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* ═══ Submit ═══ */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-bg font-bold py-4 rounded-xl hover:bg-primary-light transition-all duration-300 text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {loading ? 'Elaborazione...' : `Paga ${total.toFixed(2).replace('.', ',')}€`}
          </button>

          <div className="text-center">
            <p className="text-text-dim text-[10px] leading-relaxed">
              Pagamento sicuro tramite Stripe. Carte di credito, debito, Apple Pay e Google Pay accettati.
              <br />I tuoi dati sono protetti e mai condivisi.
            </p>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="text-white/30 text-xs">Visa</span>
              <span className="text-white/30 text-xs">MC</span>
              <span className="text-white/30 text-xs">Amex</span>
              <span className="text-white/30 text-xs">PayPal</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
