'use client';

import { logout } from '@/lib/auth';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-[#5a5650] hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
    >
      <LogOut size={14} />
      Esci
    </button>
  );
}
