# Frontend Portal — Part A: Foundation (Module 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the portal project with the prototype's design system, the wording guard, the formatting helpers and the API contract that every later part and every backend module builds on.

**Architecture:** A Next.js App Router app under `frontend/` (the backend lives separately in `backend/`). Screens are client components in `src/screens/` so they can be tested without the router; `src/app/` pages are thin wrappers. `src/api/types.ts` is the contract with the backend. Until the Django backend exists, one catch-all Next route handler serves sample data from an in-memory mock (Part B). Later the mock is deleted and Next.js forwards `/api/*` to the Django API, without touching a screen.

**Tech Stack:** Next.js (App Router) + React + TypeScript, Tailwind CSS 3 with the prototype's tokens, `next/font` (Newsreader, IBM Plex Sans, IBM Plex Mono), TanStack Query 5, Vitest 2 + Testing Library + MSW 2 + jsdom. Frontend stack chosen by the owner on 2026-10-03: Next.js and TypeScript. The backend will be Django (Python) on PostgreSQL; the portal reaches it only through paths under `/api`.

**Design source of truth:** [../design-reference/portal-prototype.dc.html](../design-reference/portal-prototype.dc.html) — the CiV Audit Portal Prototype (Sep 29, 2026). Seven screens: Overview, Contacts, Metrics, Opt-out tests, Lead Inspector, Fix list, Sources. Where the prototype and the v1.1 specs differ, v1.1 wins: sources are **tiers 1–4** (the prototype says grade A–D), the M08 example median is **6.0 h** (the prototype says 13.0 h), and low-confidence locations read **"possible (location uncertain)"**.

