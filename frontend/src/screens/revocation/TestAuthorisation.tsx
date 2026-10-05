import type { Revocation } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/format';

/** The signed authorisation that lets CiV send test opt-outs from its own numbers. */
export function TestAuthorisation({ revocation }: { revocation: Revocation }) {
  const a = revocation.authorisation;
  return (
    <Card title="Test authorisation" sub="CiV tests only with its own numbers, inside this window">
      <dl className="m-0">
        <div className="kv"><dt>Signed</dt><dd>{formatDate(a.signedOn)}</dd></div>
        <div className="kv"><dt>Test window</dt><dd>{formatDate(a.windowFrom)} – {formatDate(a.windowTo)}</dd></div>
        <div className="kv"><dt>Channels</dt><dd>{a.channels.join(', ')}</dd></div>
        <div className="kv"><dt>Tests run</dt><dd className="mono">{revocation.tests} in {revocation.windowDays} days</dd></div>
      </dl>
    </Card>
  );
}
