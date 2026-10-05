'use client';

import { useSend } from '@/api/queries';
import type { RegChange } from '@/api/types';
import { DomainCode } from '@/components/ui/DomainCode';
import { MetricCode } from '@/components/ui/MetricCode';
import { formatDate } from '@/lib/format';

const STATUS_PILL: Record<RegChange['status'], string> = { adopted: 'pill-amber', 'in force': 'pill-teal', proposed: 'pill-gray', 'court ruling': 'pill-blue' };

/** One rule change: what it is, when it takes effect, and what it touches in this portal. */
export function ChangeCard({ change }: { change: RegChange }) {
  const send = useSend();
  return (
    <section className="card card-pad">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          <div className="mb-2 flex flex-wrap items-center gap-2"><span className={`pill ${STATUS_PILL[change.status]}`}>{change.status}</span><span className="tiny">{change.jurisdiction} · {formatDate(change.date)}</span></div>
          <h3 className="text-[15.5px]">{change.title}</h3>
          <p className="mb-0 mt-2 text-[13px] text-txt-2">{change.summary}</p>
        </div>
        {change.confirmed
          ? <span className="pill pill-green">Reviewed</span>
          : <button type="button" className="btn btn-ghost btn-sm" onClick={() => send.mutate({ method: 'POST', path: `/reg-changes/${change.id}/confirm` })}>Mark as reviewed</button>}
      </div>
      <dl className="m-0 mt-4 border-t border-line pt-1">
        <div className="kv"><dt>Takes effect</dt><dd>{change.effective}</dd></div>
        <div className="kv"><dt>Rulebook settings it touches</dt><dd className="flex flex-wrap justify-end gap-1">{change.settings.map((s) => <span key={s} className="flag mono">{s}</span>)}</dd></div>
        <div className="kv"><dt>Metrics and domains it touches</dt><dd className="flex flex-wrap justify-end gap-1">{change.metrics.map((m) => <MetricCode key={m} code={m} />)}{change.domains.map((d) => <DomainCode key={d} code={d} />)}</dd></div>
        <div className="kv"><dt>Source</dt><dd className="font-normal text-txt-2">{change.source}</dd></div>
      </dl>
    </section>
  );
}
