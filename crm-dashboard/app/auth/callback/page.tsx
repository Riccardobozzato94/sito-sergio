'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase-client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createBrowserClient();

      // 1. Scambia il codice PKCE con una sessione (obbligatorio per OAuth)
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          router.push('/login?error=Errore nello scambio del codice di autenticazione.');
          return;
        }
      }

      // 2. Recupera l'utente autenticato
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data.user) {
        router.push('/login?error=Errore di autenticazione. Riprova.');
        return;
      }

      // 3. Verifica accesso CRM
      const { data: crmUser, error: crmError } = await supabase
        .from('crm_users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (crmError || !crmUser) {
        await supabase.auth.signOut();
        router.push('/login?error=Accesso non autorizzato.');
        return;
      }

      router.push('/');
    };

    handleCallback();
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '18px', marginBottom: '8px' }}>Autenticazione in corso...</div>
        {error && <div style={{ color: '#ef4444' }}>{error}</div>}
      </div>
    </div>
  );
}