'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        if (pathname !== '/login') {
          router.push('/login');
        } else {
          setLoading(false);
        }
        return;
      }

      const { data: crmUser } = await supabase
        .from('crm_users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!crmUser && pathname !== '/login') {
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }

      setAuthorized(true);
      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#f8fafc' }}>
        <div>Caricamento...</div>
      </div>
    );
  }

  if (!authorized && pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}