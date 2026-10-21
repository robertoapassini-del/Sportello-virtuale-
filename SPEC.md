# Diritto in Tempo — Build Spec (MVP, Sicily) — v2.2

> v2.2 adds a second module: **Invalidità civile** (section 12). Build module 1 (liste d'attesa) first;
> module 2 reuses the same engine (deadline check + letter + contacts).

> Hand this file to Claude Code. Put it in an empty project folder and say:
> "Read SPEC.md and build the MVP described in it, step by step. Explain each step to me very simply."
>
> Research status: 18 October 2026. Items marked **TODO-VERIFY** were not confirmed online and must be
> checked (phone/email to the ASP's URP office, or by the lawyer) before public launch.

---

## 1. What we are building

**Format: a website, not a mobile app.** No app stores, no installation, no account. It must work
perfectly in a phone browser (most users will arrive from WhatsApp links) and be shareable as a plain
URL, e.g. dirittointempo.it/liste-attesa and dirittointempo.it/invalidita.

A free website that helps people in Sicily use their legal right to get a medical visit or exam
**within the maximum waiting time** written on their prescription. The user enters a few facts from
their prescription and CUP booking. The site tells them whether the legal limit is exceeded and,
if yes, exactly how to activate the **"percorso di tutela"** at their own ASP (provincial health
authority): which form, which email/PEC/portal, which documents, what happens next.

**Why it is needed:** each of Sicily's 9 ASPs has a different channel (email, PEC, SPID portal, URP desk,
fast-track desk), addresses change, and the national waiting-list platform gives citizens no guidance
on how to request tutela. Patient associations call it a "Babel" of procedures.

**Name:** Diritto in Tempo. **Site language:** Italian (English toggle later).

## 2. Core principles (do not break these)

1. **The computer decides with fixed rules, never the AI.** Eligibility is a simple date calculation.
2. **No health data leaves the user's device.** No database, no login, no server storage.
   Everything runs in the browser. Nothing is kept after the tab is closed.
3. **We inform, we don't give legal or medical advice.** Clear disclaimer on every result page.
4. **Every ASP detail shows a "last verified" date and a link to the official source.**
5. **Never automate CUP/booking portals, logins or CAPTCHAs.** Public *information* pages of the
   ASLs (contacts, opening hours, how-to pages) may be read by a polite, identified script at low
   frequency (once a day, one page at a time, from a server in Italy because many ASL sites refuse
   foreign connections) to keep the data current. The script only proposes changes; a person
   approves them. Details: `docs/regioni.md`, «Aggiornamento assistito».

## 3. Tech stack (beginner-friendly)

- **Static website**: plain HTML + CSS + JavaScript, or Vite + React. No backend.
- ASP data in **one file**: `data/asp-sicilia.json` (section 6). Rules in `data/rules.json`.
- Letter generation in the browser. Buttons: "Copia testo", "Scarica PDF", "Apri email" (mailto: link
  pre-filled with recipient + subject; the user attaches documents themselves).
- Hosting: **GitHub Pages** or **Vercel** (free).
- **No AI in version 1** (see section 10).

## 4. Legal rules the tool uses

### 4.1 Legal basis (current)
- **PNGLA 2026-2028**: adopted by Ministry of Health decree of 26 June 2026, published in Gazzetta
  Ufficiale n. 195 of 24 August 2026 (Suppl. Ord. n. 32). Replaces PNGLA 2019-2021.
- **Regions must adopt their new regional plans within 120 days** of entry into force
  (≈ 22 December 2026). **Sicily's procedures may change after that date** → plan a data review.
- D.L. 73/2024 (converted by L. 107/2024) — waiting-list law.
- **D.Lgs. 124/1998, art. 3, commi 10 e 13** — if the ASP can't guarantee the time limit, the service is
  provided in intramoenia (ALPI) with the patient paying only the ticket (as described by ASP Palermo).
  **TODO-VERIFY:** lawyer to confirm exact wording.
- Sicily: regional decree **D.A. n. 212 of 28 Feb 2024** (requirements for waiting-list web pages).

### 4.2 Maximum waiting times (confirmed in PNGLA 2026-2028)
| Class | Maximum wait |
|---|---|
| **U** – Urgente | 72 hours |
| **B** – Breve | 10 days |
| **D** – Differibile | 30 days for **visits**; 60 days for **diagnostic exams** |
| **P** – Programmabile | 120 days |

### 4.3 Eligibility checks (all must be true)
1. **First access** (prima visita / prima prestazione diagnostica). **Follow-up/control visits are
   excluded** everywhere (Ragusa, Caltanissetta, Agrigento state this explicitly).
2. Prescription has a **priority class**.
3. Service is among those monitored by the PNGLA (MVP: show a note; full list = PNGLA annex,
   **TODO-VERIFY**).
4. User booked via official channels and **did not refuse the first date offered**. Refusing the first
   availability (e.g. to choose a preferred hospital) takes the booking out of the guarantee
   (ASP Enna, ASP Messina, ASP Agrigento).
5. **Days between booking date and appointment date offered > limit** for the class.
   - Ask D-class users: visit or exam?
   - Equal to the limit = still OK; one day more = exceeded. U = 72 hours → treat as 3 calendar days.
   - **TODO-VERIFY with lawyer:** count from booking/contact date (how official monitoring measures it).
6. User is resident in the ASP's province ("ambito territoriale di garanzia" = province in most ASPs;
   Messina has 3 sub-areas, see 6). The request goes to the **ASP of residence**, even if the booking was
   made at a hospital trust (Policlinico, Cannizzaro, Papardo, etc.). Domicile-only (e.g. students,
   workers) **TODO-VERIFY**.
