'use client';

import { useRegChanges } from '@/api/queries';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { ChangeCard } from './ChangeCard';

export function RegulatoryScreen() {
  const changes = useRegChanges();
  return (
    <>
      <PageHead eyebrow="Engagement" title="Regulatory Changes" sub="Only the rule changes that touch your states, channels and settings. Stated as fact; how to respond is for you and your counsel." />
      <Loader query={changes}>
        {(list) => (
          <div className="flex flex-col gap-4">
            {[...list].sort((a, b) => Number(a.confirmed) - Number(b.confirmed) || b.date.localeCompare(a.date)).map((c) => <ChangeCard key={c.id} change={c} />)}
            <p className="tiny m-0">A rulebook setting changes only after counsel confirms the new value. Until then, checks that depend on it keep using the value in force, or do not run.</p>
          </div>
        )}
      </Loader>
    </>
  );
}
