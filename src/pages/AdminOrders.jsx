import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../lib/admin';
import { ShoppingCart, Check, X, Eye, EyeOff, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS = ['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'];
const STATUS_LABELS = {
  pending: 'In attesa', paid: 'Pagato', preparing: 'In preparazione',
  ready: 'Pronto', completed: 'Completato', cancelled: 'Annullato',
};
const PAYMENT_STATUS_LABELS = {
  unpaid: 'Non pagato', paid: 'Pagato', refunded: 'Rimborsato',
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

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data || []);
    } catch (err) {
      setError('Errore caricamento ordini');
    } finally {
      setLoading(false);
    }
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-heading text-white tracking-tight mb-6">Ordini</h1>

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

      {orders.length === 0 ? (
        <div className="text-center py-16 text-text-dim">
          <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
          <p>Nessun ordine ancora</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-[#201c17] border border-white/[0.04] rounded-xl overflow-hidden">
              {/* Header */}
              <button
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="text-primary font-heading text-sm font-bold">#{order.id}</span>
                  <div>
                    <p className="text-white text-sm font-medium">{order.customer_name}</p>
                    <p className="text-text-dim text-xs">{formatDate(order.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    order.payment_status === 'paid' ? 'bg-green-500/10 text-green-400' :
                    order.payment_status === 'refunded' ? 'bg-orange-500/10 text-orange-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    order.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                    order.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                    order.status === 'ready' ? 'bg-blue-500/10 text-blue-400' :
                    order.status === 'preparing' ? 'bg-purple-500/10 text-purple-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  <span className="text-primary font-bold text-sm">
                    {order.total?.toFixed(2).replace('.', ',')}€
                  </span>
                  {expandedId === order.id ? <EyeOff size={16} className="text-text-dim" /> : <Eye size={16} className="text-text-dim" />}
                </div>
              </button>

              {/* Expanded details */}
              {expandedId === order.id && (
                <div className="px-4 pb-4 border-t border-white/[0.04] pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-text-dim text-xs uppercase tracking-wider mb-1">Cliente</p>
                      <p className="text-white text-sm">{order.customer_name}</p>
                      <p className="text-text-dim text-sm">{order.customer_email}</p>
                      {order.customer_phone && <p className="text-text-dim text-sm">{order.customer_phone}</p>}
                    </div>
                    <div>
                      <p className="text-text-dim text-xs uppercase tracking-wider mb-1">Consegna</p>
                      <p className="text-white text-sm capitalize">{order.delivery_method === 'pickup' ? 'Ritiro in negozio' : order.delivery_method === 'courier' ? 'Spedizione' : 'Prenotazione'}</p>
                      {order.pickup_time && <p className="text-text-dim text-sm">{order.pickup_time}</p>}
                      {order.notes && <p className="text-text-dim text-sm mt-1 italic">Note: {order.notes}</p>}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mb-4">
                    <p className="text-text-dim text-xs uppercase tracking-wider mb-2">Prodotti</p>
                    <div className="space-y-1">
                      {(Array.isArray(order.items) ? order.items : []).map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm py-1">
                          <span className="text-white">{item.name} <span className="text-text-dim">×{item.quantity}</span></span>
                          <span className="text-text-muted">{item.price?.toFixed(2).replace('.', ',')}€</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-white/[0.04] pt-2 mt-2 flex justify-between text-sm">
                      <span className="text-text-muted">Totale</span>
                      <span className="text-primary font-bold">{order.total?.toFixed(2).replace('.', ',')}€</span>
                    </div>
                  </div>

                  {/* Status actions */}
                  <div>
                    <p className="text-text-dim text-xs uppercase tracking-wider mb-2">Aggiorna stato</p>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(order.id, s)}
                          disabled={order.status === s}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            order.status === s
                              ? 'bg-primary/10 text-primary border-primary/30 cursor-default'
                              : 'bg-bg text-text-dim border-border hover:border-white/20 hover:text-white'
                          }`}
                        >
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment info */}
                  {order.payment_intent_id && (
                    <div className="mt-3 pt-3 border-t border-white/[0.04]">
                      <p className="text-text-dim text-[10px] uppercase tracking-wider">Payment Intent: <span className="text-text-muted">{order.payment_intent_id}</span></p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
