# CiV Automated TCPA Audit System — Engineering Spec

**Version:** 1.1 · **Date:** 2026-10-01 · **Supersedes:** v1.0 (Sep 27, 2026, @Zen)
**Change summary:** [CHANGELOG-v1.1.md](CHANGELOG-v1.1.md). Changes from v1.0 are marked **[v1.1]**.

---

## 1. Overview

The system automatically builds, for every contact a client made, an
independent record of whether proof of permission existed and what the
contact's circumstances were, rolled up per phone epoch, and flags every gap.
It runs the CIV-ATP-01 checkpoint library against data pulled from the
client's own tools.

**Who uses it:** companies that make outbound sales calls and texts (first
verticals: HVAC, solar, insurance, financial services). The buyer is usually
the general counsel or owner.

**What it is not:** a call blocker. CiV never contacts the client's customers
and never blocks, dials or scrubs on the client's behalf. CiV does make its
own test contacts (revocation tests from CiV test numbers, and one callback to
each client caller ID for M21) and captures public consent pages with a
headless browser.

### Product rules engineers must build to

1. **Consent is decided per contact.** Every call and text gets its own consent status. A number's result is rolled up from its contacts.
2. **Consent needs proof — as a CiV policy, reported separately from the law.** Every contact records *why* proof is needed (`consent_required_basis`). A manual live call to a number on no DNC list is NO_PROOF with basis "CiV policy only". **[v1.1]** A contact may carry several bases; each is evaluated and reported separately (section 5).
3. **CiV does not sell DNC or litigator lists.** The client supplies its own lists and scrub records, labelled "supplied by client". **[v1.1]** When no list covers a contact's date the basis is `dnc_unknown`, never silently "CiV policy only".
4. **Everything runs automatically.** No human is in the loop to produce a result.
5. **Official access only.** Published APIs with the client's own credentials, read-only wherever offered.
6. **Flag, don't judge — in names too.** No output uses "violation", "breach", "illegal", "compromised", "fake", "fraud", "compliant", "non-compliant" or "ensures compliance".
7. **Names describe acts, not outcomes.** Capture, Test, Record — never Protection, Assurance, Prevention.
8. **Evidence is tamper-evident and tiered by source** (section 10). A hash proves a file is unchanged, not that it was true. **[v1.1]** "Tier 1–4" replaces "grade A–D" for sources; "grade" is reserved for scores.
9. **Built for counsel.** Counsel-directed engagements and certifiable evidence copies, without claiming more protection than the law gives.
10. **[v1.1] A status-affecting parameter needs counsel approval.** Any rulebook key flagged `affects_status` must be approved by the counsel role before an `approved` rulebook version can include it.
11. **[v1.1] TBD blocks client output, not engineering.** A `provisional` rulebook lets code be built and tested; its outputs are watermarked and never shown to client roles.

## 2. System architecture

The pipeline has six layers, and nothing is checked until its raw source has
been hashed into the evidence store. The layer diagram, the consent flowchart,
the domain map and the build-phase diagram are in
[../architecture.md](../architecture.md) section 3.

| Component | Responsibility | Key requirement |
|---|---|---|
| Connector service | Pull data from client tools through published APIs | Client-owned credentials, read-only or least-privilege, every call in `access_log`; hash raw response bytes |
| Upload service | Accept files for tools without an API, plus client lists | Record uploader, time and hash; tier 4 |
| Evidence store | Keep every raw artifact exactly as received | S3 Object Lock (compliance), SHA-256 at capture, daily anchoring, **[v1.1]** per-client keys, legal hold, inclusion proofs |
| Normalizer | Turn sources into outbound contact events and phone epochs | Dedupe across systems only; time zone from ZIP *and* area code; epochs as date ranges with certainty |
| Consent engine | Decide a consent status for every contact and every basis | Section 5; same inputs + `evaluation_as_of` = same result |
| Revocation tester | Send opt-outs from CiV test numbers and time suppression | Section 8 |
| Lead Inspector | Batch checks on each lead and vendor scorecards | [04-lead-inspector.md](04-lead-inspector.md); batch only in v1 |
| AI reader | Every AI feature | Each feature has its own accuracy gate; outputs stored with model and prompt version |
| Rules engine | Run the checkpoints against normalized data | Each result references checkpoint, run and rule values used; **[v1.1]** per-checkpoint aggregation rule |
| Rulebook | Dated legal rule values plus per-client settings | One parameter registry ([02-rulebook-parameters.md](02-rulebook-parameters.md)); **[v1.1]** draft / provisional / approved |
| Outputs | Metrics, evidence file, fix list, alerts, portal | Sections 7 and 9 |

## 3. Data sources and connectors

Every source connects through a published API with the client's own
credentials, or falls back to a client upload. The connector layer is
pluggable: a new vendor is one adapter. Each source carries a **source tier**
(section 4). Vendor facts below are as reported in the September 2026 review;
confirm each vendor's current API and terms before building its adapter.

