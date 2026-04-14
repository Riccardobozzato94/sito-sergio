'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase-client';
import StatusBadge from '@/components/StatusBadge';
import OrderDetailModal from '@/components/OrderDetailModal';
import { useToast } from '@/components/ToastProvider';
import { Search } from 'lucide-react';

const statusLabels: Record<string, string> = {
  pending: 'In Attesa', confirmed: 'Confermato', preparing: 'In Preparazione',
  ready: 'Pronto', completed: 'Completato', cancelled: 'Annullato',
};
const deliveryLabels: Record<string, string> = { pickup: 'Ritiro', courier: 'Spedizione', reservation: 'Prenotazione' };

interface Order {
  id: number; status: string; delivery_method: string; subtotal: number;
  shipping: number; total: number; pickup_time: string | null; notes: string | null;
  whatsapp_sent: boolean; created_at: string;
  customers: { name: string | null; phone: string | null } | null;
  order_items?: { quantity: number; unit_price: number; subtotal: number; products: { name: string } | null }[] | null;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { success, error: toastError } = useToast();

  async function fetchOrders() {
    setLoading(true);
    const supabase = createBrowserClient();
    let q = supabase.from('orders').select('*, customers(name, phone), order_items(quantity, unit_price, subtotal, products(name))').order('created_at', { ascending: false }).limit(500);
    if (statusFilter !== 'all') q = q.eq('status', statusFilter);
    const { data } = await q;
    setOrders(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    const supabase = createBrowserClient();
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) { toastError('Errore', error.message); return; }
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const filtered = orders.filter(o =>
    !search ||
    o.id.toString().includes(search) ||
    o.customers?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.customers?.phone?.includes(search)
  );

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-[#f0ece6]">Ordini</h1>
          <p className="text-[#7a7570] text-sm mt-1">{counts.all} ordini totali</p>
          <div className="section-line mt-3" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a5650]" />
          <input
            type="text" placeholder="Cerca ordine, cliente..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#161616] border border-[#2a2725] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f0ece6] placeholder:text-[#5a5650] focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        {/* Status pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Tutti' }, { key: 'pending', label: 'In Attesa' },
            { key: 'confirmed', label: 'Confermati' }, { key: 'preparing', label: 'In Prep.' },
            { key: 'ready', label: 'Pronti' }, { key: 'completed', label: 'Completati' },
            { key: 'cancelled', label: 'Annullati' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                statusFilter === f.key
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-transparent text-[#9a9590] border-[#2a2725] hover:border-[#3a3530]'
              }`}
            >
              {f.label} {counts[f.key as keyof typeof counts] > 0 && `(${counts[f.key as keyof typeof counts]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#161616] rounded-2xl border border-[#2a2725] overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-[#5a5650]">Caricamento...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#5a5650]">Nessun ordine trovato</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2725]">
                  {['Ordine', 'Cliente', 'Stato', 'Tipo', 'Totale', 'Data'].map(h => (
                    <th key={h} className={`px-6 py-4 text-[#7a7570] text-[10px] uppercase tracking-wider font-medium ${
                      h === 'Totale' || h === 'Data' ? 'text-right' : 'text-left'
                    }`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="border-b border-[#2a2725]/30 hover:bg-white/[0.015] transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <span className="text-[#f0ece6] font-medium">#{order.id}</span>
                      {order.notes && <p className="text-[#5a5650] text-xs mt-0.5 max-w-[180px] truncate">{order.notes}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[#f0ece6] text-sm">{order.customers?.name || '—'}</p>
                      {order.customers?.phone && <p className="text-[#5a5650] text-xs">{order.customers.phone}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[#9a9590] text-sm">{deliveryLabels[order.delivery_method] || order.delivery_method}</p>
                      {order.pickup_time && <p className="text-[#5a5650] text-xs">{order.pickup_time}</p>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-primary font-bold text-sm">{Number(order.total).toFixed(2).replace('.', ',')}€</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-[#7a7570] text-xs">
                        {new Date(order.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
