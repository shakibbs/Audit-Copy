# Frontend Portal — Part B: Sample data, mock API, state and shell (Module 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve the prototype's sample data through a mock API that follows the contract, and build the app shell (sidebar, header, watermark, disclosure) and the shared UI pieces every screen uses.

**Architecture:** `src/mock/api.ts` is one pure function, `mockApi(request) → response`. The Next catch-all route handler calls it in dev; an MSW handler calls it in tests. Module 6 deletes the route handler and the mock, and adds a Next.js rewrite that forwards `/api/*` to the Django API. Session, selected run and role gating live in React context.

**Tech Stack:** as Part A. **Prerequisite:** [Part A](2026-10-03-01a-portal-foundation.md) complete. **No git steps.**

All paths are under `frontend/`. Run commands from `frontend/`.

---

### Task B1: Fixtures and the mock API function

**Files:**
- Create: `src/mock/fixtures.ts`, `src/mock/api.ts`
- Test: `tests/mock/api.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import * as fx from '@/mock/fixtures';
import { mockApi, resetMock } from '@/mock/api';
import { assertNoBannedWordsDeep } from '@/lib/wording';

const get = (path: string, query = '') => mockApi({ method: 'GET', path, query: new URLSearchParams(query), body: null });
const post = (path: string, body: unknown = null, query = '') => mockApi({ method: 'POST', path, query: new URLSearchParams(query), body });

beforeEach(() => resetMock());

describe('fixtures', () => {
  it('contain no banned wording anywhere', () => {
    expect(() => assertNoBannedWordsDeep(fx, 'fixtures')).not.toThrow();
  });
  it('carry all 33 metrics', () => {
    expect(fx.metrics).toHaveLength(33);
    expect(fx.metrics.find((m) => m.metricCode === 'M08')?.display).toBe('6.0 h');
  });
});

describe('mockApi', () => {
  it('serves the score', () => {
    const res = get('/clients/acme/score');
    expect(res.status).toBe(200);
    expect(res.json).toMatchObject({ overall: 81.3, grade: 'C', checkpointsRun: 812 });
  });
  it('filters contacts by status', () => {
    expect((get('/clients/acme/contacts').json as unknown[]).length).toBe(10);
    const weak = get('/clients/acme/contacts', 'status=WEAK').json as { status: string }[];
    expect(weak).toHaveLength(2);
    expect(weak.every((c) => c.status === 'WEAK')).toBe(true);
  });
  it('updates a finding status until reset', () => {
    expect(post('/clients/acme/findings/f-1/status', { status: 'in_progress' }).status).toBe(200);
    const list = get('/clients/acme/findings').json as { findingId: string; status: string }[];
    expect(list.find((f) => f.findingId === 'f-1')?.status).toBe('in_progress');
    resetMock();
    const again = get('/clients/acme/findings').json as { findingId: string; status: string }[];
    expect(again.find((f) => f.findingId === 'f-1')?.status).toBe('open');
  });
  it('revokes a source and records an upload', () => {
    expect(post('/clients/acme/sources/src-2/revoke').json).toMatchObject({ status: 'revoked' });
    const up = post('/clients/acme/uploads', null, 'type=dnc_scrub');
    expect(up.status).toBe(201);
    expect(up.json).toMatchObject({ artifactId: 'art-1', uploadType: 'dnc_scrub' });
  });
  it('serves an evidence file by encoded or plain number and 404s otherwise', () => {
    expect(get('/clients/acme/numbers/%2B14805550923/evidence').status).toBe(200);
    expect(get('/clients/acme/numbers/+14805550923/evidence').status).toBe(200);
    expect(get('/clients/acme/numbers/+10000000000/evidence').status).toBe(404);
  });
  it('returns 404 for an unknown route', () => {
    expect(get('/nope').status).toBe(404);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/mock/api.test.ts`
Expected: FAIL — cannot resolve `@/mock/fixtures`.

