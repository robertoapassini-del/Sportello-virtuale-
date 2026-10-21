# Regola per i numeri di telefono e gli indirizzi

Un numero sbagliato fa perdere tempo a chi sta male o assiste un malato. Per questo **ogni numero, indirizzo o
sede mostrato sul sito segue questa regola**, senza eccezioni. Il test `tests/contatti.test.mjs` la fa
rispettare: se un dato non è in regola, `npm test` fallisce e il sito non va pubblicato.

## 1. Cosa si può pubblicare

- **Solo numeri trovati su una fonte ufficiale**: il sito dell'ASP (anche i suoi sottodomini, come
  `cup.asp.sr.it` o `old.asp.messina.it`), dell'INPS, del Ministero, della Regione, dell'ISS, oppure
  l'elenco ufficiale di un ospedale.
- **Mai un numero visto solo su un giornale, un elenco telefonico o un sito di orari.** I giornali servono
  solo per accorgersi che qualcosa è cambiato: poi si cerca la conferma ufficiale o si telefona.
- Se il numero non si trova, **meglio nessun numero** e un rimando («chiedi al centralino dell'ASP»,
  link alla pagina ufficiale) che un numero incerto.

## 2. Come si controlla un numero

Per **ogni** numero, ogni volta:

1. **Apri la pagina ufficiale** e controlla numero, ufficio, indirizzo e orari.
2. **Cerca le notizie degli ultimi 12 mesi** su chiusure e traslochi. Cerca il nome dell'ufficio o della
   sede insieme a: «chiusura», «chiuso», «trasferimento», «nuova sede», «nuovo numero», «sospeso»,
   «Casa di Comunità». *Esempio:* la Casa di Comunità di via Saffi a Messina ha chiuso il 30/05/2026 e il PUA
   si è spostato in via del Vespro. La pagina dell'ASP con il vecchio indirizzo era ancora online: solo le
   notizie lo dicevano.
3. Se la pagina ufficiale e le notizie non vanno d'accordo, **vince la data più recente**, ma serve
   comunque la conferma ufficiale o una telefonata.
4. Scrivi nel file di dati:
   - `url`: la pagina ufficiale dove c'è il numero;
   - `verified`: il giorno del controllo (AAAA-MM-GG);
   - `proof`: come l'hai controllato:
     - `"telefono"`: hai chiamato e ti hanno confermato numero, ufficio e sede (la prova migliore);
     - `"pagina"`: hai letto la pagina ufficiale;
     - `"estratto"`: il sito ufficiale non si apriva e hai letto solo l'estratto della pagina mostrato dal
       motore di ricerca. Si può pubblicare, ma va confermato con una telefonata al controllo successivo.
     - `"archivio"`: il sito ufficiale non si apriva e hai letto la copia della pagina ufficiale su
       web.archive.org. In `url` va la pagina ufficiale (non quella dell'archivio) e in `archived` la data
       della copia. Va confermato con una telefonata, soprattutto se la copia ha più di qualche mese.
5. Annota la modifica in `CHANGELOG.md`, con la fonte.

### Se il sito dell'ASP non si apre

Molti siti delle ASP siciliane **bloccano chi si collega dall'estero** (per esempio da Ginevra, o dai server
negli Stati Uniti usati da GitHub e dagli strumenti di ricerca). Il 18/10/2026, dall'Italia rispondevano tutti
e 9; dall'estero ne funzionavano solo 2. Quindi:

- **Un sito che non si apre non vuol dire che l'ufficio ha chiuso.** Prima di tutto controlla se il sito
  risponde dall'Italia con [check-host.net](https://check-host.net/check-http), nodo di Milano
  (`it2.node.check-host.net`). Questo strumento dice solo se il sito risponde, non mostra la pagina.
- Per **leggere** la pagina serve una connessione italiana (una VPN con server in Italia, o qualcuno in Italia
  che apre la pagina). In alternativa si può usare la copia su
  [web.archive.org](https://web.archive.org), annotando la data della copia, oppure l'estratto della pagina
  mostrato dal motore di ricerca (`proof: "estratto"`).
- Una pagina che dall'Italia risponde **404 (non trovata)** è un segnale di possibile chiusura o trasloco:
  cerca subito le notizie.

## 3. Ogni quanto

- **Ogni 3 mesi tutti i numeri.** Il test fallisce se un numero ha `verified` più vecchio di **92 giorni**:
  vuol dire che è ora di ricontrollare.
- **Subito** quando qualcuno segnala un errore, o quando si legge di una chiusura o di un trasloco.
- I numeri con `proof: "estratto"` si confermano con una telefonata al primo giro utile (le domande sono in
  [domande-urp.md](domande-urp.md)).

## 4. Dove stanno i numeri

| File | Campi |
|---|---|
| `data/regioni/sicilia/asp.json` | `phones` (numeri principali, nei moduli) e `contacts` (tutti i numeri dell'ASP, per argomento) |
| `data/numeri.json` | numeri nazionali e regionali (`groups[].items[]`) |

Ogni numero ha: `number`, `label` o `title`, `url`, `verified`, `proof` (e `archived` se la prova è `archivio`). Facoltativi: `address`, `hours`. Le cose ancora da chiarire vanno solo
nel campo `todo` dell'ASP, che non viene mostrato.
