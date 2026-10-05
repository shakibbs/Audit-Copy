# Frontend Portal — Part C: Overview, Contacts, Metrics (Module 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first three screens of the prototype — Overview, Contacts (with the contact-detail panel and its five checks) and Metrics — on top of the shell and mock API from Part B.

**Architecture:** Each screen is a client component in `src/screens/` that reads data through the query hooks and renders with the shared components. Each `src/app/(portal)/**/page.tsx` is a one-line wrapper, so screens are tested with `renderWithProviders` and no router.

**Tech Stack:** as Part A. **Prerequisite:** [Part B](2026-10-03-01b-portal-data-and-shell.md) complete. **No git steps.**

**Design reference:** the `isOverview`, `isContacts` and `isMetrics` blocks of [../design-reference/portal-prototype.dc.html](../design-reference/portal-prototype.dc.html). All paths are under `frontend/`.

---

### Task C1: Overview

**Files:**
- Create: `src/screens/Overview.tsx`, `src/screens/overview/ScoreTile.tsx`, `src/screens/overview/StatusMix.tsx`, `src/screens/overview/FamilyScores.tsx`, `src/screens/overview/AlertList.tsx`
- Modify: `src/app/(portal)/page.tsx`
- Test: `tests/screens/Overview.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import { Overview } from '@/screens/Overview';

describe('Overview', () => {
  it('shows the score tile with grade, cap note and checkpoints', async () => {
    renderWithProviders(<Overview />);
    expect(await screen.findByText('81.3')).toBeInTheDocument();
    expect(screen.getByLabelText('Grade C')).toBeInTheDocument();
    expect(screen.getByText('Grade capped at C: 11.2% of legal-basis contacts are NO_PROOF or CONFLICTING (cap at 10%).')).toBeInTheDocument();
    expect(screen.getByText('812 of 1,132 checkpoints ran')).toBeInTheDocument();
  });

  it('shows the three headline metrics', async () => {
    renderWithProviders(<Overview />);
    expect(await screen.findByText('M22a Proof Completeness')).toBeInTheDocument();
    expect(screen.getByText('56.0%')).toBeInTheDocument();
    expect(screen.getByText('M22b Conduct Pass Rate')).toBeInTheDocument();
    expect(screen.getByText('93.0%')).toBeInTheDocument();
    expect(screen.getByText('M01 Consent Coverage')).toBeInTheDocument();
    expect(screen.getByText('88.0%')).toBeInTheDocument();
  });

  it('shows the consent status mix with counts and the policy-only share', async () => {
    renderWithProviders(<Overview />);
    const card = (await screen.findByRole('heading', { name: 'Consent status of every contact' })).closest('section')!;
    expect(within(card).getByText('10,000 contacts this period')).toBeInTheDocument();
    expect(within(card).getByText('76.0%')).toBeInTheDocument();
    expect(within(card).getByText('7,600 contacts')).toBeInTheDocument();
    expect(within(card).getByText('500 contacts; 40% CiV policy only')).toBeInTheDocument();
  });

  it('shows family scores and the note about client-supplied list domains', async () => {
    renderWithProviders(<Overview />);
    const row = (await screen.findByText('Stopping')).closest('div')!;
    expect(row).toHaveTextContent('62.0');
    expect(screen.getByText(/never enter the overall score/)).toBeInTheDocument();
  });

  it('lists alerts with the notice statement', async () => {
    renderWithProviders(<Overview />);
    expect(await screen.findByText('14 contacts after opt-out across 9 numbers')).toBeInTheDocument();
    expect(screen.getByText('Dialer connector not synced for 52 hours')).toBeInTheDocument();
    expect(screen.getByText('Alerts put your company on notice. Act on them or discuss them with counsel.')).toBeInTheDocument();
  });

  it('in counsel-directed mode shows a non-legal role only alerts routed to all', async () => {
    renderWithProviders(<Overview />, { session: { role: 'owner', engagementMode: 'counsel_directed' } });
    expect(await screen.findByText('Dialer connector not synced for 52 hours')).toBeInTheDocument();
    expect(screen.queryByText('14 contacts after opt-out across 9 numbers')).not.toBeInTheDocument();
    expect(screen.getByText('3 alerts routed to counsel only.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/screens/Overview.test.tsx`
Expected: FAIL — cannot resolve `@/screens/Overview`.

