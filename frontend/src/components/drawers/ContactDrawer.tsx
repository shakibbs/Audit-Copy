'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useContacts } from '@/api/queries';
import { BASIS_LABEL, type CheckState } from '@/api/types';
import { Drawer } from '@/components/ui/Drawer';
import { Seg } from '@/components/ui/Seg';
import { StatusChip } from '@/components/ui/StatusChip';
import { TierChip } from '@/components/ui/TierChip';
import { formatDateTime, truncateHash } from '@/lib/format';
import { CHECK_NAMES, STATUS_MEANING } from '@/lib/status';

const TABS = [{ id: 'result', label: 'Result' }, { id: 'evidence', label: 'Evidence' }, { id: 'definition', label: 'Definition' }] as const;
const CHECK_PILL: Record<CheckState, [string, string]> = { pass: ['pill-green', 'Pass'], fails: ['pill-red', 'Fails'], gap: ['pill-amber', 'Gap'], not_reached: ['pill-gray', 'Not reached'] };

/** Detail panel for one call or text: the five checks, the proof behind the status, and the link to the full evidence file. */
export function ContactDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('result');
  const contact = useContacts('ALL', '').data?.find((c) => c.id === id);
  if (!contact) return <Drawer eyebrow="Contact" title="Contact" onClose={onClose}><p className="tiny">Loading…</p></Drawer>;

  return (
    <Drawer eyebrow={`${contact.channel} · ${formatDateTime(contact.occurredAt)} UTC`} title={contact.phoneDisplay} onClose={onClose}>
      <Seg label="Sections" options={TABS} value={tab} onChange={setTab} />
      <div className="mt-5 flex flex-col gap-5">
        {tab === 'result' && (
          <>
            <div>
              <div className="flex items-center gap-2"><StatusChip status={contact.status} /><span className="mono text-[11.5px] text-txt-2">{contact.code}</span></div>
              <p className="mb-0 mt-2 text-[13px]">{contact.reasonText}</p>
            </div>
            <div>
              <div className="kpi-tag mb-2">The five checks</div>
              {contact.checks.map((state, i) => (
                <div key={CHECK_NAMES[i]} className="chk"><span>{i + 1}. {CHECK_NAMES[i]}</span><span className={`pill ${CHECK_PILL[state][0]}`}>{CHECK_PILL[state][1]}</span></div>
              ))}
            </div>
            <div>
              <div className="kpi-tag mb-2">Why proof is required</div>
              <div className="flex flex-wrap gap-1.5">{contact.bases.map((b) => <span key={b} className={`pill ${b === 'civ_policy' ? 'pill-gray' : 'pill-teal'}`}>{BASIS_LABEL[b]}</span>)}</div>
            </div>
          </>
        )}
        {tab === 'evidence' && (
          <dl className="m-0">
            <div className="kv"><dt>Proof</dt><dd>{contact.proof}</dd></div>
            <div className="kv"><dt>Captured by</dt><dd className="flex justify-end gap-1">{contact.tiers.length ? contact.tiers.map((t) => <TierChip key={t} tier={t} />) : '—'}</dd></div>
            <div className="kv"><dt>Record fingerprint</dt><dd className="mono">{truncateHash(contact.hash)}</dd></div>
            <div className="kv"><dt>Category</dt><dd>{contact.category}</dd></div>
            <div className="kv"><dt>Flags from other domains</dt><dd>{contact.flags.length ? contact.flags.map((f) => <span key={f} className="flag">{f}</span>) : 'None'}</dd></div>
          </dl>
        )}
        {tab === 'definition' && (
          <div className="text-[13px] leading-relaxed">
            <p className="mt-0"><strong>{contact.status}</strong> — {STATUS_MEANING[contact.status]}</p>
            <p className="mb-0 text-txt-2">Each contact is run through five checks in order. The first check that does not pass sets the status and the reason code.</p>
          </div>
        )}
        <Link href={`/numbers/${encodeURIComponent(contact.phoneE164)}`} onClick={onClose} className="btn btn-primary self-start no-underline hover:no-underline">Open the evidence file for this number</Link>
      </div>
    </Drawer>
  );
}
