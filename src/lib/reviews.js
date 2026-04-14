// ═══════════════════════════════════════════════════════════
// RECENSIONI — Dati recensioni da TripAdvisor, Google, Wanderlog
// Per aggiornare: modifica questo array. Le recensioni vengono
// ordinate automaticamente per rating (più positive prima).
// ═══════════════════════════════════════════════════════════

export const REVIEWS = [
  {
    id: 1,
    author: "Francy P",
    rating: 5,
    source: "Google",
    date: "Aprile 2025",
    text: "Attraversando le strade il nostro olfatto è stato catturato da un profumo buono che non sentivo da bambino. Siamo entrati in questa piccola bottega: forno caldo, signora gentilissima con il figlio. Prodotti locali fantastici e pane appena sfornato ancora caldo. Tutto eccezionale!",
    snippet: "Tutto eccezionale, profumo che cattura!",
  },
  {
    id: 2,
    author: "Sandro B",
    rating: 5,
    source: "Google",
    date: "Aprile 2025",
    text: "Gruppo in vacanza a Chioggia ha acquistato prodotti tipici in questa panetteria. Prezzi medi, buon servizio, ottima qualità. Ci ha fatto assaggiare un po' di tutto. Davvero buoni. Tornati a Bologna, in due giorni è scomparso tutto!",
    snippet: "Ottima qualità, ci ha fatto assaggiare un po' di tutto.",
  },
  {
    id: 3,
    author: "Roberta D",
    rating: 5,
    source: "Google",
    date: "Novembre 2024",
    text: "Piccolo negozio, ma prodotti eccezionali con ottimi prezzi. Titolare gentile e i Buranei tra i migliori che abbia mai assaggiato! Consiglio vivamente.",
    snippet: "Buranei tra i migliori che abbia mai assaggiato!",
  },
  {
    id: 4,
    author: "Honky T",
    rating: 5,
    source: "Google",
    date: "Giugno 2024",
    text: "Piccolo panificio nel centro di Chioggia, produce pane di tutti i tipi ma soprattutto dolci locali, anche quelli difficili da trovare come i pevarini. Personale sempre cordiale. Da segnalare il pane morbido Bombolone.",
    snippet: "Dolci locali anche quelli difficili da trovare come i pevarini.",
  },
  {
    id: 5,
    author: "Gioia T",
    rating: 5,
    source: "Google",
    date: "Maggio 2024",
    text: "Ho acquistato dei biscotti come regalo. Prodotti molto buoni, prezzi onesti. Ci tornerò sicuramente.",
    snippet: "Prodotti molto buoni, prezzi onesti.",
  },
  {
    id: 6,
    author: "Marco R",
    rating: 5,
    source: "TripAdvisor",
    date: "Settembre 2024",
    text: "Il pane più buono di tutta Chioggia e dintorni! Pane di tutti i tipi, dai più semplici ai più gustosi alle olive o alle noci. Pizzette ottime. Niente da dire, molto buono.",
    snippet: "Il pane più buono di tutta Chioggia e dintorni!",
  },
  {
    id: 7,
    author: "Lucia V",
    rating: 5,
    source: "TripAdvisor",
    date: "Agosto 2024",
    text: "Sempre buono il pane piccolo! Lo portiamo sempre quando torniamo a Chioggia. La torta di mandorle è divina, così come i papini. Qualità artigianale vera.",
    snippet: "La torta di mandorle è divina, così come i papini.",
  },
  {
    id: 8,
    author: "Paolo G",
    rating: 4,
    source: "Sluurpy",
    date: "Marzo 2024",
    text: "Tutto buonissimo: il pane piccolo, i papini, il pane con le noci, la torta di mandorle, il pane con la zucca e tante altre cose. Il tutto condito da cortesia e disponibilità. Unico neo: a volte c'è fila fuori.",
    snippet: "Tutto buonissimo, condito da cortesia e disponibilità.",
  },
];

// Link esterno per vedere tutte le recensioni e lasciarne di nuove
export const REVIEW_LINKS = {
  tripadvisor: "https://www.tripadvisor.it/Restaurant_Review-g194738-d7005470-Reviews-Panificio_da_Sergio-Chioggia_Veneto.html",
  google: "https://share.google/WGb3usNlZ8PYmOOc7",
};

// Media recensioni (calcolata automaticamente)
export function getAverageRating() {
  const sum = REVIEWS.reduce((acc, r) => acc + r.rating, 0);
  return (sum / REVIEWS.length).toFixed(1);
}

export function getTotalReviews() {
  return REVIEWS.length;
}

// Restituisce le recensioni ordinate per rating (più positive prima)
export function getSortedReviews(limit = 6) {
  return [...REVIEWS]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}
