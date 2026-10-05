'use client';

import type { Action } from '@/api/types';
import { DomainCode } from '@/components/ui/DomainCode';
import { Empty } from '@/components/ui/Empty';
import { SeverityPill } from '@/components/ui/SeverityPill';
import { formatDate } from '@/lib/format';
import { useDrawer } from '@/state/DrawerContext';

const STATUS_LABEL: Record<Action['status'], [string, string]> = { open: ['pill-gray', 'Open'], in_progress: ['pill-blue', 'In progress'], resolved: ['pill-green', 'Resolved'] };

/** Ranked action rows. Selecting a row opens the action panel. */
export function ActionList({ actions }: { actions: Action[] }) {
  const { open } = useDrawer();
  if (actions.length === 0) return <Empty>No actions match this filter.</Empty>;
  return (
    <div className="overflow-x-auto">
      <table className="tbl">
        <thead><tr><th>#</th><th>Action</th><th>Severity</th><th>Domain</th><th>Who</th><th>Score impact</th><th>Assigned to</th><th>Due</th><th>Status</th></tr></thead>
        <tbody>
          {actions.map((a) => (
            <tr key={a.id} className="clickrow" onClick={() => open('action', a.id)}>
              <td><span className="rank">{a.rank}</span></td>
              <td className="min-w-[280px]">
                <button type="button" className="border-0 bg-transparent p-0 text-left text-[13px] font-semibold text-txt">{a.title}</button>
                <div className="tiny">{a.why}</div>
                {a.dispute && <span className="pill pill-amber mt-1">Finding contested</span>}
              </td>
              <td><SeverityPill severity={a.severity} /></td>
              <td><DomainCode code={a.domain} /></td>
              <td><span className={`pill ${a.owner === 'you' ? 'pill-teal' : 'pill-gray'}`}>{a.owner === 'you' ? 'You' : 'CiV'}</span></td>
              <td className="mono whitespace-nowrap font-semibold">{a.impact}</td>
              <td className="whitespace-nowrap">{a.assignee ?? <span className="text-txt-3">Unassigned</span>}</td>
              <td className="whitespace-nowrap">{a.due ? formatDate(a.due) : <span className="text-txt-3">No date</span>}{a.overdue && <span className="pill pill-red ml-2">Overdue</span>}</td>
              <td><span className={`pill ${STATUS_LABEL[a.status][0]}`}>{STATUS_LABEL[a.status][1]}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
