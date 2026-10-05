import type { Source, SourceStatus } from '@/api/types';
import { DomainCode } from '@/components/ui/DomainCode';
import { TierChip } from '@/components/ui/TierChip';

const STATUS: Record<SourceStatus, [string, string]> = { current: ['pill-green', 'Current'], stale: ['pill-amber', 'Stale'], not_supplied: ['pill-gray', 'Not supplied'], revoked: ['pill-red', 'Access revoked'] };
const ORDER: Record<SourceStatus, number> = { stale: 0, revoked: 0, not_supplied: 1, current: 2 };

/** Every source of data, with who captured it, how CiV reads it and how fresh it is. Items needing attention come first. */
export function SourceTable({ sources }: { sources: Source[] }) {
  const rows = [...sources].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  return (
    <div className="overflow-x-auto">
      <table className="tbl">
        <thead><tr><th>Source</th><th>Tier</th><th>Access</th><th>Last sync</th><th>Status</th><th>Feeds domains</th></tr></thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id}>
              <td><span className="font-semibold">{s.name}</span>{s.blocks && <div className="tiny">{s.blocks}</div>}</td>
              <td><TierChip tier={s.tier} /></td>
              <td className="text-txt-2">{s.access}{s.revocable && <div className="tiny">You can revoke this at any time</div>}</td>
              <td className="whitespace-nowrap">{s.lastSync}</td>
              <td><span className={`pill ${STATUS[s.status][0]}`}>{STATUS[s.status][1]}</span></td>
              <td><span className="flex flex-wrap gap-1">{s.feeds.map((d) => <DomainCode key={d} code={d} />)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
