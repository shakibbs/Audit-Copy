'use client';

import type { Metric } from '@/api/types';
import { Sparkline } from '@/components/charts/Sparkline';
import { Delta } from '@/components/ui/Delta';
import { DomainCode } from '@/components/ui/DomainCode';
import { useDrawer } from '@/state/DrawerContext';

const SOURCE_PILL = { CiV: 'pill-teal', Client: 'pill-gray', AI: 'pill-blue' };

/** The metric library as a table. Selecting a row opens the metric panel. */
export function MetricTable({ metrics }: { metrics: Metric[] }) {
  const { open } = useDrawer();
  return (
    <div className="overflow-x-auto">
      <table className="tbl">
        <thead><tr><th>Code</th><th>Metric</th><th>Value</th><th>4 months</th><th>Change</th><th>Measured by</th><th>Domains</th></tr></thead>
        <tbody>
          {metrics.map((m) => {
            const prev = m.history[m.history.length - 2];
            return (
              <tr key={m.code} className="clickrow" onClick={() => open('metric', m.code)}>
                <td><span className="mono text-[11.5px] font-semibold">{m.code}</span></td>
                <td className="min-w-[260px]"><button type="button" className="border-0 bg-transparent p-0 text-left text-[13px] font-semibold text-txt">{m.name}</button><div className="tiny">{m.notMeasured ?? m.note}</div></td>
                <td className="mono whitespace-nowrap font-semibold">{m.notMeasured ? <span className="pill pill-gray">Not measured</span> : m.display}</td>
                <td>{m.notMeasured ? <span className="tiny">—</span> : <Sparkline values={m.history} />}</td>
                <td className="whitespace-nowrap">{m.value !== null && prev !== null && prev !== undefined ? <Delta value={m.value - prev} better={m.better} unit={m.unit} label="" /> : <span className="tiny">—</span>}</td>
                <td><span className={`pill ${SOURCE_PILL[m.source]}`}>{m.source === 'Client' ? 'Your records' : m.source}</span></td>
                <td><span className="flex flex-wrap gap-1">{m.domains.map((d) => <DomainCode key={d} code={d} />)}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
