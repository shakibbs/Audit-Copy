'use client';

import { useSend } from '@/api/queries';
import type { ReportType } from '@/api/types';
import { Icon } from '@/components/ui/Icon';

/** One downloadable report type with a request button. */
export function ReportCard({ report, period }: { report: ReportType; period: string }) {
  const send = useSend();
  return (
    <section className="card card-pad flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-[10px] bg-brand-soft text-brand-ink"><Icon name="file" size={18} /></span>
        <span className={`pill ${report.addOn ? 'pill-amber' : 'pill-gray'}`}>{report.format}</span>
      </div>
      <div>
        <h3 className="text-[14.5px]">{report.name}</h3>
        <p className="mb-0 mt-1.5 text-[12.5px] text-txt-2">{report.description}</p>
      </div>
      <button type="button" className="btn btn-ghost btn-sm mt-auto self-start" disabled={send.isPending || send.isSuccess}
        onClick={() => send.mutate({ method: 'POST', path: '/reports', body: { name: report.name, period } })}>
        <Icon name="download" size={14} /> {send.isSuccess ? 'Requested' : report.addOn ? 'Request a quote' : 'Generate'}
      </button>
    </section>
  );
}
