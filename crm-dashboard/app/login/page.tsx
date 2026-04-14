'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login, signInWithGoogle, signInWithGitHub } from '@/lib/auth';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const urlError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState(urlError || '');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if ('error' in result) {
        setError(result.error || 'Errore sconosciuto');
      } else {
        router.push(redirect);
        router.refresh();
      }
    } catch {
      setError('Errore di connessione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setOauthLoading('google');
    const result = await signInWithGoogle();
    if (result && 'error' in result) {
      setError(result.error || 'Errore Google');
      setOauthLoading(null);
    }
    // on success the browser redirects — no need to setOauthLoading(null)
  };

  const handleGitHub = async () => {
    setError('');
    setOauthLoading('github');
    const result = await signInWithGitHub();
    if (result && 'error' in result) {
      setError(result.error || 'Errore GitHub');
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0e0e0e]">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_center,rgba(20,18,15,0.5)_0%,rgba(14,14,14,0.95)_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Brand */}
        <div
          className={`text-center mb-10 transition-all duration-1000 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-primary text-xs tracking-[0.35em] uppercase mb-5 font-medium">
            CRM Dashboard
          </p>
          <div className="ornament-divider mb-3">
            <svg width="36" height="18" viewBox="0 0 36 18" fill="none" className="text-primary/60">
              <path d="M18 0C18 6 13.5 9 9 9C4.5 9 0 6 0 0" stroke="currentColor" strokeWidth="0.8" fill="none"/>
              <path d="M18 0C18 6 22.5 9 27 9C31.5 9 36 6 36 0" stroke="currentColor" strokeWidth="0.8" fill="none"/>
              <circle cx="18" cy="10.5" r="1.5" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl text-primary tracking-wide">PANIFICIO</h1>
          <h1 className="font-heading text-3xl sm:text-4xl text-[#f0ece6] italic mt-1">DA SERGIO</h1>
          <div className="ornament-divider mt-3 mb-2">
            <svg width="36" height="18" viewBox="0 0 36 18" fill="none" className="text-primary/60">
              <path d="M18 18C18 12 22.5 9 27 9C31.5 9 36 12 36 18" stroke="currentColor" strokeWidth="0.8" fill="none"/>
              <path d="M18 18C18 12 13.5 9 9 9C4.5 9 0 12 0 18" stroke="currentColor" strokeWidth="0.8" fill="none"/>
              <circle cx="18" cy="7.5" r="1.5" fill="currentColor"/>
            </svg>
          </div>
          <p className="text-[#a8a39e] text-sm mt-3">Gestione Panificio — Chioggia</p>
        </div>

        {/* Card */}
        <div
          className={`bg-[#161616] border border-[#2a2725] rounded-2xl p-8 shadow-2xl shadow-black/40 transition-all duration-1000 delay-300 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* OAuth buttons */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={!!oauthLoading || loading}
              className="w-full flex items-center justify-center gap-3 bg-white text-[#1a1a1a] font-semibold py-3 rounded-xl text-sm hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {oauthLoading === 'google' ? (
                <Loader2 size={18} className="animate-spin text-[#4285f4]" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Accedi con Google
            </button>

            <button
              type="button"
              onClick={handleGitHub}
              disabled={!!oauthLoading || loading}
              className="w-full flex items-center justify-center gap-3 bg-[#24292e] text-white font-semibold py-3 rounded-xl text-sm hover:bg-[#2f363d] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-[#3a3530]"
            >
              {oauthLoading === 'github' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              )}
              Accedi con GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#2a2725]" />
            <span className="text-[#5a5650] text-xs uppercase tracking-wider">oppure</span>
            <div className="flex-1 h-px bg-[#2a2725]" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[#a8a39e] text-xs uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a5650]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@panificiodasergio.it"
                  autoComplete="email"
                  required
                  className="w-full bg-[#0e0e0e] border border-[#2a2725] rounded-xl pl-10 pr-4 py-3.5 text-sm text-[#f0ece6] placeholder:text-[#5a5650] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#a8a39e] text-xs uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a5650]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full bg-[#0e0e0e] border border-[#2a2725] rounded-xl pl-10 pr-4 py-3.5 text-sm text-[#f0ece6] placeholder:text-[#5a5650] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 animate-fade-in">
                <AlertCircle size={14} className="text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!oauthLoading}
              className="btn-primary w-full bg-primary text-[#0e0e0e] font-bold py-3.5 rounded-xl text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Accesso in corso...
                </>
              ) : (
                'Accedi con Email'
              )}
            </button>
          </form>
        </div>

        <p
          className={`text-center text-[#5a5650] text-xs mt-8 transition-all duration-1000 delay-500 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Panificio Da Sergio — Chioggia © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
