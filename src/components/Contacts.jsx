import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { BUSINESS as STATIC_BUSINESS } from '../lib/config';
import { useLang, useSettings } from '../App';
import ContactForm from './ContactForm';

export default function Contacts() {
  const { t } = useLang();
  const { settings } = useSettings();
  const BUSINESS = settings?.business || STATIC_BUSINESS;

  const contactCards = [
    {
      icon: <MapPin size={20} />,
      label: t.contacts_address,
      value: BUSINESS.address,
      href: `https://maps.google.com/?q=${encodeURIComponent(BUSINESS.address)}`,
      external: true,
    },
    {
      icon: <Phone size={20} />,
      label: t.contacts_phone,
      value: BUSINESS.phone,
      href: `tel:${BUSINESS.phone}`,
      external: false,
    },
    {
      icon: <Mail size={20} />,
      label: t.contacts_email,
      value: BUSINESS.email,
      href: `mailto:${BUSINESS.email}`,
      external: false,
    },
    {
      icon: <MessageCircle size={20} />,
      label: t.contacts_whatsapp,
      value: t.contacts_write,
      href: `https://wa.me/${BUSINESS.whatsappNumber}`,
      external: true,
      highlight: true,
    },
  ];

  return (
    <section id="contatti" className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ═══ Section Title ═══ */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-primary tracking-tight">
            {t.contacts_title}
          </h2>
          <p className="text-text-muted mt-4 max-w-lg mx-auto text-sm sm:text-base">
            {t.contacts_subtitle}
          </p>
        </div>

        {/* ═══ Contact Cards Grid ═══ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10 sm:mb-12">
          {contactCards.map((card, i) => (
            <a
              key={i}
              href={card.href}
              target={card.external ? '_blank' : undefined}
              rel={card.external ? 'noopener noreferrer' : undefined}
              className={`group bg-bg-card rounded-2xl p-6 border transition-all duration-300 text-center ${
                card.highlight
                  ? 'border-[#25d366]/30 hover:border-[#25d366]/60 hover:shadow-lg hover:shadow-[#25d366]/10'
                  : 'border-border hover:border-primary/30 hover:shadow-lg hover:shadow-black/20'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${
                card.highlight
                  ? 'bg-[#25d366]/10 text-[#25d366] group-hover:bg-[#25d366]/20'
                  : 'bg-primary/10 text-primary group-hover:bg-primary/20'
              }`}>
                {card.icon}
              </div>
              <h3 className="font-heading text-text text-base mb-1.5">{card.label}</h3>
              <p className={`text-sm transition-colors duration-300 ${
                card.highlight
                  ? 'text-[#25d366] group-hover:underline'
                  : 'text-text-muted group-hover:text-primary'
              }`}>
                {card.value}
              </p>
            </a>
          ))}
        </div>

        {/* ═══ Mappa — card cliccabile ═══ */}
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(BUSINESS.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl overflow-hidden border border-border shadow-xl hover:border-primary/30 transition-all group"
        >
          <div className="relative h-[250px] sm:h-[300px] bg-bg-elevated flex items-center justify-center">
            {/* Address overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/40 to-transparent z-10" />
            <div className="relative z-20 text-center p-6">
              <div className="w-14 h-14 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/30 transition-colors">
                <MapPin size={28} />
              </div>
              <p className="text-white font-heading text-lg mb-1">{BUSINESS.address}</p>
              <p className="text-primary text-sm font-medium">{t.contacts_maps_link || 'Apri in Google Maps'} →</p>
            </div>
            {/* Decorative map lines */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 150 Q100 100 200 150 T400 150" fill="none" stroke="white" strokeWidth="1"/>
              <path d="M0 200 Q80 180 160 200 T320 200 T400 220" fill="none" stroke="white" strokeWidth="0.5"/>
              <path d="M0 80 Q60 60 120 80 T240 60 T360 80 T400 70" fill="none" stroke="white" strokeWidth="0.5"/>
              <circle cx="200" cy="150" r="8" fill="none" stroke="white" strokeWidth="2"/>
              <circle cx="200" cy="150" r="3" fill="#d4a574"/>
            </svg>
          </div>
        </a>

        {/* ═══ Contact Form ═══ */}
        <div className="mt-12 sm:mt-16 max-w-lg mx-auto">
          <h3 className="font-heading text-xl sm:text-2xl text-primary text-center mb-6">
            {t.contacts_form_title || 'Scrivici un Messaggio'}
          </h3>
          <div className="bg-bg-card rounded-2xl border border-border p-6 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
