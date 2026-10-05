'use client';

import type { Metric } from '@/api/types';
import { Sparkline } from '@/components/charts/Sparkline';
import { useDrawer } from '@/state/DrawerContext';

/** One metric as a tile: value, four-month trend and a one-line note. Opens the metric panel. */
export function MetricTile({ metric }: { metric: Metric }) {
  const { open } = useDrawer();
  return (
    <button type="button" className="card kpi" onClick={() => open('metric', metric.code)}>
      <span className="kpi-tag flex items-center justify-between"><span>{metric.name}</span><span className="mono normal-case tracking-normal">{metric.code}</span></span>
      <span className="flex items-end justify-between gap-2">
        {metric.notMeasured ? <span className="pill pill-gray">Not measured</span> : <span className="kpi-val !text-[24px]">{metric.display}</span>}
        {!metric.notMeasured && <Sparkline values={metric.history} width={70} height={24} />}
      </span>
      <span className="kpi-foot">{metric.notMeasured ?? metric.note}</span>
    </button>
  );
}
