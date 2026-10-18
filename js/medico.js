// Modulo 13 — scegliere o cambiare il medico di famiglia o il pediatra.
// Regole nazionali (età) + canale di ogni ASP. Lettera all'ASP se non si trova un pediatra.
import { medicoChoice, todayISO } from './engine.js';
import { genericRequest, mailtoHref } from './letters.js';
import {
  noPecBox, esc, loadJSON, disclaimer, renderFooter, copyText, printText, readForm, aspCalls, officeBox, personFields, reportErrorHref, generalContact,
} from './common.js';
import { createFlow, choice, restartBtn, progress, letterButtons } from './flow.js';

const ROOT = '../';
const app = document.getElementById('app');
let rules;
let data;
const state = {};
const person = {};
const asp = () => data.asl.find((a) => a.id === state.province);

function sources() {
  const a = state.province ? asp() : null;
  const items = [...rules.sources];
  if (a) {
    if (a.scelta_medico.url) items.push({ label: `${a.name} – scelta del medico`, url: a.scelta_medico.url });
    if (a.info_url) items.push({ label: `${a.name} – sito ufficiale`, url: a.info_url });
  }
  return [items, { verified: rules.last_verified, note: a ? 'Il modo di fare la scelta online cambia da ASP ad ASP: chiedi conferma allo sportello.' : '' }];
}

const bring = `
  <h2 class="say">Cosa portare</h2>
  <ul class="icon-list say">
    <li><span class="ico" aria-hidden="true">💳</span> Tessera sanitaria</li>
    <li><span class="ico" aria-hidden="true">🪪</span> Documento d'identità (per un bambino, quello del genitore)</li>
    <li><span class="ico" aria-hidden="true">📝</span> Se vai per un'altra persona: la sua delega firmata e il suo documento</li>
  </ul>`;

function whoText() {
  const c = medicoChoice(rules, { age: state.age });
  if (c === 'pediatra') return `Fino a ${rules.pediatra_only_until} anni il bambino deve avere il <strong>pediatra</strong>.`;
  if (c === 'pediatra-o-medico') return `Tra ${rules.pediatra_only_until} e ${rules.pediatra_or_medico_until - 1} anni puoi scegliere il <strong>pediatra</strong> o il <strong>medico di famiglia</strong>.`;
  return `Dai ${rules.pediatra_or_medico_until} anni si passa al <strong>medico di famiglia</strong>. Il pediatra si può tenere fino a ${rules.pediatra_extension_until} anni solo in casi particolari (per esempio malattie croniche): chiedi allo sportello.`;
}

const ageBands = { '0-5': 2, '6-13': 10, '14-15': 14, '16+': 40 };

// Sportelli «scelta e revoca» del distretto (contacts con topic «anagrafe»).
const sportelli = (a) => officeBox(a, 'anagrafe', '📍 Gli sportelli «scelta e revoca»', 'Vai a quello del distretto dove abiti. Spesso è lo stesso sportello delle esenzioni dal ticket.');