- [ ] **Step 3: Write `src/mock/fixtures.ts`** (the prototype's sample data; M08 corrected to 6.0 h, sources as tiers, M16 "possible")

```ts
import type {
  Alert, CheckState, ContactRow, EvidenceFile, Family, Finding, ImpactRow, LeadSummary, MatrixCell,
  MetricSnapshot, RevocationSummary, RulebookVersion, Run, Score, Session, Source,
} from '@/api/types';

export const session: Session = {
  userId: 'u-1', clientId: 'acme', clientName: 'Acme Solar', role: 'owner', engagementMode: 'direct',
  reportPeriod: { from: '2026-09-01', to: '2026-09-30' }, sampleData: true,
};

export const runs: Run[] = [
  { runId: 'run-2', kind: 'nightly', evaluationAsOf: '2026-09-30T23:59:00Z', rulebookVersion: 'rb-2026.09', rulebookStatus: 'approved', codeVersion: '0.1.0', variant: 'single', outputVisibility: 'client', finishedAt: '2026-10-01T02:10:00Z' },
  { runId: 'run-3', kind: 'nightly', evaluationAsOf: '2026-09-30T23:59:00Z', rulebookVersion: 'rb-2026.10-p', rulebookStatus: 'provisional', codeVersion: '0.1.0', variant: 'strict', outputVisibility: 'internal', finishedAt: '2026-10-01T02:40:00Z' },
];

export const score: Score = {
  runId: 'run-2', overall: 81.3, grade: 'C', hardCap: { cappedGrade: 'C', share: 11.2, capShare: 10 },
  provisional: false, checkpointsRun: 812, checkpointsTotal: 1132, contactsInPeriod: 10000,
  families: [
    { family: 'Permission', score: 74.2 }, { family: 'Who you contact', score: 81.0 }, { family: 'How you contact', score: 79.5 },
    { family: 'Stopping', score: 62.0 }, { family: 'Records', score: 88.1 }, { family: 'Company controls', score: 84.7 },
  ],
};

type Src = MetricSnapshot['source'];
const m = (metricCode: string, name: string, family: Family, source: Src, display: string, note: string,
  value: number | null = null, breakdown: Record<string, number> = {}, missingReason: string | null = null, detail?: string): MetricSnapshot =>
  ({ metricCode, name, family, source, display, note, value, breakdown, missingReason, ...(detail ? { detail } : {}) });

const P: Family = 'Permission', S: Family = 'Stopping', W: Family = 'Who you contact', H: Family = 'How you contact',
  R: Family = 'Records and company controls', L: Family = 'Lead Inspector';

export const metrics: MetricSnapshot[] = [
  m('M01', 'Consent Coverage', P, 'CiV', '88.0%', 'Legal basis · 84.0% incl. CiV policy', 88.0, { including_civ_policy: 84.0 }, null, 'Contacts that legally need proof. 84.0% including CiV-policy contacts.'),
  m('M02', 'Consent Status Mix', P, 'CiV', '76 / 8 / 11 / 5', 'Verified / weak / conflicting / no proof, %', null, { VERIFIED: 76, WEAK: 8, CONFLICTING: 11, NO_PROOF: 5, no_proof_policy_only_share: 40 }),
  m('M03', 'Certificate Validity', P, 'CiV', '92.5%', '800 certificate and phone pairs', 92.5),
  m('M04', 'Form Wording Pass Rate', P, 'CiV', '77.5%', '40 page versions captured', 77.5),
  m('M05', 'Form Change Alerts', P, 'CiV', '2 changed', '1 in the consent block', 2),
  m('M06', 'Lead Traceability', P, 'CiV', '84.0%', '5,000 web leads', 84.0),
  m('M07', 'Vendor Terms on File', P, 'AI', '66.7%', '8 of 12 active vendors', 66.7),
  m('M08', 'Opt-out Speed', S, 'CiV', '6.0 h', 'Median of 8 tests', 6.0),
  m('M09', 'Opt-outs Unprocessed at Deadline', S, 'CiV', '2 · 1', 'M09a not stopped · M09b contacted', null, { m09a: 2, m09b: 1 }),
  m('M10', 'Contacts After Opt-out', S, 'CiV', '14', '9 numbers', 14),
  m('M11', 'Pre-Contact Reassigned Checks', W, 'Client', 'Not measured', 'Client query logs not supplied', null, {}, 'Client query logs not supplied'),
  m('M12', 'Internal List Contacts', W, 'Client', '22', '11 numbers · supplied by client', 22),
  m('M13', 'DNC Scrub Record Check', W, 'Client', '2.0% stale', '35 flagged contacts · supplied by client', 2.0),
  m('M14', 'Litigator List Contacts', W, 'Client', '4', '2 numbers · informational', 4),
  m('M15', 'Cross-border Contacts', W, 'CiV', '15', 'Canada, UK, Jamaica', 15),
  m('M16', 'Out-of-Hours Contacts', H, 'CiV', '180 · 310', 'Federal · state; 120 possible (location uncertain)', null, { federal: 180, state: 310, possible: 120 }),
  m('M17', 'Over-Limit Contacts', H, 'CiV', '2', 'Per person, per subject', 2),
  m('M18', 'Holiday Contacts', H, 'CiV', '6', 'Recipient local date', 6),
  m('M19', 'Robo-contact Required-Proof Count', H, 'CiV', '540', '500 marketing · 25 informational · 15 unknown', 540),
  m('M20', 'Disclosure Check', H, 'AI', '85.0%', '100 calls + 20 templates', 85.0),
  m('M21', 'Caller ID Quality', H, 'CiV', '92.0%', '71% A · 26% B · 3% not available', 92.0),
  m('M31', 'Abandoned-Call Rate', H, 'CiV', '3.7%', '1 campaign above 3%', 3.7),
  m('M22a', 'Proof Completeness', R, 'CiV', '56.0%', 'Partial: 7 of 8 elements', 56.0, {}, null, 'Partial: 7 of 8 elements measured. Client reassigned-number query logs not supplied.'),
  m('M22b', 'Conduct Pass Rate', R, 'CiV', '93.0%', '1,000 numbers', 93.0, {}, null, 'Numbers with no contact after opt-out, out of hours, over limit or on a holiday.'),
  m('M23', 'Record Age Coverage', R, 'CiV', '70.0%', 'Dialer history 2 years', 70.0),
  m('M24', 'Complaint Handling', R, 'Client', '85.0%', 'Median 6 days', 85.0),
  m('M25a', 'Training Records', R, 'AI', '90.0%', '45 of 50 agents', 90.0),
  m('M25b', 'Acquired List Proof', R, 'CiV', '33.3%', '1 of 3 lists', 33.3),
  m('M26', 'Few-Signal Lead Rate', L, 'CiV', '86.0%', '550 some · 150 high', 86.0),
  m('M27', 'Consent Page Match Rate', L, 'CiV', '95.8%', '1,200 comparable leads', 95.8),
  m('M28', 'Consent Completeness Rate', L, 'CiV', '78.0%', '5,000 leads', 78.0),
  m('M29', 'Vendor Grade Mix', L, 'CiV', '1 A · 3 B · 1 C', '1 D · 1 F · 1 not enough data'),
  m('M30', 'Disputable Lead Value', L, 'CiV', '212 leads', '3 without price, left out of the total', 212),
];

const STEP_OF: Record<string, number> = {
  VF_OK: 6, NP_NO_CONSENT_TEXT: 3, NP_PRETICKED: 3, CF_NOT_FOUND: 2, CF_EXPIRED: 2, CF_FILE_MISSING: 2,
};
/** Which of the five checks decided the status, from the primary reason code. */
function checksFor(code: string): ContactRow['checks'] {
  const failAt = STEP_OF[code] ?? (code.startsWith('NP_') ? 1 : code.startsWith('CF_') ? 4 : 5);
  return [1, 2, 3, 4, 5].map((n): CheckState =>
    n < failAt ? 'pass' : n > failAt ? 'not_reached' : n === 5 ? 'gap' : 'fails') as ContactRow['checks'];
}

type C = Omit<ContactRow, 'checks'>;
const c = (row: C): ContactRow => ({ ...row, checks: checksFor(row.primaryReasonCode) });
const sha = (head: string, tail: string) => `${head}${'0'.repeat(56)}${tail}`;

export const contacts: ContactRow[] = [
  c({ eventId: 'ev-1', occurredAtUtc: '2026-09-29T14:02:00Z', phoneDisplay: '(602) •••-4471', phoneE164: '+16025554471', channel: 'Call', category: 'Marketing', bases: ['robocall_marketing'], status: 'VERIFIED', primaryReasonCode: 'VF_OK', reasonText: 'All five checks pass.', proofSummary: 'Web certificate, TrustedForm, captured Sep 29 14:01:18', tiers: [2], labels: ['Linked to lead', 'CiV stored copy'], artifactSha256: sha('9f2c', '4a1e') }),
  c({ eventId: 'ev-2', occurredAtUtc: '2026-09-29T13:47:00Z', phoneDisplay: '(480) •••-0923', phoneE164: '+14805550923', channel: 'Text', category: 'Marketing', bases: ['robocall_marketing'], status: 'NO_PROOF', primaryReasonCode: 'NP_AFTER_OPT_OUT', reasonText: 'An in-scope opt-out came before this contact, with no newer consent.', proofSummary: 'Web certificate (cut off by STOP on Sep 21)', tiers: [2], labels: ['Opt-out: reply STOP'], artifactSha256: sha('1b77', 'e03c') }),
  c({ eventId: 'ev-3', occurredAtUtc: '2026-09-29T11:15:00Z', phoneDisplay: '(623) •••-3380', phoneE164: '+16235553380', channel: 'Call', category: 'Marketing', bases: ['civ_policy'], status: 'NO_PROOF', primaryReasonCode: 'NP_NONE', reasonText: 'No accepted proof for this number. Needed under CiV policy only.', proofSummary: 'None supplied', tiers: [], labels: ['Manual live call', 'Not on any list'], artifactSha256: null }),
  c({ eventId: 'ev-4', occurredAtUtc: '2026-09-28T18:31:00Z', phoneDisplay: '(520) •••-7712', phoneE164: '+15205557712', channel: 'Call', category: 'Informational', bases: ['robocall_informational'], status: 'VERIFIED', primaryReasonCode: 'VF_OK', reasonText: 'All five checks pass.', proofSummary: 'Number given by customer at purchase (prior express)', tiers: [3], labels: ['Appointment reminder'], artifactSha256: sha('7c10', '9d52') }),
  c({ eventId: 'ev-5', occurredAtUtc: '2026-09-28T16:05:00Z', phoneDisplay: '(602) •••-1198', phoneE164: '+16025551198', channel: 'Call', category: 'Marketing', bases: ['robocall_marketing', 'dnc_listed'], status: 'CONFLICTING', primaryReasonCode: 'CF_PHONE_MISMATCH', reasonText: 'The phone number on the proof differs from the number contacted.', proofSummary: 'Web certificate for a different number', tiers: [2], labels: ['On client scrub list'], artifactSha256: sha('a4e9', '30bb') }),
  c({ eventId: 'ev-6', occurredAtUtc: '2026-09-28T10:44:00Z', phoneDisplay: '(480) •••-5561', phoneE164: '+14805555561', channel: 'Text', category: 'Marketing', bases: ['robocall_marketing'], status: 'WEAK', primaryReasonCode: 'WK_RETENTION', reasonText: 'Certificate not retained long-term; expires within 30 days.', proofSummary: 'Web certificate, not retained', tiers: [2], labels: ['Expires Oct 12'], artifactSha256: sha('55d2', 'c871') }),
  c({ eventId: 'ev-7', occurredAtUtc: '2026-09-27T20:58:00Z', phoneDisplay: '(928) •••-2047', phoneE164: '+19285552047', channel: 'Call', category: 'Marketing', bases: ['robocall_marketing'], status: 'WEAK', primaryReasonCode: 'WK_TIMING_UNCERTAIN', reasonText: 'Proof and contact are within the clock tolerance on unlinked sources.', proofSummary: 'Web certificate 45 s before call, unlinked', tiers: [2], labels: ['Unlinked sources'], artifactSha256: sha('e018', '4f6a') }),
  c({ eventId: 'ev-8', occurredAtUtc: '2026-09-27T15:20:00Z', phoneDisplay: '(602) •••-8834', phoneE164: '+16025558834', channel: 'Call', category: 'Marketing', bases: ['robocall_marketing'], status: 'CONFLICTING', primaryReasonCode: 'CF_PAGE_MISMATCH', reasonText: 'CiV’s page capture differs from the certificate snapshot.', proofSummary: 'Web certificate; page similarity 0.72', tiers: [1, 2], labels: ['Affiliate page'], artifactSha256: sha('3d9a', 'b2c4') }),
  c({ eventId: 'ev-9', occurredAtUtc: '2026-09-26T12:09:00Z', phoneDisplay: '(480) •••-6620', phoneE164: '+14805556620', channel: 'Call', category: 'Marketing', bases: ['robocall_marketing'], status: 'NO_PROOF', primaryReasonCode: 'NP_PRETICKED', reasonText: 'The consent box was pre-ticked on the captured page.', proofSummary: 'Web certificate; box pre-ticked', tiers: [1], labels: ['Vendor A, sub-ID 114'], artifactSha256: sha('c6f1', '0e97') }),
  c({ eventId: 'ev-10', occurredAtUtc: '2026-09-26T09:31:00Z', phoneDisplay: '(623) •••-9015', phoneE164: '+16235559015', channel: 'Text', category: 'Unknown', bases: ['robocall_marketing'], status: 'NO_PROOF', primaryReasonCode: 'NP_WRONG_TYPE', reasonText: 'Proof type does not meet what this contact requires.', proofSummary: 'Existing-customer relationship only', tiers: [3], labels: ['Category unknown'], artifactSha256: sha('8b35', 'f210') }),
];

export const alerts: Alert[] = [
  { alertId: 'al-1', severity: 'high', title: '14 contacts after opt-out across 9 numbers', when: 'Found Sep 29', routedTo: 'legal' },
  { alertId: 'al-2', severity: 'high', title: 'Consent block changed on the quote form page', when: 'Captured Sep 28', routedTo: 'legal' },
  { alertId: 'al-3', severity: 'medium', title: '42 certificates expire within 30 days (not retained)', when: 'As of Sep 30', routedTo: 'legal' },
  { alertId: 'al-4', severity: 'medium', title: 'Dialer connector not synced for 52 hours', when: 'Since Sep 28', routedTo: 'all' },
];

type Ch = MatrixCell['channel']; type Sy = MatrixCell['system'];
const cell = (channel: Ch, system: Sy, hours: number | 'NEVER' | null, testCount = 0, slow = false): MatrixCell => ({
  channel, system, tested: hours !== null, never: hours === 'NEVER',
  medianHours: typeof hours === 'number' ? hours : null, testCount, indicative: hours !== null && testCount < 3, slow,
});

export const revocation: RevocationSummary = {
  windowDays: 90, testCount: 8, medianHours: 6.0, p90: 'NEVER', notStoppedByDeadline: 2, contactedAfterDeadline: 1,
  deadlineBusinessDays: 10, minTestsPerCell: 3,
  cells: [
    cell('Reply STOP', 'Dialer', 2.0, 3), cell('Reply STOP', 'SMS platform', 0.4, 3), cell('Reply STOP', 'CRM', 5.5, 3), cell('Reply STOP', 'Lead platform', 26.0, 3),
    cell('Plain-words reply', 'Dialer', 20.0, 3, true), cell('Plain-words reply', 'SMS platform', 6.0, 3), cell('Plain-words reply', 'CRM', 'NEVER', 3), cell('Plain-words reply', 'Lead platform', 'NEVER', 2),
    cell('Spoken on a call', 'Dialer', 48.0, 2), cell('Spoken on a call', 'SMS platform', null), cell('Spoken on a call', 'CRM', 30.0, 2), cell('Spoken on a call', 'Lead platform', null),
    cell('Web or email', 'Dialer', 'NEVER', 3), cell('Web or email', 'SMS platform', 'NEVER', 3), cell('Web or email', 'CRM', 12.0, 3), cell('Web or email', 'Lead platform', null),
  ],
};

export const leads: LeadSummary = {
  leadsInspected: 5000, few: 4300, some: 550, high: 150, disputeCandidates: 212,
  vendors: [
    { vendorId: 'v-a', name: 'Vendor A', subId: '114', leads: 1420, highSignals: 12, score: 91.2, grade: 'A', notEnoughData: false, monthOnMonth: 1.4, dropAlert: false },
    { vendorId: 'v-b', name: 'Vendor B', subId: '22', leads: 1000, highSignals: 50, score: 88.6, grade: 'B', notEnoughData: false, monthOnMonth: -0.8, dropAlert: false },
    { vendorId: 'v-c', name: 'Vendor C', subId: null, leads: 860, highSignals: 18, score: 83.0, grade: 'B', notEnoughData: false, monthOnMonth: 2.1, dropAlert: false },
    { vendorId: 'v-d', name: 'Vendor D', subId: null, leads: 640, highSignals: 21, score: 79.4, grade: 'C', notEnoughData: false, monthOnMonth: -3.0, dropAlert: false },
    { vendorId: 'v-e', name: 'Vendor E', subId: '7', leads: 520, highSignals: 31, score: 61.8, grade: 'D', notEnoughData: false, monthOnMonth: -11.2, dropAlert: true },
    { vendorId: 'v-f', name: 'Vendor F', subId: null, leads: 480, highSignals: 18, score: 52.3, grade: 'F', notEnoughData: false, monthOnMonth: -4.5, dropAlert: false },
    { vendorId: 'v-g', name: 'Vendor G', subId: null, leads: 80, highSignals: 0, score: null, grade: null, notEnoughData: true, monthOnMonth: null, dropAlert: false },
  ],
};

export const findings: Finding[] = [
  { findingId: 'f-1', severity: 'high', title: '14 contacts after opt-out across 9 numbers', step: 'Map the dialer outcome “DNC request” to suppression in the SMS platform.', family: 'Stopping', status: 'open' },
  { findingId: 'f-2', severity: 'high', title: 'Consent block changed on the quote form page', step: 'Compare the new wording with the consent checklist and restore required items.', family: 'Permission', status: 'open' },
  { findingId: 'f-3', severity: 'high', title: '540 robo-contacts without the required proof type', step: 'Stop predictive dialing on leads whose only proof is a customer relationship.', family: 'How you contact', status: 'in_progress' },
  { findingId: 'f-4', severity: 'medium', title: '42 certificates expire within 30 days', step: 'Turn on certificate retention with your certificate vendor.', family: 'Permission', status: 'open' },
  { findingId: 'f-5', severity: 'medium', title: 'Dialer connector not synced for 52 hours', step: 'Reconnect the dialer from Sources.', family: 'Sources', status: 'open' },
  { findingId: 'f-6', severity: 'low', title: '4 caller IDs did not answer a callback', step: 'Route the listed caller IDs to a live line or voicemail.', family: 'How you contact', status: 'resolved' },
];

export const sources: Source[] = [
  { sourceId: 'src-1', name: 'TrustedForm certificates', tier: 2, access: 'Your account, API', lastSyncAt: '2026-09-30T22:00:00Z', status: 'ok', revocable: true, acceptsUpload: false },
  { sourceId: 'src-2', name: 'Convoso dialer', tier: 3, access: 'Least-privilege user, logged', lastSyncAt: '2026-09-28T20:00:00Z', status: 'stale', revocable: true, acceptsUpload: false },
  { sourceId: 'src-3', name: 'Twilio SMS', tier: 3, access: 'Read-only API', lastSyncAt: '2026-09-30T23:00:00Z', status: 'ok', revocable: true, acceptsUpload: false },
  { sourceId: 'src-4', name: 'Salesforce CRM', tier: 3, access: 'Read-only API', lastSyncAt: '2026-09-30T21:00:00Z', status: 'ok', revocable: true, acceptsUpload: false },
  { sourceId: 'src-5', name: 'LeadConduit leads', tier: 3, access: 'Read-only API', lastSyncAt: '2026-09-30T23:00:00Z', status: 'ok', revocable: true, acceptsUpload: false },
  { sourceId: 'src-6', name: 'Somos reassigned numbers', tier: 1, access: 'CiV caller-agent account', lastSyncAt: '2026-09-30T18:00:00Z', status: 'ok', revocable: false, acceptsUpload: false },
  { sourceId: 'src-7', name: 'CiV consent page captures', tier: 1, access: 'Headless browser', lastSyncAt: '2026-09-30T20:00:00Z', status: 'ok', revocable: false, acceptsUpload: false },
  { sourceId: 'src-8', name: 'Internal do-not-contact list', tier: 4, access: 'Upload', lastSyncAt: '2026-09-28T00:00:00Z', status: 'ok', revocable: false, acceptsUpload: true },
  { sourceId: 'src-9', name: 'DNC scrub records', tier: 4, access: 'Upload', lastSyncAt: null, status: 'not_supplied', revocable: false, acceptsUpload: true },
  { sourceId: 'src-10', name: 'Your reassigned-number query logs', tier: 4, access: 'Export from your Somos account', lastSyncAt: null, status: 'not_supplied', revocable: false, acceptsUpload: true },
];

export const evidence: Record<string, EvidenceFile> = {
  '+14805550923': {
    phoneE164: '+14805550923', epochId: 'ep-1', epochCertainty: 'bounded', worstStatus: 'NO_PROOF',
    contactCounts: { NO_PROOF: 1, CONFLICTING: 0, WEAK: 1, VERIFIED: 1, PENDING: 0 },
    contacts: [
      { eventId: 'ev-0a', occurredAtUtc: '2026-09-02T15:04:00Z', channel: 'Call', dialMode: 'predictive', status: 'VERIFIED', primaryReasonCode: 'VF_OK', isLegalBasis: true, labels: [], bases: [{ basis: 'robocall_marketing', status: 'VERIFIED', codes: ['VF_OK'], proofId: 'pf-1' }] },
      { eventId: 'ev-0b', occurredAtUtc: '2026-09-11T22:10:00Z', channel: 'Text', dialMode: null, status: 'WEAK', primaryReasonCode: 'WK_TIMING_UNCERTAIN', isLegalBasis: true, labels: ['reassignment uncertain'], bases: [{ basis: 'robocall_marketing', status: 'WEAK', codes: ['WK_TIMING_UNCERTAIN'], proofId: 'pf-1' }] },
      { eventId: 'ev-2', occurredAtUtc: '2026-09-29T13:47:00Z', channel: 'Text', dialMode: null, status: 'NO_PROOF', primaryReasonCode: 'NP_AFTER_OPT_OUT', isLegalBasis: true, labels: ['Opt-out: reply STOP'], bases: [{ basis: 'robocall_marketing', status: 'NO_PROOF', codes: ['NP_AFTER_OPT_OUT'], proofId: null }] },
    ],
    proofElements: [
      { number: 1, element: 'Every contact VERIFIED or WEAK', applies: true, present: false, tier: null, artifactSha256: null, sourceSystem: null, capturedAt: null },
      { number: 2, element: 'Consent page as of that date', applies: true, present: true, tier: 1, artifactSha256: sha('c3ab', 'c4f2'), sourceSystem: 'CiV page capture', capturedAt: '2026-08-30T11:00:00Z' },
      { number: 3, element: 'Third-party proof', applies: true, present: true, tier: 2, artifactSha256: sha('1b77', 'e03c'), sourceSystem: 'TrustedForm', capturedAt: '2026-08-30T10:58:00Z' },
      { number: 4, element: 'Lead source', applies: true, present: true, tier: 3, artifactSha256: sha('2c26', 'e7ae'), sourceSystem: 'LeadConduit', capturedAt: '2026-08-30T10:59:00Z' },
      { number: 5, element: 'Contact log with required fields', applies: true, present: true, tier: 3, artifactSha256: sha('fcde', '8fb9'), sourceSystem: 'Twilio SMS', capturedAt: '2026-09-30T02:00:00Z' },
      { number: 6, element: 'Opt-out history synced', applies: true, present: true, tier: 3, artifactSha256: sha('4e07', '9fce'), sourceSystem: 'Twilio SMS', capturedAt: '2026-09-30T02:00:00Z' },
      { number: 7, element: 'Internal list checked', applies: true, present: true, tier: 4, artifactSha256: sha('6b86', '4b27'), sourceSystem: 'Upload', capturedAt: '2026-09-28T00:00:00Z' },
      { number: 8, element: 'Your pre-contact reassigned check', applies: true, present: null, tier: null, artifactSha256: null, sourceSystem: null, capturedAt: null },
    ],
    optOuts: [{ receivedAt: '2026-09-21T18:30:00Z', channel: 'Text', method: 'Reply STOP' }],
    listChecks: [
      { list: 'Internal do-not-contact list', onList: false, label: 'supplied by client' },
      { list: 'DNC scrub records', onList: null, label: 'DNC scrub records not supplied' },
    ],
    merkle: { date: '2026-09-30', root: sha('5fec', '57e9'), anchored: true },
    runId: 'run-2',
  },
};

export const rulebookVersions: RulebookVersion[] = [
  { versionId: 'rb-2026.09', status: 'approved', publishedAt: '2026-09-15', approvedBy: 'Product', counselApprovedBy: 'Counsel', notes: 'Initial approved set' },
  { versionId: 'rb-2026.10-p', status: 'provisional', publishedAt: '2026-10-01', approvedBy: 'Product', counselApprovedBy: null, notes: 'A12 / A17 variants under test' },
];

export const impact: ImpactRow[] = [
  { key: 'autodialed_modes', counselItem: 'A12', strictValue: 'all except manual', lenientValue: 'none', contactsEvaluated: 48210, contactsChangingStatus: 6120 },
  { key: 'seller_absent_effect', counselItem: 'B7', strictValue: 'NO_PROOF', lenientValue: 'WEAK', contactsEvaluated: 48210, contactsChangingStatus: 940 },
];
```

- [ ] **Step 4: Write `src/mock/api.ts`**

```ts
import type { Finding, FindingStatus, Source, UploadResult } from '@/api/types';
import * as fx from './fixtures';

export interface MockRequest { method: string; path: string; query: URLSearchParams; body: unknown }
export interface MockResponse { status: number; json: unknown }

// In-memory state so mutations are visible until reset.
let findings: Finding[] = [];
let sources: Source[] = [];
let uploads: UploadResult[] = [];

export function resetMock(): void {
  findings = fx.findings.map((f) => ({ ...f }));
  sources = fx.sources.map((s) => ({ ...s }));
  uploads = [];
}
resetMock();

const ok = (json: unknown, status = 200): MockResponse => ({ status, json });
const notFound = (what: string): MockResponse => ({ status: 404, json: { error: `${what} not found` } });

/** The whole mock backend. `path` excludes the `/api` prefix. */
export function mockApi({ method, path, query, body }: MockRequest): MockResponse {
  const seg = path.split('/').filter(Boolean).map((s) => decodeURIComponent(s));
  const [a, , c, d, e] = seg;

  if (method === 'GET' && path === '/session') return ok(fx.session);
  if (method === 'GET' && path === '/rulebook/versions') return ok(fx.rulebookVersions);
  if (method === 'GET' && path === '/rulebook/impact') return ok(fx.impact);
  if (a !== 'clients') return notFound('route');

  if (method === 'GET' && seg.length === 3) {
    if (c === 'runs') return ok(fx.runs);
    if (c === 'score') return ok(fx.score);
    if (c === 'metrics') return ok(fx.metrics);
    if (c === 'alerts') return ok(fx.alerts);
    if (c === 'revocation') return ok(fx.revocation);
    if (c === 'leads') return ok(fx.leads);
    if (c === 'findings') return ok(findings);
    if (c === 'sources') return ok(sources);
    if (c === 'contacts') {
      const status = query.get('status');
      return ok(status ? fx.contacts.filter((x) => x.status === status) : fx.contacts);
    }
  }
  if (method === 'GET' && c === 'numbers' && e === 'evidence') {
    const file = fx.evidence[d];
    return file ? ok(file) : notFound('evidence file');
  }
  if (method === 'POST' && c === 'findings' && e === 'status') {
    const f = findings.find((x) => x.findingId === d);
    if (!f) return notFound('finding');
    f.status = (body as { status: FindingStatus }).status;
    return ok(f);
  }
  if (method === 'POST' && c === 'sources' && e === 'revoke') {
    const s = sources.find((x) => x.sourceId === d);
    if (!s) return notFound('source');
    s.status = 'revoked';
    return ok(s);
  }
  if (method === 'POST' && c === 'uploads' && seg.length === 3) {
    const result: UploadResult = {
      artifactId: `art-${uploads.length + 1}`,
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      uploadType: query.get('type') ?? 'unknown',
      receivedAt: '2026-10-01T09:00:00Z',
    };
    uploads.push(result);
    return ok(result, 201);
  }
  return notFound('route');
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/mock/api.test.ts`
Expected: PASS (8 tests).

---

### Task B2: MSW for tests and the Next route handler for dev

**Files:**
- Create: `tests/msw.ts`, `src/app/api/[...path]/route.ts`
- Modify: `vitest.setup.ts`
- Test: `tests/mock/msw.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';

describe('MSW bridge', () => {
  it('answers fetch calls under /api from the mock', async () => {
    const res = await fetch('http://localhost:3000/api/clients/acme/score');
    expect(res.status).toBe(200);
    expect((await res.json()).grade).toBe('C');
  });
  it('passes JSON bodies and query strings through', async () => {
    const res = await fetch('http://localhost:3000/api/clients/acme/findings/f-2/status', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'resolved' }),
    });
    expect((await res.json()).status).toBe('resolved');
    const weak = await (await fetch('http://localhost:3000/api/clients/acme/contacts?status=WEAK')).json();
    expect(weak).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/mock/msw.test.ts`
Expected: FAIL — fetch to localhost:3000 is refused (no MSW server yet).

- [ ] **Step 3: Write `tests/msw.ts`**

```ts
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { mockApi } from '@/mock/api';

export const server = setupServer(
  http.all('*/api/*', async ({ request }) => {
    const url = new URL(request.url);
    const isJson = (request.headers.get('content-type') ?? '').includes('application/json');
    const body = request.method === 'POST' && isJson ? await request.json().catch(() => null) : null;
    const res = mockApi({ method: request.method, path: url.pathname.replace(/^\/api/, ''), query: url.searchParams, body });
    return HttpResponse.json(res.json as Record<string, unknown>, { status: res.status });
  }),
);
```

- [ ] **Step 4: Add the MSW lifecycle to `vitest.setup.ts`**

Replace the last line (`afterEach(() => resetNav());`) and the vitest import with:
```ts
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { resetMock } from './src/mock/api';
import { server } from './tests/msw';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  resetMock();
  resetNav();
});
afterAll(() => server.close());
```
(Keep the `next/link` and `next/navigation` mocks and the other imports from Part A unchanged; the file must have one `vitest` import line, the one above.)

- [ ] **Step 5: Write `src/app/api/[...path]/route.ts`** (dev mock; module 6 deletes this file and forwards `/api` to Django)

```ts
import { NextRequest, NextResponse } from 'next/server';
import { mockApi } from '@/mock/api';

async function handle(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const isJson = (req.headers.get('content-type') ?? '').includes('application/json');
  const body = req.method === 'POST' && isJson ? await req.json().catch(() => null) : null;
  const res = mockApi({ method: req.method, path: `/${path.join('/')}`, query: req.nextUrl.searchParams, body });
  return NextResponse.json(res.json, { status: res.status });
}

export const GET = handle;
export const POST = handle;
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run tests/mock`
Expected: PASS (10 tests across two files).

---

### Task B3: API client and query hooks

**Files:**
- Create: `src/api/client.ts`, `src/api/queries.ts`

- [ ] **Step 1: Write `src/api/client.ts`**

```ts
import type {
  Alert, ConsentStatus, ContactRow, EvidenceFile, Finding, FindingStatus, ImpactRow, LeadSummary,
  MetricSnapshot, RevocationSummary, RulebookVersion, Run, Score, Session, Source, UploadResult,
} from './types';

const url = (path: string) => new URL(`/api${path}`, window.location.origin).toString();

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(url(path));
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return (await res.json()) as T;
}

/** Reads a file's bytes with FileReader, which every browser and the test environment support. */
function readBytes(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(url(path), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return (await res.json()) as T;
}

export const api = {
  session: () => getJson<Session>('/session'),
  runs: (id: string) => getJson<Run[]>(`/clients/${id}/runs`),
  score: (id: string, run: string) => getJson<Score>(`/clients/${id}/score?run=${run}`),
  metrics: (id: string, run: string) => getJson<MetricSnapshot[]>(`/clients/${id}/metrics?run=${run}`),
  contacts: (id: string, run: string, status: ConsentStatus | null) =>
    getJson<ContactRow[]>(`/clients/${id}/contacts?run=${run}${status ? `&status=${status}` : ''}`),
  alerts: (id: string) => getJson<Alert[]>(`/clients/${id}/alerts`),
  revocation: (id: string, run: string) => getJson<RevocationSummary>(`/clients/${id}/revocation?run=${run}`),
  leads: (id: string, run: string) => getJson<LeadSummary>(`/clients/${id}/leads?run=${run}`),
  findings: (id: string) => getJson<Finding[]>(`/clients/${id}/findings`),
  setFindingStatus: (id: string, findingId: string, status: FindingStatus) =>
    postJson<Finding>(`/clients/${id}/findings/${findingId}/status`, { status }),
  sources: (id: string) => getJson<Source[]>(`/clients/${id}/sources`),
  revokeSource: (id: string, sourceId: string) => postJson<Source>(`/clients/${id}/sources/${sourceId}/revoke`, {}),
  /** The upload type and file name travel in the query string; the body is the file's raw bytes, unchanged. */
  upload: async (id: string, uploadType: string, file: File): Promise<UploadResult> => {
    const query = `type=${encodeURIComponent(uploadType)}&name=${encodeURIComponent(file.name)}`;
    const res = await fetch(url(`/clients/${id}/uploads?${query}`), {
      method: 'POST', headers: { 'content-type': 'application/octet-stream' }, body: await readBytes(file),
    });
    if (!res.ok) throw new Error(`${res.status} upload`);
    return (await res.json()) as UploadResult;
  },
  evidence: (id: string, phone: string) => getJson<EvidenceFile>(`/clients/${id}/numbers/${encodeURIComponent(phone)}/evidence`),
  rulebookVersions: () => getJson<RulebookVersion[]>('/rulebook/versions'),
  rulebookImpact: () => getJson<ImpactRow[]>('/rulebook/impact'),
};
```

- [ ] **Step 2: Write `src/api/queries.ts`**

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { ConsentStatus, FindingStatus } from './types';

export const useSessionQuery = () => useQuery({ queryKey: ['session'], queryFn: api.session });
export const useRuns = (id: string) => useQuery({ queryKey: ['runs', id], queryFn: () => api.runs(id) });
export const useScore = (id: string, run: string | null) =>
  useQuery({ queryKey: ['score', id, run], queryFn: () => api.score(id, run!), enabled: !!run });
export const useMetrics = (id: string, run: string | null) =>
  useQuery({ queryKey: ['metrics', id, run], queryFn: () => api.metrics(id, run!), enabled: !!run });
export const useContacts = (id: string, run: string | null, status: ConsentStatus | null) =>
  useQuery({ queryKey: ['contacts', id, run, status], queryFn: () => api.contacts(id, run!, status), enabled: !!run });
export const useAlerts = (id: string) => useQuery({ queryKey: ['alerts', id], queryFn: () => api.alerts(id) });
export const useRevocation = (id: string, run: string | null) =>
  useQuery({ queryKey: ['revocation', id, run], queryFn: () => api.revocation(id, run!), enabled: !!run });
export const useLeads = (id: string, run: string | null) =>
  useQuery({ queryKey: ['leads', id, run], queryFn: () => api.leads(id, run!), enabled: !!run });
export const useFindings = (id: string) => useQuery({ queryKey: ['findings', id], queryFn: () => api.findings(id) });
export function useSetFindingStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { findingId: string; status: FindingStatus }) => api.setFindingStatus(id, v.findingId, v.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['findings', id] }),
  });
}
export const useSources = (id: string) => useQuery({ queryKey: ['sources', id], queryFn: () => api.sources(id) });
export function useRevokeSource(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sourceId: string) => api.revokeSource(id, sourceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sources', id] }),
  });
}
export const useUpload = (id: string) =>
  useMutation({ mutationFn: (v: { uploadType: string; file: File }) => api.upload(id, v.uploadType, v.file) });
