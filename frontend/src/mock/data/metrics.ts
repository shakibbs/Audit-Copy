import type { Metric } from '@/api/types';
import { domains } from './domains';

type Row = [string, string, string, number | null, string, string, string, Metric['source'], string, Metric['better'], string, string?];

// code, name, group, value, display, note, definition, source, unit, better direction, evidence, not-measured reason
const ROWS: Row[] = [
  ['M01', 'Consent Coverage', 'Permission', 88.0, '88.0%', 'Legal-basis contacts covered; 84.0% including CiV-policy contacts', 'Contacts whose legal basis requires proof, with status VERIFIED or WEAK, over all such contacts.', 'CiV', '%', 'higher', '6,160 of 7,000 legal-basis contacts; consent engine run 30 Sep'],
  ['M02', 'Consent Status Mix', 'Permission', null, '76 / 8 / 11 / 5', 'Verified / weak / conflicting / no proof, % of contacts', 'Contacts by consent status, split by legal basis and primary reason code.', 'CiV', '', 'none', '10,000 contacts evaluated'],
  ['M03', 'Certificate Validity', 'Permission', 92.5, '92.5%', '800 certificate–number pairs supplied', 'Pairs whose certificate opens at the provider or from CiV’s stored copy and agrees with every other source.', 'CiV', '%', 'higher', '740 of 800 pairs retrieved from TrustedForm'],
  ['M04', 'Form Wording Pass Rate', 'Permission', 77.5, '77.5%', '40 page versions captured', 'Consent page versions passing every required checklist item; optional misses are warnings.', 'CiV', '%', 'higher', '31 of 40 captured page versions'],
  ['M05', 'Form Change Alerts', 'Permission', 2, '2', '1 change in a consent block', 'Consent pages whose normalised hash changed since the last capture.', 'CiV', '', 'lower', 'Daily captures of 40 pages'],
  ['M06', 'Lead Traceability', 'Permission', 84.0, '84.0%', '5,000 web leads', 'Web leads traced to a vendor or your own form, a capture page, a time and a certificate.', 'CiV', '%', 'higher', '4,200 of 5,000 leads from LeadConduit'],
  ['M07', 'Vendor Terms on File', 'Permission', 66.7, '66.7%', '8 of 12 active vendors', 'Active vendors with an unexpired contract containing every required clause.', 'AI', '%', 'higher', '12 uploaded contracts read'],
  ['M08', 'Opt-out Propagation Time', 'Stopping', 6.0, '6.0 h', 'Median of 14 tests; 90th percentile NEVER', 'Hours from a CiV test opt-out until every contacting system suppresses the number.', 'CiV', 'h', 'lower', '14 live tests from CiV test lines'],
  ['M09', 'Opt-outs Unprocessed at Deadline', 'Stopping', null, '2 · 1', 'M09a not suppressed · M09b contacted after', 'Test opt-outs not processed within 10 business days, recipient time zone.', 'CiV', '', 'lower', '14 live tests from CiV test lines'],
  ['M10', 'Contacts After Opt-out', 'Stopping', 14, '14', '9 numbers affected', 'Contacts at or after an in-scope opt-out plus the grace period.', 'CiV', '', 'lower', '400 opted-out numbers in SMS and CRM records'],
  ['M11', 'Pre-Contact Reassigned Checks', 'Who you contact', null, 'Not measured', 'Your query logs are not supplied', 'Robocalls made long after consent that were preceded by your own check after the latest monthly update.', 'Client', '%', 'higher', '—', 'Reassigned-number query logs not supplied'],
  ['M12', 'Internal List Contacts', 'Who you contact', 22, '22', '11 numbers · supplied by you', 'Contacts to numbers after they entered your internal do-not-contact list.', 'Client', '', 'lower', 'Internal list uploaded 28 Sep'],
  ['M13', 'DNC Scrub Record Check', 'Who you contact', null, 'Not measured', 'Scrub records not supplied', 'Scrub age at contact, and contacts to flagged numbers in separate buckets.', 'Client', '%', 'lower', '—', 'DNC scrub records not supplied'],
  ['M14', 'Litigator List Contacts', 'Who you contact', 4, '4', '2 numbers · informational', 'Contacts to numbers on your own litigator list. Never scored.', 'Client', '', 'none', 'Your uploaded list'],
  ['M15', 'Cross-border Contacts', 'Who you contact', 15, '15', 'Canada, United Kingdom, Jamaica', 'Contacts to numbers outside the United States.', 'CiV', '', 'none', 'Dialer and SMS records'],
  ['M16', 'Out-of-Hours Contacts', 'How you contact', 490, '180 · 310', 'Federal · state; 120 possible (location uncertain)', 'Contacts outside permitted hours in the recipient’s own time zone.', 'CiV', '', 'lower', '50,000 contacts checked against address ZIP and area code'],
  ['M17', 'Over-Limit Contacts', 'How you contact', 2, '2', 'Per person, per subject', 'Contacts beyond a state frequency limit.', 'CiV', '', 'lower', 'Dialer and SMS records'],
  ['M18', 'Restricted-Holiday Contacts', 'How you contact', 6, '6', 'Recipient local date', 'Contacts on dates a state restricts.', 'CiV', '', 'lower', 'Dialer and SMS records'],
  ['M19', 'Robo-contact Required-Proof Count', 'How you contact', 540, '540', '500 marketing · 25 informational · 15 unknown', 'Robocalls and robotexts lacking the proof type their category requires.', 'CiV', '', 'lower', '12,000 robo-contacts evaluated'],
  ['M20', 'Disclosure Check', 'How you contact', 85.0, '85.0%', '100 calls and 20 templates reviewed', 'Reviewed calls and templates carrying every required disclosure.', 'AI', '%', 'higher', '102 of 120 reviewed items'],
  ['M21', 'Caller ID Quality', 'How you contact', 92.0, '92.0%', 'Attestation 71% A · 26% B · 3% not exposed', 'Calls with a valid caller ID that answers a CiV callback.', 'CiV', '%', 'higher', '27,600 of 30,000 calls; one callback per caller ID'],
  ['M31', 'Abandoned-Call Rate', 'How you contact', 3.7, '3.7%', '1 campaign above the 3% limit', 'Answered marketing calls not connected to a live agent within two seconds.', 'CiV', '%', 'lower', '740 of 20,000 answered calls on SP-Q3-Roof'],
  ['M22a', 'Proof Completeness', 'Records and controls', 56.0, '56.0%', 'Partial: 7 of 8 elements measured', 'Numbers where every applicable proof element is present.', 'CiV', '%', 'higher', '560 of 1,000 numbers'],
  ['M22b', 'Conduct Pass Rate', 'Records and controls', 93.0, '93.0%', '1,000 numbers contacted', 'Numbers with no opt-out, internal-list, hours, frequency or holiday issue.', 'CiV', '%', 'higher', '930 of 1,000 numbers'],
  ['M23', 'Record Age Coverage', 'Records and controls', 70.0, '70.0%', 'Dialer history reaches two years', 'Numbers whose records cover the lawsuit window and the retention rule.', 'CiV', '%', 'higher', '7,000 of 10,000 numbers'],
  ['M24', 'Complaint Resolution', 'Records and controls', 85.0, '85.0%', 'Median 6 days to resolve', 'Complaints resolved against your target.', 'Client', '%', 'higher', '34 of 40 complaints in your log'],
  ['M25a', 'Training Currency', 'Records and controls', 90.0, '90.0%', '45 of 50 agents', 'Contacting agents with a training record inside 365 days.', 'AI', '%', 'higher', 'Training log uploaded 20 Sep'],
  ['M25b', 'Acquired List Proof', 'Records and controls', 33.3, '33.3%', '1 of 3 lists passed', 'Acquired lists whose sampled numbers show a consent chain.', 'CiV', '%', 'higher', '100 numbers sampled per list'],
  ['M26', 'Few-Signal Lead Rate', 'Lead provenance', 86.0, '86.0%', '550 some-signal · 150 high-signal leads', 'Leads showing few risk signals.', 'CiV', '%', 'higher', '5,000 leads inspected'],
  ['M27', 'Consent Page Match Rate', 'Lead provenance', 95.8, '95.8%', '1,200 comparable leads', 'Certificate snapshots matching CiV’s own capture.', 'CiV', '%', 'higher', '1,150 of 1,200 comparable leads'],
  ['M28', 'Consent Completeness Rate', 'Lead provenance', 78.0, '78.0%', '5,000 leads inspected', 'Leads passing every required checklist item.', 'CiV', '%', 'higher', '3,900 of 5,000 leads'],
  ['M29', 'Vendor Grade Distribution', 'Lead provenance', null, '1 A · 2 B · 1 C', '1 D · 1 F · 1 insufficient data', 'Vendors at each grade over 90 days.', 'CiV', '', 'none', '7 vendors scored'],
  ['M30', 'Disputable Lead Value', 'Lead provenance', 212, '212 leads', '3 without price, left out of the total', 'Dispute candidates inside each vendor’s dispute window.', 'CiV', '', 'none', 'Lead prices from LeadConduit'],
];

export const METRIC_GROUPS = ['Permission', 'Stopping', 'Who you contact', 'How you contact', 'Records and controls', 'Lead provenance'];

/** Four monthly points ending at the current value; earlier months are a little worse. */
function history(value: number | null, better: Metric['better'], seed: number): (number | null)[] {
  if (value === null) return [null, null, null, null];
  const step = Math.max(Math.abs(value) * 0.04, 0.4) * (1 + (seed % 3) * 0.25);
  const dir = better === 'lower' ? 1 : -1;
  return [3, 2, 1, 0].map((k) => Math.round((value + dir * step * k) * 10) / 10);
}

export const metrics: Metric[] = ROWS.map(([code, name, group, value, display, note, definition, source, unit, better, evidence, notMeasured], i) => ({
  code, name, group, source, value, display, note, definition, unit, better, evidence,
  notMeasured: notMeasured ?? null,
  domains: domains.filter((d) => d.metrics.includes(code)).map((d) => d.code),
  history: history(value, better, i),
}));