const screens = {
  intro: () => ({
    html: `
      <div class="hero" aria-hidden="true">👨‍⚕️</div>
      <h1>Scegliere o cambiare il medico di famiglia o il pediatra</h1>
      <p class="lead say">Puoi cambiare medico quando vuoi, anche senza dire il motivo. Ti diciamo come si fa nella tua provincia e cosa fare se non trovi posto.</p>
      <button type="button" class="btn primary big" data-go="province">▶️ Comincia</button>
      <p class="muted say">È gratis. Non salviamo niente.</p>`,
  }),

  province: () => ({
    html: `${progress(1, 3)}
      <h1>📍 Dove abita la persona?</h1>
      <div class="grid2">${[...data.asl].sort((a, b) => a.province.localeCompare(b.province)).map((a) => choice('', a.province, { province: a.id }, 'who')).join('')}</div>`,
  }),

  who: () => ({
    html: `${progress(2, 3)}
      <h1>👤 Per chi è?</h1>
      ${choice('👶', 'Un bambino sotto i 6 anni', { ageBand: '0-5', age: ageBands['0-5'] }, 'situation')}
      ${choice('🧒', 'Un bambino o ragazzo da 6 a 13 anni', { ageBand: '6-13', age: ageBands['6-13'] }, 'situation')}
      ${choice('🧑', 'Un ragazzo di 14 o 15 anni', { ageBand: '14-15', age: ageBands['14-15'] }, 'situation')}
      ${choice('🧓', 'Un adulto (16 anni o più)', { ageBand: '16+', age: ageBands['16+'] }, 'situation')}`,
  }),

  situation: () => ({
    html: `${progress(3, 3)}
      <h1>Cosa ti serve?</h1>
      ${choice('🔄', 'Voglio cambiare medico o pediatra', { situation: 'change' }, 'result')}
      ${choice('👋', 'Il mio medico va in pensione o se ne va', { situation: 'retire' }, 'result')}
      ${choice('🚫', 'Non trovo nessuno con posti liberi', { situation: 'full' }, 'full')}
      ${choice('🎒', 'Vivo qui per studio o lavoro, ma la residenza è altrove', { situation: 'temporary' }, 'result')}`,
  }),

  result: () => {
    const a = asp();
    const extra = {
      change: `<p class="say">Non serve un motivo e non serve avvisare il vecchio medico: con la nuova scelta, il vecchio viene tolto in automatico.</p>`,
      retire: `<div class="notice info"><p class="say">Quando un medico va in pensione, l'ASP di solito avvisa i pazienti. Hai tempo per sceglierne un altro: fallo appena puoi, per non restare senza ricette.</p></div>`,
      temporary: `<div class="notice info"><p class="say">Puoi fare una <strong>scelta temporanea</strong> nel comune dove vivi, da ${rules.temporary_months[0]} mesi a ${rules.temporary_months[1]} mesi, rinnovabile. Porta anche una prova del motivo: iscrizione all'università o contratto di lavoro.</p></div>`,
    }[state.situation];
    return {
      html: `
        <div class="hero" aria-hidden="true">✅</div>
        <h1>Ecco come fare a ${esc(a.province)}</h1>
        <div class="notice info"><p class="say">${whoText()}</p></div>
        ${extra}
        <h2 class="say">Dove si fa</h2>
        <p class="say">${esc(a.scelta_medico.how)}</p>
        ${a.scelta_medico.url ? `<a class="btn" href="${esc(a.scelta_medico.url)}" target="_blank" rel="noopener">💻 Sito dell'ASP</a>` : ''}
        ${sportelli(a)}
        ${bring}
        <h2 class="say">Come scegliere</h2>
        <ul class="clean say">
          <li>Allo sportello ti danno l'elenco dei medici della tua zona che hanno ancora posto.</li>
          <li>Ogni medico può avere al massimo circa ${rules.max_patients_medico} pazienti, ogni pediatra circa ${rules.max_patients_pediatra}: se è pieno, non può prenderti.</li>
          <li>Chiedi a vicini e parenti, e guarda gli orari dello studio e se fa visite a casa.</li>
        </ul>
        ${aspCalls(a)}
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
    };
  },

  full: () => {
    const a = asp();
    return {
      html: `
        <div class="hero" aria-hidden="true">🚫</div>
        <h1>Se non trovi nessuno con posti liberi</h1>
        <div class="notice info"><p class="say">${whoText()}</p></div>
        <ol class="big-steps">
          <li class="say"><strong>Chiedi allo sportello «scelta e revoca»</strong> l'elenco completo, anche dei comuni vicini dello stesso distretto: a volte c'è posto poco lontano.</li>
          <li class="say"><strong>Chiedi una deroga:</strong> in alcuni casi un medico può superare il limite di pazienti (per esempio per un familiare di un suo paziente, o per un neonato).</li>
          ${state.ageBand === '6-13' ? '<li class="say"><strong>Per un bambino dai 6 anni</strong> puoi scegliere anche un <strong>medico di famiglia</strong> invece del pediatra.</li>' : ''}
          <li class="say"><strong>Se ancora niente: scrivi all'ASP.</strong> L'ASP deve garantire a tutti un medico o un pediatra. Prepariamo noi la lettera.</li>
        </ol>
        <button type="button" class="btn primary" data-go="letter">✍️ Scriviamo la lettera insieme</button>
        ${sportelli(a) || aspCalls(a)}
        ${disclaimer(rules.last_verified)}`,
    };
  },

  letter: () => {
    const a = asp();
    const to = generalContact(a);
    const kind = medicoChoice(rules, { age: state.age }) === 'medico' ? 'medico di medicina generale' : 'pediatra di libera scelta';
    return {
      html: `
        <h1>✍️ Scriviamo la lettera insieme</h1>
        <p class="say">Scrivi i dati qui sotto. Noi li mettiamo nella lettera per l'ASP di ${esc(a.province)}.</p>
        <div class="notice info"><p class="say">🔒 I dati restano sul tuo telefono. Non sai qualcosa? Lascia vuoto e scrivilo a penna.</p></div>
        <form id="letter-form" novalidate>
          <fieldset>
            <legend>La richiesta</legend>
            <label for="f-comune">Comune dove vive la persona</label>
            <input id="f-comune" name="comune" type="text" value="${esc(state.comune || '')}">
          </fieldset>
          ${personFields(person, state.ageBand === '16+' ? 'La persona che cerca il medico' : 'Il genitore che scrive (dati del genitore)')}
          ${state.ageBand !== '16+' ? `<fieldset><legend>Il bambino</legend>
            <label for="f-child">Nome e cognome del bambino</label><input id="f-child" name="child" type="text" value="${esc(state.child || '')}">
            <label for="f-childCf">Codice fiscale del bambino</label><input id="f-childCf" name="childCf" type="text" maxlength="16" autocapitalize="characters" value="${esc(state.childCf || '')}">
          </fieldset>` : ''}
        </form>
        <h2>📄 Ecco la lettera</h2>
        <div id="preview" class="letter"></div>
        ${letterButtons()}
        <p class="say" id="send-hint"></p>
        ${noPecBox()}
        <p class="muted"><a href="${esc(reportErrorHref(`Medico di famiglia ${a.name}`))}">Segnala un errore</a></p>
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
      mount() {
        const form = document.getElementById('letter-form');
        const update = () => {
          const v = readForm(form);
          for (const k of ['comune', 'child', 'childCf']) { state[k] = v[k]; delete v[k]; }
          Object.assign(person, v);
          form.querySelector('.delegate-fields').hidden = !person.isDelegate;
          const forWhom = state.ageBand === '16+' ? 'per sé' : `per il/la figlio/a minore ${state.child || '__________'}, codice fiscale ${state.childCf || '__________'}`;
          const text = genericRequest({
            to: `Azienda Sanitaria Provinciale di ${a.province}\nDistretto sanitario – Ufficio scelta e revoca\ne p.c. Ufficio Relazioni con il Pubblico`,
            address: to, person,
            subject: `Richiesta di assegnazione di un ${kind}`,
            premise: [
              `intende effettuare la scelta del ${kind} ${forWhom}, nel comune di ${state.comune || '__________'}`,
              'presso lo sportello è risultato che nell\'ambito territoriale non ci sono medici con posti disponibili',
              'l\'Azienda Sanitaria è tenuta a garantire a ogni assistito la scelta di un medico di medicina generale o di un pediatra',
            ],
            request: `l'indicazione di un ${kind} disponibile, anche in deroga ai massimali o in un ambito vicino, e di essere informato/a per iscritto sulle soluzioni possibili.`,
            attachments: ['copia del documento di identità', 'copia della tessera sanitaria'],
            today: todayISO(),
          });
          state.letterText = text;
          document.getElementById('preview').textContent = text;
          document.getElementById('mail-btn').href = mailtoHref(to, `Richiesta assegnazione ${kind}${person.fullName ? ` – ${person.fullName}` : ''}`,
            `Buongiorno,\nin allegato la richiesta firmata, con i documenti.\n\nCordiali saluti\n${person.fullName || ''}`);
          document.getElementById('send-hint').innerHTML = to
            ? `📧 L'email si apre indirizzata a ${esc(to)}${to === a.pec || /@pec\./.test(to) ? ' (è una PEC: se non hai la PEC, consegna la lettera a mano allo sportello o all\'URP)' : ''}. Chiedi sempre una ricevuta.`
            : '🏥 <strong>Stampa la lettera e consegnala allo sportello o all\'URP.</strong> Fatti dare una copia con timbro e data.';
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
  try { [rules, data] = await Promise.all([loadJSON(`${ROOT}data/rules-medico.json`), loadJSON(`${ROOT}data/asp-sicilia.json`)]); } catch {
    app.innerHTML = '<div class="notice bad"><p>Non riusciamo a caricare la pagina. Riprova tra poco.</p></div>'; return;
  }
  flow = createFlow({ app, screens, state, sources, person });
  flow.render();
})();
