import type { Revocation, RevocationCell } from '@/api/types';
import { Card } from '@/components/ui/Card';

// Tint and wording for one cell: hours to stop, NEVER, or not tested.
function reading(cell: RevocationCell, deadlineHours: number): { text: string; cls: string } {
  if (!cell.tested) return { text: 'Not tested', cls: 'b-n' };
  if (cell.hours === null) return { text: 'NEVER', cls: 'b-f' };
  const text = cell.hours < 1 ? `${Math.round(cell.hours * 60)} min` : `${cell.hours} h`;
  return { text, cls: cell.hours <= 6 ? 'b-a' : cell.hours <= 24 ? 'b-b' : cell.hours <= deadlineHours ? 'b-c' : 'b-d' };
}

/** Opt-out channel by system: how long each system took to stop contacting after a test opt-out. */
export function RevocationMatrix({ revocation }: { revocation: Revocation }) {
  return (
    <Card title="Opt-out test matrix" sub={`Median time to stop, by where the opt-out was sent and which system had to honour it · last ${revocation.windowDays} days`} flush>
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead>
            <tr><th>Opt-out sent by</th>{revocation.systems.map((s) => <th key={s.name}>{s.name}{!s.contacting && <span className="block normal-case tracking-normal text-txt-3">does not contact</span>}</th>)}</tr>
          </thead>
          <tbody>
            {revocation.rows.map((row) => (
              <tr key={row.channel}>
                <td className="font-semibold">{row.channel}</td>
                {row.cells.map((cell, i) => {
                  const r = reading(cell, 72);
                  const thin = cell.tested && cell.tests < revocation.minTestsPerCell;
                  return (
                    <td key={revocation.systems[i].name}>
                      <span className={`inline-block min-w-[86px] rounded-lg px-2.5 py-1.5 text-center font-display text-[12.5px] font-bold ${r.cls}`}>{r.text}</span>
                      {cell.tested && <span className="tiny ml-2 whitespace-nowrap">{cell.tests} tests{thin ? ' · too few' : ''}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="tiny m-0 px-[22px] pb-4 pt-1">NEVER = the system was still contacting the test number when the {revocation.deadlineBusinessDays}-business-day deadline passed. A cell needs {revocation.minTestsPerCell} tests before its figure is reported without the “too few” note.</p>
    </Card>
  );
}
