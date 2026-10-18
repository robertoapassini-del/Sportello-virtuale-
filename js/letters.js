// Modelli di lettera (testo semplice). Funzioni pure: niente pagina.
// TODO-VERIFY: ogni modello va approvato dal legale prima del lancio.
import { formatIt } from './engine.js';

const blank = (v, placeholder = '__________') => (v && String(v).trim()) || placeholder;

function personBlock(p) {
  return `Il/La sottoscritto/a ${blank(p.fullName)}, nato/a a ${blank(p.birthPlace)} il ${p.birthDate ? formatIt(p.birthDate) : '__________'}, ` +
    `codice fiscale ${blank(p.cf)},\nresidente in ${blank(p.address)}, tel. ${blank(p.phone)}, email ${blank(p.email)},`;
}

function delegateBlock(p) {
  if (!p.isDelegate) return '';
  return `\nLa presente è presentata da ${blank(p.delegateName)}, codice fiscale ${blank(p.delegateCf)}, ` +
    `in qualità di delegato/a dell'assistito/a, come da delega allegata con copia dei documenti di identità di entrambi.\n`;
}

function signature(p, today) {
  return `${blank(p.city, '[luogo]')}, ${formatIt(today)}                                   Firma ______________________`;
}

// Modulo 1 — richiesta di attivazione del percorso di tutela (SPEC sezione 7).
export function tutelaLetter({ aspName, aspAddress, person: p, service, nre, cls, maxDays, bookingDate, appointmentDate, noDateOffered, requestDate, today }) {
  const booking = noDateOffered
    ? `- in data ${requestDate ? formatIt(requestDate) : '__________'} ha richiesto la prenotazione tramite i canali ufficiali e non gli/le è
  stata proposta alcuna data, né è stato/a ricontattato/a entro il termine previsto;`
    : `- in data ${formatIt(bookingDate)} ha richiesto la prenotazione tramite i canali ufficiali e la prima
  disponibilità proposta è il ${formatIt(appointmentDate)}, oltre il tempo massimo previsto;`;
  const attach = 'copia del documento di identità; ricetta; foglio/promemoria di prenotazione' +
    (p.isDelegate ? '; delega e documento del delegato' : '');
  return `Spett.le Azienda Sanitaria Provinciale di ${aspName}
${aspAddress || ''}

Oggetto: Richiesta di attivazione del percorso di tutela per prestazione di primo accesso
(Piano Nazionale di Governo delle Liste d'Attesa 2026-2028; D.Lgs. 124/1998, art. 3, commi 10 e 13)

${personBlock(p)}

PREMESSO CHE
- gli/le è stata prescritta la prestazione di primo accesso "${blank(service)}"
  (ricetta n. ${blank(nre)}) con classe di priorità ${cls}, che prevede un tempo massimo di attesa
  di ${maxDays} giorni;
${booking}

CHIEDE
l'attivazione del percorso di tutela affinché la prestazione sia erogata entro i tempi massimi
previsti dalla classe di priorità indicata e, in caso di indisponibilità di strutture pubbliche o
accreditate, in regime di attività libero-professionale intramuraria con il solo pagamento del
ticket, ove dovuto.
${delegateBlock(p)}
Allega: ${attach}.

${signature(p, today)}
`;
}

// Modulo 1 — sollecito se l'ASP non risponde.
export function tutelaReminder({ aspName, aspAddress, person: p, service, nre, cls, firstRequestDate, today }) {
  return `Spett.le Azienda Sanitaria Provinciale di ${aspName}
${aspAddress || ''}

Oggetto: SOLLECITO – Richiesta di attivazione del percorso di tutela del ${firstRequestDate ? formatIt(firstRequestDate) : '__________'}
(prestazione "${blank(service)}", ricetta n. ${blank(nre)}, classe di priorità ${cls})

${personBlock(p)}

in data ${firstRequestDate ? formatIt(firstRequestDate) : '__________'} ha chiesto l'attivazione del percorso di tutela per la
prestazione sopra indicata. Alla data odierna non ha ricevuto risposta né proposta di appuntamento
entro i tempi massimi previsti.

SOLLECITA
un riscontro nel più breve tempo possibile e l'erogazione della prestazione secondo quanto previsto
dal Piano Nazionale di Governo delle Liste d'Attesa 2026-2028.
${delegateBlock(p)}
Allega: copia della richiesta del ${firstRequestDate ? formatIt(firstRequestDate) : '__________'} e relativi allegati.

${signature(p, today)}
`;
}

// Modulo 2 — sollecito all'INPS quando la visita di invalidità non arriva.
export function inpsReminder({ provinceName, inpsPec, person: p, certNumber, certDate, domandaDate, domandaNumber, regime, deadlineInfo, today }) {
  const premise = regime === 'new'
    ? `- in data ${formatIt(certDate)} è stato trasmesso all'INPS il certificato medico introduttivo n. ${blank(certNumber)},\n  che ai sensi del D.Lgs. 62/2024 costituisce domanda di accertamento;`
    : `- in data ${formatIt(certDate)} è stato trasmesso all'INPS il certificato medico introduttivo n. ${blank(certNumber)}\n  e in data ${domandaDate ? formatIt(domandaDate) : '__________'} è stata presentata la relativa domanda (n. ${blank(domandaNumber)});`;
  const term = deadlineInfo.legal
    ? `- ai sensi dell'${deadlineInfo.legal}, la visita/il procedimento doveva svolgersi entro ${deadlineInfo.days} giorni,\n  cioè entro il ${formatIt(deadlineInfo.deadline)};`
    : `- secondo i tempi indicati dalla normativa vigente, la convocazione era attesa entro il ${formatIt(deadlineInfo.deadline)};`;
  const attach = 'copia del documento di identità; ricevuta di trasmissione del certificato medico' +
    (regime === 'old' ? '; ricevuta della domanda' : '') +
    (p.isDelegate ? '; delega e documento del delegato' : '');
  return `Spett.le INPS – Direzione provinciale di ${provinceName}
${inpsPec || ''}

Oggetto: Sollecito convocazione a visita per accertamento sanitario (invalidità civile / handicap)
– certificato medico n. ${blank(certNumber)} del ${formatIt(certDate)}

${personBlock(p)}

PREMESSO CHE
${premise}
${term}
- alla data odierna non è pervenuta alcuna convocazione a visita;

SOLLECITA
la convocazione a visita nel più breve tempo possibile e chiede di essere informato/a sullo
stato della pratica.
${delegateBlock(p)}
Allega: ${attach}.

${signature(p, today)}
`;
}

export function mailtoHref(to, subject, body) {
  // L'indirizzo deve restare corto per le app di posta del telefono; testi troppo lunghi vengono tolti.
  const maxBody = 1800;
  const b = body && body.length > maxBody ? '' : body;
  const params = [`subject=${encodeURIComponent(subject)}`];
  if (b) params.push(`body=${encodeURIComponent(b)}`);
  return `mailto:${to || ''}?${params.join('&')}`;
}
