'use client';

import { useSend } from '@/api/queries';
import type { Role, User } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { formatDateTime } from '@/lib/format';
import { CLIENT_ROLES, ROLE_LABEL } from './roles';

/** Everyone with access, their role, and a way to change or remove it. */
export function UserTable({ users }: { users: User[] }) {
  const send = useSend();
  return (
    <Card title="People with access" sub={`${users.length} people`} flush>
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>Person</th><th>Role</th><th>Status</th><th>Last seen (UTC)</th><th /></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td><span className="font-semibold">{u.name}</span><div className="tiny mono">{u.email}</div></td>
                <td>
                  {u.role === 'owner' ? <span className="pill pill-teal">Owner</span> : (
                    <select aria-label={`Role for ${u.name}`} className="field !w-[220px] !py-1.5" value={u.role} onChange={(e) => send.mutate({ method: 'PATCH', path: `/users/${u.id}`, body: { role: e.target.value as Role } })}>
                      {CLIENT_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                    </select>
                  )}
                  {u.scope && <div className="tiny mt-1">{u.scope}</div>}
                </td>
                <td>{u.status === 'active' ? <span className="pill pill-green">Active</span> : <span className="pill pill-gray">Invited</span>}</td>
                <td className="mono whitespace-nowrap text-[11.5px]">{formatDateTime(u.lastSeen)}</td>
                <td className="text-right">{u.role !== 'owner' && <button type="button" className="btn btn-ghost btn-sm" onClick={() => send.mutate({ method: 'DELETE', path: `/users/${u.id}` })} aria-label={`Remove access for ${u.name}`}>Remove access</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
