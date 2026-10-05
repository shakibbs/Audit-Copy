# Business Requirements Document — CiV Automated TCPA Audit System

**Version:** 1.1 · **Date:** 2026-10-01 · **Status:** Draft for Product and Counsel review
**Supersedes:** the business framing in the v1.0 Engineering Spec (2026-09-27)

---

## 1. Executive summary

Companies that make outbound sales calls and texts in the United States face
statutory damages of $500–$1,500 per call or text under the Telephone Consumer
Protection Act (TCPA), with a four-year lookback and class actions as the
common vehicle. Most defendants lose not because they lacked consent but
because they cannot *prove* it for a specific number on a specific date, or
because a single opt-out was not honoured somewhere in a chain of dialers,
SMS platforms, CRMs and lead vendors.

CiV will sell an automated audit service that connects to a client's own
tools through published APIs, pulls every outbound contact and every piece of
consent proof, decides a consent status for each contact, tests the client's
opt-out handling from CiV's own phone numbers, runs the CIV-ATP-01 checkpoint
library across 25 audit domains, and delivers a score, a per-number evidence
file, a fix list, alerts and a client portal. Everything is measured, hashed,
anchored and reproducible; nothing is blocked, dialed or scrubbed on the
client's behalf.

The first buyers are general counsel and owners in HVAC, solar, insurance and
financial services.

## 2. Problem statement

| Problem | Consequence today |
|---|---|
| Consent proof is scattered across TrustedForm, Jornaya, CRM fields, IVR recordings and vendor lead files | At litigation time the client cannot assemble proof for one number in the time a demand letter allows |
| Opt-outs must propagate across every system that can contact a person | A STOP reply honoured by the SMS platform but not the dialer produces a willful-damages claim |
| Numbers get reassigned; the person who consented is not the person now called | The client has no record of having checked the Reassigned Numbers Database before calling |
| State "mini-TCPA" laws add calling-hour, frequency and holiday rules that differ by state and change yearly | Manual audits go stale within months |
| Analyst-run audits are expensive, slow and produce a point-in-time PDF | No continuous view, no alert when a consent page silently changes |
| Existing vendors sell call blocking or scrubbing | Nobody independently tests whether the client's own opt-out chain works, and nobody keeps a tamper-evident record for the client's lawyers |

## 3. Vision and positioning

**CiV is an independent measuring instrument, not a call blocker and not a
law firm.** It records what the client did and what proof existed, grades
the evidence by source, and hands the client — or the client's counsel — a
file it can defend with. Because CiV never dials, blocks or scrubs, its
outputs stay measurements, which keeps CiV out of the client's liability
chain and keeps the outputs usable in court as records of what was observed.

## 4. Stakeholders and users

| Role | Needs | Portal role |
|---|---|---|
| General counsel / outside counsel | Certifiable evidence copies; alerts routed to counsel; work-product posture where available | `legal` |
| Owner / CEO | One score, the top five findings, cost per client | `owner` |
| Operations lead | Fix list with status, connector health, vendor scorecards | `operations` (disabled in counsel-directed mode) |
| Lead-buying manager | Dispute candidates per vendor inside the dispute window | `operations` |
| CiV product / engineering | Rulebook administration, run monitoring, cost model | internal |
| CiV counsel | Approves every status-affecting parameter, report wording, fix-step library | internal `counsel` |

## 5. Goals and success criteria