export const useEvidence = (id: string, phone: string | null) =>
  useQuery({ queryKey: ['evidence', id, phone], queryFn: () => api.evidence(id, phone!), enabled: !!phone, retry: false });
export const useRulebookVersions = () => useQuery({ queryKey: ['rulebook', 'versions'], queryFn: api.rulebookVersions });
export const useRulebookImpact = () => useQuery({ queryKey: ['rulebook', 'impact'], queryFn: api.rulebookImpact });
```

- [ ] **Step 3: Type-check**

Run: `npm run typecheck`
Expected: no errors.

---

### Task B4: Session, run selection, role gate, test helper

**Files:**
- Create: `src/state/SessionContext.tsx`, `src/state/RunContext.tsx`, `src/state/RequireRole.tsx`, `tests/utils.tsx`
- Test: `tests/state/state.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import { RequireRole } from '@/state/RequireRole';
import { useRunContext } from '@/state/RunContext';

function Probe() {
  const { runs, selectedRun } = useRunContext();
  return <p>{runs.length} runs · selected {selectedRun?.runId ?? 'none'}</p>;
}

describe('RunContext', () => {
  it('shows client roles only client-visible runs', async () => {
    renderWithProviders(<Probe />, { session: { role: 'owner' } });
    expect(await screen.findByText('1 runs · selected run-2')).toBeInTheDocument();
  });
  it('shows internal roles every run, including provisional ones', async () => {
    renderWithProviders(<Probe />, { session: { role: 'engineer' } });
    expect(await screen.findByText('2 runs · selected run-2')).toBeInTheDocument();
  });
});

