# Frontend Portal — Part D: Opt-out tests, Lead Inspector, Fix list, Sources, Evidence file, Rulebook (Module 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the portal: the remaining four prototype screens, the evidence file page that "Open evidence file" leads to, the internal rulebook page, and the final verification of the whole module.

**Architecture:** as Part C — client screens in `src/screens/`, thin page wrappers in `src/app/(portal)/`.

**Tech Stack:** as Part A. **Prerequisite:** [Part C](2026-10-03-01c-portal-screens-1.md) complete. **No git steps.**

**Design reference:** the `isOptout`, `isLeads`, `isFixes` and `isSources` blocks of [../design-reference/portal-prototype.dc.html](../design-reference/portal-prototype.dc.html). The evidence file and rulebook pages are not in the prototype; they follow the v1.1 specs (§9 Evidence file; rulebook §2) in the prototype's visual language. All paths are under `frontend/`.

---

### Task D1: Opt-out tests

**Files:**
- Create: `src/screens/OptOutTests.tsx`, `src/app/(portal)/opt-out-tests/page.tsx`
- Test: `tests/screens/OptOutTests.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import { OptOutTests } from '@/screens/OptOutTests';

const cellOf = (channel: string, system: string) =>
  document.querySelector(`[data-channel="${channel}"][data-system="${system}"]`) as HTMLElement;

describe('OptOutTests', () => {
  it('shows the three summary tiles', async () => {
    renderWithProviders(<OptOutTests />);
    expect(await screen.findByText('6.0 h median')).toBeInTheDocument();
    expect(screen.getByText('8 tests in the last 90 days; 90th percentile NEVER')).toBeInTheDocument();
    const a = screen.getByText('M09a Not stopped by deadline').parentElement!;
    expect(a).toHaveTextContent('2');
    expect(a).toHaveTextContent('Deadline: 10 business days, recipient time zone');
    expect(screen.getByText('M09b Contacted after deadline').parentElement).toHaveTextContent('1');
  });

  it('renders the propagation matrix with the info columns labelled', async () => {
    renderWithProviders(<OptOutTests />);
    await screen.findByText('6.0 h median');
    const headers = screen.getAllByRole('columnheader').map((h) => h.textContent);
    expect(headers).toEqual(['Opt-out channel', 'Dialer', 'SMS platform', 'CRM (info)', 'Lead platform (info)']);
    expect(cellOf('Reply STOP', 'Dialer')).toHaveTextContent('2.0 h');
    expect(cellOf('Reply STOP', 'Dialer')).toHaveTextContent('3 tests');
    expect(cellOf('Spoken on a call', 'SMS platform')).toHaveTextContent('—');
    expect(cellOf('Spoken on a call', 'SMS platform')).toHaveTextContent('not tested');
  });

  it('tones cells: NEVER on a contacting system, slow, indicative, and neutral for info columns', async () => {
    renderWithProviders(<OptOutTests />);
    await screen.findByText('6.0 h median');
    expect(within(cellOf('Web or email', 'Dialer')).getByTestId('cell-body')).toHaveClass('bg-bad-bg');
    expect(within(cellOf('Plain-words reply', 'Dialer')).getByTestId('cell-body')).toHaveClass('bg-warn-bg');
    expect(within(cellOf('Spoken on a call', 'Dialer')).getByTestId('cell-body')).toHaveClass('bg-line-soft');
    expect(cellOf('Spoken on a call', 'Dialer')).toHaveTextContent('2 tests · indicative');
    expect(within(cellOf('Plain-words reply', 'CRM')).getByTestId('cell-body')).toHaveClass('bg-canvas');
    expect(screen.getByText(/Cells with fewer than 3 tests are indicative/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/screens/OptOutTests.test.tsx`
Expected: FAIL — cannot resolve `@/screens/OptOutTests`.

- [ ] **Step 3: Write `src/screens/OptOutTests.tsx`**

