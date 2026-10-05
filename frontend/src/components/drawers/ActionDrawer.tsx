'use client';

import { useState } from 'react';
import { useActions, useSend, useSession, useUsers } from '@/api/queries';
import type { Action } from '@/api/types';
import { DomainCode } from '@/components/ui/DomainCode';
import { Drawer } from '@/components/ui/Drawer';
import { Seg } from '@/components/ui/Seg';
import { SeverityPill } from '@/components/ui/SeverityPill';
import { formatDate } from '@/lib/format';

const STATUSES = [{ id: 'open', label: 'Open' }, { id: 'in_progress', label: 'In progress' }, { id: 'resolved', label: 'Resolved' }] as const;

/** One action: the fix step, who owns it and by when, its status, and a note contesting the finding. */
export function ActionDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const action = useActions().data?.find((a) => a.id === id);
  const users = useUsers().data ?? [];
  const send = useSend();
  const session = useSession().data;
  const [note, setNote] = useState('');
  if (!action) return <Drawer eyebrow="Action" title="Action" onClose={onClose}><p className="tiny">Loading…</p></Drawer>;

  const patch = (body: Partial<Action>) => send.mutate({ method: 'PATCH', path: `/actions/${action.id}`, body });
  const byCiv = action.owner === 'we';
  return (
    <Drawer eyebrow={`Action ${action.rank} · ${byCiv ? 'CiV does this' : 'You do this'}`} title={action.title} onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityPill severity={action.severity} /><DomainCode code={action.domain} /><span className="pill pill-teal">{action.impact}</span>
          {action.overdue && <span className="pill pill-red">Overdue</span>}
        </div>
        <div>
          <div className="kpi-tag mb-1.5">What was measured</div>
          <p className="m-0 text-[13px]">{action.why}</p>
        </div>
        <div>
          <div className="kpi-tag mb-1.5">Fix step</div>
          <p className="m-0 text-[13px]">{action.fixStep}</p>
          <p className="tiny mb-0 mt-1.5">From the fix-step library. This describes a system change; it is not legal advice.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="assignee">Assigned to</label>
            <select id="assignee" className="field" disabled={byCiv} value={action.assignee ?? ''} onChange={(e) => patch({ assignee: e.target.value || null })}>
              <option value="">Unassigned</option>
              {byCiv && <option value={action.assignee ?? ''}>{action.assignee}</option>}
              {users.filter((u) => u.status === 'active').map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="due">Due date</label>
            <input id="due" type="date" className="field" value={action.due ?? ''} onChange={(e) => patch({ due: e.target.value || null })} />
          </div>
        </div>
        <div>
          <div className="label">Status</div>
          <Seg label="Status" options={STATUSES} value={action.status} onChange={(status) => patch({ status })} />
        </div>
        <div className="border-t border-line pt-4">
          <div className="kpi-tag mb-1.5">Contest this finding</div>
          {action.dispute ? (
            <div className="note-box">
              <strong>Contested by {action.dispute.by} on {formatDate(action.dispute.at)}.</strong> {action.dispute.note}
              <div className="mt-1.5">The original finding is kept and both are shown in reports.</div>
            </div>
          ) : (
            <>
              <label className="sr-only" htmlFor="dispute">Note contesting the finding</label>
              <textarea id="dispute" className="field min-h-[84px]" placeholder="Say what the measurement missed. The original finding is kept and both are shown." value={note} onChange={(e) => setNote(e.target.value)} />
              <button type="button" className="btn btn-ghost btn-sm mt-2" disabled={!note.trim()} onClick={() => patch({ dispute: { note: note.trim(), by: session?.name ?? 'You', at: '2026-09-30' } })}>Attach note</button>
            </>
          )}
        </div>
      </div>
    </Drawer>
  );
}
