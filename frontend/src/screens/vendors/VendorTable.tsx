'use client';

import type { Vendor } from '@/api/types';
import { Sparkline } from '@/components/charts/Sparkline';
import { Delta } from '@/components/ui/Delta';
import { GradeBadge } from '@/components/ui/GradeBadge';
import { formatCount, formatScore } from '@/lib/format';
import { useDrawer } from '@/state/DrawerContext';

/** One row per vendor and sub-ID. Selecting a row opens the vendor panel. */
export function VendorTable({ vendors }: { vendors: Vendor[] }) {
  const { open } = useDrawer();
  return (
    <div className="overflow-x-auto">
      <table className="tbl">
        <thead><tr><th>Vendor</th><th>Leads</th><th>High-signal</th><th>Score</th><th>Grade</th><th>Month on month</th><th>4 months</th><th>Signed terms</th><th>Dispute candidates</th></tr></thead>
        <tbody>
          {vendors.map((v) => (
            <tr key={v.id} className="clickrow" onClick={() => open('vendor', v.id)}>
              <td><button type="button" className="border-0 bg-transparent p-0 text-left text-[13px] font-semibold text-txt">{v.name}</button>{v.subId && <div className="tiny">sub-ID {v.subId}</div>}</td>
              <td className="mono">{formatCount(v.leads)}</td>
              <td className="mono">{formatCount(v.highSignals)}</td>
              <td className="mono font-semibold">{v.notEnoughData ? <span className="pill pill-gray">Not enough data</span> : formatScore(v.score)}</td>
              <td><GradeBadge score={v.score} /></td>
              <td className="whitespace-nowrap">{v.monthOnMonth === null ? '—' : <Delta value={v.monthOnMonth} label="" />}{v.alert && <span className="pill pill-red ml-2">Alert</span>}</td>
              <td><Sparkline values={v.history} /></td>
              <td>{v.termsOnFile ? <span className="pill pill-green">On file</span> : <span className="pill pill-amber">Not on file</span>}</td>
              <td className="mono">{formatCount(v.disputeCandidates)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
