# Guida Sanità

Sito gratuito che dice alle persone in Sicilia cosa spetta loro, entro quando e come chiederlo: sanità, cure e invalidità. Moduli:

- **Modulo 1 – Liste d'attesa:** la visita o l'esame è troppo lontano rispetto alla classe di priorità della ricetta.
- **Modulo 2 – Invalidità civile:** la visita per l'invalidità non arriva entro i tempi di legge.
- **Modulo 3 – Cartella clinica e referti:** l'ospedale non consegna la copia entro 7 giorni (L. 24/2017, art. 4).
- **Modulo 4 – Ausili e protesi:** l'ASP non autorizza carrozzina, letto, pannoloni ecc. entro 20 giorni (DPCM 12/01/2017).
- **Modulo 5 – Esenzione ticket:** calcolo dell'esenzione per età e reddito (codici E01–E04) e come ottenerla.
- **Modulo 6 – Ricorso invalidità:** 6 mesi dal verbale per il ricorso; quanto tempo resta e cosa fare.
- **Modulo 7 – Assegno di inclusione:** condizioni principali (famiglia, residenza, ISEE) e come fare domanda.
- **Modulo 9 – Piano terapeutico:** cos'è, chi lo fa, quando prenotare il rinnovo.
- **Modulo 10 – Assistenza domiciliare (ADI):** come si chiede al distretto; sollecito dopo 30 giorni.
- **Modulo 12 – Prevenzione gratuita:** screening e vaccini gratuiti per età e sesso, come prenotarli.
- **Modulo 13 – Medico di famiglia e pediatra:** come scegliere o cambiare, scelta temporanea, lettera se non c'è posto.
- **Modulo 11 – Cure palliative:** diritto della L. 38/2010, attivazione a casa o in hospice, richiesta scritta.

Temi **solo testo** (`static` in `data/moduli.json`: risposta in cima e pagine corte, senza percorso a domande), aggiunti il 20/10/2026:

- Area **Tessera e ricette** (`tessera-e-ricette/`): tessera sanitaria (`tessera-sanitaria/`), fascicolo sanitario e ricetta elettronica (`fascicolo-e-ricetta/`), prenotare e disdire al CUP (`prenotare-cup/`).
- In **Invalidità**: legge 104 (`legge-104/`), indennità di accompagnamento (`accompagnamento/`), contrassegno disabili (`contrassegno-disabili/`).
- In **Visite ed esami**: curarsi fuori dalla Sicilia (`cure-fuori-regione/`), dentista (`dentista/`), psicologo (`psicologo/`). In **Aiuto a casa**: RSA (`rsa/`).

Requisiti completi: [SPEC.md](SPEC.md).

## Principi

- **Semplicissimo per tutti**, anche per chi legge poco: frasi brevi, una sola domanda per schermata, pulsanti
  grandi con icone, pulsante **🔊 Ascolta** che legge la pagina ad alta voce, riquadro «Chi può aiutarti».
- **Niente server, niente database, niente cookie, niente intelligenza artificiale.** Tutto funziona nel browser;
  quello che scrive l'utente non viene salvato né inviato. Si contano solo, in forma anonima, le pagine viste e i
  «Sì / No» di «Ti è stata utile?» con GoatCounter (`GOATCOUNTER_CODE` in `js/common.js`).
- **Decide il computer con regole fisse** (`js/engine.js`).
- I dati di ASP e INPS si aggiornano a mano nei file `data/*.json`, ognuno con data di verifica e fonte.
- **Controllo automatico** (`.github/workflows/controllo.yml`, `tools/controllo.mjs`): ogni mattina cerca novità in
  Gazzetta Ufficiale e INPS legate ai moduli; il lunedì controlla link rotti e `last_verified` più vecchi di 6 mesi.
  Non cambia mai il sito: apre issue con l'etichetta `controllo-automatico`. Per provarlo: `npm run controllo -- --tutto`.

## Regole per scrivere i testi

