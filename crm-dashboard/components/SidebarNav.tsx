'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Package, Users, ShoppingCart,
  Warehouse, Tag, TrendingUp, FileText,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/orders', label: 'Ordini', icon: Package },
  { href: '/customers', label: 'Clienti', icon: Users },
  { href: '/products', label: 'Prodotti', icon: ShoppingCart },
  { href: '/inventory', label: 'Inventario', icon: Warehouse },
  { href: '/promotions', label: 'Promozioni', icon: Tag },
  { href: '/content', label: 'Contenuti', icon: FileText },
  { href: '/analytics', label: 'Analytics', icon: TrendingUp },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-[#9a9590] hover:text-[#f0ece6] hover:bg-white/[0.04]'
            }`}
          >
            <item.icon size={18} className={isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
