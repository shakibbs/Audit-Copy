'use client';

import { useRevocation } from '@/api/queries';
import { Columns } from '@/components/charts/Columns';
import { Card } from '@/components/ui/Card';
import { Kpi } from '@/components/ui/Kpi';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { useDrawer } from '@/state/DrawerContext';
import { RevocationMatrix } from './RevocationMatrix';
import { TestAuthorisation } from './TestAuthorisation';
import { WordingCoverage } from './WordingCoverage';

export function RevocationScreen() {
  const revocation = useRevocation();
  const { open } = useDrawer();
  return (
    <>
      <PageHead eyebrow="Evidence" title="Revocation Integrity" sub="What happens when someone opts out. CiV sends test opt-outs from its own numbers and times how long each system keeps contacting." />
      <Loader query={revocation}>
        {(r) => (
          <div className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Kpi tag="Median time to stop" value={r.medianHours === null ? 'Not measured' : r.medianHours.toFixed(1)} unit="hours" foot="Half of test opt-outs stopped sooner" onClick={() => open('metric', 'M08')} />
              <Kpi tag="Slowest 10%" value={r.p90 === null ? 'Not measured' : String(r.p90)} foot="At least one path never stopped" info="The time by which 90% of test opt-outs had stopped. NEVER means one in ten or more had not stopped when the deadline passed." />
              <Kpi tag="Not suppressed by deadline" value={String(r.notSuppressedByDeadline)} unit="tests" foot={`Deadline: ${r.deadlineBusinessDays} business days`} />
              <Kpi tag="Contacted after deadline" value={String(r.contactedAfterDeadline)} unit="test number" foot="A contact arrived after the deadline" />
            </div>
            <RevocationMatrix revocation={r} />
            <div className="grid gap-5 lg:grid-cols-2">
              <Card title="Time to stop" sub="Test opt-outs by how long contact continued">
                <Columns label="Test opt-outs by time to stop" columns={r.distribution.map((d) => ({ label: d.label, value: d.count, display: `${d.count} tests`, flagged: d.label === 'Never' }))} />
                <p className="tiny mb-0 mt-3">The “Never” column is drawn in a second colour: those tests had not stopped by the deadline.</p>
              </Card>
              <TestAuthorisation revocation={r} />
            </div>
            <WordingCoverage revocation={r} />
          </div>
        )}
      </Loader>
    </>
  );
}
