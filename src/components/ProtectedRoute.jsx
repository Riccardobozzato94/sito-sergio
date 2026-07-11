import { useEffect, useState } from 'react';
import { getSession } from '../lib/admin';

export default function ProtectedRoute({ children }) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession()
      .then((session) => {
        setAuthorized(!!session);
        setLoading(false);
      })
      .catch(() => {
        setAuthorized(false);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1410] flex items-center justify-center">
        <div className="text-primary text-center">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted text-sm">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    window.location.hash = '#/admin/login';
    return null;
  }

  return children;
}
