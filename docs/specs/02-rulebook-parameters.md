# Rulebook parameters

**Version:** 1.1 · **Date:** 2026-10-01 · **Supersedes:** v1.0
**Changes from v1.0 are marked [v1.1].**

**The one parameter registry for the whole system,** including the Lead
Inspector. Code never hard-codes these values. Legal settings are stored in
`rule_value` with `effective_from` / `effective_to`, and each contact is
judged by the value in force on its date. Per-client settings live in
`client_parameter`, layered over the rulebook.

## 1. Status, ownership and approval

**Status:** *Set* = decided; *Proposed* = starting value from the September
2026 review, owner to confirm; *TBD* = no approved value yet.

**[v1.1] What TBD means.** A TBD key blocks *client-visible* output, not
engineering. Every TBD key carries a provisional value (and where the law is
contested, `strict` / `lenient` variants) so code can be built and tested.
See section 2.

**Owner:** Counsel, Product or Engineering. **[v1.1]** Every key also carries
`affects_status` (true if changing it can change a contact's consent status,
a checkpoint status or a Lead Inspector result). A key with
`affects_status = true` must be owned by Counsel *or* approved by the counsel
role before it may appear in an `approved` rulebook version. This moved
several v1.0 "Product" keys under counsel approval; they are marked
**[counsel-approved]** below.

**How changes work:** a change is a new rulebook version, approved by the
owner, with an effective date; old versions stay so past results reproduce.

## 2. Rulebook versions **[v1.1]**

| Status | Loads? | Runs? | Output visibility | May contain TBD? | Counsel approval of `affects_status` keys? |
|---|---|---|---|---|---|
| `draft` | yes | tests only | none | yes | no |
| `provisional` | yes | yes | `internal` — watermarked "PROVISIONAL — not for client"; hidden from client roles | yes (with provisional values / variants) | no |
| `approved` | yes | yes | `client` | **no** (loader refuses) | **required** (loader refuses otherwise) |

**Variants.** A key may carry `variants = {strict: v1, lenient: v2}`. A
provisional nightly run executes both variants and stores both
`consent_evaluation` rows; the rulebook impact dashboard shows, per key, how
many contacts change status. Counsel decides with numbers in hand.

**Loader refusals:** missing required key; `vs_rate_weights` not summing to 1;
`dedupe_window_seconds < clock_skew_seconds`; TBD key in an approved version;
unapproved `affects_status` key in an approved version.

## 3. General and time

| Key | Meaning | Default | Owner | Status | affects_status |
|---|---|---|---|---|---|
| `count_unanswered_calls` | Unanswered call attempts count as contacts | true | Counsel | Proposed (B9) | yes |
| `count_undelivered_sms` | Texts the carrier rejected count as contacts | false | Counsel | Proposed (B9) | yes |
| `metric_window_days` | Default rolling metric window | 30 | Product | Set | no |
| `lookback_years` | Lawsuit lookback | 4 | Counsel | Proposed | no |
| `location_conflict_rule` | Address and number time zones disagree | `strictest` (check both, stricter counts) | Counsel | Proposed (B9) | yes |
| **[v1.1]** `location_uncertain_treatment` | What to do with low-confidence locations | `report_as_possible` (check against area-code zone; report as "possible", never dropped) | Counsel | Proposed (B9) | yes |
| `location_uncertain_levels` | Confidence levels reported as "location uncertain" | low | Counsel | Proposed (B9) | yes |
| `clock_skew_seconds` | Tolerance for unlinked timestamps | 120 | Engineering | Set | yes **[counsel-approved]** |
| `dedupe_window_seconds` | Cross-system dedupe window, never below clock skew | 120 | Engineering | Set | no |
| `source_freshness_hours` | Source fresh if age ≤ this | 48 | Engineering | Set | no |
| `ai_min_confidence` | Minimum AI confidence per item | 0.85 | Engineering | Set | yes **[counsel-approved]** |
| `provider_retry_hours` | Retry window during provider outages | 24 | Engineering | Set | no |
| **[v1.1]** `expected_sources` | Per client: the sources a full score needs (denominator for "provisional") | set at onboarding | Product | Set | no |
| **[v1.1]** `business_day_calendar` | How business days are counted | Mon–Fri except US federal holidays, in the recipient time zone | Counsel | Proposed | yes |
| **[v1.1]** `business_day_tz_fallback` | Time zone for business-day counting when recipient location is uncertain | recipient ZIP tz → area-code tz → `America/New_York` (earliest deadline) | Counsel | Proposed | yes |

