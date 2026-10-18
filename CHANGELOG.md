# Registro delle modifiche

Ogni modifica ai file `data/*.json` va annotata qui, con la fonte.

## 18/10/2026 — nuovo logo
- Simbolo: una mano che sostiene un cuore, in verde acqua (`logo.svg`). Anche come icona della scheda del browser.

## 18/10/2026 — nuovo aspetto
- Stile ispirato a Unimamma, in **verde acqua** (#0F7C78): sfondo bianco, titoli verde acqua, carattere tondo Nunito, sfumatura verde menta in home, riquadri e pulsanti arrotondati con ombra leggera, logo con segno sfumato verde acqua.
- Il carattere Nunito è incluso nel sito (`fonts/`, licenza SIL OFL): nessun file caricato da siti esterni.

## 18/10/2026 — solo salute
- Nuovo modulo **Prevenzione gratuita** (`rules-prevenzione.json`): mammografia 50–69 ogni 2 anni, Pap test 25–29 ogni 3, HPV 30–64 ogni 5, colon 50–69 ogni 2; vaccini influenza da 60, pneumococco e zoster da 65, richiamo tetano ogni 10 anni. Numero screening ASP Catania 800 894 007. Da verificare: fasce siciliane e numeri delle altre ASP.
- Nuovo modulo **Medico di famiglia e pediatra** (`rules-medico.json`, campo `scelta_medico` per ASP): pediatra fino a 6 anni, scelta 6–14, medico dai 14; scelta temporanea per domiciliati; lettera all'ASP se non c'è posto. Catania: app ASPConTe. Da verificare: canali online delle altre ASP, massimali.
- Home: nuovo gruppo «Prevenzione e medico di famiglia».
- Tolto il modulo «Permesso di soggiorno» (pagina, regole, test, fonti, domande): il sito si concentra sulla salute.

## 18/10/2026 — «Non hai la PEC?»
- Sotto ogni lettera, un riquadro con 4 modi per mandarla senza PEC: patronato, a mano con timbro, raccomandata A/R, familiare con delega.
- Il test delle combinazioni controlla che ci sia in ogni schermata con una lettera.

## 18/10/2026 — nome definitivo: Ci penso io
- «Cosa mi spetta» era già usato da un sito di bonus. Nuovo nome «Ci penso io» (dominio cipensoio.it).
- Email segnaposto: info@cipensoio.it.

## 18/10/2026 — nuovo nome: Cosa mi spetta
- Il sito copre anche aiuti economici e documenti, non solo sanità: da «Aiuto Sanità» a «Cosa mi spetta».
- Email segnaposto: info@cosamispetta.it (dominio da verificare).

## 18/10/2026 — pagina iniziale a scelta guidata
- Prima una sola domanda con 4 grandi riquadri, poi al massimo 4 scelte. Elenco dei moduli in `data/moduli.json`.
- Casella «Scrivi una parola» per chi aiuta; pulsante Ascolta anche in home.
- In fondo a ogni schermata: «Ti serve altro? Torna all'inizio».

## 18/10/2026 — cinque moduli suggeriti dagli utenti
- **Assegno di inclusione** (`rules-adi.json`): famiglia, 5 anni di residenza, ISEE ≤ 10.140 €; domanda INPS/patronato/CAF.
  Da verificare: soglie 2026 (ISEE, reddito, patrimonio).
- **Permesso di soggiorno** (`rules-permesso.json`): rinnovo 60 giorni prima (art. 5 D.Lgs. 286/1998); kit postale o Questura;
  tolleranza di 60 giorni dopo la scadenza (prassi). Da verificare: tipi di permesso per canale, costi.
- **Piano terapeutico** (`rules-piano.json`): prenotare il rinnovo 60 giorni prima della scadenza. Da verificare: proroghe regionali.
- **Assistenza domiciliare** (`rules-domiciliare.json`): LEA art. 22; nessun termine di legge; sollecito dopo 30 giorni.
  Da raccogliere: contatti dei PUA per distretto.
- **Cure palliative** (`rules-palliative.json`): L. 38/2010; sollecito dopo 7 giorni. Da raccogliere: numeri della rete per provincia.
- Le lettere dei moduli diversi dal percorso di tutela vanno ora all'URP o alla PEC generale dell'ASP, non alla casella
  dedicata alle liste d'attesa (Palermo e Caltanissetta ne hanno una).
- Home riorganizzata in 4 gruppi. Test delle combinazioni: 1735 percorsi.

## 18/10/2026 — altri due moduli
- **Esenzione ticket**: calcolo con regole fisse per età e reddito (E01 ≤ 36.151,98 €; E02/E04 8.263,31 €,
  11.362,05 € con coniuge, +516,46 € per figlio; E03 senza limite). Nuovo file `data/rules-esenzione.json`.
  Da verificare: soglie aggiornate e codici C01–C03. Le medicine (regole regionali) non sono calcolate.
- **Ricorso invalidità**: 6 mesi dal verbale (art. 42 D.L. 269/2003), ATP, gratuito patrocinio, aggravamento.
  Nuovo file `data/rules-ricorso.json`. Da verificare con il legale: termine nella nuova procedura, soglia del
  gratuito patrocinio.
- Test delle combinazioni: ora 1594 percorsi.

## 18/10/2026 — link corretti dopo prova dal telefono
- ASP Enna: www.aspenna.it è l'indirizzo giusto ma il 18/10/2026 il sito non si apriva (problema del sito, non del link). Lasciato com'è.
- INPS: la pagina contatti non si apre → sostituita con la pagina iniziale www.inps.it.
- Tutti gli altri 30 link esterni aperti e funzionanti (prova del 18/10/2026).

## 18/10/2026 — due nuovi moduli
- **Cartella clinica e referti**: scadenza di 30 giorni dalla richiesta scritta (art. 25 L. 241/1990), come chiedere,
  sollecito alla Direzione sanitaria. Nuovo file `data/rules-cartella.json`.
- **Ausili e protesi**: autorizzazione dell'ASP entro 20 giorni, poi silenzio-assenso (art. 18 DPCM 12/01/2017),
  percorso «autorizzato ma non consegnato», sollecito all'ufficio protesica. Nuovo file `data/rules-ausili.json`.
- Da verificare con il legale: commi esatti del silenzio-assenso e del silenzio-rigetto. Da raccogliere: contatti
  degli uffici protesica e cartelle cliniche (vedi `docs/domande-urp.md`).
- Test delle combinazioni: ora 1074 percorsi.

## 18/10/2026 — fonti in ogni pagina
- Riquadro «Da dove vengono queste informazioni» in fondo a ogni schermata, con i link alle leggi
  (normattiva.it, Gazzetta Ufficiale, Ministero della Salute) e alle pagine ufficiali dell'ASP scelta o dell'INPS.
- `data/rules.json`, `data/rules-invalidita.json`, `data/inps-sicilia.json`: nuovo campo `sources` con i link.
- `data/asp-sicilia.json`: aggiunto il sito ufficiale per Trapani ed Enna (indirizzi da confermare).
- Nota: i link non sono stati aperti dall'ambiente di sviluppo (rete bloccata): vanno provati a mano.

## 18/10/2026 — nuovo nome: Aiuto Sanità
- Il sito si chiama ora «Aiuto Sanità» (prima «Diritto in Tempo»).
- Frase «Siamo volontari: non siamo l'ASP né l'INPS» nella pagina iniziale, nel piè di pagina e in «Chi siamo».

## 18/10/2026 — voce senza emoji
- Il pulsante «Ascolta» non legge più le emoji (diceva per esempio «puntina arrotondata dove abiti»).
- Il test delle combinazioni ora preme «Ascolta» in ogni schermata e controlla il testo letto.

## 18/10/2026 — controllo di tutte le combinazioni
- `data/asp-sicilia.json`: il fast track ha ora testo e telefono per ogni classe. Corregge Catania classe U,
  che mostrava il numero verde 800 954414 (valido solo per la classe B). Nessun contatto cambiato.
- Il sito non accetta più giorni nel futuro per prenotazione, richiesta al CUP e domanda INPS.
- Nuovo test `tests/combinazioni.cjs` (948 percorsi).

## 18/10/2026 — testi semplificati
- Tutti i testi riscritti in italiano semplice; pulsanti con icone; pulsante «Ascolta»; riquadro «Chi può aiutarti».
- `data/asp-sicilia.json`: nuovi campi `details` (informazioni in più) e `todo` (note interne, non mostrate).
  Testi `how_to`, `what_next`, `notes` riscritti. Nessun contatto cambiato.

## 18/10/2026 — prima versione (MVP)
- Modulo 1 (liste d'attesa) e modulo 2 (invalidità civile) costruiti da SPEC.md v2.2.
- `data/asp-sicilia.json`: 9 ASP dalla ricerca del 18/10/2026 (Palermo verificata; Ragusa, Caltanissetta, Messina,
  Siracusa, Agrigento, Catania in parte; Trapani, Enna da verificare). Fonti in ogni scheda.
- `data/inps-sicilia.json`: procedura per provincia dall'elenco del Dipartimento disabilità + messaggio INPS 639/2026.
  Indirizzi PEC costruiti sul formato standard INPS — tutti da verificare.
