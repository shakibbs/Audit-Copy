'use client';

import { useState } from 'react';
import { useLegalHolds, useSend } from '@/api/queries';
import type { LegalHold } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { formatDate } from '@/lib/format';

const BLANK = { scope: 'number' as LegalHold['scope'], target: '', reason: '' };

/** Freeze a number, a vendor or a date range so nothing is deleted while a dispute is open. */
export function LegalHolds() {
  const holds = useLegalHolds();
  const send = useSend();
  const [form, setForm] = useState(BLANK);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    send.mutate({ method: 'POST', path: '/legal-holds', body: form }, { onSuccess: () => setForm(BLANK) });
  }
  return (
    <Card title="Legal holds" sub="Records under a hold are kept past their retention date" flush>
      <form className="flex flex-wrap items-end gap-3 px-[22px] pb-4" onSubmit={submit}>
        <div><label className="label" htmlFor="lh-scope">Hold on</label>
          <select id="lh-scope" className="field !w-[140px]" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value as LegalHold['scope'] })}>
            <option value="number">A number</option><option value="vendor">A vendor</option><option value="date range">A date range</option>
          </select></div>
        <div className="min-w-[160px] flex-1"><label className="label" htmlFor="lh-target">Which one</label><input id="lh-target" className="field" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} /></div>
        <div className="min-w-[180px] flex-1"><label className="label" htmlFor="lh-reason">Reason</label><input id="lh-reason" className="field" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
        <button type="submit" className="btn btn-primary" disabled={!form.target.trim() || !form.reason.trim()}>Set hold</button>
      </form>
      <Loader query={holds}>
        {(list) => (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Hold on</th><th>Reason</th><th>Set by</th><th>Set</th><th>Status</th><th /></tr></thead>
              <tbody>
                {list.map((h) => (
                  <tr key={h.id}>
                    <td><span className="font-semibold">{h.target}</span><div className="tiny">{h.scope}</div></td>
                    <td>{h.reason}</td><td className="text-txt-2">{h.setBy}</td><td className="whitespace-nowrap">{formatDate(h.setOn)}</td>
                    <td>{h.releasedOn ? <span className="pill pill-gray">Released {formatDate(h.releasedOn)}</span> : <span className="pill pill-teal">Active</span>}</td>
                    <td className="text-right">{!h.releasedOn && <button type="button" className="btn btn-ghost btn-sm" onClick={() => send.mutate({ method: 'POST', path: `/legal-holds/${h.id}/release` })}>Release</button>}</td>
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
