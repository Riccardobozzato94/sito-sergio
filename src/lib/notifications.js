// ═══════════════════════════════════════════════════════════
// Notifications — Real-time + Audio for CRM Dashboard
// Panificio Da Sergio
// ═══════════════════════════════════════════════════════════
// Usa Supabase Realtime per ascoltare nuovi ordini/clienti
// e genera un suono tramite Web Audio API (nessun file audio
// necessario).
// ═══════════════════════════════════════════════════════════

import { supabase, isConfigured } from './supabase/client';

// ── Audio ──

let audioCtx = null;

/** Ottiene o crea l'AudioContext (deve partire da user gesture) */
function getAudioCtx() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
  }
  // Resume if suspended (Chrome blocks autoplay)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/** Suona un breve "ding" di notifica */
export function playNotificationSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;

  try {
    // Due toni: un "do" seguito da un "sol" (intervallo di quinta — piacevole)
    const now = ctx.currentTime;

    // Primo tono (do5 ~523Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = 523.25;
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Secondo tono (sol5 ~784Hz) — leggermente più lungo
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 783.99;
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.35);
  } catch (e) {
    // Ignora errori audio (browser potrebbe bloccare)
  }
}

/** Suono per nuovo cliente (più dolce, arpeggio) */
export function playCustomerSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Arpeggio ascendente: do-mi-sol
    [523.25, 659.25, 783.99].forEach(function(freq, i) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle'; // più dolce
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.setValueAtTime(0.2, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.2);
    });
  } catch (e) { /* ignore */ }
}

// ── Realtime Subscriptions ──

/**
 * Sottoscrive un canale Realtime per INSERT su una tabella.
 *
 * @param {'orders'|'customers'} table
 * @param {function} onInsert — callback con il nuovo record
 * @returns {function} unsubscribe
 */
export function subscribeInserts(table, onInsert) {
  if (!isConfigured) return function() {};

  const channel = supabase
    .channel('db-changes-' + table)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: table,
      },
      function(payload) {
        if (payload && payload.new) {
          onInsert(payload.new);
        }
      }
    )
    .subscribe();

  return function() {
    supabase.removeChannel(channel).catch(function() {});
  };
}
