'use client';

import { useConsentPages, useSend } from '@/api/queries';
import type { ConsentPage } from '@/api/types';
import { Loader } from '@/components/ui/Loader';
import { Seg } from '@/components/ui/Seg';
import { formatCount, formatDate } from '@/lib/format';

const MARKS = [{ id: 'approved', label: 'Approved' }, { id: 'unmarked', label: 'Not marked' }, { id: 'rejected', label: 'Rejected' }] as const;

/** Every consent wording captured on your pages and your vendors' pages, with your own approve or reject mark. */
export function WordingTab() {
  const pages = useConsentPages();
  const send = useSend();
  const mark = (page: ConsentPage, value: ConsentPage['mark']) => send.mutate({ method: 'PATCH', path: `/consent-pages/${page.id}`, body: { mark: value } });
  return (
    <Loader query={pages}>
      {(list) => (
        <div className="flex flex-col gap-4">
          {list.map((p) => (
            <section key={p.id} className="card card-pad">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mono text-[13px] font-semibold">{p.url}</div>
                  <div className="tiny mt-1">{p.owner === 'yours' ? 'Your page' : p.vendor} · first seen {formatDate(p.firstSeen)} · last seen {formatDate(p.lastSeen)} · {formatCount(p.leads)} leads</div>
                </div>
                <Seg label={`Your mark for ${p.url}`} options={MARKS} value={p.mark} onChange={(v) => mark(p, v)} />
              </div>
              <blockquote className="m-0 mt-3 rounded-[10px] border-l-[3px] border-line bg-surface-3 px-4 py-3 text-[12.5px] leading-relaxed text-txt-2">{p.wording}</blockquote>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`pill ${p.checklistPassed === p.checklistTotal ? 'pill-green' : 'pill-amber'}`}>Checklist {p.checklistPassed} of {p.checklistTotal}</span>
                {p.changedOn && <span className="pill pill-orange">Changed {formatDate(p.changedOn)}</span>}
                {p.missing.map((m) => <span key={m} className="flag">Missing: {m}</span>)}
              </div>
            </section>
          ))}
          <p className="tiny m-0">Your mark records your own decision about a wording. It does not change the checklist result and is not a legal opinion from CiV.</p>
        </div>
      )}
    </Loader>
  );
}
