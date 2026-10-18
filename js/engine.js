// Diritto in Tempo — rules engine.
// Pure functions only: no DOM, no network. Used by the browser and by the tests.
// Dates are handled as 'YYYY-MM-DD' strings and computed in UTC to avoid
// daylight-saving surprises.

const DAY_MS = 24 * 60 * 60 * 1000;

export function parseDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split('-').map(Number);
  const t = Date.UTC(y, m - 1, d);
  const back = new Date(t);
  // Reject impossible dates such as 2026-02-31.
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) return null;
  return t;
}

export function toISO(t) {
  return new Date(t).toISOString().slice(0, 10);
}

export function todayISO(now = new Date()) {
  // Local calendar date of the user, not UTC.
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

// --- Module 1: liste d'attesa -------------------------------------------

// 'D' needs to know if it is a visit or a diagnostic exam.
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

// Equal to the limit = still within; one day more = exceeded.
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

// Result C: no date offered → the ASP must call back within N days (PNGLA 2026-2028).
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

// --- Module 2: invalidità civile ----------------------------------------

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
// Returns what deadline applies and whether it has passed.
export function invDeadline(rulesInv, { regime, category, certDate, domandaDate, today }) {
  if (!parseDate(certDate)) return { status: 'error', error: 'date' };
  if (today && daysBetween(certDate, today) < 0) return { status: 'error', error: 'future' };

  if (regime === 'new') {
    const n = rulesInv.new_regime.deadline_days[category];
    if (n === undefined) return { status: 'error', error: 'category' };
    const deadline = addDays(certDate, n);
    return withPassed({ kind: 'conclusion', days: n, from: certDate, deadline, legal: rulesInv.new_regime.legal_basis, indicative: false }, today);
  }

  // Old regime: first the domanda (within 90 days of the certificate), then the visit.
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
