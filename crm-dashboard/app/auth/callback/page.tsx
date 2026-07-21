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
      
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data.user) {
        router.push('/login?error=Errore di autenticazione. Riprova.');
        return;
      }

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