'use client';

import { useVendors } from '@/api/queries';
import { BarList } from '@/components/charts/BarList';
import { Card } from '@/components/ui/Card';
import { Kpi } from '@/components/ui/Kpi';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { formatCount, formatScore, gradeOf } from '@/lib/format';
import { useDrawer } from '@/state/DrawerContext';
import { VendorTable } from './VendorTable';

export function VendorsScreen() {
  const vendors = useVendors();
  const { open } = useDrawer();
  return (
    <>
      <PageHead eyebrow="Intelligence" title="Vendor Ledger" sub="Each lead vendor measured on the same six rates, so you can compare them and see who is slipping." />
      <Loader query={vendors}>
        {(v) => {
          const ranked = [...v.vendors].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
          return (
            <div className="flex flex-col gap-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <Kpi tag="Grades" value={v.gradeMix} foot={v.gradeMixNote} />
                <Kpi tag="Dispute candidates" value={formatCount(v.disputeCandidates)} unit="leads" foot="Leads whose record may support a return or credit request" info="A lead is a dispute candidate when its record misses what your vendor terms require. Whether to raise it with the vendor is your decision." />
                <Kpi tag="Score-drop alerts" value={String(v.alerts)} foot={v.alertNote} />
              </div>
              <Card title="Vendor scores" sub="Ranked, 0 to 100">
                <BarList max={100} labelWidth={170} rows={ranked.map((x) => ({
                  key: x.id, value: x.score, onClick: () => open('vendor', x.id),
                  label: x.subId ? `${x.name} · sub-ID ${x.subId}` : x.name,
                  display: x.score === null ? 'No score' : `${formatScore(x.score)} · ${gradeOf(x.score)}`,
                }))} />
              </Card>
              <Card title="Vendors" sub="Select a row for the rates behind the score" flush><VendorTable vendors={v.vendors} /></Card>
            </div>
          );
        }}
      </Loader>
    </>
  );
}
