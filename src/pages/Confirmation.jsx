import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function Confirmation() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | cancelled | error

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const cancel = searchParams.get('canceled');

    if (cancel === 'true') {
      setStatus('cancelled');
    } else if (sessionId) {
      setStatus('success');
    } else {
      setStatus('error');
    }
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#1a1410] flex items-center justify-center">
        <Loader size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1410] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-400" />
            </div>
            <h1 className="text-3xl font-heading text-primary tracking-tight mb-3">
              Ordine Confermato! 🎉
            </h1>
            <p className="text-text-muted text-sm leading-relaxed mb-2">
              Grazie per aver ordinato dal Panificio Da Sergio!
            </p>
            <p className="text-text-dim text-sm leading-relaxed mb-8">
              Abbiamo ricevuto il tuo pagamento e la tua ordinazione.
              Sergio preparerà tutto con cura.
              Riceverai una notifica quando sarà pronto per il ritiro.
            </p>
            <div className="bg-[#201c17] border border-white/[0.04] rounded-2xl p-4 mb-8 text-left">
              <p className="text-text-dim text-xs uppercase tracking-wider mb-2">Info ritiro</p>
              <p className="text-white text-sm">📍 Calle Ponte Caneva 626, Chioggia</p>
              <p className="text-text-muted text-sm">🕐 Lun-Sab 10:00-19:00</p>
              <p className="text-text-dim text-sm mt-2">📞 Per qualsiasi domanda: +39 041 401 200</p>
            </div>
          </>
        )}

        {status === 'cancelled' && (
          <>
            <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} className="text-yellow-400" />
            </div>
            <h1 className="text-2xl font-heading text-white tracking-tight mb-3">
              Pagamento Annullato
            </h1>
            <p className="text-text-muted text-sm mb-8">
              Nessun problema — il tuo carrello è ancora salvato.
              Puoi riprovare quando vuoi.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} className="text-red-400" />
            </div>
            <h1 className="text-2xl font-heading text-white tracking-tight mb-3">
              Qualcosa è andato storto
            </h1>
            <p className="text-text-muted text-sm mb-8">
              Contattaci su WhatsApp al +39 041 401 200 e ti aiutiamo.
            </p>
          </>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="bg-primary text-bg font-bold px-8 py-3.5 rounded-xl hover:bg-primary-light transition-all text-sm"
          >
            Torna al negozio
          </Link>
          <a
            href="https://wa.me/39041401200"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/20 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-white/5 transition-all text-sm"
          >
            Contattaci su WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
