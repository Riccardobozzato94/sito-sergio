import { useState, useEffect } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { BUSINESS } from '../lib/config';
import { LANGUAGES } from '../lib/i18n';
import { useLang } from '../App';

export default function Header({ cartCount, onCartClick, activeSection }) {
  const { t, lang, setLang } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const scrollToSection = (id) => {
    setMenuOpen(false);
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'home', label: t.nav_home },
    { id: 'prodotti', label: t.nav_prodotti },
    { id: 'chi-siamo', label: t.nav_chi_siamo },
    { id: 'orari', label: t.hours_title },
    { id: 'contatti', label: t.nav_contatti },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0e0e0e]/60 backdrop-blur-2xl saturate-150 shadow-xl shadow-black/40 border-b border-white/[0.06]'
          : 'bg-black/10 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* ═══ Mobile Hamburger ═══ */}
          <div className="flex items-center gap-2">
            <button
              className="text-primary p-2 rounded-lg transition-all duration-200 hover:bg-white/5 lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* ═══ Centered Logo — always centered on all screen sizes ═══ */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <button
              onClick={() => scrollToSection('home')}
              className="text-center group"
              aria-label="Torna alla home"
            >
              <div className="flex flex-col items-center leading-none">
                <span className="font-heading text-lg sm:text-xl lg:text-2xl text-primary tracking-[0.15em] group-hover:text-primary-light transition-colors duration-300">
                  PANIFICIO DA SERGIO
                </span>
                <span className="hidden sm:block text-[10px] tracking-[0.2em] uppercase text-white/40 mt-1">
                  {t.hero_slogan} · Chioggia
                </span>
              </div>
            </button>
          </div>

          {/* ═══ Right: Cart + Lang ═══ */}
          <div className="flex items-center gap-1 ml-auto lg:ml-0">
            {/* Language Toggle (desktop) */}
            <div className="hidden sm:flex items-center gap-0.5 mr-2 bg-white/5 rounded-full p-0.5 border border-[#2a2725]">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-200 ${
                    lang === l.code
                      ? 'bg-primary text-bg'
                      : 'text-white/50 hover:text-primary'
                  }`}
                  aria-label={l.name}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Cart Button */}
            <button
              className="relative text-primary p-2 rounded-lg transition-all duration-200 hover:bg-white/5"
              onClick={onCartClick}
              aria-label="Carrello"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-bg text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] rounded-full flex items-center justify-center animate-scale-in">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Mobile Full-Screen Menu ═══ */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-[#0e0e0e]/98 backdrop-blur-xl animate-fade-in">
          <nav className="flex flex-col items-center justify-center h-full gap-2 px-8">
            {navItems.map((link, i) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`w-full text-center py-4 text-2xl font-heading transition-all duration-300 animate-fade-in-up ${
                  activeSection === link.id
                    ? 'text-primary'
                    : 'text-white/70 hover:text-primary'
                }`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {link.label}
              </button>
            ))}

            {/* Mobile Language Switcher */}
            <div className="flex items-center gap-2 mt-8 pt-6 border-t border-[#2a2725]">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); }}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                    lang === l.code
                      ? 'bg-primary text-bg'
                      : 'bg-white/5 text-white/50 border border-[#2a2725] hover:border-primary'
                  }`}
                >
                  {l.label} — {l.name}
                </button>
              ))}
            </div>

            {/* Contact Info */}
            <div className="mt-8 pt-6 border-t border-[#2a2725] text-center">
              <p className="text-white/50 text-sm">{BUSINESS.address}</p>
              <a href={`tel:${BUSINESS.phone}`} className="text-primary text-sm mt-1 block hover:underline">
                {BUSINESS.phone}
              </a>
            </div>
          </nav>
        </div>
      )}

      {/* ═══ Desktop Navigation Bar ═══ */}
      <nav className="hidden lg:block border-t border-[#2a2725]/30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-center items-center gap-10 h-11">
            {navItems.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`text-[11px] tracking-[0.2em] uppercase transition-colors duration-300 relative group ${
                    isActive
                      ? 'text-primary'
                      : 'text-white/50 hover:text-primary'
                  }`}
                >
                  {link.label}
                  <span className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-px bg-primary transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}

