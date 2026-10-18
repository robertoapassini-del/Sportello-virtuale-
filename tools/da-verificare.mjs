// Crea docs/da-verificare.md: i numeri controllati solo dall'estratto della ricerca o da una
// copia su web.archive.org (proof «estratto» o «archivio»), raggruppati per pagina ufficiale da
// aprire. Serve per il giro di controllo da una connessione italiana (docs/regola-numeri.md).
// Uso: npm run da-verificare
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const asp = JSON.parse(fs.readFileSync(path.join(SITE, 'data/asp-sicilia.json'), 'utf8'));

const out = ['# Numeri da ricontrollare dall\'Italia', '',
  'Creato da `npm run da-verificare`. Per ogni pagina: aprila, controlla numero, indirizzo e orari, e cerca le notizie di chiusure o traslochi.',
  'Se è tutto giusto, nel file di dati metti `"proof": "pagina"`, la data di oggi in `verified` e togli `archived`.', ''];
let total = 0;
for (const a of asp.asl) {
  const weak = (a.contacts || []).filter((c) => c.proof === 'estratto' || c.proof === 'archivio');
  if (!weak.length) continue;
  total += weak.length;
  out.push(`## ${a.name} (${weak.length})`, '');
  const byUrl = new Map();
  for (const c of weak) byUrl.set(c.url, [...(byUrl.get(c.url) || []), c]);
  for (const [url, list] of byUrl) {
    out.push(`- [ ] <${url}>`);
    for (const c of list) {
      const extra = [c.address, c.hours, c.proof === 'archivio' ? `copia del ${c.archived}` : 'solo estratto'].filter(Boolean).join(' · ');
      out.push(`  - ${c.label}: **${c.number}** (${extra})`);
    }
  }
  if (a.todo?.length) out.push('', '  Dubbi aperti:', ...a.todo.map((t) => `  - ${t}`));
  out.push('');
}
out.splice(5, 0, `**Totale: ${total} numeri.**`, '');
fs.writeFileSync(path.join(SITE, 'docs/da-verificare.md'), out.join('\n'));
console.log(`ok docs/da-verificare.md (${total} numeri)`);
