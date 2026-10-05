import type { Readiness, ReadyState } from '@/api/types';
import { StackedBar } from '@/components/charts/StackedBar';
import { Card } from '@/components/ui/Card';
import { Kpi } from '@/components/ui/Kpi';
import { formatCount, formatDate } from '@/lib/format';
import { STATUS_COLOR } from '@/lib/status';

const STATE: Record<ReadyState, [string, string]> = { ready: ['pill-green', 'Ready'], partial: ['pill-amber', 'Partial'], missing: ['pill-red', 'Missing'] };
const ORDER: Record<ReadyState, number> = { missing: 0, partial: 1, ready: 2 };

/** The readiness test: eleven prerequisite checks, a preview of the status mix, and the recommended plan. */
export function ReadinessTab({ readiness }: { readiness: Readiness }) {
  const count = (s: ReadyState) => readiness.checks.filter((c) => c.state === s).length;
  const checks = [...readiness.checks].sort((a, b) => ORDER[a.state] - ORDER[b.state]);
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi tag="Can the audit start?" value={readiness.canStart ? 'Yes' : 'Not yet'} foot={`Readiness test run ${formatDate(readiness.runOn)} on ${readiness.sampleNumbers} numbers`} />
        <Kpi tag="Checks ready" value={String(count('ready'))} unit={`of ${readiness.checks.length}`} foot={`${count('partial')} partial · ${count('missing')} missing`} />
        <Kpi tag="Recommended plan" value={readiness.recommendedPlan} foot={`About ${formatCount(readiness.numbersPerMonth)} numbers contacted a month`} />
        <Kpi tag="Would be not measured" value={String(readiness.notMeasured.length)} unit="metrics" foot={readiness.notMeasured.map((m) => m.split(' ')[0]).join(', ')} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Prerequisite checks" sub="By result">
          <StackedBar height={18} label="Prerequisite checks by result" segments={[
            { label: 'Ready', value: count('ready'), color: 'var(--ok)' }, { label: 'Partial', value: count('partial'), color: 'var(--warn)' }, { label: 'Missing', value: count('missing'), color: 'var(--bad)' },
          ]} />
        </Card>
        <Card title="Preview on the sample" sub={`Consent status of the ${readiness.sampleNumbers} sample numbers`}>
          <StackedBar height={18} label="Preview status mix" segments={readiness.preview.map((p) => ({ label: p.status, value: p.count, color: STATUS_COLOR[p.status] }))} />
        </Card>
      </div>
      <Card title="What each check found" sub="Items needing a fix first" flush>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Check</th><th>Result</th><th>What was found</th><th>Fix</th></tr></thead>
            <tbody>
              {checks.map((c) => (
                <tr key={c.name}>
                  <td><span className="font-semibold">{c.name}</span><div className="tiny">{c.how}</div></td>
                  <td><span className={`pill ${STATE[c.state][0]}`}>{STATE[c.state][1]}</span></td>
                  <td>{c.detail}</td>
                  <td className="text-txt-2">{c.fix ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
