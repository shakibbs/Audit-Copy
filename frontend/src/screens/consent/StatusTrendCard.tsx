import type { ConsentSummary } from '@/api/types';
import { Legend } from '@/components/charts/Legend';
import { StackedBar } from '@/components/charts/StackedBar';
import { Card } from '@/components/ui/Card';
import { STATUS_COLOR } from '@/lib/status';

/** The status mix for each of the last four months, one bar per month. */
export function StatusTrendCard({ consent }: { consent: ConsentSummary }) {
  return (
    <Card title="Mix by month" sub="Share of contacts in each status, %">
      <div className="flex flex-col gap-3">
        {consent.trend.map((t) => (
          <div key={t.label} className="flex items-center gap-3">
            <span className="mono w-8 text-[12px] text-txt-2">{t.label}</span>
            <div className="flex-1">
              <StackedBar legend={false} height={18} label={`${t.label} status mix`} segments={[
                { label: 'VERIFIED', value: t.verified, color: STATUS_COLOR.VERIFIED, display: `${t.verified}%` }, { label: 'WEAK', value: t.weak, color: STATUS_COLOR.WEAK, display: `${t.weak}%` },
                { label: 'CONFLICTING', value: t.conflicting, color: STATUS_COLOR.CONFLICTING, display: `${t.conflicting}%` }, { label: 'NO_PROOF', value: t.noProof, color: STATUS_COLOR.NO_PROOF, display: `${t.noProof}%` },
              ]} />
            </div>
            <span className="mono w-[86px] text-right text-[12px] font-semibold">{t.verified}% verified</span>
          </div>
        ))}
      </div>
      <div className="mt-4"><Legend items={(['VERIFIED', 'WEAK', 'CONFLICTING', 'NO_PROOF'] as const).map((s) => ({ label: s, color: STATUS_COLOR[s] }))} /></div>
    </Card>
  );
}
