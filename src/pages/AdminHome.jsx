import { useState, useEffect } from 'react';
import { getProducts, getOrders } from '../lib/admin';
import {
  Package, ShoppingCart, TrendingUp, Clock, AlertCircle, CheckCircle,
  ArrowRight, DollarSign, Users, Eye
} from 'lucide-react';

export default function AdminHome({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [products, orders] = await Promise.all([getProducts(), getOrders()]);

      const orderCounts = {
        total: orders.length,
        pending: orders.filter((o) => o.status === 'pending').length,
        paid: orders.filter((o) => o.status === 'paid').length,
        preparing: orders.filter((o) => o.status === 'preparing').length,
        ready: orders.filter((o) => o.status === 'ready').length,
        completed: orders.filter((o) => o.status === 'completed').length,
        cancelled: orders.filter((o) => o.status === 'cancelled').length,
      };

      const totalRevenue = orders
        .filter((o) => o.payment_status === 'paid' || o.status === 'completed')
        .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

      const activeOrders = orderCounts.pending + orderCounts.preparing + orderCounts.ready;

      setStats({
        products: products.length,
        orders: orderCounts,
        totalRevenue,
        activeOrders,
        availableProducts: products.filter((p) => p.is_available).length,
        featuredProducts: products.filter((p) => p.is_featured).length,
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (err) {
      setError('Errore caricamento dati');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 max-w-md">
          <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-red-400 text-sm font-medium">Errore</p>
            <p className="text-red-300/70 text-xs mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statusColor = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    paid: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    preparing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    ready: 'bg-green-500/10 text-green-400 border-green-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div>
      {/* ═══ Header ═══ */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-heading text-white tracking-tight">Dashboard</h1>
        <p className="text-text-dim text-sm mt-1">Benvenuto nella panificazione digitale. 👨‍🍳</p>
      </div>

      {/* ═══ Stats Grid ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard
          icon={<Package size={20} />}
          label="Prodotti"
          value={stats.products}
          sub={`${stats.availableProducts} disponibili`}
          color="primary"
          onClick={() => onNavigate?.('products')}
        />
        <StatCard
          icon={<ShoppingCart size={20} />}
          label="Ordini"
          value={stats.orders.total}
          sub={`${stats.activeOrders} attivi`}
          color="blue"
          onClick={() => onNavigate?.('orders')}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="In preparazione"
          value={stats.orders.preparing}
          sub={`${stats.orders.ready} pronti da ritirare`}
          color="purple"
          onClick={() => onNavigate?.('orders')}
        />
        <StatCard
          icon={<DollarSign size={20} />}
          label="Fatturato"
          value={`${stats.totalRevenue.toFixed(0).replace('.', ',')}€`}
          sub="Ordini pagati"
          color="green"
        />
      </div>

      {/* ═══ Orders by Status + Recent ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution */}
        <div className="bg-[#201c17] border border-white/[0.04] rounded-2xl p-5">
          <h2 className="text-white font-heading text-sm uppercase tracking-wider mb-4">Stato Ordini</h2>
          <div className="space-y-2">
            {[
              { key: 'pending', label: 'In attesa', count: stats.orders.pending },
              { key: 'paid', label: 'Pagati', count: stats.orders.paid },
              { key: 'preparing', label: 'In preparazione', count: stats.orders.preparing },
              { key: 'ready', label: 'Pronti', count: stats.orders.ready },
              { key: 'completed', label: 'Completati', count: stats.orders.completed },
              { key: 'cancelled', label: 'Annullati', count: stats.orders.cancelled },
            ].map((s) => {
              const pct = stats.orders.total > 0 ? Math.round((s.count / stats.orders.total) * 100) : 0;
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${s.count > 0 ? 'bg-primary' : 'bg-white/10'}`} />
                  <span className="text-text-dim text-xs flex-1">{s.label}</span>
                  <span className="text-white text-sm font-bold tabular-nums">{s.count}</span>
                  <div className="w-16 sm:w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-text-dim text-[10px] w-8 text-right tabular-nums">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-[#201c17] border border-white/[0.04] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-heading text-sm uppercase tracking-wider">Ordini Recenti</h2>
            <button
              onClick={() => onNavigate?.('orders')}
              className="text-primary text-xs hover:underline flex items-center gap-1"
            >
              Tutti <ArrowRight size={12} />
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart size={28} className="mx-auto mb-2 text-text-dim/30" />
              <p className="text-text-dim text-xs">Nessun ordine ancora</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-primary font-heading text-xs font-bold shrink-0">#{o.id}</span>
                    <span className="text-white text-sm truncate">{o.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor[o.status] || 'bg-white/5 text-text-dim border-white/10'}`}>
                      {o.status === 'pending' ? 'In attesa' :
                       o.status === 'paid' ? 'Pagato' :
                       o.status === 'preparing' ? 'Prep.' :
                       o.status === 'ready' ? 'Pronto' :
                       o.status === 'completed' ? 'Compl.' :
                       o.status === 'cancelled' ? 'Annullato' : o.status}
                    </span>
                    <span className="text-primary text-xs font-bold tabular-nums">
                      {parseFloat(o.total || 0).toFixed(2).replace('.', ',')}€
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ Quick Actions ═══ */}
      <div className="bg-[#201c17] border border-white/[0.04] rounded-2xl p-5">
        <h2 className="text-white font-heading text-sm uppercase tracking-wider mb-4">Azioni Rapide</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction
            icon={<Package size={18} />}
            label="Aggiungi prodotto"
            onClick={() => onNavigate?.('products')}
          />
          <QuickAction
            icon={<Eye size={18} />}
            label="Vedi sito"
            href="#/"
          />
          <QuickAction
            icon={<Clock size={18} />}
            label="Ordini in attesa"
            onClick={() => onNavigate?.('orders')}
            badge={stats.orders.pending}
          />
          <QuickAction
            icon={<FileTextIcon size={18} />}
            label="Modifica testi"
            onClick={() => onNavigate?.('content')}
          />
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ──
function StatCard({ icon, label, value, sub, color = 'primary', onClick }) {
  const colors = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
  };

  return (
    <button
      onClick={onClick}
      className={`bg-[#201c17] border border-white/[0.04] rounded-2xl p-4 sm:p-5 text-left transition-all duration-200 ${
        onClick ? 'hover:border-white/20 hover:bg-[#24201b] cursor-pointer' : ''
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color] || colors.primary}`}>
        {icon}
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight tabular-nums">{value}</p>
      <p className="text-text-dim text-xs mt-1">{label}</p>
      {sub && <p className="text-text-muted text-[10px] mt-0.5">{sub}</p>}
    </button>
  );
}

// ── Quick Action ──
function QuickAction({ icon, label, onClick, href, badge }) {
  const className = `flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-white/[0.04] bg-bg text-text-dim hover:text-white hover:border-white/20 hover:bg-white/[0.02] transition-all duration-200 relative ${onClick ? 'cursor-pointer' : ''}`;

  if (href) {
    return (
      <a href={href} className={className}>
        {badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{badge}</span>
        )}
        {icon}
        <span className="text-xs text-center">{label}</span>
      </a>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{badge}</span>
      )}
      {icon}
      <span className="text-xs text-center">{label}</span>
    </button>
  );
}

// Inline FileText icon (not in lucide)
function FileTextIcon({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
