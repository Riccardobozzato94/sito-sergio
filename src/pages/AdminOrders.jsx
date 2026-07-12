import { useState, useEffect, useMemo } from 'react';
import { getOrders, updateOrderStatus } from '../lib/admin';
import {
  ShoppingCart, Check, X, Eye, EyeOff, AlertCircle,
  Search, Filter, Download, ArrowUpDown
} from 'lucide-react';

const STATUS_OPTIONS = ['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'];
const STATUS_LABELS = {
  pending: 'In attesa', paid: 'Pagato', preparing: 'In preparazione',
  ready: 'Pronto', completed: 'Completato', cancelled: 'Annullato',
};
const PAYMENT_STATUS_LABELS = {
  unpaid: 'Non pagato', paid: 'Pagato', refunded: 'Rimborsato',
};

const STATUS_FILTERS = [
  { value: 'all', label: 'Tutti' },
  { value: 'pending', label: 'In attesa' },
  { value: 'paid', label: 'Pagati' },
  { value: 'preparing', label: 'In prep.' },
  { value: 'ready', label: 'Pronti' },
  { value: 'completed', label: 'Completati' },
  { value: 'cancelled', label: 'Annullati' },
];

const STATUS_COLORS = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  paid: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  preparing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  ready: 'bg-green-500/10 text-green-400 border-green-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data || []);
    } catch (err) {
      setError('Errore caricamento ordini');
    } finally { setLoading(false); }
  }

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((o) =>
        (o.customer_name || '').toLowerCase().includes(q) ||
        (o.customer_email || '').toLowerCase().includes(q) ||
        (o.customer_phone || '').toLowerCase().includes(q) ||
        String(o.id).includes(q)
      );
    }

    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [orders, statusFilter, search, sortAsc]);

  const statusCounts = useMemo(() => {
    const counts = { all: orders.length };
    STATUS_OPTIONS.forEach((s) => { counts[s] = orders.filter((o) => o.status === s).length; });
    return counts;
  }, [orders]);

  async function handleStatusChange(id, newStatus) {
    try {
      await updateOrderStatus(id, newStatus);
      setSuccess(`Ordine #${id} → ${STATUS_LABELS[newStatus]}`);
      await loadOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  }

  function exportToCsv() {
    const headers = ['ID', 'Cliente', 'Email', 'Telefono', 'Totale', 'Stato', 'Pagamento', 'Data', 'Consegna'];
    const rows = filteredOrders.map((o) => [
      o.id,
      o.customer_name,
      o.customer_email,
      o.customer_phone || '',
      (o.total || 0).toFixed(2),
      STATUS_LABELS[o.status] || o.status,
      PAYMENT_STATUS_LABELS[o.payment_status] || o.payment_status,
      formatDate(o.created_at),
      o.delivery_method === 'pickup' ? 'Ritiro' : o.delivery_method === 'courier' ? 'Spedizione' : 'Prenotazione',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ordini-panificio-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    setSuccess('Esportazione completata!');
    setTimeout(() => setSuccess(''), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* ═══ Header ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-heading text-white tracking-tight">Ordini</h1>
          <p className="text-text-dim text-xs mt-1">
            {orders.length} totali
            {statusFilter !== 'all' && ` — ${filteredOrders.length} in questo filtro`}
          </p>
        </div>
        {orders.length > 0 && (
          <button
            onClick={exportToCsv}
            className="bg-[#201c17] border border-white/[0.04] text-text-dim hover:text-white px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:border-white/20 transition-all self-start sm:self-auto"
          >
            <Download size={16} />
            Esporta CSV
          </button>
        )}
      </div>

      {/* ═══ Notifications ═══ */}
      {success && (
        <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-2">
          <Check size={16} className="text-green-400" />
          <span className="text-green-400 text-sm">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* ═══ Search & Filters ═══ */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca per nome, email, telefono, #id..."
            className="w-full bg-[#201c17] border border-white/[0.04] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-text-dim/50 focus:outline-none focus:border-primary/30 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-dim hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort toggle */}
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className={`px-4 py-3 rounded-xl border text-sm flex items-center gap-2 transition-all ${
            sortAsc ? 'bg-primary/10 text-primary border-primary/30' : 'bg-[#201c17] text-text-dim border-white/[0.04] hover:border-white/20'
          }`}
          title={sortAsc ? 'Dal più vecchio' : 'Dal più recente'}
        >
          <ArrowUpDown size={16} />
          <span className="hidden sm:inline">{sortAsc ? 'Vecchi ↓' : 'Nuovi ↑'}</span>
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1.5 mb-6 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all shrink-0 ${
              statusFilter === f.value
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'bg-bg text-text-dim border-border hover:border-white/20 hover:text-white'
            }`}
          >
            {f.label} {statusCounts[f.value] > 0 && <span className="text-[10px] opacity-60">({statusCounts[f.value]})</span>}
          </button>
        ))}
      </div>

      {/* ═══ Orders List ═══ */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 text-text-dim">
          {search || statusFilter !== 'all' ? (
            <>
              <Search size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nessun ordine corrisponde ai filtri</p>
              <button
                onClick={() => { setSearch(''); setStatusFilter('all'); }}
                className="text-primary text-xs hover:underline mt-2"
              >
                Cancella filtri
              </button>
            </>
          ) : (
            <>
              <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nessun ordine ancora</p>
              <p className="text-text-dim text-xs mt-1">Gli ordini dei clienti appariranno qui</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isExpanded = expandedId === order.id;
            return (
              <div key={order.id} className="bg-[#201c17] border border-white/[0.04] rounded-xl overflow-hidden">
                {/* Header — clickable row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors text-left"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-primary font-heading text-sm font-bold shrink-0">#{order.id}</span>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{order.customer_name}</p>
                      <p className="text-text-dim text-xs">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border hidden sm:block ${STATUS_COLORS[order.payment_status === 'paid' ? 'paid' : 'pending']}`}>
                      {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status] || 'bg-white/5 text-text-dim border-white/10'}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                    <span className="text-primary font-bold text-sm tabular-nums">{parseFloat(order.total || 0).toFixed(2).replace('.', ',')}€</span>
                    {isExpanded ? <EyeOff size={15} className="text-text-dim" /> : <Eye size={15} className="text-text-dim" />}
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-white/[0.04] pt-3">
                    {/* Customer & Delivery */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-text-dim text-[10px] uppercase tracking-wider mb-1">Cliente</p>
                        <p className="text-white text-sm">{order.customer_name}</p>
                        <p className="text-text-dim text-xs">{order.customer_email}</p>
                        {order.customer_phone && (
                          <a href={`tel:${order.customer_phone}`} className="text-primary text-xs hover:underline">{order.customer_phone}</a>
                        )}
                      </div>
                      <div>
                        <p className="text-text-dim text-[10px] uppercase tracking-wider mb-1">Consegna</p>
                        <p className="text-white text-sm capitalize">
                          {order.delivery_method === 'pickup' ? '📍 Ritiro in negozio' :
                           order.delivery_method === 'courier' ? '📦 Spedizione' : '📅 Prenotazione'}
                        </p>
                        {order.pickup_time && <p className="text-text-dim text-xs">{order.pickup_time}</p>}
                        {order.notes && (
                          <div className="mt-2 bg-white/[0.03] rounded-lg p-2.5">
                            <p className="text-text-dim text-[10px] uppercase tracking-wider mb-0.5">Note cliente</p>
                            <p className="text-text-muted text-xs italic">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="mb-4">
                      <p className="text-text-dim text-[10px] uppercase tracking-wider mb-2">Prodotti</p>
                      <div className="bg-bg rounded-xl p-3 space-y-1">
                        {(Array.isArray(order.items) ? order.items : []).map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-sm py-1">
                            <span className="text-white">{item.name} <span className="text-text-dim">×{item.quantity}</span></span>
                            <span className="text-text-muted tabular-nums">{parseFloat(item.price || 0).toFixed(2).replace('.', ',')}€</span>
                          </div>
                        ))}
                        <div className="border-t border-white/[0.04] pt-2 mt-2 flex justify-between text-sm">
                          <span className="text-text-muted">Subtotale</span>
                          <span className="text-text-muted tabular-nums">{parseFloat(order.subtotal || 0).toFixed(2).replace('.', ',')}€</span>
                        </div>
                        {parseFloat(order.shipping || 0) > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-text-muted">Spedizione</span>
                            <span className="text-text-muted tabular-nums">{parseFloat(order.shipping).toFixed(2).replace('.', ',')}€</span>
                          </div>
                        )}
                        <div className="border-t border-white/[0.04] pt-2 mt-1 flex justify-between text-sm">
                          <span className="text-white font-bold">Totale</span>
                          <span className="text-primary font-bold tabular-nums">{parseFloat(order.total || 0).toFixed(2).replace('.', ',')}€</span>
                        </div>
                      </div>
                    </div>

                    {/* Status actions */}
                    <div>
                      <p className="text-text-dim text-[10px] uppercase tracking-wider mb-2">Aggiorna stato</p>
                      <div className="flex flex-wrap gap-1.5">
                        {STATUS_OPTIONS.map((s) => {
                          const isCurrent = order.status === s;
                          return (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(order.id, s)}
                              disabled={isCurrent}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                isCurrent
                                  ? `${STATUS_COLORS[s]} cursor-default`
                                  : 'bg-bg text-text-dim border-border hover:border-white/20 hover:text-white'
                              }`}
                            >
                              {STATUS_LABELS[s]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Payment info */}
                    {order.payment_intent_id && (
                      <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between">
                        <p className="text-text-dim text-[10px] uppercase tracking-wider">
                          Pagamento: <span className="text-text-muted normal-case">{order.payment_intent_id.slice(0, 20)}...</span>
                        </p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.payment_status === 'paid' ? 'paid' : 'pending']}`}>
                          {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