## 4. Consent

| Key | Meaning | Default | Owner | Status | affects_status |
|---|---|---|---|---|---|
| `written_consent_types` | Proof types that count as written consent | web_cert, signed_form, IVR or keypress with required disclosures | Counsel | Proposed (B1) | yes |
| **[v1.1]** `signed_written_consent_types` | Proof types that satisfy the DNC "signed written agreement" exemption | web_cert (with e-signature elements), signed_form | Counsel | Proposed (B3) | yes |
| **[v1.1]** `prior_express_evidence_types` | Records accepted as prior express (non-written) consent for informational robocalls | CRM purchase or intake record where the customer supplied the number, with source and timestamp (tier 3). A bare CRM consent flag is never enough | Counsel | TBD (A19); provisional as stated | yes |
| `autodialed_modes` | Dialer modes treated as autodialed | — | Counsel | TBD (A12, A17). Provisional variants: strict = every mode except manual; lenient = none (only prerecorded/AI counts) | yes |
| `sms_treated_as_autodialed` | Marketing texts treated as autodialed | true | Counsel | Proposed (A17). Variants: strict = true; lenient = false | yes |
| **[v1.1]** `state_consent_rule` (table) | Per state: channels, contact types, autodialer definition, consent type required, PRA, effective dates | seeded FL, OK, MD | Counsel | TBD (A18) | yes |
| `ebr_purchase_months` / `ebr_inquiry_months` | Existing-customer relationship lapse | 18 / 3 | Counsel | Proposed (A9) | yes |
| `ebr_allowed_contact_types` | What a relationship can cover | live, manually dialed calls | Counsel | Proposed (A9) | yes |
| `consent_checklist` | Items, required or optional, and each item's effect | — | Counsel | TBD (A10). Provisional: the `CC_*` table in the Lead Inspector doc with its stated effects | yes |
| **[v1.1]** `seller_absent_effect` | Status when no seller name is found in the consent block | — | Counsel | TBD (B7). Variants: strict = NO_PROOF (`NP_SELLER_ABSENT`); lenient = WEAK (`WK_SELLER_NOT_FOUND`) | yes |
| **[v1.1]** `seller_match_threshold` | Token similarity for the rule-based brand / DBA match | 0.92 (Jaro-Winkler) | Engineering | Set | yes **[counsel-approved]** |
| `max_numbers_per_cert` | Numbers one certificate may cover | 1 | Product | Set (B8) | yes **[counsel-approved]** |
| `cert_unretained_expiry_hours` / `cert_confirmed_expiry_hours` | Vendor deletion windows | 72 / 2,160 | Engineering | Set (vendor-documented) | yes |
| `cert_expiry_warning_days` | WEAK when expiring within this of `evaluation_as_of` | 30 | Product | Set | yes **[counsel-approved]** |
| `page_capture_interval_hours` | Re-capture interval for consent pages | 24 | Engineering | Set | no |
| `page_normalize_rules` | Page parts ignored when hashing | timestamps, session IDs, ads | Engineering | Set | no |
| `page_snapshot_max_gap_days` | Max gap for comparing CiV capture with certificate snapshot | 1 | Product | Proposed | yes **[counsel-approved]** |
| **[v1.1]** `page_similarity_method` | How `ca_page_match_threshold` is measured | `consent_block_text` (normalized text similarity of the consent block; whole-page visual hash reported for information) | Engineering | Set | yes **[counsel-approved]** |
| `ca_page_match_threshold` | Minimum page similarity | 0.90 | Product | Set | yes **[counsel-approved]** |
| `cc_viewports` | Screen sizes pages are rendered at | 390 × 844, 1440 × 900 | Product | Set | no |
| `cc_min_contrast_ratio` | Minimum text contrast | 4.5 : 1 (3 : 1 large text) | Product | Set (B8) | yes **[counsel-approved]** |
| `cc_min_font_px` | Minimum consent text size | — | Counsel | TBD (A15a); provisional 10 px | yes |
| `cc_max_sellers_named` | Most sellers one consent may name (CiV policy) | — | Counsel | TBD (A15a); provisional 5 | yes |
| `cc_consent_above_button` | Consent text must sit above the button | true | Counsel | Proposed | yes |

