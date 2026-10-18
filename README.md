# Aiuto Sanità

Sito gratuito che aiuta le persone in Sicilia a far valere i tempi massimi di attesa:

- **Modulo 1 – Liste d'attesa:** la visita o l'esame è troppo lontano rispetto alla classe di priorità della ricetta.
- **Modulo 2 – Invalidità civile:** la visita per l'invalidità non arriva entro i tempi di legge.

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
| `index.html` | Pagina iniziale: scegli il problema |
| `liste-attesa/`, `js/liste-attesa.js` | Modulo 1: domande, risultato, lettera, «E adesso?» |
| `invalidita/`, `js/invalidita.js` | Modulo 2: scadenza, sollecito all'INPS, cosa portare |
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
