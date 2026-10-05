// In-memory stand-in for the Django API. One pure function serves the dev route handler and the tests.
import { INTERNAL_ROLES, type EngagementMode, type HashCheck, type Role, type SearchHit, type Session } from '@/api/types';
import { gradeOf } from '@/lib/format';
import { accessLog, readiness, settings, users } from './data/account';
import { reportRuns, reportTypes, sources, uploads } from './data/disclosure';
import { domains, score } from './data/domains';
import { regChanges, rulebook } from './data/engagement';
import { consent, consentPages, contacts, evidenceFiles, KNOWN_HASH, legalHolds, position, revocation, vault } from './data/evidence';
import { conduct, leads, vendorSummary } from './data/intelligence';
import { metrics } from './data/metrics';
import { session } from './data/session';
import { actions, alerts } from './data/work';

export interface MockRequest { method: string; path: string; query?: Record<string, string>; body?: unknown }
export interface MockResponse { status: number; body: unknown }

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const fresh = () => clone({ session, actions, alerts, consentPages, legalHolds, uploads, reportRuns, readiness, settings, users, accessLog, regChanges });

let db = fresh();

/** Restores the fixtures; tests call this after each case. */
export function resetMock(): void {
  db = fresh();
}

const ok = (body: unknown): MockResponse => ({ status: 200, body });
const fail = (status: number, detail: string): MockResponse => ({ status, body: { detail } });
const isInternal = (role: Role) => INTERNAL_ROLES.includes(role);

function visibleSession(): Session {
  const s = db.session;
  return { ...s, runs: isInternal(s.role) ? s.runs : s.runs.filter((r) => r.outputVisibility === 'client') };
}

// Index of the chosen month in every four-point history; the latest month when absent.
function periodIndex(period: string | undefined): number {
  const i = score.history.findIndex((h) => h.period === period);
  return i === -1 ? score.history.length - 1 : i;
}

function scoreFor(period: string | undefined) {
  const i = periodIndex(period);
  const last = score.history.length - 1;
  if (i === last) return score;
  const point = score.history[i];
  return {
    ...score, score: point.score, grade: point.grade, rawGrade: gradeOf(point.score), cap: null,
    previous: i > 0 ? score.history[i - 1].score : point.score, history: score.history.slice(0, i + 1),
    families: score.families.map((f) => ({ ...f, score: f.score === null ? null : Math.round((f.score - (score.score - point.score)) * 10) / 10 })),
  };
}

function search(q: string): SearchHit[] {
  const needle = q.trim().toLowerCase();
  if (needle.length < 2) return [];
  const has = (...parts: (string | null)[]) => parts.some((p) => p?.toLowerCase().includes(needle));
  const digits = needle.replace(/\D/g, '');
  const pages: [string, string][] = [['/', 'Overview'], ['/scorecard', 'Audit Scorecard'], ['/actions', 'Action Queue'], ['/alerts', 'Alerts'], ['/ledger', 'Contact Ledger'], ['/consent', 'Consent Integrity'], ['/revocation', 'Revocation Integrity'], ['/vault', 'Evidence Vault'], ['/conduct', 'Contact Conduct'], ['/leads', 'Lead Provenance'], ['/vendors', 'Vendor Ledger'], ['/metrics', 'Metrics Library'], ['/sources', 'Source Registry'], ['/reports', 'Reports & Exports'], ['/scope', 'Scope & Boundaries'], ['/rulebook', 'Rulebook'], ['/regulatory', 'Regulatory Changes'], ['/setup', 'Setup & Readiness'], ['/settings', 'Settings'], ['/users', 'Users & Access']];
  return [
    ...domains.filter((d) => has(d.code, d.name)).map((d): SearchHit => ({ kind: 'domain', id: d.code, label: d.name, hint: `Domain ${d.code}` })),
    ...metrics.filter((m) => has(m.code, m.name)).map((m): SearchHit => ({ kind: 'metric', id: m.code, label: m.name, hint: `Metric ${m.code}` })),
    ...(digits.length >= 3 ? contacts.filter((c) => c.phoneE164.includes(digits)).map((c): SearchHit => ({ kind: 'number', id: c.phoneE164, label: c.phoneDisplay, hint: 'Evidence file' })) : []),
    ...vendorSummary.vendors.filter((v) => has(v.name, v.subId)).map((v): SearchHit => ({ kind: 'vendor', id: v.id, label: v.subId ? `${v.name} · sub-ID ${v.subId}` : v.name, hint: 'Vendor' })),
    ...pages.filter(([, label]) => has(label)).map(([id, label]): SearchHit => ({ kind: 'page', id, label, hint: 'Page' })),
  ].filter((hit, i, all) => all.findIndex((h) => h.kind === hit.kind && h.id === hit.id) === i).slice(0, 10);
}

