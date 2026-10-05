'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from '@/api/queries';
import { DrawerProvider } from '@/state/DrawerContext';
import { PortalProvider } from '@/state/PortalContext';
import { Banners } from './Banners';
import { Disclaimer } from './Disclaimer';
import { DrawerHost } from './DrawerHost';
import { Locked } from './Locked';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

/** Frame around every signed-in page. Sends signed-out visitors to the sign-in page. */
export function PortalShell({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const signedOut = session.data ? !session.data.signedIn : false;

  useEffect(() => {
    if (signedOut) router.push('/sign-in');
  }, [signedOut, router]);

  if (session.isPending) return <div className="p-10 tiny" role="status">Loading…</div>;
  if (session.isError) return <div className="p-10 text-[13px]" role="alert">The portal could not be loaded. {session.error.message}</div>;
  if (signedOut) return null;

  const s = session.data;
  const locked = s.engagementMode === 'counsel_directed' && s.role === 'operations';
  return (
    <PortalProvider>
      <DrawerProvider>
        <Sidebar session={s} open={menuOpen} onNavigate={() => setMenuOpen(false)} />
        {menuOpen && <button type="button" aria-label="Close menu" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)} />}
        <div className="min-h-screen lg:pl-[248px]">
          <Topbar session={s} onMenu={() => setMenuOpen(true)} />
          <main className="mx-auto max-w-[1320px] px-5 pb-10 pt-7 lg:px-8">
            <Banners session={s} />
            {locked ? <Locked /> : children}
            <Disclaimer />
          </main>
        </div>
        <DrawerHost />
      </DrawerProvider>
    </PortalProvider>
  );
}
