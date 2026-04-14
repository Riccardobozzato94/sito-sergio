import { Shield, ArrowLeft, Mail } from 'lucide-react';
import { BUSINESS } from '../lib/config';

export default function PrivacyPolicy({ onBack }) {
  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-white/50 hover:text-primary transition-colors duration-200 mb-8"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Torna al sito</span>
        </button>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={28} className="text-primary" />
            <h1 className="font-heading text-3xl sm:text-4xl text-primary tracking-wide">
              Privacy & Cookie Policy
            </h1>
          </div>
          <p className="text-white/50 text-sm">
            Ultimo aggiornamento: Aprile 2025
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-white/60 text-sm leading-relaxed">

          {/* 1. Titolare */}
          <section>
            <h2 className="font-heading text-xl text-white mb-3">1. Titolare del Trattamento</h2>
            <div className="bg-white/5 border border-[#2a2725] rounded-xl p-5 space-y-1">
              <p><strong className="text-white">Panificio Da Sergio</strong></p>
              <p>{BUSINESS.address}</p>
              <p>Telefono: {BUSINESS.phone}</p>
              <p>Email: {BUSINESS.email}</p>
              <p>Sito web: {BUSINESS.website}</p>
            </div>
          </section>

          {/* 2. Responsabile */}
          <section>
            <h2 className="font-heading text-xl text-white mb-3">2. Responsabile del Trattamento</h2>
            <p>
              Il Titolare non ha nominato un Responsabile del Trattamento, in quanto le attività di trattamento dei dati
              non richiedono la figura del responsabile ex Art. 27 del GDPR. Eventuali responsabili saranno indicati
              tempestivamente con aggiornamento della presente policy.
            </p>
          </section>

          {/* 3. DPO */}
          <section>
            <h2 className="font-heading text-xl text-white mb-3">3. Data Protection Officer (DPO)</h2>
            <p>
              Il Titolare <strong className="text-white">non ha nominato un DPO</strong>, in quanto non ricade nei casi
              previsti dall'Art. 37 del Regolamento UE 2016/679 (GDPR), ovvero:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/50">
              <li>Il trattamento non è effettuato da un'autorità pubblica</li>
              <li>Le attività non richiedono monitoraggio regolare e sistematico su larga scala</li>
              <li>Non si effettuano trattamenti su larga scala di dati sensibili o giudiziari</li>
            </ul>
          </section>

          {/* 4. Dati raccolti */}
          <section>
            <h2 className="font-heading text-xl text-white mb-3">4. Dati Personali Raccolti</h2>
            <p className="mb-3">Il sito raccoglie i seguenti dati personali:</p>

            <h3 className="text-white font-semibold mt-4 mb-2">4.1 Dati forniti volontariamente dall'utente</h3>
            <ul className="list-disc list-inside space-y-1 text-white/50">
              <li><strong className="text-white/70">Nome e cognome</strong> — per la gestione degli ordini via WhatsApp</li>
              <li><strong className="text-white/70">Numero di telefono</strong> — per la comunicazione degli ordini</li>
              <li><strong className="text-white/70">Indirizzo email</strong> — per la newsletter (previo consenso esplicito) e conferma ordini</li>
            </ul>

            <h3 className="text-white font-semibold mt-4 mb-2">4.2 Dati di navigazione</h3>
            <ul className="list-disc list-inside space-y-1 text-white/50">
              <li><strong className="text-white/70">Cookie tecnici</strong> — necessari al funzionamento del sito</li>
              <li><strong className="text-white/70">Cookie analitici</strong> — solo previo consenso dell'utente (Google Analytics)</li>
              <li><strong className="text-white/70">Pixel di tracciamento</strong> — solo previo consenso (Meta Pixel)</li>
              <li>Indirizzo IP, tipo di browser, sistema operativo (raccolti in forma anonima e aggregata)</li>
            </ul>

            <h3 className="text-white font-semibold mt-4 mb-2">4.3 Finalità del trattamento</h3>
            <ul className="list-disc list-inside space-y-1 text-white/50">
              <li>Gestione e evasione degli ordini tramite WhatsApp Business</li>
              <li>Invio di newsletter e comunicazioni promozionali (solo previo consenso)</li>
              <li>Analisi statistica del traffico (Google Analytics, in forma anonima)</li>
              <li>Adempimenti di legge</li>
            </ul>
          </section>

          {/* 5. Conservazione */}
          <section>
            <h2 className="font-heading text-xl text-white mb-3">5. Conservazione dei Dati</h2>
            <ul className="list-disc list-inside space-y-1 text-white/50">
              <li><strong className="text-white/70">Dati degli ordini:</strong> conservati per il tempo necessario all'evasione dell'ordine e comunque non oltre 24 mesi</li>
              <li><strong className="text-white/70">Newsletter:</strong> fino alla revoca del consenso (disiscrizione)</li>
              <li><strong className="text-white/70">Cookie analitici:</strong> massimo 12 mesi</li>
              <li><strong className="text-white/70">Dati di navigazione:</strong> in forma aggregata e anonima</li>
            </ul>
          </section>

          {/* 6. Diritti */}
          <section>
            <h2 className="font-heading text-xl text-white mb-3">6. Diritti dell'Interessato</h2>
            <p className="mb-3">Ai sensi degli Artt. 15-22 del GDPR, l'utente ha diritto di:</p>
            <ul className="list-disc list-inside space-y-1 text-white/50">
              <li>Accedere ai propri dati personali</li>
              <li>Richiedere la rettifica o la cancellazione</li>
              <li>Limitare il trattamento</li>
              <li>Richiedere la portabilità dei dati</li>
              <li>Opporsi al trattamento</li>
              <li>Revocare il consenso in qualsiasi momento</li>
              <li>Proporre reclamo al Garante per la Protezione dei Dati Personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">garanteprivacy.it</a>)</li>
            </ul>
            <p className="mt-3">
              Per esercitare i propri diritti, contattare: <strong className="text-white">{BUSINESS.email}</strong>
            </p>
          </section>

          {/* 7. Cookie */}
          <section>
            <h2 className="font-heading text-xl text-white mb-3">7. Cookie Policy</h2>

            <h3 className="text-white font-semibold mt-4 mb-2">7.1 Cosa sono i cookie</h3>
            <p>
              I cookie sono piccoli file di testo che i siti web visitati dall'utente inviano ai loro dispositivi,
              dove vengono memorizzati per essere ritrasmessi agli stessi siti in occasione di visite successive.
            </p>

            <h3 className="text-white font-semibold mt-4 mb-2">7.2 Tipologie di cookie utilizzate</h3>

            <div className="space-y-4 mt-3">
              <div className="bg-white/5 border border-[#2a2725] rounded-xl p-4">
                <p className="text-white font-semibold text-sm">🔧 Cookie Tecnici (necessari)</p>
                <p className="mt-1 text-white/50">
                  Essenziali per il funzionamento del sito. Non richiedono consenso. includono cookie di sessione
                  e cookie per la memorizzazione delle preferenze dell'utente (es. lingua selezionata).
                </p>
              </div>
              <div className="bg-white/5 border border-[#2a2725] rounded-xl p-4">
                <p className="text-white font-semibold text-sm">📊 Cookie Analitici (solo con consenso)</p>
                <p className="mt-1 text-white/50">
                  Google Analytics per analisi statistiche del traffico in forma anonima e aggregata.
                  Vengono attivati solo previo consenso esplicito dell'utente tramite il banner dei cookie.
                </p>
              </div>
              <div className="bg-white/5 border border-[#2a2725] rounded-xl p-4">
                <p className="text-white font-semibold text-sm">📱 Pixel di Tracciamento (solo con consenso)</p>
                <p className="mt-1 text-white/50">
                  Meta Pixel (Facebook) per il monitoraggio delle conversioni e il remarketing.
                  Vengono attivati solo previo consenso esplicito dell'utente.
                </p>
              </div>
            </div>

            <h3 className="text-white font-semibold mt-4 mb-2">7.3 Come gestire i cookie</h3>
            <p>
              L'utente può gestire le proprie preferenze sui cookie attraverso:
            </p>
            <ul className="list-disc list-inside space-y-1 text-white/50 mt-2">
              <li>Il banner dei cookie visualizzato al primo accesso al sito</li>
              <li>Le impostazioni del proprio browser (Chrome, Firefox, Safari, Edge)</li>
              <li>Per i cookie di terze parti: le piattaforme corrispondenti (Google, Meta)</li>
            </ul>

            <h3 className="text-white font-semibold mt-4 mb-2">7.4 Terze parti</h3>
            <p>I seguenti soggetti terzi possono accedere a dati raccolti tramite cookie:</p>
            <ul className="list-disc list-inside space-y-1 text-white/50 mt-2">
              <li><strong className="text-white/70">Google LLC</strong> (Google Analytics) — con sede negli USA. Dati trasferiti con garanzie adeguate (clausole contrattuali standard)</li>
              <li><strong className="text-white/70">Meta Platforms, Inc.</strong> (Meta Pixel) — con sede negli USA. Dati trasferiti con garanzie adeguate</li>
              <li><strong className="text-white/70">Vercel Inc.</strong> (hosting) — con sede negli USA</li>
            </ul>
          </section>

          {/* 8. Newsletter */}
          <section>
            <h2 className="font-heading text-xl text-white mb-3">8. Newsletter</h2>
            <p>
              L'iscrizione alla newsletter avviene previo consenso esplicito (opt-in).
              L'utente può disiscriversi in qualsiasi momento tramite il link presente in ogni email.
              I dati degli iscritti non saranno ceduti a terzi.
            </p>
            <div className="flex items-center gap-2 mt-3 p-3 bg-white/5 border border-[#2a2725] rounded-xl">
              <Mail size={16} className="text-primary shrink-0" />
              <p className="text-white/50 text-xs">
                Per cancellarti dalla newsletter, clicca il link "Disiscriviti" presente in ogni email
                oppure scrivi a: <strong className="text-white">{BUSINESS.email}</strong>
              </p>
            </div>
          </section>

          {/* 9. Trasferimento dati */}
          <section>
            <h2 className="font-heading text-xl text-white mb-3">9. Trasferimento Dati Extra-UE</h2>
            <p>
              Alcuni fornitori di servizi (Google, Meta, Vercel) hanno sede negli Stati Uniti.
              Il trasferimento dei dati avviene sulla base di:
            </p>
            <ul className="list-disc list-inside space-y-1 text-white/50 mt-2">
              <li>Clausole contrattuali standard approvate dalla Commissione Europea</li>
              <li>Adeguatezza del framework EU-US Data Privacy Framework</li>
              <li>Garanzie contrattuali adeguate ex Art. 46 GDPR</li>
            </ul>
          </section>

          {/* 10. Modifiche */}
          <section>
            <h2 className="font-heading text-xl text-white mb-3">10. Modifiche alla Policy</h2>
            <p>
              La presente policy può essere aggiornata. Le modifiche saranno pubblicate su questa pagina
              con la data di ultimo aggiornamento. Si consiglia di consultare periodicamente questa pagina.
            </p>
          </section>

          {/* 11. Riferimenti normativi */}
          <section>
            <h2 className="font-heading text-xl text-white mb-3">11. Riferimenti Normativi</h2>
            <ul className="list-disc list-inside space-y-2 text-white/50">
              <li>
                <strong className="text-white/70">Regolamento (UE) 2016/679</strong> — Regolamento generale sulla protezione dei dati (GDPR)
              </li>
              <li>
                <strong className="text-white/70">D.Lgs. 101/2018</strong> — Adeguamento normativa nazionale al GDPR
              </li>
              <li>
                <strong className="text-white/70">D.Lgs. 196/2003</strong> — Codice in materia di protezione dei dati personali (come modificato dal D.Lgs. 101/2018)
              </li>
              <li>
                <strong className="text-white/70">Provvedimento Garante n. 231/2021</strong> — Linee guida cookie e altri strumenti di tracciamento
              </li>
            </ul>
          </section>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[#2a2725]/30 text-center">
          <p className="text-white/35 text-xs">
            Panificio Da Sergio — {BUSINESS.address} — {BUSINESS.phone}
          </p>
        </div>
      </div>
    </div>
  );
}