| Source | First vendors | Access | Data pulled | Fallback | Tier |
|---|---|---|---|---|---|
| Consent certificates | TrustedForm (Certificate API v4, HTTP Basic with the client's account key); Jornaya (owned by ActiveProspect since Jan 2026; buyer's own account codes, billed to buyer) | Client's account | Certificate ID, phone, timestamps, page URL, page snapshot, seller, retention status. Unretained certificates deleted after 72 h (90 days if confirmed); retained 5 years | Client supplies certificate IDs; CiV still retrieves each one | 2 |
| Other consent proof | IVR / keypress recordings, signed forms | Upload or recording platform API | File, date, phone, whether required disclosures were played | Upload | 3 or 4 |
| Dialers | Five9 (reporting-only API user role), Convoso (single token, no scopes → least-privilege fallback), RingCentral, NICE CXone | Client's account | Every call: number, time, direction, connect and end time, dial mode, prerecorded / AI flag, campaign, agent, disposition, caller ID, attestation if exposed, recording link | Daily export | 3 / 4 |
| SMS platforms | Twilio and similar | Client's account | Every message: number, time, direction, body, delivery status; every inbound reply | Daily export | 3 / 4 |
| CRM | Salesforce, HubSpot, ServiceTitan (each client creates its own custom app until partner approval) | Client's account | Contact ID, all phone numbers, **address (state, ZIP) with change history**, created date, lead ID and source, certificate ID, consent and opt-out fields with timestamps, customer status, purchase and inquiry dates | Export | 3 / 4 |
| Lead platforms | LeadConduit, lead vendors | Client's account | Lead ID, vendor, sub-ID, first-party flag, capture URL, capture and delivery times, certificate ID, price | Lead file | 3 / 4 |
| Reassigned Numbers Database | Somos (reassigned.us Caller API or bulk SFTP) | CiV's own registered caller-agent account | Yes / No / No Data to "permanently disconnected since date X?". No disconnect dates. Coverage from July 27, 2020 (dates before Jan 27, 2021 return no data) | None; "not checked" | 1 |
| Client's own RND query logs | Client's Somos account | Export | Each query: number, date asked about, time queried, answer | None; M11 not measured | 4 |
| DNC scrub records | Client's scrub vendor | Export or client vendor API | Registry version used, scrub time, numbers flagged | None; M13 not measured | 3 / 4 |
| Complaint log | Client | Upload | Date, number, channel, description, resolution date | None; M24 not measured | 4 |
| Carrier line type and caller name | Official lookup provider (e.g. Twilio Lookup), only under written use-case approval | CiV's account | Line type, carrier, caller name, line status | None; signals "not measured" | 2 |
| **[v1.1]** Email verification | Commercial verification API (never direct mail-server probing) | CiV's account | Deliverability, disposable-domain flag | None; signal "not measured" | 2 |
| **[v1.1]** Domain age | RDAP public registration lookup | Public | Registration date | None; signal "not measured" | 2 |
| Consent page captures | CiV headless browser | Public pages | Rendered page, screenshot, DOM, text, measurements, hash | None | 1 |
| Form behaviour data | TrustedForm Insights (bought by the client, per data point) | Client's account | Time on page, paste, device and IP data | None; signals "not measured" | 2 |
| Client lists | Internal do-not-contact, DNC scrub output, litigator lists | Upload or client vendor API | Number, entry date or list version date | Required for list metrics | 4 |
| Documents | Vendor contracts, policies, training logs | Upload | PDF / DOCX / CSV | Upload only | 4 |

### Connector requirements

- **Credentials:** OAuth where offered, else API key, in a secrets vault, revocable by the client from the portal.
- **When no read-only access exists:** (1) a dedicated least-privilege user, with CiV's contract committing to reads only and every call logged; (2) scheduled exports, tier 4. (Decision D6.)
- **Billed vendor operations:** CiV never triggers a billed operation on the client's account (certificate retain, verify, insights) without the client's written approval, stored as an artifact.
- **Build order follows the pilot client's systems** (D3). **[v1.1]** Phase 0 runs on uploads only, before any adapter.
- **Sync:** backfill up to `lookback_years`; then daily pulls plus webhooks for replies and new leads.
- **Health:** a connector not synced within `source_freshness_hours` raises an alert; dependent metrics show "not measured — source missing".
- **Terms of service:** confirm each vendor's API terms allow client-authorised third-party access before building its adapter.
- **[v1.1] Raw bytes:** the artifact is the exact response body plus request metadata (URL, status, subset of headers); never a re-serialized object.

## 4. Data model

The central objects are the **contact event** (where consent is decided) and
the **phone epoch** (one number held by one person). Legal rules are stored
with the dates they apply, and every versioned row carries
`valid_from` / `valid_to`. Column-level definitions are in
[../design.md](../design.md) section 1. Summary of tables:

| Group | Table | Key fields |
|---|---|---|
| Configuration | `rulebook_version` | version_id, **[v1.1]** status (draft / provisional / approved), published_at, approved_by, **[v1.1]** counsel_approved_by, notes |
| Configuration | `rule_value` | key, value, jurisdiction (**[v1.1]** state *or* federal circuit / district), effective_from, effective_to, rulebook_version, **[v1.1]** affects_status, owner, status, variants (strict / lenient), source_ref |
| Configuration | **[v1.1]** `state_consent_rule` | state, effective dates, channels_covered, contact_types_covered, autodialer_definition, consent_type_required (any / written / signed_written), private_right_of_action, source_ref |
| Configuration | `client_parameter` | client_id, key, value, effective dates, set_by, approved_by |
| Configuration | `client` | client_id, name, verticals, states, engagement_start_date, engagement_mode (direct / counsel_directed), litigation_forum, **[v1.1]** legal_hold, kms_key_arn, expected_sources |
| Configuration | `client_brand` | client_id, brand or DBA name, valid dates |
| Configuration | `campaign` | campaign_id, client_id, source_system, message_category (marketing / informational / unknown), confirmed_by, valid_from |
| Runs | `run` | run_id, client_id, kind (nightly / backfill / report / phase0), evaluation_as_of, rulebook_version, code_version, **[v1.1]** variant, output_visibility (client / internal), started_at, finished_at |
| Runs | `checkpoint` | checkpoint_id, domain_code, automation_bucket, test_procedure, criteria, weight, authority_ids, **[v1.1]** aggregation {unit, pass_max_share, warn_max_share} |
| Runs | **[v1.1]** `metric_checkpoint_map` | metric_code, checkpoint_id |
| Evidence | `artifact` | artifact_id, client_id, source_system, source_record_id, access_level, source_tier (1–4), pulled_at, sha256, storage_uri, retention_until, **[v1.1]** kms_key_id, legal_hold, leaf_index, merkle_date, merkle_path, request_meta |
| Evidence | `deletion_log` | artifact_id, deleted_at, reason (retention / client_request / legal), sha256 kept, approved_by, **[v1.1]** method |
| Evidence | `merkle_anchor` | date, merkle_root, opentimestamps_proof, rfc3161_token, **[v1.1]** status, leaf_count |
| Evidence | `access_log` | who, what, when, from where — every portal view, export and connector call |
| Evidence | `ai_output` | output_id, feature, model, prompt_version, checklist_version, input_artifact_ids, output, confidence, created_at |
| Evidence | **[v1.1]** `ai_gate` | feature, items_tested, agreement, passed, evaluated_at |
| Evidence | `page_capture` | capture_id, url, captured_at, viewport, screenshot and DOM artifact ids, measurements, **[v1.1]** consent_block_hash, similarity_to {proof_id, score, method} |
| Numbers | `phone_epoch` | epoch_id, client_id, phone_e164, start_after, start_before, end_after, end_before, epoch_certainty (known / bounded / unknown), evidence_artifact_ids, valid dates |
| Numbers | `contact_epoch_assignment` | event_id or proof_id, epoch_id, assignment_certainty, valid dates |
| Numbers | `address_version` | contact_id, state, zip, time_zone, valid dates, source |
| Numbers | `rnd_query_log` | phone_e164, date_asked_about, queried_at, answer, queried_by (client / civ), monthly_update_date, artifact_id |
| Contacts | `contact_event` | event_id, client_id, phone_e164, source_system, direction, channel, occurred_at_utc, connected_at, ended_at, answered, disposition, sms_delivery_status, body_artifact_id, recording_artifact_id, dial_mode, prerecorded_or_ai, campaign_id, agent_id, caller_id, stir_attestation, lead_id, address_version_id, line_type, location_confidence, **[v1.1]** local_time_zone_zip, local_time_zone_area, dedupe_group_id, is_test, frozen |
| Consent | `consent_proof` | proof_id, **[v1.1]** client_id, proof_type (web_cert / ivr_recording / keypress / signed_form / existing_customer / prior_express), provider, provider_ref, captured_at, confirmed, phone_on_proof, seller_named, **[v1.1]** seller_match, page_url, channels_covered, disclosures_played, relationship_type, relationship_date, retention_status, expires_at, artifact_id, valid_from |
| Consent | `consent_evaluation` | eval_id, **[v1.1]** client_id, event_id, **[v1.1]** run_id, evaluation_as_of, **[v1.1]** variant, status, primary_reason_code, reason_codes, **[v1.1]** bases [{basis, status, codes, proof_id}], is_legal_basis, labels, proof_id, frozen, **[v1.1]** reeval_reason, rulebook_version, rule_values_used, ai_output_ids, valid_from |
| Leads | `lead` | lead_id, client_id, vendor_id, sub_id, first_party, capture_url, captured_at, delivered_at, cert_ref, price, is_test |
| Leads | `vendor`, `vendor_contract`, `acquired_list` | as v1.0; `acquired_list` **[v1.1]** adds sample_seed |
| Stopping | `opt_out_event` | opt_out_id, **[v1.1]** client_id, phone_e164, channel, method, received_at, text, scope, source (client_data / civ_test), **[v1.1]** designated, is_test |
| Stopping | `opt_out_suppression` | opt_out_id, system, suppressed_at or null, inferred |
| Revocation tests | `test_number`, `annex_c_authorization`, `revocation_test`, `matrix_cell` | as v1.0; `test_number` **[v1.1]** adds time_zone; `matrix_cell` adds p90_hours |
| Client records | `client_list_entry`, `scrub_run`, `complaint`, `agent`, `training_record` | as v1.0; `client_list_entry` **[v1.1]** adds date_approximate |
| Results | `checkpoint_result` | result_id, run_id, checkpoint_id, scope, status (pass / warn / fail / not_run), reason_code, **[v1.1]** share, evidence_artifact_ids, ai_output_ids |
| Results | `metric_snapshot` | client_id, metric_code, date, value, numerator, denominator, data_completeness, checkpoints_run, **[v1.1]** checkpoints_total, run_id, breakdown, labels |
| Results | `finding` | finding_id, client_id, severity, domain_code, title, affected_count, fix_step_ids, first_seen, status |

### Phone epochs

The Reassigned Numbers Database only answers yes, no or no data to "was this
number permanently disconnected since date X?" It never gives the disconnect
date, and it has no data before July 27, 2020. So:

- An epoch boundary is stored as a **range** (`end_after … end_before`), found by repeated dated queries between the consent date and the contact date (**[v1.1]** budget `rnd_query_budget_per_number`), or from a second carrier source.
- `epoch_certainty`: **known** (boundary pinned to a day), **bounded** (range), **unknown** (no data or never checked).
- A contact inside a bounded range is labelled "reassignment uncertain". Any result on an unknown epoch is labelled **"reassignment not checked"**; it is never silently treated as the same person.
- CiV's own after-the-fact queries **do** split epochs; they are not counted as the client's pre-contact check (M11).
- **[v1.1]** The monthly update dates come from the `rnd_update_calendar` reference table.

### Source tiers **[v1.1 naming]**

Tier by where the **content** came from, not who supplied the pointer.

| Tier | Meaning | Examples |
|---|---|---|
| 1 | Captured by CiV itself | Page captures, CiV RND queries, test-number records |
| 2 | Retrieved by CiV from an independent third party | Certificate retrieved from TrustedForm (even if the client supplied the ID), carrier lookups, email verification, RDAP |
| 3 | Retrieved by CiV from the client's own systems by API | Dialer, SMS, CRM, lead platform records |
| 4 | Uploaded or exported by the client | CSV exports, lists, documents, client query logs |

### Versioning, deletion and contacts

- **Versioning:** rows are never overwritten; a change closes the old row and opens a new one. Epoch assignments live in `contact_epoch_assignment`, so a later split re-points contacts without editing them.
- **Deletion:** content deletion is recorded in `deletion_log`; the artifact row and hash stay. Results depending on deleted content are frozen (section 5). **[v1.1]** Mechanism: per-client encryption key destruction; legal hold blocks it (section 10).
- **Contacts:** only `direction = outbound` rows are contacts. A text counts once the SMS platform accepts it; delivery status is stored separately. `count_unanswered_calls` and `count_undelivered_sms` decide the edge cases.
- **Dedupe:** matches only **across systems**, one-to-one, same number and channel within `dedupe_window_seconds` (never less than `clock_skew_seconds`). Two dialer calls 40 seconds apart stay two contacts. The dialer or SMS record wins.
- **Time:** UTC everywhere. **[v1.1]** Both the ZIP time zone (from the `address_version` in force) and the area-code time zone are stored; when they disagree, both are checked and the stricter result counts (`location_conflict_rule`); low-confidence contacts are reported as "possible" findings, never dropped (`location_uncertain_treatment`).

