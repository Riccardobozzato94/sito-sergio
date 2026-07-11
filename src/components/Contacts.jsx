import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { BUSINESS } from '../lib/config';
import { useLang } from '../App';

export default function Contacts() {
  const { t } = useLang();

  // OpenStreetMap embed (no API key required) — reliable and privacy-friendly
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=12.27488%2C45.21702%2C12.28488%2C45.22702&amp;layer=mapnik&amp;marker=45.22202%2C12.27988`;

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

        {/* ═══ Google Maps Embed ═══ */}
        <div className="map-container aspect-[21/9] sm:aspect-[16/7]">
          <iframe
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer"
            title={`${BUSINESS.name} — Mappa Google`}
            aria-label={`Mappa con la posizione del ${BUSINESS.name}`}
          />
        </div>
        <div className="text-center mt-4">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(BUSINESS.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm hover:underline inline-flex items-center gap-1"
          >
            {t.contacts_maps_link}
          </a>
        </div>
      </div>
    </section>
  );
}
