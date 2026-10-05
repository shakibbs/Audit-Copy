# Changelog — v1.0 → v1.1

**Date:** 2026-10-01. Every v1.0 gap found in the September 30 review, the
v1.1 fix, where it landed, and who still has to approve it. *Eng* = applied
in the documents and buildable now; *Prod* / *Counsel* = the document carries
a proposed or provisional value that the owner must confirm.

## 1. Blocker: Phase 2 could not start

| Gap | Fix | Where | Approval |
|---|---|---|---|
| Four TBD keys (`autodialed_modes`, `optout_grace_hours`, `optout_scope_rules`, `consent_checklist`) refused to run and sat inside the consent engine | `rulebook_version.status` = draft / provisional / approved; TBD blocks client output, not code; provisional runs are `internal` and watermarked; contested keys carry strict / lenient `variants`; impact dashboard | Rulebook §2; spec §1 rules 10–11; architecture ADR-2, ADR-3; design §2 | Eng (done); Counsel decides values |

## 2. Cross-document contradictions

| # | Gap | Fix | Where | Approval |
|---|---|---|---|---|
| 1 | A15 gated Phase 2 in the brief, Gate 4 in the spec | Split: A15a (font, seller count) → Gate 2; A15b (vendor clauses) → Gate 4 | Brief A15a/A15b; spec §11 | Prod |
| 2 | M08 said nearest-rank, example gave 13.0 h (interpolated) | Nearest-rank kept; example median = 6.0 h; p90 = NEVER; percentile definition added to shared definitions | Metrics M08, shared defs | Prod |
| 3 | Hard-coded 90 days (M08/M09), 2 s and 30 days (M31), hard-signal list | `revocation_window_days`, `abandon_connect_seconds`, `abandon_period_days`, `li_hard_signals` | Rulebook §5, §7, §10 | Eng |
| 4 | `li_signal_points` pointed back to the Lead Inspector tab | Points live only in the rulebook | Rulebook §10; LI Check 1 | Eng |
| 5 | `CF_CERT_AFTER_DELIVERY` tolerance in LI but not in the spec | Spec §5 fires only beyond `clock_skew_seconds`; within → `WK_TIMING_UNCERTAIN` | Spec §5 table | Eng |
| 6 | M22b "conduct" included M19 (a proof measure) | M19 removed from M22b | Metrics M22b | Eng |
| 7 | M22a mixed legal-basis and policy contacts | Two lines like M01 | Metrics M22a | Eng |
| 8 | Product-owned keys changed consent status | `affects_status` flag; counsel approval required in an approved rulebook; loader refuses otherwise | Rulebook §1–2; product rule 10; design §2 | Eng (mechanism); Counsel (approvals) |
| 9 | Low-confidence locations excluded despite "cautious default" | `location_uncertain_treatment = report_as_possible`; "possible" line in M16–M18; never dropped | Rulebook §3; metrics shared defs, M16–M18 | Counsel (B9) |

## 3. Missing from the rulebook

| Gap | Fix | Where | Approval |
|---|---|---|---|
| `state_law` basis had no data | `state_consent_rule` table (state, channels, contact types, autodialer definition, consent type, PRA, dates); seeded FL, OK, MD | Rulebook §4; design §1.2; brief A18 | Counsel |
| No DNC list → silently "CiV policy only" | New basis `dnc_unknown`; M01 note "legal basis may be understated" | Spec §5; metrics M01 | Eng |
| Informational consent could never be proved | `prior_express_evidence_types`; M22a element 3 adjusted | Rulebook §4; spec §5 notes; brief A19 | Counsel |
| No contact → checkpoint aggregation rule; no metric ↔ checkpoint map | `checkpoint.aggregation` {unit, pass_max_share, warn_max_share}, `checkpoint_aggregation_default`, `metric_checkpoint_map` | Spec §6, §9; rulebook §9; design §7 | Prod (D4) |
| Missing parameters | `rnd_query_budget_per_number` 12; `rnd_update_calendar`; `default_dispute_window_days` 0; `civ_default_retention_years` 6; `legal_hold`; `expected_sources`; `page_similarity_method`; `business_day_tz_fallback` | Rulebook §3, §4, §6, §8 | Prod / Counsel as marked |
| `rnd_required_after_days` = 30 had no source | Moved to TBD with provisional 30; new counsel item A20 | Rulebook §6; brief A20 | Counsel |
| Backfilled leads can never be page-matched | Labelled "not comparable — no contemporaneous capture"; disclosed at onboarding | Spec §5 notes; LI Check 2; metrics M27; L33 | Eng |
| DNC exemption accepted "consent" | Needs signed written consent: `signed_written_consent_types`; M13 bucket (a) split into a1 / a2 | Spec §5; rulebook §4; metrics M13 | Counsel (B3) |
| Opt-out grace in hours | `optout_grace_business_days` with `business_day_calendar` | Rulebook §5 | Counsel (A4) |

## 4. Metric cards

| Gap | Fix | Where | Approval |
|---|---|---|---|
| Cards missing template fields (M05, M14, M15, M18, M21, M23, M24, M25a, M25b, M29, M30) | All seven fields filled on every card; card linter in CI | Metrics (all); design §9, §15 | Eng |
| M11 undefined for contacts with no proof | Population = robocall contacts with a winning proof date; "no consent date" count separate | Metrics M11 | Eng |
| M09 "recipient time zone" ambiguous for test numbers | `test_number.time_zone` | Metrics M09; spec §8 | Eng |
| Missing-data rule inconsistent | "not measured — {source} not supplied" on every card | Metrics (all) | Eng |