function log(action: string, object: string): void {
  db.accessLog.unshift({ at: '2026-09-30T09:00:00Z', actor: db.session.name, role: db.session.role, action, object });
}

function read(path: string, q: Record<string, string>): MockResponse {
  const seg = path.split('/').filter(Boolean);
  const i = periodIndex(q.period);
  switch (seg[0]) {
    case 'session': return ok(visibleSession());
    case 'score': return ok(scoreFor(q.period));
    case 'domains': return ok(domains.map((d) => ({ ...d, score: d.history[i] })));
    case 'actions': return ok(db.actions);
    case 'alerts': return ok(db.alerts);
    case 'contacts': return ok(contacts.filter((c) => (!q.status || q.status === 'ALL' || c.status === q.status) && (!q.q || c.phoneE164.includes(q.q.replace(/\D/g, '')))));
    case 'consent': return ok(consent);
    case 'consent-pages': return ok(db.consentPages);
    case 'revocation': return ok(revocation);
    case 'vault': return ok(vault);
    case 'position': return ok({ ...position, phone: q.phone || position.phone, date: q.date || position.date, insideCoverage: (q.date || position.date) >= '2026-05-01' });
    case 'hash-check': {
      const found = (q.hash ?? '').trim().toLowerCase() === KNOWN_HASH;
      const result: HashCheck = found
        ? { found, artifact: 'TrustedForm certificate · lead L-88214', capturedAt: '2026-09-04T09:12:40Z', anchoredOn: '2026-09-05', tier: 2 }
        : { found, artifact: null, capturedAt: null, anchoredOn: null, tier: null };
      return ok(result);
    }
    case 'legal-holds': return ok(db.legalHolds);
    case 'evidence': {
      const file = evidenceFiles[decodeURIComponent(seg[1] ?? '')];
      return file ? ok(file) : fail(404, 'No evidence file for this number in the sample data.');
    }
    case 'metrics': return ok(metrics.map((m) => (i === score.history.length - 1 ? m : { ...m, value: m.history[i], display: m.history[i] === null ? m.display : `${m.history[i]}${m.unit}` })));
    case 'conduct': return ok(conduct);
    case 'leads': return ok(leads);
    case 'vendors': return ok(vendorSummary);
    case 'sources': return ok(sources);
    case 'uploads': return ok(db.uploads);
    case 'reports': return ok({ types: reportTypes, runs: db.reportRuns });
    case 'rulebook': return ok(isInternal(db.session.role) ? rulebook : { ...rulebook, impact: [] });
    case 'reg-changes': return ok(db.regChanges);
    case 'readiness': return ok(db.readiness);
    case 'settings': return ok(db.settings);
    case 'users': return ok(db.users);
    case 'access-log': return ok(db.accessLog);
    case 'search': return ok(search(q.q ?? ''));
    default: return fail(404, `No mock for GET ${path}`);
  }
}

