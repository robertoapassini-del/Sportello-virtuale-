// Le cifre scritte nelle guide (importi in euro, giorni, mesi, anni, ore, percentuali, pazienti)
// devono essere le stesse che stanno nei file data/ (docs/regola-cifre.md).
// Il test legge la guida scritta di ogni modulo e il suo file js, trova ogni cifra e la cerca tra i
// numeri del file di dati del modulo (data/moduli.json → "data"). Fallisce in due casi:
// - la cifra nella guida è diversa da quella nei dati (per esempio dopo un aggiornamento fatto a metà);
// - la cifra non sta in nessun file di dati: una cifra inventata, un refuso, o un numero che va prima
//   messo nei dati. In quel caso: aggiungi il campo in data/ (con la provenienza), oppure, se è un
//   esempio o un arrotondamento, dichiaralo in ECCEZIONI qui sotto, con il motivo.
// Se fallisce: correggi la guida o i dati, non il test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const site = new URL('../', import.meta.url);
const read = (f) => readFileSync(new URL(f, site), 'utf8');
const load = (f) => JSON.parse(read(f));
const reg = load('data/moduli.json');

// Cifre che non stanno nei dati così come sono scritte. Ognuna ha il motivo e, quando si può,
// il calcolo che la lega a un valore dei dati (così se il dato cambia, l'esempio va rifatto).
// Una voce che non serve più fa fallire il test: va tolta.
// «testo» è provato sui 60 caratteri che precedono la cifra, cifra compresa: finisce sempre con $.
const ECCEZIONI = {
  '*': [
    { testo: /\b18 anni$/, perche: 'maggiore età: definizione di legge, non una cifra del modulo', globale: true },
  ],
  'liste-attesa': [
    { testo: /circa 4 mesi$/, perche: 'classe P: 120 giorni arrotondati in mesi', valore: (d) => Math.round(d.rules.max_wait_days.P / 30), unita: 'mesi' },
  ],
  'esenzione-ticket': [
    { testo: /invalidità civile (al 100|dal 67|dal 67% al 99)%$/, perche: 'percentuali di invalidità dei codici C01 e C02: sono nel testo di other_exemptions' },
  ],
  'assistenza-domiciliare': [
    { testo: /1\.129,11 euro$/, perche: 'esempio: 1.000 € di spese più la franchigia', valore: (d) => 1000 + d['rules-domiciliare'].detrazione.franchigia, unita: '€' },
    { testo: /1\.000 euro$/, perche: 'esempio: la parte di spesa sopra la franchigia' },
    { testo: /190 euro$/, perche: 'esempio: la percentuale di detrazione su 1.000 €', valore: (d) => (1000 * d['rules-domiciliare'].detrazione.percent) / 100, unita: '€' },
  ],
  invalidita: [
    { testo: /[Hh]ai (<strong>)?6 mesi$/, perche: 'termine del ricorso: sta nel modulo ricorso-invalidita', valore: (d, tutti) => tutti['rules-ricorso'].appeal_months, unita: 'mesi' },
  ],
  'ricorso-invalidita': [
    { testo: /circa 13\.660 euro$/, perche: 'gratuito patrocinio arrotondato alle decine', valore: (d) => Math.round(d['rules-ricorso'].gratuito_patrocinio_income / 10) * 10, unita: '€' },
    { testo: /circa 27\.300 euro$/, perche: 'doppio del gratuito patrocinio arrotondato alle centinaia', valore: (d) => Math.round(d['rules-ricorso'].no_legal_costs_income / 100) * 100, unita: '€' },
    { testo: /devono dartela entro 7 giorni$/, perche: 'copia della cartella clinica: sta nel modulo cartella-clinica', valore: (d, tutti) => tutti['rules-cartella'].deadline_days, unita: 'giorni' },
  ],
  'medico-famiglia': [
    { testo: /a Trapani, dopo un cambio bisogna aspettare 30 giorni$/, perche: 'regola della sola ASP Trapani, scritta nel testo di asp-sicilia.json (scelta_medico)' },
  ],
};

// ---------- numeri nei dati ----------
const SALTA = new Set(['sources', 'provenienza', 'last_verified', 'icon', 'todo', 'notes_internal']);
function numeri(v, dove, out) {
  if (Array.isArray(v)) v.forEach((x, i) => numeri(x, `${dove}[${i}]`, out));
  else if (v && typeof v === 'object') { for (const [k, x] of Object.entries(v)) if (!SALTA.has(k)) numeri(x, dove ? `${dove}.${k}` : k, out); }
  else if (typeof v === 'number') out.push({ valore: v, dove });
  return out;
}

