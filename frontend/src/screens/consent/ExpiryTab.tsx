import type { ConsentSummary } from '@/api/types';
import { BarList } from '@/components/charts/BarList';
import { Card } from '@/components/ui/Card';
import { Kpi } from '@/components/ui/Kpi';
import { formatCount } from '@/lib/format';

/** Consent certificates that will stop being retrievable, by how soon. */
export function ExpiryTab({ consent }: { consent: ConsentSummary }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {consent.expiring.map((e) => <Kpi key={e.within} tag={`Within ${e.within}`} value={formatCount(e.count)} unit="certificates" foot="Become unavailable unless retained" />)}
      </div>
      <Card title="Certificates becoming unavailable" sub="Cumulative count by horizon">
        <BarList labelWidth={120} rows={consent.expiring.map((e) => ({ key: e.within, label: `Within ${e.within}`, value: e.count, display: formatCount(e.count) }))} />
        <div className="note-box mt-4">A certificate that is not retained at the provider can no longer be opened after its claim period. Contacts that rely on it then move from VERIFIED or WEAK to CONFLICTING (CF_EXPIRED). Retention is a setting in your certificate account; CiV also stores a copy from the day it first sees a certificate.</div>
      </Card>
    </div>
  );
}