7. The prescription must still be valid and booked promptly. **Sicily (checked 18/10/2026):** a regional
   decree sets prescription validity at **180 days** for booking, and once booked the prescription stays
   valid until the appointment; **no class-specific booking deadline was found for Sicily** (unlike
   Lombardy: U within 10 days, B within 30 days from 15/09/2026; Lazio/Abruzzo: U 10, B 20, D 40/70,
   P 130; Veneto: B 20 days). Show users: "book as soon as possible; a late booking can lose the
   priority". **TODO-VERIFY** whether Sicily's new regional plan introduces deadlines.

### 4.4 Special routing for U and B
Several ASPs handle **U and B** through a dedicated **fast track** rather than the percorso di tutela
(Catania: CUP 800 954414, key 2; Trapani: "Fast Track" desk at every CUP; Agrigento: fast track for B).
→ For U/B, the result page shows the fast-track channel **first**, then the tutela route as backup.

### 4.5 What happens after the request (to set expectations)
- The ASP looks for a slot within the limit, in public or accredited private facilities in the area.
- **The guarantee period restarts from the date of the request** (stated by Caltanissetta and Siracusa).
- If no slot: service in **intramoenia (ALPI) paying only the ticket**.
- Palermo promises a **call back within 48 hours**.
- If the ASP doesn't answer in time, some ASPs allow going private **after explicit authorisation** and
  then claiming a refund (Caltanissetta, Siracusa).

### 4.6 Warnings to show users
- **Never go private first and ask for a refund later.** Always activate the percorso di tutela first.
- Keep the **booking sheet** (foglio/promemoria di prenotazione) showing the date offered.
- Don't skip the booked appointment without cancelling it: no-shows can be charged the ticket even
  if exempt (national rule; e.g. Catania, Agrigento).

## 5. User flow (screens)

1. **Home** — "Hai una prenotazione oltre i tempi previsti dalla tua ricetta? Verifica i tuoi diritti
   in 2 minuti." Button "Inizia". Notice: "Regole fisse, non è un consulto legale o medico."
2. **Province** (9 options). (Messina: no extra question; the 3 sub-areas are only shown as info.)
3. **First visit/exam or follow-up?** (follow-up → not eligible, explain, stop)
4. **Priority class**: U / B / D / P / "Non lo so" (show a drawn sample of the ricetta, not a real one).
   "Non lo so" or no class on the prescription → explain that the guarantee applies to first-access
   prescriptions with a class; suggest asking the prescribing doctor. (Some regions treat a missing class
   as D; Sicily rule **TODO-VERIFY**.)
5. **(Only D)** visit or exam?
6. **Did you accept the first date offered?** (No → explain the guarantee is lost; suggest re-booking.)
7. **What did the CUP say?** (a) a date was offered → ask **booking date** and **appointment date**;
   (b) no date at all / "agende chiuse" / put on a waiting list → branch **Result C**.
