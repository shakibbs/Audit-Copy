# CiV client portal (frontend)

Next.js + TypeScript portal for the Comply iV Automated TCPA Audit System. It runs against a mock API until the Django backend exists.

Design source: `../docs/design-reference/complyiv-portal-audit.html`. Feature source: `../docs/feature-list.md` (the 55 "Now" features).

## Run

```bash
npm install
npm run dev        # http://localhost:3000 — sample data, signed in as the owner
npm test           # unit and screen tests
npm run typecheck
npm run lint
npm run build
```

Any email and password signs in. The account menu has a "Sample data · view as" control to see the portal as another role or in counsel-directed mode.

## Layout

| Path | What it holds |
|---|---|
| `src/app/(portal)/*/page.tsx` | One route per page; each only renders its screen |
| `src/app/sign-in` | Sign-in and password reset |
| `src/app/api/[...path]/route.ts` | Serves `/api/*` from the mock (replaced by Django later) |
| `src/screens/<page>/` | One folder per page; one component per file |
| `src/components/ui` | Shared building blocks (cards, pills, drawer, tabs) |
| `src/components/charts` | Hand-drawn SVG/HTML charts (gauge, trend line, bars, donut, columns, coverage strip) |
| `src/components/shell` | Sidebar, top bar, search, banners, drawer host |
| `src/components/drawers` | Detail panels: domain, metric, contact, action, vendor |
| `src/api/types.ts` | **The contract with the backend** |
| `src/api/queries.ts` | One hook per endpoint |
| `src/mock/` | `api.ts` (the mock) and `data/` (fixtures) |
| `src/lib/wording.ts` | Banned-wording guard; tests scan every screen and fixture |
| `tests/` | Mock API tests and screen tests (MSW routes `/api/*` to the same mock) |

## Pages

Your position: Overview, Audit Scorecard, Action Queue, Alerts · Evidence: Contact Ledger, Consent Integrity, Revocation Integrity, Evidence Vault, evidence file per number · Intelligence: Contact Conduct, Lead Provenance, Vendor Ledger, Metrics Library · Disclosure: Source Registry (with upload centre), Reports & Exports · Engagement: Scope & Boundaries, Rulebook, Regulatory Changes · Account: Setup & Readiness, Settings, Users & Access.
