'use client';

import { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://gohhqrbcaqvpkcltazzk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvaGhxcmJjYXF2cGtjbHRhenprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMTU3MzgsImV4cCI6MjA5MTU5MTczOH0.jWIoLpWE2U_YjRbv3cU_MTZHqP9LTVizId2_yJSS7-U';

async function checkUser() {
  // Get stored session from localStorage
  let accessToken = null;
  try {
    const stored = localStorage.getItem('supabase.auth.token');
    if (stored) {
      const parsed = JSON.parse(stored);
      accessToken = parsed?.currentSession?.access_token || null;
    }
  } catch (e) {
    // localStorage not available
  }

  // If no stored token, user is not logged in
  if (!accessToken) return null;

  // Validate token with Supabase
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

async function loginUser(email: string, password: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error_description || err.msg || 'Login failed');
  }
  const data = await res.json();
  // Store session
  try {
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      currentSession: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + data.expires_in * 1000,
      },
    }));
  } catch (e) {
    // localStorage not available
  }
  return data;
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState<'loading' | 'login' | 'dashboard'>('loading');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await checkUser();
        if (cancelled) return;
        if (u) {
          setUser(u);
          setPage('dashboard');
        } else {
          setPage('login');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        if (!cancelled) setPage('login');
      }
    })();
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
    return <LoginForm onLogin={(u) => { setUser(u); setPage('dashboard'); }} />;
  }

  return <>{children}</>;
}

function LoginForm({ onLogin }: { onLogin: (user: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginUser(email, password);
      onLogin(data.user || { id: data.user_id });
    } catch (err: any) {
      setError(err.message || 'Errore di accesso');
      setLoading(false);
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
        <h1 style={{ color: '#f0ece6', fontSize: '24px', marginBottom: '8px' }}>Accedi</h1>
        <p style={{ color: '#7a7570', fontSize: '14px', marginBottom: '24px' }}>
          CRM Panificio Da Sergio
        </p>
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', padding: '12px', color: '#fca5a5',
            fontSize: '13px', marginBottom: '16px'
          }}>{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#a8a39e', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #2a2725',
                background: '#0e0e0e', color: '#f0ece6', fontSize: '14px', boxSizing: 'border-box' }}
              placeholder="La tua email" required />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#a8a39e', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #2a2725',
                background: '#0e0e0e', color: '#f0ece6', fontSize: '14px', boxSizing: 'border-box' }}
              placeholder="La tua password" required />
          </div>
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
              background: loading ? '#4a7c59' : '#5a9e6f', color: '#fff', fontSize: '14px', fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '12px' }}>
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  );
}