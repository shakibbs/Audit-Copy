import type { EvidenceFile } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { TierChip } from '@/components/ui/TierChip';
import { formatDateTime, truncateHash } from '@/lib/format';

/** The eight elements of proof for this number: present or not, who captured each, and its fingerprint. */
export function ProofElements({ file }: { file: EvidenceFile }) {
  const present = file.proofElements.filter((p) => p.present).length;
  return (
    <Card title="Proof elements" sub={`${present} of ${file.proofElements.length} present`} flush>
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>#</th><th>Element</th><th>On record</th><th>Source</th><th>Captured by</th><th>Captured (UTC)</th><th>Fingerprint</th></tr></thead>
          <tbody>
            {file.proofElements.map((p) => (
              <tr key={p.number}>
                <td className="mono text-txt-2">{p.number}</td>
                <td className="font-semibold">{p.element}</td>
                <td>{p.present === null ? <span className="pill pill-gray">Not measured</span> : p.present ? <span className="pill pill-green">Present</span> : <span className="pill pill-red">Not met</span>}</td>
                <td className="text-txt-2">{p.source ?? '—'}</td>
                <td>{p.tier ? <TierChip tier={p.tier} /> : '—'}</td>
                <td className="mono whitespace-nowrap text-[11.5px]">{formatDateTime(p.capturedAt)}</td>
                <td className="mono text-[11.5px]">{truncateHash(p.hash)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
