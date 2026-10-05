'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSend } from '@/api/queries';
import type { EngagementMode, Role, Session } from '@/api/types';
import { Icon } from '@/components/ui/Icon';

const ROLE_LABEL: Record<Role, string> = {
  owner: 'Owner', legal: 'Legal', operations: 'Operations', read_only: 'Read-only', counsel_guest: 'Outside counsel (read-only)',
  admin: 'CiV admin', counsel: 'CiV counsel', engineer: 'CiV engineer',
};
const VIEW_ROLES: Role[] = ['owner', 'legal', 'operations', 'read_only', 'admin'];

/** Account menu: who is signed in, sign-out, and (sample data only) a way to see the portal as another role. */
export function UserMenu({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);
  const send = useSend();
  const viewAs = (body: { role?: Role; engagementMode?: EngagementMode }) => send.mutate({ method: 'POST', path: '/session/view-as', body });

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} aria-label="Account menu"
        className="flex items-center gap-2.5 rounded-[10px] border border-line bg-surface py-1 pl-1 pr-2.5 text-left hover:border-brand">
        <span className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-brand-soft font-display text-[11.5px] font-bold text-brand-ink">{session.initials}</span>
        <span className="hidden sm:block">
          <span className="block text-[12.5px] font-semibold leading-tight text-txt">{session.name}</span>
          <span className="block text-[10.5px] leading-tight text-txt-3">{ROLE_LABEL[session.role]}</span>
        </span>
        <Icon name="chevron-down" size={14} className="text-txt-3" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-[270px] rounded-xl border border-line bg-surface p-2 shadow-lg">
          <div className="px-3 py-2">
            <div className="text-[13px] font-semibold">{session.name}</div>
            <div className="tiny">{session.email}</div>
          </div>
          <Link role="menuitem" href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-txt no-underline hover:bg-surface-3 hover:no-underline"><Icon name="settings" /> Settings</Link>
          <Link role="menuitem" href="/users" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-txt no-underline hover:bg-surface-3 hover:no-underline"><Icon name="users" /> Users &amp; Access</Link>
          {session.sampleData && (
            <div className="mt-1 border-t border-line px-3 pb-2 pt-3">
              <div className="kpi-tag mb-2">Sample data · view as</div>
              <label className="label" htmlFor="view-role">Role</label>
              <select id="view-role" className="field !py-1.5" value={session.role} onChange={(e) => viewAs({ role: e.target.value as Role })}>
                {VIEW_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
              <label className="label mt-2.5" htmlFor="view-mode">Engagement mode</label>
              <select id="view-mode" className="field !py-1.5" value={session.engagementMode} onChange={(e) => viewAs({ engagementMode: e.target.value as EngagementMode })}>
                <option value="direct">Direct</option>
                <option value="counsel_directed">Counsel-directed</option>
              </select>
            </div>
          )}
          <button type="button" role="menuitem" onClick={() => send.mutate({ method: 'POST', path: '/session/sign-out' })}
            className="mt-1 flex w-full items-center gap-2.5 rounded-lg border-0 border-t border-line bg-transparent px-3 py-2 text-left text-[13px] text-txt hover:bg-surface-3"><Icon name="logout" /> Sign out</button>
        </div>
      )}
    </div>
  );
}