- [ ] **Step 3: Write the Overview's four pieces and the screen, one file each**

`src/screens/overview/ScoreTile.tsx`:
```tsx
import type { Score } from '@/api/types';
import { formatCount, formatScore } from '@/lib/format';

export function ScoreTile({ score }: { score: Score }) {
  return (
    <div className="flex flex-col gap-2 rounded-card bg-ink-deep p-5 text-canvas">
      <span className="text-xs uppercase tracking-[0.6px] text-[#BFD3D0]">Overall score</span>
      <div className="flex items-baseline gap-3">
        <span className="font-display text-5xl font-semibold leading-none">{formatScore(score.overall)}</span>
        {score.grade && <span aria-label={`Grade ${score.grade}`} className="rounded-lg bg-canvas px-2.5 py-0.5 text-[22px] font-semibold text-ink-deep">{score.grade}</span>}
      </div>
      {score.hardCap && (
        <span className="text-[12.5px] leading-[1.45] text-[#DDE7E5]">
          Grade capped at {score.hardCap.cappedGrade}: {score.hardCap.share}% of legal-basis contacts are NO_PROOF or CONFLICTING (cap at {score.hardCap.capShare}%).
        </span>
      )}
      {score.provisional && <span className="text-[12.5px] text-[#DDE7E5]">Provisional: fewer than the expected sources are connected.</span>}
      <span className="text-xs text-[#BFD3D0]">{formatCount(score.checkpointsRun)} of {formatCount(score.checkpointsTotal)} checkpoints ran</span>
    </div>
  );
}
```

`src/screens/overview/StatusMix.tsx`:
```tsx
import type { ConsentStatus, MetricSnapshot } from '@/api/types';
import { StatusChip } from '@/components/StatusChip';
import { formatCount, formatPercent } from '@/lib/format';
import { statusTone } from '@/lib/tone';

const ORDER: ConsentStatus[] = ['VERIFIED', 'WEAK', 'CONFLICTING', 'NO_PROOF'];

/** The stacked bar and the four status columns, from M02's breakdown. */
export function StatusMix({ mix, contacts }: { mix: MetricSnapshot; contacts: number }) {
  const policyShare = mix.breakdown.no_proof_policy_only_share;
  return (
    <>
      <div className="flex h-[18px] overflow-hidden rounded-md">
        {ORDER.map((s) => <div key={s} className={statusTone(s).bar} style={{ width: `${mix.breakdown[s] ?? 0}%` }} />)}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {ORDER.map((s) => {
          const pct = mix.breakdown[s] ?? 0;
          const count = `${formatCount(Math.round((pct / 100) * contacts))} contacts`;
          return (
            <div key={s} className="flex flex-col gap-1">
              <StatusChip status={s} />
              <span className="text-[22px] font-semibold">{formatPercent(pct)}</span>
              <span className="text-xs leading-[1.4] text-muted">
                {s === 'NO_PROOF' && policyShare !== undefined ? `${count}; ${policyShare}% CiV policy only` : count}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
```

`src/screens/overview/FamilyScores.tsx`:
```tsx
import type { Score } from '@/api/types';
import { formatScore } from '@/lib/format';

export function FamilyScores({ score }: { score: Score }) {
  return (
    <div className="flex flex-col gap-2.5 border-t border-line-soft pt-2">
      <h3 className="m-0 text-sm font-semibold">Domain scores</h3>
      {score.families.map((f) => (
        <div key={f.family} className="flex items-center gap-3">
          <span className="w-[150px] text-[13.5px]">{f.family}</span>
          <div className="h-2 grow overflow-hidden rounded bg-line-soft">
            <div className="h-2 bg-accent" style={{ width: `${f.score ?? 0}%` }} />
          </div>
          <span className="w-12 text-right text-[13.5px] font-semibold">{f.score === null ? '—' : formatScore(f.score)}</span>
        </div>
      ))}
      <span className="text-xs text-muted">DNC and litigator domains run on client-supplied lists and are shown separately; they never enter the overall score.</span>
    </div>
  );
}
```

