// Disegno di esempio del promemoria della ricetta elettronica.
// Volutamente semplificato e segnato come fac-simile: mai usare l'immagine di una ricetta vera.
export const RICETTA_SVG = `
<svg class="ricetta" viewBox="0 0 520 300" role="img" aria-labelledby="ric-title ric-desc" xmlns="http://www.w3.org/2000/svg">
  <title id="ric-title">Disegno di esempio di una ricetta</title>
  <desc id="ric-desc">Disegno semplificato del promemoria della ricetta elettronica. La lettera della classe di priorità (U, B, D o P) si trova nella casella "Priorità della prestazione", evidenziata in giallo.</desc>
  <rect x="2" y="2" width="516" height="296" rx="10" fill="#fff" stroke="#9aa3ad" stroke-width="2"/>
  <text x="260" y="30" text-anchor="middle" font-size="15" font-weight="700" fill="#1d2228">SERVIZIO SANITARIO NAZIONALE</text>
  <text x="260" y="48" text-anchor="middle" font-size="11" fill="#56606b">Promemoria per l'assistito – ricetta elettronica</text>
  <text x="500" y="22" text-anchor="end" font-size="11" font-weight="700" fill="#a3271f">FAC-SIMILE</text>
  <line x1="16" y1="60" x2="504" y2="60" stroke="#d9dde2"/>
  <text x="20" y="80" font-size="11" fill="#56606b">Codice ricetta (NRE)</text>
  <rect x="20" y="86" width="200" height="22" fill="#f1efe9"/>
  <text x="28" y="102" font-size="12" fill="#1d2228">190A0 0000000</text>
  <text x="250" y="80" font-size="11" fill="#56606b">Cognome e nome</text>
  <rect x="250" y="86" width="250" height="22" fill="#f1efe9"/>
  <text x="258" y="102" font-size="12" fill="#1d2228">ROSSI MARIA</text>
  <text x="20" y="130" font-size="11" fill="#56606b">Tipo ricetta / accesso</text>
  <rect x="20" y="136" width="200" height="22" fill="#f1efe9"/>
  <text x="28" y="152" font-size="12" fill="#1d2228">Primo accesso</text>
  <rect x="244" y="118" width="262" height="52" rx="6" fill="#fff4b8" stroke="#e0a800" stroke-width="3"/>
  <text x="254" y="134" font-size="11" font-weight="700" fill="#5c4400">Priorità della prestazione</text>
  <text x="254" y="160" font-size="20" font-weight="800" fill="#1d2228">U  <tspan fill="#a3271f">[B]</tspan>  D  P</text>
  <text x="20" y="190" font-size="11" fill="#56606b">Prescrizione</text>
  <rect x="20" y="196" width="480" height="22" fill="#f1efe9"/>
  <text x="28" y="212" font-size="12" fill="#1d2228">VISITA CARDIOLOGICA</text>
  <text x="20" y="244" font-size="11" fill="#56606b">Data</text>
  <rect x="20" y="250" width="120" height="22" fill="#f1efe9"/>
  <text x="28" y="266" font-size="12" fill="#1d2228">01/10/2026</text>
  <text x="300" y="266" font-size="11" fill="#56606b">Timbro e firma del medico</text>
</svg>`;
