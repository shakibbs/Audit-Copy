'use client';

import { useDrawer } from '@/state/DrawerContext';

/** Metric code (M01…) that opens the metric panel. */
export function MetricCode({ code }: { code: string }) {
  const { open } = useDrawer();
  return <button type="button" className="dcode" onClick={(e) => { e.stopPropagation(); open('metric', code); }} aria-label={`Open metric ${code}`}>{code}</button>;
}
