'use client';

import type { Run } from '@/api/types';
import { usePortal } from '@/state/PortalContext';

/** CiV staff only: switch between engine runs, including runs on an unapproved rulebook. */
export function RunSelect({ runs }: { runs: Run[] }) {
  const { runId, setRunId } = usePortal();
  return (
    <label className="hidden items-center gap-2 text-[12px] text-txt-2 md:flex">
      <span className="sr-only">Run</span>
      <select className="field !w-auto !py-2" value={runId ?? runs[0]?.runId} onChange={(e) => setRunId(e.target.value)}>
        {runs.map((r) => <option key={r.runId} value={r.runId}>{r.label}</option>)}
      </select>
    </label>
  );
}
