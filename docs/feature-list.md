# Master Feature List — Comply iV Automated TCPA Audit System

**Date:** 2026-10-03 · **Status:** Proposed, awaiting the owner's decisions
**Companion:** [feature-guide.md](feature-guide.md) explains each existing feature in plain language.

Every feature has an ID so it can be approved or dropped by number. The **Recommendation** column is a proposal only:

- **Now** — include in the frontend rebuild.
- **Later** — worth having, but after the first complete version (it needs data or backend work that does not exist yet, or counsel's wording).
- **No** — recommend against; the reason is given.
- **Decide** — depends on a choice listed in section 5.

Nothing here is built or planned until the owner marks it.

---

## 1. Core portal — the 15 pages in the portal file

Source: `design-reference/complyiv-portal-audit.html`. All recommended **Now**.

| ID | Page | Group | What the user gets |
|---|---|---|---|
| F01 | Overview | Your position | Score gauge and grade, grade-cap banner, six family scores, four headline numbers, top three actions |
| F02 | Audit Scorecard | Your position | Map of all 25 domains by grade, domain register, and a detail panel per domain (checkpoints passed, warned, failed, not run; top finding; metrics; sources) |
| F03 | Action Queue | Your position | Ranked fixes with severity, reason, domain, who does it, and score impact; a count badge in the menu |
| F04 | Contact Ledger | Evidence | Every call and text with status, reason and flags from other domains; a detail panel with the five checks, proof, tier and hash |
| F05 | Consent Integrity | Evidence | Status split, most common reason codes, the five checks explained, legal basis versus CiV policy, certificate validity, certificates expired before engagement |
| F06 | Revocation Integrity | Evidence | Opt-out test results: three headline numbers and the matrix of opt-out channel by system, in hours or NEVER |
| F07 | Evidence Vault | Evidence | Number-and-date lookup returning the full position with sources and hashes; totals for artifacts held, daily anchors, items deleted under retention |
| F08 | Contact Conduct | Intelligence | Hours, frequency, holidays, abandoned calls, robocall proof, disclosures, caller ID, non-US numbers; out-of-hours by state; abandoned rate by campaign |
| F09 | Lead Provenance | Intelligence | Leads by risk signal level, most frequent signals, most often missing checklist items, consent completeness, page match |
| F10 | Vendor Ledger | Intelligence | Each vendor's leads, high-signal count, score, grade and monthly change; grade distribution; dispute candidates; score-drop alerts |
| F11 | Metrics Library | Intelligence | All 33 metrics with a group filter, value, note and linked domains; a detail panel with the definition |
| F12 | Source Registry | Disclosure | Every source with tier, access, last sync, status and the domains it feeds; totals for current, stale and not supplied |
| F13 | Reports & Exports | Disclosure | Six downloads: period report, evidence file export, certification pack, litigation evidence package, metric export, rulebook snapshot |
| F14 | Scope & Boundaries | Engagement | What CiV does, what the client decides, what CiV never does; engagement mode; notice acknowledgement |
| F15 | Rulebook | Engagement | Settings in force with value, owner and status (Set, Proposed, TBD) and their totals |

### Features that apply on every page

| ID | Feature | What the user gets | Recommendation |
|---|---|---|---|
| F16 | Global search | Find a domain, metric, phone number or vendor from any page (the portal file searches domains and metrics only) | Now |
| F17 | Slide-out detail panels | Open any domain, metric or contact without leaving the page | Now |
| F18 | Light and dark theme | A switch in the top bar | Now |
| F19 | Freshness indicator | "Updated 04:10 UTC" with a live dot; turns amber when a source is stale | Now |
| F20 | Hover explanations | A small "i" beside technical terms | Now |
| F21 | Sample-data marker and standing disclaimer | Shown until real data is connected; the "not a law firm" line on every page | Now |

---

## 2. In the specs and the prerequisites file, but not in the portal file

These are described in your documents and have no screen yet.

| ID | Feature | What the user gets | Source | Recommendation |
|---|---|---|---|---|
| F22 | Sign-in | Email and password sign-in, sign-out, password reset | Spec §10; you asked for it | Now |
| F23 | Users and roles | Invite people; set each as owner, legal, operations or read-only; remove access | Spec §10 | Now |
| F24 | Evidence file page per number | The full file for one phone number: every contact, proof elements, opt-out history, list checks, anchor status; export button | Spec §9 | Now |
| F25 | Alerts inbox | Every alert with its date, severity and what triggered it; mark as reviewed; history | Spec §9 | Now |
| F26 | Readiness report | The 11 prerequisite checks as Ready, Partial or Missing with the fix for each; the preview status mix; metrics that would show "Not measured"; the recommended plan | Prerequisites §4 | Now |
| F27 | Setup checklist | The one-time facts the client must give: outcome mapping, caller IDs, consent page addresses, vendors and sub-IDs, states, brands, campaign categories; shows what is still outstanding | Prerequisites §5.5 | Now |
| F28 | Plan and usage | Current plan, numbers contacted this month against the plan limit, the downloadable list of billed numbers, the rule for moving up a plan | Prerequisites §3, §6 | Now |
| F29 | Agreements and authorisations | Status and dates of the services agreement, data processing agreement and opt-out test authorisation (channels, brands, test window) | Prerequisites §5.1 | Now |
| F30 | Access log | Who viewed or exported what, and when | Spec §10 | Now |
| F31 | Counsel-directed mode | When on: findings and alerts go only to legal users; operations users are locked out; every page is marked as prepared at counsel's direction | Spec §9, §10 | Now |
| F32 | Company settings | Brands and trade names, states, litigation forum, engagement mode, technical and legal contacts, notification choices | Spec §4; Prerequisites §5 | Now |
| F33 | Internal view: run selector and provisional marker | CiV staff can switch between runs; results from an unapproved rulebook are marked and hidden from clients | Rulebook §2 | Now |
| F34 | Internal view: rulebook impact | For each unsettled legal setting, how many contacts change status between the strict and lenient reading | Rulebook §2 | Now |
| F35 | Upload centre | Upload a file by type, see its recorded hash, see past uploads and any rows that could not be read | Spec §3 | Now |

---

## 3. In your earlier documents, dropped from the current portal

| ID | Feature | What the user gets | Recommendation | Reason |
|---|---|---|---|---|
| F36 | Projected score | "Today → if the open actions are completed", on Overview and Action Queue | Now | The portal file already states one such figure ("would lift the score to 84.9"); must be labelled a projection |
| F37 | Score history and "what moved" | A trend line for the score and each domain, with dated markers for what caused each change | Now | Shows direction, not only level; you asked for charts |
| F38 | Coverage strip | Which months the evidence record covers, and where it is thin | Now | Shows at a glance how far back proof reaches |
| F39 | Regulatory changes | Only the rule changes that affect this client: the change, its effective date, the settings and metrics it touches | Now | A rule changed on September 30; clients need to see the effect, stated as fact, not advice |
| F40 | Accountability Register | CiV's own monitoring misses with cause and fix | Later | Useful for trust; nothing to show until the system has run |
| F41 | Number Health | Carrier "spam" labels on each caller ID over time | Later | Needs a data source the specs do not include; observe only, never fix |
| F42 | Attestations | A dated statement of measured status for insurers and buyers, with a questionnaire mapper | Later | Wording needs counsel; must say "measured as of", never a verdict |
| F43 | Plaintiff Proximity | Lawsuit filings by district, active law firms, similar companies sued | Decide (D5) | Needs court-docket data; valuable to owners, but outside the current specs |
| F44 | API and assistant access | The client's own tools can query a number's position | Later | Backend feature; no screen needed yet beyond an API-key page |
| F45 | Insurer and investor reports | A diligence report on a company or an acquisition target | Later | A separate audience and product line |
| F46 | Operator Certification | A certificate for call centres with spot checks | No, for this product | A different service with different customers |
| F47 | Exposure Indicator | A second score where higher is worse | Decide (D1) | Two scores in opposite directions will confuse readers |

---

## 4. Suggested additions from the research

Ideas from comparable tools and audit platforms that fit CiV's boundaries.

### Making it easier to read and use

| ID | Feature | What the user gets | Inspired by | Recommendation |
|---|---|---|---|---|
| F48 | Charts throughout | Score ring and trend; status mix as a donut; domains and vendors as ranked bars; opt-out matrix as a heat map; time-to-stop distribution; a small trend line on every metric | Your request | Now |
| F49 | One layout for every metric and domain | The same tabs each time: result, evidence, history, linked actions, definition | Vanta | Now |
| F50 | Urgent-first ordering | Lists open with the most urgent item at the top, with filters | Vanta | Now |
| F51 | "Not measured" as its own state | Counted and shown separately everywhere, with the source it is waiting for and a link to supply it | Sprinto | Now |
| F52 | Period selector and comparison | Choose the month; see change against the previous period | Common practice | Now |
| F53 | Evidence beside every result | Each status shows the exact record, time and source that produced it | Observe.AI | Now |

### Making it more automatic

| ID | Feature | What the user gets | Inspired by | Recommendation |
|---|---|---|---|---|
| F54 | Owner and due date on every action | Assign an action to a person with a date; filter by owner; overdue marked | Vanta, Sprinto | Now |
| F55 | Escalation | If an action passes its date, the next person up is notified | Sprinto | Later |
| F56 | Notifications | Choose which alerts arrive by email; later Slack and webhooks | Common practice | Now for email; Later for the rest |
| F57 | Scheduled reports | The period report sent automatically each month to chosen people | Common practice | Later |
| F58 | Sync actions to a task tool | Push actions into Jira, Asana or ClickUp and read the status back | Vanta | Later |
| F59 | Certificate expiry countdown | Which consent certificates will become unavailable, and when | TrustedForm | Now |
| F60 | Opt-out wording coverage | The opt-out test sends varied plain-language replies and reports which wordings each system honoured | Drips | Now |

### Evidence and legal use

| ID | Feature | What the user gets | Inspired by | Recommendation |
|---|---|---|---|---|
| F61 | Legal hold | Freeze a number, a vendor or a date range so nothing is deleted while a dispute is open; a log of who set and released it | Relativity | Now |
| F62 | Read-only seat for outside counsel or an insurer | A limited view scoped to a period, which the client switches on and off | Drata | Now |
| F63 | Dispute a finding | The client attaches a note contesting a finding; the original is kept and both are shown | Observe.AI | Now |
| F64 | Verify a hash | Paste a file's fingerprint to confirm it matches the record and see its anchor | WebPreserver | Now |
| F65 | Bulk evidence export | Export evidence files for a list of numbers in one request | WebPreserver | Now |
| F66 | Consent wording catalogue | Every wording variant seen on captured pages, with first and last seen dates, and the client's own approve or reject mark | TrustedForm | Now |
| F67 | Custodian declaration template | A pre-filled declaration to accompany an export | Page Vault | Later (needs counsel) |
| F68 | Shareable status page | A page the client can share with a buyer or carrier showing measured status as of a date | Vanta | Later (needs counsel) |
| F69 | Questionnaire answer library | Stock answers to partner and insurer questionnaires, filled from measured data | Vanta | Later |

### Account and scale

| ID | Feature | What the user gets | Inspired by | Recommendation |
|---|---|---|---|---|
| F70 | Brand filter | View results for one brand or all | Prerequisites (brands) | Later |
| F71 | Single sign-on | Sign in through the company's identity provider | Common practice | Later |
| F72 | Registration status | The client's messaging and caller registration status, read from its accounts | Twilio Trust Hub | Later |

### Recommended against

| Idea | Why not |
|---|---|
| Blocking calls or leads | Makes CiV part of the dialing decision and answerable for misses |
| Selling or bundling DNC or litigator lists | Outside the product's boundaries |
| Labelling a lead or vendor as fraud | Legal exposure; CiV reports signals, not verdicts |
| A "compliant" badge or any guarantee | Turns a measurement into a warranty |
| Live prompts to agents, or fixing caller ID labels | CiV would be acting in the client's operations |
| Peer rankings | Your earlier portal rejects them; see D3 |

---

## 5. Decisions for the owner

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | One score or two? The Audit Score (higher is better) and the earlier Exposure Indicator (higher is worse) | (a) Audit Score only · (b) both | (a). One score, with the hard cap, is easier to trust and explain |
| D2 | Dollar estimates of exposure | (a) none anywhere · (b) a stated-assumption range · (c) a single figure | (a) for now. One of your documents forbids dollar amounts in deliverables; a range could be added later with counsel |
| D3 | Peer benchmarks | (a) none · (b) industry baselines only when a documented sample exists | (a). Your earlier portal rejects rankings |
| D4 | Rulebook visible to the client's owner? | (a) yes, read-only · (b) CiV staff only | (a), as your portal file shows it |
| D5 | Plaintiff Proximity (litigation watch) | (a) include later · (b) leave out | (a) Later, once a court-docket data source is chosen |
| D6 | Wording of source labels | (a) Tier 1–4 · (b) Grade A–D as in the portal file | (a), so "grade" always means a score |
| D7 | Sample client name | (a) SunPath Residential Solar (portal file) · (b) Acme Solar (older prototype) | (a) |

---

## 6. Totals

| | Now | Later | No / Decide |
|---|---|---|---|
| Core portal (F01–F21) | 21 | — | — |
| In the specs, no screen yet (F22–F35) | 14 | — | — |
| From earlier documents (F36–F47) | 4 | 5 | 3 |
| Suggested additions (F48–F72) | 16 | 9 | — |
| **Total** | **55** | **14** | **3** |

"Now" covers roughly 30 pages or views, against 9 in the frontend built so far.
