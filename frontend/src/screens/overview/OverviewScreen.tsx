'use client';

import { useActions, useMetrics, useScore } from '@/api/queries';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { usePortal } from '@/state/PortalContext';
import { CapBanner } from './CapBanner';
import { FamilyScores } from './FamilyScores';
import { HeadlineTiles } from './HeadlineTiles';
import { ScoreCard } from './ScoreCard';
import { ScoreTrendCard } from './ScoreTrendCard';
import { TopActions } from './TopActions';

export function OverviewScreen() {
  const { period } = usePortal();
  const score = useScore(period);
  const metrics = useMetrics(period);
  const actions = useActions();
  return (
    <>
      <PageHead eyebrow="Your position" title="Overview" sub="Where your calling and texting records stand this month, what changed, and what to do first." />
      <Loader query={score}>
        {(s) => (
          <div className="flex flex-col gap-5">
            <CapBanner score={s} />
            <div className="grid gap-5 lg:grid-cols-3">
              <ScoreCard score={s} />
              <ScoreTrendCard score={s} />
            </div>
            {metrics.data && actions.data && <HeadlineTiles metrics={metrics.data} actions={actions.data} />}
            <div className="grid gap-5 lg:grid-cols-2">
              <FamilyScores score={s} />
              {actions.data && <TopActions actions={actions.data} />}
            </div>
          </div>
        )}
      </Loader>
    </>
  );
}
