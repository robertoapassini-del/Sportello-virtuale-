# Ci penso io

Sito gratuito che dice alle persone in Sicilia cosa spetta loro, entro quando e come chiederlo: sanità, cure e invalidità. Moduli:

- **Modulo 1 – Liste d'attesa:** la visita o l'esame è troppo lontano rispetto alla classe di priorità della ricetta.
- **Modulo 2 – Invalidità civile:** la visita per l'invalidità non arriva entro i tempi di legge.
- **Modulo 3 – Cartella clinica e referti:** l'ospedale non consegna la copia entro 30 giorni (L. 241/1990).
- **Modulo 4 – Ausili e protesi:** l'ASP non autorizza carrozzina, letto, pannoloni ecc. entro 20 giorni (DPCM 12/01/2017).
- **Modulo 5 – Esenzione ticket:** calcolo dell'esenzione per età e reddito (codici E01–E04) e come ottenerla.
- **Modulo 6 – Ricorso invalidità:** 6 mesi dal verbale per il ricorso; quanto tempo resta e cosa fare.
- **Modulo 7 – Assegno di inclusione:** condizioni principali (famiglia, residenza, ISEE) e come fare domanda.
- **Modulo 9 – Piano terapeutico:** cos'è, chi lo fa, quando prenotare il rinnovo.
- **Modulo 10 – Assistenza domiciliare (ADI):** come si chiede al distretto; sollecito dopo 30 giorni.
- **Modulo 12 – Prevenzione gratuita:** screening e vaccini gratuiti per età e sesso, come prenotarli.
- **Modulo 13 – Medico di famiglia e pediatra:** come scegliere o cambiare, scelta temporanea, lettera se non c'è posto.
- **Modulo 11 – Cure palliative:** diritto della L. 38/2010, attivazione a casa o in hospice, richiesta scritta.

Requisiti completi: [SPEC.md](SPEC.md).

## Principi

- **Semplicissimo per tutti**, anche per chi legge poco: frasi brevi, una sola domanda per schermata, pulsanti
  grandi con icone, pulsante **🔊 Ascolta** che legge la pagina ad alta voce, riquadro «Chi può aiutarti».
- **Niente server, niente database, niente cookie, niente intelligenza artificiale.** Tutto funziona nel browser;
  niente viene salvato o inviato.
- **Decide il computer con regole fisse** (`js/engine.js`).
- I dati di ASP e INPS si aggiornano a mano nei file `data/*.json`, ognuno con data di verifica e fonte.

## Regole per scrivere i testi

- Frasi brevi, un'idea per frase, parole di tutti i giorni (es. «foglio della prenotazione», non «promemoria»).
- Le parole tecniche (PEC, URP, CUP) si spiegano la prima volta.
- I riferimenti di legge vanno nei riquadri «Per saperne di più», non nel testo principale.
- Le lettere per gli uffici restano in linguaggio formale: sono per l'ASP o l'INPS, non per l'utente.
- Nei file `data/` le cose da verificare vanno **solo** nel campo `todo` (non viene mostrato). Un test
  controlla che nessun «TODO» arrivi agli utenti.

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
| `index.html`, `js/home.js`, `data/moduli.json` | Pagina iniziale: scelta guidata in 2 passi, ricerca per parola |
| `liste-attesa/`, `js/liste-attesa.js` | Modulo 1: domande, risultato, lettera, «E adesso?» |
| `invalidita/`, `js/invalidita.js` | Modulo 2: scadenza, sollecito all'INPS, cosa portare |
| `cartella-clinica/`, `js/cartella.js` | Modulo 3: scadenza 30 giorni, sollecito all'ospedale |
| `ausili/`, `js/ausili.js` | Modulo 4: scadenza 20 giorni, sollecito all'ASP, consegna |
| `esenzione-ticket/`, `js/esenzione.js` | Modulo 5: calcolo esenzione per reddito |
| `ricorso-invalidita/`, `js/ricorso.js` | Modulo 6: scadenza di 6 mesi per il ricorso |
| `assegno-inclusione/`, `js/adi.js` | Modulo 7: condizioni per l'assegno di inclusione |
| `piano-terapeutico/`, `js/piano.js` | Modulo 9: piano terapeutico e rinnovo |
| `assistenza-domiciliare/`, `js/domiciliare.js` | Modulo 10: ADI, sollecito al distretto |
| `cure-palliative/`, `js/palliative.js` | Modulo 11: cure palliative, richiesta scritta |
| `prevenzione/`, `js/prevenzione.js` | Modulo 12: screening e vaccini gratuiti per età |
| `medico-famiglia/`, `js/medico.js` | Modulo 13: scelta del medico o del pediatra |
| `js/flow.js` | Navigazione comune ai moduli nuovi (schermate, Indietro, Ascolta, Fonti) |
| `js/engine.js` | Regole sulle date (funzioni pure, testate) |
| `js/letters.js` | Modelli di lettera (DA VERIFICARE con il legale) |
| `js/common.js` | Piè di pagina, aiuto, lettura ad alta voce, copia/stampa |
| `data/*.json` | Regole nazionali e contatti di ASP e INPS |
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

## Licenza

Codice: MIT ([LICENSE](LICENSE)). Testi: CC BY 4.0.
