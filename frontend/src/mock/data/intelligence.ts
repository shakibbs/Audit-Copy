import type { Conduct, Leads, Vendor, VendorSummary } from '@/api/types';
import { gradeOf } from '@/lib/format';

export const conduct: Conduct = {
  metrics: ['M16', 'M17', 'M18', 'M31', 'M19', 'M20', 'M21', 'M15'],
  byState: [
    { state: 'California', count: 140, window: '8am–9pm' }, { state: 'Arizona', count: 70, window: '8am–9pm' },
    { state: 'Texas', count: 48, window: '9am–9pm; Sunday from noon' }, { state: 'Florida', count: 32, window: '8am–8pm' },
    { state: 'Nevada', count: 20, window: '8am–9pm' },
  ],
  possibleLocationUncertain: 120,
  byCampaign: [
    { campaign: 'SP-Q3-Roof', rate: 3.7 }, { campaign: 'SP-Battery', rate: 2.4 },
    { campaign: 'SP-Referral', rate: 1.1 }, { campaign: 'SP-Winback', rate: 0.8 },
  ],
  abandonLimit: 3,
  hoursOfDay: [
    ['7', 62, true], ['8', 2100, false], ['9', 4300, false], ['10', 5200, false], ['11', 5400, false], ['12', 4100, false],
    ['13', 4600, false], ['14', 5100, false], ['15', 5300, false], ['16', 4900, false], ['17', 4200, false], ['18', 2600, false],
    ['19', 1400, false], ['20', 510, false], ['21', 248, true],
  ].map(([hour, count, outside]) => ({ hour: `${hour}:00`, count: count as number, outside: outside as boolean })),
};

export const leads: Leads = {
  inspected: 5000, few: 4300, some: 550, high: 150, completeness: 78.0, pageMatch: 95.8,
  signals: [
    { label: 'Fast fill (under 8 s)', count: 310 }, { label: 'Name-match signal', count: 240 }, { label: 'Email signal', count: 180 },
    { label: 'Device burst', count: 120 }, { label: 'Pasted fields', count: 96 }, { label: 'New website (under 90 days)', count: 60 },
  ],
  missing: [
    { label: 'Consent is not a condition of purchase', count: 420 }, { label: 'Automated contact disclosed', count: 310 },
    { label: 'Number shown to the consumer', count: 260 }, { label: 'Text contrast', count: 150 }, { label: 'Consent above the button', count: 110 },
  ],
};

type V = [string, string | null, number, number, number | null, number | null, boolean, number];

// name, sub-ID, leads, high-signal leads, score, month-on-month change, terms on file, dispute candidates
const ROWS: V[] = [
  ['Vendor A', '114', 1420, 12, 91.2, 1.4, true, 9], ['Vendor B', '22', 1000, 50, 88.6, -0.8, true, 31],
  ['Vendor C', null, 860, 18, 83.0, 2.1, true, 14], ['Vendor D', null, 640, 21, 79.4, -3.0, false, 26],
  ['Vendor E', '7', 520, 31, 61.8, -11.2, false, 74], ['Vendor F', null, 480, 18, 52.3, -4.5, false, 58],
  ['Vendor G', null, 80, 0, null, null, true, 0],
];

const vendors: Vendor[] = ROWS.map(([name, subId, count, highSignals, score, mom, termsOnFile, disputeCandidates], i) => ({
  id: `v-${'abcdefg'[i]}`, name, subId, leads: count, highSignals, score, grade: score === null ? null : gradeOf(score),
  monthOnMonth: mom, alert: mom !== null && mom <= -10, notEnoughData: score === null, termsOnFile, disputeCandidates,
  history: score === null || mom === null ? [null, null, null, null] : [score - mom * 1.6, score - mom * 1.3, score - mom, score].map((x) => Math.round(x * 10) / 10),
  rates: score === null ? [] : [
    { label: 'High-signal leads', value: Math.round((highSignals / count) * 1000) / 10 },
    { label: 'Consent problems', value: Math.round((100 - score) * 0.32 * 10) / 10 },
    { label: 'Checklist gaps', value: Math.round((100 - score) * 0.9 * 10) / 10 },
    { label: 'Name-match signal', value: Math.round((100 - score) * 0.18 * 10) / 10 },
    { label: 'Late delivery', value: Math.round((100 - score) * 0.25 * 10) / 10 },
    { label: 'Early stops and complaints', value: Math.round((100 - score) * 0.08 * 10) / 10 },
  ],
}));

export const vendorSummary: VendorSummary = {
  gradeMix: '1 A · 2 B · 1 C', gradeMixNote: '1 D · 1 F · 1 insufficient data',
  disputeCandidates: 212, alerts: 1, alertNote: 'Vendor E dropped 11.2 points', vendors,
};
