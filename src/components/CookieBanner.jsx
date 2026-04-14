import { useState, useEffect } from 'react';
import { X, Settings, Check, Shield } from 'lucide-react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // always true, cannot be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const parsed = JSON.parse(consent);
      setPreferences(parsed);
      // Activate tracking based on consent
      applyConsent(parsed);
    }
  }, []);

  const applyConsent = (prefs) => {
    // Google Analytics
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: prefs.analytics ? 'granted' : 'denied',
        ad_storage: prefs.marketing ? 'granted' : 'denied',
      });
    }

    // Meta Pixel
    if (window.fbq) {
      if (prefs.marketing) {
        window.fbq('consent', 'grant');
      } else {
        window.fbq('consent', 'revoke');
      }
    }
  };

  const handleAccept = (prefs) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    setShowBanner(false);
    setShowPreferences(false);
    applyConsent(prefs);

    // Trigger analytics if granted
    if (prefs.analytics && window.dataLayer) {
      window.dataLayer.push({ event: 'consent_given' });
    }
  };

  if (!showBanner) return null;

  return (
    <>
      {/* ═══ Overlay dim ═══ */}
      <div className="fixed inset-0 bg-black/40 z-[60]" />

      {/* ═══ Banner ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-[65] animate-slide-in">
        <div className="bg-[#1a1a1a] border-t border-[#2a2725] shadow-2xl shadow-black/50 safe-bottom">
          <div className="max-w-4xl mx-auto p-4 sm:p-6">

            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <Shield size={20} className="text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-heading text-white text-base sm:text-lg mb-1">
                  🍪 Utilizziamo i cookie
                </h3>
                <p className="text-white/50 text-xs sm:text-sm leading-relaxed">
                  Questo sito utilizza cookie tecnici (necessari) e, solo col tuo consenso, cookie analitici e di marketing
                  per migliorare l'esperienza e analizzare il traffico.{' '}
                  <a href="#privacy" className="text-primary hover:underline">Maggiori informazioni</a>
                </p>
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="text-white/30 hover:text-white transition-colors shrink-0 p-1"
                aria-label="Chiudi"
              >
                <X size={16} />
              </button>
            </div>

            {/* Preferences toggle (expandable) */}
            {showPreferences && (
              <div className="space-y-3 mb-4 p-4 bg-[#0e0e0e] rounded-xl border border-[#2a2725]">
                {/* Necessary (locked) */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-white text-sm font-medium">Cookie Tecnici</p>
                    <p className="text-white/40 text-xs">Necessari per il funzionamento del sito</p>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <Check size={14} />
                    <span className="text-xs">Sempre attivi</span>
                  </div>
                </div>
                <div className="border-t border-[#2a2725]" />
                {/* Analytics */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-white text-sm font-medium">Google Analytics</p>
                    <p className="text-white/40 text-xs">Statistiche di visita anonime</p>
                  </div>
                  <button
                    onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                    className={`w-11 h-6 rounded-full transition-all duration-200 relative ${
                      preferences.analytics ? 'bg-primary' : 'bg-[#2a2725]'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${
                      preferences.analytics ? 'left-5.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
                <div className="border-t border-[#2a2725]" />
                {/* Marketing */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-white text-sm font-medium">Meta Pixel</p>
                    <p className="text-white/40 text-xs">Misurazioni pubblicità e remarketing</p>
                  </div>
                  <button
                    onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })}
                    className={`w-11 h-6 rounded-full transition-all duration-200 relative ${
                      preferences.marketing ? 'bg-primary' : 'bg-[#2a2725]'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${
                      preferences.marketing ? 'left-5.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleAccept({ necessary: true, analytics: true, marketing: true })}
                className="flex-1 sm:flex-none bg-primary text-bg font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-primary-light transition-all duration-200"
              >
                Accetta tutti
              </button>
              <button
                onClick={() => handleAccept({ necessary: true, analytics: false, marketing: false })}
                className="flex-1 sm:flex-none border border-[#2a2725] text-white/60 font-medium px-6 py-2.5 rounded-xl text-sm hover:border-white/30 hover:text-white transition-all duration-200"
              >
                Solo necessari
              </button>
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="flex items-center gap-1.5 border border-[#2a2725] text-white/50 px-4 py-2.5 rounded-xl text-sm hover:border-white/30 hover:text-white transition-all duration-200"
              >
                <Settings size={14} />
                Personalizza
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
