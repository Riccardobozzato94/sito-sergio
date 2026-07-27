'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase-client';

const PUBLIC_PATHS = ['/login', '/auth/callback'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // Se siamo su una pagina pubblica, mostra subito i children
  if (PUBLIC_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const supabase = createBrowserClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (cancelled) return;

        if (error || !user) {
          // Nessun utente loggato → redirect a login
          router.push('/login');
          return;
        }

        // Verifica che l'utente sia autorizzato (presente in crm_users)
        const { data: crmUser, error: crmError } = await supabase
          .from('crm_users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (cancelled) return;

        if (crmError || !crmUser) {
          await supabase.auth.signOut();
          router.push('/login?error=Accesso non autorizzato');
          return;
        }

        setAuthorized(true);
      } catch {
        if (!cancelled) router.push('/login');
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => { cancelled = true; };
  }, [pathname, router]);

  if (checking) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', background: '#0e0e0e', color: '#a8a39e'
      }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <div className="text-sm">Caricamento...</div>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
