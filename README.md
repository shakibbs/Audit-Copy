# CiV Automated TCPA Audit System

Documentation and (later) source for the CiV Automated TCPA Audit System: a
service that builds, for every outbound call and text a client made, an
independent record of whether proof of permission existed and what the
contact's circumstances were, then flags every gap.

This repository currently holds the **v1.1 document set**. No application code
exists yet. The v1.1 documents supersede the v1.0 PDFs (Sep 27, 2026, @Zen)
and fold in every fix from the Sep 30, 2026 review.

## Document map

| Document | Audience | What it answers |
|---|---|---|
| [docs/feature-guide.md](docs/feature-guide.md) | Owner, everyone new to the project | Every feature in plain language: what it is, why a client needs it, how it works, what is automatic, what the client supplies |
| [docs/BRD.md](docs/BRD.md) | Product, leadership, counsel | Why we build this, for whom, what "done" means, what we will not build |
| [docs/architecture.md](docs/architecture.md) | Engineering | The six-layer pipeline, components, interfaces, stack, tenancy, integrity chain |
| [docs/design.md](docs/design.md) | Engineering | Detailed design: data model, algorithms, job orchestration, APIs, testing |
| [docs/specs/01-engineering-spec.md](docs/specs/01-engineering-spec.md) | Engineering, product | The v1.1 engineering spec (product rules, sources, data model, consent engine, domains, scoring, security, build order) |
| [docs/specs/02-rulebook-parameters.md](docs/specs/02-rulebook-parameters.md) | Engineering, counsel | Every parameter the system reads, its default, owner and status |
| [docs/specs/03-metric-specs.md](docs/specs/03-metric-specs.md) | Engineering, product | One card per metric: question, period, population, logic, edge cases, missing-data rule, example |
| [docs/specs/04-lead-inspector.md](docs/specs/04-lead-inspector.md) | Engineering, product, counsel | Lead signal check, consent source check, consent completeness, vendor scorecard |
| [docs/specs/05-counsel-brief.md](docs/specs/05-counsel-brief.md) | Counsel | Every question only a lawyer can settle, with the proposed starting point and what it blocks |
| [docs/specs/CHANGELOG-v1.1.md](docs/specs/CHANGELOG-v1.1.md) | Everyone | Each v1.0 gap and the v1.1 fix, with the owner who still has to approve it |
| [docs/plans/2026-10-01-00-roadmap.md](docs/plans/2026-10-01-00-roadmap.md) | Engineering, product | Module order (frontend first), rules every plan follows, open decisions |
| [docs/plans/](docs/plans/) `2026-10-03-01a … 01d` | Engineering | Module 1, the frontend portal, as four task-by-task plans (A foundation, B data and shell, C and D screens) |
| [docs/design-reference/portal-prototype.dc.html](docs/design-reference/portal-prototype.dc.html) | Engineering, design | Source of the CiV Audit Portal Prototype (Sep 29, 2026): the design source of truth for the portal's seven screens |
| [docs/session-history/](docs/session-history/) | Everyone | Notes and transcripts from review sessions |

## Reading order

1. **New to the project:** BRD → architecture → engineering spec.
2. **Building a component:** design → the spec section for that component → rulebook parameters it reads → metric cards it feeds.
3. **Counsel:** counsel brief → engineering spec section 5 (consent engine) and section 10 (security, legal, evidence) → rulebook parameters marked *Counsel*.

## Status

| Item | State |
|---|---|
| v1.1 document set | Written 2026-10-01; awaiting Product and Counsel sign-off on items marked *Proposed* or *TBD* |
| Pilot client (decision D3) | Open. Connector build order depends on it |
| Implementation plan | Roadmap and the four-part plan for module 1 (frontend portal) written 2026-10-03; later modules are planned when reached |
| Application code | **Module 1 built 2026-10-03:** the frontend portal in `frontend/` (Next.js + TypeScript) — seven prototype screens, evidence file page, internal rulebook page — running against a mock API; 73 tests, type-check, lint and build pass. Backend (`backend/`, Django) not started; module 2 is next |
| Provisional rulebook | Defined (section 4 of the rulebook). Lets engineering build and test before counsel sets final values |

## Conventions every document follows

**Wording.** Outputs, metric names, flags and reports describe what CiV
*measured*, never a legal conclusion. Never use: "violation", "breach",
"illegal", "compromised", "fake", "fraud", "compliant", "non-compliant",
"ensures compliance", "protects you", "guaranteed". Use: "CiV found",
"no consent proof supplied", "sources conflict", "few / some / high risk
signals", "measured", "captured", "tested". An automated check runs every
report against this list before release.

**Names describe acts, not outcomes.** Capture, Test, Record — never
Protection, Assurance, Prevention.

**Parameters.** Code never hard-codes a value that appears in the rulebook.
Every legal value is effective-dated and each contact is judged by the value
in force on the contact's date.

**Statuses.** Every parameter and every counsel item carries one of:
*Set* (decided), *Proposed* (starting value; owner to confirm), *TBD*
(client output blocked until set; engineering may build against the
provisional value).

**Source tiers.** Evidence is graded by where the *content* came from:
Tier 1 (captured by CiV), Tier 2 (retrieved by CiV from an independent third
party), Tier 3 (retrieved by CiV from the client's systems by API), Tier 4
(uploaded or exported by the client). The word "grade" is reserved for scores.

**Not legal advice.** Nothing in this repository is legal advice. Starting
points in the counsel brief are proposals for counsel to verify.

## Repository layout

```
Audit/
├── README.md
├── frontend/              Next.js + TypeScript portal (module 1, built)
└── docs/
    ├── BRD.md
    ├── architecture.md
    ├── design.md
    ├── specs/
    │   ├── 01-engineering-spec.md
    │   ├── 02-rulebook-parameters.md
    │   ├── 03-metric-specs.md
    │   ├── 04-lead-inspector.md
    │   ├── 05-counsel-brief.md
    │   └── CHANGELOG-v1.1.md
    ├── plans/
    │   ├── 2026-10-01-00-roadmap.md
    │   ├── 2026-10-03-01a-portal-foundation.md
    │   ├── 2026-10-03-01b-portal-data-and-shell.md
    │   ├── 2026-10-03-01c-portal-screens-1.md
    │   └── 2026-10-03-01d-portal-screens-2.md
    ├── design-reference/
    │   └── portal-prototype.dc.html
    └── session-history/
        ├── 2026-09-30-spec-review.md
        └── 2026-09-30-spec-review.jsonl
```

## Versioning

Documents carry a version in their header. A change to a legal value is a new
rulebook version with an effective date, never an edit in place; old versions
stay so past results reproduce. Version control for this folder is not set up
yet; it will be added later.
