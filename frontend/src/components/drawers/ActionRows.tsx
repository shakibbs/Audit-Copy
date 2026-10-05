'use client';

import type { Action } from '@/api/types';
import { Empty } from '@/components/ui/Empty';
import { SeverityPill } from '@/components/ui/SeverityPill';
import { useDrawer } from '@/state/DrawerContext';

/** Linked actions inside a domain or metric panel. */
export function ActionRows({ actions }: { actions: Action[] }) {
  const { open } = useDrawer();
  if (actions.length === 0) return <Empty>No open actions are linked to this item.</Empty>;
  return (
    <div className="-mx-6">
      {actions.map((a) => (
        <button key={a.id} type="button" className="row-item" onClick={() => open('action', a.id)}>
          <span className="rank">{a.rank}</span>
          <span className="flex-1">
            <span className="block text-[13px] font-semibold">{a.title}</span>
            <span className="tiny">{a.impact} · {a.assignee ?? 'Unassigned'}</span>
          </span>
          <SeverityPill severity={a.severity} />
        </button>
      ))}
    </div>
  );
}
