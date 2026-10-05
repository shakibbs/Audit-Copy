import { BASIS_LABEL, type EvidenceFile } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { StatusChip } from '@/components/ui/StatusChip';
import { formatDateTime } from '@/lib/format';

/** Every contact to the number, oldest first, with opt-outs placed in sequence. */
export function ContactTimeline({ file }: { file: EvidenceFile }) {
  const events = [
    ...file.contacts.map((c) => ({ at: c.occurredAt, contact: c, optOut: null })),
    ...file.optOuts.map((o) => ({ at: o.at, contact: null, optOut: o })),
  ].sort((a, b) => a.at.localeCompare(b.at));
  return (
    <Card title="Timeline" sub="Contacts and opt-outs in order" flush>
      {events.map((e) => (
        <div key={e.at} className="row-item !items-start">
          <span className="mono w-[104px] flex-none pt-0.5 text-[11.5px] text-txt-2">{formatDateTime(e.at)}</span>
          {e.contact && (
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 text-[13px]"><span className="font-semibold">{e.contact.channel}</span>{e.contact.dialMode && <span className="text-txt-2">{e.contact.dialMode}</span>}<StatusChip status={e.contact.status} /><span className="mono text-[11px] text-txt-2">{e.contact.code}</span></div>
              <div className="tiny mt-1">{e.contact.bases.map((b) => BASIS_LABEL[b.basis]).join(' · ')}{e.contact.labels.map((l) => <span key={l} className="flag ml-2">{l}</span>)}</div>
            </div>
          )}
          {e.optOut && <div className="flex-1 text-[13px]"><span className="pill pill-orange mr-2">Opt-out received</span>{e.optOut.channel} · {e.optOut.method}</div>}
        </div>
      ))}
    </Card>
  );
}