**No git steps.** Version control is not set up in this folder (owner's choice). Each task ends with a verification step.

**Conventions (owner, 2026-10-03):** `frontend/` and `backend/` are separate folders and never import from each other. One React component per file — never a single file holding several components; a screen's own pieces live in a folder named after the screen. Comments are short and only where the reason is not obvious from the code. The project runs locally until it is complete; hosting is chosen afterwards.

**Plan parts:** A (this file) → [B: data, mock API, shell](2026-10-03-01b-portal-data-and-shell.md) → C: Overview, Contacts, Metrics → D: Opt-out tests, Lead Inspector, Fix list, Sources, evidence file, rulebook, final verification.

---

## File structure (whole module)

```
frontend/
├── package.json
├── next.config.ts
├── tailwind.config.ts            prototype tokens: colors, fonts, radii
├── postcss.config.js
├── vitest.config.ts              jsdom, "@" alias, setup file
├── vitest.setup.ts               jest-dom, MSW server, next/link + next/navigation mocks
├── tests/
│   ├── nav.ts                    mutable pathname / params / push used by the navigation mock
│   ├── utils.tsx                 renderWithProviders
│   └── **/*.test.ts(x)
└── src/
    ├── app/
    │   ├── layout.tsx            fonts, <html>, global CSS
    │   ├── globals.css
    │   ├── providers.tsx         QueryClient + Session + Run providers (client)
    │   ├── (portal)/layout.tsx   PortalShell
    │   ├── (portal)/page.tsx                     Overview
    │   ├── (portal)/contacts/page.tsx
    │   ├── (portal)/metrics/page.tsx
    │   ├── (portal)/opt-out-tests/page.tsx
    │   ├── (portal)/lead-inspector/page.tsx
    │   ├── (portal)/fix-list/page.tsx
    │   ├── (portal)/sources/page.tsx
    │   ├── (portal)/numbers/[phone]/page.tsx     Evidence file
    │   ├── (portal)/rulebook/page.tsx            internal roles only
    │   └── api/[...path]/route.ts                mock API (dev) — deleted in module 6, when /api is forwarded to the Django API
    ├── api/
    │   ├── types.ts              THE CONTRACT
    │   ├── client.ts             fetch wrappers
    │   └── queries.ts            TanStack Query hooks
    ├── mock/
    │   ├── fixtures.ts           the prototype's sample data ("Acme Solar"), with v1.1 corrections
    │   └── api.ts                mockApi(request) → response; used by the route handler and by MSW
    ├── lib/
    │   ├── wording.ts            banned-word guard
    │   ├── format.ts             one decimal, "not measured", tiers, dates
    │   ├── tone.ts               status / severity / grade colour pairs from the prototype
    │   └── chip.ts               shape shared by every chip
    ├── state/
    │   ├── SessionContext.tsx
    │   ├── RunContext.tsx
    │   └── RequireRole.tsx
    ├── components/
    │   ├── PortalShell.tsx       sidebar + header + main
    │   ├── Sidebar.tsx
    │   ├── Header.tsx
    │   ├── ProvisionalWatermark.tsx
    │   ├── Disclosure.tsx
    │   ├── Card.tsx              white rounded panel
    │   ├── StatTile.tsx          metric tile
    │   ├── PageHeading.tsx
    │   ├── StatusChip.tsx
    │   ├── SeverityChip.tsx
    │   ├── GradeChip.tsx
    │   ├── TextChip.tsx
    │   └── NotMeasured.tsx
    └── screens/
        ├── Overview.tsx
        ├── overview/             ScoreTile.tsx, StatusMix.tsx, FamilyScores.tsx, AlertList.tsx
        ├── Contacts.tsx
        ├── ContactDetail.tsx
        ├── contacts/             ContactDetailBody.tsx, DetailField.tsx
        ├── Metrics.tsx
        ├── OptOutTests.tsx
        ├── LeadInspector.tsx
        ├── FixList.tsx
        ├── Sources.tsx
        ├── EvidenceFile.tsx
        ├── Rulebook.tsx
        └── rulebook/             RulebookContent.tsx
```

---

### Task A0: Scaffold Next.js, Tailwind 3, fonts and Vitest

**Files:**
- Create: `frontend/` (via create-next-app), `frontend/tailwind.config.ts`, `frontend/postcss.config.js`, `frontend/vitest.config.ts`, `frontend/vitest.setup.ts`, `frontend/tests/nav.ts`
- Modify: `frontend/src/app/layout.tsx`, `frontend/src/app/globals.css`, `frontend/package.json`

- [ ] **Step 1: Create the app and install dependencies**

Run:
```bash
cd /home/shakib/Audit
npx create-next-app@latest frontend --ts --eslint --app --src-dir --no-tailwind --import-alias "@/*" --use-npm --disable-git --yes
cd frontend
npm install @tanstack/react-query@5
npm install -D tailwindcss@3 postcss autoprefixer vitest@2 vite@5 @vitejs/plugin-react@4 jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event msw@2
```
Expected: `frontend/src/app/layout.tsx` and `frontend/src/app/page.tsx` exist. `vite@5` and `@vitejs/plugin-react@4` are pinned because Vitest 2 runs on Vite 5; newer plugin versions pull a second Vite and break the type-check. create-next-app also writes `AGENTS.md`, which says to check the docs bundled in `node_modules/next/dist/docs/` — the Tailwind 3, Vitest and route-handler guides there match this plan (checked against Next.js 16.3.8). `--disable-git` stops create-next-app from creating a git repository (version control is set up later by the owner). If `frontend/.git` exists anyway, delete that folder.

- [ ] **Step 2: Write `frontend/postcss.config.js`**

```js
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
```
Delete `frontend/postcss.config.mjs` if create-next-app generated one.

- [ ] **Step 3: Write `frontend/tailwind.config.ts` with the prototype's tokens**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: '#EFECE5',        // outside the app frame
        canvas: '#F6F4EF',      // app background, header, soft tiles
        sidebar: '#FBFAF7',
        surface: '#FFFFFF',     // cards
        line: '#DDD8CD',        // card and layout borders
        'line-soft': '#ECE8DF', // row dividers, bar tracks
        control: '#C9C3B6',     // button and pill borders
        ink: '#1B2226',         // body text
        'ink-deep': '#1B2A2F',  // dark tile, active nav
        'ink-2': '#3E474C',     // secondary text
        'ink-3': '#2B3438',     // nav text
        muted: '#5B6469',       // captions
        accent: '#0F5E63',      // primary button, links, bars
        'accent-deep': '#0A4347',
        ok: { bg: '#E1F0E8', fg: '#0B5A3F', bar: '#2E7D5B' },
        warn: { bg: '#FBEAD0', fg: '#7A4300', bar: '#C98A2B' },
        conflict: { bg: '#FCE1D3', fg: '#8C2E0B', bar: '#B4532A' },
        bad: { bg: '#F6D6D6', fg: '#7F1616', bar: '#7F1616' },
        info: { bg: '#E6ECEE', fg: '#2B3438' },
        teal: { bg: '#E4EEF0', fg: '#0F4F54' },
        selected: '#EAF1EF',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: { card: '14px', tile: '12px' },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Replace `frontend/src/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body { @apply bg-page font-sans text-ink; margin: 0; }
a { @apply text-accent; }
a:hover { @apply text-accent-deep; }
```

- [ ] **Step 5: Replace `frontend/src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from 'next/font/google';
import './globals.css';

const display = Newsreader({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-display' });
const sans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-sans' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' });

export const metadata: Metadata = { title: 'Comply iV — TCPA evidence portal' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: Write `frontend/vitest.config.ts`**

```ts
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    css: false,
  },
});
```

- [ ] **Step 7: Write `frontend/tests/nav.ts`**

```ts
import { vi } from 'vitest';

