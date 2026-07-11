import { useState } from 'react';
import { signOut } from '../lib/admin';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminContent from './AdminContent';
import { Package, ShoppingCart, FileText, LogOut, ChevronLeft, Menu } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'products', label: 'Prodotti', icon: Package },
  { id: 'orders', label: 'Ordini', icon: ShoppingCart },
  { id: 'content', label: 'Testi Sito', icon: FileText },
];

function getNavLabel(id) {
  const item = NAV_ITEMS.find((n) => n.id === id);
  return item ? item.label : 'Dashboard';
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    window.location.hash = '#/admin/login';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'products': return <AdminProducts />;
      case 'orders': return <AdminOrders />;
      case 'content': return <AdminContent />;
      default: return <AdminProducts />;
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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#201c17] border-r border-white/[0.04] transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-white/[0.04]">
          <h2 className="font-heading text-primary text-lg tracking-tight">PANIFICIO</h2>
          <p className="font-heading text-white text-sm italic">DA SERGIO</p>
          <p className="text-text-dim text-[10px] uppercase tracking-widest mt-1">Dashboard</p>
        </div>

        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-text-dim hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/[0.04]">
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
      <div className="flex-1 min-w-0">
        {/* Top bar (mobile) */}
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-white/[0.04] bg-[#201c17]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-text-dim hover:text-primary transition-colors"
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>
          <div>
            <h1 className="text-primary font-heading text-sm">PANIFICIO DA SERGIO</h1>
            <p className="text-text-dim text-[10px] uppercase tracking-wider">{getNavLabel(activeTab)}</p>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