8. **Result A — within limit.**
   **Result C — no date offered:** under PNGLA 2026-2028 the ASP must put the user on a pre-list
   (lista di tutela) and call back within 5 days (B), 10 days (D visits), 15 days (D exams), 30 days (P).
   Tell the user to ask the CUP for written proof of the request (date + prescription number), then
   offer the same tutela request if the call-back deadline passes.
9. **Result B — limit exceeded:** ASP card (channel, address, form link, documents checklist,
   what happens next, last verified date). U/B → fast track shown first.
10. **Letter screen** (only for email/PEC/form ASPs): name, codice fiscale, address, phone, email,
    ID number, prescription number (NRE), service name. Used **only in the browser**.
11. **After sending ("E adesso?")** — shown after the letter: what to expect (call-back, restart of
    the guarantee period), and an escalation path if nothing happens: (1) reminder letter (sollecito)
    after the ASP's own deadline or 10 days; (2) complaint to the ASP's URP; (3) Regione Siciliana
    Assessorato della Salute URP; (4) patient associations: Cittadinanzattiva (PiT Salute),
    Associazione Luca Coscioni; (5) for a refund route, only after written authorisation.
    **TODO-VERIFY** contacts and the lawyer's view on the reminder text.
12. **Footer everywhere:** disclaimer, privacy ("nessun dato viene salvato"), sources, verified dates,
    "Segnala un errore" (simple mailto to the maintainer).

## 6. ASP data (`data/asp-sicilia.json`)

Fields per ASP: `id`, `name`, `channel` (`email` | `pec` | `online_portal` | `urp` | `mixed`),
`emails`, `pec`, `form_url`, `info_url`, `portal_url`, `phones`, `fast_track`, `documents_required`,
`notes`, `last_verified`, `status` (`verified` | `partial` | `todo`).

### Palermo — status: VERIFIED (official site, page updated 19/08/2026)
- Channel: **email** — fill the official editable PDF and send to **percorsoditutela@asppalermo.org**
  (the old address reclami@asppalermo.org is outdated).
