import type { ScoreSummary } from '@/api/types';
import { TrendLine } from '@/components/charts/TrendLine';
import { Card } from '@/components/ui/Card';

/** Score by month, with a dated note of what moved it each time. */
export function ScoreTrendCard({ score }: { score: ScoreSummary }) {
  return (
    <Card title="Score history" sub="Audit Score by month, and what moved it" className="lg:col-span-2">
      <TrendLine label="Audit Score by month" height={200} points={score.history.map((h) => ({ label: h.label, value: Math.round(h.score * 10) / 10, note: h.event }))} target={{ value: 80, label: 'Grade B from 80' }} />
      <ol className="m-0 mt-3 grid list-none gap-x-6 gap-y-2 p-0 sm:grid-cols-2">
        {score.history.map((h, i) => (
          <li key={h.period} className="flex gap-3 text-[12.5px]">
            <span className="mono w-[34px] flex-none font-semibold text-txt">{h.label}</span>
            <span className="mono w-[44px] flex-none text-txt-2">{i === 0 ? h.score.toFixed(1) : `${h.score - score.history[i - 1].score >= 0 ? '+' : '−'}${Math.abs(h.score - score.history[i - 1].score).toFixed(1)}`}</span>
            <span className="text-txt-2">{h.event}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
