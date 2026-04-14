import { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { LANGUAGES, translations } from './lib/i18n';
import Header from './components/Header';
import Hero from './components/Hero';
import HowToOrder from './components/HowToOrder';
import Products from './components/Products';
import Gallery from './components/Gallery';
import OpeningHours from './components/OpeningHours';
import About from './components/About';
import Reviews from './components/Reviews';
import Contacts from './components/Contacts';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import CartToast from './components/CartToast';
import PrivacyPolicy from './components/PrivacyPolicy';
import CookieBanner from './components/CookieBanner';
import { BUSINESS } from './lib/config';

// Language Context
export const LangContext = createContext();

export function useLang() {
  return useContext(LangContext);
}

function App() {
  const [lang, setLang] = useState('it');
  const t = translations[lang];
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [cartToast, setCartToast] = useState(null);

  // ── Cart Logic ──
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    // Show toast notification — unique id so repeated adds re-trigger animation
    setCartToast({ id: Date.now(), productName: product.name });
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ── Scroll Reveal ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // ── Active Section Tracking ──
  const updateActiveSection = useCallback(() => {
    const sections = ['home', 'prodotti', 'chi-siamo', 'orari', 'contatti'];
    const scrollPos = window.scrollY + 150;

    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i]);
      if (el && el.offsetTop <= scrollPos) {
        setActiveSection(sections[i]);
        return;
      }
    }
    setActiveSection('home');
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    return () => window.removeEventListener('scroll', updateActiveSection);
  }, [updateActiveSection]);

  // ── Privacy Policy route from footer link ──
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#privacy' || hash === '#privacy-policy') {
      setShowPrivacy(true);
    }
    const onHashChange = () => {
      if (window.location.hash === '#privacy' || window.location.hash === '#privacy-policy') {
        setShowPrivacy(true);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (showPrivacy) {
    return (
      <LangContext.Provider value={{ lang, setLang, t }}>
        <PrivacyPolicy onBack={() => {
          setShowPrivacy(false);
          window.location.hash = '';
        }} />
        <CookieBanner />
      </LangContext.Provider>
    );
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t, activeSection }}>
      <div className="min-h-screen bg-bg mobile-bottom-padding">
        {/* ═══ Accessibility: skip to main content ═══ */}
        <a
          href="#prodotti"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:bg-primary focus:text-bg focus:font-bold focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm"
        >
          Vai al contenuto principale
        </a>
        <Header
          cartCount={cartCount}
          onCartClick={() => setCartOpen(true)}
          activeSection={activeSection}
        />

        <main>
          {/* ── Customer journey: cattura → mostra → spiega → fida → prova visiva → prova sociale → info → azione */}
          <Hero onExploreClick={() => document.getElementById('prodotti')?.scrollIntoView({ behavior: 'smooth' })} />
          <Products onAddToCart={addToCart} />
          <HowToOrder />
          <About />
          <Gallery />
          <Reviews />
          <OpeningHours />
          <Contacts />
        </main>

        <Footer />

        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          items={cart}
          onUpdateQuantity={updateQuantity}
        />

        {/* ═══ Cart Toast Notification ═══ */}
        <CartToast toast={cartToast} />

        {/* ═══ Floating WhatsApp Button ═══ */}
        <a
          href={`https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent('Ciao! Vorrei ordinare dei prodotti dal Panificio Da Sergio.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-float fixed bottom-6 left-4 sm:bottom-8 sm:left-8 z-40 w-14 h-14 bg-[#25d366] rounded-full flex items-center justify-center shadow-lg shadow-[#25d366]/20 hover:shadow-xl hover:shadow-[#25d366]/30 transition-shadow duration-300"
          aria-label="Contattaci su WhatsApp"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>

        {/* ═══ Cookie Consent Banner ═══ */}
        <CookieBanner />
      </div>
    </LangContext.Provider>
  );
}

export default App;
