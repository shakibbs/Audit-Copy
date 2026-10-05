import type { ScoreSummary } from '@/api/types';
import { Gauge } from '@/components/charts/Gauge';
import { Delta } from '@/components/ui/Delta';
import { Info } from '@/components/ui/Info';
import { bandClass, formatCount } from '@/lib/format';

/** The Audit Score: dial, grade, change since last month, how much was measured, and the projection. */
export function ScoreCard({ score }: { score: ScoreSummary }) {
  return (
    <section className="card card-pad flex flex-col">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[15px]">Audit Score <Info text="The average of every measured domain score. Domains that are not measured, and the two client-list domains, are left out." /></h3>
        <span className={`pill ${bandClass(score.score)}`}>Grade {score.grade}</span>
      </div>
      <Gauge score={score.score} grade={score.grade} />
      <div className="mt-3 text-center"><Delta value={score.score - score.previous} /></div>
      <dl className="m-0 mt-4 border-t border-line pt-2">
        <div className="kv"><dt>Checkpoints run</dt><dd className="mono">{formatCount(score.checkpointsRun)} of {formatCount(score.checkpointsTotal)}</dd></div>
        <div className="kv"><dt>Domains measured</dt><dd className="mono">{score.domainsMeasured} of {score.domainsTotal}</dd></div>
        <div className="kv">
          <dt className="flex items-center gap-1.5">Projected <Info text="An estimate of the score if the listed open actions are completed. It is a projection, not a measurement." /></dt>
          <dd><span className="mono">{score.projected.score.toFixed(1)}</span> · grade {score.projected.grade} <span className="font-normal text-txt-3">if the top {score.projected.actions} actions are completed</span></dd>
        </div>
      </dl>
    </section>
  );
}
