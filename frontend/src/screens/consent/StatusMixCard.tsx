import type { ConsentSummary } from '@/api/types';
import { Donut } from '@/components/charts/Donut';
import { Card } from '@/components/ui/Card';
import { formatCount } from '@/lib/format';
import { STATUS_COLOR } from '@/lib/status';

/** Share of contacts in each consent status. */
export function StatusMixCard({ consent }: { consent: ConsentSummary }) {
  const verified = consent.mix.find((m) => m.status === 'VERIFIED');
  return (
    <Card title="Consent status mix" sub={`${formatCount(consent.contacts)} contacts this period`}>
      <div className="flex flex-wrap items-center gap-6">
        <Donut label="Consent status mix" centre={`${verified?.share.toFixed(0) ?? 0}%`} centreLabel="Verified"
          segments={consent.mix.map((m) => ({ label: m.status, value: m.count, color: STATUS_COLOR[m.status], display: `${m.share.toFixed(0)}%` }))} />
        <ul className="m-0 flex min-w-[220px] flex-1 list-none flex-col gap-2.5 p-0">
          {consent.mix.map((m) => (
            <li key={m.status} className="flex items-center gap-3 text-[12.5px]">
              <span className="h-2.5 w-2.5 flex-none rounded-[3px]" style={{ background: STATUS_COLOR[m.status] }} />
              <span className="flex-1"><span className="mono text-[11.5px] font-semibold">{m.status}</span><span className="tiny block">{m.note}</span></span>
              <span className="mono font-semibold">{formatCount(m.count)}</span>
              <span className="mono w-[38px] text-right text-txt-2">{m.share.toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