```tsx
'use client';

import { useRevocation } from '@/api/queries';
import type { MatrixCell } from '@/api/types';
import { PageHeading } from '@/components/PageHeading';
import { StatTile } from '@/components/StatTile';
import { NotMeasured } from '@/components/NotMeasured';
import { useRunContext } from '@/state/RunContext';
import { useSession } from '@/state/SessionContext';

const CHANNELS: MatrixCell['channel'][] = ['Reply STOP', 'Plain-words reply', 'Spoken on a call', 'Web or email'];
const SYSTEMS: { id: MatrixCell['system']; label: string; contacting: boolean }[] = [
  { id: 'Dialer', label: 'Dialer', contacting: true },
  { id: 'SMS platform', label: 'SMS platform', contacting: true },
  { id: 'CRM', label: 'CRM (info)', contacting: false },
  { id: 'Lead platform', label: 'Lead platform (info)', contacting: false },
];

/** Precedence follows the prototype: indicative, then NEVER on a system that can contact the person, then slow. */
function tone(cell: MatrixCell, contacting: boolean): { box: string; text: string } {
  if (cell.tested && cell.indicative) return { box: 'bg-line-soft', text: 'text-ink-2' };
  if (cell.never && contacting) return { box: 'bg-bad-bg', text: 'text-bad-fg' };
  if (cell.slow) return { box: 'bg-warn-bg', text: 'text-warn-fg' };
  return { box: 'bg-canvas', text: 'text-ink' };
}

const cellText = (c: MatrixCell) => (!c.tested ? '—' : c.never ? 'NEVER' : `${(c.medianHours ?? 0).toFixed(1)} h`);
const cellSub = (c: MatrixCell) => (!c.tested ? 'not tested' : `${c.testCount} tests${c.indicative ? ' · indicative' : ''}`);

export function OptOutTests() {
  const { clientId } = useSession();
  const { selectedRun } = useRunContext();
  const q = useRevocation(clientId, selectedRun?.runId ?? null);
  if (q.isPending) return <p className="text-muted">Loading…</p>;
  if (!q.data) return <p className="text-muted">Opt-out tests could not be loaded.</p>;
  const r = q.data;
  const find = (channel: string, system: string) => r.cells.find((c) => c.channel === channel && c.system === system);

  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeading title="Opt-out tests" />
      <div className="grid grid-cols-3 gap-4">
        <StatTile
          size="md"
          label="M08 Opt-out speed"
          value={r.medianHours === null ? <NotMeasured /> : `${r.medianHours.toFixed(1)} h median`}
          note={`${r.testCount} tests in the last ${r.windowDays} days; 90th percentile ${r.p90 === null ? '—' : r.p90 === 'NEVER' ? 'NEVER' : `${r.p90.toFixed(1)} h`}`}
        />
        <StatTile size="md" label="M09a Not stopped by deadline" value={r.notStoppedByDeadline} note={`Deadline: ${r.deadlineBusinessDays} business days, recipient time zone`} />
        <StatTile size="md" label="M09b Contacted after deadline" value={r.contactedAfterDeadline} note="Test opt-outs through the client's own forms only" />
      </div>
      <section className="overflow-hidden rounded-card border border-line bg-surface">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-line-soft text-left text-[11.5px] uppercase tracking-[0.5px] text-muted">
              <th scope="col" className="w-[200px] px-4 py-3 font-normal">Opt-out channel</th>
              {SYSTEMS.map((s) => <th key={s.id} scope="col" className="px-4 py-3 font-normal">{s.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {CHANNELS.map((channel) => (
              <tr key={channel} className="border-b border-line-soft">
                <th scope="row" className="px-4 py-3.5 text-left text-[13.5px] font-medium">{channel}</th>
                {SYSTEMS.map((s) => {
                  const c = find(channel, s.id);
                  if (!c) return <td key={s.id} />;
                  const t = tone(c, s.contacting);
                  return (
                    <td key={s.id} data-channel={channel} data-system={s.id} className="p-1.5">
                      <div data-testid="cell-body" className={`flex flex-col gap-0.5 rounded-lg px-2.5 py-2 ${t.box}`}>
                        <span className={`text-sm font-semibold ${t.text}`}>{cellText(c)}</span>
                        <span className="text-[11.5px] text-muted">{cellSub(c)}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 text-xs text-muted">
          Only the dialer and SMS platform set a test&apos;s overall time. Cells with fewer than {r.minTestsPerCell} tests are indicative. Spoken tests start with a recording notice.
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Write `src/app/(portal)/opt-out-tests/page.tsx`**

```tsx
import { OptOutTests } from '@/screens/OptOutTests';

