'use client';

import { useState } from 'react';
import { useReadiness } from '@/api/queries';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { Seg } from '@/components/ui/Seg';
import { ChecklistTab } from './ChecklistTab';
import { ReadinessTab } from './ReadinessTab';

const TABS = [{ id: 'readiness', label: 'Readiness report' }, { id: 'checklist', label: 'Setup checklist' }] as const;

export function SetupScreen() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('readiness');
  const readiness = useReadiness();
  return (
    <>
      <PageHead eyebrow="Account" title="Setup & Readiness" sub="What your systems must supply for the audit to run, what the readiness test found, and what is still outstanding.">
        <Seg label="View" options={TABS} value={tab} onChange={setTab} />
      </PageHead>
      <Loader query={readiness}>{(r) => (tab === 'readiness' ? <ReadinessTab readiness={r} /> : <ChecklistTab readiness={r} />)}</Loader>
    </>
  );
}
