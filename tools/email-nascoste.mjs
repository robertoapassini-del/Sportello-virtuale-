// Indirizzi email nascosti ai robot nelle pagine ufficiali. Il browser li mostra con un piccolo script; curl
// scarica solo la pagina, quindi nella copia restava «[email protected]» o «Questo indirizzo email è protetto
// dagli spambots». tools/copie.mjs chiama svelaEmail() sull'HTML prima di trasformarlo in testo, così l'indirizzo
// compare nella copia e tools/confronta-copie.mjs lo trova.
//
// Due modi di nascondere, i più usati dai siti delle aziende sanitarie:
//   1. Cloudflare («email protection»): l'indirizzo è in esadecimale in data-cfemail="…" o nel link
//      /cdn-cgi/l/email-protection#…; il primo byte è la chiave, gli altri vanno in XOR con la chiave.
//   2. Joomla («email cloaking»): l'indirizzo è spezzato in pezzi di testo dentro uno script
//      (variabili «addy…», con @ e . scritti &#64; e &#46;); in Joomla 4 e 5 è nel tag <joomla-hidden-mail>,
//      in base64 (attributi first e last).
// Non si supera nessuna protezione vera: è lo stesso indirizzo che la pagina mostra a chiunque la apra.

const EMAIL = /^[^\s@<>"'()[\]]+@[^\s@<>"'()[\]]+\.[a-z]{2,}$/i;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const senzaTag = (s) => s.replace(/<[^>]*>/g, ' ');

// Le entità HTML che i siti usano per nascondere @ e il punto (&#64; &#x40; &#46; …) e le più comuni.
export function entita(s) {
  return String(s)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&commat;/g, '@').replace(/&period;/g, '.').replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

// Cloudflare: «hex» → indirizzo (null se il codice non è valido).
export function cfDecode(hex) {
  if (!/^(?:[0-9a-f]{2}){2,}$/i.test(hex)) return null;
  const chiave = parseInt(hex.slice(0, 2), 16);
  const byte = [];
  for (let i = 2; i < hex.length; i += 2) byte.push(parseInt(hex.slice(i, i + 2), 16) ^ chiave);
  try { return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(byte)); } catch { return null; }
}

export function svelaCloudflare(html) {
  let n = 0;
  // <a|span … data-cfemail="hex">[email protected]</a|span> → l'indirizzo.
  let out = html.replace(/<(a|span)\b[^>]*?\bdata-cfemail\s*=\s*["']([0-9a-f]+)["'][^>]*>[\s\S]*?<\/\1\s*>/gi, (tutto, _tag, hex) => {
    const e = cfDecode(hex);
    if (!e) return tutto;
    n++;
    return esc(e);
  });
  // <a href="/cdn-cgi/l/email-protection#hex">testo</a> → mailto, e l'indirizzo dopo il testo se non c'è già.
  out = out.replace(/<a\b([^>]*?)\bhref\s*=\s*["'](?:https?:\/\/[^"'#]*)?\/cdn-cgi\/l\/email-protection#([0-9a-f]+)["']([^>]*)>([\s\S]*?)<\/a\s*>/gi, (tutto, prima, hex, dopo, dentro) => {
    const e = cfDecode(hex);
    if (!e) return tutto;
    n++;
    const giaScritto = entita(senzaTag(dentro)).toLowerCase().includes(e.toLowerCase());
    return `<a${prima}href="mailto:${esc(e)}"${dopo}>${dentro}${giaScritto ? '' : ` ${esc(e)}`}</a>`;
  });
  return { html: out, trovate: n };
}

// Le stringhe JavaScript di un'espressione «'ab' + "c" + addy123 + '&#64;'»: valore, oppure null se c'è altro.
function valuta(expr, variabili) {
  let valore = '';
  const resto = expr.replace(/\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|([A-Za-z_$][\w$]*))\s*(?:\+|$)/g, (_, s1, s2, nome) => {
    if (nome !== undefined) {
      if (!(nome in variabili)) throw new Error(nome);
      valore += variabili[nome];
    } else {
      valore += (s1 !== undefined ? s1 : s2).replace(/\\u([0-9a-f]{4})/gi, (__, h) => String.fromCharCode(parseInt(h, 16)))
        .replace(/\\x([0-9a-f]{2})/gi, (__, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\(.)/g, '$1');
    }
    return '';
  });
  return resto.trim() ? null : valore;
}

// Joomla 1.5–3: uno <script> con «var addy… = '…' + '&#64;'; addy… = addy… + '…' + '&#46;' + '…';»
// (e «addy_text…» per il testo del link). Lo script diventa l'indirizzo, scritto nella pagina.
function scriptJoomla(js) {
  if (!/\baddy/.test(js)) return null;
  const variabili = {};
  // Il «;» può stare dentro le stringhe («'&#64;'»): l'espressione si legge pezzo per pezzo.
  const ASSEGNA = /(?:\bvar\s+)?\b(addy[\w$]*|prefix|path)\s*=\s*((?:\s*(?:'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|[A-Za-z_$][\w$]*)\s*\+?)+?)\s*;/g;
  for (const [, nome, expr] of js.matchAll(ASSEGNA)) {
    try {
      const v = valuta(expr, variabili);
      if (v !== null) variabili[nome] = v;
    } catch { /* una variabile che non conosciamo: lasciamo stare */ }
  }
  const email = Object.entries(variabili).filter(([k]) => /^addy(?!_text)/.test(k)).map(([, v]) => entita(v).trim()).find((v) => EMAIL.test(v));
  if (!email) return null;
  const testo = Object.entries(variabili).filter(([k]) => /^addy_text/.test(k)).map(([, v]) => entita(senzaTag(entita(v))).replace(/\s+/g, ' ').trim()).find(Boolean);
  return testo && testo.toLowerCase() !== email.toLowerCase() ? `${testo} ${email}` : email;
}

const b64 = (s) => { try { return Buffer.from(String(s || ''), 'base64').toString('utf8'); } catch { return ''; } };

export function svelaJoomla(html) {
  let n = 0;
  let out = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi, (tutto, js) => {
    const e = scriptJoomla(js);
    if (!e) return tutto;
    n++;
    return ` ${esc(e)} `;
  });
  // Joomla 4 e 5: <joomla-hidden-mail first="base64" last="base64" text="base64" …>messaggio</joomla-hidden-mail>.
  out = out.replace(/<joomla-hidden-mail\b([^>]*)>[\s\S]*?<\/joomla-hidden-mail\s*>/gi, (tutto, attr) => {
    const a = {};
    for (const [, k, v] of attr.matchAll(/([\w-]+)\s*=\s*["']([^"']*)["']/g)) a[k.toLowerCase()] = v;
    const email = `${b64(a.first)}@${b64(a.last)}`;
    if (!EMAIL.test(email)) return tutto;
    n++;
    const testo = a.text ? entita(senzaTag(b64(a.text))).replace(/\s+/g, ' ').trim() : '';
    return ` ${esc(testo && testo.toLowerCase() !== email.toLowerCase() ? `${testo} ${email}` : email)} `;
  });
  return { html: out, trovate: n };
}

// Tutti e due: l'HTML con gli indirizzi in chiaro e quanti ne ha trovati.
export function svelaEmail(html) {
  const cf = svelaCloudflare(String(html || ''));
  const jo = svelaJoomla(cf.html);
  return { html: jo.html, trovate: cf.trovate + jo.trovate };
}
