'use client';

import { useDrawer } from '@/state/DrawerContext';

/** Three-letter domain code that opens the domain panel. */
export function DomainCode({ code }: { code: string }) {
  const { open } = useDrawer();
  return <button type="button" className="dcode" onClick={(e) => { e.stopPropagation(); open('domain', code); }} aria-label={`Open domain ${code}`}>{code}</button>;
}