### Phase 0 core **[v1.1]**

`rulebook_version`, `rule_value`, `state_consent_rule`, `client_parameter`,
`client`, `client_brand`, `campaign`, `run`, `artifact`, `deletion_log`,
`merkle_anchor`, `access_log`, `ai_output`, `ai_gate`, `page_capture`,
`phone_epoch`, `contact_epoch_assignment`, `address_version`,
`rnd_query_log`, `contact_event`, `consent_proof`, `consent_evaluation`,
`lead`, `vendor`, `opt_out_event`. The rest arrive with the phase that first
needs them.

## 5. Consent verification engine

Every call and text gets exactly one of four consent statuses, decided by
five checks run in order — **[v1.1]** once per basis the contact carries,
then combined. A number's result for the selected report period is its worst
contact status, shown with counts ("3 of 41 contacts NO_PROOF"), ranked worst
to best: **NO_PROOF > CONFLICTING > WEAK > VERIFIED**.

The flowchart is in [../architecture.md](../architecture.md) §3.1.

### Before the checks: what proof this contact needs

For each contact the engine first works out, using the rules in force **on the contact's date**:

| Input | How it is set |
|---|---|
| `message_category` | marketing / informational / unknown, from the campaign-to-category map the client confirms at onboarding. Unknown is evaluated as marketing and reported in its own "category unknown" bucket. |
| Robocall or not | Autodialed if the dial mode is in `autodialed_modes`; prerecorded or AI voice from the dialer flag; marketing texts count as autodialed when `sms_treated_as_autodialed`. Unknown dial mode is treated as autodialed and labelled "dial mode unknown". **[v1.1]** While the rulebook is provisional, these keys run in strict and lenient variants. |
| `consent_required_basis` | **Every** basis that applies: `robocall_marketing`, `robocall_informational`, `dnc_listed` (number on the client's scrub or internal list on the contact date), **[v1.1]** `dnc_unknown` (no client list covers the contact date; labelled "DNC list not supplied"), `state_law` (**[v1.1]** a `state_consent_rule` row matches the recipient state, date, channel and contact type), or `civ_policy` (none of the others). |
| Required proof type | `robocall_marketing` needs a type in `written_consent_types`. `robocall_informational` needs any prior express consent (**[v1.1]** evidence per `prior_express_evidence_types`). `dnc_listed` needs **signed written** consent or an active existing-customer relationship (**[v1.1]** corrected from "consent"). `dnc_unknown` and `civ_policy` accept any accepted proof. `state_law` needs the row's `consent_type_required`. |
| **[v1.1]** `is_legal_basis` | True if any basis other than `civ_policy` and `dnc_unknown` applies. |

### The five checks

| Step | Check | Fails when | Status | Reason code |
|---|---|---|---|---|
| 1 | An applicable proof exists | No proof of any accepted type for this phone epoch | NO_PROOF | `NP_NONE` |
| 1 | | Only a CRM field says "consent = yes" | NO_PROOF | `NP_SELF_ASSERTED` |
| 1 | | Every proof is dated after the contact (see Timing) | NO_PROOF | `NP_BEFORE_CONSENT` |
| 1 | | An in-scope opt-out came before the contact (after grace and confirmation allowances), with no newer consent proof | NO_PROOF | `NP_AFTER_OPT_OUT` |
| 1 | | Only proof is an existing-customer relationship that had lapsed on the contact date | NO_PROOF | `NP_RELATIONSHIP_LAPSED` |
| 1 | | Proof type does not meet the required type for this basis, or the proof does not cover the contact's channel | NO_PROOF | `NP_WRONG_TYPE` |
| 2 | Proof opens at its source | Certificate not found at the provider and not in CiV's stored copy | CONFLICTING | `CF_NOT_FOUND` |
| 2 | | Not found, and client-supplied capture time + `cert_unretained_expiry_hours` is earlier than CiV's first request (labelled `pre_engagement` if before `engagement_start_date`) | CONFLICTING | `CF_EXPIRED` |
| 2 | | Recording, signed form or purchase record missing (not deleted under retention) | CONFLICTING | `CF_FILE_MISSING` |
| 3 | Proof content is consent | Captured page shows no consent wording | NO_PROOF | `NP_NO_CONSENT_TEXT` |
| 3 | | Consent box pre-ticked | NO_PROOF | `NP_PRETICKED` |
| 4 | Sources agree | Phone on proof differs from phone contacted | CONFLICTING | `CF_PHONE_MISMATCH` |
| 4 | | Seller named is a different, known seller (not the client or one of its brands) | CONFLICTING | `CF_SELLER_MISMATCH` |
| 4 | | CiV's page capture has similarity below `ca_page_match_threshold` to the certificate snapshot (**[v1.1]** by `page_similarity_method`; only within `page_snapshot_max_gap_days`, else "not comparable") | CONFLICTING | `CF_PAGE_MISMATCH` |
| 4 | | Certificate created after the lead was delivered **[v1.1]** by more than `clock_skew_seconds` (within tolerance → `WK_TIMING_UNCERTAIN`) | CONFLICTING | `CF_CERT_AFTER_DELIVERY` |
| 5 | Completeness | Proof and contact within the clock tolerance of each other, on unlinked sources | WEAK | `WK_TIMING_UNCERTAIN` |
| 5 | | Certificate not retained long-term, or expiring within `cert_expiry_warning_days` of `evaluation_as_of` | WEAK | `WK_RETENTION` |
| 5 | | A **required** checklist item is missing | WEAK | `WK_WORDING` |
| 5 | | Web lead not traceable to a named vendor or the client's own form (existing customers exempt) | WEAK | `WK_LEAD_TRACE` |
| 5 | **[v1.1]** | No seller name found in the consent block by the rule-based match (`seller_match = not_found`) | per `seller_absent_effect` (provisional strict: NO_PROOF `NP_SELLER_ABSENT`; lenient: WEAK `WK_SELLER_NOT_FOUND`) | `WK_SELLER_NOT_FOUND` / `NP_SELLER_ABSENT` |
| — | All pass | — | VERIFIED | `VF_OK` |

A missing **optional** checklist item is a warning on the evidence file and
never changes the status. **CONFLICTING** means the sources disagree — which
**[v1.1]** includes the client's pointer disagreeing with the provider
(`CF_NOT_FOUND`, `CF_EXPIRED`, `CF_FILE_MISSING`): the client says a proof
exists and the source says it does not. Missing or invalid consent is
NO_PROOF.

### Timing

- **Linked contacts** (the contact carries the `lead_id` whose certificate is the proof): order is proven along the chain certificate → lead delivered → contact, with no tolerance. A call 45 seconds after the form is VERIFIED.
- **Unlinked sources:** proof counts as before the contact only if earlier by more than `clock_skew_seconds`. Within the tolerance either way → `WK_TIMING_UNCERTAIN`, never NO_PROOF. Later than the tolerance → `NP_BEFORE_CONSENT`.
- **Opt-outs** cut off coverage from received time + **[v1.1]** `optout_grace_business_days` (business days per `business_day_calendar`). One confirmation message within `confirmation_window_minutes` is never cut off. These are the same allowances M10 uses.

### Algorithm **[v1.1 revised]**

1. Build the contact's required-proof profile (above), including every basis.
2. **For each basis:**
   a. **Filter** proofs: same phone epoch, dated before the contact (Timing), not cut off by an in-scope opt-out, relationship not lapsed, type meets this basis's requirement, channel covered. After an in-scope opt-out, only a new consent proof restores coverage — a later purchase never does.
   b. If none remain: this basis is NO_PROOF, storing every step-1 code that fired; the primary code is the first in table order.
   c. **Evaluate** each remaining proof through steps 2–5; each proof gets a status and all the codes that fired in its deciding step.
   d. **Pick the best:** VERIFIED > WEAK > CONFLICTING > NO_PROOF; ties go to the most recently captured proof. If every proof fails at step 3, the basis is NO_PROOF with the step-3 codes.
3. **Combine:** the contact's status is the worst across its bases. `bases` stores each basis's status, codes and winning proof. `is_legal_basis` is stored.
4. Store `evaluation_as_of`, `run_id`, `variant`, rulebook version, the effective-dated rule values used, and any AI model and prompt version.

### Engineering notes

- **Same answer every time:** time-dependent checks use the stored `evaluation_as_of`, not the clock. Nightly runs re-evaluate only contacts whose result depends on time or on new data, recording `reeval_reason`.
- **Wording:** one checklist (`consent_checklist`, counsel-owned) is the only source of truth, used by this engine and the Lead Inspector. Rule-based items run in code from Phase 2; AI is used only for meaning. **[v1.1]** Seller identity gets a rule-based first pass (brand and DBA string match) so it is measured from Phase 2; AI only settles meaning.
- **AI outputs** are stored with model and prompt version and reused; re-asked only when the prompt or checklist version changes. Until a feature passes its accuracy gate its items are "not measured" and never change a status.
- **Existing customers:** step 2 means the purchase or inquiry record exists in the CRM. The relationship covers only `ebr_allowed_contact_types`, never texts or robocalls to a marketing basis, and never satisfies `dnc_listed` unless active.
- **[v1.1] Informational consent:** a record in `prior_express_evidence_types` (e.g. a CRM intake record where the customer supplied the number, with source and timestamp) is `prior_express` proof; a bare CRM consent flag stays `NP_SELF_ASSERTED`.
- **Deleted under retention:** the contact's last evaluation is **frozen** and labelled `FZ_SOURCE_DELETED`. Frozen contacts are excluded from re-evaluation, M02 counts and the hard cap.
- **CiV's stored copies:** a certificate CiV already retrieved stays evaluable after it expires at the vendor, labelled "CiV stored copy".
- **Provider outages:** during `provider_retry_hours` a contact keeps its previous status; a new contact is `PENDING` ("provider unavailable") and excluded from metrics.
- **Pre-engagement expiries** (`CF_EXPIRED` with `pre_engagement`) are reported as their own line and excluded from the hard cap.
- **[v1.1] Backfilled leads** never have a contemporaneous CiV page capture; step 4's page comparison is "not comparable" for them and buyers are told this at onboarding.
- **[v1.1] Variants:** while the rulebook is `provisional`, keys with `variants` run strict and lenient; both evaluations are stored and the counsel dashboard shows how many contacts change status per key.

## 6. Audit domains

The rules engine runs the CIV-ATP-01 library: 25 domains in six families
(diagram in [../architecture.md](../architecture.md) §3.2). Domain codes are
fixed IDs; the plain names are working names to confirm against the library.

| Family | Code | Working name | Main data source |
|---|---|---|---|
| Permission | CON | Consent records | Consent certs, CRM |
| Permission | WEB | Website consent forms | CiV page captures |
| Permission | LPV | Lead provenance | Lead platforms |
| Permission | VND | Vendor contracts | Uploads (AI reader) |
| Permission | AFF | Affiliates and sub-IDs | Lead platforms, page captures |
| Who you contact | RND | Reassigned numbers | FCC RND |
| Who you contact | IDN | Internal do-not-contact list | Client list |
| Who you contact | NDN | National DNC | Client-supplied list only |
| Who you contact | SDN | State DNC | Client-supplied list only |
| Who you contact | XBD | Cross-border contacts | Dialer, SMS |
| How you contact | DLR | Dialer / autodialer use | Dialer |
| How you contact | PRV | Prerecorded or AI voice | Dialer, recordings |
| How you contact | SMS | Text messaging | SMS platform |
| How you contact | CTF | Calling times and frequency | Dialer, SMS |
| How you contact | IDD | Caller ID and identification | Dialer |
| How you contact | SHK | STIR/SHAKEN | Dialer / carrier |
| How you contact | VLT | Name to confirm (D5; possibly ringless voicemail) | To confirm |
| Stopping | REV | Opt-out and revocation | SMS, dialer, CRM, CiV test numbers |
| Records | REC | Recordkeeping | All sources |
| Records | RET | Data retention | All sources |
| Records | SEC | Data security | Uploads, connector metadata |
| Company controls | GOV | Policy and training | Uploads (AI reader) |
| Company controls | INC | Complaints and incidents | Client complaint data |
| Company controls | PLT | Platforms | Connector metadata |
| Company controls | MNA | Acquired or purchased lists | Uploads, lead platforms |

**Implementation:** before Phase 1 each checkpoint is sorted into **can be
automated**, **needs an upload**, or **cannot be automated yet**, and the
count is reconciled with Build Plan v2 (1,132 vs 1,067; D4). The library
loads into `checkpoint` with **[v1.1]** an `aggregation` rule per checkpoint
({unit: contact / number / program, pass_max_share, warn_max_share};
defaults 0 % pass, 1 % warn) and a `metric_checkpoint_map` linking each metric
card to the checkpoints it feeds. Checkpoints that cannot run return
`not_run` with reason `NEEDS_SOURCE`, never a guess. Every score shows
**checkpoints run out of total** beside it.

## 7. Metrics catalogue

The system computes 28 audit metrics and 5 Lead Inspector metrics.
[03-metric-specs.md](03-metric-specs.md) is the single source of truth; the
index below is generated from it. Every metric counts what CiV measured, never
calls blocked. Source: **CiV** collects it; **Client** checks the client's own
lists, logs or scrub records; **AI** reads an uploaded file.

| Code | Metric | Family | Source |
|---|---|---|---|
| M01 | Consent Coverage (legal basis; and including CiV policy) | Permission | CiV |
| M02 | Consent Status Mix | Permission | CiV |
| M03 | Certificate Validity | Permission | CiV |
| M04 | Form Wording Pass Rate | Permission | CiV |
| M05 | Form Change Alerts | Permission | CiV |
| M06 | Lead Traceability | Permission | CiV |
| M07 | Vendor Terms on File | Permission | AI |
| M08 | Opt-out Speed | Stopping | CiV |
| M09 | Opt-outs Unprocessed at Deadline (M09a, M09b) | Stopping | CiV |
| M10 | Contacts After Opt-out | Stopping | CiV |
| M11 | Pre-Contact Reassigned Checks | Who you contact | Client |
| M12 | Internal List Contacts | Who you contact | Client |
| M13 | DNC Scrub Record Check | Who you contact | Client |
| M14 | Litigator List Contacts | Who you contact | Client |
| M15 | Cross-border Contacts | Who you contact | CiV |
| M16 | Out-of-Hours Contacts (federal, state) | How you contact | CiV |
| M17 | Over-Limit Contacts | How you contact | CiV |
| M18 | Holiday Contacts | How you contact | CiV |
| M19 | Robo-contact Required-Proof Count | How you contact | CiV |
| M20 | Disclosure Check | How you contact | AI |
| M21 | Caller ID Quality | How you contact | CiV |
| M31 | Abandoned-Call Rate | How you contact | CiV |
| M22a | Proof Completeness (headline; **[v1.1]** legal-basis and all-contacts lines) | Records | CiV |
| M22b | Conduct Pass Rate (**[v1.1]** without M19) | Records | CiV |
| M23 | Record Age Coverage | Records | CiV |
| M24 | Complaint Handling | Company controls | Client |
| M25a | Training Records | Company controls | AI |
| M25b | Acquired List Proof | Company controls | CiV |
| M26 | Few-Signal Lead Rate | Lead Inspector | CiV |
| M27 | Consent Page Match Rate | Lead Inspector | CiV |
| M28 | Consent Completeness Rate | Lead Inspector | CiV |
| M29 | Vendor Grade Mix | Lead Inspector | CiV |
| M30 | Disputable Lead Value | Lead Inspector | CiV |

## 8. Revocation testing

CiV measures whether opt-outs work by sending real opt-outs from its own test
numbers and timing how long each client system takes to stop.

### Test run

1. **Authorise.** The client signs Annex C naming channels, brands, dates, and that CiV's test numbers are rotated for freshness. No test runs without it.
2. **Seed through the client's own public forms only** (as in CIV-RIM-01), never through a vendor's lead feed. Test identities are flagged `is_test` and excluded from the Lead Inspector, vendor scores and every client metric except M08 and M09.
3. **Wait for contact**, confirmed from the dialer and SMS logs.
4. **Opt out** on each channel in the test plan: reply STOP, reply in plain words, web or email opt-out, and spoken on a call.
5. **Watch** every connected system for suppression and log any further contact, for up to `optout_observation_days`.
6. **Record** in `opt_out_event`, `opt_out_suppression`, `revocation_test` and the evidence store.

### Which opt-outs count

The rulebook stores each client's designated exclusive opt-out methods and
scope rules with effective dates, ready for the FCC's September 30, 2026
order and the January 31, 2027 revoke-all date (both to verify, Counsel D).
An opt-out made through a method the client has **validly designated as not
accepted** is still run and reported, labelled "method not designated", and
left out of M08–M10 once counsel confirms this treatment.

### Output: the propagation matrix

Rows = opt-out channel, columns = client system, cell = hours until
suppression or NEVER, plus the number of tests (**[v1.1]** median and p90 by
nearest rank). Cells with fewer than `min_tests_per_cell` tests are
"indicative". Only systems that can contact the person (dialer, SMS) set a
test's overall time; CRM and lead platform are informational columns.

| Opt-out channel | Dialer | SMS platform | CRM (info) | Lead platform (info) |
|---|---|---|---|---|
| Reply STOP | hours (n) | hours (n) | hours (n) | hours (n) |
| Plain-words reply | hours (n) | hours (n) | hours (n) | hours (n) |
| Spoken on a call | hours (n) | hours (n) | hours (n) | hours (n) |
| Web / email | hours (n) | hours (n) | hours (n) | hours (n) |

### Test numbers and legal needs

- **Real carrier mobile lines** owned by CiV, not VoIP numbers.
- **One honest, low-volume texting registration** describing the real purpose. Rotation is for freshness and disclosed in Annex C, never to avoid detection.
- **Spoken opt-outs:** a recording notice is played at the start of every spoken test call until counsel decides C5.
- An inbound handler records every call and text to test numbers; tests re-run every `retest_interval_days` for retainer clients.
- **[v1.1]** Deadlines for test opt-outs use the test number's own time zone (`test_number.time_zone`).

## 9. Scoring and outputs

### Score

- **Checkpoint credit:** pass = 1, warn = `warn_credit`, fail = 0, not_run excluded. Weights from the library.
- **[v1.1] Per-contact results aggregate** to a checkpoint status by `checkpoint.aggregation` (share of failing units against `pass_max_share` / `warn_max_share`).
- **Domain score** = weighted average of its checkpoints. A domain where every checkpoint is not_run shows "not measured" and is dropped from the overall.
- **Overall score** = `domain_weights`-weighted average of measured domains, re-normalised over the domains that ran. NDN, SDN and the litigator checks are shown separately and never enter the overall.
- **Checkpoints run out of total** is shown next to every score.
- **Consent results feed checkpoints** per contact: VERIFIED → pass; WEAK → warn; CONFLICTING or NO_PROOF with `is_legal_basis` → fail; NO_PROOF under CiV policy only (or `dnc_unknown` only) → warn. Frozen, pending and test contacts are excluded.
- **Grades:** A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60, F below 60 (`grade_bands`), on the unrounded score.
- **Hard cap:** if legal-basis contacts that are NO_PROOF or CONFLICTING exceed `hard_cap_share` of legal-basis contacts, the overall grade is capped at `hard_cap_grade`. Pre-engagement expiries, frozen contacts and policy-only contacts never count toward the cap.
- **Provisional:** a score built on fewer than `provisional_completeness` of the client's `expected_sources` is marked provisional. **[v1.1]** A score from a non-approved rulebook is `internal` and never shown to client roles.
- **Display:** one decimal place; 0 ÷ 0 shows "not measured".

### Evidence file (per phone number)

One exportable record per phone epoch, PDF and JSON: every contact with its
own consent status, bases and reason codes; the 8 proof elements with their
source tiers; the conduct checks; opt-out history and list checks; and for
each item the artifact hash, source system and capture time. **[v1.1]** It
ships with the hash manifest, each artifact's Merkle path, the day's root and
both external proofs, a standalone verifier script, and the certification
template (section 10).

### Fix list

Findings sorted by severity × affected contacts. Each finding shows what CiV
observed, how many contacts or numbers, and example records. Fix steps come
only from a **fix-step library reviewed by counsel** before release. Status is
tracked (open / in progress / resolved / reopened) and closes automatically
when a later run no longer finds it.

### Alerts

Sent when a consent page changes, a certificate nears expiry, a test opt-out
passes its deadline, contacts after opt-out appear, or a connector goes stale.
**Alerts create notice:** a client that learns of contacts after opt-out and
does not act may face willful-damages claims. Buyers are told this in writing
before onboarding, and counsel approves the alert design (C2). In
**counsel-directed mode**, alerts and findings go only to the client's
counsel, and operations-role portal access is turned off.

### Wording rules for every output

| Use | Never use |
|---|---|
| "CiV found 14 contacts after opt-out" | "14 violations", "14 breaches" |
| "No consent proof supplied" | "Illegal call" |
| "Sources conflict" (CONFLICTING) | "Compromised consent" |
| "Few / Some / High risk signals" | "Fake lead", "fraud", "genuine" |
| "Out-of-hours contacts", "over-limit contacts" | "Calling-hour breaches" |
| "Dispute candidates" | "Leads to claim back" |
| "Measured", "captured", "tested" | "Non-compliant", "ensures compliance", "protects you", "guaranteed" |
| "Possible out-of-hours contact (location uncertain)" | dropping the contact |

An automated check runs every report's text against the banned-word list
before release. Every report ends with the standard disclosure: CiV is not a
law firm; findings are measurements, not legal advice.

## 10. Security, legal and evidence integrity

### Evidence integrity

- **Hash at capture:** SHA-256 of the raw bytes, capture time from a trusted clock, source and tier. A hash proves a file is unchanged since capture, not that it was accurate, so reports always show the tier.
- **Write-once storage:** Amazon S3, Object Lock compliance mode, lock period = `retention_until`. Metadata in Postgres. Supabase Storage is not used for artifacts (no object lock).
- **[v1.1] Per-client encryption keys** (SSE-KMS, one customer-managed key per client). Content deletion for client request or legal reasons is done by key destruction (client-level, immediate) or re-keying plus destruction (single-artifact, scheduled batch), because compliance-mode locks cannot be shortened. Recorded in `deletion_log` with `method`.
- **[v1.1] Legal hold:** `client.legal_hold` (or per-artifact) blocks every deletion including key destruction and sets S3 Legal Hold on the client's prefix. Set only by the counsel role (C7).
- **Daily anchoring:** each day's hashes roll up into a Merkle root anchored outside CiV twice: OpenTimestamps and an RFC 3161 timestamp authority. **[v1.1]** Each artifact stores its `leaf_index` and `merkle_path` so an inclusion proof can be exported.
- **Retention and deletion:** when `retention_until` passes, content is deleted and recorded; the artifact row and hash stay; dependent results are frozen. **[v1.1]** `civ_default_retention_years` applies when the client contract is silent.
- **Reproducibility:** every result links to its run, rulebook version, rule values in force on the contact's date, code version and stored AI outputs, and reproduces exactly while its artifacts are held.

### Security

- Client credentials in a secrets vault, least privilege, revocable by the client in one click.
- Encryption in transit and at rest; per-client data isolation (row-level security on every table; **[v1.1]** `client_id` added to `opt_out_event`, `consent_proof`, `consent_evaluation`).
- Role-based portal access (owner, legal, operations, read-only); every view and export logged.
- Launch-gate items with an owner: SOC 2 Type I (Type II to follow), signed DPAs, independent penetration test before the first client's real data.

### Legal guardrails

- Output wording follows section 9: measurements, never legal conclusions.
- DNC and litigator lists: CiV never sources, sells or maintains them.
- Revocation tests only under a signed authorisation naming channels and dates.
- Before launch, a lawyer reviews: the rulebook, report wording, evidence file format, fix-step library, and whether any feature counts as legal advice in the states CiV sells into (C6, C8).
- Before each connector ships, confirm the vendor's API terms allow third-party access with client credentials.
- **[v1.1]** Any rulebook key with `affects_status` requires counsel approval (product rule 10).

### Legal protection of the evidence

A dated, independent record of findings can be demanded by the other side in
the very lawsuit the buyer fears, and CiV can be subpoenaed. This section
claims only what holds; counsel confirms all of it before launch (C1, C2, C7).

- **Counsel-directed mode improves protection but does not guarantee it.** Work may qualify as attorney work product; courts have refused protection for ongoing dual-purpose monitoring; underlying facts are never privileged; using the file in court waives protection for what is used.
- **Certification covers copies, not accuracy.** Each evidence file ships with a hash manifest and a certification template so a qualified certifier can show under FRE 902(14) that a copy matches its source. That does not prove the client's records were accurate (client's custodian, FRE 902(11) and 803(6)), does not answer hearsay objections, requires advance notice, and does not cover CiV's computed metrics, which are analysis and need a witness.
- **Reports can be used against the client.** Outputs stay measurements; the client decides what it adopts.
- **Notice:** findings and alerts put the client on notice (section 9).
- **Subpoenas:** CiV notifies the client unless the law forbids it, produces only what is legally required, adds no commentary. **[v1.1]** Procedure in C7.