| # | Goal | Measure of success |
|---|---|---|
| G1 | Every outbound contact in the lookback window gets a consent status with reason codes | 100 % of normalized contacts evaluated; 0 silently skipped |
| G2 | Results reproduce exactly | Re-running any past run with its stored `evaluation_as_of`, rulebook version and code version gives byte-identical results while artifacts are held |
| G3 | Evidence is tamper-evident | Every artifact hashed at capture, in a daily Merkle root anchored to OpenTimestamps and an RFC 3161 authority; per-artifact inclusion proof exported |
| G4 | Opt-out handling is tested, not assumed | Propagation matrix delivered for each pilot client with ≥ `min_tests_per_cell` tests per cell |
| G5 | Nothing runs on a human's judgment | No human in the loop to produce a result; humans only approve rulebook versions and fix steps |
| G6 | Outputs are usable by counsel without overclaiming | Counsel items C1, C2, C6 signed off before launch; banned-word check passes on every report |
| G7 | Pilot proves value before infrastructure | Phase 0 (upload-only) produces a hand-checked consent sample that agrees with the engine on ≥ `gate_sample_size` contacts before any connector is built |
| G8 | Cost per client is known | Running cost per client and per number measured in Phase 0–1 and fed to the pricing model |

## 6. Non-goals (explicitly out of scope)

- Blocking, dialing, scrubbing or suppressing any contact on the client's behalf.
- Selling, sourcing or maintaining DNC, state DNC or litigator lists.
- Contacting the client's customers (except CiV's own test numbers and one callback per client caller ID for M21).
- Giving legal advice. Fix steps come only from a counsel-reviewed library.
- Live (per-lead, synchronous) Lead Inspector in v1. Batch only; live mode is post-pilot.
- Consumer reports of any kind. Lead Inspector outputs may not be used for eligibility decisions (Counsel C3).
- Any workflow that requires a CiV analyst to change a result.

## 7. Product rules (binding on every requirement below)

1. **Consent is decided per contact.** A number's result is rolled up from its contacts (worst status wins).
2. **Consent needs proof, and CiV reports separately whether the law or CiV policy required it.** Every contact records `consent_required_basis`; a manual live call to a number on no DNC list is NO_PROOF with basis "CiV policy only".
3. **CiV does not sell DNC or litigator lists.** Client-supplied lists are labelled "supplied by client". If no list is supplied, the DNC basis is `dnc_unknown`, never silently "policy only".
4. **Everything runs automatically.**
5. **Official access only.** Published APIs, client-owned credentials, read-only or least-privilege, every call logged.
6. **Flag, don't judge — in names too.** See README wording rules.
7. **Names describe acts, not outcomes.**
8. **Evidence is tamper-evident and tiered by source.** A hash proves a file is unchanged, not that it was true.
9. **Built for counsel.** Counsel-directed mode, certifiable copies, no overclaiming.
10. **A status-affecting parameter needs counsel approval.** Any rulebook key flagged `affects_status` must be approved by the counsel role before an `approved` rulebook version can include it.
11. **TBD blocks client output, not engineering.** A provisional rulebook lets code be built and tested; its outputs are watermarked and never shown to a client.

## 8. Functional requirements

Requirements are grouped by capability. Priority: **M** = must have for pilot, **S** = should have for launch, **L** = later.

### 8.1 Data acquisition

| ID | Requirement | Pri |
|---|---|---|
| FR-ACQ-1 | Accept client uploads (CSV, PDF, DOCX, audio) with uploader, time and SHA-256 recorded; tier 4 | M |
| FR-ACQ-2 | Retrieve TrustedForm certificates by ID through the client's account (tier 2) | M |
| FR-ACQ-3 | Pull dialer, SMS, CRM and lead-platform records through published APIs with client credentials (tier 3); one adapter per vendor; build order follows the pilot client | S |
| FR-ACQ-4 | Query the Reassigned Numbers Database through CiV's own caller-agent account (tier 1) | S |
| FR-ACQ-5 | Capture public consent pages with a headless browser at every viewport in `cc_viewports` (tier 1) | M |
| FR-ACQ-6 | Carrier line-type and caller-name lookup, email verification, RDAP domain age — only under written use-case approval (tier 2) | S |
| FR-ACQ-7 | Never trigger a billed vendor operation on the client's account without written approval | M |
| FR-ACQ-8 | Backfill to `lookback_years`; then daily pulls plus webhooks; stale connector raises an alert and dependent metrics show "not measured — source missing" | S |

### 8.2 Evidence store

