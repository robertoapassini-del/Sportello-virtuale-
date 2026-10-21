// Errori già trovati sul sito, che non devono tornare. Ogni volta che una rilettura o un utente trova
// un errore che si può riconoscere da come è scritto, si aggiunge qui una riga (cosa, perché, dove guardare).
// Guarda le pagine HTML, i JS e i file di dati (non quelli delle regioni, che hanno il loro test).
// Se fallisce: correggi il testo. Togli una riga solo se la regola è cambiata (e scrivilo nel CHANGELOG).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SALTA = new Set(['node_modules', '.git', 'tests', 'tools', 'docs', 'regioni', 'fonts', 'css']);
function files(dir = SITE) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (SALTA.has(e.name)) return [];
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return files(p);
    return /\.(html|js|json)$/.test(e.name) ? [p] : [];
  });
}

// [espressione, perché è sbagliato, righe dove invece va bene]. Le espressioni guardano il testo così com'è nel file.
const ERRORI = [
  [/\bla ASL\b/, "si scrive «l'ASL» (rilettura del 21/10/2026)"],
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
  [/secondo i tempi indicati dalla normativa vigente/, 'i 30 giorni della vecchia procedura INPS sono indicativi (rules-invalidita.json): la lettera non li cita come norma'],
];

test('nessuno degli errori già trovati è tornato', () => {
  const trovati = [];
  for (const f of files()) {
    const righe = fs.readFileSync(f, 'utf8').split('\n');
    righe.forEach((riga, i) => {
      for (const [re, perche, va_bene] of ERRORI) {
        if (re.test(riga) && !(va_bene && va_bene.test(riga))) trovati.push(`${path.relative(SITE, f)}:${i + 1}: ${perche}\n    ${riga.trim().slice(0, 160)}`);
      }
    });
  }
  assert.deepEqual(trovati, [], `Errori già visti:\n${trovati.join('\n')}`);
});
