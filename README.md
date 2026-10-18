# Diritto in Tempo

A free, static website that helps people in Sicily use their legal right to a medical visit or exam within the
maximum waiting time on their prescription (module 1, **liste d'attesa**), and to know the legal deadline for the
disability assessment visit (module 2, **invalidità civile**). Full requirements: [SPEC.md](SPEC.md).

- **No backend, no database, no cookies, no AI.** Everything runs in the browser; nothing is saved or sent.
- **The computer decides with fixed rules** (`js/engine.js`), never an AI.
- All ASP/INPS details are maintained by hand in `data/*.json`, each with a `last_verified` date and source.

## Run it on your computer

The pages load JSON files, so they need a tiny local web server (opening the file directly won't work):

```bash
python3 -m http.server 8080      # or: npm start
# then open http://localhost:8080
```

## Tests

```bash
npm test
```

Covers every class (U, B, D-visit, D-exam, P) for: same day, exactly at the limit, one day over; Result C call-back
deadlines; invalidità regimes and 15/30/90-day deadlines; data-file completeness; letter generation.

## Project layout

| Path | What it is |
|---|---|
| `index.html` | Home: choose a module |
| `liste-attesa/`, `js/liste-attesa.js` | Module 1 question flow, results, letter, "E adesso?" |
| `invalidita/`, `js/invalidita.js` | Module 2 flow, deadline, INPS reminder letter |
| `js/engine.js` | Date rules (pure functions, tested) |
| `js/letters.js` | Letter templates (TODO-VERIFY: lawyer review) |
| `js/common.js` | Footer, disclaimer, copy/print, maintainer email |
| `data/rules.json`, `data/rules-invalidita.json` | National rules |
| `data/asp-sicilia.json`, `data/inps-sicilia.json` | Hand-maintained contacts per ASP / INPS office |
| `privacy.html`, `note-legali.html`, `fonti.html` | Privacy, legal notes, sources & verification dates |

## Publish on GitHub Pages (free)

Repository → **Settings → Pages** → Source: *Deploy from a branch* → pick the branch and `/ (root)` → Save.
All links are relative, so it also works under `https://<user>.github.io/<repo>/`.

## Before public launch (from the spec)

- Search the code and data for `TODO` / `TODO-VERIFY` and resolve each (phone the URP offices, lawyer review).
- Replace `MAINTAINER_EMAIL` in `js/common.js` and the placeholders in `note-legali.html`.
- Re-check all ASP data after Sicily adopts its new regional plan (≈ 22 Dec 2026), then every 3 months
  (see SPEC §9b). Log every data change in `CHANGELOG.md`.

## Licence

Code: MIT ([LICENSE](LICENSE)). Content: CC BY 4.0.
