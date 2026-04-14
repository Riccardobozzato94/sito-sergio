'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase-client';
import { useToast } from '@/components/ToastProvider';
import { Plus, Tag, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface Promo {
  id: number; title: string; description: string;
  discount_pct: number; valid_from: string; valid_to: string;
  is_active: boolean; product_ids: number[]; created_at: string;
}

const empty = (): Omit<Promo,'id'|'created_at'> => ({
  title: '', description: '', discount_pct: 10,
  valid_from: new Date().toISOString().slice(0,16),
  valid_to: new Date(Date.now()+7*86400000).toISOString().slice(0,16),
  is_active: true, product_ids: [],
});

export default function PromotionsPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const { success, error: toastError } = useToast();

  async function load() {
    setLoading(true);
    const supabase = createBrowserClient();
    const { data } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
    setPromos(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!form.title || form.discount_pct <= 0) { toastError('Errore', 'Compila tutti i campi'); return; }
    setSaving(true);
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('promotions').insert([{
      ...form,
      valid_from: new Date(form.valid_from).toISOString(),
      valid_to: new Date(form.valid_to).toISOString(),
    }]).select().single();
    setSaving(false);
    if (error) { toastError('Errore', error.message); return; }
    setPromos(prev => [data, ...prev]);
    setShowForm(false);
    setForm(empty());
    success('Promozione creata', form.title);
  }

  async function toggleActive(promo: Promo) {
    const supabase = createBrowserClient();
    const newVal = !promo.is_active;
    const { error } = await supabase.from('promotions').update({ is_active: newVal }).eq('id', promo.id);
    if (error) { toastError('Errore', error.message); return; }
    setPromos(prev => prev.map(p => p.id === promo.id ? { ...p, is_active: newVal } : p));
    success(newVal ? 'Attivata' : 'Disattivata', promo.title);
  }

  async function handleDelete(id: number) {
    const supabase = createBrowserClient();
    const { error } = await supabase.from('promotions').delete().eq('id', id);
    if (error) { toastError('Errore', error.message); return; }
    setPromos(prev => prev.filter(p => p.id !== id));
    success('Eliminata', '');
  }

  const now = new Date();
  const active = promos.filter(p => p.is_active && new Date(p.valid_to) > now);
  const expired = promos.filter(p => !p.is_active || new Date(p.valid_to) <= now);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-[#f0ece6]">Promozioni</h1>
          <p className="text-[#7a7570] text-sm mt-1">{promos.length} totali · {active.length} attive</p>
          <div className="section-line mt-3" />
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-[#0e0e0e] font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-primary-light transition-colors"
        >
          <Plus size={16} /> Nuova Promozione
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-[#161616] rounded-2xl border border-[#2a2725] p-6 space-y-4">
          <h3 className="font-heading text-lg text-primary">Nuova Promozione</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[#a8a39e] text-xs uppercase tracking-wider mb-1.5 block">Titolo *</label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                placeholder="es. Sconto Pasqua 15%"
                className="w-full bg-[#0e0e0e] border border-[#2a2725] rounded-xl px-4 py-3 text-sm text-[#f0ece6] placeholder:text-[#5a5650] focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-[#a8a39e] text-xs uppercase tracking-wider mb-1.5 block">Sconto % *</label>
              <input type="number" min="1" max="100" step="0.5" value={form.discount_pct}
                onChange={e => setForm({...form, discount_pct: parseFloat(e.target.value)})}
                className="w-full bg-[#0e0e0e] border border-[#2a2725] rounded-xl px-4 py-3 text-sm text-[#f0ece6] focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-[#a8a39e] text-xs uppercase tracking-wider mb-1.5 block">Valida Dal</label>
              <input type="datetime-local" value={form.valid_from}
                onChange={e => setForm({...form, valid_from: e.target.value})}
                className="w-full bg-[#0e0e0e] border border-[#2a2725] rounded-xl px-4 py-3 text-sm text-[#f0ece6] focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-[#a8a39e] text-xs uppercase tracking-wider mb-1.5 block">Valida Fino Al</label>
              <input type="datetime-local" value={form.valid_to}
                onChange={e => setForm({...form, valid_to: e.target.value})}
                className="w-full bg-[#0e0e0e] border border-[#2a2725] rounded-xl px-4 py-3 text-sm text-[#f0ece6] focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[#a8a39e] text-xs uppercase tracking-wider mb-1.5 block">Descrizione</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                rows={2} placeholder="Descrizione opzionale..."
                className="w-full bg-[#0e0e0e] border border-[#2a2725] rounded-xl px-4 py-3 text-sm text-[#f0ece6] placeholder:text-[#5a5650] focus:outline-none focus:border-primary transition-colors resize-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="bg-primary text-[#0e0e0e] font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-primary-light transition-colors disabled:opacity-50">
              {saving ? 'Salvataggio...' : 'Salva'}
            </button>
            <button onClick={() => { setShowForm(false); setForm(empty()); }}
              className="border border-[#2a2725] text-[#9a9590] px-6 py-2.5 rounded-xl text-sm hover:border-[#3a3530] transition-colors">
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Active promos */}
      {loading ? (
        <div className="py-16 text-center text-[#5a5650]">Caricamento...</div>
      ) : promos.length === 0 ? (
        <div className="bg-[#161616] rounded-2xl border border-[#2a2725] p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Tag size={24} className="text-primary" />
          </div>
          <p className="text-[#f0ece6] font-heading text-lg mb-2">Nessuna promozione</p>
          <p className="text-[#5a5650] text-sm">Crea la tua prima promozione con il pulsante in alto.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[{ label: 'Attive', items: active, accent: 'border-green-500/20' }, { label: 'Scadute / Disattivate', items: expired, accent: 'border-[#2a2725]' }]
            .filter(g => g.items.length > 0)
            .map(group => (
            <div key={group.label}>
              <h3 className="text-[#7a7570] text-xs uppercase tracking-wider mb-3">{group.label}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {group.items.map(p => {
                  const isExpired = new Date(p.valid_to) <= now;
                  return (
                    <div key={p.id} className={`bg-[#161616] rounded-2xl border ${group.accent} p-5 flex gap-4 ${!p.is_active || isExpired ? 'opacity-60' : ''}`}>
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary font-heading text-lg font-bold">{p.discount_pct}%</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-[#f0ece6] font-medium text-sm">{p.title}</h4>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button onClick={() => toggleActive(p)} className="text-[#5a5650] hover:text-primary transition-colors">
                              {p.is_active ? <ToggleRight size={20} className="text-green-400" /> : <ToggleLeft size={20} />}
                            </button>
                            <button onClick={() => handleDelete(p.id)} className="text-[#5a5650] hover:text-red-400 transition-colors">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                        {p.description && <p className="text-[#7a7570] text-xs mt-1 line-clamp-2">{p.description}</p>}
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            isExpired ? 'bg-red-500/10 text-red-400' : p.is_active ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-[#5a5650]'
                          }`}>{isExpired ? 'Scaduta' : p.is_active ? 'Attiva' : 'Disattivata'}</span>
                          <span className="text-[#5a5650] text-[10px]">
                            {new Date(p.valid_from).toLocaleDateString('it-IT')} → {new Date(p.valid_to).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
