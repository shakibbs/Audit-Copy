'use client';

import { useState } from 'react';
import { useSend } from '@/api/queries';
import type { Role } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { CLIENT_ROLES, ROLE_CAN, ROLE_LABEL } from './roles';

const BLANK = { name: '', email: '', role: 'read_only' as Role };

/** Invite a person and choose what they can see. */
export function InviteForm() {
  const [form, setForm] = useState(BLANK);
  const send = useSend();
  function submit(e: React.FormEvent) {
    e.preventDefault();
    send.mutate({ method: 'POST', path: '/users', body: form }, { onSuccess: () => setForm(BLANK) });
  }
  return (
    <Card title="Invite someone" sub="They receive an email with a link to set a password">
      <form className="flex flex-wrap items-end gap-3" onSubmit={submit}>
        <div className="min-w-[160px] flex-1"><label className="label" htmlFor="inv-name">Name</label><input id="inv-name" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="min-w-[200px] flex-1"><label className="label" htmlFor="inv-email">Email</label><input id="inv-email" type="email" required className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><label className="label" htmlFor="inv-role">Role</label>
          <select id="inv-role" className="field !w-[230px]" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
            {CLIENT_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select></div>
        <button type="submit" className="btn btn-primary" disabled={send.isPending}>Send invitation</button>
      </form>
      <p className="tiny mb-0 mt-3">{ROLE_LABEL[form.role]}: {ROLE_CAN[form.role]}.</p>
      {send.isError && <p className="mb-0 mt-2 text-[12.5px]" role="alert">{send.error.message}</p>}
    </Card>
  );
}