## 5. Stopping

| Key | Meaning | Default | Owner | Status | affects_status |
|---|---|---|---|---|---|
| `optout_keywords` | Replies treated as automatic opt-outs | STOP, QUIT, END, REVOKE, OPT OUT, OPTOUT, CANCEL, UNSUBSCRIBE | Counsel | Proposed (A3) | yes |
| `optout_deadline_business_days` | Deadline to honor an opt-out | 10 | Counsel | Proposed (A1) | yes |
| **[v1.1]** `optout_grace_business_days` (replaces `optout_grace_hours`) | Delay before a later contact counts, in business days | — | Counsel | TBD (A4). Variants: strict = 0; lenient = 10 | yes |
| `confirmation_window_minutes` | One confirmation text allowed, no marketing | 5 | Counsel | Proposed (A2) | yes |
| `optout_scope_rules` | Which messages an opt-out stops, by channel and message category, effective-dated | Before 2027-01-31: per counsel; from 2027-01-31: revoke-all as finalized | Counsel | TBD (A5). Provisional: any opt-out stops everything | yes |
| `optout_observation_days` | How long a test opt-out is watched before NEVER | 30 | Product | Set | no |
| `min_tests_per_cell` | Tests before a matrix cell or M09 result is a finding | 3 | Product | Set | no |
| `retest_interval_days` | Revocation re-test interval for retainer clients | 30 | Product | Set | no |
| **[v1.1]** `revocation_window_days` | Period for M08 / M09 (tests completed in the last N days) | 90 | Product | Set | no |

## 6. Who you contact

