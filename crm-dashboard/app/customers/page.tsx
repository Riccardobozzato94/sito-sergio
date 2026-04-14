'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase-client';
import { useToast } from '@/components/ToastProvider';
import CustomerForm from '@/components/CustomerForm';
import { importCustomersFromExcel, exportCustomersToExcel, downloadCustomerTemplate } from '@/lib/excel-utils';
import {
  Crown, Star, Search, Mail, Phone, Minus, Plus, Edit, Trash2,
  Upload, Download, FileSpreadsheet, ChevronDown, ChevronRight,
  MessageSquare, Send, X, CheckSquare, Square,
} from 'lucide-react';

// ═══════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════

interface Customer {
  id: number; name: string; phone: string | null; email: string | null;
  notes: string; loyalty_points: number; is_vip: boolean;
  total_orders: number; total_spent: number; created_at: string;
}

interface Order {
  id: number; status: string; delivery_method: string;
  total: number; created_at: string; notes: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'In attesa', confirmed: 'Confermato', preparing: 'In prep.',
  ready: 'Pronto', completed: 'Completato', cancelled: 'Annullato',
};
const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-400', confirmed: 'text-blue-400', preparing: 'text-orange-400',
  ready: 'text-green-400', completed: 'text-primary', cancelled: 'text-red-400',
};

// ═══════════════════════════════════════════════
// BULK WHATSAPP MODAL
// ═══════════════════════════════════════════════