| ID | Requirement | Pri |
|---|---|---|
| FR-EVI-1 | Every artifact stored exactly as received, SHA-256 of raw bytes, trusted-clock capture time, source, tier | M |
| FR-EVI-2 | Write-once object storage (S3 Object Lock, compliance mode) with per-client encryption keys; deletion = key destruction recorded in `deletion_log` | M |
| FR-EVI-3 | Daily Merkle root anchored to OpenTimestamps and an RFC 3161 TSA; per-artifact inclusion path stored | M |
| FR-EVI-4 | Legal hold per client blocks every deletion including key destruction | M |
| FR-EVI-5 | Every portal view, export and connector call in `access_log` | M |

### 8.3 Normalization

| ID | Requirement | Pri |
|---|---|---|
| FR-NRM-1 | Turn every source into outbound `contact_event` rows; inbound never a contact; a text counts once the platform accepts it | M |
| FR-NRM-2 | Cross-system dedupe only, one-to-one, same number and channel within `dedupe_window_seconds`; dialer/SMS record wins | M |
| FR-NRM-3 | Phone epochs as date ranges with certainty known / bounded / unknown; RND queries within `rnd_query_budget_per_number` | S |
| FR-NRM-4 | Recipient local time from the address ZIP in force, else area code; both checked when they disagree; confidence recorded | M |
| FR-NRM-5 | Rows never overwritten; `valid_from` / `valid_to` on every versioned row | M |

### 8.4 Consent engine

| ID | Requirement | Pri |
|---|---|---|
| FR-CON-1 | Exactly one of NO_PROOF / CONFLICTING / WEAK / VERIFIED per contact, with primary and secondary reason codes | M |
| FR-CON-2 | Every applicable basis evaluated separately; contact status = worst across bases; contact is "legal-basis" if any basis is legal | M |
| FR-CON-3 | Proof ranking VERIFIED > WEAK > CONFLICTING > NO_PROOF; ties to most recent capture | M |
| FR-CON-4 | Timing: linked chain has no tolerance; unlinked sources use `clock_skew_seconds`; opt-outs cut off after `optout_grace_business_days` | M |
| FR-CON-5 | Same inputs + same `evaluation_as_of` + same rulebook version = same output | M |
| FR-CON-6 | Rule-based checklist items run in code from Phase 2; AI items only after their accuracy gate | M |
| FR-CON-7 | Frozen (source deleted under retention), pending (provider outage) and test contacts excluded from metrics and the hard cap | M |

### 8.5 Rules engine and scoring

| ID | Requirement | Pri |
|---|---|---|
| FR-RUL-1 | Load CIV-ATP-01 into `checkpoint` with automation bucket, aggregation rule and metric map | S |
| FR-RUL-2 | Per-contact results aggregate to a checkpoint result by `checkpoint.aggregation` | S |
| FR-RUL-3 | Checkpoints that cannot run return `not_run` / `NEEDS_SOURCE`; "checkpoints run out of total" beside every score | S |
| FR-RUL-4 | Domain and overall score, grade bands, hard cap, provisional flag; DNC and litigator domains never in the overall | S |

### 8.6 Revocation testing

| ID | Requirement | Pri |
|---|---|---|
| FR-REV-1 | No test without signed Annex C naming channels, brands, dates | S |
| FR-REV-2 | Seed only through the client's own public forms; test identities flagged `is_test` | S |
| FR-REV-3 | Opt out on each channel; watch every connected system; record suppression time or NEVER after `optout_observation_days` | S |
| FR-REV-4 | Propagation matrix with test counts and "indicative" label below `min_tests_per_cell` | S |
| FR-REV-5 | Real carrier mobile lines, honest texting registration, recording notice on spoken tests until C5 is decided | S |

### 8.7 Lead Inspector

