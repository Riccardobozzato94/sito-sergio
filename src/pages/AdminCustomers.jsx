import { useState, useEffect, useMemo } from 'react';
import {
  getCustomers, createCustomer, updateCustomer, deleteCustomer,
  importCustomersCSV, getCustomerOrders,
} from '../lib/admin';
import {
  Users, Plus, Pencil, Trash2, X, Check, AlertCircle,
  Search, Download, Upload, MessageCircle, ShoppingCart,
  Star, FileText, Phone, Mail, ChevronDown, ChevronUp,
} from 'lucide-react';

const WHATSAPP_TEMPLATES = [
  {
    id: 'ordine-pronto',
    label: 'Ordine pronto',
    message: (name) =>
      `Ciao ${name}, il tuo ordine è pronto! 🥖\nPuoi passare a ritirarlo presso il Panificio Da Sergio.\n\nOrari: Lun-Sab 10:00-19:00, Dom 10:00-19:00\n\nGrazie e a presto!`,
  },
  {
    id: 'promozione',
    label: 'Promozione / Novità',
    message: (name) =>
      `Ciao ${name}!\n\nAbbiamo una novità per te al Panificio Da Sergio! 🥐\n\nVieni a scoprire le nostre nuove specialità.\n\nTi aspettiamo!`,
  },
  {
    id: 'auguri',
    label: 'Auguri / Festività',
    message: (name) =>
      `Ciao ${name},\n\nIl Panificio Da Sergio ti augura buone feste! 🎄\n\nGrazie per la tua fedeltà. Ti aspettiamo per condividere insieme la gioia delle nostre tradizioni.\n\nA presto!`,
  },
  {
    id: 'feedback',
    label: 'Richiesta feedback',
    message: (name) =>
      `Ciao ${name}, grazie per averci scelto! 🥖\n\nCi farebbe piacere sapere cosa ne pensi dei nostri prodotti. La tua opinione è importante per noi.\n\nGrazie!`,
  },
  {
    id: 'personalizzato',
    label: 'Messaggio personalizzato',
    message: (name) => `Ciao ${name},`,
  },
];

