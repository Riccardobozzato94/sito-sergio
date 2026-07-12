import { useState, useEffect } from 'react';
import { X, Settings, Check, Shield } from 'lucide-react';
import { useSettings, useLang } from '../App';

export default function CookieBanner() {
  const { settings, contentLoaded } = useSettings();
  const { t } = useLang();
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  const gaId = settings?.analytics?.gaId || '';
  const metaPixel = settings?.analytics?.metaPixel || '';
  const hasAnalytics = !!gaId;
  const hasMarketing = !!metaPixel;

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Only show if there are analytics to track
      if (hasAnalytics || hasMarketing) {
        setShowBanner(true);
      }
    } else {
      const parsed = JSON.parse(consent);
      setPreferences(parsed);
      applyConsent(parsed);
    }
  }, [contentLoaded]);

  const applyConsent = (prefs) => {
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: prefs.analytics ? 'granted' : 'denied',
        ad_storage: prefs.marketing ? 'granted' : 'denied',
      });
    }
    if (window.fbq) {
      prefs.marketing ? window.fbq('consent', 'grant') : window.fbq('consent', 'revoke');
    }
  };

  const handleAccept = (prefs) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    setShowBanner(false);
    setShowPreferences(false);
    applyConsent(prefs);
    if (prefs.analytics && window.dataLayer) {
      window.dataLayer.push({ event: 'consent_given' });
    }
  };

  // Don't show the banner if no analytics/marketing are configured at all
  if (!showBanner || (!hasAnalytics && !hasMarketing && !localStorage.getItem('cookie-consent'))) return null;

  return (
    <>
      {/* ═══ Overlay dim ═══ */}
      <div className="fixed inset-0 bg-bg/50 z-[60]" />

      {/* ═══ Banner ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-[65] animate-slide-in">
        <div className="bg-bg-card border-t border-border shadow-2xl shadow-black/50 safe-bottom">
          <div className="max-w-4xl mx-auto p-4 sm:p-6">

            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <Shield size={20} className="text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-heading text-text text-base sm:text-lg mb-1">
                  🍪 {t.cookie_title}
                </h3>
                <p className="text-text-muted text-xs sm:text-sm leading-relaxed">
                  {t.cookie_description}{' '}
                  <a href="#/privacy" className="text-primary hover:underline">{t.cookie_info_link}</a>
                </p>
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="text-text-dim hover:text-text transition-colors shrink-0 p-1"
                aria-label={t.cookie_close}
              >
                <X size={16} />
              </button>
            </div>

            {/* Preferences toggle */}
            {showPreferences && (
              <div className="space-y-3 mb-4 p-4 bg-bg rounded-xl border border-border">
                {/* Necessary (locked) */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-text text-sm font-medium">{t.cookie_tech_title}</p>
                    <p className="text-text-dim text-xs">{t.cookie_tech_desc}</p>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <Check size={14} />
                    <span className="text-xs">{t.cookie_tech_status}</span>
                  </div>
                </div>

                {/* Analytics — only show if configured */}
                {hasAnalytics && (
                  <>
                    <div className="border-t border-border" />
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-text text-sm font-medium">{t.cookie_analytics_title}</p>
                        <p className="text-text-dim text-xs">{t.cookie_analytics_desc} ({gaId})</p>
                      </div>
                      <button
                        onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                        className={`w-11 h-6 rounded-full transition-all duration-200 relative ${
                          preferences.analytics ? 'bg-primary' : 'bg-border'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${
                          preferences.analytics ? 'left-5.5' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                  </>
                )}

                {/* Marketing — only show if configured */}
                {hasMarketing && (
                  <>
                    <div className="border-t border-border" />
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-text text-sm font-medium">{t.cookie_marketing_title}</p>
                        <p className="text-text-dim text-xs">{t.cookie_marketing_desc} ({metaPixel})</p>
                      </div>
                      <button
                        onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })}
                        className={`w-11 h-6 rounded-full transition-all duration-200 relative ${
                          preferences.marketing ? 'bg-primary' : 'bg-border'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${
                          preferences.marketing ? 'left-5.5' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleAccept({ necessary: true, analytics: true, marketing: true })}
                className="flex-1 sm:flex-none bg-primary text-bg font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-primary-light transition-all duration-200"
              >
                {t.cookie_accept_all}
              </button>
              <button
                onClick={() => handleAccept({ necessary: true, analytics: false, marketing: false })}
                className="flex-1 sm:flex-none border border-border text-text-muted font-medium px-6 py-2.5 rounded-xl text-sm hover:border-white/30 hover:text-text transition-all duration-200"
              >
                {t.cookie_necessary_only}
              </button>
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="flex items-center gap-1.5 border border-border text-text-dim px-4 py-2.5 rounded-xl text-sm hover:border-white/30 hover:text-text transition-all duration-200"
              >
                <Settings size={14} />
                {t.cookie_customize}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
