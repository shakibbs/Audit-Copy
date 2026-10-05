import type { Revocation } from '@/api/types';
import { Card } from '@/components/ui/Card';

const mark = (ok: boolean | null) => ok === null ? <span className="pill pill-gray">Not tested</span> : ok ? <span className="pill pill-green">Honoured</span> : <span className="pill pill-red">Not honoured</span>;

/** Which opt-out wordings each system honoured in tests: keywords and plain sentences. */
export function WordingCoverage({ revocation }: { revocation: Revocation }) {
  const tested = revocation.wording.filter((w) => w.dialer !== null && w.messaging !== null);
  const both = tested.filter((w) => w.dialer && w.messaging).length;
  return (
    <Card title="Opt-out wording coverage" sub={`${both} of ${revocation.wording.length} wordings honoured by both systems`} flush>
      <table className="tbl">
        <thead><tr><th>Wording sent</th><th>Kind</th><th>Dialer</th><th>Messaging platform</th></tr></thead>
        <tbody>
          {revocation.wording.map((w) => (
            <tr key={w.phrase}>
              <td className="font-semibold">“{w.phrase}”</td>
              <td className="text-txt-2">{w.kind === 'keyword' ? 'Keyword' : 'Plain words'}</td>
              <td>{mark(w.dialer)}</td>
              <td>{mark(w.messaging)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