describe('RequireRole', () => {
  it('renders children for an allowed role', () => {
    renderWithProviders(<RequireRole roles={['owner']}><p>inside</p></RequireRole>, { session: { role: 'owner' } });
    expect(screen.getByText('inside')).toBeInTheDocument();
  });
  it('blocks a role that is not allowed', () => {
    renderWithProviders(<RequireRole roles={['counsel']}><p>inside</p></RequireRole>, { session: { role: 'owner' } });
    expect(screen.getByText('This page is not available for your role.')).toBeInTheDocument();
    expect(screen.queryByText('inside')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/state/state.test.tsx`
Expected: FAIL — cannot resolve `../utils`.

- [ ] **Step 3: Write `src/state/SessionContext.tsx`**

```tsx
'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useSessionQuery } from '@/api/queries';
import { INTERNAL_ROLES, type Role, type Session } from '@/api/types';

const SessionContext = createContext<Session | null>(null);

export const isInternalRole = (role: Role): boolean => INTERNAL_ROLES.includes(role);

/** In counsel-directed engagements the operations role has no portal access (spec §9, Alerts). */
export const isLockedOut = (s: Session): boolean => s.role === 'operations' && s.engagementMode === 'counsel_directed';

/** Loads the session from the API unless an override is given (tests). */
export function SessionProvider({ children, override }: { children: ReactNode; override?: Session }) {
  const query = useSessionQuery();
  const session = override ?? query.data ?? null;
  if (!session) return <p className="p-8 text-muted">Loading…</p>;
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const s = useContext(SessionContext);
  if (!s) throw new Error('useSession must be used inside SessionProvider');
  return s;
}
```

- [ ] **Step 4: Write `src/state/RunContext.tsx`**

```tsx
'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useRuns } from '@/api/queries';
import type { Run } from '@/api/types';
import { isInternalRole, useSession } from './SessionContext';

interface RunState { runs: Run[]; selectedRun: Run | null; select: (runId: string) => void }

const RunContext = createContext<RunState | null>(null);

export function RunProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const { data } = useRuns(session.clientId);
  const [chosen, setChosen] = useState<string | null>(null);

  // Client roles never see internal (provisional or draft) runs.
  const runs = useMemo(
    () => (data ?? []).filter((r) => isInternalRole(session.role) || r.outputVisibility === 'client'),
    [data, session.role],
  );
  const selectedRun = runs.find((r) => r.runId === chosen) ?? runs[0] ?? null;

  return <RunContext.Provider value={{ runs, selectedRun, select: setChosen }}>{children}</RunContext.Provider>;
}

export function useRunContext(): RunState {
  const s = useContext(RunContext);
  if (!s) throw new Error('useRunContext must be used inside RunProvider');
  return s;
}
```

- [ ] **Step 5: Write `src/state/RequireRole.tsx`**

```tsx
'use client';

import type { ReactNode } from 'react';
import type { Role } from '@/api/types';
import { useSession } from './SessionContext';

export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const session = useSession();
  if (!roles.includes(session.role)) return <p className="text-muted">This page is not available for your role.</p>;
  return <>{children}</>;
}
```

- [ ] **Step 6: Write `tests/utils.tsx`**

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Session } from '@/api/types';
import { session as baseSession } from '@/mock/fixtures';
import { RunProvider } from '@/state/RunContext';
import { SessionProvider } from '@/state/SessionContext';
import { navState } from './nav';

interface Options { session?: Partial<Session>; pathname?: string; params?: Record<string, string> }

export function renderWithProviders(ui: ReactNode, { session, pathname = '/', params = {} }: Options = {}) {
  navState.pathname = pathname;
  navState.params = params;
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <SessionProvider override={{ ...baseSession, ...session }}>
        <RunProvider>{ui}</RunProvider>
      </SessionProvider>
    </QueryClientProvider>,
  );
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run tests/state/state.test.tsx`
Expected: PASS (4 tests).

---

### Task B5: Shared UI — Card, StatTile, chips, NotMeasured

**Files:**
- Create: `src/components/Card.tsx`, `src/components/StatTile.tsx`, `src/components/PageHeading.tsx`, `src/lib/chip.ts`, `src/components/StatusChip.tsx`, `src/components/SeverityChip.tsx`, `src/components/GradeChip.tsx`, `src/components/TextChip.tsx`, `src/components/NotMeasured.tsx`
- Test: `tests/components/shared.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '@/components/Card';
import { StatTile } from '@/components/StatTile';
import { GradeChip } from '@/components/GradeChip';
import { SeverityChip } from '@/components/SeverityChip';
import { StatusChip } from '@/components/StatusChip';
import { TextChip } from '@/components/TextChip';
import { NotMeasured } from '@/components/NotMeasured';

describe('shared UI', () => {
  it('StatTile shows label, value and note', () => {
    render(<StatTile label="M01 Consent Coverage" value="88.0%" note="Contacts that legally need proof." />);
    expect(screen.getByText('M01 Consent Coverage')).toBeInTheDocument();
    expect(screen.getByText('88.0%')).toBeInTheDocument();
    expect(screen.getByText('Contacts that legally need proof.')).toBeInTheDocument();
  });
  it('Card renders a titled section', () => {
    render(<Card title="Alerts"><p>body</p></Card>);
    expect(screen.getByRole('heading', { name: 'Alerts' })).toBeInTheDocument();
  });
  it('chips carry the prototype tone classes', () => {
    render(<><StatusChip status="CONFLICTING" /><SeverityChip severity="high" /><GradeChip grade="B" /><GradeChip grade={null} /><TextChip tone="warn">Sample data</TextChip></>);
    expect(screen.getByText('CONFLICTING')).toHaveClass('bg-conflict-bg', 'text-conflict-fg');
    expect(screen.getByText('High')).toHaveClass('bg-bad-bg');
    expect(screen.getByText('B')).toHaveClass('bg-teal-bg');
    expect(screen.getByText('—')).toHaveClass('bg-line-soft');
    expect(screen.getByText('Sample data')).toHaveClass('bg-warn-bg');
  });
  it('NotMeasured shows the reason', () => {
    render(<NotMeasured reason="Client query logs not supplied" />);
    expect(screen.getByText('Not measured')).toBeInTheDocument();
    expect(screen.getByText('Client query logs not supplied')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/shared.test.tsx`
Expected: FAIL — cannot resolve `@/components/Card`.

- [ ] **Step 3: Write the three panel components, one file each**

`src/components/Card.tsx`:
```tsx
import type { ReactNode } from 'react';

export function Card({ title, aside, children, className = '' }: { title?: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col gap-3.5 rounded-card border border-line bg-surface p-5 ${className}`}>
      {title && (
        <div className="flex items-baseline justify-between">
          <h2 className="m-0 font-display text-xl font-semibold">{title}</h2>
          {aside && <span className="text-[12.5px] text-muted">{aside}</span>}
        </div>
      )}
      {children}
    </section>
  );
}
```

`src/components/StatTile.tsx`:
```tsx
import type { ReactNode } from 'react';

