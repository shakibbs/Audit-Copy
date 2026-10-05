import type { Settings } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/format';

/** Agreements and authorisations: status, date and what each covers. */
export function AgreementsTab({ settings }: { settings: Settings }) {
  return (
    <Card title="Agreements and authorisations" flush>
      <table className="tbl">
        <thead><tr><th>Document</th><th>Status</th><th>Date</th><th>Covers</th></tr></thead>
        <tbody>
          {settings.agreements.map((a) => (
            <tr key={a.name}>
              <td className="font-semibold">{a.name}</td>
              <td><span className={`pill ${a.status === 'signed' ? 'pill-green' : 'pill-amber'}`}>{a.status === 'signed' ? 'Signed' : 'Pending'}</span></td>
              <td className="whitespace-nowrap">{formatDate(a.date)}</td>
              <td className="text-txt-2">{a.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
