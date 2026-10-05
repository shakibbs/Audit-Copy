'use client';

import Link from 'next/link';
import type { Action } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { DomainCode } from '@/components/ui/DomainCode';
import { SeverityPill } from '@/components/ui/SeverityPill';
import { useDrawer } from '@/state/DrawerContext';

/** The three highest-ranked open actions. */
export function TopActions({ actions }: { actions: Action[] }) {
  const { open } = useDrawer();
  const top = actions.filter((a) => a.status !== 'resolved').slice(0, 3);
  return (
    <Card title="Do these first" sub="Highest-ranked open actions" flush right={<Link href="/actions" className="text-[12.5px] font-semibold">Full queue</Link>}>
      {top.map((a) => (
        <button key={a.id} type="button" className="row-item" onClick={() => open('action', a.id)}>
          <span className="rank">{a.rank}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-semibold">{a.title}</span>
            <span className="tiny block">{a.why}</span>
          </span>
          <span className="hidden items-center gap-2 sm:flex">
            <DomainCode code={a.domain} />
            <span className="pill pill-teal">{a.impact}</span>
            <SeverityPill severity={a.severity} />
          </span>
        </button>
      ))}
    </Card>
  );
}