/** Mutable navigation state read by the next/navigation mock. Tests set fields before rendering. */
export const navState: { pathname: string; params: Record<string, string>; push: ReturnType<typeof vi.fn> } = {
  pathname: '/',
  params: {},
  push: vi.fn(),
};

export function resetNav(): void {
  navState.pathname = '/';
  navState.params = {};
  navState.push = vi.fn();
}
```

- [ ] **Step 8: Write `frontend/vitest.setup.ts`** (the MSW lines are added in Part B, Task B2)

```ts
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { afterEach, vi } from 'vitest';
import { navState, resetNav } from './tests/nav';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string | { pathname: string }; children: React.ReactNode }) =>
    React.createElement('a', { href: typeof href === 'string' ? href : href.pathname, ...rest }, children),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => navState.pathname,
  useParams: () => navState.params,
  useRouter: () => ({ push: navState.push }),
}));

afterEach(() => resetNav());
```

- [ ] **Step 9: Add scripts to `frontend/package.json`**

Inside `"scripts"` add:
```json
"test": "vitest run",
"typecheck": "next typegen && tsc --noEmit"
```
And in `frontend/tsconfig.json` add `"types": ["vitest/globals", "@testing-library/jest-dom"]` under `compilerOptions` (the generated `include` already covers `tests/`). `next typegen` runs first so the route types under `.next/` match the current pages.

- [ ] **Step 10: Verify the toolchain**

Run: `npx vitest run --passWithNoTests && npm run typecheck`
Expected: "No test files found", exit code 0; no type errors.

---

### Task A1: Wording guard

**Files:**
- Create: `frontend/src/lib/wording.ts`
- Test: `frontend/tests/lib/wording.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { assertNoBannedWords, assertNoBannedWordsDeep, findBannedWords } from '@/lib/wording';