| Key | Meaning | Default | Owner | Status | affects_status |
|---|---|---|---|---|---|
| `rnd_check_rule` | What counts as a proper reassigned-number check | After the latest monthly update, about the consent date, answer No | Counsel | Proposed (A13) | yes |
| `rnd_required_after_days` | Check required for robocalls this long after consent | — | Counsel | **[v1.1]** TBD (A20; v1.0's 30 had no stated source); provisional 30 | yes |
| **[v1.1]** `rnd_query_budget_per_number` | Paid CiV RND queries per number needing an epoch search | 12 | Product | Set | no |
| **[v1.1]** `rnd_update_calendar` | Somos monthly update dates (reference table) | maintained by Engineering | Engineering | Set | no |
| `dnc_scrub_max_age_days` | Oldest scrub allowed at contact | 31 | Counsel | Proposed (A14) | yes |
| `nanp_non_us_area_codes` | +1 area codes outside the US | reference data | Engineering | Set | no |

## 7. How you contact

| Key | Meaning | Default | Owner | Status | affects_status |
|---|---|---|---|---|---|
| `calling_hours` | Federal and state windows by weekday, with each state's scope, effective-dated | — | Counsel | TBD (A6). Provisional: federal 08:00–21:00; FL, OK 08:00–20:00; MD, CT ends 20:00; CT starts 09:00; TX Sunday from 12:00 — all to verify | yes |
| `quiet_hours_apply_to_sms` | Calling hours apply to texts, per forum | — | Counsel | TBD (B4). Variants: strict = true; lenient = false | yes |
| `frequency_limits` | Per state: maximum, window, counting unit, scope | — | Counsel | TBD (A7). Provisional: FL, OK, MD 3 per 24 h per person per subject, solicitations only | yes |
| `frequency_per_campaign` | Count per campaign instead of per client | false | Counsel | Proposed | yes |
| `state_holiday_restrictions` | Restricted dates by state | — | Counsel | TBD (A8) | yes |
| `required_disclosures` | Words calls and texts must contain | — | Counsel | TBD (A11) | yes |
| `abandoned_call_max_rate` | Abandoned-call limit per campaign per period | 3 % | Counsel | Proposed (A11) | yes |
| **[v1.1]** `abandon_connect_seconds` | Seconds after greeting within which a live agent must connect | 2 | Counsel | Proposed (A11) | yes |
| **[v1.1]** `abandon_period_days` | Period over which the abandoned-call rate is measured | 30 | Counsel | Proposed (A11) | no |
| `disclosure_sample_size` | Recorded calls reviewed per campaign per period | 50 | Product | Set | no |

## 8. Records

| Key | Meaning | Default | Owner | Status | affects_status |
|---|---|---|---|---|---|
| `record_retention_years` | Retention required for call, consent, EBR and DNC records | 5 | Counsel | Proposed (A16) | no |
| **[v1.1]** `civ_default_retention_years` | CiV artifact retention when the client contract is silent | max(`record_retention_years`, `lookback_years`) + 1 = 6 | Counsel | Proposed (C7) | no |
| **[v1.1]** `legal_hold` | Per client (or per artifact): blocks every deletion including key destruction | false | Counsel | Set (C7) | no |
| `vendor_required_clauses` | Clauses each vendor contract must contain | — | Counsel | TBD (A15b) | no |
| `vendor_active_days` | Vendor active if it sent a lead within | 90 | Product | Set | no |
| `require_sub_id` | Affiliate networks must supply a sub-ID | true | Product | Set | no |
| `acquired_list_sample_size` / `acquired_list_max_failures` | Acquired list sampling | 100 / 2 | Product | Set | no |
| `training_valid_days` | Training record stays current | 365 | Product | Set | no |
| **[v1.1]** `default_dispute_window_days` | Dispute window when a vendor has no contract on file | 0 (no dispute candidates; shown as "no contract on file") | Product | Set | no |

## 9. Scoring and gates

| Key | Meaning | Default | Owner | Status | affects_status |
|---|---|---|---|---|---|
| `warn_credit` | Credit for a warn result | 0.5 | Product | Proposed (D8) | no |
| `domain_weights` | Weights of domains in the overall score | equal | Product | Proposed (D8) | no |
| `grade_bands` | Cut-offs for A, B, C, D | 90 / 80 / 70 / 60 | Product | Set | no |
| `hard_cap_share` / `hard_cap_grade` | Cap trigger and capped grade | — / C | Product | TBD (D8); provisional 5 % | no |
| `provisional_completeness` | Below this share of `expected_sources`, a score is provisional | 80 % | Product | Set | no |
| **[v1.1]** `checkpoint_aggregation_default` | Default {unit, pass_max_share, warn_max_share} where a checkpoint has none | {contact, 0 %, 1 %} | Product | Proposed (D4) | yes **[counsel-approved]** |
| `gate_sample_size` / `gate_min_per_reason_code` | Gate 0 / Gate 2 hand-check sample | 200 / 5 | Product | Set | no |
| `ai_accuracy_min_items` / `ai_accuracy_pass_mark` | AI feature gate | 300 / 95 % | Product | Proposed (D9) | no |

## 10. Lead Inspector

| Key | Meaning | Default | Owner | Status | affects_status |
|---|---|---|---|---|---|
| `li_min_form_seconds` / `li_hard_signal_form_seconds` | Fast fill / instant fill | 8 / 2 s | Product | Set | yes **[counsel-approved]** |
| `li_device_burst_count` / `li_device_burst_window_minutes` | Device burst, per client | 5 / 60 | Product | Set | yes **[counsel-approved]** |
| `li_line_status_max_age_days` | Line status used only this close to the lead date | 30 | Product | Set | yes **[counsel-approved]** |
| `li_suspect_line_types` | Line types that add points | non-fixed VoIP | Product | Set | yes **[counsel-approved]** |
| `li_name_match_threshold` | Minimum name similarity | 0.6 | Product | Set | yes **[counsel-approved]** |
| `li_min_domain_age_days` | New-website signal | 90 | Product | Set | yes **[counsel-approved]** |
| **[v1.1]** `li_signal_points` | Points per signal (moved here from the Lead Inspector tab) | fast_fill 25; pasted_fields 10; device_burst 25; location_mismatch 10; line_type 10; name_match 20; email 15; new_website 15 | Product | Set | yes **[counsel-approved]** |
| **[v1.1]** `li_hard_signals` | Signals that set "High risk signals" alone | instant_fill, line_out_of_service, certificate_after_delivery | Product | Set | yes **[counsel-approved]** |
| `li_some_risk_threshold` / `li_high_risk_threshold` | Result thresholds (inclusive) | 40 / 70 | Product | Set | yes **[counsel-approved]** |
| **[v1.1]** `li_hypothetical_contact` | The contact Check 2 evaluates against | `strictest` — an autodialed marketing contact on every channel the lead covers | Product | Set | yes **[counsel-approved]** |
| **[v1.1]** `li_carrier_lookup_enabled` | Per client: run carrier lookups (pass-through cost) | false until the client opts in | Product | Set | no |
| `vs_window_days` | Vendor score period | 90 | Product | Set | no |
| `vs_rate_weights` | Rate weights; must sum to 1 | 0.35 / 0.30 / 0.15 / 0.10 / 0.05 / 0.05 | Product | Set | no |
| `vs_some_weight` | Weight of a "Some" lead against "High" | 0.5 | Product | Set | no |
| `vs_max_delivery_hours` | Late delivery threshold | 24 | Product | Set | no |
| `vs_stop_window_days` | Stop and complaint window | 30 | Product | Set | no |
| `vs_grade_bands` / `vs_min_leads_for_score` / `vs_alert_drop_points` | Grades, minimum leads, alert drop | 90/80/70/60, 100, 10 | Product | Set | no |
| `lg_response_timeout_ms` / `lg_webhook_retry_count` | Live mode (post-pilot) | 3,000 / 5 | Engineering | Set | no |

## 11. Per-client settings (`client_parameter`)

| Key | Meaning | Set by |
|---|---|---|
| `engagement_start_date`, brands and DBAs, `litigation_forum` (state, federal circuit, district) | Client facts used by the engine | Client + Product at onboarding |
| Campaign category map | Marketing / informational / unknown per campaign | Client confirms at onboarding |
| `expected_sources` | Sources the client will connect | Client + Product |
| `optout_dispositions` | Dialer outcomes meaning "stop" | Client + Product |
| `optout_exclusive_methods` | Designated opt-out methods and whether disclosed | Client + Counsel |
| `retention_by_data_type` | Retention per data type | Client contract |
| `legal_hold` | Litigation hold | CiV counsel role on client's counsel's instruction |
| `complaint_resolution_target_days` | Target days to resolve complaints | Client |
| `vs_dispute_window_days` | Dispute window per vendor | Vendor contract (else `default_dispute_window_days`) |
| `li_carrier_lookup_enabled` | Opt in to carrier lookups | Client |

## 12. Removed or renamed in this version

- `optout_grace_hours` → `optout_grace_business_days` (the deadline is in business days).
- `client_list_max_age_days` (removed in v1.0, replaced by `dnc_scrub_max_age_days`).
- Separate `optout_scope` (merged into `optout_scope_rules`).
- Per-setting copies in the Lead Inspector tab (points now live only here as `li_signal_points`).
- Hard-coded values removed from metric cards: 90 days (M08/M09) → `revocation_window_days`; 2 s and 30 days (M31) → `abandon_connect_seconds`, `abandon_period_days`.
