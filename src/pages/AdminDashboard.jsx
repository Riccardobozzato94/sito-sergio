import { useState, useEffect } from 'react';
import { signOut, getOrders, getProducts } from '../lib/admin';
import AdminHome from './AdminHome';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminContent from './AdminContent';
import AdminCustomers from './AdminCustomers';
import {
  LayoutDashboard, Package, ShoppingCart, FileText, Users,
  LogOut, ChevronLeft, Menu, Bell
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Prodotti', icon: Package },
  { id: 'orders', label: 'Ordini', icon: ShoppingCart },
  { id: 'customers', label: 'Clienti', icon: Users },
  { id: 'content', label: 'Testi Sito', icon: FileText },
];

function getNavLabel(id) {
  const item = NAV_ITEMS.find((n) => n.id === id);
  return item ? item.label : 'Dashboard';
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    loadPendingCount();
    const interval = setInterval(loadPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadPendingCount() {
    try {
      const orders = await getOrders();
      setPendingCount(orders.filter((o) => o.status === 'pending' || o.status === 'paid').length);
    } catch {}
  }

  const handleLogout = async () => {
    await signOut();
    window.location.hash = '#/admin/login';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <AdminHome onNavigate={setActiveTab} />;
      case 'products': return <AdminProducts />;
      case 'orders': return <AdminOrders />;
      case 'customers': return <AdminCustomers />;
      case 'content': return <AdminContent />;
      default: return <AdminHome onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1410] flex">
      {/* ═══ Mobile sidebar overlay ═══ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══ Sidebar ═══ */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#201c17] border-r border-white/[0.04] flex flex-col transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/[0.04]">
          <h2 className="font-heading text-primary text-lg tracking-tight">PANIFICIO</h2>
          <p className="font-heading text-white text-sm italic">DA SERGIO</p>
          <p className="text-text-dim text-[10px] uppercase tracking-widest mt-1">Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-text-dim hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <Icon size={18} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === 'orders' && pendingCount > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center tabular-nums">
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-white/[0.04] space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-dim hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
          >
            <LogOut size={18} />
            Esci
          </button>
          <a
            href="#/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-dim hover:text-primary transition-all duration-200"
          >
            <ChevronLeft size={18} />
            Torna al sito
          </a>
        </div>
      </aside>

      {/* ═══ Main content ═══ */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar (mobile) */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] bg-[#201c17] sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-text-dim hover:text-primary transition-colors"
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex-1">
            <h1 className="text-primary font-heading text-sm">PANIFICIO DA SERGIO</h1>
            <p className="text-text-dim text-[10px] uppercase tracking-wider">{getNavLabel(activeTab)}</p>
          </div>
          {pendingCount > 0 && (
            <button
              onClick={() => { setActiveTab('orders'); setSidebarOpen(false); }}
              className="relative text-text-dim hover:text-primary transition-colors"
              aria-label={`${pendingCount} ordini in attesa`}
            >
              <Bell size={18} />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            </button>
          )}
        </div>

        {/* Page content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