function BulkWhatsAppModal({
  customers,
  onClose,
}: {
  customers: Customer[];
  onClose: () => void;
}) {
  const [message, setMessage] = useState(
    'Ciao {nome}! 👋\n\nAbbiamo una novità per te al Panificio Da Sergio.\nPassaci a trovare — ti aspettiamo!\n\nIl team di Panificio Da Sergio 🍞'
  );
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const preview = message.replace('{nome}', customers[0]?.name.split(' ')[0] ?? 'Cliente');

  const sendNext = () => {
    const idx = currentIndex === null ? 0 : currentIndex + 1;
    if (idx >= customers.length) { onClose(); return; }
    const c = customers[idx];
    const personalizedMsg = message.replace('{nome}', c.name.split(' ')[0]);
    const number = c.phone?.replace(/\D/g, '') ?? '';
    if (number) {
      window.open(
        `https://wa.me/${number.startsWith('39') ? '' : '39'}${number}?text=${encodeURIComponent(personalizedMsg)}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
    setCurrentIndex(idx);
  };

  const remaining = customers.length - (currentIndex === null ? 0 : currentIndex + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#161616] border border-[#2a2725] rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2a2725]">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-[#25d366]" />
            <h2 className="font-heading text-lg text-[#f0ece6]">
              Messaggio WhatsApp — {customers.length} client{customers.length === 1 ? 'e' : 'i'}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#5a5650] hover:text-[#f0ece6] p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Tip */}
          <p className="text-[#7a7570] text-xs bg-[#0e0e0e] border border-[#2a2725] rounded-xl p-3 leading-relaxed">
            Usa <code className="text-primary">{'{nome}'}</code> per inserire il nome del cliente automaticamente.
            Si aprirà WhatsApp per ogni cliente — uno alla volta.
          </p>

          {/* Message textarea */}
          <div>
            <label className="block text-[#a8a39e] text-xs uppercase tracking-wider mb-2">
              Messaggio
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={6}
              className="w-full bg-[#0e0e0e] border border-[#2a2725] rounded-xl px-4 py-3 text-sm text-[#f0ece6] placeholder:text-[#5a5650] focus:outline-none focus:border-primary transition-colors resize-none font-mono"
            />
          </div>

          {/* Preview */}
          <div>
            <label className="block text-[#a8a39e] text-xs uppercase tracking-wider mb-2">
              Anteprima (primo cliente)
            </label>
            <div className="bg-[#0e0e0e] border border-[#2a2725] rounded-xl px-4 py-3 text-sm text-[#f0ece6]/70 whitespace-pre-wrap leading-relaxed">
              {preview}
            </div>
          </div>

          {/* Customer list */}
          <div className="max-h-32 overflow-y-auto space-y-1">
            {customers.map((c, i) => (
              <div key={c.id} className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs transition-colors ${
                currentIndex !== null && i <= currentIndex
                  ? 'text-green-400 bg-green-500/5'
                  : 'text-[#7a7570]'
              }`}>
                {currentIndex !== null && i <= currentIndex
                  ? <CheckSquare size={12} />
                  : <Square size={12} />}
                {c.name}
                {!c.phone && <span className="text-red-400 ml-1">(nessun telefono)</span>}
              </div>
            ))}
          </div>

          {/* Progress + CTA */}
          <div className="flex items-center gap-3 pt-2 border-t border-[#2a2725]">
            <div className="flex-1">
              {currentIndex !== null && (
                <p className="text-[#7a7570] text-xs">
                  {currentIndex + 1} / {customers.length} inviati · {remaining} rimanenti
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#2a2725] text-[#a8a39e] text-sm hover:bg-white/5 transition-colors"
            >
              {currentIndex === null ? 'Annulla' : 'Chiudi'}
            </button>
            <button
              onClick={sendNext}
              disabled={remaining === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25d366] text-white font-bold text-sm hover:bg-[#20bd5a] transition-colors disabled:opacity-40"
            >
              <Send size={15} />
              {currentIndex === null
                ? `Inizia (${customers.filter(c => c.phone).length} con telefono)`
                : remaining > 0
                ? `Prossimo (${remaining})`
                : 'Completato'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// ORDER HISTORY ROW
// ═══════════════════════════════════════════════

function CustomerOrderHistory({ customerId }: { customerId: number }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase
      .from('orders')
      .select('id, status, delivery_method, total, created_at, notes')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setOrders(data ?? []);
        setLoading(false);
      });
  }, [customerId]);

  if (loading) {
    return <p className="text-[#5a5650] text-xs py-3 px-6 text-center">Caricamento ordini...</p>;
  }

  if (orders.length === 0) {
    return <p className="text-[#5a5650] text-xs py-3 px-6 text-center">Nessun ordine registrato</p>;
  }

  const deliveryLabel: Record<string, string> = {
    pickup: 'Ritiro', courier: 'Spedizione', reservation: 'Prenotazione',
  };

  return (
    <div className="px-6 pb-4">
      <div className="bg-[#0e0e0e] rounded-xl border border-[#2a2725]/50 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#2a2725]/50">
              <th className="px-4 py-2 text-left text-[#5a5650] font-medium">#</th>
              <th className="px-4 py-2 text-left text-[#5a5650] font-medium">Data</th>
              <th className="px-4 py-2 text-left text-[#5a5650] font-medium">Stato</th>
              <th className="px-4 py-2 text-left text-[#5a5650] font-medium">Metodo</th>
              <th className="px-4 py-2 text-right text-[#5a5650] font-medium">Totale</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b border-[#2a2725]/30 last:border-0">
                <td className="px-4 py-2 text-[#5a5650]">#{order.id}</td>
                <td className="px-4 py-2 text-[#9a9590]">
                  {new Date(order.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </td>
                <td className={`px-4 py-2 font-medium ${STATUS_COLORS[order.status] ?? 'text-[#9a9590]'}`}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </td>
                <td className="px-4 py-2 text-[#9a9590]">
                  {deliveryLabel[order.delivery_method] ?? order.delivery_method}
                </td>
                <td className="px-4 py-2 text-right text-primary font-bold">
                  {Number(order.total).toFixed(2).replace('.', ',')}€
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const { success, error: toastError } = useToast();

  async function fetchCustomers() {
    setLoading(true);
    const supabase = createBrowserClient();
    const { data } = await supabase.from('customers').select('*').order('total_spent', { ascending: false }).limit(500);
    setCustomers(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchCustomers(); }, []);

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormOpen(true);
  };

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`Eliminare il cliente "${customer.name}"?`)) return;
    const supabase = createBrowserClient();
    const { error } = await supabase.from('customers').delete().eq('id', customer.id);
    if (error) { toastError('Errore', error.message); return; }
    setCustomers(prev => prev.filter(c => c.id !== customer.id));
    setSelectedIds(prev => { const s = new Set(prev); s.delete(customer.id); return s; });
    success('Cliente eliminato', customer.name);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const result = await importCustomersFromExcel(file);
      if (result.success > 0) success('Import completato', `${result.success} clienti importati`);
      if (result.failed > 0) toastError('Errori import', `${result.failed} righe fallite`);
      fetchCustomers();
    } catch (err: any) {
      toastError('Errore import', err.message);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      await exportCustomersToExcel();
      success('Esportazione completata', 'File Excel scaricato');
    } catch (err: any) {
      toastError('Errore esportazione', err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleLoyaltyChange = async (customerId: number, delta: number) => {
    const supabase = createBrowserClient();
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    const newPoints = Math.max(0, customer.loyalty_points + delta);
    const { error } = await supabase.from('customers').update({ loyalty_points: newPoints }).eq('id', customerId);
    if (error) { toastError('Errore', error.message); return; }
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, loyalty_points: newPoints } : c));
    success('Punti aggiornati', `${customer.name}: ${newPoints} punti`);
  };

  const toggleRow = (id: number) => setExpandedId(prev => prev === id ? null : id);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(c => c.id)));
    }
  };

  const filtered = customers.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCustomers = filtered.filter(c => selectedIds.has(c.id));
  const vipCount = customers.filter(c => c.is_vip).length;
  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-2xl text-[#f0ece6]">Clienti</h1>
            <p className="text-[#7a7570] text-sm mt-1">{customers.length} registrati · {vipCount} VIP</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Bulk WhatsApp */}
            {selectedIds.size > 0 && (
              <button
                onClick={() => setBulkModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold hover:bg-[#20bd5a] transition-colors shadow-lg shadow-[#25d366]/20"
              >
                <MessageSquare size={16} />
                WhatsApp ({selectedIds.size})
              </button>
            )}
            {/* Import/Export */}
            <label className="flex items-center gap-2 px-3 py-2.5 bg-[#161616] border border-[#2a2725] rounded-xl text-sm text-[#a8a39e] hover:border-primary cursor-pointer transition-colors">
              <Upload size={16} />
              Importa Excel
              <input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} disabled={importing} className="hidden" />
            </label>
            <button
              onClick={handleExportExcel} disabled={exporting}
              className="flex items-center gap-2 px-3 py-2.5 bg-[#161616] border border-[#2a2725] rounded-xl text-sm text-[#a8a39e] hover:border-primary transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              Esporta
            </button>
            <button
              onClick={downloadCustomerTemplate}
              className="flex items-center gap-2 px-3 py-2.5 bg-[#161616] border border-[#2a2725] rounded-xl text-sm text-[#a8a39e] hover:border-primary transition-colors"
            >
              <FileSpreadsheet size={16} />
              Template
            </button>
            <button
              onClick={() => { setEditingCustomer(null); setFormOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-[#0e0e0e] rounded-xl text-sm font-bold hover:bg-primary-light transition-colors shadow-lg shadow-primary/20"
            >
              <Plus size={18} />
              Aggiungi
            </button>
          </div>
        </div>
        <div className="section-line mt-3" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Totale Clienti', value: customers.length.toString() },
          { label: 'Clienti VIP', value: vipCount.toString(), color: 'text-amber-400' },
          { label: 'Totale Speso', value: `${customers.reduce((s, c) => s + Number(c.total_spent), 0).toFixed(2).replace('.', ',')}€`, color: 'text-primary' },
        ].map((s, i) => (
          <div key={i} className="bg-[#161616] rounded-xl border border-[#2a2725] p-5">
            <p className="text-[#7a7570] text-xs uppercase tracking-wider">{s.label}</p>
            <p className={`font-heading text-2xl mt-1 ${s.color || 'text-[#f0ece6]'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + selection info */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a5650]" />
          <input
            type="text" placeholder="Cerca per nome, telefono, email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#161616] border border-[#2a2725] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f0ece6] placeholder:text-[#5a5650] focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        {selectedIds.size > 0 && (
          <p className="text-[#7a7570] text-sm">
            {selectedIds.size} selezionati
            <button onClick={() => setSelectedIds(new Set())} className="ml-2 text-primary hover:underline text-xs">
              Deseleziona
            </button>
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#161616] rounded-2xl border border-[#2a2725] overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-[#5a5650]">Caricamento...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#5a5650]">Nessun cliente trovato</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2725]">
                  {/* Select-all checkbox */}
                  <th className="px-4 py-4 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="text-[#5a5650] hover:text-primary transition-colors"
                      title={allSelected ? 'Deseleziona tutti' : 'Seleziona tutti'}
                    >
                      {allSelected ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                    </button>
                  </th>
                  <th className="w-8 py-4" />
                  {['Cliente', 'Contatti', 'Ordini', 'Speso', 'Punti', 'VIP', 'Azioni'].map(h => (
                    <th key={h} className={`px-4 py-4 text-[#7a7570] text-[10px] uppercase tracking-wider font-medium ${
                      h === 'Ordini' || h === 'Punti' || h === 'VIP' || h === 'Azioni' ? 'text-center' :
                      h === 'Speso' ? 'text-right' : 'text-left'
                    }`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(customer => (
                  <>
                    <tr
                      key={customer.id}
                      className={`border-b border-[#2a2725]/30 transition-colors ${
                        selectedIds.has(customer.id) ? 'bg-primary/5' : 'hover:bg-white/[0.015]'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleSelect(customer.id)}
                          className="text-[#5a5650] hover:text-primary transition-colors"
                        >
                          {selectedIds.has(customer.id)
                            ? <CheckSquare size={15} className="text-primary" />
                            : <Square size={15} />}
                        </button>
                      </td>

                      {/* Expand toggle */}
                      <td className="py-4 pr-2">
                        <button
                          onClick={() => toggleRow(customer.id)}
                          className="text-[#5a5650] hover:text-primary transition-colors"
                          title="Storico ordini"
                        >
                          {expandedId === customer.id
                            ? <ChevronDown size={15} />
                            : <ChevronRight size={15} />}
                        </button>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {customer.is_vip && <Crown size={14} className="text-amber-400 shrink-0" />}
                          <span className="text-[#f0ece6] font-medium">{customer.name}</span>
                        </div>
                        {customer.notes && <p className="text-[#5a5650] text-xs mt-0.5 max-w-[180px] truncate">{customer.notes}</p>}
                      </td>
                      <td className="px-4 py-4">
                        {customer.phone && (
                          <a href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                            className="text-[#9a9590] text-sm flex items-center gap-1.5 hover:text-[#25d366] transition-colors">
                            <Phone size={11} />{customer.phone}
                          </a>
                        )}
                        {customer.email && (
                          <a href={`mailto:${customer.email}`}
                            className="text-[#5a5650] text-xs flex items-center gap-1.5 hover:text-primary transition-colors mt-0.5">
                            <Mail size={11} />{customer.email}
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-[#f0ece6] font-medium">{customer.total_orders}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-primary font-bold text-sm">{Number(customer.total_spent).toFixed(2).replace('.', ',')}€</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => handleLoyaltyChange(customer.id, -10)}
                            className="w-6 h-6 rounded-md bg-white/5 border border-[#2a2725] flex items-center justify-center text-[#5a5650] hover:text-primary hover:border-primary transition-colors">
                            <Minus size={11} />
                          </button>
                          <div className="flex items-center gap-1 min-w-[60px] justify-center">
                            <Star size={11} className="text-amber-400 fill-amber-400" />
                            <span className="text-[#f0ece6] font-medium text-sm">{customer.loyalty_points}</span>
                          </div>
                          <button onClick={() => handleLoyaltyChange(customer.id, 10)}
                            className="w-6 h-6 rounded-md bg-white/5 border border-[#2a2725] flex items-center justify-center text-[#5a5650] hover:text-primary hover:border-primary transition-colors">
                            <Plus size={11} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {customer.is_vip
                          ? <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 uppercase tracking-wider">VIP</span>
                          : <span className="text-[#5a5650] text-xs">—</span>}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEdit(customer)}
                            className="p-1.5 rounded-lg text-[#5a5650] hover:text-primary hover:bg-primary/10 transition-colors"
                            aria-label="Modifica cliente">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(customer)}
                            className="p-1.5 rounded-lg text-[#5a5650] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            aria-label="Elimina cliente">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* ── Expanded order history ── */}
                    {expandedId === customer.id && (
                      <tr key={`history-${customer.id}`} className="bg-[#0e0e0e]/50 border-b border-[#2a2725]/30">
                        <td colSpan={10}>
                          <CustomerOrderHistory customerId={customer.id} />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Form Modal */}
      <CustomerForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        customer={editingCustomer}
        onSuccess={fetchCustomers}
      />

      {/* Bulk WhatsApp Modal */}
      {bulkModalOpen && (
        <BulkWhatsAppModal
          customers={selectedCustomers}
          onClose={() => setBulkModalOpen(false)}
        />
      )}
    </div>
  );
}