- Form: https://www.asppalermo.org/wp-content/uploads/2026/08/Modulo-Richiesta-Accesso-al-Percorso-di-Tutela-revisionato-1.pdf
- Info: https://www.asppalermo.org/novita/percorso-di-tutela-lasp-di-palermo-garantisce-tempi-certi-per-le-prestazioni-specialistiche/
- Form fields: Cognome e Nome, Codice Fiscale, Indirizzo, Telefono, Email, PEC, Carta d'Identità
  (n°, data, rilasciata da), prestazione + numero prescrizione, motivazione ("Impossibilità di accesso
  nei tempi previsti dal SSN"), data, firma.
- Attach: ID copy; prescription (impegnativa); booking reminder (promemoria di prenotazione).
- ASP calls back **within 48 hours**; slot anywhere in the province; territorial exception for
  **disability, chronic-degenerative diseases, cancer in treatment**; fallback ALPI paying only ticket.
- General PEC: protocollo.pec@asppa.it · Switchboard: 091 7031111.
- **Best UX:** pre-fill the official PDF fields (or show the user exactly what to write), then mailto.

### Ragusa — status: PARTIAL (press Aug 2026 + official page)
- Channel: **online portal** with **SPID or CIE** on asp.rg.it (since 10 Aug 2026), automatic receipt.
  Paper form still accepted via URP during transition.
- Info + form: https://asp.rg.it/liste-attesa
- Documents: prescription with priority class; CUP booking showing the limit exceeded.
- Patient pays at most the ticket. Follow-ups excluded.
- **Best UX:** link to portal + checklist. No letter needed. **TODO-VERIFY** direct portal URL.

### Caltanissetta — status: PARTIAL (official regulation updated 15 Sep 2025)
- Channel: **email** to the Direzione Sanitaria: **percorso.tutela@asp.cl.it** with form **MOD-01**
  ("Istanza per prestazione di primo accesso in regime di percorso di tutela").
  (An older version used areacomunicazione@asp.cl.it — outdated.)
- Info: https://www.asp.cl.it/servizi/Menu/dinamica.aspx?idSezione=18109&idArea=84323&idCat=84329&ID=84329&TipoElemento=categoria
- MOD-01: https://www.asp.cl.it/servizi/moduli/moduli_fase02.aspx?ID=78346 (docx)
- Attach: SSN prescription (showing first access); CUP booking sheet showing the guarantee time is not
  met; name, surname, email, phone.
- If approved, the ASP emails back the authorisation with a **maximum refundable amount**; refund with
  **MOD-02** to **gestione.liste@asp.cl.it**.
- Guarantee time restarts from the request. CUP: 0934 506506. PEC: protocollo.asp.cl@pec.asp.cl.it.

### Messina — status: PARTIAL (official page; site blocks automated reading)
- Channel: **PEC** to **protocollogenerale@pec.asp.messina.it**, or **in person at any URP** office.
- Info + form: https://www.asp.messina.it/?page_id=397594
- Attach: personal data + valid ID copy (+ prescription and booking — **TODO-VERIFY** full list).
- Three "ambiti di garanzia": Messina-Taormina; Milazzo-Lipari-Barcellona P.G.;
  Patti-Sant'Agata di Militello-Mistretta.
- Condition: user accepted the first availability from SovraCUP call centre, regional app or pharmacy.
- URP offices list with addresses/hours: on www.asp.messina.it (link from the tutela page) — copy the
  Messina-city URP into the data file as the default.
- ⚠️ Users without their own PEC: sending from normal email to a PEC address may be rejected →
  suggest URP in person. **TODO-VERIFY** whether ordinary email is accepted.

### Siracusa — status: PARTIAL (official page; 2024 regulation)
- Channel: **email to URP** **urp.siracusa@asp.sr.it**, or in person at the nearest URP.
  (The 2024 regulation also mentions an online form via SPID on www.asp.sr.it — **TODO-VERIFY** if live.)
- Info: https://www.asp.sr.it/Servizi-e-prestazioni/Percorso-di-tutela
- Documents: completed and signed request (istanza); ID card; prescription; booking.
- Dedicated tutela email (contacts, refunds): **percorsoditutela@asp.sr.it**.
- URP phone 0931 312525 (key 3) · URP PEC: urp.siracusa@pec.asp.sr.it · CUP 0931 484848.
- Private visit only after the ASP's explicit authorisation (or no answer within the guarantee time);
  guarantee time restarts from the request.

### Agrigento — status: PARTIAL (official URP page; Delibera n. 426 of 10 Sep 2024)
- Channel: **URP** — form "Istanza per la presentazione del primo accesso in regime di percorso di
  tutela" on the URP page; email **urp@aspag.it**.
- Info: https://www.aspag.it/urp-nel-territorio-ufficio-relazioni-con-il-pubblico/
- B-class: handled via **fast track**. Chronic patients needing earlier controls: Cabina unica di regia
  0922 407365.
- PEC: protocollo@pec.aspag.it · Switchboard 0922 407111 · Cancellations 0922 407699 /
  disdettaprenotazione@aspag.it.

### Catania — status: PARTIAL (official procedure exists; channel unclear)
- Procedure approved by **Delibera n. 1650 of 31/10/2024**, updated by **Delibera n. 77 of 22/01/2025**.
- Info: https://www.aspct.it/azienda/direzione-generale/u-o-c-coordinamento-dello-staff/urp-e-comunicazione/percorsotutela/
- **U**: direct access to ASP clinics via fast track; **B**: book only via CUP toll-free **800 954414
  (key 2)**, where an operator books within the limit.
- D/P tutela submission channel: **TODO-VERIFY** (call URP). Note: the ASPConTe web app replaced email
  for many *territorial* services (GP choice etc.) from May 2025 — not confirmed for tutela.
- PEC: protocollo@pec.aspct.it. (URP 800 279761 / urp@aspct.it appear on an unofficial site —
  **TODO-VERIFY**.)

### Trapani — status: TODO (mechanism exists, channel not published online)
- **Fast Track** desk at every CUP for **U and B**.
- ASP calls the mechanism "Prestazioni garantite": tutela in accredited facilities or intramoenia at the
  ASP's expense. A regional MP filed an access-to-records request in July 2026 because the procedure is
  little known.
- D/P channel: **TODO-VERIFY** (call URP/CUP).

### Enna — status: TODO
- Company plan 2024-2026 commits to defining percorsi di tutela; no public channel found.
- CUP: 0935 520810, toll-free 800 679977, official WhatsApp 331 2661877 (warn users: fake SMS scams
  from "CUP" numbers circulate).
- Refusing the first availability exits the guarantee.
- Channel: **TODO-VERIFY** (call URP).

### Fallback for TODO ASPs
Result page: "Stiamo ancora verificando la procedura di questa ASP. Chiama l'URP o il CUP e chiedi di
attivare il 'percorso di tutela'." + generic letter for PEC/registered post to the ASP's general PEC
(take PECs from IndicePA, indicepa.gov.it).

### Regional channels (for "how to book first")
SovraCUP web https://sovracup.regione.sicilia.it and app (SPID/CIE + electronic prescription issued in
Sicily). Pharmacies can book on the user's behalf without SPID. Regional waiting-time portal: DASOE
"Costruire Salute" section (links to all ASPs) — useful for a "typical waits" info box later.

