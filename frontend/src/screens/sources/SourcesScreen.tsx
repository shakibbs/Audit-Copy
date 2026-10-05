'use client';

import { useSources } from '@/api/queries';
import { StackedBar } from '@/components/charts/StackedBar';
import { Card } from '@/components/ui/Card';
import { Kpi } from '@/components/ui/Kpi';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { TIER_LABEL } from '@/lib/format';
import type { Tier } from '@/api/types';
import { SourceTable } from './SourceTable';
import { UploadCentre } from './UploadCentre';

const TIER_COLOR: Record<Tier, string> = { 1: 'var(--series-1)', 2: 'var(--series-2)', 3: 'var(--series-3)', 4: 'var(--series-muted)' };

export function SourcesScreen() {
  const sources = useSources();
  return (
    <>
      <PageHead eyebrow="Disclosure" title="Source Registry" sub="Where every figure in this portal comes from, who captured it, and how fresh it is." />
      <Loader query={sources}>
        {(list) => {
          const count = (status: string) => list.filter((s) => s.status === status).length;
          return (
            <div className="flex flex-col gap-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <Kpi tag="Current" value={String(count('current'))} unit={`of ${list.length}`} foot="Synced within the expected window" />
                <Kpi tag="Stale" value={String(count('stale'))} foot={list.filter((s) => s.status === 'stale').map((s) => s.name).join(', ') || 'None'} />
                <Kpi tag="Not supplied" value={String(count('not_supplied'))} foot={list.filter((s) => s.status === 'not_supplied').map((s) => s.blocks).join(' · ') || 'None'} />
              </div>
              <Card title="Sources by evidence tier" sub="Tier 1 is strongest: captured by CiV itself">
                <StackedBar height={20} label="Sources by evidence tier" segments={([1, 2, 3, 4] as Tier[]).map((t) => ({ label: TIER_LABEL[t], value: list.filter((s) => s.tier === t).length, color: TIER_COLOR[t] }))} />
              </Card>
              <Card title="Sources" sub="Items needing attention first" flush><SourceTable sources={list} /></Card>
              <UploadCentre sources={list} />
            </div>
          );
        }}
      </Loader>
    </>
  );
}
