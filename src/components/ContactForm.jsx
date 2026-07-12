import { useState } from 'react';
import { Send, AlertCircle, Check } from 'lucide-react';
import { BUSINESS } from '../lib/config';
import { useLang } from '../App';

export default function ContactForm() {
  const { t } = useLang();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = true;
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) newErrors.email = true;
    if (!formData.message.trim()) newErrors.message = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Build WhatsApp message from form
    const msg = `📩 *Nuovo messaggio dal sito*\n\n👤 *Nome:* ${formData.name}\n📧 *Email:* ${formData.email}\n\n💬 *Messaggio:* ${formData.message}`;
    const url = `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          type="email"
          inputMode="email"
          placeholder={t.cart_email_placeholder}
          value={formData.email}
          onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors({}); }}
          className={`w-full bg-bg border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-dim/60 focus:outline-none focus:border-primary transition-colors duration-200 ${
            errors.email ? 'border-red-500/50' : 'border-border'
          }`}
        />
        {errors.email && (
          <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {t.cart_email_invalid}
          </p>
        )}
      </div>

      <div>
        <textarea
          placeholder={t.contacts_form_message || 'Il tuo messaggio...'}
          value={formData.message}
          onChange={(e) => { setFormData({ ...formData, message: e.target.value }); setErrors({}); }}
          rows={4}
          className={`w-full bg-bg border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-dim/50 focus:outline-none focus:border-primary transition-colors duration-200 resize-none ${
            errors.message ? 'border-red-500/50' : 'border-border'
          }`}
        />
        {errors.message && (
          <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {t.cart_field_required}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-bg font-bold py-3 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 text-sm shadow-md hover:bg-primary-light hover:shadow-lg hover:shadow-primary/20"
      >
        {sent ? (
          <><Check size={18} /> {t.cart_send || 'Inviato!'}</>
        ) : (
          <><Send size={16} /> {t.contacts_form_btn || 'Invia Messaggio'}</>
        )}
      </button>
    </form>
  );
}