| ID | Requirement | Pri |
|---|---|---|
| FR-LI-1 | Check 2 (consent source) and Check 3 (completeness) in batch from Phase 2 | M |
| FR-LI-2 | Check 1 (lead signals) and vendor scorecard after counsel C3 | S |
| FR-LI-3 | Rule-based seller-name match from Phase 2; AI meaning check after its gate | M |
| FR-LI-4 | Dispute candidates per vendor inside the dispute window; CiV never contacts vendors | S |

### 8.8 Outputs

| ID | Requirement | Pri |
|---|---|---|
| FR-OUT-1 | Evidence file per phone epoch (PDF + JSON) with hash manifest, Merkle paths, anchor proofs, verifier script and certification template | M |
| FR-OUT-2 | Fix list from the counsel-reviewed library only; status tracked; auto-closes | S |
| FR-OUT-3 | Alerts: page change, certificate expiry, test opt-out past deadline, contacts after opt-out, stale connector; counsel-only routing in counsel-directed mode | S |
| FR-OUT-4 | Client portal with role-based access; every view logged | S |
| FR-OUT-5 | Banned-word check on every report; standard disclosure on every report | M |
| FR-OUT-6 | Provisional-rulebook outputs watermarked and never visible to client roles | M |

## 9. Non-functional requirements

| Area | Requirement |
|---|---|
| Reproducibility | Any result reproducible from stored run metadata for as long as its artifacts are held |
| Integrity | SHA-256 at capture; daily external anchoring; inclusion proofs; per-client keys |
| Isolation | Per-client row-level security on every table; per-client encryption keys; credentials in a secrets vault revocable in one click |
| Availability | Batch system; no uptime SLA in v1. Live Lead Inspector (post-pilot) needs an SLA before it ships |
| Scale (planning assumption, to be confirmed with the pilot) | 1–5 M contacts per client per year; 4-year backfill up to 20 M contacts; nightly incremental of ≤ 50 k contacts; page captures ≤ 500 URLs × 2 viewports per day per client |
| Determinism | All time-dependent checks use stored `evaluation_as_of`, never the wall clock |
| Auditability | `access_log` for every read; `run` row for every computation; AI outputs stored with model and prompt version |
| Security gates before first real client data | SOC 2 Type I, signed DPAs, independent penetration test |
| Cost | Per-client and per-number running cost measured from Phase 0 |

## 10. Legal and regulatory constraints

These shape requirements; the counsel brief holds the open questions.

- **Unsettled law.** After *McLaughlin v. McKesson* (2025) district courts are not bound by FCC interpretations; results may depend on `litigation_forum`. Rule values carry a jurisdiction dimension (federal circuit / district and state).
- **Autodialer scope** after *Facebook v. Duguid* (2021) is narrow federally, broad in several states. The engine runs strict and lenient variants until counsel sets A12 and A17.
- **Revocation** deadline is 10 business days (since April 2025); revoke-all effective 2027-01-31 per the FCC's 2026 order (to verify).
- **DNC exemption** needs a *signed written* agreement, not merely consent.
- **Reassigned Numbers Database** answers only yes / no / no data to "disconnected since date X"; safe harbor covers robocall consent claims only.
- **Evidence.** FRE 902(14) covers copy integrity; accuracy needs the client's custodian (902(11), 803(6)); computed metrics are analysis and need a witness. Counsel-directed mode improves but does not guarantee work-product protection.
- **Alerts create notice.** Buyers are told in writing; alert design approved by counsel.
- **Lead Inspector** must not become a consumer report (FCRA); carrier-data providers bar eligibility uses.
- **CiV's own obligations** (GLBA for insurance/finance verticals, state privacy laws, recording consent in all-party states) — Counsel C9, C5.

## 11. Delivery plan