function write(method: string, path: string, body: Record<string, unknown>): MockResponse {
  const seg = path.split('/').filter(Boolean);
  // "/session/sign-in" names its verb second; "/alerts/al-1/review" names it third, after the id.
  const verb = seg[0] === 'session' ? seg[1] : seg[2];
  const key = `${method} ${seg[0]}${verb ? `/${verb}` : ''}`;
  switch (key) {
    case 'POST session/sign-in': {
      if (!body.email || !body.password) return fail(400, 'Enter your email and password.');
      db.session.signedIn = true;
      return ok(visibleSession());
    }
    case 'POST session/sign-out': db.session.signedIn = false; return ok(visibleSession());
    case 'POST session/reset': return ok({ sent: true });
    // Sample data only: lets a reviewer see the portal as another role or engagement mode.
    case 'POST session/view-as': {
      if (body.role) db.session.role = body.role as Role;
      if (body.engagementMode) db.session.engagementMode = body.engagementMode as EngagementMode;
      return ok(visibleSession());
    }
    case 'PATCH actions': {
      const action = db.actions.find((a) => a.id === seg[1]);
      if (!action) return fail(404, 'Action not found.');
      Object.assign(action, body);
      action.overdue = action.due !== null && action.due < '2026-09-30' && action.status !== 'resolved';
      log('Updated', `Action ${action.rank}`);
      return ok(action);
    }
    case 'POST alerts/review': {
      const alert = db.alerts.find((a) => a.id === seg[1]);
      if (!alert) return fail(404, 'Alert not found.');
      alert.reviewed = true;
      return ok(alert);
    }
    case 'PATCH consent-pages': {
      const page = db.consentPages.find((p) => p.id === seg[1]);
      if (!page) return fail(404, 'Page not found.');
      Object.assign(page, body);
      return ok(page);
    }
    case 'POST legal-holds': {
      const hold = { id: `lh-${db.legalHolds.length + 1}`, scope: body.scope, target: body.target, reason: body.reason, setBy: `${db.session.name}`, setOn: '2026-09-30', releasedOn: null };
      db.legalHolds.unshift(hold as (typeof db.legalHolds)[number]);
      log('Set legal hold', String(body.target));
      return ok(hold);
    }
    case 'POST legal-holds/release': {
      const hold = db.legalHolds.find((h) => h.id === seg[1]);
      if (!hold) return fail(404, 'Hold not found.');
      hold.releasedOn = '2026-09-30';
      log('Released legal hold', hold.target);
      return ok(hold);
    }
    case 'POST uploads': {
      const upload = { artifactId: `art-${9100 + db.uploads.length}`, source: String(body.source), fileName: String(body.fileName), sha256: String(body.sha256), receivedAt: '2026-09-30T09:00:00Z', rowsRead: Number(body.rows ?? 0), rowsRejected: 0 };
      db.uploads.unshift(upload);
      log('Uploaded', upload.fileName);
      return ok(upload);
    }
    case 'POST reports': {
      const run = { id: `r-${32 + db.reportRuns.length}`, name: String(body.name), period: String(body.period), requestedBy: db.session.name, at: '2026-09-30T09:00:00Z', status: 'queued' as const };
      db.reportRuns.unshift(run);
      log('Requested', run.name);
      return ok(run);
    }
    case 'POST reg-changes/confirm': {
      const change = db.regChanges.find((c) => c.id === seg[1]);
      if (!change) return fail(404, 'Change not found.');
      change.confirmed = true;
      return ok(change);
    }
    case 'PATCH setup': {
      const item = db.readiness.setup.find((s) => s.id === seg[1]);
      if (!item) return fail(404, 'Item not found.');
      item.done = Boolean(body.done);
      return ok(item);
    }
    case 'PATCH settings/notifications': {
      const n = db.settings.notifications.find((x) => x.kind === body.kind);
      if (!n) return fail(404, 'Notification not found.');
      n.email = Boolean(body.email);
      return ok(n);
    }
    case 'POST users': {
      if (!body.email) return fail(400, 'Enter an email address.');
      const user = { id: `u-${db.users.length + 1}`, name: String(body.name || body.email), email: String(body.email), role: body.role as Role, status: 'invited' as const, lastSeen: null, scope: body.role === 'counsel_guest' ? String(body.scope || 'Read-only · Sep 2026') : null };
      db.users.push(user);
      log('Invited', user.email);
      return ok(user);
    }
    case 'PATCH users': {
      const user = db.users.find((u) => u.id === seg[1]);
      if (!user) return fail(404, 'User not found.');
      user.role = body.role as Role;
      return ok(user);
    }
    case 'DELETE users': {
      const user = db.users.find((u) => u.id === seg[1]);
      if (!user) return fail(404, 'User not found.');
      if (user.role === 'owner') return fail(400, 'The owner cannot be removed.');
      db.users = db.users.filter((u) => u.id !== seg[1]);
      log('Removed access', user.email);
      return ok({ removed: true });
    }
    default: return fail(404, `No mock for ${method} ${path}`);
  }
}

export function mockApi({ method, path, query = {}, body }: MockRequest): MockResponse {
  const open = path.startsWith('/session');
  if (!open && !db.session.signedIn) return fail(401, 'Sign in to continue.');
  return method === 'GET' ? read(path, query) : write(method, path, (body ?? {}) as Record<string, unknown>);
}
