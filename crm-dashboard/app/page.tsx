import { createAdminClient } from '@/lib/supabase';
import { Package, Euro, Users, Clock, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

async function getDashboardData() {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0];

  // Lancia TUTTE le query in parallelo (Promise.all) invece che in sequenza
  const [
    todayOrdersRes,
    revenueDataRes,
    yRevRes,
    pendingRes,
    customersRes,
    lowStockRes,
    weeklyRes,
    recentOrdersRes,
    recentItemsRes,
  ] = await Promise.all([
    supabase.from('orders')
      .select('id, status, total, created_at')
      .gte('created_at', `${today}T00:00:00`)
      .order('created_at', { ascending: false }),
    supabase.from('orders')
      .select('total')
      .eq('status', 'completed')
      .gte('created_at', `${today}T00:00:00`),
    supabase.from('orders')
      .select('total')
      .eq('status', 'completed')
      .gte('created_at', `${yesterday}T00:00:00`)
      .lt('created_at', `${today}T00:00:00`),
    supabase.from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase.from('customers')
      .select('*', { count: 'exact', head: true }),
    supabase.from('products')
      .select('name, stock_weight_kg, low_stock_threshold_kg')
      .eq('is_available', true)
      .limit(5),
    supabase.from('analytics_daily')
      .select('date, total_revenue, total_orders')
      .gte('date', weekAgo)
      .order('date', { ascending: true }),
    supabase.from('orders')
      .select('*, customers(name, phone)')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('orders')
      .select('order_items(quantity, products(name))')
      .gte('created_at', weekAgo)
      .neq('status', 'cancelled'),
  ]);

  // Estrai i dati con fallback, logga eventuali errori in console
  const todayOrders = todayOrdersRes.data || [];
  const revenueData = revenueDataRes.data || [];
  const yRev = yRevRes.data || [];
  const pendingCount = pendingRes.count || 0;
  const totalCustomers = customersRes.count || 0;
  const lowStock = lowStockRes.data || [];
  const weeklyData = weeklyRes.data || [];
  const recentOrders = recentOrdersRes.data || [];
  const recentOrderItems = recentItemsRes.data || [];

  // Logga errori (non blocchiamo la dashboard, ma diamo visibilità)
  const errors = [
    todayOrdersRes.error, revenueDataRes.error, yRevRes.error,
    pendingRes.error, customersRes.error, lowStockRes.error,
    weeklyRes.error, recentOrdersRes.error, recentItemsRes.error,
  ].filter(Boolean);
  if (errors.length > 0) {
    console.warn('[Dashboard] Errori nel caricamento dati:', errors);
  }

  // Filtra scorte basse: usa la soglia PER OGNI prodotto invece di 5kg fisso
  const lowStockFiltered = lowStock.filter((p: any) =>
    p.stock_weight_kg !== null && p.stock_weight_kg <= (p.low_stock_threshold_kg || 1.0)
  ).slice(0, 5);

  // Calcola ricavi
  const todayRevenue = revenueData.reduce((s: number, o: any) => s + Number(o.total), 0);
  const yesterdayRevenue = yRev.reduce((s: number, o: any) => s + Number(o.total), 0);

  // Top products
  const productCount: Record<string, number> = {};
  recentOrderItems?.forEach((order: any) => {
    order.order_items?.forEach((item: any) => {
      const name = item.products?.name || 'Sconosciuto';
      productCount[name] = (productCount[name] || 0) + Number(item.quantity);
    });
  });
  const topProducts = Object.entries(productCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return {
    todayOrders,
    todayRevenue,
    yesterdayRevenue,
    pendingCount,
    totalCustomers,
    lowStock: lowStockFiltered,
    weeklyData,
    recentOrders,
    topProducts,
  };
}

function StatCard({ icon, label, value, trend, subtext }: {
  icon: React.ReactNode; label: string; value: string;
  trend?: { value: number; positive: boolean }; subtext?: string;
}) {
  return (
    <div className="bg-[#161616] rounded-2xl border border-[#2a2725] p-6 group hover:border-primary/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend.value).toFixed(0)}%
          </div>
        )}
      </div>
      <p className="text-[#a8a39e] text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="font-heading text-2xl text-[#f0ece6]">{value}</p>
      {subtext && <p className="text-[#5a5650] text-xs mt-1">{subtext}</p>}
    </div>
  );
}

