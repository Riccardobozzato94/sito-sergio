import { Shield, ArrowLeft, Mail, Info } from 'lucide-react';
import { BUSINESS } from '../lib/config';

export default function PrivacyPolicy({ onBack }) {
  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-text-dim hover:text-primary transition-colors duration-200 mb-8"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Torna al sito</span>
        </button>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={28} className="text-primary" />
            <h1 className="font-heading text-3xl sm:text-4xl text-primary tracking-tight">
              Privacy & Cookie Policy
            </h1>
          </div>
          <p className="text-text-dim text-sm">
            Ultimo aggiornamento: Luglio 2026
          </p>
          <div className="mt-3 flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl">
            <Info size={16} className="text-primary shrink-0 mt-0.5" />
            <p className="text-text-dim text-xs leading-relaxed">
              Questa policy è conforme al Regolamento (UE) 2016/679 (GDPR), al D.Lgs. 196/2003 (come modificato),
              al Regolamento (UE) 2022/2065 (Digital Services Act), al Regolamento (UE) 2024/1689 (AI Act) laddove applicabile,
              e alle Linee guida del Garante Privacy in materia di cookie e tracciamento. Data di efficacia: Luglio 2026.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 text-text-muted text-sm leading-relaxed">

          {/* 1. Titolare */}
          <section>
            <h2 className="font-heading text-xl text-text mb-3">1. Titolare del Trattamento</h2>
            <div className="bg-white/[0.03] border border-border rounded-xl p-5 space-y-1">
              <p><strong className="text-text">Panificio Da Sergio</strong> di Sergio Tiozzo</p>
              <p>{BUSINESS.address}</p>
              <p>Telefono: {BUSINESS.phone}</p>
              <p>Email: {BUSINESS.email}</p>
              <p>Sito web: {BUSINESS.website}</p>
            </div>
            <p className="mt-3 text-text-dim text-xs">
              Il Titolare del trattamento è la persona fisica o giuridica che determina le finalità e i mezzi del trattamento
              di dati personali. Per qualsiasi comunicazione in materia di privacy, contattare l'indirizzo email sopra indicato.
            </p>
          </section>

          {/* 2. Responsabile */}
          <section>
            <h2 className="font-heading text-xl text-text mb-3">2. Responsabile del Trattamento</h2>
            <p>
              Il Titolare non ha nominato un Responsabile del Trattamento, in quanto le attività di trattamento dei dati
              non richiedono la figura del responsabile ex Art. 27 del GDPR. Eventuali responsabili saranno indicati
              tempestivamente con aggiornamento della presente policy.
            </p>
            <p className="mt-2 text-text-dim">
              I seguenti fornitori di servizi agiscono come Responsabili del Trattamento ai sensi dell'Art. 28 GDPR:
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-text-dim">
              <li><strong className="text-text/80">Supabase Inc.</strong> (database hosting) — San Francisco, USA</li>
              <li><strong className="text-text/80">Vercel Inc.</strong> (hosting sito web) — San Francisco, USA</li>
              <li><strong className="text-text/80">Meta Platforms Ireland Ltd.</strong> (WhatsApp Business API) — Dublino, Irlanda</li>
              <li><strong className="text-text/80">Google Ireland Ltd.</strong> (Google Analytics, Fonts) — Dublino, Irlanda</li>
            </ul>
          </section>

          {/* 3. DPO */}
          <section>
            <h2 className="font-heading text-xl text-text mb-3">3. Data Protection Officer (DPO)</h2>
            <p>
              Il Titolare <strong className="text-text">non ha nominato un DPO</strong>, in quanto non ricade nei casi
              previsti dall'Art. 37 del Regolamento UE 2016/679 (GDPR), ovvero:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-text-dim">
              <li>Il trattamento non è effettuato da un'autorità pubblica</li>
              <li>Le attività non richiedono monitoraggio regolare e sistematico su larga scala</li>
              <li>Non si effettuano trattamenti su larga scala di dati sensibili o giudiziari</li>
            </ul>
            <p className="mt-2 text-text-dim">
              In assenza di DPO, per qualsiasi questione relativa al trattamento dei dati personali è possibile contattare
              direttamente il Titolare all'indirizzo email: <strong className="text-text">{BUSINESS.email}</strong>
            </p>
          </section>

          {/* 4. Dati raccolti */}
          <section>
            <h2 className="font-heading text-xl text-text mb-3">4. Dati Personali Raccolti</h2>
            <p className="mb-3">Il sito raccoglie i seguenti dati personali per le finalità di seguito indicate:</p>

            <h3 className="text-text font-semibold mt-4 mb-2">4.1 Dati forniti volontariamente dall'utente</h3>
            <ul className="list-disc list-inside space-y-1 text-text-dim">
              <li><strong className="text-text/80">Nome e cognome</strong> — necessario per la gestione e l'evasione degli ordini tramite WhatsApp</li>
              <li><strong className="text-text/80">Numero di telefono</strong> — indispensabile per la comunicazione relative agli ordini e per il servizio WhatsApp Business</li>
              <li><strong className="text-text/80">Indirizzo email</strong> — per l'invio della conferma ordine e, previo consenso esplicito separato, per la newsletter informativa</li>
              <li><strong className="text-text/80">Contenuto dei messaggi WhatsApp</strong> — il contenuto delle comunicazioni inviate tramite WhatsApp Business viene memorizzato per finalità di gestione del rapporto con la clientela</li>
            </ul>

            <h3 className="text-text font-semibold mt-4 mb-2">4.2 Dati di navigazione raccolti automaticamente</h3>
            <ul className="list-disc list-inside space-y-1 text-text-dim">
              <li><strong className="text-text/80">Cookie tecnici</strong> — necessari al funzionamento del sito. Non richiedono consenso.</li>
              <li><strong className="text-text/80">Cookie analitici</strong> — attivati solo previo consenso esplicito dell'utente tramite il banner cookie</li>
              <li><strong className="text-text/80">Pixel di tracciamento</strong> — attivati solo previo consenso esplicito (es. Meta Pixel per conversioni)</li>
              <li>Indirizzo IP, tipo di browser, sistema operativo, pagine visitate — raccolti in forma anonima e aggregata per finalità statistiche</li>
            </ul>

            <h3 className="text-text font-semibold mt-4 mb-2">4.3 Finalità del trattamento</h3>
            <ul className="list-disc list-inside space-y-1 text-text-dim">
              <li>Gestione e evasione degli ordini tramite WhatsApp Business API</li>
              <li>Comunicazioni relative agli ordini (conferme, aggiornamenti stato, notifiche di disponibilità)</li>
              <li>Invio di newsletter e comunicazioni promozionali (esclusivamente previo consenso esplicito separato)</li>
              <li>Analisi statistica del traffico in forma aggregata e anonima</li>
              <li>Adempimenti di legge (obblighi fiscali, conservazione documenti contabili)</li>
            </ul>

            <h3 className="text-text font-semibold mt-4 mb-2">4.4 Base giuridica del trattamento</h3>
            <ul className="list-disc list-inside space-y-1 text-text-dim">
              <li><strong className="text-text/80">Esecuzione di un contratto</strong> (Art. 6.1.b GDPR) — per la gestione degli ordini</li>
              <li><strong className="text-text/80">Consenso</strong> (Art. 6.1.a GDPR) — per newsletter, cookie analitici e di marketing</li>
              <li><strong className="text-text/80">Legittimo interesse</strong> (Art. 6.1.f GDPR) — per comunicazioni relative al servizio</li>
              <li><strong className="text-text/80">Obbligo legale</strong> (Art. 6.1.c GDPR) — per adempimenti fiscali e contabili</li>
            </ul>
          </section>

          {/* 5. Conservazione */}
          <section>
            <h2 className="font-heading text-xl text-text mb-3">5. Conservazione dei Dati</h2>
            <p className="mb-3">I dati personali sono conservati per il tempo strettamente necessario al perseguimento delle finalità per cui sono stati raccolti, secondo i seguenti criteri:</p>
            <ul className="list-disc list-inside space-y-1 text-text-dim">
              <li><strong className="text-text/80">Dati degli ordini:</strong> conservati per l'intera durata del rapporto commerciale e, successivamente, per 10 anni dalla data dell'ultimo ordine per finalità fiscali e contabili (ex art. 2220 c.c.)</li>
              <li><strong className="text-text/80">Dati di contatto WhatsApp:</strong> conservati per la durata del rapporto commerciale. La conversazione può essere cancellata su richiesta dell'interessato</li>
              <li><strong className="text-text/80">Newsletter:</strong> fino alla revoca del consenso da parte dell'utente (tramite link "disiscriviti" in ogni email)</li>
              <li><strong className="text-text/80">Cookie analitici:</strong> durata massima 12 mesi dal conferimento del consenso</li>
              <li><strong className="text-text/80">Cookie tecnici:</strong> durata della sessione o fino a 6 mesi per le preferenze</li>
            </ul>
          </section>

          {/* 6. Diritti */}
          <section>
            <h2 className="font-heading text-xl text-text mb-3">6. Diritti dell'Interessato</h2>
            <p className="mb-3">Ai sensi degli Artt. 15-22 del GDPR e del D.Lgs. 196/2003, l'utente ha diritto di:</p>
            <ul className="list-disc list-inside space-y-1 text-text-dim">
              <li><strong className="text-text/80">Accesso</strong> (Art. 15) — ottenere conferma dell'esistenza di dati personali che lo riguardano e riceverne comunicazione</li>
              <li><strong className="text-text/80">Rettifica</strong> (Art. 16) — ottenere la correzione di dati inesatti o l'integrazione di quelli incompleti</li>
              <li><strong className="text-text/80">Cancellazione</strong> (Art. 17) — ottenere la cancellazione dei dati, se sussistono i motivi previsti dal GDPR ("diritto all'oblio")</li>
              <li><strong className="text-text/80">Limitazione</strong> (Art. 18) — ottenere la limitazione del trattamento in specifiche ipotesi</li>
              <li><strong className="text-text/80">Portabilità</strong> (Art. 20) — ricevere i propri dati in formato strutturato e leggibile o richiedere il trasferimento diretto a altro titolare</li>
              <li><strong className="text-text/80">Opposizione</strong> (Art. 21) — opporsi al trattamento per motivi connessi alla propria situazione particolare</li>
              <li><strong className="text-text/80">Revoca del consenso</strong> — in qualsiasi momento, senza pregiudicare la liceità del trattamento basata sul consenso prima della revoca</li>
              <li><strong className="text-text/80">Reclamo</strong> — proporre reclamo al Garante per la Protezione dei Dati Personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">garanteprivacy.it</a>), con sede in Piazza Venezia 11, 00187 Roma</li>
            </ul>
            <p className="mt-3">
              Per esercitare i propri diritti, contattare: <strong className="text-text">{BUSINESS.email}</strong>
            </p>
            <p className="mt-1 text-text-dim text-xs">
              Il Titolare risponderà entro 30 giorni dal ricevimento della richiesta, prorogabile di ulteriori 60 giorni
              in caso di particolare complessità.
            </p>
          </section>

          {/* 7. Cookie */}
          <section>
            <h2 className="font-heading text-xl text-text mb-3">7. Cookie Policy</h2>

            <h3 className="text-text font-semibold mt-4 mb-2">7.1 Cosa sono i cookie</h3>
            <p>
              I cookie sono piccoli file di testo che i siti web visitati dall'utente inviano al terminale dell'utente
              (computer, tablet, smartphone), dove vengono memorizzati per essere ritrasmessi agli stessi siti in occasione
              di visite successive. I cookie possono essere permanenti (rimangono fino alla scadenza prefissata) o di sessione
              (vengono cancellati alla chiusura del browser).
            </p>

            <h3 className="text-text font-semibold mt-4 mb-2">7.2 Tipologie di cookie utilizzate</h3>

            <div className="space-y-4 mt-3">
              <div className="bg-white/[0.03] border border-border rounded-xl p-4">
                <p className="text-text font-semibold text-sm">🔧 Cookie Tecnici (necessari)</p>
                <p className="mt-1 text-text-dim">
                  Essenziali per il funzionamento del sito. Non richiedono consenso preventivo (Art. 122 D.Lgs. 196/2003
                  e Provvedimento Garante n. 231/2021). Includono cookie di sessione per il carrello, cookie per la
                  memorizzazione della lingua selezionata e del consenso ai cookie.
                </p>
              </div>
              <div className="bg-white/[0.03] border border-border rounded-xl p-4">
                <p className="text-text font-semibold text-sm">📊 Cookie Analitici (solo con consenso)</p>
                <p className="mt-1 text-text-dim">
                  Google Analytics per analisi statistiche del traffico in forma anonima e aggregata.
                  Vengono attivati esclusivamente previo consenso esplicito dell'utente tramite il banner dei cookie,
                  in conformità al Provvedimento Garante n. 231/2021.
                </p>
              </div>
              <div className="bg-white/[0.03] border border-border rounded-xl p-4">
                <p className="text-text font-semibold text-sm">📱 Pixel di Tracciamento / Cookie di Marketing (solo con consenso)</p>
                <p className="mt-1 text-text-dim">
                  Meta Pixel (Facebook/Instagram) per il monitoraggio delle conversioni e attività di remarketing.
                  Vengono attivati esclusivamente previo consenso esplicito dell'utente tramite il banner dei cookie.
                  Allo stato attuale questi cookie <strong className="text-text">non sono attivi</strong> in attesa di configurazione.
                </p>
              </div>
            </div>

            <h3 className="text-text font-semibold mt-4 mb-2">7.3 Come gestire i cookie</h3>
            <p>
              L'utente può gestire le proprie preferenze sui cookie attraverso:
            </p>
            <ul className="list-disc list-inside space-y-1 text-text-dim mt-2">
              <li>Il banner dei cookie visualizzato al primo accesso al sito (e accessibile tramite il footer)</li>
              <li>Le impostazioni del proprio browser: Chrome, Firefox, Safari, Edge (solitamente in Impostazioni &gt; Privacy &gt; Cookie)</li>
              <li>Per i cookie di terze parti: i pannelli di controllo delle rispettive piattaforme (Google, Meta)</li>
            </ul>

            <h3 className="text-text font-semibold mt-4 mb-2">7.4 Terze parti che possono accedere ai dati</h3>
            <p>I seguenti soggetti terzi possono accedere a dati raccolti tramite cookie e tecnologie similari:</p>
            <ul className="list-disc list-inside space-y-1 text-text-dim mt-2">
              <li><strong className="text-text/80">Google Ireland Ltd.</strong> (Google Analytics, Google Fonts) — Gordon House, Barrow Street, Dublino 4, Irlanda. Dati trasferiti agli USA con garanzie adeguate (Clausole Contrattuali Standard + EU-US Data Privacy Framework)</li>
              <li><strong className="text-text/80">Meta Platforms Ireland Ltd.</strong> (Meta Pixel) — 4 Grand Canal Square, Grand Canal Harbour, Dublino 2, Irlanda. Dati trasferiti agli USA con garanzie adeguate</li>
              <li><strong className="text-text/80">Vercel Inc.</strong> (hosting del sito) — 340 S Lemon Ave #4133, Walnut, CA 91789, USA. Dati trasferiti con garanzie contrattuali adeguate (DPA conforme Art. 28 GDPR)</li>
              <li><strong className="text-text/80">Supabase Inc.</strong> (database) — San Francisco, CA, USA. Dati trasferiti con garanzie adeguate (DPA + SCC)</li>
            </ul>
          </section>

          {/* 8. WhatsApp Business */}
          <section>
            <h2 className="font-heading text-xl text-text mb-3">8. WhatsApp Business</h2>
            <p>
              Il sito utilizza WhatsApp Business API (fornita da Meta Platforms Ireland Ltd.) per la comunicazione
              con i clienti in relazione agli ordini. WhatsApp Business è un servizio di messaggistica che consente
              al Titolare di comunicare direttamente con gli utenti.
            </p>
            <div className="mt-3 space-y-2 text-text-dim">
              <p><strong className="text-text">Dati trattati:</strong> numero di telefono, nome, contenuto dei messaggi, stato della consegna dei messaggi.</p>
              <p><strong className="text-text">Finalità:</strong> gestione degli ordini, comunicazioni relative al servizio, conferma e aggiornamento stato ordini.</p>
              <p><strong className="text-text">Base giuridica:</strong> esecuzione di un contratto (Art. 6.1.b GDPR) e legittimo interesse del Titolare (Art. 6.1.f GDPR).</p>
              <p><strong className="text-text">Conservazione:</strong> le conversazioni WhatsApp sono conservate per la durata del rapporto commerciale e cancellate su richiesta dell'interessato.</p>
            </div>
            <p className="mt-3 text-text-dim text-xs">
              Per maggiori informazioni sul trattamento dei dati da parte di Meta/WhatsApp, consultare la
              <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"> Privacy Policy di WhatsApp</a>.
            </p>
          </section>

          {/* 9. Newsletter */}
          <section>
            <h2 className="font-heading text-xl text-text mb-3">9. Newsletter</h2>
            <p>
              L'iscrizione alla newsletter avviene esclusivamente previo consenso esplicito e specifico (opt-in).
              L'utente ha diritto di revocare il consenso in qualsiasi momento tramite il link "disiscriviti"
              presente in ogni comunicazione email.
            </p>
            <p className="mt-2 text-text-dim">
              I dati raccolti per la newsletter (nome e indirizzo email) saranno utilizzati esclusivamente per
              l'invio di comunicazioni periodiche relative a prodotti, promozioni e novità del Panificio Da Sergio.
              I dati non saranno ceduti a terzi né utilizzati per altre finalità.
            </p>
            <div className="flex items-center gap-2 mt-3 p-3 bg-white/[0.03] border border-border rounded-xl">
              <Mail size={16} className="text-primary shrink-0" />
              <p className="text-text-dim text-xs">
                Per cancellarti dalla newsletter, clicca il link "Disiscriviti" presente in ogni email
                oppure scrivi a: <strong className="text-text">{BUSINESS.email}</strong>
              </p>
            </div>
          </section>

          {/* 10. Trasferimento Dati Extra-UE */}
          <section>
            <h2 className="font-heading text-xl text-text mb-3">10. Trasferimento Dati Extra-UE</h2>
            <p>
              Alcuni fornitori di servizi utilizzati dal presente sito hanno sede al di fuori dello Spazio Economico
              Europeo (SEE), in particolare negli Stati Uniti. Il trasferimento dei dati personali verso Paesi terzi
              avviene sulla base delle seguenti garanzie:
            </p>
            <ul className="list-disc list-inside space-y-1 text-text-dim mt-2">
              <li><strong className="text-text/80">Decisione di adeguatezza</strong> — EU-US Data Privacy Framework (DPF) — Decisione di esecuzione (UE) 2023/1795 della Commissione Europea del 10 luglio 2023, che certifica un livello di protezione sostanzialmente equivalente a quello garantito nel SEE per le organizzazioni certificate DPF</li>
              <li><strong className="text-text/80">Clausole Contrattuali Standard (SCC)</strong> — Approvate dalla Commissione Europea con Decisione di esecuzione (UE) 2021/914 del 4 giugno 2021, costituiscono garanzie adeguate ai sensi dell'Art. 46 GDPR</li>
              <li><strong className="text-text/80">Norme Vincolanti d'Impresa (BCR)</strong> — Laddove applicabili per i fornitori che ne dispongono</li>
              <li><strong className="text-text/80">DPA (Data Processing Agreement)</strong> — Sottoscritto con ciascun fornitore, conforme ai requisiti dell'Art. 28 GDPR</li>
            </ul>
          </section>

          {/* 11. Digital Services Act (DSA) */}
          <section>
            <h2 className="font-heading text-xl text-text mb-3">11. Conformità al Digital Services Act (DSA)</h2>
            <p>
              Il presente sito web, gestito dal Panificio Da Sergio, opera come "destinatario di servizi di intermediazione"
              ai sensi del Regolamento (UE) 2022/2065 (Digital Services Act). In conformità al DSA:
            </p>
            <ul className="list-disc list-inside space-y-1 text-text-dim mt-2">
              <li>Il Titolare non svolge attività di intermediazione di contenuti generati da terzi utenti</li>
              <li>Non vengono utilizzati sistemi di raccomandazione algoritmica che profilano gli utenti</li>
              <li>Le inserzioni pubblicitarie non sono basate su tecniche di profilazione (nessuna pubblicità comportamentale)</li>
              <li>Il punto di contatto unico per le autorità e gli utenti è: <strong className="text-text">{BUSINESS.email}</strong></li>
              <li>Non si rientra nella definizione di "piattaforma online di grandi dimensioni" o "motore di ricerca di grandi dimensioni" (VLOP/VLOSE)</li>
            </ul>
          </section>

          {/* 12. AI Act */}
          <section>
            <h2 className="font-heading text-xl text-text mb-3">12. Conformità all'AI Act (Regolamento UE 2024/1689)</h2>
            <p>
              Il Regolamento (UE) 2024/1689 (Artificial Intelligence Act) introduce requisiti per i sistemi di IA
              in base al livello di rischio. Con riferimento al presente sito web:
            </p>
            <ul className="list-disc list-inside space-y-1 text-text-dim mt-2">
              <li><strong className="text-text/80">Il Titolare NON utilizza sistemi di IA</strong> per il trattamento dei dati personali degli utenti</li>
              <li>Non vengono impiegati sistemi di IA per profilazione, categorizzazione o decisioni automatizzate</li>
              <li>Non vengono utilizzati sistemi di IA generativa per interagire con gli utenti</li>
              <li>Nessun sistema di IA rientrante nelle categorie di "rischio inaccettabile" o "rischio alto" è impiegato</li>
              <li>Il sito non utilizza sistemi di riconoscimento biometrico, categorizzazione biometrica, o sistemi di credito sociale</li>
            </ul>
            <p className="mt-2 text-text-dim">
              Qualora in futuro dovessero essere introdotti sistemi di IA, la presente policy sarà aggiornata
              per includere le informazioni richieste dall'Art. 50 del Regolamento (trasparenza) e l'eventuale
              documentazione tecnica richiesta.
            </p>
          </section>

          {/* 13. Processo decisionale automatizzato */}
          <section>
            <h2 className="font-heading text-xl text-text mb-3">13. Processo Decisionale Automatizzato</h2>
            <p>
              Il sito <strong className="text-text">non utilizza</strong> processi decisionali automatizzati,
              compresa la profilazione, che producano effetti giuridici o significativi per l'utente ai sensi
              dell'Art. 22 del GDPR. Tutte le comunicazioni relative agli ordini sono gestite manualmente dal
              Titolare tramite WhatsApp Business.
            </p>
          </section>

          {/* 14. Dati di minori */}
          <section>
            <h2 className="font-heading text-xl text-text mb-3">14. Dati di Minori</h2>
            <p>
              Il sito non è destinato a minori di 16 anni. Il Titolare non raccoglie consapevolmente dati personali
              di minori. Qualora venisse accertato che dati di un minore sono stati raccolti senza il consenso
              dei genitori o tutori, il Titolare provvederà alla loro cancellazione tempestiva.
            </p>
          </section>

          {/* 15. Modifiche */}
          <section>
            <h2 className="font-heading text-xl text-text mb-3">15. Modifiche alla Policy</h2>
            <p>
              La presente policy può essere aggiornata periodicamente per riflettere modifiche normative,
              evoluzione del sito o cambiamenti nelle pratiche di trattamento dei dati. Le modifiche saranno
              pubblicate su questa pagina con la data di ultimo aggiornamento. Si consiglia di consultare
              periodicamente questa pagina. In caso di modifiche sostanziali, gli utenti saranno informati
              tramite avviso sul sito.
            </p>
          </section>

          {/* 16. Riferimenti normativi */}
          <section>
            <h2 className="font-heading text-xl text-text mb-3">16. Riferimenti Normativi Completi</h2>
            <ul className="list-disc list-inside space-y-2 text-text-dim">
              <li>
                <strong className="text-text/80">Regolamento (UE) 2016/679</strong> — Regolamento generale sulla protezione dei dati (GDPR)
              </li>
              <li>
                <strong className="text-text/80">D.Lgs. 101/2018</strong> — Disposizioni per l'adeguamento della normativa nazionale al GDPR
              </li>
              <li>
                <strong className="text-text/80">D.Lgs. 196/2003</strong> — Codice in materia di protezione dei dati personali (come modificato dal D.Lgs. 101/2018)
              </li>
              <li>
                <strong className="text-text/80">Provvedimento Garante n. 231/2021</strong> — Linee guida in materia di cookie e altri strumenti di tracciamento
              </li>
              <li>
                <strong className="text-text/80">Provvedimento Garante n. 282/2023</strong> — Chiarimenti in materia di cookie wall e consenso
              </li>
              <li>
                <strong className="text-text/80">Regolamento (UE) 2022/2065</strong> — Digital Services Act (DSA)
              </li>
              <li>
                <strong className="text-text/80">Regolamento (UE) 2024/1689</strong> — Artificial Intelligence Act (AI Act)
              </li>
              <li>
                <strong className="text-text/80">Decisione di esecuzione (UE) 2023/1795</strong> — EU-US Data Privacy Framework (DPF)
              </li>
              <li>
                <strong className="text-text/80">Decisione di esecuzione (UE) 2021/914</strong> — Clausole Contrattuali Standard per il trasferimento dati extra-UE
              </li>
              <li>
                <strong className="text-text/80">Regolamento (UE) 2023/2854</strong> — Data Act (applicabile dal settembre 2025)
              </li>
            </ul>
          </section>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="text-center">
            <p className="text-text-dim text-xs">
              Panificio Da Sergio — {BUSINESS.address} — {BUSINESS.phone} — {BUSINESS.email}
            </p>
            <p className="text-text-dim text-[10px] mt-2">
              Privacy Policy aggiornata al Luglio 2026. Conforme a GDPR, D.Lgs. 196/2003, DSA, AI Act, DPF e Provvedimenti Garante Privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
