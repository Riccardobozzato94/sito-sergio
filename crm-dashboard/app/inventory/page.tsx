'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase-client';
import { useToast } from '@/components/ToastProvider';
import { Search } from 'lucide-react';

interface InventoryRow {
  id: number; product_id: number; date: string;
  quantity_in_kg: number; quantity_sold_kg: number;
  wasted_kg: number; restocked_kg: number; notes: string;
  products: { name: string; low_stock_threshold_kg: number } | null;
}

export default function InventoryPage() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const { success, error: toastError } = useToast();

  async function load() {
    setLoading(true);
    const supabase = createBrowserClient();
    const { data } = await supabase
      .from('inventory')
      .select('*, products(name, low_stock_threshold_kg)')
      .eq('date', date)
      .order('id', { ascending: true });
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [date]);

  async function updateField(id: number, field: string, value: number) {
    const supabase = createBrowserClient();
    const { error } = await supabase.from('inventory').update({ [field]: value }).eq('id', id);
    if (error) { toastError('Errore', error.message); return; }
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    success('Aggiornato', '');
  }

  const filtered = rows.filter(r =>
    !search || r.products?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalSold = rows.reduce((s, r) => s + Number(r.quantity_sold_kg), 0);
  const totalWasted = rows.reduce((s, r) => s + Number(r.wasted_kg), 0);
  const totalIn = rows.reduce((s, r) => s + Number(r.quantity_in_kg), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-[#f0ece6]">Inventario</h1>
          <p className="text-[#7a7570] text-sm mt-1">Giacenza giornaliera per prodotto</p>
          <div className="section-line mt-3" />
        </div>
        <input
          type="date" value={date}
          onChange={e => setDate(e.target.value)}
          className="bg-[#161616] border border-[#2a2725] rounded-xl px-4 py-2.5 text-sm text-[#f0ece6] focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Prodotto (kg)', value: totalIn.toFixed(1) },
          { label: 'Venduto (kg)', value: totalSold.toFixed(1), color: 'text-green-400' },
          { label: 'Sprecato (kg)', value: totalWasted.toFixed(1), color: 'text-amber-400' },
        ].map((s, i) => (
          <div key={i} className="bg-[#161616] rounded-xl border border-[#2a2725] p-4">
            <p className="text-[#7a7570] text-xs uppercase tracking-wider">{s.label}</p>
            <p className={`font-heading text-2xl mt-1 ${s.color || 'text-[#f0ece6]'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a5650]" />
        <input
          type="text" placeholder="Cerca prodotto..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#161616] border border-[#2a2725] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f0ece6] placeholder:text-[#5a5650] focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="bg-[#161616] rounded-2xl border border-[#2a2725] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-[#5a5650]">Caricamento...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-[#5a5650]">
            Nessun dato per questa data.<br/>
            <span className="text-xs">I record vengono creati automaticamente quando vengono aggiunti prodotti all'inventario.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2725]">
                  {['Prodotto', 'Prodotto (kg)', 'Venduto (kg)', 'Sprecato (kg)', 'Ricaricato (kg)', 'Note'].map(h => (
                    <th key={h} className="px-5 py-4 text-[#7a7570] text-[10px] uppercase tracking-wider font-medium text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => {
                  const thr = row.products?.low_stock_threshold_kg || 0;
                  const remaining = Number(row.quantity_in_kg) + Number(row.restocked_kg) - Number(row.quantity_sold_kg) - Number(row.wasted_kg);
                  const isLow = remaining <= thr;
                  return (
                    <tr key={row.id} className="border-b border-[#2a2725]/30 hover:bg-white/[0.015]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {isLow && <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Scorta bassa" />}
                          <span className="text-[#f0ece6] font-medium text-sm">{row.products?.name || '—'}</span>
                        </div>
                        <p className="text-[#5a5650] text-xs mt-0.5">Rimanenza: {remaining.toFixed(1)} kg</p>
                      </td>
                      {(['quantity_in_kg', 'quantity_sold_kg', 'wasted_kg', 'restocked_kg'] as const).map(field => (
                        <td key={field} className="px-5 py-4">
                          <input
                            type="number" min="0" step="0.1"
                            defaultValue={Number(row[field]).toFixed(1)}
                            onBlur={e => {
                              const v = parseFloat(e.target.value);
                              if (!isNaN(v) && v !== Number(row[field])) updateField(row.id, field, v);
                            }}
                            className="w-20 bg-[#0e0e0e] border border-[#2a2725] rounded-lg px-2 py-1.5 text-sm text-[#f0ece6] focus:outline-none focus:border-primary transition-colors"
                          />
                        </td>
                      ))}
                      <td className="px-5 py-4">
                        <input
                          type="text"
                          defaultValue={row.notes}
                          onBlur={e => {
                            if (e.target.value !== row.notes) {
                              const supabase = createBrowserClient();
                              supabase.from('inventory').update({ notes: e.target.value }).eq('id', row.id);
                              setRows(prev => prev.map(r => r.id === row.id ? { ...r, notes: e.target.value } : r));
                            }
                          }}
                          className="w-32 bg-[#0e0e0e] border border-[#2a2725] rounded-lg px-2 py-1.5 text-xs text-[#9a9590] placeholder:text-[#5a5650] focus:outline-none focus:border-primary transition-colors"
                          placeholder="Note..."
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