## 11. Build order

Diagram in [../architecture.md](../architecture.md) §3.3. Counsel work runs
in parallel from day one; the provisional rulebook keeps engineering moving.

| Phase | Builds | Gate to pass |
|---|---|---|
| **[v1.1] 0. Upload-only pilot** | Upload service; evidence store (hash + anchor + per-client key); normalizer; phone epochs from uploaded RND logs; consent engine on the provisional rulebook (strict + lenient); one evidence file | Gate 0: hand-checked sample of ≥ `gate_sample_size` contacts (≥ `gate_min_per_reason_code` per code, synthetic where needed) agrees; cost per number measured |
| 1. Foundation | Connectors for the pilot client's systems, secrets vault, access log, sync + health, rulebook admin and impact dashboard | Gate 1: one client synced, hashed and anchored daily |
| 2. Consent | Certificate retrieval, page capture, rule-based wording checklist, seller-name match, Lead Inspector checks 2–3 (batch), evidence file export | Gate 2: hand-checked sample agrees; counsel A1–A5, A9, A10, A12, A15a, A17–A19, B1–B3, B7, B8 set; consent cases C01–C50 pass under the approved values |
| 3. Revocation | Test numbers, texting registration, Annex C, inbound handler, propagation matrix | Gate 3: first matrix delivered; M08–M09 tests pass; counsel C4, C5 |
| 4. Metrics | All metric cards, checkpoint aggregation, scoring, fix list, alerts, portal; Lead Inspector check 1 and vendor scorecard after C3 | Gate 4: every metric on the pilot client; counsel A6–A8, A11, A13–A16, A15b, A20, B4–B6, B9; metric cases T01–T54, scoring and Lead Inspector cases pass |
| 5. AI features | Contract clauses, recording transcription and disclosures, free-text opt-outs, consent-page meaning, training records | Each feature: ≥ `ai_accuracy_min_items` labelled items, agreement ≥ `ai_accuracy_pass_mark` |
| Post-pilot | Live Lead Inspector mode | Liability terms, uptime service level |
| Launch | — | Counsel C1, C2, C6–C10; SOC 2 Type I; DPAs; penetration test; cost model |