/** The white metric tile from the prototype's Overview and Opt-out tests screens. */
export function StatTile({ label, value, note, size = 'lg' }: { label: string; value: ReactNode; note?: ReactNode; size?: 'lg' | 'md' }) {
  return (
    <div className="flex flex-col gap-2 rounded-card border border-line bg-surface p-5">
      <span className="text-xs uppercase tracking-[0.6px] text-muted">{label}</span>
      <span className={`font-display font-semibold leading-none ${size === 'lg' ? 'text-[40px]' : 'text-[32px]'}`}>{value}</span>
      {note && <span className="text-[12.5px] leading-[1.45] text-muted">{note}</span>}
    </div>
  );
}
```

`src/components/PageHeading.tsx`:
```tsx
import type { ReactNode } from 'react';

export function PageHeading({ title, aside }: { title: string; aside?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="m-0 font-display text-[22px] font-semibold">{title}</h2>
      {aside && <span className="text-[12.5px] text-muted">{aside}</span>}
    </div>
  );
}
```

- [ ] **Step 4: Write the chip base and the four chips, one file each**

`src/lib/chip.ts`:
```ts
/** Shape shared by every chip; each chip component adds its own colours. */
export const CHIP_BASE = 'inline-block self-start rounded-md px-2 py-[3px] text-[11.5px] font-semibold';
```

`src/components/StatusChip.tsx`:
```tsx
import type { ConsentStatus } from '@/api/types';
import { CHIP_BASE } from '@/lib/chip';
import { statusTone } from '@/lib/tone';

