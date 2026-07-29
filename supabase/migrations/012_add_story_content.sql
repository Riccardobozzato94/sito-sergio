-- ══════════════════════════════════════════════════════════════
-- 012 — Add missing about story paragraphs (p1, p2) to site_content
-- Panificio Da Sergio — CMS Content
-- Aggiunge i paragrafi mancanti della storia per renderli editabili dal CRM
-- ══════════════════════════════════════════════════════════════

-- Paragrafo 1: L'inizio della storia (1977)
INSERT INTO site_content (section, key, value_it, value_en) VALUES
  ('about', 'story_p1',
   'Era il 1977 quando Sergio aprì per la prima volta le porte del suo panificio in Calle Ponte Caneva. Con le mani ancora giovani ma già esperte, aveva un sogno semplice e ambizioso: portare sulla tavola di tutti il pane genuino che aveva imparato a fare da suo padre, qui sulla riva della laguna veneta. Quel sogno, oggi, è più vivo che mai.',
   'It was 1977 when Sergio first opened the doors of his bakery on Calle Ponte Caneva. With young but already skilled hands, he had a simple yet ambitious dream: to bring to everyone''s table the genuine bread he had learned from his father, here on the shores of the Venetian lagoon. That dream, today, is more alive than ever.')
ON CONFLICT (section, key) DO NOTHING;

-- Paragrafo 2: La continuità (quasi 50 anni dopo)
INSERT INTO site_content (section, key, value_it, value_en) VALUES
  ('about', 'story_p2',
   'Quasi cinquant''anni dopo, il forno si accende ancora ogni mattina prima dell''alba. Le stesse ricette, le stesse mani — più esperte, con la stessa cura di sempre. Impastiamo farina, burro e acqua lentamente, come si faceva una volta. I bussolà, i pevarini, i papini, la torta della nonna: ogni dolce racconta un pezzo della nostra storia, un angolo di Chioggia, un riflesso della laguna.',
   'Nearly fifty years later, the oven still fires up every morning before dawn. The same recipes, the same hands — more seasoned, with the same care as always. We knead flour, butter and water slowly, the way it used to be done. Bussolà, pevarini, papini, torta della nonna: each sweet tells a piece of our story, a corner of Chioggia, a reflection of the lagoon.')
ON CONFLICT (section, key) DO NOTHING;

-- Anche il paragrafo 3 c'è già ma lo reinseriamo per completezza
INSERT INTO site_content (section, key, value_it, value_en) VALUES
  ('about', 'story_p3',
   'Non troverete conservanti nei nostri prodotti. Non troverete fretta nei nostri gesti. Solo ingredienti veri, lievitazione lenta e il tempo che serve — perché il pane buono non si può imbrogliare. Tre generazioni, cinquant''anni di storia, un solo amore per la panificazione artigianale.',
   'You won''t find preservatives in our products. You won''t find hurry in our movements. Only real ingredients, slow fermentation, and all the time it takes — because good bread cannot be rushed. Three generations, fifty years of history, one love for artisan baking.')
ON CONFLICT (section, key) DO NOTHING;
