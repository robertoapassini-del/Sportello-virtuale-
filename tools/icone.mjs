// Crea js/icons.js: per ogni emoji usata nel sito, il disegno dell'icona Lucide
// (lucide.dev, licenza ISC, vedi fonts/LICENSE-lucide.txt) che la sostituisce.
// Uso: npm install --no-save lucide-static && npm run icone
// Per una nuova emoji: aggiungerla in ICONS e rilanciare.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LUCIDE = process.argv[2] || path.join(SITE, 'node_modules/lucide-static');

// emoji: [nome icona Lucide, colore di significato (ok / bad / warn) se serve]
const ICONS = {
  // aree e moduli
  '🩺': ['stethoscope'], '🛡️': ['shield-check'], '🏠': ['house'], '♿': ['accessibility'], '🦽': ['accessibility'],
  '📅': ['calendar-days'], '🗓️': ['calendar'], '🎫': ['ticket'], '💊': ['pill'], '📁': ['folder-open'], '🗂️': ['folder-open'],
  '👨‍⚕️': ['stethoscope'], '⚖️': ['scale'], '🪪': ['id-card'], '🕊️': ['bird'], '🤲': ['hand-heart'],
  // urgenze, malattia e lavoro (24/10/2026)
  '🚑': ['ambulance'], '🌙': ['moon'], '🤒': ['thermometer'],
  // prevenzione
  '🎀': ['ribbon'], '🎗️': ['ribbon'], '🌸': ['flower-2'], '🧪': ['test-tube'], '🤧': ['thermometer'], '🫁': ['wind'],
  '🔥': ['flame'], '🩹': ['bandage'], '💉': ['syringe'], '🔬': ['microscope'],
  // persone
  '👨‍👩‍👧': ['users'], '🧑': ['user'], '👤': ['user'], '👩': ['user'], '👨': ['user'], '🧓': ['user-round'], '👵': ['user-round'],
  '👴': ['user-round'], '🧒': ['baby'], '👶': ['baby'], '🎂': ['cake'], '🙋': ['hand'], '👋': ['hand'], '🗣️': ['message-circle'],
  '🤷': ['circle-help'], '❓': ['circle-help'], '😣': ['frown'], '❤️': ['heart'],
  // azioni
  '▶️': ['arrow-right'], '👉': ['arrow-right'], '🚀': ['arrow-right'], '✍️': ['pen-line'], '🖊️': ['pen'], '📝': ['notebook-pen'],
  '🔎': ['search'], '🔄': ['refresh-cw'], '🔁': ['repeat'], '🖨️': ['printer'], '🔊': ['volume-2'], '📥': ['download'],
  '⏸️': ['circle-pause'], '➖': ['minus'], '🧹': ['eraser'],
  // fogli e posta
  '📄': ['file-text'], '🧾': ['receipt-text'], '📋': ['clipboard-list'], '📎': ['paperclip'], '📚': ['book-open'],
  '📧': ['mail'], '✉️': ['mail'], '📨': ['send'], '📬': ['mailbox'],
  // luoghi e contatti
  '📍': ['map-pin'], '🏥': ['hospital'], '🏢': ['building-2'], '🏛️': ['landmark'], '🚚': ['truck'], '📞': ['phone'], '☎️': ['phone'],
  '📱': ['smartphone'], '💻': ['laptop'], '💼': ['briefcase'], '🎒': ['backpack'], '🍪': ['cookie'],
  // soldi
  '💶': ['euro'], '💳': ['credit-card'], '📊': ['chart-column'],
  // tempo
  '⏳': ['hourglass'], '⌛': ['hourglass'], '⏰': ['alarm-clock'],
  // significato: sì / no / attenzione
  '✅': ['circle-check', 'ok'], '✔️': ['check', 'ok'], '🔒': ['lock'],
  '❌': ['circle-x', 'bad'], '🚫': ['ban', 'bad'], '🚨': ['siren', 'bad'],
  '⚠️': ['triangle-alert', 'warn'], '❗': ['circle-alert', 'warn'],
};

const missing = [];
const out = {};
for (const [emoji, [name, tone]] of Object.entries(ICONS)) {
  const file = path.join(LUCIDE, 'icons', `${name}.svg`);
  if (!fs.existsSync(file)) { missing.push(`${emoji} ${name}`); continue; }
  const inner = fs.readFileSync(file, 'utf8').match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1]
    .replace(/\s*\n\s*/g, '').replace(/ \/>/g, '/>');
  out[emoji] = tone ? [inner, tone] : [inner];
}
if (missing.length) { console.error('Icone non trovate:', missing.join(', ')); process.exit(1); }

const version = JSON.parse(fs.readFileSync(path.join(LUCIDE, 'package.json'), 'utf8')).version;
fs.writeFileSync(path.join(SITE, 'js/icons.js'), `// File creato da tools/icone.mjs: non modificarlo a mano.
// Icone Lucide ${version} (https://lucide.dev), licenza ISC: vedi fonts/LICENSE-lucide.txt.
// emoji → [disegno SVG, colore di significato]
export const ICONS = ${JSON.stringify(out, null, 0).replace(/\],"/g, '],\n  "').replace(/^\{/, '{\n  ').replace(/\}$/, ',\n}')};
`);
fs.copyFileSync(path.join(LUCIDE, 'LICENSE'), path.join(SITE, 'fonts/LICENSE-lucide.txt'));
console.log(`ok js/icons.js (${Object.keys(out).length} icone, Lucide ${version})`);
