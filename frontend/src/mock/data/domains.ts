import { FAMILIES, type Domain, type Family, type ScoreSummary } from '@/api/types';
import { gradeOf } from '@/lib/format';

type Row = [string, string, Family, number, number, number | null, string, string[], string, string];

// The 25 audit domains: code, name, family, checkpoints total, run, score, what it tests, metrics, top finding, sources.
const ROWS: Row[] = [
  ['CON', 'Consent proof', 'Permission', 96, 90, 71.0, 'Every call and text has proof of permission that covers it, of the type its legal basis requires.', ['M01', 'M02', 'M03'], '1,100 contacts have conflicting proof; 500 have none (40% of those are CiV policy only).', 'Consent certificates (Tier 2), CRM (Tier 3)'],
  ['WEB', 'Consent forms', 'Permission', 58, 58, 77.5, 'Consent pages, including affiliate pages, carry every required checklist item and are re-captured daily.', ['M04', 'M05', 'M28'], 'Consent block on the quote form changed on 28 Sep; one required item is now missing.', 'CiV page captures (Tier 1)'],
  ['LPV', 'Lead source tracing', 'Permission', 44, 40, 84.0, 'Each web lead traces to a named vendor or your own form, a capture page, a time and a certificate.', ['M06', 'M26', 'M27'], '800 leads lack a vendor or capture page.', 'Lead platform (Tier 3)'],
  ['VND', 'Vendor contracts', 'Permission', 38, 20, 66.7, 'Every active lead vendor has signed terms containing the required clauses.', ['M07', 'M29', 'M30'], '4 of 12 active vendors have incomplete terms on file.', 'Uploaded contracts (Tier 4, AI reader)'],
  ['AFF', 'Affiliate oversight', 'Permission', 30, 26, 72.0, 'Affiliate networks supply sub-IDs and publish only approved consent pages.', ['M06', 'M26'], 'Vendor E, sub-ID 7 fell 11.2 points this month.', 'Lead platform (Tier 3), page captures (Tier 1)'],
  ['RND', 'Reassigned numbers', 'Who you contact', 32, 18, 62.0, 'Robocalls made long after consent are preceded by your own reassigned-number check.', ['M11'], 'Your reassigned-number query logs are not supplied, so pre-contact checks cannot be measured.', 'Somos (Tier 1), your query logs (Tier 4, missing)'],
  ['IDN', 'Internal DNC list', 'Who you contact', 28, 28, 90.0, 'Your own do-not-contact list is honoured in every contacting system.', ['M12'], '22 contacts to 11 numbers after they entered your list.', 'Your internal list (Tier 4)'],
  ['NDN', 'National DNC', 'Who you contact', 40, 0, null, 'National DNC scrubs are current and flagged numbers are handled. Runs on your scrub records only.', ['M13'], 'Scrub records not supplied. Reported separately; never part of the Audit Score.', 'Your scrub records (Tier 4, missing)'],
  ['SDN', 'State DNC', 'Who you contact', 52, 0, null, 'State DNC lists are handled where states maintain them. Runs on your scrub records only.', ['M13'], 'Scrub records not supplied. Reported separately; never part of the Audit Score.', 'Your scrub records (Tier 4, missing)'],
  ['XBD', 'Non-US numbers', 'Who you contact', 12, 12, 95.0, 'Contacts to numbers outside the United States are identified for separate review.', ['M15'], '15 contacts to Canada, the United Kingdom and Jamaica.', 'Dialer, SMS (Tier 3)'],
  ['DLR', 'Autodialer use', 'How you contact', 46, 42, 81.0, 'Autodialed contacts carry the consent they require and abandoned calls stay within the limit.', ['M19', 'M31'], 'One campaign ran at 3.7% abandoned calls against a 3% limit.', 'Dialer (Tier 3)'],
  ['PRV', 'Prerecorded and AI voice', 'How you contact', 38, 30, 74.0, 'Prerecorded and AI-voice messages carry written consent and every required disclosure.', ['M19', 'M20'], '15% of reviewed calls omit a required disclosure.', 'Dialer, recordings (Tier 3)'],
  ['SMS', 'Text messaging', 'How you contact', 64, 60, 79.0, 'Texts follow consent, opt-out and quiet-hour rules.', ['M10', 'M16'], 'Plain-language opt-out replies are not processed within the deadline.', 'SMS platform (Tier 3)'],
  ['CTF', 'Calling hours and frequency', 'How you contact', 70, 66, 83.5, 'Contacts stay within permitted hours, frequency limits and restricted holidays.', ['M16', 'M17', 'M18'], '310 contacts outside state hours; 120 more are possible, with uncertain location.', 'Dialer, SMS (Tier 3), CRM addresses (Tier 3)'],
  ['IDD', 'Caller ID and identity', 'How you contact', 24, 24, 92.0, 'Caller ID is valid, answers a callback and identifies the caller.', ['M21'], '4 caller IDs did not answer a callback.', 'Dialer (Tier 3), CiV callback (Tier 1)'],
  ['SHK', 'Call authentication', 'How you contact', 18, 14, 88.0, 'Calls carry STIR/SHAKEN attestation.', ['M21'], '26% of calls at attestation B; 3% not exposed by the dialer.', 'Dialer / carrier (Tier 3)'],
  ['VLT', 'Ringless voicemail', 'How you contact', 14, 0, null, 'Domain definition pending confirmation against the checkpoint library.', [], 'Not measured until the domain definition is confirmed.', '—'],
  ['REV', 'Opt-out handling', 'Stopping', 62, 58, 62.0, 'Opt-outs on every channel stop contact in every system, on time. Tested with live opt-outs from CiV test lines.', ['M08', 'M09', 'M10'], 'Web and email opt-outs never reached the dialer or SMS platform in three tests.', 'CiV test lines (Tier 1), dialer, SMS, CRM (Tier 3)'],
  ['REC', 'Record keeping', 'Records', 58, 50, 88.0, 'Records exist to show each contact was permitted.', ['M22a', 'M22b'], 'Proof complete for 56.0% of numbers (partial: 7 of 8 elements measured).', 'All sources'],
  ['RET', 'Record retention', 'Records', 34, 30, 91.0, 'Records are held for the lawsuit window and the five-year record-keeping rule.', ['M23'], 'Dialer history reaches back only two years.', 'All sources'],
  ['SEC', 'Data security', 'Records', 48, 30, 85.0, 'Consumer data is protected and every access is logged.', [], 'Two shared logins found on the dialer.', 'Connector metadata (Tier 3), uploads (Tier 4)'],
  ['GOV', 'Policies and training', 'Company controls', 72, 40, 86.0, 'Written policies exist and every contacting agent is trained.', ['M25a'], '5 of 50 agents lack current training.', 'Uploaded policies and training logs (Tier 4)'],
  ['INC', 'Complaint handling', 'Company controls', 36, 30, 85.0, 'Complaints are logged and resolved within target.', ['M24'], '6 complaints open; median 6 days to resolve.', 'Your complaint log (Tier 4)'],
  ['PLT', 'Calling platforms', 'Company controls', 58, 26, 90.0, 'Calling and texting platforms are configured and registered correctly.', [], 'Messaging registration details missing for one brand.', 'Connector metadata (Tier 3)'],
  ['MNA', 'Acquired lead lists', 'Company controls', 60, 20, 70.0, 'Purchased or inherited lists carry a consent chain.', ['M25b'], '2 of 3 acquired lists failed the consent-chain sample.', 'Uploaded lists (Tier 4)'],
];

