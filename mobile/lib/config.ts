export const BUSINESS = {
  name: 'Panificio Da Sergio',
  slogan: 'Tradizione con Passione',
  since: '1977',
  address: 'Calle Ponte Caneva 626, 30015 Chioggia (VE)',
  phone: '+39 041 401200',
  email: 'info@panificiodasergio.it',
  whatsappNumber: '39041401200',
  website: 'www.panificiodasergio.com',
  mapsUrl: 'https://maps.google.com/?q=Panificio+Da+Sergio+Chioggia',
};

export const HOURS = [
  { day: 'Lunedì', hours: '10:00 - 19:00' },
  { day: 'Martedì', hours: '10:00 - 19:00' },
  { day: 'Mercoledì', hours: '10:00 - 19:00' },
  { day: 'Giovedì', hours: '10:00 - 19:00' },
  { day: 'Venerdì', hours: '10:00 - 19:00' },
  { day: 'Sabato', hours: '10:00 - 19:00' },
  { day: 'Domenica', hours: 'Chiuso' },
];

export const CATEGORIES = [
  { key: 'tutti', label: 'Tutti' },
  { key: 'pane', label: 'Pane' },
  { key: 'dolci', label: 'Dolci' },
  { key: 'specialita', label: 'Specialità' },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]['key'];
