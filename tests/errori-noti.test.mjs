// Errori già trovati sul sito, che non devono tornare. Ogni volta che una rilettura o un utente trova
// un errore che si può riconoscere da come è scritto, si aggiunge qui una riga (cosa, perché, dove guardare).
// Guarda le pagine HTML, i JS e i file di dati, anche quelli delle regioni.
// Se fallisce: correggi il testo. Togli una riga solo se la regola è cambiata (e scrivilo nel CHANGELOG).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SALTA = new Set(['node_modules', '.git', 'tests', 'tools', 'docs', 'fonts', 'css']);
function files(dir = SITE) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (SALTA.has(e.name)) return [];
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return files(p);
    return /\.(html|js|json)$/.test(e.name) ? [p] : [];
  });
}

// [espressione, perché è sbagliato, righe dove invece va bene, file da saltare per ora].
// I file da saltare sono quelli che un altro lavoro sta riscrivendo: si tolgono appena sono corretti. Le espressioni guardano il testo così com'è nel file.
const ERRORI = [
  [/\b(la|della|nella|alla|dalla|sulla|una) (ASL|ASP|AUSL|ASST|ATS|USL|ULSS|AST|ASREM)\b/, "si scrive «l'ASL», «dell'ASL» (rilettura del 21/10/2026)"],
  [/art\.\s*4,?\s*comma\s*3[^.\n]{0,60}24\/2017|24\/2017[^.\n]{0,60}art\.\s*4,?\s*comma\s*3/, 'documentazione sanitaria entro 7/30 giorni: è l\'art. 4, comma 2 della L. 24/2017 (il comma 3 parla dei risarcimenti)'],
  [/art(icolo|\.)\s*18[^.\n]{0,80}autorizz|autorizz[^.\n]{0,80}art(icolo|\.)\s*18 (del )?DPCM/i, "ausili: l'art. 18 del DPCM 12/01/2017 parla dei destinatari; autorizzazione e tempi sono nell'allegato 12"],
  [/artt?\.\s*25 e 26/, 'consultori: sono nell\'art. 24 del DPCM 12/01/2017 (artt. 24, 25 e 26)'],
  [/art\.\s*9 del DPCM[^.\n]{0,60}(odontoiatr|dentist)|(odontoiatr|dentist)[^.\n]{0,80}art\.\s*9 del DPCM/i, "dentista: non è l'art. 9 del DPCM (allegato 4C)"],
  [/circa\s+\$\{formatEuro|circa \d{1,3}(\.\d{3})*,\d{2}\s*(€|euro)/, '«circa» davanti a una cifra con i centesimi'],
  [/Sono passati <strong>\$\{days\(/, '«Sono passati 1 giorno»: va gestito il singolare'],
  [/Curarsi fuori dalla Sicilia/, 'il modulo vale per tutte le regioni: «Curarsi fuori dalla propria regione»'],
  [/fino al terzo grado/, 'permessi 104: parenti fino al secondo grado; il terzo grado solo in casi precisi (art. 33 c. 3 L. 104/1992)', /65 anni|Un familiare alla volta|congedo/],
  [/di solito fino a un anno/, 'ricetta per visite ed esami: 180 giorni per prenotare (regola nazionale dal 30/12/2024)'],
  [/l'ASL autorizza entro 20 giorni|L'articolo 18 dice che l'ASL autorizza entro/, 'ausili: i 20 giorni non sono del DPCM, sono una regola regionale (Sicilia)'],
  [/Per ora solo in Sicilia/, 'il sito vale in tutta Italia'],
  [/Fino a \$\{rules\.pediatra_only_until\} anni/, 'pediatra: «sotto i 6 anni» (tra 6 e 13 si può scegliere)'],
  [/!parseDate\(/, 'parseDate() del 01/01/1970 vale 0 (falso): si controlla con «=== null» (audit del 21/10/2026)'],
  [/C02[^<\n]{0,40}67|C03[^<\n]{0,40}frequenza/, 'codici esenzione invalidità: C02 = 100% con accompagnamento, C03 = 67-99%, C04 = minori con frequenza'],
  [/strisce blu[^.\n]{0,100}(occupati|occupate)/, 'strisce blu: dal 14/12/2024 (L. 177/2024) gratis senza la condizione dei posti riservati occupati'],
  [/part-time i giorni si riducono in proporzione/, 'permessi 104: con il part-time orizzontale i 3 giorni restano interi (circolare INPS 45/2021)'],
  [/meno di 3 anni[^.\n]{0,80}prolungamento del congedo/, 'prolungamento del congedo parentale: fino ai 12 anni del figlio; solo le 2 ore fino ai 3 anni'],
  [/rivalutazione dell.1,4%/, "accompagnamento: l'1,4% è la perequazione delle pensioni, non vale per l'accompagnamento"],
  [/messaggio (n\. )?639\/2026/, 'province della riforma della disabilità: messaggi INPS 635 e 637 del 23/02/2026'],
  [/art\. 6,? L\. 80\/2006|L\. 405\/2001, art\./, 'leggi di conversione con un solo articolo: si cita il decreto-legge (D.L. 4/2006 art. 6 c. 3-bis; D.L. 347/2001 art. 8)'],
  [/lunedì e mercoledì[^;"]*;\s*dal martedì al giovedì/, 'orario con un giorno ripetuto e il venerdì mancante (URP ASL Roma 4, avviso con refuso)'],
  [/(come fare|nato\/a) a \$\{/, '«a Agrigento»: davanti ai nomi che cominciano per A ci vuole «ad»'],
  [/Non ti chiediamo (mai la malattia|dati sulla salute)\./, 'privacy: i moduli chiedono la visita o l\'ausilio per la lettera (resta nel browser)'],
  [/spese di viaggio[^.\n]{0,80}scaricare[^.\n]{0,60}in parte/i, 'viaggio e alloggio per le cure di solito non si detraggono (Agenzia delle Entrate)'],
  [/tutto gratuito<\/strong> per più di un mese/, 'accompagnamento: si sospende dopo 29 giorni di ricovero gratuito, non «un mese»'],
  [/nessuno può essere dimesso/i, 'dimissione protetta: è un percorso organizzativo regionale, non un divieto di dimissione'],
  [/L'assistenza domiciliare è gratuita\./, 'ADI: gratuite le cure sanitarie; l\'aiuto dell\'operatore dopo 30 giorni può avere una quota (DPCM 2017 art. 22)'],
  [/in questa guida<\/a> la (prepara|scrive)(?![^.]*solo per la Sicilia)/, 'la lettera già scritta c\'è per ora solo per la Sicilia: dirlo (fuori dalla Sicilia il percorso si ferma)'],
  [/data-go="\$\{(esc\()?first\)?\}"[^`]*Leggi cosa vale/, '«Leggi cosa vale in tutta Italia» riportava all\'inizio del modulo: giro senza uscita (va alla guida #guida)'],
  [/DM 24\/11\/2022/, 'bonus psicologo: il decreto è del 24/11/2023'],
  [/tutto\s*(<strong>)?\s*gratuit/i, 'ADI: gratuite solo le cure sanitarie (DPCM 2017 art. 22)', /ricovero è <strong>tutto gratuito|tutto gratuito per più di 29/],
  [/Non andare dal privato a pagamento prima di (aver )?mandat[oa] la richiesta[.:]/, "liste d'attesa: dal privato solo dopo la richiesta e solo se l'ASL lo scrive (rilettura del 21/10/2026)"],
  [/costo di riproduzione/, 'cartella: la prima copia è gratis (art. 15 GDPR)'],
  [/visita\/il procedimento/, 'sollecito INPS: nuova procedura = «il procedimento di valutazione di base doveva concludersi», vecchia oncologica = «la visita doveva svolgersi» (audit lettere del 21/10/2026)'],
  [/termine indicato come ordinario/, 'sollecito INPS, vecchia procedura ordinaria: i 30 giorni sono indicativi, la lettera dice solo quanti giorni sono passati'],
  [/secondo i tempi indicati dalla normativa vigente/, 'i 30 giorni della vecchia procedura INPS sono indicativi (rules-invalidita.json): la lettera non li cita come norma'],
  // Audit dei testi del 21/10/2026 (sera).
  [/"number": "800 \d{3} \d{3}"/, 'numeri verdi: «800 123456» (docs/regola-numeri.md)'],
  [/circa \d{4,}\b|circa \$\{rules\.max_patients/, 'migliaia con il punto: «circa 1.500»'],
  [/[Ii]l conto in questa guida/, '«Il percorso in questa guida»: il modulo non è solo un conto', null, ['cartella-clinica/ritardo/index.html']],
  [/\(Punto Unico di Accesso\)|\bpap test\b/, '«(Punto unico di accesso)», «Pap test»', /"keywords"/],
  [/\bad (?=[EIOU][a-z])|\b([Uu]na|[Dd]ella|[Nn]ella|[Aa]lla|[Dd]alla|[Ll]a) équipe\b/, "«a Enna» («ad» solo davanti alla A), «un'équipe», «dell'équipe»"],
  [/\b([Gg]uarda|vale la pagina) <a [^>]*>(la visita è|il verbale è|la visita per l.invalidità non)/, 'il titolo di una pagina non va dentro la frase come link: «Leggi cosa fare se …»'],
  [/Non andare dal privato a pagamento prima di/, "liste d'attesa: «Vai dal privato a pagamento solo se l'ASL te lo scrive»", null, ['js/liste-attesa.js']],
  [/"title": "(Non mi danno|Ho diritto|[^"]*l'ho persa|[^"]*posso fare)/, "titoli in data/moduli.json come l'h1 della pagina: si dà del tu («Non ti danno», «l'hai persa»)"],
];

test('nessuno degli errori già trovati è tornato', () => {
  const trovati = [];
  for (const f of files()) {
    const righe = fs.readFileSync(f, 'utf8').split('\n');
    righe.forEach((riga, i) => {
      for (const [re, perche, va_bene, salta] of ERRORI) {
        if (salta && salta.includes(path.relative(SITE, f).split(path.sep).join('/'))) continue;
        if (re.test(riga) && !(va_bene && va_bene.test(riga))) trovati.push(`${path.relative(SITE, f)}:${i + 1}: ${perche}\n    ${riga.trim().slice(0, 160)}`);
      }
    });
  }
  assert.deepEqual(trovati, [], `Errori già visti:\n${trovati.join('\n')}`);
});
