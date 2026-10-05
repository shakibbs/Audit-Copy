'use client';

import type { Contact } from '@/api/types';
import { Empty } from '@/components/ui/Empty';
import { StatusChip } from '@/components/ui/StatusChip';
import { formatDateTime, formatTiers } from '@/lib/format';
import { useDrawer } from '@/state/DrawerContext';

/** Calls and texts, newest first. Selecting a row opens the contact panel. */
export function ContactTable({ contacts }: { contacts: Contact[] }) {
  const { open } = useDrawer();
  if (contacts.length === 0) return <Empty>No contacts match this filter.</Empty>;
  return (
    <div className="overflow-x-auto">
      <table className="tbl">
        <thead><tr><th>When (UTC)</th><th>Number</th><th>Channel</th><th>Category</th><th>Status</th><th>Reason</th><th>Flags from other domains</th><th>Evidence</th></tr></thead>
        <tbody>
          {contacts.map((c) => (
            <tr key={c.id} className="clickrow" onClick={() => open('contact', c.id)}>
              <td className="mono whitespace-nowrap text-[12px]">{formatDateTime(c.occurredAt)}</td>
              <td><button type="button" className="mono whitespace-nowrap border-0 bg-transparent p-0 text-[12.5px] font-semibold text-txt">{c.phoneDisplay}</button></td>
              <td>{c.channel}</td>
              <td className="text-txt-2">{c.category}</td>
              <td><StatusChip status={c.status} /></td>
              <td className="min-w-[220px]"><span className="mono text-[11px] text-txt-2">{c.code}</span><div className="tiny">{c.reasonText}</div></td>
              <td>{c.flags.length ? c.flags.map((f) => <span key={f} className="flag">{f}</span>) : <span className="text-txt-3">—</span>}</td>
              <td className="whitespace-nowrap text-[12px] text-txt-2">{formatTiers(c.tiers)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
