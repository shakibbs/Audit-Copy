'use client';

import { useState } from 'react';
import { useActions, useScore, useSession } from '@/api/queries';
import { Card } from '@/components/ui/Card';
import { Kpi } from '@/components/ui/Kpi';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { Seg } from '@/components/ui/Seg';
import { ActionList } from './ActionList';
import { ProjectedScore } from './ProjectedScore';

const FILTERS = [{ id: 'open', label: 'Open' }, { id: 'mine', label: 'Assigned to me' }, { id: 'unassigned', label: 'Unassigned' }, { id: 'overdue', label: 'Overdue' }, { id: 'all', label: 'All' }] as const;
type Filter = (typeof FILTERS)[number]['id'];

export function ActionsScreen() {
  const [filter, setFilter] = useState<Filter>('open');
  const actions = useActions();
  const score = useScore();
  const me = useSession().data?.name;
  return (
    <>
      <PageHead eyebrow="Your position" title="Action Queue" sub="Fixes ranked by severity and score impact. Each has an owner, a date and a fix step." />
      <Loader query={actions}>
        {(list) => {
          const open = list.filter((a) => a.status !== 'resolved');
          const shown = { open, mine: open.filter((a) => a.assignee === me), unassigned: open.filter((a) => !a.assignee), overdue: open.filter((a) => a.overdue), all: list }[filter];
          return (
            <div className="flex flex-col gap-5">
              {score.data && <ProjectedScore score={score.data} />}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Kpi tag="Open actions" value={String(open.length)} foot={`${open.filter((a) => a.severity === 'High').length} high severity`} />
                <Kpi tag="Overdue" value={String(open.filter((a) => a.overdue).length)} foot="Past the due date" />
                <Kpi tag="Unassigned" value={String(open.filter((a) => !a.assignee).length)} foot="No owner yet" />
                <Kpi tag="Contested" value={String(list.filter((a) => a.dispute).length)} foot="A note is attached to the finding" />
              </div>
              <Card title="Queue" sub="Most urgent first" flush right={<Seg label="Filter" options={FILTERS} value={filter} onChange={setFilter} />}>
                <ActionList actions={shown} />
              </Card>
            </div>
          );
        }}
      </Loader>
    </>
  );
}