## 7. Letter template (Italian) — for ASPs without their own form

```
Spett.le Azienda Sanitaria Provinciale di {ASP}
{indirizzo email/PEC ASP}

Oggetto: Richiesta di attivazione del percorso di tutela per prestazione di primo accesso
(Piano Nazionale di Governo delle Liste d'Attesa 2026-2028; D.Lgs. 124/1998, art. 3, commi 10 e 13)

Il/La sottoscritto/a {nome cognome}, nato/a a {luogo} il {data}, codice fiscale {CF},
residente in {indirizzo}, tel. {telefono}, email {email},

PREMESSO CHE
- gli/le è stata prescritta la prestazione di primo accesso "{prestazione}"
  (ricetta n. {NRE}) con classe di priorità {classe}, che prevede un tempo massimo di attesa
  di {giorni} giorni;
- in data {data prenotazione} ha richiesto la prenotazione tramite i canali ufficiali e la prima
  disponibilità proposta è il {data appuntamento}, oltre il tempo massimo previsto;

CHIEDE
l'attivazione del percorso di tutela affinché la prestazione sia erogata entro i tempi massimi
previsti dalla classe di priorità indicata e, in caso di indisponibilità di strutture pubbliche o
accreditate, in regime di attività libero-professionale intramuraria con il solo pagamento del
ticket, ove dovuto.

[Se presentata da un familiare/delegato:] La presente è presentata da {nome delegato}, codice fiscale
{CF delegato}, in qualità di delegato/a dell'assistito/a, come da delega allegata con copia dei
documenti di identità di entrambi.

Allega: copia del documento di identità; ricetta; foglio/promemoria di prenotazione
[; delega e documento del delegato].

{luogo}, {data}                                   Firma ______________________
```
For Palermo and Caltanissetta, **use the ASP's official form instead** (show what to write in each field).
**TODO-VERIFY:** lawyer approves this text, including the delegation wording (many users will be adult
children acting for elderly parents).

## 8. Legal and privacy requirements
- **Disclaimer** on every result page: "Diritto in Tempo fornisce informazioni generali sui diritti
  previsti dalla normativa. Non è un consulto legale o medico. Verifica sempre le informazioni con la
  tua ASP. Informazioni aggiornate al {data}."
- **Privacy:** no cookies beyond strictly necessary, no analytics collecting personal data, no form data
  sent anywhere. If analytics are added: cookieless, page views only.
- **AI disclosure (EU AI Act Art. 50):** only when AI is added in v2.
- Users under 14: not the target audience; mention in terms.
- **Hosting logs:** even with no forms, GitHub Pages/Vercel log IP addresses → the privacy notice must
  name the hosting provider as processor. Lawyer to confirm wording.
- **Site owner:** a "Note legali" page with the maintainer's name and a dedicated contact email
  (not your personal one), e.g. info@<domain>.
- **Licence:** open-source the code (MIT) and the content (CC BY 4.0) so other regions can be added by
  volunteers; say so in the footer.
- Lawyer questions: rights summary, letter template (incl. delegation), disclaimer, art. 348 c.p. risk,
  refund wording, privacy notice (hosting logs), how the waiting time is counted, whether a missing
  priority class is treated as D, domicile vs residence.

