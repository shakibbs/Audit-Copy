'use client';

import type { Period } from '@/api/types';
import { usePortal } from '@/state/PortalContext';

/** Chooses the month shown on the score, domain and metric pages. */
export function PeriodSelect({ periods }: { periods: Period[] }) {
  const { period, setPeriod } = usePortal();
  return (
    <label className="flex items-center gap-2 text-[12px] text-txt-2">
      <span className="sr-only">Period</span>
      <select className="field !w-auto !py-2 font-semibold" value={period ?? periods[0]?.id} onChange={(e) => setPeriod(e.target.value)}>
        {periods.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
      </select>
    </label>
  );
}
