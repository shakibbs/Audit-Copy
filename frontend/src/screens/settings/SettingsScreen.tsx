'use client';

import { useState } from 'react';
import { useSession, useSettings } from '@/api/queries';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { Seg } from '@/components/ui/Seg';
import { AgreementsTab } from './AgreementsTab';
import { CompanyTab } from './CompanyTab';
import { NotificationsTab } from './NotificationsTab';
import { PlanTab } from './PlanTab';

const TABS = [{ id: 'company', label: 'Company' }, { id: 'notifications', label: 'Notifications' }, { id: 'plan', label: 'Plan & usage' }, { id: 'agreements', label: 'Agreements' }] as const;

export function SettingsScreen() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('company');
  const settings = useSettings();
  const session = useSession().data;
  return (
    <>
      <PageHead eyebrow="Account" title="Settings" sub="Company facts, email notifications, your plan and your agreements.">
        <Seg label="View" options={TABS} value={tab} onChange={setTab} />
      </PageHead>
      <Loader query={settings}>
        {(s) => (
          <>
            {tab === 'company' && session && <CompanyTab settings={s} session={session} />}
            {tab === 'notifications' && <NotificationsTab settings={s} />}
            {tab === 'plan' && <PlanTab settings={s} />}
            {tab === 'agreements' && <AgreementsTab settings={s} />}
          </>
        )}
      </Loader>
    </>
  );
}