- Frasi brevi, un'idea per frase, parole di tutti i giorni (es. «foglio della prenotazione», non «promemoria»).
- Le parole tecniche (PEC, URP, CUP) si spiegano la prima volta.
- I riferimenti di legge vanno nei riquadri «Per saperne di più», non nel testo principale.
- Le lettere per gli uffici restano in linguaggio formale: sono per l'ASP o l'INPS, non per l'utente.
- Oltre alle parole semplici, nella guida scritta di ogni pagina vanno anche i **termini tecnici** che la gente
  cerca su Google (es. «percorso di tutela», «classi di priorità U, B, D, P», «tempi massimi di attesa», «PEC all'ASP»),
  spiegati la prima volta.

## Pagine leggibili anche senza JavaScript

- Ogni modulo ha nell'HTML, sotto `<main id="app">`, la **guida passo passo** scritta (`<section class="guida" id="guida">`):
  è quello che vede Google e chi non ha JavaScript. Le domande interattive compaiono sopra. Se cambi una regola in
  `data/`, ricontrolla anche il testo della guida.
- Le parti della guida che vengono dai dati (tabella delle classi di priorità, come chiedere il percorso di tutela in
  ogni ASP, «Numeri utili», fonti e data del controllo) sono tra `<!-- blocco:nome -->` e si rifanno con `npm run pagine`.
- Una guida lunga si può dividere in **pagine corte**, una per domanda (come fa NHS.uk): in `data/moduli.json` il modulo
  ha `pages` (`id` e `title`), ogni pagina sta in `modulo/pagina/index.html` e ha l'elenco `<!-- blocco:guida-indice -->`.
  Tutti i moduli sono fatti così. Nella pagina principale restano la risposta breve (nel `<main>`, visibile anche senza
  JavaScript: è anche la prima schermata del percorso, `answerHtml` nel `js/`), il pulsante che avvia il percorso e l'indice.
- In fondo a ogni pagina: **Condividi su WhatsApp** (un link, funziona anche senza JavaScript) e **Stampa** (con
  «Stampa la guida» si stampa solo la guida, con l'indirizzo della pagina in fondo al foglio).
- Link interni sempre all'indirizzo della cartella (`../liste-attesa/`), mai a `index.html`.
- `npm test` controlla tutto questo e che le pagine siano aggiornate (`node tools/pagine.mjs --controlla`).
- Nei file `data/` le cose da verificare vanno **solo** nel campo `todo` (non viene mostrato). Un test
  controlla che nessun «TODO» arrivi agli utenti.

## Regola per i numeri di telefono

**Solo numeri e sedi confermati da una fonte ufficiale**, controllati anche per chiusure e traslochi, e
ricontrollati ogni 3 mesi. Procedura completa: [docs/regola-numeri.md](docs/regola-numeri.md). Il test
`tests/contatti.test.mjs` blocca i numeri senza pagina ufficiale, data o prova, e quelli controllati più di
92 giorni fa.

## Provarlo sul tuo computer

Le pagine leggono file JSON, quindi serve un piccolo server locale (aprire il file direttamente non funziona):

```bash
python3 -m http.server 8080      # oppure: npm start
# poi apri http://localhost:8080
```

## Test

```bash
npm test
```

Prova completa di **tutte le combinazioni** di risposte (9 province, tutte le classi, date al limite esatto,
entrambi i moduli) in un browser vero, con il sito avviato su `localhost:8080`:

```bash
npm run test:combinazioni
```

## Struttura

| Percorso | Cos'è |
|---|---|
| `index.html`, `js/home.js`, `data/moduli.json` | Pagina iniziale: 4 riquadri (uno per area), risultati della ricerca |
| `visite-esami/`, `prevenzione-medico/`, `aiuto-a-casa/`, `invalidita-aiuti/`, `js/area.js` | Pagine delle 4 aree con l'elenco dei moduli. **Create da `npm run pagine`**: non modificarle a mano |
| `tools/pagine.mjs` | Rifà testata, percorso «Inizio › Area», pagine delle aree, anteprima per i messaggi (`og:`), barra «Condividi / Stampa», i blocchi della guida scritta presi dai dati e `sitemap.xml`. Rilanciarlo con `npm run pagine` dopo aver aggiunto o cambiato un modulo |
| `js/icons.js`, `tools/icone.mjs` | Icone disegnate (Lucide, licenza ISC in `fonts/LICENSE-lucide.txt`). Nei testi si scrivono emoji; `iconize` in `js/common.js` le sostituisce sullo schermo. Per una nuova emoji: aggiungerla in `tools/icone.mjs`, poi `npm install --no-save lucide-static && npm run icone` |
| `liste-attesa/`, `js/liste-attesa.js` | Modulo 1: domande, risultato, lettera, «E adesso?» |
| `invalidita/`, `js/invalidita.js` | Modulo 2: scadenza, sollecito all'INPS, cosa portare |
| `cartella-clinica/`, `js/cartella.js` | Modulo 3: scadenza 7 giorni, sollecito all'ospedale |
| `ausili/`, `js/ausili.js` | Modulo 4: scadenza 20 giorni, sollecito all'ASP, consegna |
| `esenzione-ticket/`, `js/esenzione.js` | Modulo 5: calcolo esenzione per reddito |
| `ricorso-invalidita/`, `js/ricorso.js` | Modulo 6: scadenza di 6 mesi per il ricorso |
| `assegno-inclusione/`, `js/adi.js` | Modulo 7: condizioni per l'assegno di inclusione |
| `piano-terapeutico/`, `js/piano.js` | Modulo 9: piano terapeutico e rinnovo |
| `assistenza-domiciliare/`, `js/domiciliare.js` | Modulo 10: ADI, sollecito al distretto |
| `cure-palliative/`, `js/palliative.js` | Modulo 11: cure palliative, richiesta scritta |
| `prevenzione/`, `js/prevenzione.js` | Modulo 12: screening e vaccini gratuiti per età |
| `medico-famiglia/`, `js/medico.js` | Modulo 13: scelta del medico o del pediatra |
| `numeri-utili/`, `js/numeri.js`, `data/numeri.json` | Numeri utili nazionali e, per provincia, i contatti dell'ASP (`contacts` in `asp-sicilia.json`) |
| `js/flow.js` | Navigazione comune ai moduli nuovi (schermate, Indietro, Ascolta, Fonti) |
| `js/engine.js` | Regole sulle date (funzioni pure, testate) |
| `js/letters.js` | Modelli di lettera (DA VERIFICARE con il legale) |
| `js/common.js` | Piè di pagina, aiuto, lettura ad alta voce, copia/stampa |
| `data/*.json` | Regole nazionali e contatti di ASP e INPS |
| `fonts/` | Carattere Nunito incluso nel sito (licenza SIL OFL) |
| `privacy.html`, `note-legali.html`, `fonti.html` | Privacy, chi siamo, fonti |

## Pubblicarlo gratis su GitHub Pages

Repository → **Settings → Pages** → *Deploy from a branch* → scegli il ramo e `/ (root)` → Save.

## Prima del lancio

- Cerca `TODO` nel codice e nei dati e risolvi ogni punto (telefonate agli URP, revisione del legale).
  Le domande da fare al telefono sono in [docs/domande-urp.md](docs/domande-urp.md).
- Sostituisci `MAINTAINER_EMAIL` in `js/common.js` e il nome del responsabile in `note-legali.html`.
- Fai provare il sito a qualche persona anziana e annota dove si blocca.
- Ricontrolla i dati delle ASP dopo il nuovo piano regionale (≈ 22/12/2026), poi ogni 3 mesi.
  Annota ogni modifica in `CHANGELOG.md`.
- Ogni gennaio (e dopo la legge di bilancio) ricontrolla le cifre che cambiano: elenco con pagine e fonti in
  [CIFRE-DA-CONTROLLARE.md](CIFRE-DA-CONTROLLARE.md).
- Controlli e decisioni ancora aperti (ausili, screening epatite C, contatti di Enna e Trapani…):
  [DA-VERIFICARE-A-MANO.md](DA-VERIFICARE-A-MANO.md).

## Licenza

Codice: MIT ([LICENSE](LICENSE)). Testi: CC BY 4.0.
