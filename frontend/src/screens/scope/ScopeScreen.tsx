'use client';

import { useSession, useSettings } from '@/api/queries';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import { PageHead } from '@/components/ui/PageHead';
import { formatDate } from '@/lib/format';

const COLUMNS: { title: string; icon: IconName; items: string[] }[] = [
  { title: 'Comply iV does', icon: 'check', items: ['Measures every contact against the rulebook in force on its date', 'Captures consent pages and runs live opt-out tests', 'Fingerprints, stores and anchors every record', 'Reports findings as measurements'] },
  { title: 'You decide', icon: 'target', items: ['Whom to call and text, and when', 'Which fixes to make and in what order', 'What to raise with vendors', 'Which lists and records to supply'] },
  { title: 'Comply iV never', icon: 'x', items: ['Blocks, dials or scrubs on your behalf', 'Sells or maintains DNC or litigator lists', 'Contacts your customers or vendors', 'States legal conclusions'] },
];

export function ScopeScreen() {
  const session = useSession().data;
  const notice = useSettings().data?.agreements.find((a) => a.name === 'Notice about alerts');
  const counselDirected = session?.engagementMode === 'counsel_directed';
  return (
    <>
      <PageHead eyebrow="Engagement" title="Scope & Boundaries" sub="Who does what. CiV measures and records; every decision stays with you." />
      <div className="flex flex-col gap-5">
        <div className="grid gap-5 lg:grid-cols-3">
          {COLUMNS.map((col) => (
            <Card key={col.title} title={col.title}>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {col.items.map((item) => <li key={item} className="flex gap-2.5 text-[13px]"><Icon name={col.icon} size={15} className="mt-0.5 text-txt-3" />{item}</li>)}
              </ul>
            </Card>
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Engagement mode">
            <dl className="m-0">
              <div className="kv"><dt>Current mode</dt><dd>{counselDirected ? 'Counsel-directed' : 'Direct engagement'}</dd></div>
              <div className="kv"><dt>Findings and alerts go to</dt><dd>{counselDirected ? 'Legal users only' : 'Your team'}</dd></div>
            </dl>
            <p className="tiny mb-0 mt-3">Counsel-directed option: your counsel engages and directs Comply iV, and findings and alerts go to counsel only. This may strengthen work-product protection; whether it applies is for a court to decide.</p>
          </Card>
          <Card title="Notice">
            <dl className="m-0"><div className="kv"><dt>Acknowledged</dt><dd>{notice?.date ? formatDate(notice.date) : '—'}</dd></div></dl>
            <p className="mb-0 mt-3 text-[13px] text-txt-2">Alerts put your company on notice. Acting on them, or discussing them with counsel, is your decision.</p>
          </Card>
        </div>
      </div>
    </>
  );
}
