// Modulo 10 — assistenza domiciliare integrata (ADI): «come la chiedo all'ASP?».
// Prima la risposta: la pagina mostra subito la risposta scritta; percorso e consigli pratici partono dai pulsanti.
// Non c'è un numero di giorni fissato dalla legge: spieghiamo i passi e, se nessuno viene,
// prepariamo un sollecito al distretto. Non chiediamo la malattia.
import { todayISO, formatIt, parseDate, daysBetween, addDays, art } from './engine.js';
import { genericRequest, mailtoHref } from './letters.js';
import { noPecBox, esc, loadJSON, loadRegional, disclaimer, renderFooter, copyText, printText, readForm, mailLink, aspCalls, personFields, reportErrorHref, generalContact, aslLabel, regioneInfo, inRegione, regioneLink, aslIntestazione } from './common.js';
import { createFlow, choice, restartBtn, days, progress, dateForm, showError, letterButtons } from './flow.js';

const ROOT = '../';
const app = document.getElementById('app');
// La risposta scritta della pagina: è la prima schermata del percorso.
const answerHtml = app.innerHTML;
let rules;
let data;
const state = {};
const person = {};
const asp = () => data.asl.find((a) => a.id === state.province);

function sources() {
  const a = state.province ? asp() : null;
  const items = [...rules.sources];
  if (a) { if (a.info_url) items.push({ label: `${a.name} – sito ufficiale`, url: a.info_url }); items.push(...a.sources); }
  return [items, { verified: rules.last_verified, note: a ? 'I contatti dei PUA dei distretti sono ancora da raccogliere.' : '' }];
}

const steps = () => `
  <h2>Come si chiede</h2>
  <ol class="big-steps">
    <li><strong>Parla con il medico di famiglia.</strong> È lui che compila la richiesta di assistenza domiciliare e la manda al distretto. Se la persona è in ospedale, chiedi al reparto la <strong>«dimissione protetta»</strong>: la richiesta parte dall'ospedale prima che torni a casa.</li>
    <li><strong>La richiesta arriva al PUA</strong> (Punto Unico di Accesso) del distretto dell'${aslLabel()}. Chiedi al medico una copia o il numero della richiesta, con la data.</li>
    <li><strong>Una équipe viene a casa</strong> per la valutazione (si chiama UVM) e scrive il piano: quante volte a settimana, quali figure (infermiere, fisioterapista, medico, operatore).</li>
    <li><strong>Iniziano le visite a casa.</strong> È tutto <strong>gratuito</strong>.</li>
  </ol>
  <details class="card">
    <summary>Cosa comprende e cosa no</summary>
    <ul class="clean">
      <li>Comprende: medicazioni, prelievi, terapie, fisioterapia, controllo di cateteri e sondini, educazione dei familiari.</li>
      <li>Non comprende la badante né l'aiuto per pulizie e spesa: per quelli si chiede al <strong>Comune</strong> (servizio sociale, SAD) e, se c'è l'invalidità, l'indennità di accompagnamento.</li>
      <li>Per i malati gravi in fase avanzata esistono le <a href="../cure-palliative/">cure palliative a casa</a>.</li>
    </ul>
  </details>`;