## 9. Build order (milestones)
0. **Name & domain:** a web search found no existing product called "Diritto in Tempo"; still check
   the .it domain availability and the Italian trademark register (UIBM) before printing anything.
   Set up a dedicated email address. Budget: domain ≈ €10–20/year; everything else free.
1. Skeleton + deploy an empty page online.
2. `rules.json` + date calculation + tests (U, B, D-visit, D-exam, P; same day; exactly at limit;
   one day over).
3. Question flow screens (incl. Result C and the "Non lo so" branch) + a drawn SVG sample of a
   ricetta showing where the priority class is (never use a real prescription image).
4. `asp-sicilia.json` + ASP cards (incl. U/B fast-track routing, Messina sub-areas).
5. Letter generator + mailto + PDF. MVP: for Palermo/Caltanissetta show the official form with
   "what to write in each field" (simple). v1.1: pre-fill the official PDF with pdf-lib if it has form
   fields.
6. Footer, disclaimer, privacy page, "last verified" dates, "Segnala un errore".
7. Mobile check, large text, simple Italian.
8. Phone-verify the TODO ASPs → lawyer review → launch.
9. **Calendar reminder:** re-check all ASP data after Sicily adopts its new regional plan (≈ Dec 2026 –
   Jan 2027) and every 3 months after.

## 9b. Maintenance routine (the part most civic projects skip)
- `data/asp-sicilia.json` has `last_verified` per ASP; the site shows it. Target: nothing older than
  3 months.
- Quarterly checklist (30 min): open each ASP's tutela page, confirm email/PEC/form link still exist,
  send one test email to each dedicated address and record the auto-reply or bounce.
- Keep a `CHANGELOG.md` of every data change with the source.
- Add a "Segnala un errore" link on every ASP card; fix reports within a week.
- Watch for: Sicily's new regional plan (due ≈ 22 Dec 2026), any ASP moving to a SPID portal
  (Ragusa already did), and PNGLA annex updates.

## 9c. Extension to other regions (analysis, 18/10/2026)

**What is national (reusable as-is):** the 4 classes and limits, "first access only", the PNGLA list of
monitored services, the "accept the first availability" rule, D.Lgs. 124/98 intramoenia fallback, and
the 180-day prescription validity (default). → `rules.json` stays national; only `data/<region>.json`
changes.

**What varies by region (must be data, not code):**
1. **Who you ask and how** — three models exist:
   - *ASL-by-ASL* (Sicily, Lombardy via ASST, Lazio via ASL): one entry per ASL, like Sicily today.
   - *Regional single channel*: Tuscany has a regional toll-free number (800 556060) and the 116117
     line as the guarantee tool; Umbria's regional CUP centre activates the tutela itself. One entry
     per region → cheapest to add.
   - *Not published*: Abruzzo, Campania, Basilicata, Calabria, Puglia do not reference the tutela on
     their regional sites (Salutequità survey, Jan 2025); citizens must read the regional plan. Here
     the tool adds the most value but needs phone verification per ASL.
2. **Booking deadlines per class** (see 4.3 point 7) — new field `booking_deadline_days` per region.
3. **Missing priority class** — Tuscany treats it as D; others unknown. Field `no_class_rule`.
4. **Pre-list/call-back and refund rules** — field `refund_after_authorisation` (true/false).
5. **Local naming** — "percorso di tutela", "percorso di garanzia", "pass di garanzia" (Lazio),
   "prestazioni garantite" (Trapani). Field `local_name` so the letter uses the right words.

**Suggested data schema for any region:** `region`, `model` (asl | regional | unknown),
`regional_channel` (phone/portal), `booking_deadline_days` {U,B,D_visit,D_exam,P},
`no_class_rule`, `local_name`, `asl[]` (same fields as Sicily).

**Order of expansion (impact ÷ effort):**
1. **Lazio and Lombardy** — large population, published procedures, but booking deadlines bite
   (U 10 days etc.), so the deadline check is essential there.
2. **Campania, Puglia, Calabria** — biggest unmet need (procedures not published; care-forgone rates
   highest in the South), highest verification effort. Best done with a local partner association.
3. **Tuscany, Umbria, Emilia-Romagna, Veneto** — regional single channels; mostly a redirect, low
   added value but cheap (a few hours each).

