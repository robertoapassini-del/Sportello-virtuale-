# Regola per le cifre di legge

Una soglia di reddito sbagliata, un termine di giorni sbagliato o un'età sbagliata fanno perdere un diritto.
Per questo **ogni cifra mostrata sul sito** (importi in euro, giorni, mesi, anni, ore, percentuali, numero
di pazienti) segue questa regola, come già i numeri di telefono ([regola-numeri.md](regola-numeri.md)).
Due test la fanno rispettare: se una cifra non è in regola, `npm test` fallisce e il sito non va pubblicato.

## 1. La cifra sta nei dati, una volta sola

- Ogni cifra vive in un file `data/rules*.json`. Le schermate la leggono da lì.
- La guida scritta della pagina (`<cartella>/index.html`) e il file `js/` del modulo possono ripeterla,
  ma **deve essere la stessa**. Il test `tests/cifre.test.mjs` legge ogni cifra della guida e del js e la
  cerca nel file di dati del modulo (`data/moduli.json` → `data`). Fallisce se:
  - la cifra è diversa da quella nei dati (per esempio dopo un aggiornamento fatto a metà);
  - la cifra non sta in nessun file di dati: un numero inventato, un refuso, o un numero che prima va
    messo nei dati.
- La cifra deve avere la stessa unità del dato, che il test legge dal nome del campo («_days»/«_giorni» →
  giorni, «_ore» → ore, «_months»/«_mesi» → mesi, «_anni»/«age» → anni, «isee»/«income»/«euro» → euro,
  «percent» → %): «40 giorni» non torna con un'età di 40 anni. Il controllo vale anche per `<title>` e descrizioni.
- Sono accettate senza dichiararle le cifre che derivano in modo ovvio da un dato: «72 ore» per 3 giorni,
  «fino a 64 anni» per il limite dei 65, «da 6 a 13 anni» per il limite dei 14.
- Gli **esempi** («se spendi 1.129,11 euro…») e gli **arrotondamenti** («circa 13.660 euro») vanno
  dichiarati nell'elenco `ECCEZIONI` del test, con il motivo e, quando si può, il calcolo che li lega al
  dato: così se il dato cambia, anche l'esempio va rifatto. Un'eccezione che non serve più fa fallire il
  test: va tolta.

## 2. Ogni cifra ha la sua scheda: fonte, data, prova, ricontrollo

In ogni file `data/rules*.json` c'è il blocco `provenienza`. Per ogni cifra (o gruppo di cifre: per
esempio `codes.E01`, `screening.pap`, `max_wait_days`) c'è una scheda:

```json
"provenienza": {
  "gratuito_patrocinio_income": {
    "url": "https://www.gazzettaufficiale.it/…",
    "verified": "2026-10-19",
    "proof": "estratto",
    "review_by": "2027-07-31",
    "nota": "DM Giustizia 22/04/2025. Aggiornamento ISTAT ogni due anni: il prossimo nel 2027."
  }
}
```

- `url`: la pagina ufficiale da cui viene la cifra (Gazzetta Ufficiale, Normattiva, Ministero, INPS,
  Regione, ASP). Non serve solo per `proof: "sito"`.
- `verified`: il giorno del controllo (AAAA-MM-GG).
- `proof`: come è stata controllata:
  - `"testo"`: letto **per intero** il testo ufficiale (la legge, il decreto, la pagina del Ministero).
    È la prova migliore.
  - `"estratto"`: letto solo l'estratto mostrato dal motore di ricerca, o un pezzo della pagina (succede
    quando i siti ufficiali non si aprono dall'estero). Si può pubblicare, ma al primo giro utile va riletto
    per intero da una connessione italiana e portato a `"testo"`.
  - `"secondaria"`: la cifra viene da una fonte non ufficiale (decalogo di un'ASP, operatori del settore,
    stampa). Da confermare sulla fonte primaria o con una telefonata.
  - `"sito"`: non è una regola di legge ma una **scelta del sito** (per esempio dopo quanti giorni senza
    risposta consigliamo il sollecito). Si scrive il perché in `nota`.
- `review_by`: la data entro cui la cifra va ricontrollata. Si sceglie dall'evento che la può cambiare:
  - legge di bilancio → **31 gennaio** dell'anno dopo (soglie ADI, esenzione ticket, detrazioni);
  - circolare annuale (vaccino antinfluenzale) → fine dell'autunno;
  - accordo collettivo dei medici → dopo la sua uscita (ACN del 18/03/2026: 31/03/2027);
  - piano regionale delle liste d'attesa → la data in cui è atteso (22/12/2026);
  - riforma della disabilità → 01/01/2027, quando vale in tutta Italia;
  - cifre ferme da anni → comunque **un anno** dal controllo.
- `nota` (facoltativa): quello che chi ricontrolla deve sapere (dubbi aperti, cosa è cambiato).

Il test `tests/provenienza.test.mjs` fallisce se una cifra non ha la scheda, se la scheda è incompleta,
se rimanda a un campo che non esiste più, o se `review_by` è passata. Per provare cosa succederà tra qualche
mese: `OGGI=2027-02-01 npm test`.

Il campo `provenienza` è **interno**: le pagine non lo mostrano (un test controlla che nessun file `js/` lo legga).
Le fonti mostrate agli utenti restano in `sources`.

## 3. Come si aggiorna una cifra

1. Rileggi la fonte ufficiale per intero.
2. Cambia il valore nel file `data/…json`.
3. Nella sua scheda in `provenienza`: `verified` di oggi, `proof` giusto (`testo` se l'hai letta per
   intero), nuova `review_by`, e in `nota` cosa è cambiato.
4. Cambia lo stesso numero nella guida scritta e, se c'è, nel js del modulo. `npm test` ti dice dove.
5. `npm run pagine`, poi `npm test`.
6. Scrivi la modifica in `CHANGELOG.md`, con la fonte.

## 4. Ogni quanto

- **Quando `npm test` lo chiede**: il test fallisce il giorno dopo `review_by`. È il promemoria.
- **Ogni gennaio** (dopo la legge di bilancio) tutte le cifre con `review_by` a fine gennaio: l'elenco
  per argomento, con le pagine da rileggere, è in [CIFRE-DA-CONTROLLARE.md](../CIFRE-DA-CONTROLLARE.md).
- **Subito** quando il controllo automatico segnala una novità in Gazzetta Ufficiale o dall'INPS che
  riguarda una cifra.
