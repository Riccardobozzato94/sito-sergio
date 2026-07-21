'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase-client';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [page, setPage] = useState<'loading' | 'login' | 'dashboard'>('loading');

  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (cancelled) return;

        if (!user) {
          setPage('login');
          setLoading(false);
          return;
        }

        const { data: crmUser } = await supabase
          .from('crm_users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (cancelled) return;

        if (!crmUser) {
          await supabase.auth.signOut();
          setPage('login');
          setLoading(false);
          return;
        }

        setAuthorized(true);
        setLoading(false);
        setPage('dashboard');
      } catch (err) {
        console.error('AuthGuard error:', err);
        if (!cancelled) {
          setPage('login');
          setLoading(false);
        }
      }
    };

    checkAuth();
    return () => { cancelled = true; };
  }, []);

  if (page === 'loading') {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', background: '#0f172a', color: '#f8fafc'
      }}>
        <div>Caricamento...</div>
      </div>
    );
  }

  if (page === 'login') {
    return <LoginPage />;
  }

  return <>{children}</>;
}

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const supabase = createBrowserClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('Credenziali non valide. Controlla email e password.');
        setIsLoading(false);
        return;
      }

      const { data: crmUser, error: crmError } = await supabase
        .from('crm_users')
        .select('role, full_name')
        .eq('id', data.user.id)
        .single();

      if (crmError || !crmUser) {
        await supabase.auth.signOut();
        setError("Accesso non autorizzato. Contatta l'amministratore.");
        setIsLoading(false);
        return;
      }

      window.location.reload();
    } catch (err) {
      console.error('Login error:', err);
      setError('Errore di connessione. Riprova.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const supabase = createBrowserClient();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/sito-sergio/admin/auth/callback',
        },
      });
    } catch (err) {
      console.error('Google login error:', err);
      setError('Errore di connessione. Riprova.');
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: '#0f172a', padding: '20px'
    }}>
      <div style={{
        background: '#161616', border: '1px solid #2a2725', borderRadius: '16px',
        padding: '40px', width: '100%', maxWidth: '400px'
      }}>
        <h1 style={{ color: '#f0ece6', fontSize: '24px', marginBottom: '8px' }}>
          Accedi
        </h1>
        <p style={{ color: '#7a7570', fontSize: '14px', marginBottom: '24px' }}>
          CRM Panificio Da Sergio
        </p>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', padding: '12px', color: '#fca5a5',
            fontSize: '13px', marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#a8a39e', fontSize: '13px', marginBottom: '6px', display: 'block' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                border: '1px solid #2a2725', background: '#0e0e0e',
                color: '#f0ece6', fontSize: '14px', boxSizing: 'border-box'
              }}
              placeholder="La tua email"
              required
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#a8a39e', fontSize: '13px', marginBottom: '6px', display: 'block' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                border: '1px solid #2a2725', background: '#0e0e0e',
                color: '#f0ece6', fontSize: '14px', boxSizing: 'border-box'
              }}
              placeholder="La tua password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%', padding: '10px', borderRadius: '8px',
              border: 'none', background: isLoading ? '#4a7c59' : '#5a9e6f',
              color: '#fff', fontSize: '14px', fontWeight: 500,
              cursor: isLoading ? 'not-allowed' : 'pointer', marginBottom: '12px'
            }}
          >
            {isLoading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        <div style={{
          textAlign: 'center', color: '#5a5650', fontSize: '12px',
          margin: '16px 0'
        }}>
          oppure
        </div>

        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%', padding: '10px', borderRadius: '8px',
            border: '1px solid #2a2725', background: 'transparent',
            color: '#f0ece6', fontSize: '14px', cursor: 'pointer'
          }}
        >
          Continua con Google
        </button>
      </div>
    </div>
  );
}