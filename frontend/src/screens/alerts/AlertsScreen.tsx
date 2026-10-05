'use client';

import { useState } from 'react';
import { useAlerts } from '@/api/queries';
import { Card } from '@/components/ui/Card';
import { Empty } from '@/components/ui/Empty';
import { Kpi } from '@/components/ui/Kpi';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { Seg } from '@/components/ui/Seg';
import { AlertRow } from './AlertRow';

const FILTERS = [{ id: 'new', label: 'Not reviewed' }, { id: 'all', label: 'All' }] as const;
const ORDER = { High: 0, Medium: 1, Low: 2 };

export function AlertsScreen() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('new');
  const alerts = useAlerts();
  return (
    <>
      <PageHead eyebrow="Your position" title="Alerts" sub="Things that changed since the last run and need someone to look. Alerts put your company on notice; what to do about them is your decision." />
      <Loader query={alerts}>
        {(list) => {
          const fresh = list.filter((a) => !a.reviewed);
          const shown = [...(filter === 'new' ? fresh : list)].sort((a, b) => ORDER[a.severity] - ORDER[b.severity] || b.at.localeCompare(a.at));
          return (
            <div className="flex flex-col gap-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <Kpi tag="Not reviewed" value={String(fresh.length)} foot={`${fresh.filter((a) => a.severity === 'High').length} high severity`} />
                <Kpi tag="Reviewed" value={String(list.length - fresh.length)} foot="Kept in the history" />
                <Kpi tag="Email delivery" value="On" foot="Choose which alerts are emailed in Settings" />
              </div>
              <Card title="Inbox" sub="Most severe first" flush right={<Seg label="Filter" options={FILTERS} value={filter} onChange={setFilter} />}>
                {shown.length === 0 ? <Empty>Every alert has been reviewed.</Empty> : shown.map((a) => <AlertRow key={a.id} alert={a} />)}
              </Card>
            </div>
          );
        }}
      </Loader>
    </>
  );
}