export function StatusChip({ status }: { status: ConsentStatus }) {
  const t = statusTone(status);
  return <span className={`${CHIP_BASE} font-mono ${t.bg} ${t.fg}`}>{status}</span>;
}
```

`src/components/SeverityChip.tsx`:
```tsx
import type { Severity } from '@/api/types';
import { CHIP_BASE } from '@/lib/chip';
import { severityTone } from '@/lib/tone';

const LABEL: Record<Severity, string> = { high: 'High', medium: 'Medium', low: 'Low' };

export function SeverityChip({ severity }: { severity: Severity }) {
  const t = severityTone(severity);
  return <span className={`${CHIP_BASE} ${t.bg} ${t.fg}`}>{LABEL[severity]}</span>;
}
```

`src/components/GradeChip.tsx`:
```tsx
import type { Grade } from '@/api/types';
import { CHIP_BASE } from '@/lib/chip';
import { gradeTone } from '@/lib/tone';

export function GradeChip({ grade }: { grade: Grade | null }) {
  const t = gradeTone(grade);
  return <span className={`${CHIP_BASE} px-2.5 text-[13.5px] ${t.bg} ${t.fg}`}>{grade ?? '—'}</span>;
}
```

`src/components/TextChip.tsx`:
```tsx
import type { ReactNode } from 'react';
import { CHIP_BASE } from '@/lib/chip';

