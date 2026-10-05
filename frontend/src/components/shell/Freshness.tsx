'use client';

import Link from 'next/link';
import { useSources } from '@/api/queries';

/** "Updated 04:10 UTC" with a dot: green when every source is current, amber when one is stale. */
export function Freshness({ updatedAt }: { updatedAt: string }) {
  const sources = useSources();
  const stale = sources.data?.filter((s) => s.status === 'stale') ?? [];
  const time = new Date(updatedAt).toISOString().slice(11, 16);
  return (
    <Link href="/sources" className="hidden items-center gap-2 whitespace-nowrap text-[12px] text-txt-2 no-underline hover:no-underline xl:flex" title={stale.length ? `Stale: ${stale.map((s) => s.name).join(', ')}` : 'Every connected source is current'}>
      <span className="h-2 w-2 rounded-full" style={{ background: stale.length ? 'var(--warn)' : 'var(--ok)' }} />
      Updated {time} UTC{stale.length > 0 && <span className="font-semibold" style={{ color: 'var(--warn-ink)' }}> · {stale.length} source stale</span>}
    </Link>
  );
}
