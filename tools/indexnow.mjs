// Avvisa i motori di ricerca che usano IndexNow (Bing, e con lui DuckDuckGo, Yandex…) delle pagine cambiate,
// così le rileggono subito invece di aspettare. Lo lancia .github/workflows/indexnow.yml dopo ogni push su main.
// La chiave è pubblica per scelta: il file <chiave>.txt nella cartella del sito prova che il sito è nostro.
// Uso: node tools/indexnow.mjs <commit-prima> <commit-dopo> [--prova]   (--prova: stampa e non manda niente)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const KEY = '3c0ecdf89c2ace8539d2e7f0c68d136f';
export const BASE = fs.readFileSync(path.join(SITE, 'sitemap.xml'), 'utf8').match(/<loc>(.*?)<\/loc>/)[1];
// Cartelle che non sono il sito (robots.txt le esclude) e la pagina 404, che non va indicizzata.
const FUORI = /^(docs|tests|tools|node_modules|\.github)\/|^404\.html$/;

// Un file HTML del sito diventa il suo indirizzo, come in tools/pagine.mjs: «liste-attesa/index.html» → «…/liste-attesa/».
export function urlDaFile(file) {
  if (!file.endsWith('.html') || FUORI.test(file)) return null;
  return BASE + file.replace(/(^|\/)index\.html$/, '$1');
}

export function pagineCambiate(prima, dopo) {
  const out = execFileSync('git', ['diff', '--name-only', '--diff-filter=AMR', prima, dopo], { cwd: SITE, encoding: 'utf8' });
  return [...new Set(out.split('\n').map((f) => urlDaFile(f.trim())).filter(Boolean))];
}

async function main() {
  const [prima, dopo] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!prima || !dopo) { console.error('Uso: node tools/indexnow.mjs <commit-prima> <commit-dopo> [--prova]'); process.exit(2); }
  // Primo push di un ramo: GitHub manda «0000…» come commit di prima. Non c'è niente da confrontare.
  if (/^0+$/.test(prima)) { console.log('Nessun commit precedente: niente da mandare.'); return; }
  const urls = pagineCambiate(prima, dopo);
  if (!urls.length) { console.log('Nessuna pagina cambiata.'); return; }
  const host = new URL(BASE).host;
  const body = { host, key: KEY, keyLocation: `${BASE}${KEY}.txt`, urlList: urls.slice(0, 10000) };
  console.log(`Pagine cambiate: ${urls.length}`);
  for (const u of urls) console.log(`  ${u}`);
  if (process.argv.includes('--prova')) return;
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(body),
  });
  console.log(`IndexNow: ${res.status} ${res.statusText}`);
  // 200 e 202 vogliono dire ricevuto. Un errore non deve fermare niente: si stampa e basta.
  if (![200, 202].includes(res.status)) console.log(await res.text().catch(() => ''));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
