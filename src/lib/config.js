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
  email: "info@panificiodasergio.it",
  whatsappNumber: "39041401200",
  website: "www.panificiodasergio.com",
};

export const HOURS = [
  { day: "Lunedì", hours: "10:00 - 19:00" },
  { day: "Martedì", hours: "10:00 - 19:00" },
  { day: "Mercoledì", hours: "10:00 - 19:00" },
  { day: "Giovedì", hours: "10:00 - 19:00" },
  { day: "Venerdì", hours: "10:00 - 19:00" },
  { day: "Sabato", hours: "10:00 - 19:00" },
  { day: "Domenica", hours: "Chiuso" },
];

export const SOCIAL = {
  facebook: "https://www.facebook.com/p/Panificio-da-Sergio-Chioggia-100057410531710",
  instagram: null, // Not available — icon hidden in Footer
  googleReviews: "https://www.google.com/search?sa=X&sca_esv=5ed080b9caecffb2&q=Panificio+Da+Sergio+Recensioni&rflfq=1&num=20&stick=H4sIAAAAAAAAAONgkxIxtDA0NjQ2NzS3NLEwMjU1Nja3MNnAyPiKUS4gMS8zLTM5M1_BJVEhOLUoHcgKSk1OzSvOzM_LXMRKQAEACIdJn10AAAA&rldimm=18131371794825533784&tbm=lcl&hl=it-IT&ved=2ahUKEwia49C5l-aTAxWo0QIHHWLGI5sQ9fQKegQIVBAG&biw=948&bih=948&dpr=1#lkt=LocalPoiReviews",
  tripadvisor: "https://www.tripadvisor.it/Restaurant_Review-g194738-d7005470-Reviews-Panificio_da_Sergio-Chioggia_Veneto.html",
};

export const FOOTER_TEXTS = {
  newsletterLabel: "Iscriviti alla newsletter",
  newsletterPlaceholder: "La tua email",
  copyright: (year) => `© ${year} ${BUSINESS.name}. Tutti i diritti riservati.`,
};
