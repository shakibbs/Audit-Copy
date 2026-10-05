import type { Action, Alert } from '@/api/types';

type A = [Action['severity'], string, string, string, Action['owner'], string, string, string | null, string | null, Action['status']];

// severity, title, why, domain, who does it, impact, fix step (from the counsel-reviewed library), assignee, due, status
const ROWS: A[] = [
  ['High', 'Route web and email opt-outs to dialer and SMS suppression', 'Three test opt-outs by web form and email never stopped contact.', 'REV', 'you', '+6.1 on REV', 'Map the web-form and email opt-out destinations to the suppression lists in the dialer and the messaging platform.', 'Priya Nair', '2026-10-07', 'in_progress'],
  ['High', 'Stop predictive dialing where the only proof is a customer relationship', '540 robo-contacts lacked the proof type their category requires.', 'DLR', 'you', '+4.8 on DLR', 'Move leads whose only proof is a customer relationship to a manually dialed campaign.', 'Priya Nair', '2026-10-10', 'open'],
  ['High', 'Restore the missing checklist item on the quote form', 'The consent block changed on 28 Sep.', 'WEB', 'you', '+3.2 on WEB', 'Compare the current wording with the approved version in the consent wording catalogue and restore the missing item.', null, '2026-10-03', 'open'],
  ['High', 'Set calling windows by recipient state and time zone', '310 contacts fell outside state hours.', 'CTF', 'you', '+2.9 on CTF', 'Configure dialer calling windows from the recipient address, using the stricter window where address and number disagree.', 'Marcus Lee', '2026-10-14', 'open'],
  ['High', 'Supply your reassigned-number query logs', 'Pre-contact checks cannot be measured without them.', 'RND', 'you', 'Unlocks M11', 'Export the query log from your Somos account and upload it in Source Registry.', null, null, 'open'],
  ['Medium', 'Pause the two acquired lists that failed the consent-chain sample', 'Sampled numbers showed no consent chain.', 'MNA', 'you', '+5.0 on MNA', 'Suspend contact to the two lists until a consent chain is supplied for the sampled numbers.', 'Dana Reyes', '2026-10-17', 'open'],
  ['Medium', 'Lower the dialing ratio on campaign SP-Q3-Roof', 'Abandoned calls at 3.7% against a 3% limit.', 'DLR', 'you', '+1.6 on DLR', 'Reduce the predictive dialing ratio until the 30-day abandoned rate is at or under the limit.', 'Marcus Lee', '2026-10-09', 'open'],
  ['Medium', 'Collect signed terms from four vendors', 'Required clauses missing or unsigned.', 'VND', 'you', '+8.3 on VND', 'Request signed terms containing the required clauses and upload each contract.', null, '2026-10-24', 'open'],
  ['Medium', 'Reconnect the Convoso dialer connector', 'Not synced for 52 hours; dependent metrics are stale.', 'DLR', 'we', 'Restores freshness', 'CiV support re-authorises the connector with your technical contact.', 'CiV support', '2026-10-01', 'in_progress'],
  ['Low', 'Route four caller IDs to a live line or voicemail', 'They did not answer a CiV callback.', 'IDD', 'you', '+1.0 on IDD', 'Point each listed caller ID at a staffed line or a voicemail box that accepts do-not-call requests.', null, null, 'open'],
];

const TODAY = '2026-09-30';

export const actions: Action[] = ROWS.map(([severity, title, why, domain, owner, impact, fixStep, assignee, due, status], i) => ({
  id: `a-${i + 1}`, rank: i + 1, severity, title, why, domain, owner, impact, fixStep, assignee, due, status,
  overdue: due !== null && due < TODAY && status !== 'resolved',
  dispute: i === 3 ? { note: 'About 90 of these were appointment confirmations, not solicitations. Campaign category map to be corrected.', by: 'Marcus Lee', at: '2026-09-29' } : null,
}));

export const alerts: Alert[] = [
  { id: 'al-1', severity: 'High', kind: 'Contacts after opt-out', title: '3 new contacts after opt-out', detail: 'Three texts were sent to two numbers after a STOP reply was received.', at: '2026-09-30T04:12:00Z', domain: 'REV', reviewed: false, routedTo: 'legal' },
  { id: 'al-2', severity: 'High', kind: 'Consent page changed', title: 'Consent block changed on the quote form', detail: 'The sentence “consent is not a condition of purchase” is no longer on go.sunpathsolar.com/quote.', at: '2026-09-28T09:20:00Z', domain: 'WEB', reviewed: false, routedTo: 'legal' },
  { id: 'al-3', severity: 'High', kind: 'Test opt-out past deadline', title: 'A test opt-out passed its 10-business-day deadline', detail: 'Web form opt-out of 12 Sep is still not suppressed in the dialer.', at: '2026-09-27T04:10:00Z', domain: 'REV', reviewed: true, routedTo: 'legal' },
  { id: 'al-4', severity: 'Medium', kind: 'Certificate expiry', title: '42 certificates become unavailable within 30 days', detail: 'They are not retained long-term at the certificate provider.', at: '2026-09-30T04:12:00Z', domain: 'CON', reviewed: false, routedTo: 'all' },
  { id: 'al-5', severity: 'Medium', kind: 'Source stale', title: 'Convoso dialer has not synced for 52 hours', detail: 'Dialer-dependent metrics show the last good values and are marked stale.', at: '2026-09-30T04:10:00Z', domain: 'DLR', reviewed: false, routedTo: 'all' },
  { id: 'al-6', severity: 'Medium', kind: 'Vendor score drop', title: 'Vendor E, sub-ID 7 fell 11.2 points', detail: 'High-signal leads rose from 3% to 6% of its supply.', at: '2026-09-29T04:10:00Z', domain: 'AFF', reviewed: true, routedTo: 'all' },
  { id: 'al-7', severity: 'Low', kind: 'Rule change', title: 'A rule that affects your opt-out settings was adopted', detail: 'See Regulatory Changes for the settings and metrics it touches.', at: '2026-10-01T12:00:00Z', domain: 'REV', reviewed: false, routedTo: 'all' },
];
