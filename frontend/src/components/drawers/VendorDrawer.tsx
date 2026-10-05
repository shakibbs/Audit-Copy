'use client';

import { useSession, useVendors } from '@/api/queries';
import { BarList } from '@/components/charts/BarList';
import { TrendLine } from '@/components/charts/TrendLine';
import { Delta } from '@/components/ui/Delta';
import { Drawer } from '@/components/ui/Drawer';
import { GradeBadge } from '@/components/ui/GradeBadge';
import { formatCount, formatScore } from '@/lib/format';
import { monthLabels } from '@/lib/months';

/** One lead vendor: score, the six rates behind it, and its history. */
export function VendorDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const vendor = useVendors().data?.vendors.find((v) => v.id === id);
  const months = monthLabels(useSession().data?.periods);
  if (!vendor) return <Drawer eyebrow="Vendor" title="Vendor" onClose={onClose}><p className="tiny">Loading…</p></Drawer>;

  return (
    <Drawer eyebrow={vendor.subId ? `Vendor · sub-ID ${vendor.subId}` : 'Vendor'} title={vendor.name} onClose={onClose}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <GradeBadge score={vendor.score} />
          <div>
            <div className="font-display text-[30px] font-extrabold leading-none">{vendor.notEnoughData ? '—' : formatScore(vendor.score)}</div>
            <div className="mt-1">{vendor.monthOnMonth === null ? <span className="tiny">Fewer than 100 leads: not enough data to score</span> : <Delta value={vendor.monthOnMonth} />}</div>
          </div>
        </div>
        <dl className="m-0">
          <div className="kv"><dt>Leads this period</dt><dd className="mono">{formatCount(vendor.leads)}</dd></div>
          <div className="kv"><dt>High-signal leads</dt><dd className="mono">{formatCount(vendor.highSignals)}</dd></div>
          <div className="kv"><dt>Dispute candidates</dt><dd className="mono">{formatCount(vendor.disputeCandidates)}</dd></div>
          <div className="kv"><dt>Signed terms on file</dt><dd>{vendor.termsOnFile ? 'Yes' : 'Not on file'}</dd></div>
        </dl>
        {vendor.rates.length > 0 && (
          <div>
            <div className="kpi-tag mb-2">Rates behind the score (% of leads)</div>
            <BarList labelWidth={170} rows={vendor.rates.map((r) => ({ key: r.label, label: r.label, value: r.value, display: `${r.value.toFixed(1)}%` }))} />
          </div>
        )}
        {!vendor.notEnoughData && (
          <div>
            <div className="kpi-tag mb-2">Score by month</div>
            <TrendLine label={`${vendor.name} score by month`} height={160} points={vendor.history.map((value, i) => ({ label: months[i] ?? '', value }))} />
          </div>
        )}
      </div>
    </Drawer>
  );
}
