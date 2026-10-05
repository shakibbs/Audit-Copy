import type { AccessEntry, Readiness, Settings, User } from '@/api/types';

export const readiness: Readiness = {
  runOn: '2026-05-27', sampleNumbers: 100, canStart: true, recommendedPlan: 'Growth', numbersPerMonth: 35000,
  checks: [
    { name: 'Dialer connection', how: 'Connected and pulled 30 days of calls', state: 'partial', detail: 'Dial mode is missing on 18% of calls', fix: 'Turn on the dial-mode field in the Convoso reporting export.' },
    { name: 'SMS connection', how: 'Connected and pulled 30 days of messages and replies', state: 'ready', detail: 'Outbound and inbound present', fix: null },
    { name: 'CRM connection', how: 'Read the 100 sample numbers', state: 'ready', detail: 'Consent, opt-out and address fields found', fix: null },
    { name: 'Consent proof', how: 'Retrieved a proof for each sample number', state: 'partial', detail: '81 of 100 found; 23 not retained long-term', fix: 'Turn on certificate retention with your certificate vendor.' },
    { name: 'Certificate retention', how: 'Checked retention status at the provider', state: 'partial', detail: 'Some certificates are unretained', fix: 'Retain certificates for five years.' },
    { name: 'Consent pages', how: 'Captured each known consent page', state: 'ready', detail: 'All 5 pages captured', fix: null },
    { name: 'Lead records', how: 'Matched sample numbers to lead records', state: 'partial', detail: 'Vendor missing on 16 leads', fix: 'Ask lead vendors to pass a sub-ID with every lead.' },
    { name: 'Internal do-not-contact list', how: 'Uploaded and parsed', state: 'ready', detail: 'Present with entry dates', fix: null },
    { name: 'History depth', how: 'Earliest record in each source', state: 'partial', detail: 'Dialer history reaches two years', fix: 'Request the archived call history from Convoso.' },
    { name: 'Recordings', how: 'Opened 5 sample recordings', state: 'ready', detail: 'Accessible through the dialer', fix: null },
    { name: 'Documents', how: 'Checked uploads', state: 'missing', detail: 'DNC scrub records and reassigned-number query logs not supplied', fix: 'Upload both in Source Registry.' },
  ],
  preview: [{ status: 'VERIFIED', count: 61 }, { status: 'WEAK', count: 12 }, { status: 'CONFLICTING', count: 16 }, { status: 'NO_PROOF', count: 11 }],
  notMeasured: ['M11 Pre-Contact Reassigned Checks', 'M13 DNC Scrub Record Check'],
  setup: [
    { id: 'outcomes', label: 'Outcome mapping', detail: 'Which dialer outcomes mean “stop calling”', done: true, count: '6 outcomes mapped' },
    { id: 'caller-ids', label: 'Caller IDs', detail: 'Every number you show when calling', done: true, count: '38 caller IDs' },
    { id: 'pages', label: 'Consent pages', detail: 'Every address where you or your affiliates collect consent', done: true, count: '5 pages' },
    { id: 'vendors', label: 'Lead vendors and sub-IDs', detail: 'Names and sub-IDs of every vendor and affiliate', done: true, count: '7 vendors' },
    { id: 'campaigns', label: 'Campaign categories', detail: 'Mark each campaign as marketing or informational', done: false, count: '3 of 14 campaigns unconfirmed' },
    { id: 'states', label: 'States and brands', detail: 'States you call and the brand names you use', done: true, count: '5 states · 2 brands' },
    { id: 'optout-methods', label: 'Designated opt-out methods', detail: 'Whether you designate an exclusive opt-out method, and where it is disclosed', done: false, count: 'Not yet decided' },
  ],
};

