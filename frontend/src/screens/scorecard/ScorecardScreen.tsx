'use client';

import { useDomains, useScore } from '@/api/queries';
import { Legend } from '@/components/charts/Legend';
import { Kpi } from '@/components/ui/Kpi';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { formatCount, formatScore } from '@/lib/format';
import { usePortal } from '@/state/PortalContext';
import { DomainMap } from './DomainMap';
import { DomainRegister } from './DomainRegister';

export function ScorecardScreen() {
  const { period } = usePortal();
  const domains = useDomains(period);
  const score = useScore(period);
  return (
    <>
      <PageHead eyebrow="Your position" title="Audit Scorecard" sub="All 25 domains: what was checked, how many checkpoints passed, and where each one stands." />
      <Loader query={domains}>
        {(list) => {
          const notMeasured = list.filter((d) => d.score === null && !d.excluded);
          return (
            <div className="flex flex-col gap-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Kpi tag="Audit Score" value={score.data ? formatScore(score.data.score) : '—'} foot={score.data ? `Grade ${score.data.grade}` : ''} />
                <Kpi tag="Checkpoints run" value={score.data ? formatCount(score.data.checkpointsRun) : '—'} unit={score.data ? `of ${formatCount(score.data.checkpointsTotal)}` : ''} foot="The rest wait for a source or a rulebook value" />
                <Kpi tag="Domains measured" value={score.data ? String(score.data.domainsMeasured) : '—'} unit="of 25" foot="Only measured domains count toward the score" />
                <Kpi tag="Not measured" value={String(notMeasured.length)} unit="domains" foot={notMeasured.map((d) => d.code).join(', ') || 'None'} />
              </div>
              <DomainMap domains={list} />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="tiny">Checkpoint bars</span>
                <Legend items={[{ label: 'Passed', color: 'var(--ok)' }, { label: 'Warned', color: 'var(--warn)' }, { label: 'Failed', color: 'var(--bad)' }, { label: 'Not run', color: 'var(--series-muted)' }]} />
              </div>
              <DomainRegister domains={list} />
            </div>
          );
        }}
      </Loader>
    </>
  );
}