| Phase | Builds | Gate |
|---|---|---|
| **0. Upload-only pilot** | Upload service, evidence store (hash + anchor), normalizer, phone epochs (from uploaded RND logs), consent engine on the provisional rulebook, one evidence file | Gate 0: hand-checked sample of ≥ `gate_sample_size` contacts agrees; cost per number measured |
| **1. Foundation** | Connectors for the pilot client's stack, secrets vault, access log, rulebook admin, sync + health | Gate 1: one client synced, hashed and anchored daily |
| **2. Consent** | Certificate retrieval, page capture, rule-based checklist, seller-name match, Lead Inspector checks 2–3, evidence file export | Gate 2: counsel A1–A5, A9, A10, A12, A15a, A17–A19, B1–B3, B7, B8 set; consent cases C01–C50 pass |
| **3. Revocation** | Test numbers, texting registration, Annex C, inbound handler, propagation matrix | Gate 3: first matrix delivered; M08–M09 tests pass; counsel C4, C5 |
| **4. Metrics** | All metric cards, checkpoint aggregation, scoring, fix list, alerts, portal, Lead Inspector check 1 and scorecard (after C3) | Gate 4: every metric on the pilot client; counsel A6–A8, A11, A13–A16, A15b, A20, B4–B6, B9; metric cases T01–T54 pass |
| **5. AI features** | Contract clauses, transcription and disclosures, free-text opt-outs, consent-page meaning, training records | Per-feature accuracy gate |
| **Post-pilot** | Live Lead Inspector | Liability terms, uptime SLA |
| **Launch** | — | Counsel C1, C2, C6–C10; SOC 2 Type I; DPAs; pen test; cost model |

## 12. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Counsel settings arrive late and stall Phase 2 | High | High | Provisional rulebook; strict/lenient dual runs quantify each decision |
| Pilot client's vendors have no read-only API role | Medium | Medium | Least-privilege user with contractual read-only commitment, every call logged (D6) |
| Vendor API terms forbid third-party access | Medium | High | Confirm terms before building each adapter; upload fallback (tier 4) |
| Backfilled leads have no contemporaneous page capture | Certain | Medium | Label "not comparable"; tell buyers up front |
| AI features fail their accuracy gate | Medium | Low | Items stay "not measured"; rule-based items carry Phase 2 |
| CiV subpoenaed; reports used against the client | Medium | High | Measurements only; counsel-directed mode; subpoena procedure (C7) |
| Object Lock prevents legally required deletion | Certain without fix | High | Per-client encryption keys; crypto-shredding; legal hold |
| Checkpoint count mismatch (1,132 vs 1,067) | Certain | Low | D4 reconciliation before Phase 1; aggregation rules per checkpoint |
| Scale unknown until pilot | High | Medium | Planning assumptions in §9; measure in Phase 0 |

## 13. Open decisions

Tracked in engineering spec section 12 (D1–D13). The ones that gate the next step:

- **D3** Pilot client and its dialer / SMS / CRM (sets connector order).
- **D4** Checkpoint count reconciliation and automation buckets.
- **D13** Confirm ActiveProspect exposes certificate page snapshots through the API.

## 14. Glossary

| Term | Meaning |
|---|---|
| Contact | One outbound call attempt or one outbound text accepted by the SMS platform |
| Phone epoch | One number held by one person; boundaries are date ranges |
| Consent status | NO_PROOF / CONFLICTING / WEAK / VERIFIED, per contact |
| Basis | Why proof is needed: `robocall_marketing`, `robocall_informational`, `dnc_listed`, `dnc_unknown`, `state_law`, `civ_policy` |
| Tier | Where evidence content came from (1 CiV-captured … 4 client-uploaded) |
| Rulebook | Effective-dated legal values plus per-client settings; versioned; draft / provisional / approved |
| Checkpoint | One test from the CIV-ATP-01 library |
| Domain | One of 25 audit domains (e.g. CON, REV, CTF) |
| Evidence file | Per-epoch export: contacts, statuses, proof elements, hashes, anchors |
| Propagation matrix | Opt-out channel × client system → hours to suppression or NEVER |
| Counsel-directed mode | Engagement run through the client's lawyers; alerts routed to counsel only |
| RND | FCC Reassigned Numbers Database (operated by Somos) |
| EBR | Existing business relationship |
