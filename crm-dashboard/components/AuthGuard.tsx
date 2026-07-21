'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase-client';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (cancelled) return;

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

        if (cancelled) return;

        if (!crmUser && pathname !== '/login') {
          await supabase.auth.signOut();
          router.push('/login');
          return;
        }

        setAuthorized(true);
        setLoading(false);
      } catch (err) {
        console.error('AuthGuard error:', err);
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    checkAuth();
    return () => { cancelled = true; };
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