describe('wording guard', () => {
  it('passes the approved phrasings', () => {
    expect(findBannedWords('CiV found 14 contacts after opt-out')).toEqual([]);
    expect(findBannedWords('No consent proof supplied')).toEqual([]);
    expect(findBannedWords('Few risk signals')).toEqual([]);
    expect(findBannedWords('S3 Object Lock in compliance mode')).toEqual([]);
  });

  it('finds banned words regardless of case and plural', () => {
    expect(findBannedWords('14 Violations found')).toEqual(['violations']);
    expect(findBannedWords('This call was illegal.')).toEqual(['illegal']);
    expect(findBannedWords('CiV ensures compliance')).toEqual(['ensures compliance']);
    expect(findBannedWords('a fake lead')).toEqual(['fake']);
  });

  it('assertNoBannedWords throws with context', () => {
    expect(() => assertNoBannedWords('non-compliant vendor', 'M07')).toThrow(/M07.*non-compliant/);
    expect(() => assertNoBannedWords('sources conflict', 'M07')).not.toThrow();
  });

  it('walks nested values and names the path', () => {
    expect(() => assertNoBannedWordsDeep({ a: [{ b: 'fraud signal' }] }, 'fx')).toThrow(/fx\.a\[0\]\.b.*fraud/);
    expect(() => assertNoBannedWordsDeep({ a: [{ b: 'risk signal' }], n: 3 }, 'fx')).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/wording.test.ts`
Expected: FAIL — cannot resolve `@/lib/wording`.

- [ ] **Step 3: Write `frontend/src/lib/wording.ts`**

```ts
/** Words and phrases no client-visible text may contain (engineering spec §9). */
export const BANNED_WORDS = [
  'violation', 'violations', 'breach', 'breaches', 'illegal', 'compromised',
  'fake', 'fraud', 'fraudulent', 'genuine', 'compliant', 'non-compliant',
  'noncompliant', 'ensures compliance', 'protects you', 'guaranteed', 'guarantee',
] as const;

const patterns = BANNED_WORDS.map((word) => ({
  word,
  re: new RegExp(`(^|[^a-z])${word.replace(/[-\s]/g, '[-\\s]')}(?=$|[^a-z])`, 'i'),
}));

/** Returns every banned word found in `text`, in list order. */
export function findBannedWords(text: string): string[] {
  return patterns.filter((p) => p.re.test(text)).map((p) => p.word);
}

/** Throws if `text` contains banned wording. `context` names the source in the error. */
export function assertNoBannedWords(text: string, context = 'text'): void {
  const found = findBannedWords(text);
  if (found.length > 0) throw new Error(`Banned wording in ${context}: ${found.join(', ')}`);
}

/** Walks any JSON-like value and asserts every string in it is free of banned words. */
export function assertNoBannedWordsDeep(value: unknown, context = 'value'): void {
  if (typeof value === 'string') return assertNoBannedWords(value, context);
  if (Array.isArray(value)) return value.forEach((v, i) => assertNoBannedWordsDeep(v, `${context}[${i}]`));
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) assertNoBannedWordsDeep(v, `${context}.${k}`);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/wording.test.ts`
Expected: PASS (4 tests).

---

### Task A2: Format helpers and colour tones

**Files:**
- Create: `frontend/src/lib/format.ts`, `frontend/src/lib/tone.ts`
- Test: `frontend/tests/lib/format.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { NOT_MEASURED, TIER_LABEL, formatCount, formatDate, formatDateTime, formatPercent, formatScore, formatTiers, truncateHash } from '@/lib/format';
import { gradeTone, severityTone, statusTone } from '@/lib/tone';

describe('format', () => {
  it('shows one decimal', () => {
    expect(formatPercent(89.96)).toBe('90.0%');
    expect(formatScore(81.34)).toBe('81.3');
  });
  it('renders null as not measured', () => {
    expect(formatPercent(null)).toBe(NOT_MEASURED);
    expect(formatScore(null)).toBe(NOT_MEASURED);
  });
  it('formats counts, dates and hashes', () => {
    expect(formatCount(10000)).toBe('10,000');
    expect(formatDate('2026-09-30T23:59:00Z')).toBe('Sep 30, 2026');
    expect(formatDateTime('2026-09-29T14:02:00Z')).toBe('Sep 29, 14:02');
    expect(formatDate(null)).toBe('—');
    expect(truncateHash('9f2c0000000000000000000000000000000000000000000000000000000004a1e')).toBe('9f2c…4a1e');
    expect(truncateHash(null)).toBe('—');
  });
  it('labels tiers by where content came from', () => {
    expect(TIER_LABEL[1]).toBe('Tier 1 · captured by CiV');
    expect(TIER_LABEL[4]).toBe('Tier 4 · uploaded by you');
    expect(formatTiers([1, 2])).toBe('Tier 1 + 2');
    expect(formatTiers([])).toBe('—');
  });
});

describe('tone', () => {
  it('maps statuses, severities and grades to the prototype colour pairs', () => {
    expect(statusTone('VERIFIED')).toEqual({ bg: 'bg-ok-bg', fg: 'text-ok-fg', bar: 'bg-ok-bar' });
    expect(statusTone('NO_PROOF').bg).toBe('bg-bad-bg');
    expect(severityTone('high').fg).toBe('text-bad-fg');
    expect(gradeTone('B').bg).toBe('bg-teal-bg');
    expect(gradeTone(null).bg).toBe('bg-line-soft');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/format.test.ts`
Expected: FAIL — cannot resolve `@/lib/format`.

- [ ] **Step 3: Write `frontend/src/lib/format.ts`**

```ts
import type { Tier } from '@/api/types';

export const NOT_MEASURED = 'Not measured';

export function formatPercent(value: number | null): string {
  return value === null ? NOT_MEASURED : `${value.toFixed(1)}%`;
}

export function formatScore(value: number | null): string {
  return value === null ? NOT_MEASURED : value.toFixed(1);
}

export function formatCount(n: number): string {
  return n.toLocaleString('en-US');
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Sep 30, 2026" (UTC). */
export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/** "Sep 29, 14:02" (UTC). */
export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${hh}:${mm}`;
}

export function truncateHash(sha256: string | null): string {
  return sha256 ? `${sha256.slice(0, 4)}…${sha256.slice(-4)}` : '—';
}

export const TIER_LABEL: Record<Tier, string> = {
  1: 'Tier 1 · captured by CiV',
  2: 'Tier 2 · third-party API',
  3: 'Tier 3 · your systems by API',
  4: 'Tier 4 · uploaded by you',
};

export function formatTiers(tiers: Tier[]): string {
  return tiers.length === 0 ? '—' : `Tier ${tiers.join(' + ')}`;
}
```

- [ ] **Step 4: Write `frontend/src/lib/tone.ts`**

```ts
import type { ConsentStatus, Grade, Severity } from '@/api/types';

export interface Tone { bg: string; fg: string; bar?: string }

const STATUS: Record<ConsentStatus, Required<Tone>> = {
  VERIFIED: { bg: 'bg-ok-bg', fg: 'text-ok-fg', bar: 'bg-ok-bar' },
  WEAK: { bg: 'bg-warn-bg', fg: 'text-warn-fg', bar: 'bg-warn-bar' },
  CONFLICTING: { bg: 'bg-conflict-bg', fg: 'text-conflict-fg', bar: 'bg-conflict-bar' },
  NO_PROOF: { bg: 'bg-bad-bg', fg: 'text-bad-fg', bar: 'bg-bad-bar' },
  PENDING: { bg: 'bg-line-soft', fg: 'text-ink-2', bar: 'bg-line' },
};

const SEVERITY: Record<Severity, Tone> = {
  high: { bg: 'bg-bad-bg', fg: 'text-bad-fg' },
  medium: { bg: 'bg-warn-bg', fg: 'text-warn-fg' },
  low: { bg: 'bg-info-bg', fg: 'text-info-fg' },
};

const GRADE: Record<Grade, Tone> = {
  A: { bg: 'bg-ok-bg', fg: 'text-ok-fg' },
  B: { bg: 'bg-teal-bg', fg: 'text-teal-fg' },
  C: { bg: 'bg-warn-bg', fg: 'text-warn-fg' },
  D: { bg: 'bg-conflict-bg', fg: 'text-conflict-fg' },
  F: { bg: 'bg-bad-bg', fg: 'text-bad-fg' },
};

export const NEUTRAL: Tone = { bg: 'bg-line-soft', fg: 'text-ink-2' };

export const statusTone = (s: ConsentStatus): Required<Tone> => STATUS[s];
export const severityTone = (s: Severity): Tone => SEVERITY[s];
export const gradeTone = (g: Grade | null): Tone => (g ? GRADE[g] : NEUTRAL);
```

- [ ] **Step 5: Run test to verify it fails for the right reason**

Run: `npx vitest run tests/lib/format.test.ts`
Expected: FAIL — cannot resolve `@/api/types` (created in Task A3). Continue to Task A3, then re-run in its last step.

---

### Task A3: The API contract (`types.ts`)

**Files:**
- Create: `frontend/src/api/types.ts`

- [ ] **Step 1: Write `frontend/src/api/types.ts`**

```ts
// The frontend's contract with the backend. Mirrors design.md §14 (API) and §1 (data model).
// Screens follow the CiV Audit Portal Prototype; wording follows the v1.1 specs.

export type Role = 'owner' | 'legal' | 'operations' | 'read_only' | 'admin' | 'counsel' | 'engineer';
export type EngagementMode = 'direct' | 'counsel_directed';
export type OutputVisibility = 'client' | 'internal';
export type RulebookStatus = 'draft' | 'provisional' | 'approved';
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';
export type Tier = 1 | 2 | 3 | 4;
export type ConsentStatus = 'NO_PROOF' | 'CONFLICTING' | 'WEAK' | 'VERIFIED' | 'PENDING';
export type Severity = 'high' | 'medium' | 'low';
export type FindingStatus = 'open' | 'in_progress' | 'resolved' | 'reopened';
export type Basis = 'robocall_marketing' | 'robocall_informational' | 'dnc_listed' | 'dnc_unknown' | 'state_law' | 'civ_policy';
export type Family = 'Permission' | 'Stopping' | 'Who you contact' | 'How you contact' | 'Records and company controls' | 'Lead Inspector';

export const INTERNAL_ROLES: Role[] = ['admin', 'counsel', 'engineer'];
export const DISCLOSURE = 'CiV is not a law firm; findings are measurements, not legal advice.';

export const BASIS_LABEL: Record<Basis, string> = {
  robocall_marketing: 'Marketing robocall (written)',
  robocall_informational: 'Informational robocall',
  dnc_listed: 'Number on DNC scrub list',
  dnc_unknown: 'DNC list not supplied',
  state_law: 'State law',
  civ_policy: 'CiV policy only',
};

export interface Session {
  userId: string;
  clientId: string;
  clientName: string;
  role: Role;
  engagementMode: EngagementMode;
  reportPeriod: { from: string; to: string };
  sampleData: boolean;
}

export interface Run {
  runId: string;
  kind: 'nightly' | 'backfill' | 'report' | 'phase0';
  evaluationAsOf: string;
  rulebookVersion: string;
  rulebookStatus: RulebookStatus;
  codeVersion: string;
  variant: 'single' | 'strict' | 'lenient';
  outputVisibility: OutputVisibility;
  finishedAt: string | null;
}

export interface FamilyScore { family: string; score: number | null }

export interface Score {
  runId: string;
  overall: number | null;
  grade: Grade | null;
  hardCap: { cappedGrade: Grade; share: number; capShare: number } | null;
  provisional: boolean;
  checkpointsRun: number;
  checkpointsTotal: number;
  contactsInPeriod: number;
  families: FamilyScore[];
}

export interface MetricSnapshot {
  metricCode: string;
  name: string;
  family: Family;
  source: 'CiV' | 'Client' | 'AI';
  value: number | null;          // null when the display is not a single number, or not measured
  display: string;               // formatted by the backend, e.g. "88.0%", "14", "180 · 310"
  note: string;                  // one line under the value
  detail?: string;               // fuller sentence for the Overview tile; falls back to note
  missingReason: string | null;  // e.g. "Client query logs not supplied" → shown as "Not measured"
  breakdown: Record<string, number>;
}

export type CheckState = 'pass' | 'fails' | 'gap' | 'not_reached';

export interface ContactRow {
  eventId: string;
  occurredAtUtc: string;
  phoneDisplay: string;          // masked for the list
  phoneE164: string;             // used to open the evidence file
  channel: 'Call' | 'Text';
  category: 'Marketing' | 'Informational' | 'Unknown';
  bases: Basis[];
  status: ConsentStatus;
  primaryReasonCode: string;
  reasonText: string;
  checks: [CheckState, CheckState, CheckState, CheckState, CheckState];
  proofSummary: string;
  tiers: Tier[];
  labels: string[];
  artifactSha256: string | null;
}

export interface Alert {
  alertId: string;
  severity: Severity;
  title: string;
  when: string;
  routedTo: 'legal' | 'all';
}

export interface MatrixCell {
  channel: 'Reply STOP' | 'Plain-words reply' | 'Spoken on a call' | 'Web or email';
  system: 'Dialer' | 'SMS platform' | 'CRM' | 'Lead platform';
  tested: boolean;
  never: boolean;
  medianHours: number | null;
  testCount: number;
  indicative: boolean;
  slow: boolean;
}

export interface RevocationSummary {
  windowDays: number;
  testCount: number;
  medianHours: number | null;
  p90: number | 'NEVER' | null;
  notStoppedByDeadline: number;   // M09a
  contactedAfterDeadline: number; // M09b
  deadlineBusinessDays: number;
  minTestsPerCell: number;
  cells: MatrixCell[];
}

export interface VendorScore {
  vendorId: string;
  name: string;
  subId: string | null;
  leads: number;
  highSignals: number;
  score: number | null;
  grade: Grade | null;
  notEnoughData: boolean;
  monthOnMonth: number | null;
  dropAlert: boolean;
}

export interface LeadSummary {
  leadsInspected: number;
  few: number;
  some: number;
  high: number;
  disputeCandidates: number;
  vendors: VendorScore[];
}

export interface Finding {
  findingId: string;
  severity: Severity;
  title: string;
  step: string;
  family: string;
  status: FindingStatus;
}

export type SourceStatus = 'ok' | 'stale' | 'not_supplied' | 'revoked';

export interface Source {
  sourceId: string;
  name: string;
  tier: Tier;
  access: string;
  lastSyncAt: string | null;
  status: SourceStatus;
  revocable: boolean;
  acceptsUpload: boolean;
}

export interface UploadResult {
  artifactId: string;
  sha256: string;
  uploadType: string;
  receivedAt: string;
}

export interface BasisEvaluation { basis: Basis; status: ConsentStatus; codes: string[]; proofId: string | null }

export interface EvidenceContact {
  eventId: string;
  occurredAtUtc: string;
  channel: 'Call' | 'Text';
  dialMode: string | null;
  status: ConsentStatus;
  primaryReasonCode: string;
  bases: BasisEvaluation[];
  isLegalBasis: boolean;
  labels: string[];
}

export interface ProofElement {
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  element: string;
  applies: boolean;
  present: boolean | null;       // null = not measured
  tier: Tier | null;
  artifactSha256: string | null;
  sourceSystem: string | null;
  capturedAt: string | null;
}

export interface EvidenceFile {
  phoneE164: string;
  epochId: string;
  epochCertainty: 'known' | 'bounded' | 'unknown';
  worstStatus: ConsentStatus;
  contactCounts: Record<ConsentStatus, number>;
  contacts: EvidenceContact[];
  proofElements: ProofElement[];
  optOuts: { receivedAt: string; channel: string; method: string }[];
  listChecks: { list: string; onList: boolean | null; label: string }[];
  merkle: { date: string; root: string; anchored: boolean };
  runId: string;
}

export interface RulebookVersion {
  versionId: string;
  status: RulebookStatus;
  publishedAt: string;
  approvedBy: string | null;
  counselApprovedBy: string | null;
  notes: string;
}

export interface ImpactRow {
  key: string;
  counselItem: string;
  strictValue: string;
  lenientValue: string;
  contactsEvaluated: number;
  contactsChangingStatus: number;
}
```

- [ ] **Step 2: Run the Task A2 tests and type-check**

Run: `npx vitest run tests/lib && npm run typecheck`
Expected: PASS — wording (4 tests), format + tone (5 tests); no type errors.

---

## Part A self-review

- **Prototype coverage:** tokens in Task A0 are the exact hex values from the prototype (`#F6F4EF`, `#1B2A2F`, `#0F5E63`, status pairs, borders); fonts are the prototype's three families; the contract in Task A3 has a type for each of the seven screens' data (Score + MetricSnapshot + Alert → Overview; ContactRow → Contacts; MetricSnapshot → Metrics; RevocationSummary → Opt-out tests; LeadSummary → Lead Inspector; Finding → Fix list; Source → Sources) plus EvidenceFile and the internal rulebook types from the v1.1 specs.
- **v1.1 corrections applied:** `Tier` 1–4 and `TIER_LABEL` replace grade A–D; `Basis` includes `dnc_unknown` and `state_law`; `ContactRow.bases` is a list (per-basis evaluation); `Score.hardCap` carries the share and the cap so the note can be rendered.
- **Type consistency:** `Severity`, `Grade`, `ConsentStatus`, `Tier` are defined once in `types.ts` and imported by `format.ts` and `tone.ts`. `formatTiers` takes `Tier[]`, matching `ContactRow.tiers`.
- **No placeholders:** every step has complete code or an exact command with its expected result.
