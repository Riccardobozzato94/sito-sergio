-- ══════════════════════════════════════════════════════════════
-- 013 — Fix story content: aggiorna story_p1, story_p2, quote_author
-- Panificio Da Sergio — CMS Content
-- ══════════════════════════════════════════════════════════════

-- story_p1 era vuoto — lo popoliamo
UPDATE site_content
SET value_it = 'Era il 1977 quando Sergio aprì per la prima volta le porte del suo panificio in Calle Ponte Caneva. Con le mani ancora giovani ma già esperte, aveva un sogno semplice e ambizioso: portare sulla tavola di tutti il pane genuino che aveva imparato a fare da suo padre, qui sulla riva della laguna veneta. Quel sogno, oggi, è più vivo che mai.',
    value_en = 'It was 1977 when Sergio first opened the doors of his bakery on Calle Ponte Caneva. With young but already skilled hands, he had a simple yet ambitious dream: to bring to everyone''s table the genuine bread he had learned from his father, here on the shores of the Venetian lagoon. That dream, today, is more alive than ever.',
    updated_at = now()
WHERE section = 'about' AND key = 'story_p1';

-- story_p2 era "Tre generazioni, cinquant'anni di storia..." (testo sbagliato)
UPDATE site_content
SET value_it = 'Quasi cinquant''anni dopo, il forno si accende ancora ogni mattina prima dell''alba. Le stesse ricette, le stesse mani — più esperte, con la stessa cura di sempre. Impastiamo farina, burro e acqua lentamente, come si faceva una volta. I bussolà, i pevarini, i papini, la torta della nonna: ogni dolce racconta un pezzo della nostra storia, un angolo di Chioggia, un riflesso della laguna.',
    value_en = 'Nearly fifty years later, the oven still fires up every morning before dawn. The same recipes, the same hands — more seasoned, with the same care as always. We knead flour, butter and water slowly, the way it used to be done. Bussolà, pevarini, papini, torta della nonna: each sweet tells a piece of our story, a corner of Chioggia, a reflection of the lagoon.',
    updated_at = now()
WHERE section = 'about' AND key = 'story_p2';

-- quote_author era vuoto
UPDATE site_content
SET value_it = 'Sergio',
    value_en = 'Sergio',
    updated_at = now()
WHERE section = 'about' AND key = 'quote_author';
