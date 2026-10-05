'use client';

import { useLeads } from '@/api/queries';
import { BarList } from '@/components/charts/BarList';
import { StackedBar } from '@/components/charts/StackedBar';
import { Card } from '@/components/ui/Card';
import { Kpi } from '@/components/ui/Kpi';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { formatCount } from '@/lib/format';
import { useDrawer } from '@/state/DrawerContext';

export function LeadsScreen() {
  const leads = useLeads();
  const { open } = useDrawer();
  return (
    <>
      <PageHead eyebrow="Intelligence" title="Lead Provenance" sub="Where leads came from and what their records show. Signals describe the record; they are not a judgement about a lead or a vendor." />
      <Loader query={leads}>
        {(l) => {
          const pct = (n: number) => `${formatCount(n)} · ${((n / l.inspected) * 100).toFixed(0)}%`;
          return (
            <div className="flex flex-col gap-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <Kpi tag="Leads inspected" value={formatCount(l.inspected)} foot="Every lead delivered this period" />
                <Kpi tag="Consent completeness" value={`${l.completeness.toFixed(1)}%`} foot="Leads whose consent record has every checklist item" onClick={() => open('metric', 'M28')} />
                <Kpi tag="Page match" value={`${l.pageMatch.toFixed(1)}%`} foot="Certificate snapshot matches CiV’s page capture" onClick={() => open('metric', 'M27')} />
              </div>
              <Card title="Leads by signal level" sub="How many signals each lead record carries">
                <StackedBar height={22} label="Leads by signal level" segments={[
                  { label: 'Few signals (0–1)', value: l.few, color: 'var(--series-1)', display: pct(l.few) },
                  { label: 'Some signals (2–3)', value: l.some, color: 'var(--series-2)', display: pct(l.some) },
                  { label: 'High signals (4 or more)', value: l.high, color: 'var(--series-3)', display: pct(l.high) },
                ]} />
              </Card>
              <div className="grid gap-5 lg:grid-cols-2">
                <Card title="Most frequent signals" sub="Leads carrying each signal">
                  <BarList labelWidth={200} rows={l.signals.map((s) => ({ key: s.label, label: s.label, value: s.count, display: formatCount(s.count) }))} />
                </Card>
                <Card title="Most often missing" sub="Checklist items absent from the consent record">
                  <BarList labelWidth={250} rows={l.missing.map((s) => ({ key: s.label, label: s.label, value: s.count, display: formatCount(s.count) }))} />
                </Card>
              </div>
            </div>
          );
        }}
      </Loader>
    </>
  );
}