function MiniChart({ data }: { data: { date: string; total_revenue: number }[] }) {
  if (data.length < 2) return (
    <div className="flex items-center justify-center h-32 text-[#5a5650] text-sm">
      Dati insufficienti per il grafico
    </div>
  );

  const maxVal = Math.max(...data.map(d => Number(d.total_revenue)), 1);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (Number(d.total_revenue) / maxVal) * 80;
    return `${x},${y}`;
  }).join(' ');

  const totalRev = data.reduce((s, d) => s + Number(d.total_revenue), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg text-primary">Andamento Settimanale</h3>
        <p className="text-primary font-heading text-lg">{totalRev.toFixed(2).replace('.', ',')}€</p>
      </div>
      <svg viewBox="0 0 100 100" className="w-full h-28" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4a574" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#d4a574" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon points={`0,100 ${points} 100,100`} fill="url(#chartGrad)" />
        <polyline points={points} fill="none" stroke="#d4a574" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - (Number(d.total_revenue) / maxVal) * 80;
          return <circle key={i} cx={x} cy={y} r="1.5" fill="#d4a574" />;
        })}
      </svg>
      <div className="flex justify-between mt-2">
        {data.map((d, i) => (
          <span key={i} className="text-[#5a5650] text-[10px]">
            {new Date(d.date).toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', '')}
          </span>
        ))}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const revenueChange = data.yesterdayRevenue > 0
    ? ((data.todayRevenue - data.yesterdayRevenue) / data.yesterdayRevenue) * 100
    : data.todayRevenue > 0 ? 100 : 0;

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'In Attesa', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    confirmed: { label: 'Confermato', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    preparing: { label: 'In Prep.', color: 'text-primary', bg: 'bg-primary/10' },
    ready: { label: 'Pronto', color: 'text-green-400', bg: 'bg-green-500/10' },
    completed: { label: 'Completato', color: 'text-green-400', bg: 'bg-green-500/10' },
    cancelled: { label: 'Annullato', color: 'text-red-400', bg: 'bg-red-500/10' },
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-heading text-2xl text-[#f0ece6]">Panoramica</h1>
        <p className="text-[#7a7570] text-sm mt-1">
          Riepilogo di oggi — ordini, ricavi, clienti
        </p>
        <div className="section-line mt-4" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Package size={18} />}
          label="Ordini Oggi"
          value={data.todayOrders.length.toString()}
          subtext={`${data.pendingCount} in attesa`}
        />
        <StatCard
          icon={<Euro size={18} />}
          label="Ricavo Oggi"
          value={`${data.todayRevenue.toFixed(2).replace('.', ',')}€`}
          trend={{ value: revenueChange, positive: revenueChange >= 0 }}
          subtext={data.yesterdayRevenue > 0 ? `Ieri: ${data.yesterdayRevenue.toFixed(2).replace('.', ',')}€` : 'Nessun dato ieri'}
        />
        <StatCard
          icon={<Users size={18} />}
          label="Clienti Totali"
          value={data.totalCustomers.toString()}
        />
        <StatCard
          icon={<Clock size={18} />}
          label="Da Evadere"
          value={data.pendingCount.toString()}
          subtext={data.pendingCount > 0 ? 'Richiede attenzione' : 'Tutto ok ✓'}
        />
      </div>

      {/* Charts + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-[#161616] rounded-2xl border border-[#2a2725] p-6">
          <MiniChart data={data.weeklyData} />
        </div>

        {/* Low Stock */}
        <div className="bg-[#161616] rounded-2xl border border-[#2a2725] p-6">
          <h3 className="text-[#a8a39e] text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            Scorte Basse
          </h3>
          {data.lowStock.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-[#5a5650] text-sm">Tutto ok</p>
              <p className="text-[#3a3530] text-xs mt-1">Scorte sufficienti</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.lowStock.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#0e0e0e] rounded-xl border border-[#2a2725]">
                  <div>
                    <p className="text-[#f0ece6] text-sm font-medium">{p.name}</p>
                    <p className="text-[#5a5650] text-xs">{p.stock_weight_kg} kg disp.</p>
                  </div>
                  <span className="text-amber-400 text-[10px] font-bold bg-amber-500/10 px-2 py-1 rounded-full uppercase">
                    Basso
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-[#161616] rounded-2xl border border-[#2a2725] overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-0">
            <h3 className="text-[#a8a39e] text-xs uppercase tracking-wider">Ordini Recenti</h3>
            <a href="/orders" className="text-primary text-xs hover:underline">
              Vedi tutti →
            </a>
          </div>
          <div className="p-4">
            {data.recentOrders.length === 0 ? (
              <div className="text-center py-10 text-[#5a5650] text-sm">
                Nessun ordine ancora
              </div>
            ) : (
              <div className="space-y-2">
                {data.recentOrders.map((order: any) => {
                  const sc = statusConfig[order.status] || { label: order.status, color: 'text-[#5a5650]', bg: 'bg-white/5' };
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3.5 bg-[#0e0e0e] rounded-xl border border-[#2a2725]/50 hover:border-[#3a3530] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          order.status === 'pending' ? 'bg-amber-400' :
                          order.status === 'confirmed' ? 'bg-blue-400' :
                          order.status === 'preparing' ? 'bg-primary' :
                          order.status === 'ready' ? 'bg-green-400' :
                          order.status === 'completed' ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        <div>
                          <p className="text-[#f0ece6] text-sm font-medium">#{order.id}</p>
                          <p className="text-[#5a5650] text-xs">
                            {order.customers?.name || 'Anonimo'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.color}`}>
                          {sc.label}
                        </span>
                        <p className="text-primary text-sm font-bold mt-1">
                          {Number(order.total).toFixed(2).replace('.', ',')}€
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-[#161616] rounded-2xl border border-[#2a2725] p-6">
          <h3 className="text-[#a8a39e] text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp size={14} />
            Più Venduti
          </h3>
          {data.topProducts.length === 0 ? (
            <div className="text-center py-8 text-[#5a5650] text-sm">
              Nessun dato disponibile
            </div>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map(([name, qty], i) => (
                <div key={name} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-primary/15 text-primary' :
                    i === 1 ? 'bg-[#a8a39e]/15 text-[#a8a39e]' :
                    'bg-white/5 text-[#5a5650]'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#f0ece6] text-sm truncate">{name}</p>
                  </div>
                  <span className="text-[#7a7570] text-xs font-medium">{qty}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