**Scaling without you:** publish the data file format + a one-page "how to verify an ASL" guide; let
volunteers (patient associations, Reddit r/italy, local journalists) submit pull requests. The
quarterly re-verification routine (9b) must scale too: ~10 min per ASL → cap at what you (or
volunteers) can sustain before adding more regions.

**Timing:** every region must adopt a new regional plan by ≈ 22 Dec 2026. Procedures will churn in
early 2027; expanding after Q1 2027 avoids verifying things twice.

## 10. Later versions
- **v2 AI helper:** "Spiegamelo semplice" button + Q&A limited to our verified texts, via a small
  serverless function (hides API key), never receiving health data. Add AI disclosure.
- **v2 Outcome button:** anonymous "Did the ASP respond in time?" → open dataset (privacy review first).
- **v3 More regions:** same engine, one data file per region.
- English version for foreign residents.

## 11. Sources
- Ministero della Salute, "Pubblicato il nuovo PNGLA 2026-2028" (22/09/2026); DM 26/06/2026, GU n. 195
  del 24/08/2026, S.O. n. 32.
- Quotidiano Sanità on PNGLA 2026-2028 (percorsi di tutela, preliste, regional plans).
- ASP Palermo: news page (upd. 19/08/2026) and official form (Aug 2026).
- ASP Ragusa: asp.rg.it/liste-attesa; Quotidiano di Ragusa, 07/08/2026.
- ASP Caltanissetta: "Ambiti di garanzia e percorso di tutela" page; Regolamento 2025; MOD-01.
- ASP Messina: "Liste di attesa – Percorso di tutela" page.
- ASP Siracusa: "Percorso di tutela" service page; 2024 regulation (press).
- ASP Agrigento: URP page; Delibera 426/2024; AgrigentoNotizie.
- ASP Catania: "Percorso di Tutela" page (Delibere 1650/2024, 77/2025); U/B model (CataniaToday).
- ASP Trapani: Fast Track (LiveSicilia); "Prestazioni garantite" (Trapanisi.it, July 2026).
- ASP Enna: CUP contacts (La Sicilia, 12/10/2026); PAA 2024-2026.
- SovraCUP Sicilia; Salutequità survey on percorsi di tutela.


## 12. Module 2 — Invalidità civile (disability recognition): "la visita non arriva"

### 12.1 The pain point
- Nationally, INPS reported **1,187,045 people waiting for a first disability assessment visit**
  (264,114 at INPS, 922,931 at ASLs in non-convention regions) plus 408,912 waiting for a review visit.
  The average procedure takes ~120 days, with Sicily among the worst (>167 days; one legal site quotes
  212 days for Sicily — treat as indicative).
- The same structural problem as module 1: **a legal deadline exists, almost nobody knows it, and
  nobody tells you what to do when it passes.**

### 12.2 Two regimes coexist in Sicily until 31 December 2026 (this is the core logic)
The disability reform (**D.Lgs. 62/2024**) moves the whole assessment to INPS ("valutazione di base")
and is being rolled out province by province. Full national application: **1 January 2027**.

| Sicilian province | Regime (Oct 2026) | Since |
|---|---|---|
| Palermo | **NEW** (INPS only) | 30 Sep 2025 |
| Caltanissetta, Catania, Messina | **NEW** (INPS only) | 1 Mar 2026 |
| Agrigento, Enna, Ragusa, Siracusa, Trapani | **OLD** (ASP commission + INPS) until 31 Dec 2026 | — |

(Source: Dipartimento per le politiche in favore delle persone con disabilità + INPS msg. 639/2026.
One secondary site lists all 9 Sicilian provinces as "new" — wrong; use the official list.)
**TODO-VERIFY** in January 2027: all provinces switch to NEW.

**NEW regime (what the tool explains):**
- The doctor sends the **certificato medico introduttivo** (form AP110) to INPS; **it is already the
  application** — no separate domanda.
- INPS convenes a single collegial visit (Unità di Valutazione di Base); the person can bring their own
  doctor/psychologist; extra documents can be filed up to 7 days before the visit.
- **Deadlines, counted from the date the certificate was transmitted:** **90 days** general;
  **30 days** minors; **15 days** oncological patients (D.Lgs. 62/2024 art. 6).