const emptyCustomer = {
  name: '',
  phone: '',
  email: '',
  notes: '',
  is_vip: false,
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatCurrency(amount) {
  return (parseFloat(amount || 0)).toFixed(2).replace('.', ',') + '€';
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(null); // customer id
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showWhatsappModal, setShowWhatsappModal] = useState(null); // customer
  const [customMessage, setCustomMessage] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyCustomer);
  const [saving, setSaving] = useState(false);

  // CSV state
  const [csvText, setCsvText] = useState('');
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvResult, setCsvResult] = useState(null);

  useEffect(() => { loadCustomers(); }, []);

  async function loadCustomers() {
    try {
      setError('');
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data || []);
    } catch (err) {
      setError('Errore caricamento clienti: ' + err.message);
      setTimeout(() => setError(''), 5000);
    } finally { setLoading(false); }
  }

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter((c) =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.notes || '').toLowerCase().includes(q)
    );
  }, [customers, search]);

  // ── Add / Edit ──

  function openAdd() {
    setForm(emptyCustomer);
    setEditingId(null);
    setShowAddModal(true);
  }

  function openEdit(customer) {
    setForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      notes: customer.notes || '',
      is_vip: customer.is_vip || false,
    });
    setEditingId(customer.id);
    setShowAddModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Il nome è obbligatorio'); setTimeout(() => setError(''), 3000); return; }
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateCustomer(editingId, form);
        setSuccess('Cliente aggiornato!');
      } else {
        await createCustomer(form);
        setSuccess('Cliente creato!');
      }
      setShowAddModal(false);
      setTimeout(() => setSuccess(''), 3000);
      await loadCustomers();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    } finally { setSaving(false); }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Eliminare definitivamente "${name}"?\nQuesta azione non può essere annullata.`)) return;
    try {
      await deleteCustomer(id);
      setSuccess(`Cliente "${name}" eliminato.`);
      setTimeout(() => setSuccess(''), 3000);
      await loadCustomers();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  }

  // ── CSV Import ──

  async function handleCsvImport() {
    if (!csvText.trim()) return;
    setCsvImporting(true);
    setCsvResult(null);
    try {
      const result = await importCustomersCSV(csvText);
      setCsvResult(result);
      if (result.imported > 0) {
        setSuccess(`Importati ${result.imported} clienti!`);
        setTimeout(() => setSuccess(''), 5000);
        await loadCustomers();
      }
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    } finally { setCsvImporting(false); }
  }

  // ── Orders ──

  async function loadOrders(customerId) {
    setOrdersLoading(true);
    setOrders([]);
    try {
      const data = await getCustomerOrders(customerId);
      setOrders(data || []);
    } catch (err) {
      setError('Errore caricamento ordini: ' + err.message);
    } finally { setOrdersLoading(false); }
  }

  function openOrders(customer) {
    setShowOrdersModal(customer);
    loadOrders(customer.id);
  }

  // ── WhatsApp ──

  function openWhatsapp(customer) {
    setShowWhatsappModal(customer);
    setCustomMessage('');
  }

  function sendWhatsapp(templateId) {
    const customer = showWhatsappModal;
    if (!customer || !customer.phone) return;
    const template = WHATSAPP_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    let msg = template.message(customer.name);
    if (templateId === 'personalizzato') {
      msg = msg + '\n\n' + customMessage;
    }
    const url = 'https://wa.me/' + customer.phone.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
  }

  function sendCustomWhatsapp() {
    if (!customMessage.trim()) return;
    const customer = showWhatsappModal;
    if (!customer || !customer.phone) return;
    const msg = 'Ciao ' + customer.name + ',\n\n' + customMessage;
    const url = 'https://wa.me/' + customer.phone.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
  }

  // ── Loading ──

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
          <h1 className="text-2xl font-heading text-white tracking-tight">Clienti</h1>
          <p className="text-text-dim text-xs mt-1">
            {customers.length} clienti registrati
            {search && ` — ${filteredCustomers.length} corrispondono`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setCsvText(''); setCsvResult(null); setShowCsvModal(true); }}
            className="bg-[#201c17] border border-white/[0.04] text-text-dim hover:text-white px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:border-white/20 transition-all"
          >
            <Upload size={16} />
            Importa CSV
          </button>
          <button
            onClick={openAdd}
            className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:bg-primary/90 transition-all"
          >
            <Plus size={16} />
            Nuovo cliente
          </button>
        </div>
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

      {/* ═══ Search ═══ */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca per nome, telefono, email..."
          className="w-full bg-[#201c17] border border-white/[0.04] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-text-dim/50 focus:outline-none focus:border-primary/30 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-dim hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {/* ═══ Customers List ═══ */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-16 text-text-dim">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          {search ? (
            <>
              <p className="text-sm">Nessun cliente corrisponde alla ricerca</p>
              <button onClick={() => setSearch('')} className="text-primary text-xs hover:underline mt-2">
                Cancella filtro
              </button>
            </>
          ) : (
            <>
              <p className="text-sm">Nessun cliente ancora</p>
              <p className="text-text-dim text-xs mt-1">Aggiungi il primo cliente</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCustomers.map((customer) => {
            const totalOrders = parseInt(customer.total_orders || 0);
            const totalSpent = parseFloat(customer.total_spent || 0);
            return (
              <div
                key={customer.id}
                className="bg-[#201c17] border border-white/[0.04] rounded-xl p-4 hover:border-white/10 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium truncate">{customer.name}</h3>
                      {customer.is_vip && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                          <Star size={10} className="inline mr-0.5" />VIP
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                      {customer.phone && (
                        <a href={`tel:${customer.phone}`} className="text-text-dim text-xs hover:text-primary flex items-center gap-1 transition-colors">
                          <Phone size={11} />
                          {customer.phone}
                        </a>
                      )}
                      {customer.email && (
                        <a href={`mailto:${customer.email}`} className="text-text-dim text-xs hover:text-primary flex items-center gap-1 transition-colors">
                          <Mail size={11} />
                          {customer.email}
                        </a>
                      )}
                    </div>
                    {customer.notes && (
                      <p className="text-text-dim text-xs mt-1.5 italic line-clamp-1">{customer.notes}</p>
                    )}
                    {totalOrders > 0 && (
                      <p className="text-text-dim text-[10px] mt-1.5">
                        {totalOrders} ordine{totalOrders !== 1 ? 'i' : ''}
                        {totalSpent > 0 && ` · ${formatCurrency(totalSpent)} spesi`}
                        <span className="ml-2 text-[10px]">Ultimo ordine: {customer.updated_at ? formatDate(customer.updated_at) : '-'}</span>
                      </p>
                    )}
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* WhatsApp */}
                    {customer.phone && (
                      <button
                        onClick={() => openWhatsapp(customer)}
                        title="Invia WhatsApp"
                        className="p-2 rounded-lg text-text-dim hover:text-green-400 hover:bg-green-500/10 transition-all"
                      >
                        <MessageCircle size={16} />
                      </button>
                    )}
                    {/* Orders */}
                    <button
                      onClick={() => openOrders(customer)}
                      title="Vedi ordini"
                      className="p-2 rounded-lg text-text-dim hover:text-primary hover:bg-primary/10 transition-all"
                    >
                      <ShoppingCart size={16} />
                      {totalOrders > 0 && (
                        <span className="text-[9px] font-bold ml-0.5">{totalOrders}</span>
                      )}
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => openEdit(customer)}
                      title="Modifica"
                      className="p-2 rounded-lg text-text-dim hover:text-white hover:bg-white/5 transition-all"
                    >
                      <Pencil size={15} />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(customer.id, customer.name)}
                      title="Elimina"
                      className="p-2 rounded-lg text-text-dim hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: Aggiungi / Modifica cliente
          ═══════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#1a1714] border border-white/[0.08] rounded-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-heading text-white">
                {editingId ? 'Modifica cliente' : 'Nuovo cliente'}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-text-dim hover:text-white p-1">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-text-dim text-xs mb-1.5">Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Mario Rossi"
                  required
                  className="w-full bg-bg border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-dim/40 focus:outline-none focus:border-primary/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-text-dim text-xs mb-1.5">Telefono</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+39 333 1234567"
                  className="w-full bg-bg border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-dim/40 focus:outline-none focus:border-primary/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-text-dim text-xs mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="mario@email.com"
                  className="w-full bg-bg border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-dim/40 focus:outline-none focus:border-primary/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-text-dim text-xs mb-1.5">Note</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  placeholder="Indirizzo, preferenze, allergie..."
                  className="w-full bg-bg border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-dim/40 focus:outline-none focus:border-primary/30 transition-colors resize-none"
                />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_vip}
                  onChange={(e) => setForm({ ...form, is_vip: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 bg-bg text-primary accent-primary"
                />
                <span className="text-sm text-white">Cliente VIP</span>
                <Star size={12} className="text-yellow-400" />
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-[#201c17] border border-white/[0.06] text-text-dim hover:text-white px-4 py-2.5 rounded-xl text-sm transition-all"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : editingId ? 'Salva modifiche' : 'Crea cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: Importa CSV
          ═══════════════════════════════════════════════════════ */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowCsvModal(false)}>
          <div className="bg-[#1a1714] border border-white/[0.08] rounded-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading text-white">Importa clienti da CSV</h2>
              <button onClick={() => setShowCsvModal(false)} className="text-text-dim hover:text-white p-1">
                <X size={18} />
              </button>
            </div>
            <div className="mb-4 bg-bg border border-white/[0.06] rounded-xl p-3">
              <p className="text-text-dim text-xs font-medium mb-1">Formato CSV:</p>
              <code className="text-[11px] text-text-muted block leading-relaxed">
                nome;telefono;email;note<br />
                Mario Rossi;+39 333 1234567;mario@email.com;cliente abituale<br />
                Anna Bianchi;+39 345 9876543;;preferisce dolci
              </code>
              <p className="text-text-dim text-[10px] mt-1.5">Separatore: punto e virgola. Telefono o email obbligatori.</p>
            </div>
            <textarea
              value={csvText}
              onChange={(e) => { setCsvText(e.target.value); setCsvResult(null); }}
              rows={8}
              placeholder="nome;telefono;email;note"
              className="w-full bg-bg border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-dim/40 focus:outline-none focus:border-primary/30 transition-colors resize-none font-mono"
            />
            {csvResult && (
              <div className="mt-3 bg-bg border border-white/[0.06] rounded-xl p-3 text-sm">
                <p className="text-green-400">{csvResult.imported} clienti importati</p>
                {csvResult.skipped > 0 && <p className="text-text-dim">{csvResult.skipped} saltati (già esistenti)</p>}
                {csvResult.errors.length > 0 && (
                  <div className="mt-1">
                    <p className="text-red-400 text-xs">{csvResult.errors.length} errori:</p>
                    {csvResult.errors.slice(0, 3).map((err, i) => (
                      <p key={i} className="text-red-400/70 text-[10px]">{err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowCsvModal(false)}
                className="flex-1 bg-[#201c17] border border-white/[0.06] text-text-dim hover:text-white px-4 py-2.5 rounded-xl text-sm transition-all"
              >
                Chiudi
              </button>
              <button
                onClick={handleCsvImport}
                disabled={!csvText.trim() || csvImporting}
                className="flex-1 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {csvImporting ? 'Importando...' : 'Importa CSV'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: Ordini del cliente
          ═══════════════════════════════════════════════════════ */}
      {showOrdersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowOrdersModal(null)}>
          <div className="bg-[#1a1714] border border-white/[0.08] rounded-2xl w-full max-w-xl max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-heading text-white">{showOrdersModal.name}</h2>
                <p className="text-text-dim text-xs">{orders.length} ordine{orders.length !== 1 ? 'i' : ''}</p>
              </div>
              <button onClick={() => setShowOrdersModal(null)} className="text-text-dim hover:text-white p-1">
                <X size={18} />
              </button>
            </div>
            {ordersLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10 text-text-dim">
                <ShoppingCart size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nessun ordine per questo cliente</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.map((order) => (
                  <div key={order.id} className="bg-bg border border-white/[0.04] rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-primary font-heading text-sm font-bold">#{order.id}</span>
                      <span className="text-white text-sm font-bold">{formatCurrency(order.total)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-dim">
                      <span>{formatDate(order.created_at)}</span>
                      <span className="opacity-30">·</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                        order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        order.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        order.status === 'ready' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        order.status === 'preparing' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>{order.status}</span>
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/[0.04] space-y-0.5">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-text-muted">{item.name} ×{item.quantity}</span>
                            <span className="text-text-dim">{formatCurrency(item.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: Invia WhatsApp
          ═══════════════════════════════════════════════════════ */}
      {showWhatsappModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowWhatsappModal(null)}>
          <div className="bg-[#1a1714] border border-white/[0.08] rounded-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-heading text-white">Invia WhatsApp</h2>
                <p className="text-text-dim text-xs mt-0.5">
                  A: {showWhatsappModal.name}
                  {showWhatsappModal.phone && <span className="ml-1">— {showWhatsappModal.phone}</span>}
                </p>
              </div>
              <button onClick={() => setShowWhatsappModal(null)} className="text-text-dim hover:text-white p-1">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2.5 mb-4">
              <p className="text-text-dim text-xs font-medium">Scegli un template:</p>
              {WHATSAPP_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => sendWhatsapp(tpl.id)}
                  className="w-full text-left bg-bg border border-white/[0.06] hover:border-primary/30 hover:bg-primary/5 rounded-xl p-3 transition-all"
                >
                  <p className="text-white text-sm font-medium">{tpl.label}</p>
                  <p className="text-text-dim text-[11px] mt-1 line-clamp-2">{tpl.message(showWhatsappModal.name)}</p>
                </button>
              ))}
            </div>
            {/* Custom message */}
            <div className="border-t border-white/[0.06] pt-4">
              <p className="text-text-dim text-xs font-medium mb-2">Oppure scrivi un messaggio personalizzato:</p>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                placeholder="Scrivi qui il tuo messaggio..."
                className="w-full bg-bg border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-dim/40 focus:outline-none focus:border-primary/30 transition-colors resize-none"
              />
              <button
                onClick={sendCustomWhatsapp}
                disabled={!customMessage.trim()}
                className="mt-2 w-full bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                Invia messaggio personalizzato
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
