'use client';

import { INTERNAL_ROLES, type Session } from '@/api/types';
import { Icon } from '@/components/ui/Icon';
import { Freshness } from './Freshness';
import { PeriodSelect } from './PeriodSelect';
import { RunSelect } from './RunSelect';
import { SearchBox } from './SearchBox';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

/** Sticky bar above every page: search, freshness, period, theme and account. */
export function Topbar({ session, onMenu }: { session: Session; onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-bg/90 px-5 py-3 backdrop-blur lg:px-8">
      <button type="button" className="icon-btn lg:hidden" onClick={onMenu} aria-label="Open menu"><Icon name="menu" /></button>
      <SearchBox />
      <div className="ml-auto flex items-center gap-2.5">
        {session.sampleData && <span className="samplechip hidden md:inline-block">Sample data</span>}
        <Freshness updatedAt={session.updatedAt} />
        {INTERNAL_ROLES.includes(session.role) && <RunSelect runs={session.runs} />}
        <PeriodSelect periods={session.periods} />
        <ThemeToggle />
        <UserMenu session={session} />
      </div>
    </header>
  );
}