**Cost per client:** measured from Phase 0: RND queries (up to `rnd_query_budget_per_number` at Somos tier prices), carrier lookups, email verifications, storage, page captures, transcription, AI tokens, test-number messaging. Feeds the pricing doc.

## 12. Open decisions

Counsel's items are tracked in [05-counsel-brief.md](05-counsel-brief.md).

| # | Decision | Owner | Needed by | Status |
|---|---|---|---|---|
| D1 | All Counsel brief items | Counsel | Per item | Open |
| D2 | Confirm CiV's caller-agent contract with Somos | Product | Phase 0 | Decided in principle |
| D3 | Pilot client, and which dialer, SMS and CRM it uses | Product | Phase 1 | Open |
| D4 | Checkpoint count (1,132 vs 1,067), automation buckets, **[v1.1]** aggregation rule and metric map per checkpoint | Product + Engineering | Phase 1 | Open |
| D5 | VLT meaning and domain working names | Product | Phase 1 | Open |
| D6 | Accept a least-privilege user where vendors have no read-only access | Product | Phase 1 | Open |
| D7 | Attach Annex C, CIV-RIM-01, Build Plan v2, state matrix, legal authority register; link pricing doc | Product | As listed | Open |
| D8 | `hard_cap_share`, `hard_cap_grade`, `domain_weights`, `warn_credit` | Product | Gate 4 | Open |
| D9 | `ai_accuracy_pass_mark`, `gate_sample_size` | Product | Gate 2 / Phase 5 | Open |
| D10 | SOC 2 Type I, DPAs, penetration test | Product | Launch | Open |
| D11 | Live mode terms and service level | Product | Post-pilot | Open |
| D12 | Legal sign-off on `count_unanswered_calls`, `count_undelivered_sms`, `location_conflict_rule`, `location_uncertain_treatment` (**[v1.1]** now counsel item B9) | Counsel | Gate 4 | Open |
| **[v1.1]** D13 | Confirm with ActiveProspect that certificate page snapshots are available through the API | Product | Phase 2 | Open |
| **[v1.1]** D14 | Planning volumes (contacts/day, backfill size) from the pilot client | Product | Phase 0 | Open |
| **[v1.1]** D15 | Background job runner — ADR-5 | Engineering | Module 2 | Decided by the owner 2026-10-03: Celery as the task runner on Redis (stack: Django + Django REST Framework + PostgreSQL + Redis + Next.js) |
| **[v1.1]** D16 | Where the PostgreSQL database is hosted, and whether the existing Supabase projects (`FCC`, `civ-platform-prod`) are used at all now that the backend is Django | Product + Engineering | After the project is complete | Deferred by the owner 2026-10-03: the full project is built and run locally first |
| **[v1.1]** D17 | Reconcile Build Plan v2 with this spec: (a) v2 has one CiV reviewer sign-off before the client sees anything, this spec has no human in the loop; (b) v2 removes all DNC-registry checkpoints (~61), this spec keeps NDN and SDN on client-supplied lists, shown separately; (c) v2 sells tiers T0–T4, this spec has no tier field | Product + Counsel | Module 7 | Open |
