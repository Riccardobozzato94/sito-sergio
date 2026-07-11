import { useState, useEffect, useRef } from 'react';
import { BUSINESS } from '../lib/config';
import { useLang } from '../App';

export default function Hero({ onExploreClick }) {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  const parallaxRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.scrollY;
        parallaxRef.current.style.transform = `translateY(${scrolled * 0.3}px) scale(${1 + scrolled * 0.00015})`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* ═══ Parallax Background ═══ */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={parallaxRef}
          className="absolute inset-0 will-change-transform"
          style={{ minHeight: '120%' }}
        >
          <img
            src="/images/hero-bg.jpg"
            alt={`Panificio Da Sergio — Pane artigianale e dolci tradizionali a Chioggia`}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Warm overlay — espresso brown with golden hour light */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1410]/90 via-[#2c241e]/75 to-[#1a1410]/85" />
        {/* Warm golden light zone behind text — simulate golden hour */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_50%_45%,rgba(212,165,116,0.12)_0%,rgba(212,165,116,0.03)_50%,transparent_70%)]" />
      </div>

      {/* ═══ Content ═══ */}
      <div className="relative z-10 text-center px-6 sm:px-10 max-w-3xl mx-4 sm:mx-auto pt-20 pb-12">

        {/* Slogan */}
        <div
          className={`transition-all duration-1000 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-primary/80 text-xs sm:text-sm tracking-[0.3em] uppercase mb-6 font-medium">
            {t.hero_slogan}
          </p>
        </div>

        {/* Title — stacked, editorial, serif */}
        <div
          className={`transition-all duration-1000 delay-200 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h1 className="font-heading text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-primary tracking-tight leading-[0.88] font-bold">
            PANIFICIO
          </h1>
          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white italic font-medium mt-2 tracking-tight">
            DA SERGIO
          </h1>
        </div>

        {/* Divider line */}
        <div
          className={`transition-all duration-1000 delay-300 flex justify-center ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent mt-6 mb-5" />
        </div>

        {/* Since + Description */}
        <div
          className={`transition-all duration-1000 delay-500 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-white text-base sm:text-lg font-heading italic">
            {t.hero_since} <span className="text-primary not-italic font-semibold">{BUSINESS.since}</span>
          </p>
          <p className="text-text-muted text-sm sm:text-base mt-4 max-w-lg mx-auto leading-relaxed">
            {t.hero_description}
          </p>
        </div>

        {/* ═══ CTA Buttons ═══ */}
        <div
          className={`mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 transition-all duration-1000 delay-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <button
            onClick={onExploreClick}
            className="w-full sm:w-auto bg-primary text-bg font-bold px-9 sm:px-11 py-4 rounded-[14px] tracking-wide text-sm sm:text-base hover:bg-primary-light transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            {t.hero_cta_products}
          </button>
          <a
            href={`https://wa.me/${BUSINESS.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto border border-white/20 text-white font-medium px-9 sm:px-11 py-4 rounded-[14px] tracking-wide text-sm sm:text-base flex items-center justify-center gap-2.5 hover:bg-white/5 hover:border-white/40 transition-all duration-300"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25d366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {t.hero_cta_whatsapp}
          </a>
        </div>

        {/* Scroll indicator — più minimal */}
        <div
          className={`mt-14 sm:mt-16 transition-all duration-1000 delay-1000 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="animate-float">
            <svg width="20" height="34" viewBox="0 0 20 34" className="text-white/20 mx-auto">
              <rect x="1" y="1" width="18" height="32" rx="9" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <circle cx="10" cy="10" r="2.5" fill="currentColor" className="animate-pulse" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