`src/screens/overview/AlertList.tsx`:
```tsx
'use client';

import type { Alert } from '@/api/types';
import { Card } from '@/components/Card';
import { SeverityChip } from '@/components/SeverityChip';
import { useSession } from '@/state/SessionContext';

export function AlertList({ alerts }: { alerts: Alert[] }) {
  const { role, engagementMode } = useSession();
  // In counsel-directed mode, findings-related alerts go only to counsel.
  const counselOnly = engagementMode === 'counsel_directed' && role !== 'legal' && role !== 'counsel';
  const visible = counselOnly ? alerts.filter((a) => a.routedTo === 'all') : alerts;
  const hidden = alerts.length - visible.length;
  return (
    <Card title="Alerts">
      {visible.map((a) => (
        <div key={a.alertId} className="flex flex-col gap-1 rounded-[10px] bg-canvas p-3">
          <SeverityChip severity={a.severity} />
          <span className="text-[13.5px] font-medium leading-[1.4]">{a.title}</span>
          <span className="text-xs text-muted">{a.when}</span>
        </div>
      ))}
      {hidden > 0 && <span className="text-xs text-warn-fg">{hidden} alert{hidden === 1 ? '' : 's'} routed to counsel only.</span>}
      <span className="text-xs leading-[1.45] text-muted">Alerts put your company on notice. Act on them or discuss them with counsel.</span>
    </Card>
  );
}
```

`src/screens/Overview.tsx`:
```tsx
'use client';

import { useAlerts, useMetrics, useScore } from '@/api/queries';
import { Card } from '@/components/Card';
import { NotMeasured } from '@/components/NotMeasured';
import { StatTile } from '@/components/StatTile';
import { formatCount } from '@/lib/format';
import { useRunContext } from '@/state/RunContext';
import { useSession } from '@/state/SessionContext';
import { AlertList } from './overview/AlertList';
import { FamilyScores } from './overview/FamilyScores';
import { ScoreTile } from './overview/ScoreTile';
import { StatusMix } from './overview/StatusMix';

const HEADLINE = ['M22a', 'M22b', 'M01'];

export function Overview() {
  const { clientId } = useSession();
  const { selectedRun } = useRunContext();
  const runId = selectedRun?.runId ?? null;
  const score = useScore(clientId, runId);
  const metrics = useMetrics(clientId, runId);
  const alerts = useAlerts(clientId);

  if (score.isPending || metrics.isPending || alerts.isPending) return <p className="text-muted">Loading…</p>;
  if (!score.data || !metrics.data || !alerts.data) return <p className="text-muted">The overview could not be loaded.</p>;

  const byCode = new Map(metrics.data.map((x) => [x.metricCode, x]));
  const mix = byCode.get('M02');

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        <ScoreTile score={score.data} />
        {HEADLINE.map((code) => {
          const metric = byCode.get(code);
          if (!metric) return null;
          return (
            <StatTile
              key={code}
              label={`${metric.metricCode} ${metric.name}`}
              value={metric.missingReason ? <NotMeasured /> : metric.display}
              note={metric.missingReason ?? metric.detail ?? metric.note}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card title="Consent status of every contact" aside={`${formatCount(score.data.contactsInPeriod)} contacts this period`} className="col-span-2">
          {mix && <StatusMix mix={mix} contacts={score.data.contactsInPeriod} />}
          <FamilyScores score={score.data} />
        </Card>
        <AlertList alerts={alerts.data} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Replace `src/app/(portal)/page.tsx`**

```tsx
import { Overview } from '@/screens/Overview';

