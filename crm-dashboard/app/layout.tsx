import type { Metadata } from 'next';
import Link from 'next/link';
import { User } from 'lucide-react';
import { getUser } from '@/lib/supabase';
import LogoutButton from '@/components/LogoutButton';
import SidebarNav from '@/components/SidebarNav';
import { ToastProvider } from '@/components/ToastProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'CRM — Panificio Da Sergio',
  description: 'Dashboard gestionale per Panificio Da Sergio',
};

const roleLabels: Record<string, string> = {
  admin: 'Amministratore',
  staff: 'Operatore',
  viewer: 'Visualizzazione',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  // Login page: render without sidebar (middleware handles auth redirect)
  if (!user) {
    return (
      <html lang="it">
        <body className="antialiased bg-[#0a0a0a]">
          <ToastProvider>
            {children}
          </ToastProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="it">
      <body className="antialiased">
        <ToastProvider>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-[#111111] border-r border-[#2a2725] flex flex-col shrink-0">
              {/* Logo */}
              <div className="p-6 pb-5 border-b border-[#2a2725]/50">
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                      <circle cx="16" cy="16" r="3" fill="#d4a574"/>
                      <path d="M16 4C12 4 8 8 8 16C8 24 12 28 16 28C20 28 24 24 24 16C24 8 20 4 16 4Z" stroke="#d4a574" strokeWidth="1.5" fill="none"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="font-heading text-base text-primary tracking-[0.12em] group-hover:text-primary-light transition-colors">
                      DA SERGIO
                    </h1>
                    <p className="text-[#5a5650] text-[10px] tracking-wider uppercase">CRM</p>
                  </div>
                </Link>
              </div>

              {/* Nav */}
              <SidebarNav />

              {/* User */}
              <div className="p-4 border-t border-[#2a2725]/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <User size={16} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#f0ece6] text-sm font-medium truncate">
                      {user.full_name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[#5a5650] text-xs">
                      {roleLabels[user.role] || user.role}
                    </p>
                  </div>
                </div>
                <LogoutButton />
              </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-auto bg-[#0e0e0e]">
              {/* Top bar */}
              <header className="sticky top-0 z-10 bg-[#0e0e0e]/80 backdrop-blur-xl border-b border-[#2a2725]/30 px-8 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#5a5650] text-xs uppercase tracking-wider" suppressHydrationWarning>
                      {new Date().toLocaleDateString('it-IT', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#7a7570] hidden sm:block">{user.email}</span>
                    <div className="w-px h-4 bg-[#2a2725] hidden sm:block" />
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-primary/10 text-primary border border-primary/20' :
                      user.role === 'staff' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-white/5 text-[#5a5650] border border-[#2a2725]'
                    }`}>
                      {roleLabels[user.role] || user.role}
                    </span>
                  </div>
                </div>
              </header>

              {/* Page content */}
              <div className="p-6 sm:p-8 max-w-7xl">
                {children}
              </div>
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
