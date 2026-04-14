'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase-client';
import { useToast } from '@/components/ToastProvider';
import { X, Loader2, Save, AlertCircle, User } from 'lucide-react';

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSuccess: () => void;
}

interface Customer {
  id?: number;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string;
  loyalty_points: number;
  is_vip: boolean;
  total_orders: number;
  total_spent: number;
}

const emptyCustomer: Omit<Customer, 'id'> = {
  name: '',
  phone: null,
  email: null,
  notes: '',
  loyalty_points: 0,
  is_vip: false,
  total_orders: 0,
  total_spent: 0,
};

export default function CustomerForm({ isOpen, onClose, customer, onSuccess }: CustomerFormProps) {
  const { success, error: toastError } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Customer>(customer || (emptyCustomer as Customer));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer) {
      setFormData(customer);
    } else {
      setFormData(emptyCustomer as Customer);
    }
    setErrors({});
  }, [customer, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = 'Il nome deve avere almeno 2 caratteri';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const supabase = createBrowserClient();
    const dataToSave = {
      name: formData.name.trim(),
      phone: formData.phone?.trim() || null,
      email: formData.email?.trim() || null,
      notes: formData.notes.trim(),
      loyalty_points: formData.loyalty_points,
      is_vip: formData.is_vip,
    };

    try {
      let result;
      if (formData.id) {
        result = await supabase
          .from('customers')
          .update(dataToSave)
          .eq('id', formData.id)
          .select();
      } else {
        result = await supabase
          .from('customers')
          .insert([dataToSave])
          .select();
      }

      if (result.error) throw result.error;

      success(
        formData.id ? 'Cliente aggiornato' : 'Cliente creato',
        formData.name
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError('Errore', err.message || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative bg-[#161616] border border-[#2a2725] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-[#161616] border-b border-[#2a2725] p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <User size={18} className="text-primary" />
            </div>
            <h2 className="font-heading text-xl text-[#f0ece6]">
              {formData.id ? 'Modifica Cliente' : 'Nuovo Cliente'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#5a5650] hover:text-[#f0ece6] transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-[#a8a39e] text-xs uppercase tracking-wider mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Es: Mario Rossi"
              className={`w-full bg-[#0e0e0e] border rounded-xl px-4 py-3 text-sm text-[#f0ece6] placeholder:text-[#5a5650] focus:outline-none focus:border-primary transition-colors ${
                errors.name ? 'border-red-500/50' : 'border-[#2a2725]'
              }`}
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.name}
              </p>
            )}
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#a8a39e] text-xs uppercase tracking-wider mb-2">
                Telefono
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+39 333 1234567"
                className="w-full bg-[#0e0e0e] border border-[#2a2725] rounded-xl px-4 py-3 text-sm text-[#f0ece6] placeholder:text-[#5a5650] focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#a8a39e] text-xs uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@esempio.it"
                className={`w-full bg-[#0e0e0e] border rounded-xl px-4 py-3 text-sm text-[#f0ece6] placeholder:text-[#5a5650] focus:outline-none focus:border-primary transition-colors ${
                  errors.email ? 'border-red-500/50' : 'border-[#2a2725]'
                }`}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[#a8a39e] text-xs uppercase tracking-wider mb-2">
              Note
            </label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Note sul cliente..."
              rows={3}
              className="w-full bg-[#0e0e0e] border border-[#2a2725] rounded-xl px-4 py-3 text-sm text-[#f0ece6] placeholder:text-[#5a5650] focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Loyalty Points + VIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#a8a39e] text-xs uppercase tracking-wider mb-2">
                Punti Fedeltà
              </label>
              <input
                type="number"
                min="0"
                value={formData.loyalty_points}
                onChange={e => setFormData(prev => ({ ...prev, loyalty_points: parseInt(e.target.value) || 0 }))}
                className="w-full bg-[#0e0e0e] border border-[#2a2725] rounded-xl px-4 py-3 text-sm text-[#f0ece6] focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex items-end">
              <div className="flex items-center gap-3 p-4 bg-[#0e0e0e] rounded-xl border border-[#2a2725] w-full">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_vip: !prev.is_vip }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.is_vip ? 'bg-amber-500' : 'bg-[#2a2725]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      formData.is_vip ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
                <span className="text-[#f0ece6] text-sm font-medium">
                  VIP {formData.is_vip && '👑'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#2a2725]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#2a2725] text-[#a8a39e] text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-primary text-[#0e0e0e] text-sm font-bold hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {formData.id ? 'Aggiorna' : 'Crea Cliente'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