export const settings: Settings = {
  company: { name: 'SunPath Residential Solar', vertical: 'Solar', states: ['California', 'Arizona', 'Texas', 'Florida', 'Nevada'], brands: ['SunPath', 'SunPath Battery'], forum: 'N.D. California · 9th Circuit', engaged: '2026-06-01' },
  contacts: [
    { role: 'Technical contact', name: 'Priya Nair', email: 'priya.nair@sunpath.example' },
    { role: 'Legal contact', name: 'M. Okafor', email: 'm.okafor@sunpath.example' },
  ],
  notifications: [
    { kind: 'after-optout', label: 'Contacts after opt-out', email: true },
    { kind: 'page-change', label: 'Consent page changed', email: true },
    { kind: 'cert-expiry', label: 'Certificates nearing expiry', email: true },
    { kind: 'test-deadline', label: 'Test opt-out past its deadline', email: true },
    { kind: 'source-stale', label: 'Source stale', email: true },
    { kind: 'vendor-drop', label: 'Vendor score drop', email: false },
    { kind: 'rule-change', label: 'Rule change that affects your settings', email: true },
  ],
  agreements: [
    { name: 'Master services agreement', status: 'signed', date: '2026-05-29', detail: '12-month term' },
    { name: 'Data processing agreement', status: 'signed', date: '2026-05-20', detail: 'Covers phone numbers, message text and call recordings' },
    { name: 'Opt-out test authorisation', status: 'signed', date: '2026-06-01', detail: 'Text, call, web form and email · both brands · to 31 May 2027' },
    { name: 'Notice about alerts', status: 'signed', date: '2026-06-01', detail: 'Acknowledged that alerts put the company on notice' },
  ],
  usage: {
    plan: 'Growth', limit: 50000, used: 36420, monthlyPrice: '$6,500', nextPlan: 'Scale', overLimitMonths: 0,
    rule: 'If numbers contacted exceed the plan limit two months in a row, the plan moves up from the next month. There are no overage charges.',
    history: [{ label: 'Jun', used: 31200 }, { label: 'Jul', used: 33850 }, { label: 'Aug', used: 35100 }, { label: 'Sep', used: 36420 }],
  },
};

export const users: User[] = [
  { id: 'u-1', name: 'Dana Reyes', email: 'dana.reyes@sunpath.example', role: 'owner', status: 'active', lastSeen: '2026-09-30T08:41:00Z', scope: null },
  { id: 'u-2', name: 'M. Okafor', email: 'm.okafor@sunpath.example', role: 'legal', status: 'active', lastSeen: '2026-09-29T17:05:00Z', scope: null },
  { id: 'u-3', name: 'Priya Nair', email: 'priya.nair@sunpath.example', role: 'operations', status: 'active', lastSeen: '2026-09-30T07:58:00Z', scope: null },
  { id: 'u-4', name: 'Marcus Lee', email: 'marcus.lee@sunpath.example', role: 'operations', status: 'active', lastSeen: '2026-09-29T13:22:00Z', scope: null },
  { id: 'u-5', name: 'J. Alvarez', email: 'jalvarez@outsidecounsel.example', role: 'counsel_guest', status: 'invited', lastSeen: null, scope: 'Read-only · Jul–Sep 2026' },
];

export const accessLog: AccessEntry[] = [
  { at: '2026-09-30T08:41:00Z', actor: 'Dana Reyes', role: 'owner', action: 'Viewed', object: 'Overview' },
  { at: '2026-09-30T07:58:00Z', actor: 'Priya Nair', role: 'operations', action: 'Updated', object: 'Action 1 · status to In progress' },
  { at: '2026-09-29T17:05:00Z', actor: 'M. Okafor', role: 'legal', action: 'Exported', object: 'Evidence file · (480) •••-0923' },
  { at: '2026-09-29T17:01:00Z', actor: 'M. Okafor', role: 'legal', action: 'Viewed', object: 'Evidence file · (480) •••-0923' },
  { at: '2026-09-29T13:22:00Z', actor: 'Marcus Lee', role: 'operations', action: 'Added a note', object: 'Action 4 · finding contested' },
  { at: '2026-09-28T16:20:00Z', actor: 'Priya Nair', role: 'operations', action: 'Uploaded', object: 'internal-dnc-2026-09-28.csv' },
  { at: '2026-09-22T10:14:00Z', actor: 'M. Okafor', role: 'legal', action: 'Set legal hold', object: '(480) •••-0923' },
];
