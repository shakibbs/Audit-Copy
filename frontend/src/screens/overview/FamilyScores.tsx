'use client';

import Link from 'next/link';
import type { ScoreSummary } from '@/api/types';
import { BarList } from '@/components/charts/BarList';
import { Card } from '@/components/ui/Card';
import { formatScore, gradeOf } from '@/lib/format';

/** The six families of domains, each as a bar on the same 0–100 scale. */
export function FamilyScores({ score }: { score: ScoreSummary }) {
  return (
    <Card title="Score by family" sub="Six groups of domains, 0 to 100" right={<Link href="/scorecard" className="text-[12.5px] font-semibold">All 25 domains</Link>}>
      <BarList max={100} labelWidth={132} rows={score.families.map((f) => ({
        key: f.family, label: f.family, value: f.score,
        display: f.score === null ? 'Not measured' : `${formatScore(f.score)} · ${gradeOf(f.score)}`,
      }))} />
    </Card>
  );
}