// ---------- cifre nel testo ----------
const testoVisibile = (html) => html
  .replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&#8217;|&rsquo;/g, '’').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const numero = (s) => Number(s.replace(/\./g, '').replace(',', '.'));
const UNITA = /(circa\s+)?(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:,\d{1,2})?)\s*(€|euro|ore|ora|giorni|giorno|mesi|mese|anni|anno|settimane|settimana|pazienti|%)(?![\w-])/g;
function cifre(testo) {
  const out = [];
  for (const m of testo.matchAll(UNITA)) {
    const unita = { euro: '€', ora: 'ore', giorno: 'giorni', mese: 'mesi', anno: 'anni', settimana: 'settimane' }[m[3]] || m[3];
    const inizio = Math.max(0, m.index - 60);
    // «prima» finisce con la cifra stessa: le eccezioni si riconoscono da lì (con $ alla fine).
    const prima = testo.slice(inizio, m.index + m[0].length).trim();
    out.push({ testo: m[0], valore: numero(m[2]), unita, prima, contesto: `${prima}${testo.slice(m.index + m[0].length, m.index + m[0].length + 20)}`.trim() });
  }
  return out;
}

// Una cifra «torna» se è uguale a un numero dei dati, oppure ne deriva in un modo ovvio:
// 72 ore = 3 giorni; «fino a 64 anni» = sotto i 65; «da 6 a 13 anni» = sotto i 14.
function torna(c, nums) {
  const vals = nums.map((n) => n.valore);
  if (vals.includes(c.valore)) return true;
  if (c.unita === 'ore' && vals.includes(c.valore / 24)) return true;
  if (c.unita === 'anni' && vals.includes(c.valore + 1)) return true;
  return false;
}

const jsDelModulo = (html) => (html.match(/<script type="module" src="\.\.\/js\/([a-z-]+\.js)"/) || [])[1];
// Tutti i file di regole, per le eccezioni che rimandano a un altro modulo.
const tutti = Object.fromEntries(readdirSync(new URL('data/', site)).filter((f) => f.startsWith('rules')).map((f) => [f.replace('.json', ''), load(`data/${f}`)]));

for (const m of reg.modules) {
  test(`${m.id}: le cifre della guida e del js sono quelle dei dati`, () => {
    const dati = Object.fromEntries(m.data.map((f) => [f, load(`data/${f}.json`)]));
    const nums = Object.entries(dati).flatMap(([f, d]) => numeri(d, f, []));
    const html = read(`${m.id}/index.html`);
    const guida = html.match(/<section class="wrap guida" id="guida"[\s\S]*?<\/section>/);
    assert.ok(guida, `${m.id}: manca la guida scritta`);
    const js = jsDelModulo(html);
    // La pagina principale (la guida scritta), le pagine corte della guida (moduli.json → "pages") e il js.
    const fonti = [[`${m.id}/index.html`, testoVisibile(guida[0])]];
    for (const sp of m.pages || []) {
      const f = `${m.id}/${sp.id}/index.html`;
      const main = read(f).match(/<main[^>]*>[\s\S]*?<\/main>/);
      assert.ok(main, `${f}: manca <main>`);
      fonti.push([f, testoVisibile(main[0])]);
    }
    if (js) fonti.push([`js/${js}`, read(`js/${js}`).replace(/\s+/g, ' ')]);
    const eccezioni = [...ECCEZIONI['*'], ...(ECCEZIONI[m.id] || [])].map((e) => ({ ...e, usata: false }));
    const errori = [];
    for (const [file, testo] of fonti) {
      for (const c of cifre(testo)) {
        if (torna(c, nums)) continue;
        const e = eccezioni.find((x) => x.testo.test(c.prima));
        if (!e) { errori.push(`${file}: «${c.testo}» (…${c.contesto}…) non sta in ${m.data.join(', ')}`); continue; }
        e.usata = true;
        if (e.valore) {
          const atteso = e.valore(dati, tutti);
          if (Math.abs(atteso - c.valore) > 0.005) errori.push(`${file}: «${c.testo}» ma dai dati viene ${atteso} ${e.unita} (${e.perche})`);
        }
      }
    }
    for (const e of eccezioni.filter((x) => !x.usata && !x.globale)) {
      errori.push(`eccezione «${e.testo.source}» non serve più: toglila da ECCEZIONI`);
    }
    assert.equal(errori.length, 0, `\n- ${errori.join('\n- ')}\n`);
  });
}
