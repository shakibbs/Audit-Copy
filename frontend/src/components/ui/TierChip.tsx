import type { Tier } from '@/api/types';
import { TIER_LABEL } from '@/lib/format';

/** Evidence tier: who captured the record. Tier 1 (captured by CiV) is emphasised. */
export function TierChip({ tier }: { tier: Tier }) {
  return <span className={`tier ${tier === 1 ? 'tier-1' : ''}`} title={TIER_LABEL[tier]}>Tier {tier}</span>;
}
