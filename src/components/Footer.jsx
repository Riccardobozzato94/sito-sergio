import { MapPin, Phone, Mail } from 'lucide-react';
import { BUSINESS as STATIC_BUSINESS, SOCIAL as STATIC_SOCIAL, HOURS as STATIC_HOURS } from '../lib/config';
import { useLang, useSettings } from '../App';

// Map Italian day names from config to translation keys
const DAY_KEY_MAP = {
  'Lunedì': 'day_mon',
  'Martedì': 'day_tue',
  'Mercoledì': 'day_wed',
  'Giovedì': 'day_thu',
  'Venerdì': 'day_fri',
  'Sabato': 'day_sat',
  'Domenica': 'day_sun',
};

export default function Footer() {
  const { t } = useLang();
  const { settings } = useSettings();
  const year = new Date().getFullYear();

  // Dynamic settings with static fallback
  const BUSINESS = settings?.business || STATIC_BUSINESS;
  const SOCIAL = settings?.social || STATIC_SOCIAL;
  const HOURS = settings?.hours || STATIC_HOURS;

  return (
    <footer className="bg-[#15100c] border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

          {/* ═══ Contatti ═══ */}
          <div>
            <h3 className="font-heading text-primary text-sm tracking-[0.2em] uppercase mb-5">{t.footer_contacts}</h3>
            <div className="space-y-3 text-text-muted text-sm">
              <div className="flex items-start gap-3">
                <MapPin size={15} className="text-primary/50 shrink-0 mt-0.5" />
                <span>{BUSINESS.address}</span>
              </div>
              <a href={`tel:${BUSINESS.phone}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                <Phone size={15} className="text-primary/50 shrink-0" />
                <span>{BUSINESS.phone}</span>
              </a>
              {/* Email rimosso su richiesta */}
            </div>
          </div>

          {/* ═══ Social + Quick Links ═══ */}
          <div>
            <h3 className="font-heading text-primary text-sm tracking-[0.2em] uppercase mb-5">{t.footer_social}</h3>

            {/* Social Icons */}
            <div className="flex gap-3 mb-6">
              {/* Facebook */}
              <a
                href={SOCIAL.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 sm:w-10 sm:h-10 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-center text-text-dim hover:text-[#1877f2] hover:border-[#1877f2]/20 transition-all duration-300"
                aria-label="Facebook"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Instagram — only if configured */}
              {SOCIAL.instagram && (
                <a
                  href={SOCIAL.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 sm:w-10 sm:h-10 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-center text-text-dim hover:text-[#e4405f] hover:border-[#e4405f]/20 transition-all duration-300"
                  aria-label="Instagram"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              )}

              {/* TripAdvisor */}
              <a
                href={SOCIAL.tripadvisor}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 sm:w-10 sm:h-10 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-center text-text-dim hover:text-[#34e0a1] hover:border-[#34e0a1]/20 transition-all duration-300"
                aria-label="TripAdvisor"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </a>

              {/* Google Reviews */}
              <a
                href={SOCIAL.googleReviews}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 sm:w-10 sm:h-10 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-center text-text-dim hover:text-[#4285f4] hover:border-[#4285f4]/20 transition-all duration-300"
                aria-label="Google Reviews"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </a>
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              {[
                { id: 'home', label: t.nav_home },
                { id: 'prodotti', label: t.nav_prodotti },
                { id: 'chi-siamo', label: t.nav_chi_siamo },
                { id: 'orari', label: t.hours_title },
                { id: 'contatti', label: t.nav_contatti },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' })}
                  className="block text-text-dim hover:text-primary text-sm transition-colors duration-200"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* ═══ Orari ═══ */}
          <div>
            <h3 className="font-heading text-primary text-sm tracking-[0.2em] uppercase mb-5">{t.footer_hours}</h3>
            <div className="space-y-2 text-sm">
              {HOURS.map((h) => {
                const dayKey = DAY_KEY_MAP[h.day];
                const dayName = dayKey ? t[dayKey]?.substring(0, 3) : h.day.substring(0, 3);
                return (
                  <div key={h.day} className="flex justify-between text-text-muted">
                    <span className="text-text">{dayName}</span>
                    <span className={h.hours === 'Chiuso' ? 'text-primary font-medium' : ''}>
                      {h.hours === 'Chiuso' ? t.closed : h.hours}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ═══ Newsletter (WhatsApp redirect) ═══ */}
          <div>
            <h3 className="font-heading text-primary text-sm tracking-[0.2em] uppercase mb-5">{t.footer_newsletter}</h3>
            <p className="text-text-muted text-sm mb-4 leading-relaxed">
              {t.footer_newsletter_text}
            </p>
            <a
              href={`https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent('Ciao! Vorrei ricevere novità e promozioni dal Panificio Da Sergio.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25d366] text-white font-bold py-3.5 sm:py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-[#20bd5a] transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#25d366]/20"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {t.footer_newsletter_btn}
            </a>
          </div>
        </div>

        {/* ═══ Bottom Bar ═══ */}
        <div className="mt-10 pt-8 border-t border-white/[0.04] text-center">
          <p className="font-heading text-text-muted text-base italic mb-2">
            {t.footer_since} <span className="text-primary not-italic font-semibold">{BUSINESS.since}</span> — {t.footer_tagline}
          </p>
          <p className="text-text-dim text-xs">
            {t.copyright?.(year) || `© ${year} ${BUSINESS.name}. ${t.footer_copyright}`}
          </p>
          <p className="text-text-dim text-[10px] mt-1">
            P.IVA {BUSINESS.partitaIva}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs">
            <a href="#privacy" className="text-text-dim hover:text-primary transition-colors">Privacy & Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
