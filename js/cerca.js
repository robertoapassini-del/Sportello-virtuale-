// La ricerca del sito (usata da js/home.js, provata in tests/ricerca.test.mjs).
// Funzione pura: cerca(testo, voci) → elenco dei risultati, il più adatto per primo.
// Le voci sono i moduli di data/moduli.json (e la voce «Numeri utili»):
// { id, icon, title, small, keywords, pages: [{ id, title }] }.

// Parole che non aiutano a trovare niente («esenzione per reddito» → «esenzione», «reddito»).
const VUOTE = new Set(`
a ad al allo ai agli alla alle all da dal dallo dai dagli dalla dalle dall di del dello dei degli della delle dell
in nel nello nei negli nella nelle nell su sul sullo sui sugli sulla sulle sull con col per tra fra
il lo la le gli i un uno una l d
e ed o od ma se che chi cui non piu molto poco anche gia ancora
mi ti si ci vi me te lui lei noi voi loro
mio mia miei mie tuo tua tuoi tue suo sua suoi sue nostro nostra vostro vostra
ho hai ha abbiamo avete hanno sono sei siamo siete era essere avere fare fa c
come cosa quando quanto quanta dove perche quale quali questo questa quello quella
voglio vorrei posso puo devo deve serve servono bisogna
`.split(/\s+/).filter(Boolean));

// Minuscole, senza accenti, solo lettere e cifre.
export function normalizza(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}
const parole = (s) => normalizza(s).split(' ').filter((w) => w && !VUOTE.has(w));

// Le parole della ricerca che contano (senza parole vuote e lettere sole).
export function paroleRicerca(query) {
  return [...new Set(parole(query).filter((w) => w.length >= 2))];
}

// Distanza tra due parole (Levenshtein con lo scambio di due lettere vicine, «accompagnamneto»).
// Si ferma presto: serve solo sapere se è 0, 1 o di più.
function distanza(a, b) {
  if (Math.abs(a.length - b.length) > 1) return 2;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

// Quanto una parola della ricerca somiglia a una parola del testo:
// 3 = parola intera, 2 = inizio di parola, 1 = errore di battitura, 0 = niente.
// Le parole corte (fino a 4 lettere: «rsa», «adi», «cup») valgono solo intere:
// così «rsa» non trova «persa» e «cup» non trova «disoccupato».
function somiglia(w, t) {
  if (w === t) return 3;
  if (w.length <= 4) return 0;
  if (t.startsWith(w)) return 2;
  // «rinnovo» trova «rinnova», «lontana» trova «lontano».
  if (w.length >= 6 && t.startsWith(w.slice(0, -1))) return 1.8;
  if (t.length >= 5 && distanza(w, t) <= 1) return 1;
  return 0;
}

// Titolo e id contano più della frase sotto il titolo, e questa più delle parole chiave.
const PESI = { title: 3, small: 2, keywords: 1 };

function campi(voce) {
  return [
    { peso: PESI.title, parole: [...parole(voce.title), ...parole(String(voce.id || '').replace(/-/g, ' '))] },
    { peso: PESI.small, parole: parole(voce.small) },
    { peso: PESI.keywords, parole: parole(voce.keywords) },
  ].filter((c) => c.parole.length);
}

// Punteggio di una voce: prima quante parole della ricerca ci sono, poi quanto bene.
function punteggio(words, voce) {
  const cs = campi(voce);
  let trovate = 0;
  let somma = 0;
  for (const w of words) {
    let best = 0;
    let altri = 0;
    for (const c of cs) {
      let q = 0;
      for (const t of c.parole) { q = Math.max(q, somiglia(w, t)); if (q === 3) break; }
      if (q) { altri += 1; best = Math.max(best, q * c.peso); }
    }
    if (best) { trovate += 1; somma += best + 0.1 * (altri - 1); }
  }
  if (!trovate) return null;
  // Le parole una dopo l'altra come nella ricerca («casa di riposo», «medico di base»).
  if (words.length >= 2) {
    const frase = ` ${words.join(' ')} `;
    for (const c of cs) if (` ${c.parole.join(' ')} `.includes(frase)) { somma += 2 * c.peso; break; }
  }
  // Quanta parte dell'id è stata trovata: «invalidità» → invalidita/ prima di ricorso-invalidita/.
  const id = parole(String(voce.id || '').replace(/-/g, ' '));
  if (id.length) somma += 2 * id.filter((t) => words.some((w) => somiglia(w, t))).length / id.length;
  return { trovate, somma, valore: trovate * 1000 + somma };
}

// Risultati: { href, icon, title, small, id, valore }. Le pagine corte di un modulo
// stanno subito sotto il loro modulo; se il modulo non c'è, la pagina sta da sola.
export function cerca(query, voci) {
  const words = paroleRicerca(query);
  if (!words.length) return [];
  const gruppi = [];
  voci.forEach((m, ordine) => {
    const p = punteggio(words, m);
    const pagine = [];
    for (const sp of m.pages || []) {
      const ps = punteggio(words, { title: sp.title });
      if (ps) pagine.push({ href: `${m.id}/${sp.id}/`, icon: m.icon, title: sp.title, small: m.title, id: `${m.id}/${sp.id}`, valore: ps.valore });
    }
    if (!p && !pagine.length) return;
    pagine.sort((a, b) => b.valore - a.valore);
    const voce = p && { href: `${m.id}/`, icon: m.icon, title: m.title, small: m.small, id: m.id, valore: p.valore };
    const valore = Math.max(voce ? voce.valore : 0, ...pagine.map((x) => x.valore));
    gruppi.push({ valore, ordine, voci: voce ? [voce, ...pagine] : pagine });
  });
  gruppi.sort((a, b) => b.valore - a.valore || a.ordine - b.ordine);
  return gruppi.flatMap((g) => g.voci);
}
