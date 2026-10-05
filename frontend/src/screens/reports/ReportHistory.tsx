import type { ReportRun } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { formatDateTime } from '@/lib/format';

/** Past and queued exports. */
export function ReportHistory({ runs }: { runs: ReportRun[] }) {
  return (
    <Card title="History" sub="Every export is recorded in the access log" flush>
      <table className="tbl">
        <thead><tr><th>Report</th><th>Period</th><th>Requested by</th><th>When (UTC)</th><th>Status</th></tr></thead>
        <tbody>
          {runs.map((r) => (
            <tr key={r.id}>
              <td className="font-semibold">{r.name}</td><td>{r.period}</td><td className="text-txt-2">{r.requestedBy}</td>
              <td className="mono whitespace-nowrap text-[11.5px]">{formatDateTime(r.at)}</td>
              <td>{r.status === 'ready' ? <span className="pill pill-green">Ready</span> : <span className="pill pill-blue">Queued</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
