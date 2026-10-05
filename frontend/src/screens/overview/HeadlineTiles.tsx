'use client';

import { useRouter } from 'next/navigation';
import type { Action, Metric } from '@/api/types';
import { Sparkline } from '@/components/charts/Sparkline';
import { Kpi } from '@/components/ui/Kpi';
import { useDrawer } from '@/state/DrawerContext';

/** Four numbers an owner reads first. Each opens the detail behind it. */
export function HeadlineTiles({ metrics, actions }: { metrics: Metric[]; actions: Action[] }) {
  const { open } = useDrawer();
  const router = useRouter();
  const metric = (code: string) => metrics.find((m) => m.code === code);
  const coverage = metric('M01');
  const stop = metric('M08');
  const notMeasured = metrics.filter((m) => m.notMeasured);
  const high = actions.filter((a) => a.severity === 'High' && a.status !== 'resolved');
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi tag="Consent coverage" value={coverage?.display ?? '—'} foot="Contacts that need proof and have it" onClick={() => open('metric', 'M01')}>
        {coverage && <Sparkline values={coverage.history} />}
      </Kpi>
      <Kpi tag="Median time to stop" value={stop?.display ?? '—'} foot="From an opt-out to suppression, in tests" onClick={() => open('metric', 'M08')}>
        {stop && <Sparkline values={stop.history} />}
      </Kpi>
      <Kpi tag="High-severity actions" value={String(high.length)} foot={`${high.filter((a) => a.overdue).length} overdue · ${high.filter((a) => !a.assignee).length} unassigned`} onClick={() => router.push('/actions')} />
      <Kpi tag="Not measured" value={String(notMeasured.length)} unit="metrics" foot={notMeasured.map((m) => m.code).join(', ') + ' are waiting for a source'} onClick={() => router.push('/sources')} />
    </div>
  );
}
