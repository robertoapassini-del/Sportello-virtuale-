// Guida Sanità — motore delle regole.
// Solo funzioni pure: niente pagina, niente rete. Usate dal browser e dai test.
// Le date sono stringhe 'AAAA-MM-GG' calcolate in UTC, per evitare sorprese
// con l'ora legale.

const DAY_MS = 24 * 60 * 60 * 1000;

export function parseDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split('-').map(Number);
  const t = Date.UTC(y, m - 1, d);
  const back = new Date(t);
  // Rifiuta date impossibili come 2026-02-31.
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) return null;
  return t;
}

export function toISO(t) {
  return new Date(t).toISOString().slice(0, 10);
}

export function todayISO(now = new Date()) {
  // Data del calendario dell'utente, non UTC.
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function daysBetween(fromISO, toISO_) {
  const a = parseDate(fromISO);
  const b = parseDate(toISO_);
  if (a === null || b === null) return null;
  return Math.round((b - a) / DAY_MS);
}

export function addDays(iso, n) {
  const t = parseDate(iso);
  if (t === null) return null;
  return toISO(t + n * DAY_MS);
}

export function formatIt(iso) {
  if (!parseDate(iso)) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// Articolo o preposizione davanti a una data scritta in cifre: «il 18/10» ma
// «l'11/10» e «l'08/10» (si leggono «undici», «otto»). prep: 'il', 'del', 'al',
// 'dal', 'nel', 'fino al'… Restituisce il testo da mettere prima della data,
// con lo spazio o l'apostrofo. Senza data (campo vuoto) resta «il ».
export function art(prep, iso) {
  if (!parseDate(iso) || !['08', '11'].includes(iso.slice(8, 10))) return `${prep} `;
  return prep.replace(/\bil$/, "l'").replace(/l$/, "ll'");
}

// --- Modulo 1: liste d'attesa -------------------------------------------

// Per la classe 'D' serve sapere se è una visita o un esame.
export function classKey(cls, kind) {
  if (cls === 'D') {
    if (kind === 'visit') return 'D_visit';
    if (kind === 'exam') return 'D_exam';
    return null;
  }
  return ['U', 'B', 'P'].includes(cls) ? cls : null;
}

export function maxWaitDays(rules, cls, kind) {
  const key = classKey(cls, kind);
  if (!key) return null;
  return rules.max_wait_days[key] ?? null;
}

// Uguale al limite = ancora nei tempi; un giorno in più = superato.
export function checkWaiting(rules, { cls, kind, bookingDate, appointmentDate }) {
  const limit = maxWaitDays(rules, cls, kind);
  if (limit === null) return { status: 'error', error: 'class' };
  const days = daysBetween(bookingDate, appointmentDate);
  if (days === null) return { status: 'error', error: 'date' };
  if (days < 0) return { status: 'error', error: 'order' };
  const deadline = addDays(bookingDate, limit);
  if (days > limit) return { status: 'exceeded', days, limit, deadline, excess: days - limit };
  return { status: 'within', days, limit, deadline, excess: 0 };
}

// Risultato C: nessuna data → l'ASP deve richiamare entro N giorni (PNGLA 2026-2028).
export function callbackDeadline(rules, { cls, kind, requestDate, today }) {
  const key = classKey(cls, kind);
  const n = key ? rules.callback_days[key] : undefined;
  if (n === undefined) return { status: 'none' };
  if (!requestDate) return { status: 'no_date', days: n };
  const deadline = addDays(requestDate, n);
  if (!deadline) return { status: 'error', error: 'date' };
  const passed = today ? daysBetween(deadline, today) > 0 : false;
  return { status: passed ? 'passed' : 'waiting', days: n, deadline };
}

// --- Modulo 2: invalidità civile ----------------------------------------

// province: { regime: 'new'|'old', regime_since: 'YYYY-MM-DD'|null }
export function invRegime(province, certDate, fullNationalDate = '2027-01-01') {
  if (!province || !parseDate(certDate)) return null;
  if (daysBetween(fullNationalDate, certDate) >= 0) return 'new';
  if (province.regime === 'new' && province.regime_since && daysBetween(province.regime_since, certDate) >= 0) {
    return 'new';
  }
  return 'old';
}

// category: 'oncological' | 'minor' | 'other'
// Restituisce quale scadenza vale e se è passata.
export function invDeadline(rulesInv, { regime, category, certDate, domandaDate, today }) {
  if (!parseDate(certDate)) return { status: 'error', error: 'date' };
  if (today && daysBetween(certDate, today) < 0) return { status: 'error', error: 'future' };

  if (regime === 'new') {
    const n = rulesInv.new_regime.deadline_days[category];
    if (n === undefined) return { status: 'error', error: 'category' };
    const deadline = addDays(certDate, n);
    return withPassed({ kind: 'conclusion', days: n, from: certDate, deadline, legal: rulesInv.new_regime.legal_basis, indicative: false }, today);
  }

  // Procedura vecchia: prima la domanda (entro 90 giorni dal certificato), poi la visita.
  const old = rulesInv.old_regime;
  if (!domandaDate) {
    const deadline = addDays(certDate, old.domanda_window_days);
    return withPassed({ kind: 'domanda', days: old.domanda_window_days, from: certDate, deadline, legal: null, indicative: false }, today);
  }
  if (daysBetween(certDate, domandaDate) < 0) return { status: 'error', error: 'order' };
  if (category === 'oncological') {
    const deadline = addDays(domandaDate, old.oncological_visit_days);
    return withPassed({ kind: 'visit', days: old.oncological_visit_days, from: domandaDate, deadline, legal: old.oncological_legal_basis, indicative: false }, today);
  }
  const deadline = addDays(domandaDate, old.ordinary_convocation_days);
  return withPassed({ kind: 'visit', days: old.ordinary_convocation_days, from: domandaDate, deadline, legal: null, indicative: true }, today);
}

function withPassed(r, today) {
  if (!today) return { status: 'waiting', ...r };
  const late = daysBetween(r.deadline, today);
  return { status: late > 0 ? 'passed' : 'waiting', daysLate: Math.max(0, late), ...r };
}

// --- Moduli 3 e 4: scadenza semplice -------------------------------------
// Una data di partenza + N giorni → la scadenza, e se oggi è già passata.
export function simpleDeadline({ fromDate, days, today }) {
  if (!parseDate(fromDate)) return { status: 'error', error: 'date' };
  if (today && daysBetween(fromDate, today) < 0) return { status: 'error', error: 'future' };
  const deadline = addDays(fromDate, days);
  return withPassed({ days, from: fromDate, deadline }, today);
}

// --- Modulo 5: esenzione ticket per reddito ------------------------------
// Aggiunge n mesi a una data; se il giorno non esiste (31 → 30), prende l'ultimo del mese.
export function addMonths(iso, n) {
  const t = parseDate(iso);
  if (t === null) return null;
  const d = new Date(t);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + n);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return toISO(d.getTime());
}

export function formatEuro(n) {
  return `${n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

// ageBand: 'under6' | '6to59' | '60to65' | 'over65'
// status:  'none' | 'disoccupato' | 'sociale' | 'minimo'   (anche se si è a carico di chi ha quella condizione)
// income:  numero (reddito familiare lordo anno precedente) oppure null se non lo sa
export function esenzioneReddito(rules, { ageBand, status, spouse = false, children = 0, income = null }) {
  const c = rules.codes;
  const fam = (code) => c[code].income_base + (spouse ? c[code].income_with_spouse - c[code].income_base : 0) + c[code].income_per_child * children;
  const out = { codes: [], maybe: [], thresholds: {} };
  const hasIncome = typeof income === 'number' && Number.isFinite(income) && income >= 0;

  if (ageBand === 'under6' || ageBand === 'over65') {
    out.thresholds.E01 = c.E01.income_max;
    if (!hasIncome) out.maybe.push('E01');
    else if (income <= c.E01.income_max) out.codes.push('E01');
  }
  if (status === 'disoccupato') {
    out.thresholds.E02 = fam('E02');
    if (!hasIncome) out.maybe.push('E02');
    else if (income <= out.thresholds.E02) out.codes.push('E02');
  }
  if (status === 'sociale') out.codes.push('E03');
  if (status === 'minimo' && (ageBand === '60to65' || ageBand === 'over65')) {
    out.thresholds.E04 = fam('E04');
    if (!hasIncome) out.maybe.push('E04');
    else if (income <= out.thresholds.E04) out.codes.push('E04');
  }
  return out;
}

// --- Modulo 6: ricorso contro il verbale di invalidità --------------------
export function ricorsoDeadline(rules, { verbaleDate, today }) {
  if (!parseDate(verbaleDate)) return { status: 'error', error: 'date' };
  if (today && daysBetween(verbaleDate, today) < 0) return { status: 'error', error: 'future' };
  const deadline = addMonths(verbaleDate, rules.appeal_months);
  const r = withPassed({ from: verbaleDate, deadline, months: rules.appeal_months }, today);
  if (today && r.status === 'waiting') r.daysLeft = daysBetween(today, deadline);
  return r;
}

// --- Modulo 7: assegno di inclusione --------------------------------------
// household: true se in famiglia c'è un minorenne, un over 60, una persona con disabilità
// o una persona seguita dai servizi. residency: true se 5 anni in Italia (ultimi 2 continuativi).
// isee: numero oppure null se non lo sa. Risposta: 'yes' | 'no' | 'maybe', con i motivi.
export function adiCheck(rules, { household, residency, isee }) {
  const reasons = [];
  if (household === false) reasons.push('household');
  if (residency === false) reasons.push('residency');
  const hasIsee = typeof isee === 'number' && Number.isFinite(isee) && isee >= 0;
  if (hasIsee && isee > rules.isee_max) reasons.push('isee');
  if (reasons.length) return { status: 'no', reasons };
  if (!hasIsee || household === null || residency === null) return { status: 'maybe', reasons: [] };
  return { status: 'yes', reasons: [] };
}

// --- Modulo 9: piano terapeutico ------------------------------------------
export function pianoStatus(rules, { expiryDate, today }) {
  if (!parseDate(expiryDate)) return { status: 'error', error: 'date' };
  const bookBy = addDays(expiryDate, -rules.book_before_days);
  const toExpiry = daysBetween(today, expiryDate);
  const status = toExpiry < 0 ? 'expired' : toExpiry <= rules.book_before_days ? 'soon' : 'ok';
  return { status, bookBy, toExpiry, daysOverdue: Math.max(0, -toExpiry) };
}

// --- Modulo 12: prevenzione gratuita per età -----------------------------
// sex: 'F' | 'M'. Restituisce gli screening e i vaccini gratuiti per quell'età,
// e quelli che arriveranno più avanti (con l'età da cui partono).
export function prevenzione(rules, { age, sex }) {
  const out = { screening: [], vaccines: [], later: [] };
  if (!Number.isInteger(age) || age < 0 || age > 120) return null;
  for (const s of rules.screening) {
    if (s.sex !== '*' && s.sex !== sex) continue;
    if (age >= s.min && age <= s.max) out.screening.push(s);
    else if (age < s.min) out.later.push({ ...s, kind: 'screening' });
  }
  for (const v of rules.vaccines) {
    if (age >= v.min) out.vaccines.push(v);
    else out.later.push({ ...v, kind: 'vaccine' });
  }
  out.later.sort((a, b) => a.min - b.min);
  return out;
}

// --- Modulo 13: medico di famiglia o pediatra ----------------------------
// Chi può scegliere cosa, in base all'età.
export function medicoChoice(rules, { age }) {
  if (!Number.isInteger(age) || age < 0 || age > 120) return null;
  if (age < rules.pediatra_only_until) return 'pediatra';
  if (age < rules.pediatra_or_medico_until) return 'pediatra-o-medico';
  return 'medico';
}
