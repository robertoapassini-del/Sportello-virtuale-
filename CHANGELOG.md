# Registro delle modifiche

Ogni modifica ai file `data/*.json` va annotata qui, con la fonte.

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
