'use client';

import { useState } from 'react';
import { useUsers } from '@/api/queries';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { Seg } from '@/components/ui/Seg';
import { AccessLog } from './AccessLog';
import { InviteForm } from './InviteForm';
import { UserTable } from './UserTable';

const TABS = [{ id: 'people', label: 'People' }, { id: 'log', label: 'Access log' }] as const;

export function UsersScreen() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('people');
  const users = useUsers();
  return (
    <>
      <PageHead eyebrow="Account" title="Users & Access" sub="Who can see this portal, what each person can do, and a record of what was viewed and exported.">
        <Seg label="View" options={TABS} value={tab} onChange={setTab} />
      </PageHead>
      {tab === 'log' ? <AccessLog /> : (
        <div className="flex flex-col gap-5">
          <InviteForm />
          <Loader query={users}>{(list) => <UserTable users={list} />}</Loader>
        </div>
      )}
    </>
  );
}