// Earlier months sit below the current score by these amounts, shifted a little per domain.
const DRIFT = [-9, -5.5, -2.5, 0];

export const domains: Domain[] = ROWS.map(([code, name, family, total, run, score, what, metrics, finding, sources], i) => {
  const excluded = code === 'NDN' || code === 'SDN';
  const measured = run > 0 && score !== null;
  const warn = measured ? Math.round(run * 0.1) : 0;
  const pass = measured ? Math.max(0, Math.round((score! / 100) * run - 0.5 * warn)) : 0;
  const fail = measured ? Math.max(0, run - pass - warn) : 0;
  const wobble = ((i * 7) % 5) - 2;
  const history = DRIFT.map((d, k) => (score === null ? null : Math.round((score + d + (k < 3 ? wobble * (3 - k) * 0.4 : 0)) * 10) / 10));
  return { code, name, family, total, run, pass, warn, fail, notRun: total - run, score, excluded, what, finding, sources, metrics, history };
});

const scored = domains.filter((d) => d.score !== null && !d.excluded);
const overall = scored.reduce((a, d) => a + (d.score ?? 0), 0) / scored.length;
const familyScore = (f: Family): number | null => {
  const xs = scored.filter((d) => d.family === f);
  return xs.length ? xs.reduce((a, d) => a + (d.score ?? 0), 0) / xs.length : null;
};

export const score: ScoreSummary = {
  score: overall, grade: 'C', rawGrade: gradeOf(overall),
  cap: { share: 11.2, limit: 10 },
  checkpointsRun: domains.reduce((a, d) => a + d.run, 0),
  checkpointsTotal: domains.reduce((a, d) => a + d.total, 0),
  domainsMeasured: scored.length, domainsTotal: domains.length,
  projected: { score: 84.9, grade: 'B', actions: 5, clearsCap: true },
  previous: 79.6,
  families: FAMILIES.map((family) => ({ family, score: familyScore(family) })),
  history: [
    { period: '2026-06', label: 'Jun', score: 68.4, grade: 'D', event: 'Engagement began; first full audit' },
    { period: '2026-07', label: 'Jul', score: 73.9, grade: 'C', event: 'Internal do-not-contact list connected' },
    { period: '2026-08', label: 'Aug', score: 79.6, grade: 'C', event: 'Certificate retention turned on' },
    { period: '2026-09', label: 'Sep', score: overall, grade: 'C', event: 'Quote form consent block changed; dialer connector stale' },
  ],
};
