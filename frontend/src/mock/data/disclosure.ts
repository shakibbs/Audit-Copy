import type { ReportRun, ReportType, Source, Upload } from '@/api/types';

type S = [string, Source['tier'], string, string, Source['status'], string[], boolean, boolean, string | null];

// name, tier, access, last sync, status, domains fed, revocable, accepts upload, what it blocks when missing
const ROWS: S[] = [
  ['TrustedForm certificates', 2, 'Your account · API', '2 h ago', 'current', ['CON', 'WEB', 'LPV'], true, false, null],
  ['Convoso dialer', 3, 'Least-privilege user · every call logged', '52 h ago', 'stale', ['DLR', 'PRV', 'CTF', 'IDD', 'SHK'], true, false, 'Dialer metrics show last good values'],
  ['Twilio messaging', 3, 'Read-only API', '1 h ago', 'current', ['SMS', 'REV', 'CTF'], true, false, null],
  ['Salesforce CRM', 3, 'Read-only API', '3 h ago', 'current', ['CON', 'REV', 'CTF'], true, false, null],
  ['LeadConduit', 3, 'Read-only API', '1 h ago', 'current', ['LPV', 'AFF'], true, false, null],
  ['Somos reassigned numbers', 1, 'CiV caller-agent account', '6 h ago', 'current', ['RND'], false, false, null],
  ['CiV consent page captures', 1, 'Headless capture service', '4 h ago', 'current', ['WEB', 'AFF'], false, false, null],
  ['CiV test lines', 1, 'CiV-owned carrier mobile lines', '27 Sep', 'current', ['REV', 'IDD'], false, false, null],
  ['Internal do-not-contact list', 4, 'Upload', '28 Sep', 'current', ['IDN'], false, true, null],
  ['Policies, training, contracts', 4, 'Upload', '20 Sep', 'current', ['GOV', 'VND'], false, true, null],
  ['Complaint log', 4, 'Upload', '25 Sep', 'current', ['INC'], false, true, null],
  ['DNC scrub records', 4, 'Upload', '—', 'not_supplied', ['NDN', 'SDN'], false, true, 'Blocks M13'],
  ['Reassigned-number query logs', 4, 'Export from your Somos account', '—', 'not_supplied', ['RND'], false, true, 'Blocks M11'],
];

export const sources: Source[] = ROWS.map(([name, tier, access, lastSync, status, feeds, revocable, acceptsUpload, blocks], i) => ({
  id: `src-${i + 1}`, name, tier, access, lastSync, status, feeds, revocable, acceptsUpload, blocks,
}));

export const uploads: Upload[] = [
  { artifactId: 'art-9041', source: 'Internal do-not-contact list', fileName: 'internal-dnc-2026-09-28.csv', sha256: `6b86${'0'.repeat(56)}4b27`, receivedAt: '2026-09-28T16:20:00Z', rowsRead: 4120, rowsRejected: 3 },
  { artifactId: 'art-8830', source: 'Complaint log', fileName: 'complaints-q3.csv', sha256: `d473${'0'.repeat(56)}5a35`, receivedAt: '2026-09-25T11:02:00Z', rowsRead: 40, rowsRejected: 0 },
  { artifactId: 'art-8514', source: 'Policies, training, contracts', fileName: 'training-log-sep.csv', sha256: `4b22${'0'.repeat(56)}77a4`, receivedAt: '2026-09-20T09:41:00Z', rowsRead: 50, rowsRejected: 0 },
];

export const reportTypes: ReportType[] = [
  { id: 'period', name: 'Period audit report', description: 'Scorecard, domains, metrics and action queue for the selected month.', format: 'PDF', addOn: false },
  { id: 'evidence', name: 'Evidence file export', description: 'Per phone number: every contact, its consent decision, proof elements, tiers and hashes.', format: 'PDF + JSON', addOn: false },
  { id: 'certification', name: 'Certification pack', description: 'Hash manifest, capture description and custodian certification template.', format: 'ZIP', addOn: false },
  { id: 'litigation', name: 'Litigation evidence package', description: 'Court-ready export for up to 25 named numbers with a chain-of-custody report.', format: 'Add-on', addOn: true },
  { id: 'metrics', name: 'Metric export', description: 'All 33 metrics with numerators, denominators and data completeness.', format: 'CSV', addOn: false },
  { id: 'rulebook', name: 'Rulebook snapshot', description: 'Every rule value in force for the period, with effective dates.', format: 'PDF', addOn: false },
];

export const reportRuns: ReportRun[] = [
  { id: 'r-31', name: 'Period audit report', period: 'Aug 2026', requestedBy: 'Dana Reyes', at: '2026-09-01T08:00:00Z', status: 'ready' },
  { id: 'r-30', name: 'Evidence file export · 4 numbers', period: 'Aug 2026', requestedBy: 'M. Okafor', at: '2026-08-22T14:31:00Z', status: 'ready' },
  { id: 'r-29', name: 'Period audit report', period: 'Jul 2026', requestedBy: 'Dana Reyes', at: '2026-08-01T08:00:00Z', status: 'ready' },
];
