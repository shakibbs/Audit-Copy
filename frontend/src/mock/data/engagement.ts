import type { RegChange, Rulebook } from '@/api/types';

export const rulebook: Rulebook = {
  version: 'Rulebook v1.3 (effective-dated)', set: 58, proposed: 24, tbd: 14,
  settings: [
    { key: 'optout_deadline_business_days', value: '10', owner: 'Counsel', status: 'proposed', counselItem: 'A1' },
    { key: 'optout_keywords', value: 'STOP, QUIT, END, REVOKE, OPT OUT, CANCEL, UNSUBSCRIBE', owner: 'Counsel', status: 'proposed', counselItem: 'A3' },
    { key: 'optout_scope_rules', value: 'Awaiting publication of the FCC order adopted 30 Sep 2026', owner: 'Counsel', status: 'tbd', counselItem: 'A5' },
    { key: 'optout_exclusive_methods', value: 'None designated', owner: 'Counsel', status: 'tbd', counselItem: 'A5' },
    { key: 'calling_hours', value: 'Federal 08:00–21:00; state table pending', owner: 'Counsel', status: 'tbd', counselItem: 'A6' },
    { key: 'frequency_limits', value: 'State table pending', owner: 'Counsel', status: 'tbd', counselItem: 'A7' },
    { key: 'autodialed_modes', value: 'Strict and lenient readings under test', owner: 'Counsel', status: 'tbd', counselItem: 'A12' },
    { key: 'ebr_purchase_months / ebr_inquiry_months', value: '18 / 3', owner: 'Counsel', status: 'proposed', counselItem: 'A9' },
    { key: 'written_consent_types', value: 'Web certificate, signed form, IVR or keypress with disclosures', owner: 'Counsel', status: 'proposed', counselItem: 'B1' },
    { key: 'dnc_scrub_max_age_days', value: '31', owner: 'Counsel', status: 'proposed', counselItem: 'A14' },
    { key: 'clock_skew_seconds', value: '120', owner: 'Engineering', status: 'set', counselItem: null },
    { key: 'grade_bands', value: '90 / 80 / 70 / 60', owner: 'Product', status: 'set', counselItem: null },
    { key: 'hard_cap_share', value: '10%', owner: 'Product', status: 'set', counselItem: null },
    { key: 'ai_accuracy_pass_mark', value: '95%', owner: 'Product', status: 'proposed', counselItem: null },
  ],
  impact: [
    { key: 'autodialed_modes', counselItem: 'A12', strict: 'Every mode except manual', lenient: 'Only prerecorded or AI voice', contacts: 48210, changing: 6120 },
    { key: 'sms_treated_as_autodialed', counselItem: 'A17', strict: 'Yes', lenient: 'No', contacts: 48210, changing: 3340 },
    { key: 'seller_absent_effect', counselItem: 'B7', strict: 'NO_PROOF', lenient: 'WEAK', contacts: 48210, changing: 940 },
    { key: 'optout_grace_business_days', counselItem: 'A4', strict: '0', lenient: '10', contacts: 48210, changing: 212 },
  ],
};

export const regChanges: RegChange[] = [
  { id: 'rc-1', title: 'FCC adopts a new order on revoking consent', jurisdiction: 'Federal · FCC', status: 'adopted', date: '2026-09-30', effective: '30 days after publication in the Federal Register (not yet published)', summary: 'A caller may treat an opt-out as applying only to the category of informational messages it was aimed at, and may designate an exclusive opt-out method. A follow-up proposal asks about shortening the 10-business-day deadline.', settings: ['optout_scope_rules', 'optout_exclusive_methods', 'optout_deadline_business_days'], metrics: ['M08', 'M09', 'M10'], domains: ['REV', 'SMS'], confirmed: false, source: 'FCC open meeting, 30 Sep 2026' },
  { id: 'rc-2', title: 'Seventh Circuit: a text is not a “telephone call” for private do-not-call suits', jurisdiction: 'Federal · 7th Circuit', status: 'court ruling', date: '2026-07-14', effective: 'In force in that circuit', summary: 'In Steidinger v. Blackstone Medical Services the court held that texts fall outside the private do-not-call claim. Other courts differ, so results depend on the forum.', settings: ['litigation_forum'], metrics: ['M13'], domains: ['NDN', 'SDN', 'SMS'], confirmed: true, source: 'Seventh Circuit opinion, 14 Jul 2026' },
  { id: 'rc-3', title: 'Oregon extends its telemarketing law to texts', jurisdiction: 'Oregon', status: 'in force', date: '2026-01-01', effective: '1 Jan 2026', summary: 'Solicitations are limited to 8am–8pm and to three in 24 hours, and texts are covered.', settings: ['calling_hours', 'frequency_limits'], metrics: ['M16', 'M17'], domains: ['CTF', 'SMS'], confirmed: true, source: 'Oregon HB 3865' },
  { id: 'rc-4', title: 'Texas treats texts as telephone solicitation', jurisdiction: 'Texas', status: 'in force', date: '2025-09-01', effective: '1 Sep 2025', summary: 'Texts are now covered, sellers must register, and private suits are allowed.', settings: ['calling_hours', 'state_consent_rule'], metrics: ['M16'], domains: ['CTF', 'SMS', 'PLT'], confirmed: true, source: 'Texas SB 140' },
];
