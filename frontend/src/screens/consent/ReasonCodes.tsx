import type { ConsentSummary } from '@/api/types';
import { BarList } from '@/components/charts/BarList';
import { Card } from '@/components/ui/Card';
import { formatCount } from '@/lib/format';

/** The most common reasons a contact was not VERIFIED. */
export function ReasonCodes({ consent }: { consent: ConsentSummary }) {
  return (
    <Card title="Most common reasons" sub="Contacts by primary reason code">
      <BarList labelWidth={260} rows={consent.reasons.map((r) => ({
        key: r.code, value: r.count, display: formatCount(r.count), hint: r.code,
        label: <span title={r.code}>{r.text}</span>,
      }))} />
    </Card>
  );
}