export default function Page() {
  return <Overview />;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/screens/Overview.test.tsx`
Expected: PASS (6 tests).

---

### Task C2: Contacts list with status filters

**Files:**
- Create: `src/screens/Contacts.tsx`, `src/screens/ContactDetail.tsx` (empty state only in this task), `src/app/(portal)/contacts/page.tsx`
- Test: `tests/screens/Contacts.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../utils';
import { Contacts } from '@/screens/Contacts';

const rows = () => screen.getAllByTestId('contact-row');

describe('Contacts list', () => {
  it('lists every contact with time, number, channel, category, basis, status and code', async () => {
    renderWithProviders(<Contacts />);
    expect(await screen.findAllByTestId('contact-row')).toHaveLength(10);
    const first = rows()[0];
    expect(first).toHaveTextContent('Sep 29, 14:02');
    expect(first).toHaveTextContent('(602) •••-4471');
    expect(first).toHaveTextContent('Marketing robocall (written)');
    expect(within(first).getByText('VERIFIED')).toBeInTheDocument();
    expect(first).toHaveTextContent('VF_OK');
    // The total comes from the score query, which may resolve after the rows: wait for it.
    expect(await screen.findByText("A number's result is its worst contact status in the period. Showing 10 of 10,000 contacts.")).toBeInTheDocument();
  });

  it('shows every basis when a contact carries more than one', async () => {
    renderWithProviders(<Contacts />);
    await screen.findAllByTestId('contact-row');
    const multi = screen.getByText('(602) •••-1198').closest('[data-testid="contact-row"]')!;
    expect(multi).toHaveTextContent('Marketing robocall (written)');
    expect(multi).toHaveTextContent('Number on DNC scrub list');
  });

  it('filters by status and marks the active filter', async () => {
    renderWithProviders(<Contacts />);
    await screen.findAllByTestId('contact-row');
    await userEvent.click(screen.getByRole('button', { name: 'WEAK' }));
    expect(screen.getByRole('button', { name: 'WEAK' })).toHaveAttribute('aria-pressed', 'true');
    await screen.findByText('Showing 2 of 10,000 contacts.', { exact: false });
    expect(rows()).toHaveLength(2);
    await userEvent.click(screen.getByRole('button', { name: 'All' }));
    await screen.findByText('Showing 10 of 10,000 contacts.', { exact: false });
  });

  it('shows the empty detail panel until a contact is selected', async () => {
    renderWithProviders(<Contacts />);
    await screen.findAllByTestId('contact-row');
    expect(screen.getByText('Select a contact to see the five consent checks, the proof used, its source tier and the evidence hash.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/screens/Contacts.test.tsx`
Expected: FAIL — cannot resolve `@/screens/Contacts`.

- [ ] **Step 3: Write `src/screens/ContactDetail.tsx`** (empty state now; the detail body is added in Task C3)

```tsx
'use client';

import type { ContactRow } from '@/api/types';

export function ContactDetail({ contact }: { contact: ContactRow | null }) {
  return (
    <aside className="flex w-[320px] shrink-0 flex-col gap-3.5 rounded-card border border-line bg-surface p-5">
      {contact === null && (
        <div className="flex flex-col gap-2 px-1 py-6">
          <span className="font-display text-lg font-semibold">Contact detail</span>
          <span className="text-[13px] leading-normal text-muted">Select a contact to see the five consent checks, the proof used, its source tier and the evidence hash.</span>
        </div>
      )}
    </aside>
  );
}
```

- [ ] **Step 4: Write `src/screens/Contacts.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useContacts, useScore } from '@/api/queries';
import { BASIS_LABEL, type ConsentStatus } from '@/api/types';
import { PageHeading } from '@/components/PageHeading';
import { StatusChip } from '@/components/StatusChip';
import { formatCount, formatDateTime } from '@/lib/format';
import { useRunContext } from '@/state/RunContext';
import { useSession } from '@/state/SessionContext';
import { ContactDetail } from './ContactDetail';

const FILTERS: { id: ConsentStatus | null; label: string }[] = [
  { id: null, label: 'All' }, { id: 'VERIFIED', label: 'VERIFIED' }, { id: 'WEAK', label: 'WEAK' },
  { id: 'CONFLICTING', label: 'CONFLICTING' }, { id: 'NO_PROOF', label: 'NO_PROOF' },
];
// Column widths chosen so all seven fit beside the detail panel on a 1440 px screen.
const COLS = 'grid grid-cols-[96px_112px_56px_92px_124px_104px_minmax(0,1fr)] gap-2';

export function Contacts() {
  const { clientId } = useSession();
  const { selectedRun } = useRunContext();
  const runId = selectedRun?.runId ?? null;
  const [filter, setFilter] = useState<ConsentStatus | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const contacts = useContacts(clientId, runId, filter);
  const score = useScore(clientId, runId);

  const rows = contacts.data ?? [];
  const selected = rows.find((r) => r.eventId === selectedId) ?? null;
  const total = score.data ? formatCount(score.data.contactsInPeriod) : '—';

  return (
    <div className="flex items-start gap-5">
      <section className="flex min-w-0 grow flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <PageHeading title="Contacts" />
          <div className="flex gap-2">
            {FILTERS.map((f) => {
              const on = filter === f.id;
              return (
                <button
                  key={f.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => { setFilter(f.id); setSelectedId(null); }}
                  className={`h-9 cursor-pointer rounded-full border px-3 text-[12.5px] font-medium ${on ? 'border-ink-deep bg-ink-deep text-white' : 'border-control bg-surface text-ink'}`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="overflow-hidden rounded-card border border-line bg-surface">
          <div className={`${COLS} border-b border-line-soft px-4 py-3 text-[11.5px] uppercase tracking-[0.5px] text-muted`}>
            <span>Time</span><span>Number</span><span>Channel</span><span>Category</span><span>Proof needed</span><span>Status</span><span>Primary reason</span>
          </div>
          {contacts.isPending && <p className="px-4 py-3 text-muted">Loading…</p>}
          {rows.map((r) => (
            <button
              key={r.eventId}
              type="button"
              data-testid="contact-row"
              aria-pressed={selectedId === r.eventId}
              onClick={() => setSelectedId(r.eventId)}
              className={`${COLS} min-h-12 w-full cursor-pointer items-center border-0 border-b border-line-soft px-4 text-left text-[13px] text-ink ${selectedId === r.eventId ? 'bg-selected' : 'bg-surface'}`}
            >
              <span>{formatDateTime(r.occurredAtUtc)}</span>
              <span className="font-mono text-[12.5px]">{r.phoneDisplay}</span>
              <span>{r.channel}</span>
              <span>{r.category}</span>
              <span className="flex flex-col text-[12.5px] text-ink-2">{r.bases.map((b) => <span key={b}>{BASIS_LABEL[b]}</span>)}</span>
              <span><StatusChip status={r.status} /></span>
              <span className="break-all font-mono text-xs text-ink-2">{r.primaryReasonCode}</span>
            </button>
          ))}
        </div>
        <span className="text-xs text-muted">A number&apos;s result is its worst contact status in the period. Showing {rows.length} of {total} contacts.</span>
      </section>
      <ContactDetail contact={selected} />
    </div>
  );
}
```

- [ ] **Step 5: Write `src/app/(portal)/contacts/page.tsx`**

```tsx
import { Contacts } from '@/screens/Contacts';

export default function Page() {
  return <Contacts />;
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/screens/Contacts.test.tsx`
Expected: PASS (4 tests).

---

### Task C3: Contact detail — the five checks, proof and evidence

**Files:**
- Create: `src/screens/contacts/DetailField.tsx`, `src/screens/contacts/ContactDetailBody.tsx`
- Modify: `src/screens/ContactDetail.tsx`
- Test: `tests/screens/ContactDetail.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { ContactDetail } from '@/screens/ContactDetail';
import { contacts } from '@/mock/fixtures';

const byCode = (code: string) => contacts.find((c) => c.primaryReasonCode === code)!;
const checkStates = () => screen.getAllByTestId('check').map((el) => el.textContent);

describe('ContactDetail', () => {
  it('shows a verified contact with all five checks passing', () => {
    render(<ContactDetail contact={byCode('VF_OK')} />);
    expect(screen.getByText('(602) •••-4471')).toBeInTheDocument();
    expect(screen.getByText('Sep 29, 14:02 · Call · Marketing')).toBeInTheDocument();
    expect(screen.getByText('All five checks pass.', { exact: false })).toBeInTheDocument();
    expect(checkStates()).toEqual([
      '1. Applicable proof existsPass', '2. Proof opens at its sourcePass', '3. Proof content is consentPass', '4. Sources agreePass', '5. CompletenessPass',
    ]);
  });

  it('marks the failing step and the steps not reached', () => {
    render(<ContactDetail contact={byCode('CF_PHONE_MISMATCH')} />);
    const checks = screen.getAllByTestId('check');
    expect(within(checks[2]).getByText('Pass')).toBeInTheDocument();
    expect(within(checks[3]).getByText('Fails')).toBeInTheDocument();
    expect(within(checks[4]).getByText('Not reached')).toBeInTheDocument();
  });

  it('shows a step-5 gap as Gap, and a step-3 failure for a pre-ticked box', () => {
    const { unmount } = render(<ContactDetail contact={byCode('WK_RETENTION')} />);
    expect(within(screen.getAllByTestId('check')[4]).getByText('Gap')).toBeInTheDocument();
    unmount();
    render(<ContactDetail contact={byCode('NP_PRETICKED')} />);
    expect(within(screen.getAllByTestId('check')[2]).getByText('Fails')).toBeInTheDocument();
  });

  it('shows why proof is needed, the proof used, source tier, labels and hash', () => {
    render(<ContactDetail contact={byCode('CF_PAGE_MISMATCH')} />);
    expect(screen.getByText('Marketing robocall (written)')).toBeInTheDocument();
    expect(screen.getByText('Web certificate; page similarity 0.72')).toBeInTheDocument();
    expect(screen.getByText('Tier 1 + 2')).toBeInTheDocument();
    expect(screen.getByText('Affiliate page')).toBeInTheDocument();
    expect(screen.getByText('sha256 3d9a…b2c4')).toBeInTheDocument();
  });

  it('links to the evidence file for the number', () => {
    render(<ContactDetail contact={byCode('NP_AFTER_OPT_OUT')} />);
    expect(screen.getByRole('link', { name: 'Open evidence file' })).toHaveAttribute('href', '/numbers/%2B14805550923');
  });

  it('shows dashes when nothing was supplied', () => {
    render(<ContactDetail contact={byCode('NP_NONE')} />);
    expect(screen.getByText('None supplied')).toBeInTheDocument();
    expect(screen.getByText('sha256 —')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/screens/ContactDetail.test.tsx`
Expected: FAIL — the detail body is not rendered (no element with test id `check`).

- [ ] **Step 3: Write the detail's two pieces and replace the panel, one file each**

`src/screens/contacts/DetailField.tsx`:
```tsx
import type { ReactNode } from 'react';

/** One "Label: value" line in the proof and evidence block. */
export function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return <span><span className="text-muted">{label}:</span> <span>{children}</span></span>;
}
```

`src/screens/contacts/ContactDetailBody.tsx`:
```tsx
import Link from 'next/link';
import { BASIS_LABEL, type CheckState, type ContactRow } from '@/api/types';
import { StatusChip } from '@/components/StatusChip';
import { formatDateTime, formatTiers, truncateHash } from '@/lib/format';
import { DetailField } from './DetailField';

const CHECK_NAMES = ['Applicable proof exists', 'Proof opens at its source', 'Proof content is consent', 'Sources agree', 'Completeness'];

const CHECK_VIEW: Record<CheckState, { label: string; cls: string }> = {
  pass: { label: 'Pass', cls: 'bg-ok-bg text-ok-fg' },
  fails: { label: 'Fails', cls: 'bg-bad-bg text-bad-fg' },
  gap: { label: 'Gap', cls: 'bg-warn-bg text-warn-fg' },
  not_reached: { label: 'Not reached', cls: 'bg-line-soft text-ink-2' },
};

export function ContactDetailBody({ contact }: { contact: ContactRow }) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[15px] font-medium">{contact.phoneDisplay}</span>
        <span className="text-[12.5px] text-muted">{formatDateTime(contact.occurredAtUtc)} · {contact.channel} · {contact.category}</span>
        <StatusChip status={contact.status} />
        <span className="text-[13px] leading-normal"><span className="font-mono text-xs">{contact.primaryReasonCode}</span> — {contact.reasonText}</span>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="m-0 text-[13px] font-semibold">Five checks</h3>
        {contact.checks.map((state, i) => (
          <div key={CHECK_NAMES[i]} data-testid="check" className="flex items-center justify-between gap-2.5 rounded-lg bg-canvas px-2.5 py-2">
            <span className="text-[12.5px]">{i + 1}. {CHECK_NAMES[i]}</span>
            <span className={`rounded-[5px] px-[7px] py-0.5 text-[11px] font-semibold ${CHECK_VIEW[state].cls}`}>{CHECK_VIEW[state].label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5 text-[12.5px] leading-normal">
        <h3 className="m-0 text-[13px] font-semibold">Proof and evidence</h3>
        <span className="flex flex-col">
          <span className="text-muted">Why proof is needed:</span>
          {contact.bases.map((b) => <span key={b}>{BASIS_LABEL[b]}</span>)}
        </span>
        <DetailField label="Proof used">{contact.proofSummary}</DetailField>
        <DetailField label="Source tier">{formatTiers(contact.tiers)}</DetailField>
        <span className="flex flex-wrap items-baseline gap-1">
          <span className="text-muted">Labels:</span>
          {contact.labels.length === 0 ? <span>—</span> : contact.labels.map((l) => <span key={l} className="rounded bg-line-soft px-1.5">{l}</span>)}
        </span>
        <span className="font-mono text-[11.5px] text-ink-2">sha256 {truncateHash(contact.artifactSha256)}</span>
      </div>
      <Link
        href={`/numbers/${encodeURIComponent(contact.phoneE164)}`}
        className="flex h-10 items-center justify-center rounded-lg border border-control bg-surface text-[13px] font-medium text-ink no-underline hover:text-ink"
      >
        Open evidence file
      </Link>
    </div>
  );
}
```

Replace `src/screens/ContactDetail.tsx`:
```tsx
'use client';

import type { ContactRow } from '@/api/types';
import { ContactDetailBody } from './contacts/ContactDetailBody';

export function ContactDetail({ contact }: { contact: ContactRow | null }) {
  return (
    <aside className="flex w-[320px] shrink-0 flex-col gap-3.5 rounded-card border border-line bg-surface p-5">
      {contact === null ? (
        <div className="flex flex-col gap-2 px-1 py-6">
          <span className="font-display text-lg font-semibold">Contact detail</span>
          <span className="text-[13px] leading-normal text-muted">Select a contact to see the five consent checks, the proof used, its source tier and the evidence hash.</span>
        </div>
      ) : <ContactDetailBody contact={contact} />}
    </aside>
  );
}
```

- [ ] **Step 4: Add a selection test to `tests/screens/Contacts.test.tsx`**

Append inside the `describe('Contacts list', …)` block:
```tsx
  it('opens the detail panel when a row is selected and clears it when the filter changes', async () => {
    renderWithProviders(<Contacts />);
    await screen.findAllByTestId('contact-row');
    await userEvent.click(rows()[1]);
    expect(rows()[1]).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Five checks')).toBeInTheDocument();
    expect(screen.getByText('Web certificate (cut off by STOP on Sep 21)')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'VERIFIED' }));
    await screen.findByText('Showing 2 of 10,000 contacts.', { exact: false });
    expect(screen.queryByText('Five checks')).not.toBeInTheDocument();
  });
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/screens/ContactDetail.test.tsx tests/screens/Contacts.test.tsx`
Expected: PASS (6 + 5 tests).

---

### Task C4: Metrics

**Files:**
- Create: `src/screens/Metrics.tsx`, `src/app/(portal)/metrics/page.tsx`
- Test: `tests/screens/Metrics.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import { Metrics } from '@/screens/Metrics';

describe('Metrics', () => {
  it('groups all 33 metrics under the six families in the prototype order', async () => {
    renderWithProviders(<Metrics />);
    await screen.findByText('M01');
    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(headings).toEqual(['Permission', 'Stopping', 'Who you contact', 'How you contact', 'Records and company controls', 'Lead Inspector']);
    expect(screen.getAllByTestId('metric-card')).toHaveLength(33);
    expect(screen.getByText('28 audit metrics and 5 Lead Inspector metrics')).toBeInTheDocument();
  });

  it('shows code, name, value and note on a card', async () => {
    renderWithProviders(<Metrics />);
    const card = (await screen.findByText('M08')).closest('[data-testid="metric-card"]') as HTMLElement;
    expect(within(card).getByText('Opt-out Speed')).toBeInTheDocument();
    expect(within(card).getByText('6.0 h')).toBeInTheDocument();
    expect(within(card).getByText('Median of 8 tests')).toBeInTheDocument();
  });

  it('shows Not measured, muted, with the reason for a missing source', async () => {
    renderWithProviders(<Metrics />);
    const card = (await screen.findByText('M11')).closest('[data-testid="metric-card"]') as HTMLElement;
    expect(within(card).getByText('Not measured')).toHaveClass('text-muted');
    expect(within(card).getByText('Client query logs not supplied')).toBeInTheDocument();
  });

  it('uses the possible wording for uncertain locations', async () => {
    renderWithProviders(<Metrics />);
    expect(await screen.findByText('Federal · state; 120 possible (location uncertain)')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/screens/Metrics.test.tsx`
Expected: FAIL — cannot resolve `@/screens/Metrics`.

- [ ] **Step 3: Write `src/screens/Metrics.tsx`**

```tsx
'use client';

import { useMetrics } from '@/api/queries';
import type { Family } from '@/api/types';
import { PageHeading } from '@/components/PageHeading';
import { NOT_MEASURED } from '@/lib/format';
import { useRunContext } from '@/state/RunContext';
import { useSession } from '@/state/SessionContext';

const FAMILY_ORDER: Family[] = ['Permission', 'Stopping', 'Who you contact', 'How you contact', 'Records and company controls', 'Lead Inspector'];

export function Metrics() {
  const { clientId } = useSession();
  const { selectedRun } = useRunContext();
  const q = useMetrics(clientId, selectedRun?.runId ?? null);
  if (q.isPending) return <p className="text-muted">Loading…</p>;
  if (!q.data) return <p className="text-muted">Metrics could not be loaded.</p>;

  const audit = q.data.filter((m) => m.family !== 'Lead Inspector').length;
  const lead = q.data.length - audit;

  return (
    <div className="flex flex-col gap-[22px]">
      <PageHeading title="Metrics" aside={`${audit} audit metrics and ${lead} Lead Inspector metrics`} />
      {FAMILY_ORDER.filter((f) => q.data.some((m) => m.family === f)).map((family) => (
        <section key={family} className="flex flex-col gap-2.5">
          <h3 className="m-0 text-sm font-semibold text-ink-2">{family}</h3>
          <div className="grid grid-cols-4 gap-3">
            {q.data.filter((m) => m.family === family).map((m) => (
              <div key={m.metricCode} data-testid="metric-card" className="flex flex-col gap-1.5 rounded-tile border border-line bg-surface p-3.5">
                <span className="font-mono text-[11.5px] text-muted">{m.metricCode}</span>
                <span className="text-[13.5px] font-medium">{m.name}</span>
                <span className={`text-lg font-semibold ${m.missingReason ? 'text-muted' : 'text-ink'}`}>{m.missingReason ? NOT_MEASURED : m.display}</span>
                <span className="text-xs leading-[1.4] text-muted">{m.missingReason ?? m.note}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Write `src/app/(portal)/metrics/page.tsx`**

```tsx
import { Metrics } from '@/screens/Metrics';

export default function Page() {
  return <Metrics />;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/screens/Metrics.test.tsx`
Expected: PASS (4 tests).

---

### Task C5: Part C verification

- [ ] **Step 1: Full run**

Run: `npm run test && npm run typecheck && npm run build`
Expected: all tests pass (54 so far: 33 from Parts A–B, Overview 6, Contacts 5, ContactDetail 6, Metrics 4); no type errors; build succeeds.

- [ ] **Step 2: Compare with the prototype by eye**

Run `npm run dev` and check, side by side with the prototype artifact:
- **Overview:** dark score tile "81.3" with the "C" box, the cap sentence and "812 of 1,132 checkpoints ran"; three white tiles (M22a 56.0%, M22b 93.0%, M01 88.0%); the stacked bar 76 / 8 / 11 / 5 in green, amber, orange, dark red; four status columns; six family bars in teal; the Alerts card with four items.
- **Contacts:** five filter pills, seven-column table, ten rows; clicking a row tints it and fills the right panel with the five checks; "Open evidence file" at the bottom (the page it opens is built in Part D).
- **Metrics:** six family headings, four cards per row, M11 in muted text.
Stop the server.

---

## Part C self-review

- **Prototype coverage:** every element of the three prototype screens has a task: score tile, three headline tiles, status mix bar and columns, family bars with the DNC note, alerts with the notice sentence (C1); filter pills, seven-column table, footer count (C2); detail header, five checks with Pass / Fails / Gap / Not reached, proof fields, hash, evidence button (C3); six families, 33 cards, muted "Not measured" (C4).
- **Deliberate differences:** "source tier" replaces "source grade" (v1.1); "Proof needed" and "Why proof is needed" list every basis a contact carries (v1.1 per-basis evaluation); alerts are filtered for non-legal roles in counsel-directed mode (spec §9).
- **Spec coverage:** hard-cap sentence built from `Score.hardCap` (spec §9 Score); "checkpoints ran X of Y" beside the score; "Not measured" never shown as 0 (C1 tile, C4 card); a number's result is its worst contact status (C2 footer).
- **Type consistency:** `ContactDetail` takes `contact: ContactRow | null` in both C2 and C3; `checks` is the 5-tuple from `types.ts`; `BASIS_LABEL` covers all six bases; `formatTiers`, `truncateHash`, `formatDateTime` signatures match Part A; test ids used: `contact-row`, `check`, `metric-card`.
- **No placeholders:** complete code and exact commands in every step.
