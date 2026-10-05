'use client';

import { useState } from 'react';
import { useConsent } from '@/api/queries';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { Seg } from '@/components/ui/Seg';
import { ExpiryTab } from './ExpiryTab';
import { FiveChecks } from './FiveChecks';
import { LegalBasisCard } from './LegalBasisCard';
import { ReasonCodes } from './ReasonCodes';
import { StatusMixCard } from './StatusMixCard';
import { StatusTrendCard } from './StatusTrendCard';
import { WordingTab } from './WordingTab';

const TABS = [{ id: 'summary', label: 'Summary' }, { id: 'expiry', label: 'Certificate expiry' }, { id: 'wording', label: 'Wording catalogue' }] as const;

export function ConsentScreen() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('summary');
  const consent = useConsent();
  return (
    <>
      <PageHead eyebrow="Evidence" title="Consent Integrity" sub="Whether each contact had permission on record, and how strong that record is.">
        <Seg label="View" options={TABS} value={tab} onChange={setTab} />
      </PageHead>
      {tab === 'wording' ? <WordingTab /> : (
        <Loader query={consent}>
          {(c) => tab === 'expiry' ? <ExpiryTab consent={c} /> : (
            <div className="grid gap-5 lg:grid-cols-2">
              <StatusMixCard consent={c} />
              <StatusTrendCard consent={c} />
              <ReasonCodes consent={c} />
              <LegalBasisCard consent={c} />
              <div className="lg:col-span-2"><FiveChecks /></div>
            </div>
          )}
        </Loader>
      )}
    </>
  );
}
