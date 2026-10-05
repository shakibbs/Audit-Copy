import type { Session } from '@/api/types';

/** Months shown in history charts; the engagement began in June 2026. */
export const MONTHS = ['Jun', 'Jul', 'Aug', 'Sep'];

export const session: Session = {
  signedIn: true,
  userId: 'u-1', name: 'Dana Reyes', initials: 'DR', email: 'dana.reyes@sunpath.example',
  clientId: 'sunpath', clientName: 'SunPath Residential Solar', vertical: 'Solar',
  role: 'owner', engagementMode: 'direct', plan: 'Growth',
  sampleData: true, updatedAt: '2026-09-30T04:10:00Z',
  periods: [
    { id: '2026-09', label: 'Sep 2026' }, { id: '2026-08', label: 'Aug 2026' },
    { id: '2026-07', label: 'Jul 2026' }, { id: '2026-06', label: 'Jun 2026' },
  ],
  runs: [
    { runId: 'run-0930', label: 'Nightly run 30 Sep 2026 04:10 UTC', rulebookVersion: 'Rulebook v1.3', rulebookStatus: 'approved', variant: 'single', outputVisibility: 'client', engine: 'Engine 2.0.4' },
    { runId: 'run-0930-s', label: 'Provisional run 30 Sep 2026 · strict', rulebookVersion: 'Rulebook v1.4-p', rulebookStatus: 'provisional', variant: 'strict', outputVisibility: 'internal', engine: 'Engine 2.0.4' },
  ],
};