const screens = {
  // Prima schermata: la risposta scritta che è già nella pagina (vedi index.html).
  // Così «Ricomincia» e il tasto Indietro riportano alla risposta, non a una presentazione.
  intro: () => ({ html: answerHtml }),

  // Consigli pratici: uguali in tutta la Sicilia, non serve la provincia.
  tips: () => ({
    html: `
      <div class="hero" aria-hidden="true">📋</div>
      <h1>Consigli pratici</h1>
      <p class="lead">Le cose da sapere per curare una persona a casa. Tocca un titolo per aprirlo.</p>

      <details class="card">
        <summary>🩹 Serve solo una medicazione o una puntura</summary>
        <ul class="clean">
          <li>Per una cosa semplice (una medicazione, le iniezioni, il cambio del catetere) non serve tutta l'assistenza domiciliare: esistono le <strong>cure domiciliari di base</strong>, senza la visita della équipe.</li>
          <li>Si chiede sempre al <strong>medico di famiglia</strong>: manda lui la richiesta al distretto.</li>
          <li>Chiedi al medico se c'è qualcosa da pagare e quanto tempo ci vuole: cambia da una zona all'altra.</li>
        </ul>
      </details>

      <details class="card">
        <summary>🧪 Il prelievo del sangue a casa</summary>
        <ul class="clean">
          <li><strong>Con l'${aslLabel()}:</strong> il medico di famiglia scrive sulla ricetta che la persona <strong>non può camminare e non può essere trasportata</strong>. Poi chiedi al medico o al PUA del distretto come mandarla. Ad Enna, per esempio, dal 2026 lo fa la Casa della Comunità.</li>
          <li><strong>Da privato:</strong> con la ricetta, chiama un laboratorio (meglio se convenzionato con l'${aslLabel()}) e chiedi se fa prelievi a casa. Di solito si paga a parte la venuta a casa, anche se sei esente dal ticket. Chiedi il prezzo prima.</li>
        </ul>
      </details>

      <details class="card">
        <summary>🧑 Prendere un infermiere privato</summary>
        <ul class="clean">
          <li><strong>Controlla che sia davvero infermiere:</strong> deve essere iscritto all'albo. Lo puoi vedere su internet: scegli la provincia e scrivi il nome. <a href="https://www.fnopi.it/gli-ordini-provinciali/ricerca-albo/" target="_blank" rel="noopener">💻 Cerca nell'albo degli infermieri (FNOPI)</a></li>
          <li><strong>Chi fa cosa:</strong> l'<strong>infermiere</strong> fa punture, flebo, medicazioni e catetere. L'<strong>OSS</strong> (operatore socio-sanitario) aiuta a lavarsi, vestirsi e muoversi, ma non fa le cure. La <strong>badante</strong> fa compagnia e aiuta in casa.</li>
          <li><strong>Puoi scaricare dalle tasse il 19%</strong> di quello che spendi per l'infermiere, anche senza ricetta. Servono due cose: la <strong>fattura</strong>, con scritto «infermiere» e cosa ha fatto, e il <strong>pagamento con carta, bancomat o bonifico</strong>. Se paghi in contanti, non puoi scaricarlo.</li>
          <li>Il 19% si calcola solo sulla parte che <strong>supera 129,11 euro</strong>. Questi 129,11 euro si tolgono una volta sola all'anno, sommando tutte le spese mediche della famiglia fiscale: per esempio, se in un anno spendi 1.129,11 euro, scarichi il 19% di 1.000 euro, cioè 190 euro.</li>
          <li>Anche la badante si può scaricare, per chi non è autosufficiente e con alcuni limiti. Chiedi a un CAF o a un patronato.</li>
        </ul>
      </details>

      <details class="card">
        <summary>🏥 Prima di uscire dall'ospedale</summary>
        <p>Se la persona torna a casa e non è autonoma, chiedi al reparto la <strong>dimissione protetta</strong>: l'ospedale avvisa il distretto prima dell'uscita, così l'aiuto a casa parte subito. Prima di uscire chiedi:</p>
        <ul class="clean">
          <li>la <strong>lettera di dimissione</strong>, con le medicine scritte bene: nome, quanto e a che ora;</li>
          <li>le <strong>prime medicine</strong> dalla farmacia dell'ospedale;</li>
          <li>le ricette per <strong>letto, materasso, carrozzina</strong>, cateteri, medicazioni e, se serve, <strong>ossigeno</strong>;</li>
          <li>le <strong>visite di controllo</strong> già prenotate;</li>
          <li>il <strong>nome e il telefono</strong> di chi seguirà la persona a casa;</li>
          <li>come tornare a casa, se la persona non cammina.</li>
        </ul>
      </details>

      <details class="card">
        <summary>🫁 L'ossigeno a casa</summary>
        <ul class="clean">
          <li><strong>Le bombole</strong> le può prescrivere anche il medico di famiglia, con la ricetta. Si prendono in farmacia.</li>
          <li><strong>Per l'ossigeno ogni giorno</strong> (ossigeno liquido o apparecchio) serve il <strong>piano terapeutico</strong> dello specialista, di solito il pneumologo. Poi lo porta a casa la ditta scelta dall'${aslLabel()}.</li>
          <li>Se l'ossigeno non arriva, chiama il servizio farmaceutico dell'${aslLabel()} o l'URP.</li>
        </ul>
      </details>

      <details class="card">
        <summary>🚚 Il trasporto per la dialisi</summary>
        <ul class="clean">
          ${regioneLink('dialisi') ? `<li>${esc(inRegione().replace(/^./, (c) => c.toUpperCase()))} il trasporto per la dialisi lo <strong>paga l'${aslLabel()}</strong>. Lo fanno associazioni e ditte iscritte in un elenco della Regione.</li>
          <li>Se vai con la tua auto, l'${aslLabel()} ti <strong>rimborsa i chilometri</strong> da casa al centro dialisi.</li>`
    : `<li>Chi paga il trasporto per la dialisi, e se rimborsa i chilometri con la tua auto, lo decide la Regione: chiedi al centro dialisi o al distretto dell'${aslLabel()}.</li>`}
          <li>Serve un certificato del medico di famiglia. Chiedi al centro dialisi come fare la domanda.</li>
          <li>Per le altre visite, il trasporto in ambulanza è gratis solo nelle emergenze (112). Per una visita programmata, chiedi prima al distretto chi paga.</li>
        </ul>
        ${regioneLink('dialisi') ? `<p><a href="${esc(regioneLink('dialisi'))}" target="_blank" rel="noopener">💻 Elenco della Regione per il trasporto dei dializzati</a></p>` : ''}
      </details>

      <p>Per i numeri del PUA e della guardia medica: <a href="../numeri-utili/">📞 Numeri utili</a>.</p>
      <button type="button" class="btn primary" data-go="province">▶️ Come chiedere l'assistenza a casa</button>
      ${disclaimer(rules.last_verified)}`,
  }),

  province: () => ({
    html: `${progress(1, 2)}
      <h1>📍 Dove abita la persona?</h1>
      <div class="grid2">${[...data.asl].sort((a, b) => a.province.localeCompare(b.province)).map((a) => choice('', a.province, { province: a.id }, 'stage')).join('')}</div>`,
  }),

  stage: () => ({
    html: `${progress(2, 2)}
      <h1>A che punto sei?</h1>
      ${choice('❓', 'Non ho ancora chiesto niente', { stage: 'none' }, 'howto')}
      ${choice('🧾', 'Il medico ha mandato la richiesta e aspetto', { stage: 'requested' }, 'date')}
      ${choice('⏸️', 'L\'assistenza c\'era ma si è interrotta o è troppo poca', { stage: 'reduced' }, 'reduced')}`,
  }),

  howto: () => ({
    html: `
      <div class="hero" aria-hidden="true">👨‍⚕️</div>
      <h1>Si parte dal medico di famiglia</h1>
      ${steps()}
      ${aspCalls(asp(), ['casa'])}
      <p>Quando la richiesta è partita, torna qui con la data: ti diciamo quando sollecitare.</p>
      ${disclaimer(rules.last_verified)}
      ${restartBtn()}`,
  }),

  reduced: () => {
    const a = asp();
    return {
      html: `
        <div class="hero" aria-hidden="true">⏸️</div>
        <h1>Se l'assistenza si ferma o non basta</h1>
        <ol class="big-steps">
          <li><strong>Chiedi al medico di famiglia</strong> di chiedere una nuova valutazione (rivalutazione) al distretto: il piano si può aumentare.</li>
          <li><strong>Chiama il PUA del distretto</strong> e chiedi perché si è interrotta e quando riprende. Segnati nome e data.</li>
          <li><strong>Se non cambia niente:</strong> reclamo all'URP dell'${aslLabel()} di ${esc(a.province)}${generalContact(a) ? ` (${mailLink(generalContact(a))})` : ''}. Puoi usare la lettera qui sotto.</li>
        </ol>
        ${aspCalls(a, ['casa'])}
        <button type="button" class="btn primary" data-go="letter">✍️ Scriviamo la lettera insieme</button>
        ${disclaimer(rules.last_verified)}`,
    };
  },

  date: () => ({
    html: `
      <h1>🧾 Che giorno è partita la richiesta?</h1>
      <p>Il giorno in cui il medico l'ha mandata al distretto, o in cui l'ospedale ha fatto la dimissione protetta.</p>
      ${dateForm({ id: 'req-form', name: 'requestDate', label: 'Giorno della richiesta', value: state.requestDate, button: '✔️ Controlla', max: todayISO() })}`,
    mount() {
      document.getElementById('req-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = readForm(e.target);
        if (!parseDate(v.requestDate)) return showError('req-form', 'Scrivi il giorno.');
        if (daysBetween(v.requestDate, todayISO()) < 0) return showError('req-form', 'Questo giorno non è ancora arrivato. Controlla la data.');
        state.requestDate = v.requestDate;
        flow.go('result');
      });
    },
  }),

  result: () => {
    const a = asp();
    const waited = daysBetween(state.requestDate, todayISO());
    const remindOn = addDays(state.requestDate, rules.reminder_after_days);
    // Il giorno stesso della scadenza si può già sollecitare. Prima, niente sollecito:
    // la lettera direbbe «non è stata effettuata la valutazione» troppo presto.
    const late = waited >= rules.reminder_after_days;
    return {
      html: `
        <div class="hero" aria-hidden="true">${late ? '⚠️' : '⏳'}</div>
        <h1>${late ? 'Aspetti da troppo: sollecita' : 'La richiesta è partita'}</h1>
        <div class="notice ${late ? 'bad' : 'info'}">
          <p>Hai fatto la richiesta ${art('il', state.requestDate)}${esc(formatIt(state.requestDate))}: sono passati <strong>${days(waited)}</strong>.</p>
          <p>La legge non fissa un numero di giorni per la valutazione a casa. ${late
            ? `Ma ${rules.reminder_after_days} giorni senza notizie sono troppi: è il momento di sollecitare.`
            : `Se entro ${art('il', remindOn)}<strong>${esc(formatIt(remindOn))}</strong> nessuno ti ha chiamato, torna qui per sollecitare.`}</p>
        </div>
        <h2>Cosa fare</h2>
        <ol class="big-steps">
          <li><strong>Chiama il PUA del distretto</strong> e chiedi a che punto è la richiesta. Se non sai il numero, chiama l'${aslLabel()} e chiedi del PUA del tuo comune.</li>
          <li><strong>Chiedi al medico di famiglia</strong> di sollecitare anche lui: la sua telefonata pesa.</li>
          ${late ? `<li><strong>Manda un sollecito scritto</strong> al distretto e all'URP dell'${aslLabel()} di ${esc(a.province)}. Lo scriviamo insieme.</li>` : ''}
        </ol>
        ${aspCalls(a, ['casa'])}
        ${late ? '<button type="button" class="btn primary" data-go="letter">✍️ Scriviamo il sollecito insieme</button>' : ''}
        ${disclaimer(rules.last_verified)}`,
    };
  },

  letter: () => {
    const a = asp();
    const to = generalContact(a);
    const isReminder = state.stage === 'requested';
    return {
      html: `
        <h1>✍️ ${isReminder ? 'Scriviamo il sollecito insieme' : 'Scriviamo la lettera insieme'}</h1>
        <p>Scrivi i dati qui sotto. Noi li mettiamo nella lettera per il distretto dell'${aslLabel()} di ${esc(a.province)}.</p>
        <div class="notice info"><p>🔒 I dati restano sul tuo telefono. Non chiediamo la malattia. Non sai qualcosa? Lascia vuoto e scrivilo a penna.</p></div>
        <form id="letter-form" novalidate>
          <fieldset>
            <legend>La richiesta</legend>
            <label for="f-district">Comune o distretto<span class="hint">Per esempio «Distretto di Bagheria»</span></label>
            <input id="f-district" name="district" type="text" value="${esc(state.district || '')}">
            <label for="f-doctor">Nome del medico di famiglia<span class="hint">Se lo vuoi scrivere</span></label>
            <input id="f-doctor" name="doctor" type="text" value="${esc(state.doctor || '')}">
          </fieldset>
          ${personFields(person, 'La persona che ha bisogno di assistenza')}
        </form>
        <h2>📄 Ecco la lettera</h2>
        <div id="preview" class="letter"></div>
        ${letterButtons()}
        <p id="send-hint"></p>
        ${noPecBox()}
        <div class="card"><h3 style="margin-top:0">Prima di mandarla</h3>
          <ul class="icon-list">
            <li><span class="ico" aria-hidden="true">🖊️</span> Firma la lettera</li>
            <li><span class="ico" aria-hidden="true">🪪</span> Allega: documento d'identità (fotocopia o foto)</li>
            <li><span class="ico" aria-hidden="true">📄</span> Allega: copia della richiesta del medico, se ce l'hai</li>
            <li class="delegate-note"${person.isDelegate ? '' : ' hidden'}><span class="ico" aria-hidden="true">📝</span> Allega: la delega firmata e il tuo documento</li>
          </ul></div>
        <p class="muted"><a href="${esc(reportErrorHref(`Assistenza domiciliare ${a.name}`))}">Segnala un errore</a></p>
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
      mount() {
        const form = document.getElementById('letter-form');
        const update = () => {
          const v = readForm(form);
          for (const k of ['district', 'doctor']) { state[k] = v[k]; delete v[k]; }
          Object.assign(person, v);
          form.querySelector('.delegate-fields').hidden = !person.isDelegate;
          document.querySelectorAll('.delegate-note').forEach((li) => { li.hidden = !person.isDelegate; });
          const premise = isReminder
            ? [`in data ${formatIt(state.requestDate)} il medico di medicina generale${state.doctor ? ` (dott. ${state.doctor})` : ''} ha inoltrato richiesta di attivazione dell'assistenza domiciliare integrata`,
               'alla data odierna non è stata effettuata la valutazione domiciliare né è pervenuta alcuna comunicazione',
               'le cure domiciliari rientrano nei livelli essenziali di assistenza (art. 22 DPCM 12/01/2017)']
            : ['è in carico al servizio di assistenza domiciliare integrata del distretto',
               'l\'assistenza è stata interrotta o ridotta senza una nuova valutazione',
               'le cure domiciliari rientrano nei livelli essenziali di assistenza (art. 22 DPCM 12/01/2017)'];
          const text = genericRequest({
            to: `${aslIntestazione()} di ${a.province}\n${state.district ? `Distretto – ${state.district} – ` : ''}Punto Unico di Accesso\ne p.c. Ufficio Relazioni con il Pubblico`,
            address: to, person,
            subject: isReminder ? `SOLLECITO – Attivazione assistenza domiciliare integrata (richiesta ${art('del', state.requestDate)}${formatIt(state.requestDate)})` : 'Richiesta di rivalutazione del piano di assistenza domiciliare integrata',
            premise,
            request: isReminder
              ? 'la valutazione domiciliare e l\'attivazione dell\'assistenza nel più breve tempo possibile, e di essere informato/a per iscritto sui tempi previsti.'
              : 'una nuova valutazione domiciliare (UVM) e il ripristino o l\'adeguamento del piano di assistenza, e di essere informato/a per iscritto sui tempi previsti.',
            attachments: ['copia del documento di identità', 'copia della richiesta del medico, se disponibile'],
            today: todayISO(),
          });
          state.letterText = text;
          document.getElementById('preview').textContent = text;
          document.getElementById('mail-btn').href = mailtoHref(to, `${isReminder ? 'Sollecito' : 'Richiesta'} assistenza domiciliare${person.fullName ? ` – ${person.fullName}` : ''}`,
            `Buongiorno,\nin allegato la lettera firmata, con i documenti.\n\nCordiali saluti\n${person.fullName || ''}`);
          document.getElementById('send-hint').innerHTML = to
            ? `📧 L'email si apre indirizzata a ${esc(to)}${to === a.pec || /@pec\./.test(to) ? ' (è una PEC: se non hai la PEC, consegna la lettera a mano al distretto o all\'URP)' : ''}. Chiedi sempre una ricevuta.`
            : `🏥 <strong>Stampa la lettera e consegnala al PUA del distretto o all'URP dell'${aslLabel()}.</strong> Fatti dare una ricevuta con la data.`;
        };
        form.addEventListener('input', update); form.addEventListener('change', update); update();
        document.getElementById('copy-btn').addEventListener('click', (e) => copyText(state.letterText, e.currentTarget));
        document.getElementById('pdf-btn').addEventListener('click', () => printText(state.letterText));
      },
    };
  },
};

let flow;
(async function init() {
  renderFooter(ROOT);
  try { [rules, data] = await Promise.all([loadJSON(`${ROOT}data/rules-domiciliare.json`), loadRegional(ROOT, 'asl')]); } catch {
    app.innerHTML = '<div class="notice bad"><p>Non riusciamo a caricare la pagina. Riprova tra poco.</p></div>'; return;
  }
  flow = createFlow({ app, screens, state, sources, person });
  flow.render();
})();
