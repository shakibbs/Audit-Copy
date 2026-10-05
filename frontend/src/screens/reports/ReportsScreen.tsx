'use client';

import { useReports, useSession } from '@/api/queries';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { usePortal } from '@/state/PortalContext';
import { BulkExport } from './BulkExport';
import { ReportCard } from './ReportCard';
import { ReportHistory } from './ReportHistory';

export function ReportsScreen() {
  const reports = useReports();
  const { period } = usePortal();
  const periods = useSession().data?.periods ?? [];
  const label = (periods.find((p) => p.id === period) ?? periods[0])?.label ?? '';
  return (
    <>
      <PageHead eyebrow="Disclosure" title="Reports & Exports" sub={`Downloads for ${label}. Change the month in the top bar.`} />
      <Loader query={reports}>
        {(r) => (
          <div className="flex flex-col gap-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{r.types.map((t) => <ReportCard key={t.id} report={t} period={label} />)}</div>
            <div className="grid gap-5 xl:grid-cols-2">
              <BulkExport period={label} />
              <ReportHistory runs={r.runs} />
            </div>
          </div>
        )}
      </Loader>
    </>
  );
}