## 5. Lead Inspector

| Gap | Fix | Where | Approval |
|---|---|---|---|
| Seller identity unmeasured until an AI gate passes | Rule-based brand / DBA match (`seller_match_threshold`); `matched` / `other_seller` / `not_found` | LI Check 3; spec §5; design §6; L30–L32 | Eng |
| Seller absent treated as WEAK without a counsel decision | `seller_absent_effect` (strict NO_PROOF / lenient WEAK) | Rulebook §4; brief B7 | Counsel |
| Check 2 "hypothetical contact" undefined | `li_hypothetical_contact = strictest` | Rulebook §10; LI Check 2 | Prod |
| Email API and RDAP absent from the source table | Added, tier 2 | Spec §3 | Eng |
| Carrier lookup cost unassigned | `li_carrier_lookup_enabled` per client; pass-through; in cost model | Rulebook §10–11; LI settings | Prod |
| ActiveProspect snapshot API unconfirmed | Decision D13 | Spec §12 | Prod |

## 6. Counsel brief

| Gap | Fix | Where |
|---|---|---|
| `sms_treated_as_autodialed` had no counsel item | A17 (with A12 variants) | Brief A17 |
| No state consent matrix item | A18 | Brief A18 |
| No informational consent evidence item | A19 | Brief A19 |
| No source for `rnd_required_after_days` | A20 | Brief A20 |
| Seller not named: NO_PROOF or WEAK? | B7 | Brief B7 |
| Font / contrast / one-number-per-cert: law or policy? | B8 | Brief B8 |
| D12 settings only in the decision log | B9 | Brief B9; spec D12 |
| Litigation hold, retention conflicts, subpoenas | C7 | Brief C7 |
| Unauthorized practice of law not a numbered item | C8 | Brief C8 |
| CiV's own data obligations | C9 | Brief C9 |
| Affiliate page capture and test-lead seeding | C10 | Brief C10 |
| A6 starting point incomplete | Florida, Oklahoma 8pm; Connecticut 9am–8pm added as items to verify | Brief A6, D |

## 7. Carry-overs from the main-spec review

| Gap | Fix | Where | Approval |
|---|---|---|---|
| "Pick the best proof" omitted NO_PROOF | Ranking VERIFIED > WEAK > CONFLICTING > NO_PROOF; all-fail-at-step-3 → NO_PROOF | Spec §5 algorithm; design §5.2 | Eng |
| No rule for several bases on one contact | Per-basis evaluation; contact = worst; `is_legal_basis`; `bases` stored | Spec §5; design §5.3; data model | Eng |
| CONFLICTING definition contradicted three codes | Definition now includes "client pointer disagrees with provider" | Spec §5 | Eng |
| Object Lock compliance mode vs deletion | Per-client KMS keys; crypto-shredding; S3 Legal Hold; single-artifact deletion by re-keying (batch, SLA in DPA) | Spec §10; architecture §4.6, ADR-1; design §12 | Eng; Counsel (C7, C9) |
| No litigation hold | `client.legal_hold` / `artifact.legal_hold`; blocks all deletion | Spec §4, §10; rulebook §8 | Eng |
| No Merkle inclusion proof | `leaf_index`, `merkle_path` per artifact; verifier script in evidence file | Spec §9–10; architecture §8; design §12 | Eng |
| Hash of re-serialized JSON | Raw response bytes + request metadata | Spec §3; architecture §4.1 | Eng |
| `client_id` missing on three tables | Added to `opt_out_event`, `consent_proof`, `consent_evaluation`; RLS on every table | Spec §4, §10; design §1 | Eng |
| `consent_evaluation` had no `run_id` | Added | Spec §4; design §1 | Eng |
| Phase 1 core omitted `client`, `campaign`, `client_brand`, `vendor` | Phase 0 core list includes them | Spec §4 | Eng |
| "Grade A–D" meant both source grade and score grade | Source **tier 1–4**; "grade" reserved for scores | All documents | Eng |
| Connectors built before value proven; pilot client unknown | Phase 0 upload-only pilot; ADR-7 | Spec §11; BRD §11; architecture §3.3 | Prod |
| No volumes, orchestration, stack | Planning assumptions (BRD §9, D14); stack table, set on 2026-10-03 by the owner's choice: Next.js + TypeScript portal, Django backend, PostgreSQL (ADR-5, ADR-8) | BRD; architecture §6, §10; design §13 | Eng |
| Autodialer scope after *Duguid* overstated | A12 / A17 variants; strict / lenient runs | Brief; rulebook §4 | Counsel |
| Forum-dependent law after *McLaughlin* | `rule_value.jurisdiction` accepts circuit / district; `jurisdiction_chain` | Design §2; data model | Eng |

## Still open after v1.1

- Pilot client (D3), checkpoint reconciliation (D4), VLT (D5), least-privilege user (D6), referenced documents (D7), scoring constants (D8), AI gate constants (D9), launch gates (D10), live mode (D11), ActiveProspect snapshots (D13), volumes (D14), orchestration (D15).
- Every counsel item A1–A20, B1–B9, C1–C10.
- Test-case documents C01–C50 and T01–T54, CIV-ATP-01, CIV-RIM-01, Annex C, Build Plan v2 — referenced, not yet in this repository.
