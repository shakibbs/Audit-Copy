import type { Settings } from '@/api/types';
import { Columns } from '@/components/charts/Columns';
import { Meter } from '@/components/charts/Meter';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { formatCount } from '@/lib/format';

/** Current plan, numbers contacted this month against the plan limit, and the rule for moving up. */
export function PlanTab({ settings }: { settings: Settings }) {
  const u = settings.usage;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title={`${u.plan} plan`} sub={`${u.monthlyPrice} a month`}>
        <div className="font-display text-[34px] font-extrabold leading-none">{formatCount(u.used)} <span className="text-[15px] font-bold text-txt-2">of {formatCount(u.limit)} numbers</span></div>
        <div className="mt-3"><Meter label="Numbers contacted this month against the plan limit" value={u.used} limit={u.limit} /></div>
        <div className="tiny mt-2">{((u.used / u.limit) * 100).toFixed(0)}% of the plan limit used this month · {u.overLimitMonths} months over the limit</div>
        <p className="mb-0 mt-4 text-[13px] text-txt-2">{u.rule}{u.nextPlan ? ` The next plan up is ${u.nextPlan}.` : ''}</p>
        <button type="button" className="btn btn-ghost btn-sm mt-4"><Icon name="download" size={14} /> Download the list of billed numbers</button>
      </Card>
      <Card title="Numbers contacted by month" sub={`Plan limit ${formatCount(u.limit)}`}>
        <Columns label="Numbers contacted by month" height={170} limit={{ value: u.limit, label: `Limit ${formatCount(u.limit)}` }} columns={u.history.map((h) => ({ label: h.label, value: h.used, display: `${formatCount(h.used)} numbers` }))} />
      </Card>
    </div>
  );
}
