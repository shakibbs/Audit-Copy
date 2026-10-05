'use client';

import { useState } from 'react';
import { useMetrics } from '@/api/queries';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { Seg } from '@/components/ui/Seg';
import { usePortal } from '@/state/PortalContext';
import { MetricTable } from './MetricTable';

export function MetricsScreen() {
  const [group, setGroup] = useState('All');
  const { period } = usePortal();
  const metrics = useMetrics(period);
  return (
    <>
      <PageHead eyebrow="Intelligence" title="Metrics Library" sub="Every metric CiV reports, with its value this month, its trend and its definition." />
      <Loader query={metrics}>
        {(list) => {
          const groups = ['All', ...Array.from(new Set(list.map((m) => m.group))), 'Not measured'];
          const shown = group === 'All' ? list : group === 'Not measured' ? list.filter((m) => m.notMeasured) : list.filter((m) => m.group === group);
          return (
            <Card title={`${shown.length} of ${list.length} metrics`} sub={`${list.filter((m) => m.notMeasured).length} not measured: a source is missing`} flush
              right={<Seg label="Group" options={groups.map((g) => ({ id: g, label: g }))} value={group} onChange={setGroup} />}>
              <MetricTable metrics={shown} />
            </Card>
          );
        }}
      </Loader>
    </>
  );
}
