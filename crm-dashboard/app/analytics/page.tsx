'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase-client';
import { TrendingUp, ShoppingCart, Euro, Users, CheckCircle, XCircle } from 'lucide-react';

interface DailyRow {
  date: string; total_orders: number; total_revenue: number;
  avg_order_value: number; new_customers: number;
  completed_orders: number; cancelled_orders: number;
}

function StatCard({ icon, label, value, sub, color = 'text-[#f0ece6]' }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="bg-[#161616] rounded-2xl border border-[#2a2725] p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
        <p className="text-[#7a7570] text-xs uppercase tracking-wider">{label}</p>
      </div>
      <p className={`font-heading text-2xl ${color}`}>{value}</p>
      {sub && <p className="text-[#5a5650] text-xs mt-1">{sub}</p>}
    </div>
  );
}

function MiniBarChart({ data }: { data: DailyRow[] }) {
  const max = Math.max(...data.map(d => Number(d.total_revenue)), 1);
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((d, i) => {
        const h = Math.max((Number(d.total_revenue) / max) * 100, 4);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className="w-full rounded-t bg-primary/40 group-hover:bg-primary transition-colors"
              style={{ height: `${h}%` }}
            />
            <span className="text-[#5a5650] text-[9px]">
              {new Date(d.date).toLocaleDateString('it-IT', { weekday: 'short' }).slice(0, 3)}
            </span>
            <div className="absolute bottom-full mb-1 hidden group-hover:block bg-[#0e0e0e] border border-[#2a2725] rounded px-2 py-1 text-[10px] text-[#f0ece6] whitespace-nowrap z-10">
              {Number(d.total_revenue).toFixed(2)}€ · {d.total_orders} ordini
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const [rows, setRows] = useState<DailyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = createBrowserClient();
      const from = new Date(Date.now() - Number(range) * 86400000).toISOString().split('T')[0];
      const { data } = await supabase
        .from('analytics_daily')
        .select('*')
        .gte('date', from)
        .order('date', { ascending: true });
      setRows(data || []);
      setLoading(false);
    }
    load();
  }, [range]);

  const totRevenue = rows.reduce((s, r) => s + Number(r.total_revenue), 0);
  const totOrders = rows.reduce((s, r) => s + r.total_orders, 0);
  const totCustomers = rows.reduce((s, r) => s + r.new_customers, 0);
  const totCompleted = rows.reduce((s, r) => s + r.completed_orders, 0);
  const totCancelled = rows.reduce((s, r) => s + r.cancelled_orders, 0);
  const avgOrder = totOrders > 0 ? totRevenue / totOrders : 0;

  const rangeBtns: { v: '7' | '30' | '90'; l: string }[] = [
    { v: '7', l: '7 giorni' }, { v: '30', l: '30 giorni' }, { v: '90', l: '90 giorni' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-[#f0ece6]">Analytics</h1>
          <p className="text-[#7a7570] text-sm mt-1">Statistiche e andamento vendite</p>
          <div className="section-line mt-3" />
        </div>
        <div className="flex gap-2">
          {rangeBtns.map(b => (
            <button
              key={b.v}
              onClick={() => setRange(b.v)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                range === b.v ? 'bg-primary/10 text-primary border-primary/30' : 'text-[#9a9590] border-[#2a2725] hover:border-[#3a3530]'
              }`}
            >{b.l}</button>
          ))}
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={<Euro size={16}/>} label="Ricavo Totale" value={`${totRevenue.toFixed(2).replace('.', ',')}€`} color="text-primary" />
        <StatCard icon={<ShoppingCart size={16}/>} label="Ordini Totali" value={totOrders.toString()} sub={`${totCompleted} completati`} />
        <StatCard icon={<TrendingUp size={16}/>} label="Scontrino Medio" value={`${avgOrder.toFixed(2).replace('.', ',')}€`} />
        <StatCard icon={<Users size={16}/>} label="Nuovi Clienti" value={totCustomers.toString()} />
        <StatCard icon={<CheckCircle size={16}/>} label="Completati" value={totCompleted.toString()} color="text-green-400" />
        <StatCard icon={<XCircle size={16}/>} label="Annullati" value={totCancelled.toString()} color="text-red-400" />
      </div>

      {/* Chart */}
      <div className="bg-[#161616] rounded-2xl border border-[#2a2725] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-lg text-primary">Ricavo Giornaliero</h3>
          <p className="text-[#5a5650] text-xs">{rows.length} giorni con dati</p>
        </div>
        {loading ? (
          <div className="h-24 flex items-center justify-center text-[#5a5650] text-sm">Caricamento...</div>
        ) : rows.length < 2 ? (
          <div className="h-24 flex items-center justify-center text-[#5a5650] text-sm">Dati insufficienti</div>
        ) : (
          <MiniBarChart data={rows} />
        )}
      </div>

      {/* Table */}
      <div className="bg-[#161616] rounded-2xl border border-[#2a2725] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2725]">
          <h3 className="text-[#a8a39e] text-xs uppercase tracking-wider">Dettaglio Giornaliero</h3>
        </div>
        {loading ? (
          <div className="py-16 text-center text-[#5a5650]">Caricamento...</div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-[#5a5650]">Nessun dato disponibile.<br/><span className="text-xs">I dati vengono generati automaticamente dagli ordini completati.</span></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2725]">
                  {['Data', 'Ordini', 'Ricavo', 'Scontrino Medio', 'Nuovi Clienti', 'Completati', 'Annullati'].map(h => (
                    <th key={h} className="px-5 py-3 text-[#7a7570] text-[10px] uppercase tracking-wider font-medium text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...rows].reverse().map(r => (
                  <tr key={r.date} className="border-b border-[#2a2725]/30 hover:bg-white/[0.015]">
                    <td className="px-5 py-3 text-[#f0ece6] text-sm font-medium">
                      {new Date(r.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-[#9a9590] text-sm">{r.total_orders}</td>
                    <td className="px-5 py-3 text-primary font-bold text-sm">{Number(r.total_revenue).toFixed(2).replace('.', ',')}€</td>
                    <td className="px-5 py-3 text-[#9a9590] text-sm">{Number(r.avg_order_value).toFixed(2).replace('.', ',')}€</td>
                    <td className="px-5 py-3 text-[#9a9590] text-sm">{r.new_customers}</td>
                    <td className="px-5 py-3 text-green-400 text-sm">{r.completed_orders}</td>
                    <td className="px-5 py-3 text-red-400 text-sm">{r.cancelled_orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
