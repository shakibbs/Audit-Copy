'use client';

import { useAccessLog } from '@/api/queries';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { formatDateTime } from '@/lib/format';
import { ROLE_LABEL } from './roles';

/** Who viewed, changed or exported what, newest first. */
export function AccessLog() {
  const log = useAccessLog();
  return (
    <Card title="Access log" sub="Every view of an evidence file, every export and every change" flush>
      <Loader query={log}>
        {(entries) => (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>When (UTC)</th><th>Who</th><th>Role</th><th>Did</th><th>What</th></tr></thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={`${e.at}-${i}`}>
                    <td className="mono whitespace-nowrap text-[11.5px]">{formatDateTime(e.at)}</td>
                    <td className="font-semibold">{e.actor}</td><td className="text-txt-2">{ROLE_LABEL[e.role]}</td>
                    <td><span className="pill pill-gray">{e.action}</span></td><td>{e.object}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Loader>
    </Card>
  );
}
