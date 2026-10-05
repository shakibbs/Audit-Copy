import type { ConsentStatus } from '@/api/types';

const CLASS: Record<ConsentStatus, string> = { VERIFIED: 'st-v', WEAK: 'st-w', CONFLICTING: 'st-c', NO_PROOF: 'st-n', PENDING: 'st-p' };

/** Consent status as a labelled chip; the label carries the meaning, the tint only supports it. */
export function StatusChip({ status }: { status: ConsentStatus }) {
  return <span className={`st ${CLASS[status]}`}>{status}</span>;
}
