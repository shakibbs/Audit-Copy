'use client';

import { useSend } from '@/api/queries';
import type { Alert } from '@/api/types';
import { DomainCode } from '@/components/ui/DomainCode';
import { SeverityPill } from '@/components/ui/SeverityPill';
import { formatDateTime } from '@/lib/format';

/** One alert: what triggered it, when, and a way to mark it reviewed. */
export function AlertRow({ alert }: { alert: Alert }) {
  const send = useSend();
  return (
    <div className="row-item !items-start">
      <div className="pt-0.5"><SeverityPill severity={alert.severity} /></div>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-semibold">{alert.title}</div>
        <div className="mt-0.5 text-[12.5px] text-txt-2">{alert.detail}</div>
        <div className="tiny mt-1.5 flex flex-wrap items-center gap-2">
          <span>{alert.kind}</span><span>·</span><span>{formatDateTime(alert.at)} UTC</span><DomainCode code={alert.domain} />
          {alert.routedTo === 'legal' && <span className="pill pill-gray">Sent to legal users</span>}
        </div>
      </div>
      {alert.reviewed
        ? <span className="pill pill-green">Reviewed</span>
        : <button type="button" className="btn btn-ghost btn-sm" onClick={() => send.mutate({ method: 'POST', path: `/alerts/${alert.id}/review` })}>Mark as reviewed</button>}
    </div>
  );
}
