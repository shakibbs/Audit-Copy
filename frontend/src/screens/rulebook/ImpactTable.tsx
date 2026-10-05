import type { ImpactRow } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { formatCount } from '@/lib/format';

/** CiV staff only: for each unsettled legal setting, how many contacts change status between the strict and lenient reading. */
export function ImpactTable({ impact }: { impact: ImpactRow[] }) {
  const top = Math.max(...impact.map((r) => r.changing));
  return (
    <Card title="Rulebook impact" sub="Internal view · contacts whose status differs between the strict and lenient reading" flush>
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>Setting</th><th>Counsel item</th><th>Strict reading</th><th>Lenient reading</th><th className="w-[260px]">Contacts that change status</th></tr></thead>
          <tbody>
            {impact.map((r) => (
              <tr key={r.key}>
                <td className="mono text-[12px] font-semibold">{r.key}</td>
                <td><span className="pill pill-gray">{r.counselItem}</span></td>
                <td>{r.strict}</td><td>{r.lenient}</td>
                <td>
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 flex-1 overflow-hidden rounded-[4px] bg-surface-3"><span className="block h-full rounded-r-[4px]" style={{ width: `${(r.changing / top) * 100}%`, background: 'var(--series-1)' }} /></span>
                    <span className="mono w-[110px] text-right text-[12px] font-semibold">{formatCount(r.changing)} · {((r.changing / r.contacts) * 100).toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
