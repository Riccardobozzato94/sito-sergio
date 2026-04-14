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
        parallaxRef.current.style.transform = `translateY(${scrolled * 0.35}px) scale(${1 + scrolled * 0.0002})`;
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
        {/* Very dark overlay — text must be readable */}
        <div className="absolute inset-0 bg-black/80" />
        {/* Central radial gradient to create a subtle light zone behind text */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_center,rgba(20,18,15,0.5)_0%,rgba(14,14,14,0.95)_100%)]" />
      </div>

      {/* ═══ Content ═══ */}
      <div className="relative z-10 text-center px-6 sm:px-10 max-w-3xl mx-4 sm:mx-auto pt-20 pb-12 glass-hero-panel">

        {/* Slogan */}
        <div
          className={`transition-all duration-1000 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-primary text-xs sm:text-sm tracking-[0.35em] uppercase mb-5 font-medium">
            {t.hero_slogan}
          </p>
          <div className="ornament-divider mb-2">
            <svg width="36" height="18" viewBox="0 0 36 18" fill="none" className="text-primary/60">
              <path d="M18 0C18 6 13.5 9 9 9C4.5 9 0 6 0 0" stroke="currentColor" strokeWidth="0.8" fill="none"/>
              <path d="M18 0C18 6 22.5 9 27 9C31.5 9 36 6 36 0" stroke="currentColor" strokeWidth="0.8" fill="none"/>
              <circle cx="18" cy="10.5" r="1.5" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <div
          className={`transition-all duration-1000 delay-200 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-primary tracking-wide leading-[0.95]">
            PANIFICIO
          </h1>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white italic mt-1">
            DA SERGIO
          </h1>
        </div>

        {/* Ornament */}
        <div
          className={`transition-all duration-1000 delay-300 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="ornament-divider mt-5 mb-4">
            <svg width="36" height="18" viewBox="0 0 36 18" fill="none" className="text-primary/60">
              <path d="M18 18C18 12 22.5 9 27 9C31.5 9 36 12 36 18" stroke="currentColor" strokeWidth="0.8" fill="none"/>
              <path d="M18 18C18 12 13.5 9 9 9C4.5 9 0 12 0 18" stroke="currentColor" strokeWidth="0.8" fill="none"/>
              <circle cx="18" cy="7.5" r="1.5" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* Since + Description */}
        <div
          className={`transition-all duration-1000 delay-500 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-white text-lg sm:text-xl font-heading">
            {t.hero_since} {BUSINESS.since}
          </p>
          <p className="text-white/70 text-sm sm:text-base mt-3 max-w-md mx-auto leading-relaxed">
            {t.hero_description}
          </p>
        </div>

        {/* ═══ CTA Buttons — HIGH CONTRAST ═══ */}
        <div
          className={`mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 transition-all duration-1000 delay-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Primary CTA — gold background, dark text */}
          <button
            onClick={onExploreClick}
            className="w-full sm:w-auto bg-[#d4a574] text-[#0e0e0e] font-bold px-8 sm:px-10 py-4 rounded-xl tracking-wide text-sm sm:text-base hover:bg-[#e2be96] transition-all duration-300 shadow-lg shadow-[#d4a574]/20 hover:shadow-[#d4a574]/40"
          >
            {t.hero_cta_products}
          </button>
          {/* Secondary CTA — white border, white text, green WhatsApp icon */}
          <a
            href={`https://wa.me/${BUSINESS.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto border-2 border-white text-white font-bold px-8 sm:px-10 py-4 rounded-xl tracking-wide text-sm sm:text-base flex items-center justify-center gap-2.5 hover:bg-white/10 transition-all duration-300"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#25d366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {t.hero_cta_whatsapp}
          </a>
        </div>

        {/* Scroll indicator */}
        <div
          className={`mt-12 sm:mt-16 transition-all duration-1000 delay-1000 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="animate-float">
            <svg width="24" height="40" viewBox="0 0 24 40" className="text-white/25 mx-auto">
              <rect x="1" y="1" width="22" height="38" rx="11" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="12" cy="12" r="3" fill="currentColor" className="animate-pulse" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
