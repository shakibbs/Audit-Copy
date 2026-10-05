import type { ConsentSummary } from '@/api/types';
import { StackedBar } from '@/components/charts/StackedBar';
import { Card } from '@/components/ui/Card';
import { Info } from '@/components/ui/Info';
import { formatCount } from '@/lib/format';

/** Why proof was required: a legal basis, or CiV policy only. Also certificate validity. */
export function LegalBasisCard({ consent }: { consent: ConsentSummary }) {
  return (
    <Card title="Legal basis and certificates" sub="Why proof was required for each contact">
      <StackedBar label="Contacts by why proof is required" segments={[
        { label: 'A legal basis requires proof', value: consent.legalCount, color: 'var(--series-1)', display: `${formatCount(consent.legalCount)} · ${consent.legalShare}%` },
        { label: 'CiV policy only', value: consent.policyCount, color: 'var(--series-muted)', display: `${formatCount(consent.policyCount)} · ${100 - consent.legalShare}%` },
      ]} />
      <dl className="m-0 mt-4 border-t border-line pt-1">
        <div className="kv"><dt className="flex items-center gap-1.5">DNC status unknown <Info text="Contacts whose do-not-call status cannot be determined because DNC scrub records were not supplied." /></dt><dd className="mono">{consent.dncUnknownShare}%</dd></div>
        <div className="kv"><dt>Certificate validity</dt><dd><span className="mono">{consent.certificateValidity}%</span> <span className="font-normal text-txt-3">of {formatCount(consent.certificatePairs)} pairs</span></dd></div>
        <div className="kv"><dt>Certificates expired before the engagement</dt><dd className="mono">{formatCount(consent.expiredBeforeEngagement)}</dd></div>
      </dl>
    </Card>
  );
}
