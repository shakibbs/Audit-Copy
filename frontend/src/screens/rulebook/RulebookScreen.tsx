'use client';

import { useRulebook } from '@/api/queries';
import type { RulebookSetting } from '@/api/types';
import { StackedBar } from '@/components/charts/StackedBar';
import { Card } from '@/components/ui/Card';
import { Kpi } from '@/components/ui/Kpi';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { ImpactTable } from './ImpactTable';

const STATUS: Record<RulebookSetting['status'], [string, string]> = { set: ['pill-green', 'Set'], proposed: ['pill-amber', 'Proposed'], tbd: ['pill-gray', 'TBD'] };

export function RulebookScreen() {
  const rulebook = useRulebook();
  return (
    <>
      <PageHead eyebrow="Engagement" title="Rulebook" sub="The settings the engine reads, who owns each, and whether it is decided. You can read these; only counsel and CiV change them." />
      <Loader query={rulebook}>
        {(r) => (
          <div className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <Kpi tag="Set" value={String(r.set)} foot="Decided" />
              <Kpi tag="Proposed" value={String(r.proposed)} foot="Starting value; counsel to confirm" />
              <Kpi tag="TBD" value={String(r.tbd)} foot="Dependent checks do not run" />
            </div>
            <Card title={r.version} sub={`${r.set + r.proposed + r.tbd} settings by status`}>
              <StackedBar height={18} label="Settings by status" segments={[
                { label: 'Set', value: r.set, color: 'var(--series-1)' }, { label: 'Proposed', value: r.proposed, color: 'var(--series-2)' }, { label: 'TBD', value: r.tbd, color: 'var(--series-muted)' },
              ]} />
            </Card>
            <Card title="Settings in force" sub="A selection of the settings that most affect your results" flush>
              <div className="overflow-x-auto">
                <table className="tbl">
                  <thead><tr><th>Setting</th><th>Value in force</th><th>Owner</th><th>Status</th></tr></thead>
                  <tbody>
                    {r.settings.map((s) => (
                      <tr key={s.key}>
                        <td className="mono text-[12px] font-semibold">{s.key}</td><td>{s.value}</td><td className="text-txt-2">{s.owner}</td>
                        <td><span className={`pill ${STATUS[s.status][0]}`}>{STATUS[s.status][1]}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            {r.impact.length > 0 && <ImpactTable impact={r.impact} />}
          </div>
        )}
      </Loader>
    </>
  );
}