export default function Page() {
  return <OptOutTests />;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/screens/OptOutTests.test.tsx`
Expected: PASS (3 tests).

---

### Task D2: Lead Inspector

**Files:**
- Create: `src/screens/LeadInspector.tsx`, `src/app/(portal)/lead-inspector/page.tsx`
- Test: `tests/screens/LeadInspector.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import { LeadInspector } from '@/screens/LeadInspector';

const row = (name: string) => screen.getByText(name).closest('tr') as HTMLElement;

describe('LeadInspector', () => {
  it('shows the four signal tiles and the batch note', async () => {
    renderWithProviders(<LeadInspector />);
    expect(await screen.findByText('4,300')).toBeInTheDocument();
    expect(screen.getByText('86.0% of leads (M26)')).toBeInTheDocument();
    expect(screen.getByText('Some risk signals').parentElement).toHaveTextContent('550');
    expect(screen.getByText('High risk signals').parentElement).toHaveTextContent('150');
    expect(screen.getByText('Dispute candidates').parentElement).toHaveTextContent('212');
    expect(screen.getByText('Nightly batch · 5,000 leads this period')).toBeInTheDocument();
  });

  it('lists vendors with leads, high signals, score, grade and month-on-month change', async () => {
    renderWithProviders(<LeadInspector />);
    await screen.findByText('4,300');
    const a = row('Vendor A · sub-ID 114');
    expect(a).toHaveTextContent('1,420');
    expect(a).toHaveTextContent('91.2');
    expect(within(a).getByText('A')).toHaveClass('bg-ok-bg');
    expect(within(a).getByText('+1.4')).toHaveClass('text-ink-2');
    const e = row('Vendor E · sub-ID 7');
    expect(within(e).getByText('−11.2 · alert')).toHaveClass('text-conflict-fg');
  });

  it('shows not enough data for a small vendor and the consumer-report notice', async () => {
    renderWithProviders(<LeadInspector />);
    await screen.findByText('4,300');
    const g = row('Vendor G');
    expect(g).toHaveTextContent('Not enough data');
    expect(within(g).getAllByText('—')).toHaveLength(2);
    expect(screen.getByText(/may not be used to decide anyone's eligibility/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/screens/LeadInspector.test.tsx`
Expected: FAIL — cannot resolve `@/screens/LeadInspector`.

- [ ] **Step 3: Write `src/screens/LeadInspector.tsx`**

```tsx
'use client';

import { useLeads } from '@/api/queries';
import type { VendorScore } from '@/api/types';
import { PageHeading } from '@/components/PageHeading';
import { StatTile } from '@/components/StatTile';
import { GradeChip } from '@/components/GradeChip';
import { formatCount, formatPercent, formatScore } from '@/lib/format';
import { useRunContext } from '@/state/RunContext';
import { useSession } from '@/state/SessionContext';

/** "+1.4", "−0.8", "−11.2 · alert", or "Not enough data". Uses a true minus sign. */
function trend(v: VendorScore): string {
  if (v.monthOnMonth === null) return 'Not enough data';
  const n = `${v.monthOnMonth >= 0 ? '+' : '−'}${Math.abs(v.monthOnMonth).toFixed(1)}`;
  return v.dropAlert ? `${n} · alert` : n;
}

export function LeadInspector() {
  const { clientId } = useSession();
  const { selectedRun } = useRunContext();
  const q = useLeads(clientId, selectedRun?.runId ?? null);
  if (q.isPending) return <p className="text-muted">Loading…</p>;
  if (!q.data) return <p className="text-muted">Lead Inspector could not be loaded.</p>;
  const d = q.data;
  const fewShare = d.leadsInspected === 0 ? null : (100 * d.few) / d.leadsInspected;

  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeading title="Lead Inspector" aside={`Nightly batch · ${formatCount(d.leadsInspected)} leads this period`} />
      <div className="grid grid-cols-4 gap-4">
        <StatTile size="md" label="Few risk signals" value={formatCount(d.few)} note={`${formatPercent(fewShare)} of leads (M26)`} />
        <StatTile size="md" label="Some risk signals" value={formatCount(d.some)} note="Look closer" />
        <StatTile size="md" label="High risk signals" value={formatCount(d.high)} note="Includes hard signals" />
        <StatTile size="md" label="Dispute candidates" value={formatCount(d.disputeCandidates)} note="Inside vendor dispute windows" />
      </div>
      <section className="overflow-hidden rounded-card border border-line bg-surface">
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr className="border-b border-line-soft text-left text-[11.5px] uppercase tracking-[0.5px] text-muted">
              <th scope="col" className="px-4 py-3 font-normal">Vendor and sub-ID</th>
              <th scope="col" className="w-[90px] py-3 font-normal">Leads</th>
              <th scope="col" className="w-[110px] py-3 font-normal">High signals</th>
              <th scope="col" className="w-[90px] py-3 font-normal">Score</th>
              <th scope="col" className="w-[90px] py-3 font-normal">Grade</th>
              <th scope="col" className="w-[140px] py-3 pr-4 font-normal">Month on month</th>
            </tr>
          </thead>
          <tbody>
            {d.vendors.map((v) => (
              <tr key={`${v.vendorId}-${v.subId ?? ''}`} className="h-12 border-b border-line-soft">
                <td className="px-4">{v.subId ? `${v.name} · sub-ID ${v.subId}` : v.name}</td>
                <td>{formatCount(v.leads)}</td>
                <td>{v.highSignals}</td>
                <td className="font-semibold">{v.notEnoughData || v.score === null ? '—' : formatScore(v.score)}</td>
                <td><GradeChip grade={v.grade} /></td>
                <td className="pr-4"><span className={v.monthOnMonth !== null && v.monthOnMonth < 0 ? 'text-conflict-fg' : 'text-ink-2'}>{trend(v)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 text-xs leading-normal text-muted">
          Results describe signals in lead records for your own vendor review. They may not be used to decide anyone&apos;s eligibility for credit, insurance, employment, housing or any other benefit.
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Write `src/app/(portal)/lead-inspector/page.tsx`**

```tsx
import { LeadInspector } from '@/screens/LeadInspector';

export default function Page() {
  return <LeadInspector />;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/screens/LeadInspector.test.tsx`
Expected: PASS (3 tests).

---

### Task D3: Fix list

**Files:**
- Create: `src/screens/FixList.tsx`, `src/app/(portal)/fix-list/page.tsx`
- Test: `tests/screens/FixList.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../utils';
import { FixList } from '@/screens/FixList';

describe('FixList', () => {
  it('lists fixes with severity, title, step and family, in the order given', async () => {
    renderWithProviders(<FixList />);
    const items = await screen.findAllByTestId('fix');
    expect(items).toHaveLength(6);
    expect(within(items[0]).getByText('High')).toBeInTheDocument();
    expect(items[0]).toHaveTextContent('14 contacts after opt-out across 9 numbers');
    expect(items[0]).toHaveTextContent('Map the dialer outcome “DNC request” to suppression in the SMS platform.');
    expect(items[0]).toHaveTextContent('Stopping');
    expect(within(items[5]).getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('Fix steps come from a library reviewed by counsel.')).toBeInTheDocument();
  });

  it('lets an owner change a status and keeps the change', async () => {
    renderWithProviders(<FixList />, { session: { role: 'owner' } });
    const first = (await screen.findAllByTestId('fix'))[0];
    await userEvent.selectOptions(within(first).getByLabelText('Status'), 'in_progress');
    expect(await within(first).findByDisplayValue('In progress')).toBeInTheDocument();
  });

  it('shows the status as text for a read-only role', async () => {
    renderWithProviders(<FixList />, { session: { role: 'read_only' } });
    const first = (await screen.findAllByTestId('fix'))[0];
    expect(within(first).queryByLabelText('Status')).not.toBeInTheDocument();
    expect(within(first).getByText('Open')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/screens/FixList.test.tsx`
Expected: FAIL — cannot resolve `@/screens/FixList`.

- [ ] **Step 3: Write `src/screens/FixList.tsx`**

```tsx
'use client';

import { useFindings, useSetFindingStatus } from '@/api/queries';
import type { FindingStatus, Role } from '@/api/types';
import { PageHeading } from '@/components/PageHeading';
import { SeverityChip } from '@/components/SeverityChip';
import { useSession } from '@/state/SessionContext';

const STATUS_LABEL: Record<FindingStatus, string> = { open: 'Open', in_progress: 'In progress', resolved: 'Resolved', reopened: 'Reopened' };
const CAN_EDIT: Role[] = ['owner', 'legal', 'operations', 'admin', 'counsel', 'engineer'];

export function FixList() {
  const { clientId, role } = useSession();
  const q = useFindings(clientId);
  const mutate = useSetFindingStatus(clientId);
  if (q.isPending) return <p className="text-muted">Loading…</p>;
  if (!q.data) return <p className="text-muted">The fix list could not be loaded.</p>;

  return (
    <div className="flex flex-col gap-3.5">
      <PageHeading title="Fix list" aside="Sorted by severity and contacts affected" />
      {q.data.map((f) => (
        <div key={f.findingId} data-testid="fix" className="grid grid-cols-[90px_minmax(0,1fr)_170px_140px] items-center gap-4 rounded-tile border border-line bg-surface px-[18px] py-4">
          <SeverityChip severity={f.severity} />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{f.title}</span>
            <span className="text-[12.5px] text-muted">{f.step}</span>
          </div>
          <span className="text-[12.5px] text-ink-2">{f.family}</span>
          {CAN_EDIT.includes(role) ? (
            <select
              aria-label="Status"
              className="h-9 rounded-lg border border-control bg-surface px-2 text-[12.5px] font-medium"
              value={f.status}
              onChange={(e) => mutate.mutate({ findingId: f.findingId, status: e.target.value as FindingStatus })}
            >
              {(Object.keys(STATUS_LABEL) as FindingStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          ) : <span className="text-[12.5px] font-medium">{STATUS_LABEL[f.status]}</span>}
        </div>
      ))}
      <span className="text-xs text-muted">Fix steps come from a library reviewed by counsel.</span>
    </div>
  );
}
```

- [ ] **Step 4: Write `src/app/(portal)/fix-list/page.tsx`**

```tsx
import { FixList } from '@/screens/FixList';

export default function Page() {
  return <FixList />;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/screens/FixList.test.tsx`
Expected: PASS (3 tests).

---

### Task D4: Sources, with revoke and upload

**Files:**
- Create: `src/screens/Sources.tsx`, `src/app/(portal)/sources/page.tsx`
- Test: `tests/screens/Sources.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../utils';
import { Sources } from '@/screens/Sources';

const row = (name: string) => screen.getByText(name).closest('tr') as HTMLElement;

describe('Sources', () => {
  it('lists sources with tier, access, last sync and status', async () => {
    renderWithProviders(<Sources />);
    await screen.findByText('Convoso dialer');
    const dialer = row('Convoso dialer');
    expect(dialer).toHaveTextContent('Tier 3');
    expect(dialer).toHaveTextContent('Least-privilege user, logged');
    expect(dialer).toHaveTextContent('Sep 28, 20:00');
    expect(within(dialer).getByText('Stale')).toHaveClass('bg-warn-bg');
    const scrub = row('DNC scrub records');
    expect(within(scrub).getByText('Not supplied')).toHaveClass('bg-line-soft');
    expect(screen.getByText('Tier 1 captured by CiV · Tier 2 third-party API · Tier 3 your systems by API · Tier 4 uploaded by you')).toBeInTheDocument();
    expect(screen.getByText(/so every result shows its source tier/)).toBeInTheDocument();
  });

  it('lets the owner revoke a connected source in one click', async () => {
    renderWithProviders(<Sources />, { session: { role: 'owner' } });
    await screen.findByText('TrustedForm certificates');
    await userEvent.click(within(row('TrustedForm certificates')).getByRole('button', { name: 'Revoke access' }));
    expect(await within(row('TrustedForm certificates')).findByText('Revoked')).toBeInTheDocument();
    expect(within(row('TrustedForm certificates')).queryByRole('button', { name: 'Revoke access' })).not.toBeInTheDocument();
  });

  it('offers revoke only where it applies and never to a read-only role', async () => {
    renderWithProviders(<Sources />, { session: { role: 'read_only' } });
    await screen.findByText('TrustedForm certificates');
    expect(screen.queryByRole('button', { name: 'Revoke access' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Upload DNC scrub records')).not.toBeInTheDocument();
  });

  it('uploads a file for an upload source and shows the recorded hash', async () => {
    renderWithProviders(<Sources />, { session: { role: 'owner' } });
    await screen.findByText('DNC scrub records');
    expect(within(row('Somos reassigned numbers')).queryByRole('button', { name: 'Revoke access' })).not.toBeInTheDocument();
    const file = new File(['+15551234567\n'], 'scrub.csv', { type: 'text/csv' });
    await userEvent.upload(screen.getByLabelText('Upload DNC scrub records'), file);
    expect(await within(row('DNC scrub records')).findByText('Recorded art-1 · sha256 e3b0…b855')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/screens/Sources.test.tsx`
Expected: FAIL — cannot resolve `@/screens/Sources`.

- [ ] **Step 3: Write `src/screens/Sources.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useRevokeSource, useSources, useUpload } from '@/api/queries';
import type { Role, Source, SourceStatus, UploadResult } from '@/api/types';
import { PageHeading } from '@/components/PageHeading';
import { TextChip } from '@/components/TextChip';
import { TIER_LABEL, formatDateTime, truncateHash } from '@/lib/format';
import { useSession } from '@/state/SessionContext';

const STATUS: Record<SourceStatus, { label: string; tone: 'ok' | 'warn' | 'neutral' | 'bad' }> = {
  ok: { label: 'OK', tone: 'ok' },
  stale: { label: 'Stale', tone: 'warn' },
  not_supplied: { label: 'Not supplied', tone: 'neutral' },
  revoked: { label: 'Revoked', tone: 'bad' },
};
const CAN_REVOKE: Role[] = ['owner', 'admin', 'engineer'];
const CAN_UPLOAD: Role[] = ['owner', 'operations', 'admin', 'engineer'];

export function Sources() {
  const { clientId, role } = useSession();
  const q = useSources(clientId);
  const revoke = useRevokeSource(clientId);
  const upload = useUpload(clientId);
  const [recorded, setRecorded] = useState<Record<string, UploadResult>>({});

  if (q.isPending) return <p className="text-muted">Loading…</p>;
  if (!q.data) return <p className="text-muted">Sources could not be loaded.</p>;

  async function onFile(source: Source, file: File | undefined) {
    if (!file) return;
    const result = await upload.mutateAsync({ uploadType: source.sourceId, file });
    setRecorded((r) => ({ ...r, [source.sourceId]: result }));
  }

  return (
    <div className="flex flex-col gap-3.5">
      <PageHeading title="Sources" aside="Tier 1 captured by CiV · Tier 2 third-party API · Tier 3 your systems by API · Tier 4 uploaded by you" />
      <div className="overflow-hidden rounded-card border border-line bg-surface">
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr className="border-b border-line-soft text-left text-[11.5px] uppercase tracking-[0.5px] text-muted">
              <th scope="col" className="px-4 py-3 font-normal">Source</th>
              <th scope="col" className="w-20 py-3 font-normal">Tier</th>
              <th scope="col" className="w-[220px] py-3 font-normal">Access</th>
              <th scope="col" className="w-[140px] py-3 font-normal">Last sync</th>
              <th scope="col" className="w-[120px] py-3 font-normal">Status</th>
              <th scope="col" className="w-[250px] py-3 pr-4 font-normal"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {q.data.map((s) => (
              <tr key={s.sourceId} className="h-12 border-b border-line-soft">
                <td className="px-4">{s.name}</td>
                <td className="font-mono font-medium" title={TIER_LABEL[s.tier]}>Tier {s.tier}</td>
                <td className="text-ink-2">{s.access}</td>
                <td className="text-ink-2">{formatDateTime(s.lastSyncAt)}</td>
                <td><TextChip tone={STATUS[s.status].tone}>{STATUS[s.status].label}</TextChip></td>
                <td className="pr-4 text-xs">
                  {s.revocable && s.status !== 'revoked' && CAN_REVOKE.includes(role) && (
                    <button type="button" onClick={() => revoke.mutate(s.sourceId)} className="h-9 cursor-pointer rounded-lg border border-control bg-surface px-3 text-[12.5px] font-medium text-ink">
                      Revoke access
                    </button>
                  )}
                  {s.acceptsUpload && CAN_UPLOAD.includes(role) && (
                    recorded[s.sourceId]
                      ? <span className="text-ink-2">Recorded {recorded[s.sourceId].artifactId} · sha256 {truncateHash(recorded[s.sourceId].sha256)}</span>
                      : (
                        <label className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-control bg-surface px-3 text-[12.5px] font-medium text-ink">
                          Upload file
                          <input type="file" aria-label={`Upload ${s.name}`} className="sr-only" onChange={(e) => onFile(s, e.target.files?.[0])} />
                        </label>
                      )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <span className="text-xs text-muted">
        Every artifact is hashed at capture, stored write-once and anchored daily. A hash shows a file is unchanged, not that it was accurate, so every result shows its source tier.
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Write `src/app/(portal)/sources/page.tsx`**

```tsx
import { Sources } from '@/screens/Sources';

export default function Page() {
  return <Sources />;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/screens/Sources.test.tsx`
Expected: PASS (4 tests).

---

### Task D5: Evidence file page

**Files:**
- Create: `src/screens/EvidenceFile.tsx`, `src/app/(portal)/numbers/[phone]/page.tsx`
- Test: `tests/screens/EvidenceFile.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import { EvidenceFile } from '@/screens/EvidenceFile';

describe('EvidenceFile', () => {
  it('shows the number, its worst status with counts and the epoch certainty', async () => {
    renderWithProviders(<EvidenceFile phone="+14805550923" />);
    expect(await screen.findByRole('heading', { name: 'Evidence file · +14805550923' })).toBeInTheDocument();
    expect(screen.getByText('1 of 3 contacts NO_PROOF')).toBeInTheDocument();
    expect(screen.getByText(/Epoch boundary bounded/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Contacts' })).toHaveAttribute('href', '/contacts');
  });

  it('lists every contact with its own status, each basis and its labels', async () => {
    renderWithProviders(<EvidenceFile phone="+14805550923" />);
    const rows = await screen.findAllByTestId('evidence-contact');
    expect(rows).toHaveLength(3);
    expect(within(rows[0]).getByText('VERIFIED')).toBeInTheDocument();
    expect(rows[0]).toHaveTextContent('Marketing robocall (written) → VERIFIED');
    expect(within(rows[1]).getByText('reassignment uncertain')).toBeInTheDocument();
    expect(rows[2]).toHaveTextContent('NP_AFTER_OPT_OUT');
  });

  it('shows the eight proof elements with tier, hash and not measured', async () => {
    renderWithProviders(<EvidenceFile phone="+14805550923" />);
    const rows = await screen.findAllByTestId('proof-element');
    expect(rows).toHaveLength(8);
    expect(rows[1]).toHaveTextContent('Tier 1 · captured by CiV');
    expect(rows[1]).toHaveTextContent('c3ab…c4f2');
    expect(within(rows[7]).getByText('Not measured')).toBeInTheDocument();
    expect(screen.getByText('DNC scrub records not supplied')).toBeInTheDocument();
    expect(screen.getByText(/anchored \(OpenTimestamps \+ RFC 3161\)/)).toBeInTheDocument();
  });

  it('says so when there is no evidence file for the number', async () => {
    renderWithProviders(<EvidenceFile phone="+10000000000" />);
    expect(await screen.findByText('No evidence file for +10000000000.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/screens/EvidenceFile.test.tsx`
Expected: FAIL — cannot resolve `@/screens/EvidenceFile`.

- [ ] **Step 3: Write `src/screens/EvidenceFile.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { useEvidence } from '@/api/queries';
import { BASIS_LABEL, type ConsentStatus, type EvidenceFile as EvidenceFileData } from '@/api/types';
import { Card } from '@/components/Card';
import { StatusChip } from '@/components/StatusChip';
import { NotMeasured } from '@/components/NotMeasured';
import { TIER_LABEL, formatDate, formatDateTime, truncateHash } from '@/lib/format';
import { useSession } from '@/state/SessionContext';

const ORDER: ConsentStatus[] = ['NO_PROOF', 'CONFLICTING', 'WEAK', 'VERIFIED', 'PENDING'];
const CERTAINTY: Record<EvidenceFileData['epochCertainty'], string> = {
  known: 'Epoch boundary known (pinned to a day).',
  bounded: 'Epoch boundary bounded (a date range): contacts inside the range are labelled “reassignment uncertain”.',
  unknown: 'Epoch unknown: results carry “reassignment not checked”.',
};
const TH = 'py-2 pr-3 text-left text-[11.5px] font-normal uppercase tracking-[0.5px] text-muted';
const TD = 'py-2 pr-3 align-top';

export function EvidenceFile({ phone }: { phone: string }) {
  const { clientId } = useSession();
  const q = useEvidence(clientId, phone);
  if (q.isPending) return <p className="text-muted">Loading…</p>;
  if (!q.data) {
    return (
      <div className="flex flex-col gap-2">
        <Link href="/contacts">← Contacts</Link>
        <p className="text-muted">No evidence file for {phone}.</p>
      </div>
    );
  }
  const e = q.data;
  const total = ORDER.reduce((n, s) => n + (e.contactCounts[s] ?? 0), 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Link href="/contacts">← Contacts</Link>
        <h2 className="m-0 font-display text-[22px] font-semibold">Evidence file · {e.phoneE164}</h2>
        <span className="flex items-center gap-2 text-[13px]">
          <StatusChip status={e.worstStatus} />
          <span>{e.contactCounts[e.worstStatus]} of {total} contacts {e.worstStatus}</span>
        </span>
        <span className="text-[12.5px] text-muted">{CERTAINTY[e.epochCertainty]}</span>
      </div>

      <Card title="Contacts">
        <table className="w-full border-collapse text-[13px]">
          <thead><tr><th className={TH}>Time (UTC)</th><th className={TH}>Channel</th><th className={TH}>Dial mode</th><th className={TH}>Status</th><th className={TH}>Primary reason</th><th className={TH}>Why proof is needed → result</th><th className={TH}>Labels</th></tr></thead>
          <tbody>
            {e.contacts.map((c) => (
              <tr key={c.eventId} data-testid="evidence-contact" className="border-t border-line-soft">
                <td className={TD}>{formatDateTime(c.occurredAtUtc)}</td>
                <td className={TD}>{c.channel}</td>
                <td className={TD}>{c.dialMode ?? '—'}</td>
                <td className={TD}><StatusChip status={c.status} /></td>
                <td className={`${TD} font-mono text-xs`}>{c.primaryReasonCode}</td>
                <td className={TD}>
                  {c.bases.map((b) => <div key={b.basis} className="text-[12.5px]">{BASIS_LABEL[b.basis]} → {b.status}</div>)}
                  {!c.isLegalBasis && <div className="text-xs text-muted">Policy or undetermined basis only</div>}
                </td>
                <td className={TD}>{c.labels.map((l) => <span key={l} className="mr-1 rounded bg-line-soft px-1.5 text-xs">{l}</span>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Proof elements">
        <table className="w-full border-collapse text-[13px]">
          <thead><tr><th className={TH}>#</th><th className={TH}>Element</th><th className={TH}>Present</th><th className={TH}>Source tier</th><th className={TH}>Artifact hash</th><th className={TH}>Source</th><th className={TH}>Captured</th></tr></thead>
          <tbody>
            {e.proofElements.map((p) => (
              <tr key={p.number} data-testid="proof-element" className="border-t border-line-soft">
                <td className={TD}>{p.number}</td>
                <td className={TD}>{p.element}</td>
                <td className={TD}>{!p.applies ? 'Not applicable' : p.present === null ? <NotMeasured /> : p.present ? 'Yes' : 'No'}</td>
                <td className={TD}>{p.tier ? TIER_LABEL[p.tier] : '—'}</td>
                <td className={`${TD} font-mono text-xs`}>{truncateHash(p.artifactSha256)}</td>
                <td className={TD}>{p.sourceSystem ?? '—'}</td>
                <td className={TD}>{formatDate(p.capturedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card title="Opt-out history">
          {e.optOuts.length === 0
            ? <span className="text-[13px] text-muted">None on record.</span>
            : <ul className="m-0 list-none p-0 text-[13px]">{e.optOuts.map((o) => <li key={o.receivedAt}>{formatDateTime(o.receivedAt)} · {o.channel} · {o.method}</li>)}</ul>}
        </Card>
        <Card title="List checks">
          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[13px]">
            {e.listChecks.map((l) => (
              <li key={l.list} className="flex justify-between gap-3">
                <span>{l.list}</span>
                {l.onList === null ? <NotMeasured reason={l.label} /> : <span className="text-ink-2">{l.onList ? 'On list' : 'Not on list'} · {l.label}</span>}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <span className="text-xs text-muted">
        Merkle root {truncateHash(e.merkle.root)} for {formatDate(e.merkle.date)} · {e.merkle.anchored ? 'anchored (OpenTimestamps + RFC 3161)' : 'anchor pending'} · run {e.runId}.
        A hash shows a file is unchanged since capture, not that it was accurate; the tier says where it came from.
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Write `src/app/(portal)/numbers/[phone]/page.tsx`**

```tsx
import { EvidenceFile } from '@/screens/EvidenceFile';

export default async function Page({ params }: { params: Promise<{ phone: string }> }) {
  const { phone } = await params;
  return <EvidenceFile phone={decodeURIComponent(phone)} />;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/screens/EvidenceFile.test.tsx`
Expected: PASS (4 tests).

---

### Task D6: Rulebook page (internal roles)

**Files:**
- Create: `src/screens/Rulebook.tsx`, `src/screens/rulebook/RulebookContent.tsx`, `src/app/(portal)/rulebook/page.tsx`
- Test: `tests/screens/Rulebook.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import { Rulebook } from '@/screens/Rulebook';

describe('Rulebook', () => {
  it('shows versions with status and counsel approval, and the strict-versus-lenient impact', async () => {
    renderWithProviders(<Rulebook />, { session: { role: 'counsel' } });
    const row = (await screen.findByText('rb-2026.10-p')).closest('tr') as HTMLElement;
    expect(within(row).getByText('provisional')).toBeInTheDocument();
    expect(row).toHaveTextContent('Counsel approval pending');
    const impact = screen.getByText('autodialed_modes').closest('tr') as HTMLElement;
    expect(impact).toHaveTextContent('A12');
    expect(impact).toHaveTextContent('6,120 of 48,210 (12.7%)');
  });

  it('is not available to client roles', async () => {
    renderWithProviders(<Rulebook />, { session: { role: 'owner' } });
    expect(await screen.findByText('This page is not available for your role.')).toBeInTheDocument();
    expect(screen.queryByText('rb-2026.10-p')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/screens/Rulebook.test.tsx`
Expected: FAIL — cannot resolve `@/screens/Rulebook`.

- [ ] **Step 3: Write the rulebook content and the role-gated screen, one file each**

`src/screens/rulebook/RulebookContent.tsx`:
```tsx
'use client';

import { useRulebookImpact, useRulebookVersions } from '@/api/queries';
import { Card } from '@/components/Card';
import { PageHeading } from '@/components/PageHeading';
import { TextChip } from '@/components/TextChip';
import { formatCount, formatPercent } from '@/lib/format';

const TH = 'py-2 pr-3 text-left text-[11.5px] font-normal uppercase tracking-[0.5px] text-muted';
const TD = 'py-2 pr-3';
const STATUS_TONE = { approved: 'ok', provisional: 'warn', draft: 'neutral' } as const;

export function RulebookContent() {
  const versions = useRulebookVersions();
  const impact = useRulebookImpact();
  if (versions.isPending || impact.isPending) return <p className="text-muted">Loading…</p>;

  return (
    <div className="flex flex-col gap-5">
      <PageHeading title="Rulebook" aside="Internal" />
      <Card title="Versions">
        <table className="w-full border-collapse text-[13px]">
          <thead><tr><th className={TH}>Version</th><th className={TH}>Status</th><th className={TH}>Published</th><th className={TH}>Approved by</th><th className={TH}>Counsel</th><th className={TH}>Notes</th></tr></thead>
          <tbody>
            {(versions.data ?? []).map((v) => (
              <tr key={v.versionId} className="border-t border-line-soft">
                <td className={`${TD} font-mono`}>{v.versionId}</td>
                <td className={TD}><TextChip tone={STATUS_TONE[v.status]}>{v.status}</TextChip></td>
                <td className={TD}>{v.publishedAt}</td>
                <td className={TD}>{v.approvedBy ?? '—'}</td>
                <td className={TD}>{v.counselApprovedBy ?? 'Counsel approval pending'}</td>
                <td className={TD}>{v.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <span className="text-xs text-muted">An approved version may contain no unset setting, and every status-affecting setting must be counsel-approved; the loader refuses otherwise.</span>
      </Card>
      <Card title="Impact of contested settings" aside="Strict versus lenient, on the selected client">
        <table className="w-full border-collapse text-[13px]">
          <thead><tr><th className={TH}>Setting</th><th className={TH}>Counsel item</th><th className={TH}>Strict</th><th className={TH}>Lenient</th><th className={TH}>Contacts changing status</th></tr></thead>
          <tbody>
            {(impact.data ?? []).map((r) => (
              <tr key={r.key} className="border-t border-line-soft">
                <td className={`${TD} font-mono`}>{r.key}</td>
                <td className={TD}>{r.counselItem}</td>
                <td className={TD}>{r.strictValue}</td>
                <td className={TD}>{r.lenientValue}</td>
                <td className={TD}>
                  {formatCount(r.contactsChangingStatus)} of {formatCount(r.contactsEvaluated)} ({formatPercent(r.contactsEvaluated === 0 ? null : (100 * r.contactsChangingStatus) / r.contactsEvaluated)})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
```

`src/screens/Rulebook.tsx`:
```tsx
'use client';

import { INTERNAL_ROLES } from '@/api/types';
import { RequireRole } from '@/state/RequireRole';
import { RulebookContent } from './rulebook/RulebookContent';

export function Rulebook() {
  return <RequireRole roles={INTERNAL_ROLES}><RulebookContent /></RequireRole>;
}
```

- [ ] **Step 4: Write `src/app/(portal)/rulebook/page.tsx`**

```tsx
import { Rulebook } from '@/screens/Rulebook';

export default function Page() {
  return <Rulebook />;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/screens/Rulebook.test.tsx`
Expected: PASS (2 tests).

---

### Task D7: Final verification of Module 1

- [ ] **Step 1: Type-check, full test run, production build**

Run: `npm run typecheck && npm run test && npm run build`
Expected: no type errors; all tests pass — 73 tests (Parts A–C 54; Opt-out tests 3; Lead Inspector 3; Fix list 3; Sources 4; Evidence file 4; Rulebook 2); build succeeds and lists the routes `/`, `/contacts`, `/metrics`, `/opt-out-tests`, `/lead-inspector`, `/fix-list`, `/sources`, `/numbers/[phone]`, `/rulebook`, `/api/[...path]`.

- [ ] **Step 2: Wording scan of the source tree**

Run:
```bash
grep -rniE 'violation|breach|illegal|compromised|fake|fraud|genuine|non-compliant|noncompliant|ensures compliance|protects you|guarantee' src --include='*.ts' --include='*.tsx' | grep -v 'src/lib/wording.ts'
```
Expected: no output.

- [ ] **Step 3: Walk every screen against the prototype**

Run `npm run dev`, open the printed URL, and open the prototype artifact beside it. For each of the seven screens confirm layout, order, copy and colours match, apart from the deliberate differences listed in each part's self-review. Then:
- On **Contacts**, select the second row and press "Open evidence file": the evidence file for +14805550923 opens; "← Contacts" returns.
- On **Sources**, press "Revoke access" on Twilio SMS: the status becomes "Revoked".
- Open `/rulebook` directly: "This page is not available for your role." (the sample session is an owner).
Stop the server.

- [ ] **Step 4: Confirm the contract and the design doc still agree**

[../design.md](../design.md) §14 was updated on 2026-10-03 with the endpoints the screens use (`contacts`, `revocation`, `leads`, `sources`, `sources/{sid}/revoke`, `uploads?type=&name=`, `session`). Open it and compare each line with the paths in `src/mock/api.ts`.
Expected: every path the mock serves appears in §14. If a path or a field in `src/api/types.ts` changed while building, update §14 in the same sitting and note the change at the top of this file.

---

## Part D self-review

- **Prototype coverage:** Opt-out tests (three tiles, 4 × 4 matrix, info columns, cell tones, footnote), Lead Inspector (four tiles, vendor table with grade chips and month-on-month, consumer-report notice), Fix list (severity, title, step, family, status, counsel-library note), Sources (ten rows, tier, access, last sync, status chips, hash note) each have a task and tests.
- **Beyond the prototype, from the specs:** editable fix status by role (spec §9 Fix list); one-click revoke (spec §10 Security); upload recorded with its hash (FR-ACQ-1); the evidence file page with per-contact statuses, bases, eight proof elements with tiers and hashes, list checks and the Merkle anchor line (spec §9 Evidence file); the internal rulebook page with versions and strict-versus-lenient impact (rulebook §2).
- **Deliberate differences from the prototype:** M08 reads "6.0 h median"; the Sources legend and column say Tier, not Grade; the matrix is a real `<table>` with header cells so screen readers announce channel and system.
- **Not in Module 1:** login (Django authentication, module 6); the PDF and export behind the two header buttons (module 6); per-vendor dispute lists (module 11); browser end-to-end tests (added when the real API exists).
- **Type consistency:** `EvidenceFile` is the screen and `EvidenceFileData` the imported type alias; `useRevokeSource`, `useUpload`, `useLeads`, `useRevocation`, `useFindings`, `useSetFindingStatus` match Part B; test ids used: `fix`, `cell-body`, `evidence-contact`, `proof-element`; `TextChip` tones `ok | warn | neutral | bad` match Part B.
- **No placeholders:** complete code and exact commands in every step.
