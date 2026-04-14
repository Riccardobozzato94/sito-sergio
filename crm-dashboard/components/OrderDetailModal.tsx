'use client';

import { X, MessageCircle, Printer } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useToast } from './ToastProvider';

const statusLabels: Record<string, string> = {
  pending: 'In Attesa',
  confirmed: 'Confermato',
  preparing: 'In Preparazione',
  ready: 'Pronto',
  completed: 'Completato',
  cancelled: 'Annullato',
};

const deliveryLabels: Record<string, string> = {
  pickup: 'Ritiro in negozio',
  courier: 'Spedizione corriere',
  reservation: 'Prenotazione',
};

interface Order {
  id: number;
  status: string;
  delivery_method: string;
  subtotal: number;
  shipping: number;
  total: number;
  pickup_time: string | null;
  notes: string | null;
  whatsapp_sent: boolean;
  created_at: string;
  customers: { name: string | null; phone: string | null } | null;
  order_items?: { quantity: number; unit_price: number; subtotal: number; products: { name: string } | null }[] | null;
}

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: number, status: string) => void;
}

export default function OrderDetailModal({ order, onClose, onStatusChange }: OrderDetailModalProps) {
  const { success, error } = useToast();

  const handleStatusChange = async (newStatus: string) => {
    try {
      await onStatusChange(order.id, newStatus);
      success('Stato aggiornato', `Ordine #${order.id} → ${statusLabels[newStatus]}`);
    } catch {
      error('Errore', 'Impossibile aggiornare lo stato');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const phone = order.customers?.phone?.replace(/[^0-9+]/g, '');
    if (!phone) {
      error('Telefono mancante', 'Il cliente non ha un numero di telefono');
      return;
    }

    const messages: Record<string, string> = {
      confirmed: `✅ Buongiorno ${order.customers?.name}!\n\nIl suo ordine #${order.id} dal Panificio Da Sergio è stato *confermato*.\n\n📦 Importo: ${order.total.toFixed(2).replace('.', ',')}€\n${order.pickup_time ? `🕐 Ritiro: ${order.pickup_time}\n` : ''}\nLa aspettiamo! 🍞`,
      ready: `🍞 Buongiorno ${order.customers?.name}!\n\nIl suo ordine #${order.id} è *pronto* per il ritiro!\n\n📍 Calle Ponte Caneva 626, Chioggia\n💰 Totale: ${order.total.toFixed(2).replace('.', ',')}€\n\nA presto!`,
    };

    const msg = messages[order.status] || `Buongiorno ${order.customers?.name}!\n\nRiguardo il suo ordine #${order.id} dal Panificio Da Sergio.\n\nTotale: ${order.total.toFixed(2).replace('.', ',')}€\n\nCi contatti per qualsiasi necessità.`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    success('WhatsApp aperto', `Messaggio pronto per ${order.customers?.name}`);
  };

  const printDate = new Date(order.created_at).toLocaleDateString('it-IT', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <>
      {/* ═══ Print styles ═══ */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #order-print-view { display: block !important; }
          #order-print-view {
            position: fixed;
            inset: 0;
            background: white;
            color: #111;
            font-family: 'Georgia', serif;
            padding: 2cm;
            font-size: 12pt;
          }
        }
      `}</style>

      {/* ═══ Hidden print view — shown only by @media print ═══ */}
      <div id="order-print-view" style={{ display: 'none' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid #111', paddingBottom: '12px', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22pt', margin: 0 }}>Panificio Da Sergio</h1>
          <p style={{ margin: '4px 0 0', fontSize: '10pt', color: '#555' }}>Calle Ponte Caneva 626 — Chioggia (VE) · P.IVA 12345678901</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14pt' }}>Ordine #{order.id}</p>
            <p style={{ margin: '4px 0 0', fontSize: '10pt', color: '#555' }}>{printDate}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0 }}>Stato: <strong>{statusLabels[order.status] || order.status}</strong></p>
            <p style={{ margin: '4px 0 0', fontSize: '10pt' }}>{deliveryLabels[order.delivery_method] || order.delivery_method}</p>
            {order.pickup_time && <p style={{ margin: '2px 0 0', fontSize: '10pt', color: '#555' }}>Ritiro: {order.pickup_time}</p>}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Cliente</p>
          <p style={{ margin: '4px 0 0' }}>{order.customers?.name || 'Anonimo'}</p>
          {order.customers?.phone && <p style={{ margin: '2px 0 0', color: '#555' }}>{order.customers.phone}</p>}
        </div>

        {order.order_items && order.order_items.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #111' }}>
                <th style={{ textAlign: 'left', padding: '6px 4px', fontSize: '10pt' }}>Prodotto</th>
                <th style={{ textAlign: 'center', padding: '6px 4px', fontSize: '10pt' }}>Q.tà</th>
                <th style={{ textAlign: 'right', padding: '6px 4px', fontSize: '10pt' }}>Prezzo</th>
                <th style={{ textAlign: 'right', padding: '6px 4px', fontSize: '10pt' }}>Subtotale</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '6px 4px' }}>{item.products?.name || 'Prodotto'}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right' }}>{Number(item.unit_price).toFixed(2).replace('.', ',')}€</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 'bold' }}>{Number(item.subtotal).toFixed(2).replace('.', ',')}€</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ borderTop: '2px solid #111', paddingTop: '12px', maxWidth: '260px', marginLeft: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Subtotale</span>
            <span>{Number(order.subtotal).toFixed(2).replace('.', ',')}€</span>
          </div>
          {order.shipping > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Spedizione</span>
              <span>{Number(order.shipping).toFixed(2).replace('.', ',')}€</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14pt', borderTop: '1px solid #111', paddingTop: '8px', marginTop: '4px' }}>
            <span>Totale</span>
            <span>{Number(order.total).toFixed(2).replace('.', ',')}€</span>
          </div>
        </div>

        {order.notes && (
          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '10pt' }}>Note</p>
            <p style={{ margin: '6px 0 0', fontSize: '10pt' }}>{order.notes}</p>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '9pt', color: '#888' }}>
          Grazie per aver scelto il Panificio Da Sergio · panificiodagio.it
        </p>
      </div>

    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-[#161616] border border-[#2a2725] rounded-2xl shadow-2xl shadow-black/50 animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2725]">
          <div>
            <h2 className="font-heading text-xl text-primary">Ordine #{order.id}</h2>
            <p className="text-[#7a7570] text-xs mt-0.5">
              {new Date(order.created_at).toLocaleDateString('it-IT', {
                day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrint}
              title="Stampa / Salva PDF"
              className="text-[#5a5650] hover:text-[#f0ece6] transition-colors p-1.5 rounded-lg hover:bg-white/5"
            >
              <Printer size={18} />
            </button>
            <button onClick={onClose} className="text-[#5a5650] hover:text-[#f0ece6] transition-colors p-1 rounded-lg hover:bg-white/5">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer */}
          <div>
            <h3 className="text-[#7a7570] text-xs uppercase tracking-wider mb-2">Cliente</h3>
            <p className="text-[#f0ece6] font-medium">{order.customers?.name || 'Anonimo'}</p>
            {order.customers?.phone && <p className="text-[#a8a39e] text-sm">{order.customers.phone}</p>}
          </div>

          {/* Status */}
          <div>
            <h3 className="text-[#7a7570] text-xs uppercase tracking-wider mb-2">Stato</h3>
            <StatusBadge status={order.status} onChange={handleStatusChange} clickable />
          </div>

          {/* Delivery */}
          <div>
            <h3 className="text-[#7a7570] text-xs uppercase tracking-wider mb-2">Consegna</h3>
            <p className="text-[#f0ece6] text-sm">{deliveryLabels[order.delivery_method] || order.delivery_method}</p>
            {order.pickup_time && <p className="text-[#a8a39e] text-sm mt-0.5">{order.pickup_time}</p>}
          </div>

          {/* Products */}
          {order.order_items && order.order_items.length > 0 && (
            <div>
              <h3 className="text-[#7a7570] text-xs uppercase tracking-wider mb-2">Prodotti</h3>
              <div className="space-y-2">
                {order.order_items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-[#2a2725]/30 last:border-0">
                    <span className="text-[#f0ece6]">{item.products?.name || 'Prodotto'}</span>
                    <span className="text-[#a8a39e] text-xs">× {item.quantity}</span>
                    <span className="text-primary font-medium">{Number(item.subtotal).toFixed(2).replace('.', ',')}€</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div>
              <h3 className="text-[#7a7570] text-xs uppercase tracking-wider mb-2">Note</h3>
              <p className="text-[#a8a39e] text-sm bg-[#0e0e0e] rounded-xl p-3 border border-[#2a2725]">{order.notes}</p>
            </div>
          )}

          {/* Total */}
          <div className="pt-4 border-t border-[#2a2725] space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-[#a8a39e]">Subtotale</span>
              <span className="text-[#f0ece6]">{Number(order.subtotal).toFixed(2).replace('.', ',')}€</span>
            </div>
            {order.shipping > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#a8a39e]">Spedizione</span>
                <span className="text-[#f0ece6]">{Number(order.shipping).toFixed(2).replace('.', ',')}€</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-heading pt-2 border-t border-[#2a2725]/50">
              <span className="text-[#f0ece6]">Totale</span>
              <span className="text-primary font-bold">{Number(order.total).toFixed(2).replace('.', ',')}€</span>
            </div>
          </div>

          {/* WhatsApp */}
          <button
            onClick={handleSendWhatsApp}
            className="w-full bg-[#25d366]/10 border border-[#25d366]/20 text-[#25d366] font-medium py-3 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-[#25d366]/20 transition-all"
          >
            <MessageCircle size={16} />
            Invia WhatsApp al cliente
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
