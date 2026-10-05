'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSearch } from '@/api/queries';
import type { SearchHit } from '@/api/types';
import { Icon } from '@/components/ui/Icon';
import { useDrawer } from '@/state/DrawerContext';

const KIND_LABEL: Record<SearchHit['kind'], string> = { domain: 'Domain', metric: 'Metric', number: 'Number', vendor: 'Vendor', page: 'Page' };

/** Finds a domain, metric, phone number, vendor or page from anywhere in the portal. */
export function SearchBox() {
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const hits = useSearch(q);
  const router = useRouter();
  const { open } = useDrawer();

  function go(hit: SearchHit) {
    setQ('');
    if (hit.kind === 'number') router.push(`/numbers/${encodeURIComponent(hit.id)}`);
    else if (hit.kind === 'page') router.push(hit.id);
    else open(hit.kind, hit.id);
  }

  const show = focused && q.trim().length >= 2;
  return (
    <div className="relative min-w-0 max-w-[420px] flex-1">
      <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-txt-3" />
      <input type="search" role="combobox" aria-expanded={show} aria-controls="search-results" aria-label="Search" placeholder="Search domains, metrics, numbers, vendors…"
        className="field !pl-9" value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)} />
      {show && (
        <ul id="search-results" role="listbox" className="absolute inset-x-0 top-full z-40 m-0 mt-2 max-h-[360px] list-none overflow-y-auto rounded-xl border border-line bg-surface p-1.5 shadow-lg">
          {hits.data?.length === 0 && <li className="px-3 py-3 text-[12.5px] text-txt-2">Nothing matches “{q}”.</li>}
          {hits.data?.map((hit) => (
            <li key={`${hit.kind}-${hit.id}`} role="option" aria-selected="false">
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => go(hit)} className="flex w-full items-center gap-3 rounded-lg border-0 bg-transparent px-3 py-2 text-left text-[13px] text-txt hover:bg-surface-3">
                <span className="pill pill-gray w-[62px] justify-center">{KIND_LABEL[hit.kind]}</span>
                <span className="flex-1 truncate font-medium">{hit.label}</span>
                <span className="tiny">{hit.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
