'use client';

import { useSend } from '@/api/queries';
import type { Settings } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';

/** Which alerts are sent by email. Every alert always appears in the Alerts inbox. */
export function NotificationsTab({ settings }: { settings: Settings }) {
  const send = useSend();
  return (
    <Card title="Email notifications" sub="Every alert appears in the inbox; choose which are also emailed" flush>
      {settings.notifications.map((n) => (
        <div key={n.kind} className="row-item">
          <span className="flex-1 text-[13.5px] font-semibold">{n.label}</span>
          <span className="tiny">{n.email ? 'Emailed' : 'Inbox only'}</span>
          <Toggle label={`Email: ${n.label}`} checked={n.email} onChange={(email) => send.mutate({ method: 'PATCH', path: '/settings/email/notifications', body: { kind: n.kind, email } })} />
        </div>
      ))}
      <p className="tiny m-0 px-[22px] py-4">Slack and webhook delivery are planned for a later release.</p>
    </Card>
  );
}
