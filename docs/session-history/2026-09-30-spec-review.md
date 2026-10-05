# Session notes — CiV TCPA Audit System spec review

**Date:** 2026-09-30
**Raw transcript:** `2026-09-30-spec-review.jsonl` (same folder)

## What was reviewed

The v1.0 document set for the CiV Automated TCPA Audit System:

1. Engineering Spec (Sep 27, 2026, @Zen)
2. Rulebook parameters
3. Metric specs
4. Lead Inspector
5. Counsel brief

## Overall verdict

The foundations are sound: per-contact consent statuses with reason codes, reproducible results (`evaluation_as_of` + versioned rulebook), graded evidence, "not run" never counted as a pass, and measurement-only wording. The main risks are scope (25 domains, 1,132 checkpoints, 12+ connectors, 5 AI features before a pilot), a Phase 2 critical path blocked on counsel settings, and a handful of engine-logic and cross-document inconsistencies.

## Gaps found and agreed fixes

### 1. Blocker — Phase 2 cannot start
TBD settings `autodialed_modes` (A12), `optout_grace_hours` (A4), `optout_scope_rules` (A5), `consent_checklist` (A10) block the consent engine on every contact.
**Fix:** `rulebook_version.status` = draft / provisional / approved. Provisional runs are internal only and watermarked. TBD blocks client output, not code or tests. Contested settings run strict and lenient so counsel sees the impact.

### 2. Cross-document contradictions
| # | Issue | Fix |
|---|---|---|
| 1 | A15 gated Phase 2 in brief, Gate 4 in main spec | Split A15: font size + seller count → Gate 2; vendor clauses → Gate 4 |
| 2 | M08 says nearest-rank, example gives 13.0 h (interpolated) | Keep nearest-rank; example median = 6.0 h |
| 3 | Hard-coded 90 days (M08/M09), 2 s and 30 days (M31), hard-signal list | New parameters |
| 4 | `li_signal_points` points back to the Lead Inspector tab | Move points into the rulebook |
| 5 | `CF_CERT_AFTER_DELIVERY` has clock tolerance in Lead Inspector, not main spec | Align main spec to L21 |
| 6 | M22b "conduct" includes M19 (a proof measure) | Remove M19 from M22b |
| 7 | M22a element 1 mixes legal-basis and CiV-policy contacts | Two lines, like M01 |
| 8 | Product-owned settings change consent status | `affects_status` flag requires counsel approval |
| 9 | Low-confidence locations excluded despite "cautious default" | Report as "possible" using area-code time zone |

### 3. Missing from the rulebook
- State consent matrix (`state_law` basis has no data behind it)
- `dnc_unknown` basis when client DNC lists are not supplied
- Evidence standard for informational prior express consent
- Contact → checkpoint aggregation rule and `metric_checkpoint_map`
- Parameters: RND query budget, RND update calendar, default dispute window, CiV default retention, legal hold, expected sources, page-similarity method, business-day time-zone fallback
- `rnd_required_after_days` = 30 has no stated source → counsel
- Backfilled leads can never have a contemporaneous page capture → label "not comparable"

### 4. Metric cards
Card linter for the 7-field template; missing periods and missing-data rules filled; M11 population defined for contacts with no proof; M13 bucket (a) split into signed-written vs other; M09 time zone for test numbers.

### 5. Lead Inspector
Rule-based seller-name pass so seller identity is measured in Phase 2; `seller_absent_effect` for counsel; `li_hypothetical_contact` = strictest; email-verification API and RDAP added to the source table; carrier-lookup cost pass-through; D13 (ActiveProspect snapshot API).

### 6. Counsel brief additions
A17 autodialer / texts post-*Duguid* per forum · A18 state consent matrix · A19 informational consent evidence · A20 `rnd_required_after_days` source · B7 seller not named · B8 font/contrast/one-number-per-cert: law or policy · B9 D12 location rules · C7 litigation hold, retention conflicts, subpoenas · C8 unauthorized practice of law · C9 CiV's own data obligations (GLBA, state privacy, recordings, DPA) · C10 affiliate page capture and test-lead seeding. A6 starting point to verify: Florida and Oklahoma 8pm end; Connecticut 9am–8pm.

### 7. Carry-overs from the main-spec review
- Proof ranking includes NO_PROOF; all-fail-at-step-3 → NO_PROOF with step-3 codes
- Multi-basis contacts: evaluate per basis, contact status = worst, legal if any basis is legal
- Object Lock vs deletion: per-client encryption keys (crypto-shredding) + S3 Legal Hold
- Merkle inclusion path stored per artifact, shipped in the evidence file with a verifier
- `client_id` on `opt_out_event`, `consent_proof`, `consent_evaluation`; RLS on every table
- Source grade renamed Tier 1–4 (avoids clash with score grade A–F)

### Legal points flagged for counsel (not legal advice)
- *Facebook v. Duguid* (2021): most predictive/power dialers are not an ATDS; `autodialed_modes` and `sms_treated_as_autodialed` defaults would over-count legally required proof
- *McLaughlin v. McKesson* (2025): district courts not bound by FCC interpretations → rules need forum awareness
- DNC exemption needs a signed written agreement (47 CFR 64.1200(c)(2)(ii)), not any consent
- One-to-one consent rule vacated (*IMC v. FCC*, 11th Cir. Jan 2025)
- Verify: FCC Sep 30, 2026 order; revoke-all Jan 31, 2027; July 2026 Seventh Circuit texts decision; RND coverage dates

## Open questions for the user

- Pilot client (D3) and its dialer / SMS / CRM stack
- Whether to adopt the upload-first "Phase 0" (CSV exports + TrustedForm → consent engine → one evidence file) before building connectors
- Supporting documents not yet supplied: test cases C01–C50 and T01–T54, CIV-ATP-01, CIV-RIM-01, Annex C, Build Plan v2

## Next step

Write the consolidated v1.1 documents into `docs/specs/` with every fix above folded in.