const TONE = { warn: 'bg-warn-bg text-warn-fg', ok: 'bg-ok-bg text-ok-fg', neutral: 'bg-line-soft text-ink-2', bad: 'bg-bad-bg text-bad-fg' };

export function TextChip({ tone, children }: { tone: keyof typeof TONE; children: ReactNode }) {
  return <span className={`${CHIP_BASE} ${TONE[tone]}`}>{children}</span>;
}
```

- [ ] **Step 5: Write `src/components/NotMeasured.tsx`**

```tsx
import { NOT_MEASURED } from '@/lib/format';

/** "Not measured" is a first-class value: never 0, never blank. */
export function NotMeasured({ reason }: { reason?: string | null }) {
  return (
    <span className="flex flex-col gap-1">
      <span className="text-muted">{NOT_MEASURED}</span>
      {reason && <span className="text-xs font-normal text-muted">{reason}</span>}
    </span>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/components/shared.test.tsx`
Expected: PASS (4 tests).

---

### Task B6: The shell — sidebar, header, watermark, disclosure

**Files:**
- Create: `src/components/Sidebar.tsx`, `src/components/Header.tsx`, `src/components/ProvisionalWatermark.tsx`, `src/components/Disclosure.tsx`, `src/components/PortalShell.tsx`, `src/app/providers.tsx`, `src/app/(portal)/layout.tsx`
- Test: `tests/components/shell.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import { PortalShell } from '@/components/PortalShell';
import { DISCLOSURE } from '@/api/types';

const shell = <PortalShell><p>screen body</p></PortalShell>;

describe('PortalShell', () => {
  it('shows the seven prototype screens in order and marks the active one', async () => {
    renderWithProviders(shell, { pathname: '/contacts' });
    const nav = await screen.findByRole('navigation', { name: 'Main' });
    const labels = within(nav).getAllByRole('link').map((a) => a.textContent);
    expect(labels).toEqual(['Overview', 'Contacts', 'Metrics', 'Opt-out tests', 'Lead Inspector', 'Fix list', 'Sources']);
    expect(within(nav).getByRole('link', { name: 'Contacts' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Overview' })).not.toHaveAttribute('aria-current');
  });

  it('shows client name, report period, sample chip, the body and the disclosure', async () => {
    renderWithProviders(shell);
    expect(await screen.findByText('Acme Solar')).toBeInTheDocument();
    expect(screen.getByText('Report period Sep 1 – Sep 30, 2026')).toBeInTheDocument();
    expect(screen.getByText('Sample data')).toBeInTheDocument();
    expect(screen.getByText('screen body')).toBeInTheDocument();
    expect(screen.getByText(DISCLOSURE)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download report' })).toBeInTheDocument();
  });

  it('states the engagement mode in the sidebar', async () => {
    renderWithProviders(shell, { session: { engagementMode: 'counsel_directed', role: 'legal' } });
    expect(await screen.findByText('Counsel-directed')).toBeInTheDocument();
  });

  it('adds Rulebook and the run selector for internal roles only', async () => {
    renderWithProviders(shell, { session: { role: 'owner' } });
    await screen.findByText('Acme Solar');
    expect(screen.queryByRole('link', { name: 'Rulebook' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Run')).not.toBeInTheDocument();
  });

  it('shows the provisional watermark when an internal run is selected', async () => {
    renderWithProviders(shell, { session: { role: 'engineer' } });
    const select = await screen.findByLabelText('Run');
    expect(screen.getByRole('link', { name: 'Rulebook' })).toBeInTheDocument();
    expect(screen.queryByText(/PROVISIONAL/)).not.toBeInTheDocument();
    await screen.findByRole('option', { name: /run-3/ });
    fireEvent.change(select, { target: { value: 'run-3' } });
    expect(await screen.findByText(/PROVISIONAL — not for client/)).toBeInTheDocument();
  });

  it('locks the operations role out in counsel-directed mode', async () => {
    renderWithProviders(shell, { session: { role: 'operations', engagementMode: 'counsel_directed' } });
    expect(await screen.findByText(/Operations access is turned off/)).toBeInTheDocument();
    expect(screen.queryByText('screen body')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/shell.test.tsx`
Expected: FAIL — cannot resolve `@/components/PortalShell`.

- [ ] **Step 3: Write `src/components/Sidebar.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isInternalRole, useSession } from '@/state/SessionContext';

const NAV = [
  { href: '/', label: 'Overview' },
  { href: '/contacts', label: 'Contacts' },
  { href: '/metrics', label: 'Metrics' },
  { href: '/opt-out-tests', label: 'Opt-out tests' },
  { href: '/lead-inspector', label: 'Lead Inspector' },
  { href: '/fix-list', label: 'Fix list' },
  { href: '/sources', label: 'Sources' },
];

export function Sidebar() {
  const session = useSession();
  const pathname = usePathname();
  const items = isInternalRole(session.role) ? [...NAV, { href: '/rulebook', label: 'Rulebook' }] : NAV;
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <nav aria-label="Main" className="flex w-[232px] shrink-0 flex-col gap-1 border-r border-line bg-sidebar px-4 py-6">
      <div className="flex items-center gap-2.5 px-2 pb-5">
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-ink-deep font-display text-[17px] font-semibold text-canvas">C</div>
        <div className="flex flex-col">
          <span className="font-display text-[19px] font-semibold tracking-[-0.2px]">Comply iV</span>
          <span className="text-[11.5px] text-muted">TCPA evidence portal</span>
        </div>
      </div>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(item.href) ? 'page' : undefined}
          className={`flex h-11 items-center rounded-lg px-3 text-sm font-medium no-underline ${
            isActive(item.href) ? 'bg-ink-deep text-white hover:text-white' : 'text-ink-3 hover:bg-line-soft hover:text-ink-3'
          }`}
        >
          {item.label}
        </Link>
      ))}
      <div className="grow" />
      <div className="flex flex-col gap-1.5 rounded-[10px] border border-line p-3">
        <span className="text-[11.5px] uppercase tracking-[0.6px] text-muted">Engagement</span>
        <span className="text-[13.5px] font-medium">{session.engagementMode === 'counsel_directed' ? 'Counsel-directed' : 'Direct'}</span>
        <span className="text-xs leading-[1.45] text-muted">Counsel-directed mode routes findings and alerts to your lawyers only.</span>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Write `src/components/Header.tsx`**

```tsx
'use client';

import { TextChip } from '@/components/TextChip';
import { formatDate } from '@/lib/format';
import { useRunContext } from '@/state/RunContext';
import { isInternalRole, useSession } from '@/state/SessionContext';

/** "Sep 1 – Sep 30, 2026" */
function formatPeriod(from: string, to: string): string {
  return `${formatDate(from).replace(/, \d{4}$/, '')} – ${formatDate(to)}`;
}

const NOT_YET = 'Available when the report service is connected';

export function Header() {
  const session = useSession();
  const { runs, selectedRun, select } = useRunContext();

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-line bg-canvas px-8">
      <div className="flex items-baseline gap-3.5">
        <span className="font-display text-2xl font-semibold">{session.clientName}</span>
        <span className="text-[13px] text-muted">Report period {formatPeriod(session.reportPeriod.from, session.reportPeriod.to)}</span>
        {session.sampleData && <TextChip tone="warn">Sample data</TextChip>}
      </div>
      <div className="flex items-center gap-2.5">
        {isInternalRole(session.role) && (
          <label className="text-[13px] text-muted">
            Run{' '}
            <select aria-label="Run" className="h-10 rounded-lg border border-control bg-surface px-2 text-ink" value={selectedRun?.runId ?? ''} onChange={(e) => select(e.target.value)}>
              {runs.map((r) => <option key={r.runId} value={r.runId}>{r.runId} · {r.rulebookStatus}</option>)}
            </select>
          </label>
        )}
        <button type="button" disabled title={NOT_YET} className="h-10 rounded-lg border border-control bg-surface px-4 text-[13.5px] font-medium text-ink disabled:opacity-60">Evidence export</button>
        <button type="button" disabled title={NOT_YET} className="h-10 rounded-lg border-0 bg-accent px-4 text-[13.5px] font-medium text-white disabled:opacity-60">Download report</button>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Write `src/components/ProvisionalWatermark.tsx` and `src/components/Disclosure.tsx`**

`ProvisionalWatermark.tsx`:
```tsx
'use client';

import { useRunContext } from '@/state/RunContext';

/** Internal runs (non-approved rulebook) are never shown to client roles and always carry this banner. */
export function ProvisionalWatermark() {
  const { selectedRun } = useRunContext();
  if (!selectedRun || selectedRun.outputVisibility !== 'internal') return null;
  return (
    <div role="status" className="mb-5 rounded-[10px] border border-warn-bar bg-warn-bg px-4 py-2.5 text-[13px] text-warn-fg">
      PROVISIONAL — not for client. Rulebook {selectedRun.rulebookVersion} ({selectedRun.rulebookStatus}, {selectedRun.variant} variant).
    </div>
  );
}
```

`Disclosure.tsx`:
```tsx
import { DISCLOSURE } from '@/api/types';

export function Disclosure() {
  return <p className="mt-8 text-xs text-muted">{DISCLOSURE}</p>;
}
```

- [ ] **Step 6: Write `src/components/PortalShell.tsx`**

```tsx
'use client';

import type { ReactNode } from 'react';
import { isLockedOut, useSession } from '@/state/SessionContext';
import { Disclosure } from './Disclosure';
import { Header } from './Header';
import { ProvisionalWatermark } from './ProvisionalWatermark';
import { Sidebar } from './Sidebar';

export function PortalShell({ children }: { children: ReactNode }) {
  const session = useSession();
  return (
    <div className="flex h-screen overflow-hidden bg-canvas text-ink">
      <Sidebar />
      <div className="flex min-w-0 grow flex-col">
        <Header />
        <main className="grow overflow-auto px-8 pb-8 pt-7">
          <ProvisionalWatermark />
          {isLockedOut(session)
            ? <p className="text-muted">Operations access is turned off in counsel-directed mode. Findings and alerts go to counsel.</p>
            : children}
          <Disclosure />
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Write `src/app/providers.tsx` and `src/app/(portal)/layout.tsx`**

`src/app/providers.tsx`:
```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { RunProvider } from '@/state/RunContext';
import { SessionProvider } from '@/state/SessionContext';

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } }));
  return (
    <QueryClientProvider client={client}>
      <SessionProvider>
        <RunProvider>{children}</RunProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
```

`src/app/(portal)/layout.tsx`:
```tsx
import type { ReactNode } from 'react';
import { PortalShell } from '@/components/PortalShell';
import { Providers } from '../providers';

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <PortalShell>{children}</PortalShell>
    </Providers>
  );
}
```

Then delete the sample `src/app/page.tsx` and `src/app/page.module.css` that create-next-app generated, and create a temporary `src/app/(portal)/page.tsx`:
```tsx
export default function Page() {
  return <p>Overview comes in Part C.</p>;
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npx vitest run tests/components/shell.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 9: Verify by eye and by build**

Run: `npm run test && npm run typecheck && npm run build`
Expected: all tests pass (33 so far: wording 4, format and tone 5, mock 10, state 4, shared UI 4, shell 6); no type errors; build succeeds.
Then run `npm run dev`, open the printed URL and compare with the prototype: sidebar 232 px with the "C" mark, seven nav items, the Engagement box at the bottom, header with "Acme Solar", "Report period Sep 1 – Sep 30, 2026", the "Sample data" chip and the two buttons. Stop the server.

---

## Part B self-review

- **Prototype coverage:** fixtures reproduce the prototype's data for all seven screens (score 81.3 capped at C, 812 of 1,132 checkpoints, 10 contacts, 33 metrics, the 4 × 4 opt-out matrix, 7 vendors, 6 fixes, 10 sources). Sidebar and header match the prototype's structure, order, sizes and copy.
- **Deliberate differences from the prototype:** M08 is 6.0 h (v1.1 nearest-rank); sources carry tiers; M16 says "possible (location uncertain)"; contact 5 carries two bases (`robocall_marketing` + `dnc_listed`) to exercise per-basis display; the header's two buttons are disabled until module 6; internal roles get a run selector and a Rulebook link the prototype does not have.
- **Spec coverage:** provisional runs hidden from client roles (B4) and watermarked (B6); counsel-directed lock-out for operations (B6); disclosure on every screen (B6); "Not measured" component (B5); fixtures pass the banned-word scan (B1).
- **Type consistency:** `mockApi` / `resetMock` names match between `src/mock/api.ts`, `tests/msw.ts`, `vitest.setup.ts` and the route handler. `api.upload(id, uploadType, file)` matches `useUpload`. `renderWithProviders` options are `session`, `pathname`, `params`. `isLockedOut` is exported from `SessionContext` and used by `PortalShell`.
- **No placeholders:** the temporary Overview page in B6 Step 7 is replaced in Part C, Task C1.
