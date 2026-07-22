// ═══════════════════════════════════════════════════════════
// CONFIG — Dati modificabili senza toccare il codice
// Per aggiornare il sito in produzione: modifica questo file
// e il sito si aggiorna automaticamente.
//
// NOTA: I prodotti ora vengono caricati da Supabase,
// non da questo file. Gestiscili dal CRM!
// ═══════════════════════════════════════════════════════════

export const BUSINESS = {
  name: "Panificio Da Sergio",
  slogan: "Tradizione con Passione",
  since: "1977",
  address: "Calle Ponte Caneva 626, 30015 Chioggia (VE)",
  phone: "+39 041401200",
  email: "giraldoalessandro1@gmail.com",
  whatsappNumber: "39041401200",
  website: "www.panificiodasergio.com",
  partitaIva: "03729280275",
  cutoffHour: 18,       // Ora limite per ordini (ritiro giorno dopo)
  cutoffMinute: 0,
  minOrderAmount: 5,     // Ordine minimo in EUR
  deliverySlots: [       // Slot disponibili per ritiro
    { label: 'Oggi 12:00-13:00', value: 'today_12' },
    { label: 'Oggi 17:00-19:00', value: 'today_17' },
    { label: 'Domani mattina 07:00-10:00', value: 'tomorrow_07' },
    { label: 'Domani 12:00-13:00', value: 'tomorrow_12' },
    { label: 'Domani 17:00-19:00', value: 'tomorrow_17' },
  ],
};

export const HOURS = [
  { day: "Lunedì", hours: "Chiuso" },
  { day: "Martedì", hours: "10:00 - 19:00" },
  { day: "Mercoledì", hours: "10:00 - 19:00" },
  { day: "Giovedì", hours: "10:00 - 19:00" },
  { day: "Venerdì", hours: "10:00 - 19:00" },
  { day: "Sabato", hours: "10:00 - 19:00" },
  { day: "Domenica", hours: "10:00 - 19:00" },
];

export const SOCIAL = {
  facebook: "https://www.facebook.com/p/Panificio-da-Sergio-Chioggia-100057410531710",
  instagram: null, // Not available — icon hidden in Footer
  googleReviews: "https://share.google/3atabYNGXSHpAWi9S",
  tripadvisor: "https://www.tripadvisor.it/Restaurant_Review-g194738-d7005470-Reviews-Panificio_da_Sergio-Chioggia_Veneto.html",
};

export const FOOTER_TEXTS = {
  newsletterLabel: "Iscriviti alla newsletter",
  newsletterPlaceholder: "La tua email",
  copyright: (year) => `© ${year} ${BUSINESS.name}. Tutti i diritti riservati.`,
};
