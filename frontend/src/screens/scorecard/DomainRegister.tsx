'use client';

import { useState } from 'react';
import type { Domain } from '@/api/types';
import { Sparkline } from '@/components/charts/Sparkline';
import { StackedBar } from '@/components/charts/StackedBar';
import { Card } from '@/components/ui/Card';
import { GradeBadge } from '@/components/ui/GradeBadge';
import { Seg } from '@/components/ui/Seg';
import { formatScore } from '@/lib/format';
import { useDrawer } from '@/state/DrawerContext';

const SORTS = [{ id: 'worst', label: 'Lowest score first' }, { id: 'family', label: 'By family' }] as const;

/** Table of every domain with its checkpoints, score, grade and four-month trend. */
export function DomainRegister({ domains }: { domains: Domain[] }) {
  const [sort, setSort] = useState<(typeof SORTS)[number]['id']>('worst');
  const { open } = useDrawer();
  // Unscored domains sink to the bottom of the "lowest first" order.
  const rank = (d: Domain) => (d.excluded || d.score === null ? 1000 : d.score);
  const rows = sort === 'worst' ? [...domains].sort((a, b) => rank(a) - rank(b)) : domains;
  return (
    <Card title="Domain register" sub="Select a row for the detail" flush right={<Seg label="Order" options={SORTS} value={sort} onChange={setSort} />}>
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>Code</th><th>Domain</th><th>Family</th><th className="w-[190px]">Checkpoints</th><th>Score</th><th>Grade</th><th>4 months</th></tr></thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.code} className="clickrow" onClick={() => open('domain', d.code)}>
                <td><span className="mono text-[11.5px] font-semibold">{d.code}</span></td>
                <td>
                  <button type="button" className="border-0 bg-transparent p-0 text-left text-[13px] font-semibold text-txt">{d.name}</button>
                  <div className="tiny max-w-[340px] truncate">{d.finding}</div>
                </td>
                <td className="text-txt-2">{d.family}</td>
                <td>
                  {d.run > 0
                    ? <StackedBar legend={false} height={8} label={`${d.code} checkpoints`} segments={[{ label: 'Passed', value: d.pass, color: 'var(--ok)' }, { label: 'Warned', value: d.warn, color: 'var(--warn)' }, { label: 'Failed', value: d.fail, color: 'var(--bad)' }, { label: 'Not run', value: d.notRun, color: 'var(--series-muted)' }]} />
                    : <span className="tiny">None run</span>}
                  <div className="tiny mt-1">{d.run} of {d.total} run</div>
                </td>
                <td className="mono font-semibold">{d.excluded ? 'Info only' : formatScore(d.score)}</td>
                <td><GradeBadge score={d.score} excluded={d.excluded} /></td>
                <td>{d.excluded ? <span className="tiny">—</span> : <Sparkline values={d.history} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
