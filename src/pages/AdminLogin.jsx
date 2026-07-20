import { useState } from 'react';
import { signIn } from '../lib/admin';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      window.location.hash = '#/admin';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1410] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl text-primary tracking-tight">PANIFICIO</h1>
          <p className="font-heading text-xl text-white italic">DA SERGIO</p>
          <p className="text-text-dim text-xs mt-2 uppercase tracking-widest">Area Riservata</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              autoComplete="email"
              className="w-full bg-bg border border-border rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-text-dim/50 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
              className="w-full bg-bg border border-border rounded-xl px-4 py-3.5 pr-12 text-sm text-white placeholder:text-text-dim/50 focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim hover:text-primary transition-colors"
              aria-label={showPw ? 'Nascondi password' : 'Mostra password'}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-bg font-bold py-3.5 rounded-xl hover:bg-primary-light transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>

          <p className="text-center text-text-dim text-xs mt-4">
            <a href="#/" className="hover:text-primary transition-colors">← Torna al sito</a>
          </p>
          <p className="text-center text-text-dim/50 text-[10px] mt-4 leading-relaxed">
            Demo: admin@panificio.it / admin123
          </p>
        </form>
      </div>
    </div>
  );
}