- Output: one "certificato" (ex verbale) covering invalidità civile, handicap (L. 104), cecità,
  sordità, collocamento mirato.

**OLD regime (what the tool explains):**
- Doctor sends certificate to INPS → citizen (or patronato) files the **domanda online within 90 days**
  of the certificate → ASP commission visit → INPS verification → verbale.
- Oncological patients: visit **within 15 days** of the application (L. 80/2006), with immediate access
  to benefits. Ordinary cases: convocation target 30 days (quoted by practitioners) — **TODO-VERIFY**
  the exact legal basis (DPR 698/1994) with the lawyer.

### 12.3 What the module does (deterministic, no AI)
1. **Which regime am I in?** Province + date of the certificate → NEW/OLD; shows the correct steps.
2. **Deadline calculator:** certificate date + (15 / 30 / 90) → "INPS should have concluded by {date}".
   Inputs: certificate transmission date, category (oncological / minor / other), whether a visit date
   has been received. **Never asks for the diagnosis.**
3. **"Non ho ancora la convocazione" → sollecito letter** to the competent INPS provincial office
   (PEC from the official INPS list — one per province, maintain in `data/inps-sicilia.json`), with the
   certificate number, transmission date and the legal deadline cited. Plus the alternative channels:
   INPS contact centre 803 164 / 06 164164, "INPS Risponde", and **free help from a patronato**
   (INCA, ACLI, INAS, etc.) — these should be recommended first for anyone who finds the letter hard.
4. **Checklist before the visit:** ID, health card, certificate receipt, medical documents (hospital
   or accredited), and the 7-days-before rule for extra documents.
5. **After the verbale (information only):** what the percentages/levels unlock (ticket exemption,
   L. 104 leave, accompagnamento, pensione di inabilità, collocamento mirato, parking permit) with
   links to INPS/official pages. The tool **never estimates a percentage or a benefit amount**.
6. **Reminder:** if the verbale has an expiry, benefits continue until the review visit (L. 114/2014).

### 12.4 Data to maintain
- `data/inps-sicilia.json`: for each of the 9 provinces → INPS provincial office PEC (official INPS
  "sedi" pages / IndicePA), address, regime (`new` | `old`) and `regime_since`.
- `data/rules-invalidita.json`: deadlines {oncological: 15, minor: 30, other: 90}, old-regime
  oncological: 15, old-regime domanda window: 90.
- `data/patronati-sicilia.json` (optional v1.1): one or two patronato offices per province.

### 12.5 Legal/privacy — stricter than module 1
- This is **disability data** (special category). Same rule: nothing stored, nothing sent. Do not even
  ask for the diagnosis; "oncological / minor / other" is enough for the deadline.
- Say clearly: "Non valutiamo la tua invalidità. Ti diciamo solo quali sono i tempi di legge e come
  sollecitare." Assessment, appeals (ricorso) and "aggravamento" requests → patronato or lawyer.
- The sollecito letter must be reviewed by the lawyer (INPS deadlines are "ordinatori" in many
  readings: missing them doesn't void the procedure but supports a complaint/sollecito and, after
  the verbale, arrears and interest — **lawyer to confirm the exact consequences**).

### 12.6 Why this pairs well with module 1
- Same users (often adult children of elderly parents), same engine (deadline + letter + contacts),
  same "last verified" discipline. Oncological patients appear in both: fast lanes for visits/exams
  and 15-day disability assessment.
- Out of scope for now (noted for v3): ASP **UVM** (Unità di Valutazione Multidimensionale) delays for
  care plans — reported as months-long in Siracusa (June 2026) — a separate procedure with fewer fixed
  deadlines.

### 12.7 Sources (module 2)
- riformadisabilita.gov.it — "Valutazione di base" (deadlines 90/30/15).
- INPS msg. 4465/2024 attachment (procedure), INPS news 26/02/2026 (40 new provinces), msg. 639/2026.
- disabilita.governo.it — list of the 40 provinces from 1 March 2026.
- INPS "Diritti e tutele in caso di malattie oncologiche" (L. 80/2006, 15-day visit).
- ASP Agrigento — "Accertamento invalidità civile" page (old regime steps).
- Disabili.com — INPS data on citizens waiting for a visit (2026).
