'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useActions, useAlerts } from '@/api/queries';
import type { Session } from '@/api/types';
import { Icon } from '@/components/ui/Icon';
import { NAV } from './nav';

/** Fixed left menu: six groups, with counts on Action Queue and Alerts. */
export function Sidebar({ session, open, onNavigate }: { session: Session; open: boolean; onNavigate: () => void }) {
  const pathname = usePathname();
  const actions = useActions();
  const alerts = useAlerts();
  const counts = {
    actions: actions.data?.filter((a) => a.status !== 'resolved').length ?? 0,
    alerts: alerts.data?.filter((a) => !a.reviewed).length ?? 0,
  };

  return (
    <nav aria-label="Main" className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col text-[#c8d6d8] transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`} style={{ background: 'linear-gradient(180deg, #0e1a21, #0a2428)' }}>
      <div className="flex items-center gap-3 px-5 pb-4 pt-5">
        <span className="grid h-9 w-9 place-items-center rounded-[10px] font-display text-[13px] font-extrabold text-white" style={{ background: 'linear-gradient(135deg, #13b5a2, #0e8c7f)' }}>iV</span>
        <span>
          <span className="block font-display text-[15px] font-bold text-white">Comply iV</span>
          <span className="block text-[10.5px] uppercase tracking-[0.14em] text-[#7f9a9c]">Client portal</span>
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV.map((group) => (
          <div key={group.title} className="mt-4">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f8a8d]">{group.title}</div>
            {group.items.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              const count = item.badge ? counts[item.badge] : 0;
              return (
                <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={active ? 'page' : undefined}
                  className={`mb-0.5 flex items-center gap-3 rounded-[9px] px-3 py-2 text-[13px] font-medium no-underline hover:no-underline ${active ? 'bg-white/10 text-white' : 'text-[#c8d6d8] hover:bg-white/5 hover:text-white'}`}>
                  <Icon name={item.icon} size={16} className={active ? 'text-[#3fd6c4]' : 'text-[#7f9a9c]'} />
                  <span className="flex-1">{item.label}</span>
                  {count > 0 && <span className="rounded-full bg-[#c0531f] px-1.5 text-[10.5px] font-bold leading-[18px] text-white" aria-label={`${count} open`}>{count}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 px-5 py-4">
        <div className="truncate text-[12.5px] font-semibold text-white">{session.clientName}</div>
        <div className="mt-0.5 text-[11px] text-[#7f9a9c]">{session.plan} plan · {session.vertical}</div>
      </div>
    </nav>
  );
}
