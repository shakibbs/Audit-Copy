# Detailed Design — CiV Automated TCPA Audit System

**Version:** 1.1 · **Date:** 2026-10-01 · **Status:** Draft for engineering review
**Companion documents:** [architecture.md](architecture.md), [specs/01-engineering-spec.md](specs/01-engineering-spec.md), [specs/02-rulebook-parameters.md](specs/02-rulebook-parameters.md)

This document gives the level of detail an engineer needs to implement each
component: schemas, algorithms, job boundaries, interfaces and tests. Where
a value is a parameter, the rulebook key is named and never the number.

---

## 1. Data model

### 1.1 Conventions

- Every table has `client_id uuid not null` except pure reference tables (`checkpoint`, `rulebook_version`, `rule_value`, `test_number`, tz and area-code references). RLS policy: `client_id = current_setting('app.client_id')::uuid` for tenant roles.
- Versioned tables carry `valid_from timestamptz not null`, `valid_to timestamptz null`. A change closes the current row (`valid_to = now()`) and inserts a new one. Unique partial index on `(natural key) where valid_to is null`.
- All timestamps `timestamptz`, stored UTC. Local time is derived at evaluation from `address_version.time_zone`.
- Phone numbers `phone_e164 text`, validated E.164.
- Reason codes and rule values used are `jsonb`.
- Primary keys are `uuid` (v7 for insertion order).

### 1.2 Tables by group

**Configuration**

```sql
rulebook_version(version_id pk, status enum('draft','provisional','approved'),
                 published_at, approved_by, counsel_approved_by null, notes, code_version_min)
rule_value(id pk, key, value jsonb, jurisdiction text null, -- 'US', 'US-FL', 'circuit-7', 'district-ND-IL'
           effective_from date, effective_to date null, rulebook_version fk,
           affects_status bool, owner enum('counsel','product','engineering'),
           status enum('set','proposed','tbd'), variants jsonb null, -- {strict: v, lenient: v}
           source_ref text)
state_consent_rule(id pk, state, effective_from, effective_to, channels_covered text[],
           contact_types_covered text[], autodialer_definition text,
           consent_type_required enum('any','written','signed_written'),
           private_right_of_action bool, rulebook_version fk, source_ref)
client_parameter(id pk, client_id, key, value jsonb, effective_from, effective_to, set_by, approved_by)
client(client_id pk, name, verticals text[], states text[], engagement_start_date,
       engagement_mode enum('direct','counsel_directed'), litigation_forum jsonb,
       legal_hold bool default false, kms_key_arn, expected_sources text[])
client_brand(id pk, client_id, name, kind enum('brand','dba'), valid_from, valid_to)
campaign(campaign_id pk, client_id, source_system, external_id, name,
         message_category enum('marketing','informational','unknown'), confirmed_by, valid_from, valid_to)
```

**Runs and checkpoints**

```sql
run(run_id pk, client_id, kind enum('nightly','backfill','report','phase0'),
    evaluation_as_of timestamptz, rulebook_version fk, code_version, variant enum('single','strict','lenient'),
    output_visibility enum('client','internal'), started_at, finished_at, status, stats jsonb)
checkpoint(checkpoint_id pk, domain_code, sub_domain, title, test_procedure, criteria jsonb,
           automation_bucket enum('automated','needs_upload','not_yet'), data_acquisition_mode,
           weight numeric, authority_ids text[],
           aggregation jsonb) -- {unit:'contact'|'number'|'program', pass_max_share, warn_max_share}
metric_checkpoint_map(metric_code, checkpoint_id, pk(metric_code, checkpoint_id))
```

**Evidence**

```sql
artifact(artifact_id pk, client_id, source_system, source_record_id, access_level,
         source_tier smallint check (1..4), pulled_at, captured_by enum('civ','client'),
         sha256 bytea, size_bytes, content_type, storage_uri, kms_key_id,
         retention_until date, legal_hold bool, leaf_index int null, merkle_date date null, merkle_path jsonb null,
         request_meta jsonb) -- url, headers subset, status, for API pulls
deletion_log(id pk, artifact_id fk, deleted_at, reason enum('retention','client_request','legal'),
             sha256_kept bytea, approved_by, method enum('key_destroyed','object_expired'))
merkle_anchor(date pk, merkle_root bytea, leaf_count int, opentimestamps_proof bytea null,
              rfc3161_token bytea null, status enum('pending','anchored'), anchored_at)
access_log(id pk, actor, actor_role, client_id, action, object_type, object_id, at, ip, user_agent)
ai_output(output_id pk, client_id, feature, model, prompt_version, checklist_version,
          input_hash bytea, input_artifact_ids uuid[], output jsonb, confidence numeric, created_at,
          unique(feature, model, prompt_version, checklist_version, input_hash))
ai_gate(feature pk, items_tested int, agreement numeric, passed bool, evaluated_at, rulebook_version)
page_capture(capture_id pk, client_id, url, normalized_url, captured_at, viewport, screenshot_artifact_id,
             dom_artifact_id, text_artifact_id, normalized_hash bytea, consent_block_hash bytea,
             measurements jsonb, blocked bool, similarity_to jsonb null) -- {proof_id, score, method}
```

**Numbers**

```sql
phone_epoch(epoch_id pk, client_id, phone_e164, start_after date null, start_before date null,
            end_after date null, end_before date null,
            epoch_certainty enum('known','bounded','unknown'), evidence_artifact_ids uuid[], valid_from, valid_to)
contact_epoch_assignment(id pk, client_id, subject_type enum('event','proof'), subject_id uuid, epoch_id fk,
            assignment_certainty enum('certain','uncertain'), valid_from, valid_to)
address_version(id pk, client_id, contact_ref text, state, zip, time_zone, source, valid_from, valid_to)
rnd_query_log(id pk, client_id, phone_e164, date_asked_about, queried_at, answer enum('yes','no','no_data'),
              queried_by enum('client','civ'), monthly_update_date, artifact_id)
```

**Contacts and consent**

```sql
contact_event(event_id pk, client_id, phone_e164, source_system, source_artifact_id, source_record_id,
              direction enum('outbound','inbound'), channel enum('call','sms'), occurred_at_utc,
              connected_at null, ended_at null, answered bool null, disposition, sms_delivery_status,
              body_artifact_id null, recording_artifact_id null, dial_mode, prerecorded_or_ai bool null,
              campaign_id fk null, agent_id, caller_id, stir_attestation, lead_id null,
              address_version_id null, line_type, location_confidence enum('high','medium','low'),
              local_time_zone_zip, local_time_zone_area, dedupe_group_id null, is_test bool, frozen bool,
              partition by (client_id, month(occurred_at_utc)))
consent_proof(proof_id pk, client_id, proof_type enum('web_cert','ivr_recording','keypress','signed_form',
              'existing_customer','prior_express'), provider, provider_ref, captured_at, confirmed bool,
              phone_on_proof, seller_named text[], seller_match enum('matched','not_found','other_seller','not_measured'),
              page_url, channels_covered text[], disclosures_played bool null, relationship_type, relationship_date,
              retention_status, expires_at, artifact_id, lead_id null, valid_from, valid_to)
consent_evaluation(eval_id pk, client_id, event_id fk, run_id fk, evaluation_as_of, variant,
              status enum('NO_PROOF','CONFLICTING','WEAK','VERIFIED','PENDING'),
              primary_reason_code, reason_codes text[], bases jsonb, -- [{basis, status, codes, proof_id}]
              is_legal_basis bool, labels text[], proof_id null, frozen bool, reeval_reason text null,
              rulebook_version, rule_values_used jsonb, ai_output_ids uuid[], valid_from, valid_to)
lead(lead_id pk, client_id, vendor_id fk null, sub_id, first_party bool, capture_url, captured_at,
     delivered_at, cert_ref, price numeric null, is_test, source_artifact_id)
vendor(vendor_id pk, client_id, name, is_affiliate_network, active_since)
vendor_contract(id pk, client_id, vendor_id, artifact_id, signed_at, expires_at, dispute_window_days,
                clause_results jsonb)
acquired_list(list_id pk, client_id, source, acquired_at, record_count, consent_chain_artifact_ids uuid[], sample_seed)
```

**Stopping and revocation**

```sql
opt_out_event(opt_out_id pk, client_id, phone_e164, channel, method enum('keyword','free_text','web','email',
              'spoken','crm_field','disposition'), received_at, text, scope jsonb, source enum('client_data','civ_test'),
              designated bool null, is_test, source_artifact_id, ai_output_id null)
opt_out_suppression(id pk, client_id, opt_out_id fk, system, suppressed_at null, inferred bool, evidence_artifact_id)
test_number(number pk, carrier, line_type, acquired_at, retired_at, messaging_registration_id, time_zone)
annex_c_authorization(id pk, client_id, channels text[], brands text[], window_from, window_to,
                      recording_notice bool, signed_artifact_id)
revocation_test(test_id pk, client_id, test_number fk, seeded_via_url, seeded_at, first_contact_at,
                opt_out_id fk, deadline_at, observed_until, result enum('suppressed','never','pending'))
matrix_cell(run_id, channel, system, test_count, median_hours, p90_hours, never_count, indicative bool)
```

**Client records and results**

```sql
client_list_entry(id pk, client_id, list_type enum('internal','dnc_scrub','litigator'), phone_e164,
                  entry_date null, list_version_date, artifact_id, date_approximate bool)
scrub_run(id pk, client_id, registry_version_date, ran_at, numbers_flagged_artifact_id)
complaint(id pk, client_id, phone_e164, received_at, channel, description, resolved_at, artifact_id)
agent(agent_id pk, client_id, external_id, name)
training_record(id pk, client_id, agent_id, course, completed_at, artifact_id, ai_output_id)
checkpoint_result(result_id pk, client_id, run_id, checkpoint_id, scope jsonb,
                  status enum('pass','warn','fail','not_run'), reason_code, share numeric null,
                  evidence_artifact_ids uuid[], ai_output_ids uuid[], rule_values_used jsonb)
metric_snapshot(id pk, client_id, metric_code, date, run_id, value numeric null, display text,
                numerator numeric, denominator numeric, data_completeness numeric,
                checkpoints_run int, checkpoints_total int, breakdown jsonb, labels text[])
finding(finding_id pk, client_id, severity, domain_code, title, affected_count, example_ids uuid[],
        fix_step_ids text[], first_seen, last_seen, status enum('open','in_progress','resolved','reopened'))
lead_result(id pk, client_id, lead_id, run_id, signals jsonb, score_raw, score_display, hard_signals text[],
            result enum('few','some','high','not_measured'), consent_status, consent_codes text[],
            checklist_missing text[], not_measured text[])
vendor_score(id pk, client_id, vendor_id, sub_id null, window_from, window_to, rates jsonb, score, grade,
             not_enough_data bool, computed_at)
```

### 1.3 Phase 0 core

`rulebook_version`, `rule_value`, `state_consent_rule`, `client_parameter`, `client`, `client_brand`, `campaign`, `run`, `artifact`, `deletion_log`, `merkle_anchor`, `access_log`, `ai_output`, `ai_gate`, `page_capture`, `phone_epoch`, `contact_epoch_assignment`, `address_version`, `rnd_query_log`, `contact_event`, `consent_proof`, `consent_evaluation`, `lead`, `vendor`, `opt_out_event`.

---

## 2. Rulebook loader

```
load(version_id):
  rows = rule_value where rulebook_version = version_id
  validate:
    every key in REQUIRED_KEYS present (else refuse: MISSING_KEY)
    sum(vs_rate_weights) == 1 ± 1e-9 (else refuse: WEIGHTS)
    if version.status == 'approved':
        every row with affects_status must have owner='counsel' and version.counsel_approved_by not null
        no row with status='tbd' (else refuse: TBD_IN_APPROVED)
  build index: key → [(jurisdiction, effective_from, effective_to, value, variants)]

value(key, on_date, jurisdiction_chain, client_id):
  1. client_parameter for (client_id, key) in force on on_date → return
  2. for j in jurisdiction_chain (most specific → 'US'): row with j and on_date in [from, to) → return
  3. raise MISSING (caller maps to "not measured — rule not set")

variant_value(key, ..., variant):
  v = value(...); if row.variants and variant in row.variants → row.variants[variant] else v
```

`jurisdiction_chain(client, contact)` = `[district, circuit, 'US-'+state, 'US']` from `client.litigation_forum` and the recipient state.

TBD handling: a `tbd` row with `variants` still returns the variant value in `provisional` runs; in `approved` runs it cannot exist.

---

## 3. Normalizer

### 3.1 Parsing

Each `(source_system, upload_type)` has a parser with a `parser_version`. Parsing is idempotent: re-parsing the same artifact with the same version produces no new rows (upsert on `(source_artifact_id, source_record_id)`).

### 3.2 Contact rule

A row becomes a `contact_event` iff `direction = outbound` and (`channel = call` and (`answered` or `count_unanswered_calls`)) or (`channel = sms` and (`sms_delivery_status != rejected` or `count_undelivered_sms`)).

### 3.3 Cross-system dedupe

```
for each new outbound row r from system S:
  candidates = contact_event where client, phone, channel same
                and source_system != S and |occurred_at - r.occurred_at| <= dedupe_window_seconds
                and dedupe_group_id is null
  if exactly one candidate c: group r and c; keep the dialer/SMS-platform row as canonical
  if several: pick the nearest in time; the rest stay separate
```

`dedupe_window_seconds` is validated ≥ `clock_skew_seconds` at rulebook load.

### 3.4 Location resolution

```
addr = address_version in force at occurred_at for the CRM contact linked to this number
tz_zip  = zip_to_tz(addr.zip) if addr
tz_area = area_code_to_tz(phone)  (may be a list for split zones → take all)
confidence = high if addr.zip else medium if line_type == landline else low
store both zones; evaluators check both when they disagree (location_conflict_rule = strictest)
```

---

## 4. Epoch resolver

Inputs: RND answers (client logs, tier 4; CiV queries, tier 1), carrier line status (tier 2), consent proof dates, contact dates.

```
resolve(phone):
  points = sorted distinct dates from proofs and contacts for this phone (within lookback)
  epochs = [one open epoch: start unknown, end unknown, certainty unknown]
  for each consecutive pair (d1, d2) where a proof precedes a contact:
      ask RND "disconnected since d1?" at d2 (budget check)
      no  → same epoch confirmed for [d1, d2]
      yes → boundary in (d1, d2]; bisect with further dated queries until the interval ≤ 1 day
             or the per-number budget is spent → boundary stored as (end_after=d1', end_before=d2')
      no_data → certainty stays unknown for this interval
  certainty: known if every boundary interval ≤ 1 day; bounded if any interval > 1 day; unknown if any no_data
assign(subject): the epoch whose range contains subject.date; if the date falls in a boundary interval
                 → assignment_certainty = uncertain, label "reassignment uncertain"
```

The budget key is `rnd_query_budget_per_number`. Client RND logs never move a boundary but are used by M11.

---

## 5. Consent engine

### 5.1 Required-proof profile

```
profile(contact, rb):
  category = campaign.message_category or 'unknown'  (unknown → evaluate as marketing; label 'category unknown')
  robocall = dial_mode in rb.autodialed_modes
             or prerecorded_or_ai
             or (channel == sms and category == marketing and rb.sms_treated_as_autodialed)
             or (dial_mode is null → treat as autodialed; label 'dial mode unknown')
  bases = []
  if robocall and category == marketing:      bases += robocall_marketing (needs proof_type ∈ written_consent_types)
  if robocall and category == informational:  bases += robocall_informational (needs any prior express)
  dnc = client_list_entry(dnc_scrub|internal) covering phone on contact date
  if dnc found:                               bases += dnc_listed (needs signed_written or active EBR)
  elif no fresh DNC list for this date:       bases += dnc_unknown (needs any accepted proof; label 'DNC list not supplied')
  scr = state_consent_rule for recipient state, contact date, channel, contact type
  if scr:                                     bases += state_law (needs scr.consent_type_required)
  if bases empty:                             bases += civ_policy (needs any accepted proof)
  is_legal = any(b in {robocall_marketing, robocall_informational, dnc_listed, state_law} for b in bases)
```

### 5.2 Per-basis evaluation

```
evaluate_basis(contact, basis, proofs, opt_outs, epoch, rb, as_of):
  # step 1 — applicable proof exists
  P = proofs same epoch; before contact per timing(); not cut off by in-scope opt-out;
      relationship not lapsed; proof_type satisfies basis; channel covered
  codes1 = every step-1 code that fired while filtering (NP_NONE, NP_SELF_ASSERTED, NP_BEFORE_CONSENT,
           NP_AFTER_OPT_OUT, NP_RELATIONSHIP_LAPSED, NP_WRONG_TYPE)
  if P empty: return (NO_PROOF, primary=first(codes1 in table order), codes1)

  results = []
  for p in P:
     s2 = opens_at_source(p)        → CONFLICTING codes CF_NOT_FOUND | CF_EXPIRED(+pre_engagement) | CF_FILE_MISSING
     s3 = content_is_consent(p)     → NO_PROOF codes NP_NO_CONSENT_TEXT | NP_PRETICKED
     s4 = sources_agree(p, contact) → CONFLICTING codes CF_PHONE_MISMATCH | CF_SELLER_MISMATCH |
                                      CF_PAGE_MISMATCH | CF_CERT_AFTER_DELIVERY (gap > clock_skew_seconds)
     s5 = completeness(p, contact)  → WEAK codes WK_TIMING_UNCERTAIN | WK_RETENTION | WK_WORDING |
                                      WK_LEAD_TRACE | WK_SELLER_NOT_FOUND (or seller_absent_effect)
     first failing step decides p's status; all codes of that step recorded; else VERIFIED / VF_OK
     results.append((status, codes, p))

  rank = {VERIFIED:0, WEAK:1, CONFLICTING:2, NO_PROOF:3}
  best = min(results, key=(rank[status], -captured_at))
  return best
```

### 5.3 Contact status

```
per_basis = {b: evaluate_basis(...) for b in bases}
worst = max(per_basis.values(), key=rank)            # NO_PROOF > CONFLICTING > WEAK > VERIFIED
consent_evaluation.status = worst.status; bases = per_basis; is_legal_basis = is_legal
primary_reason_code = worst.primary; reason_codes = union of all codes across bases
```

### 5.4 Timing

```
before(proof, contact):
  if contact.lead_id and proof.lead_id == contact.lead_id:      # linked chain
      return proof.captured_at <= lead.delivered_at <= contact.occurred_at   (no tolerance)
  d = contact.occurred_at - proof.captured_at
  if d >  clock_skew_seconds: return True
  if d < -clock_skew_seconds: return False   → NP_BEFORE_CONSENT
  else: True with WK_TIMING_UNCERTAIN
opt-out cut-off: effective from business_day_add(received_at, optout_grace_business_days, tz)
  one confirmation message within confirmation_window_minutes is never cut off
  after an in-scope opt-out only a *new consent proof* restores coverage (EBR never does)
```

### 5.5 Determinism and re-evaluation

- `as_of` is the run's `evaluation_as_of`; `WK_RETENTION` compares `expires_at - as_of` to `cert_expiry_warning_days`.
- A nightly run re-evaluates a contact only if: new proof, opt-out, epoch change, list entry, AI gate change, rulebook version change, or `expires_at` within warning window (`reeval_reason` recorded).
- Frozen contacts (`FZ_SOURCE_DELETED`) are never re-evaluated.
- Provider outage: status `PENDING` for new contacts within `provider_retry_hours`; existing keep last status.

### 5.6 Variants

When `run.variant ∈ {strict, lenient}`, every `rb.value` call for a key with `variants` uses `variant_value`. A provisional nightly run executes both variants and stores both `consent_evaluation` rows (distinguished by `variant`). The counsel dashboard shows, per key, how many contacts change status between variants.

---

## 6. Checklist evaluation (rule-based items)

Runs against `page_capture` for the certificate's page URL nearest the consent date (within `page_snapshot_max_gap_days`) or, for backfill, against the certificate snapshot only (labelled "not comparable — no contemporaneous capture").

| Item | Measurement |
|---|---|
| CC_UNTICKED | checkbox `checked` attribute false in DOM at load |
| CC_NUMBER_SHOWN | phone field value or rendered text contains the consented number (E.164 normalized) |
| CC_SELLER_NAMED (rule pass) | normalized consent-block text or partner-list capture contains any `client_brand.name` (case-insensitive, whitespace-collapsed, Jaro-Winkler ≥ 0.92 on tokens) → `matched`; contains another known seller → `other_seller`; else `not_found` |
| CC_SELLER_COUNT | count of distinct seller names in consent block ≤ `cc_max_sellers_named` |
| CC_BUTTON_MATCH | submit button text equals the button text referenced in the consent sentence |
| CC_FONT_SIZE | computed `font-size` of consent text ≥ `cc_min_font_px` at every viewport |
| CC_CONTRAST | WCAG contrast ratio of consent text vs its background ≥ `cc_min_contrast_ratio` (3:1 if large text) |
| CC_ABOVE_BUTTON | consent block bounding box bottom ≤ button top |
| CC_NO_SCROLL | consent block within first viewport height |

AI items (CC_CONSENT_TEXT meaning, CC_OPT_OUT, CC_NOT_CONDITION, CC_AUTODIAL_DISCLOSED, CC_SELLER_NAMED meaning) run only when `ai_gate[feature].passed`.

---

## 7. Rules engine and aggregation

```
for cp in checkpoints where automation_bucket == 'automated':
  inputs = resolve_inputs(cp)                       # metric codes via metric_checkpoint_map, or direct queries
  if any required source missing: result not_run / NEEDS_SOURCE; continue
  if cp.aggregation.unit == 'program': status from criteria directly
  else:
     fail_share = failing_units / measured_units
     status = pass if fail_share <= pass_max_share else warn if fail_share <= warn_max_share else fail
  store checkpoint_result with share, evidence ids, rule values used
```

Consent feeds per-contact units: VERIFIED → pass; WEAK → warn; CONFLICTING or NO_PROOF with `is_legal_basis` → fail; NO_PROOF with only `civ_policy` → warn. Frozen, pending, test excluded.

---

## 8. Scoring

```
credit = {pass:1, warn:rb.warn_credit, fail:0}
domain_score[d] = Σ w_cp·credit / Σ w_cp over cp in d with status != not_run; "not measured" if none ran
overall = Σ rb.domain_weights[d]·domain_score[d] / Σ weights over measured d, excluding NDN, SDN, litigator
grade = band(overall, rb.grade_bands) on the unrounded value
hard cap: legal-basis contacts with NO_PROOF or CONFLICTING ÷ legal-basis contacts > rb.hard_cap_share
          → grade = min(grade, rb.hard_cap_grade); excludes pre_engagement, frozen, civ_policy-only
provisional: measured expected_sources ÷ len(expected_sources) < rb.provisional_completeness
display: one decimal; "checkpoints run X of Y" beside every score
```

---

## 9. Metric calculator

One module per card in `metrics/m01.py … m31.py`, each exposing `compute(client, run, rb) → MetricResult(value, numerator, denominator, breakdown, labels, missing)`. A registry enforces a seven-field `CARD` dictionary defined beside `compute` (question, period, population, logic, edge cases, missing-data rule, example) — the card linter reads it and fails CI if a field is missing. Shared helpers: `window(rb)`, `local_time(contact)`, `business_days(...)`, `nearest_rank_percentile(values, p)` where NEVER sorts last.

---

## 10. Revocation tester

```
plan: for each channel in annex_c.channels × test plan methods:
   seed identity through client public form (Playwright), flag lead.is_test, record seeded_via_url
observe (hourly job): for each open test:
   inbound handler shows first contact → first_contact_at; then send opt-out by method
   poll each connected system (dialer suppression list, SMS opt-out list, CRM field, lead platform status)
   suppressed_at = first time the system shows suppression; inferred = true if system exposes no state
   (then suppressed_at = last contact time, clamped ≥ opt-out time)
   deadline_at = business_day_add(received_at, optout_deadline_business_days, test_number.time_zone)
   any later contact → recorded; after optout_observation_days without suppression → NEVER
matrix: per (channel, system): median and p90 by nearest rank, never_count, indicative = n < min_tests_per_cell
```

---

## 11. AI reader

```
ask(feature, inputs, prompt_version):
  key = sha256(feature, model, prompt_version, checklist_version, canonical(inputs))
  cached = ai_output where input_hash = key → return
  response = llm(structured schema for feature)
  store ai_output(confidence = response.confidence)
  return output; consumers apply: gate passed and confidence >= ai_min_confidence, else "not measured"
```

Features: `contract_clauses`, `call_transcription`, `call_disclosures`, `free_text_opt_out`, `consent_page_meaning`, `training_record`. Gate: ≥ `ai_accuracy_min_items` hand-labelled items, agreement ≥ `ai_accuracy_pass_mark`, recorded in `ai_gate`.

---

## 12. Evidence store operations

```
put(client, bytes, meta):
  h = sha256(bytes); key = s3://{env}-evidence/{client_id}/{yyyy}/{mm}/{artifact_id}
  s3.put(key, bytes, ObjectLockMode=COMPLIANCE, RetainUntilDate=retention_until, SSEKMSKeyId=client.kms_key_arn)
  insert artifact(...); log access
anchor_daily(date):
  leaves = artifact.sha256 where date(pulled_at)=date order by artifact_id
  tree = merkle(leaves); store root; for each leaf store leaf_index + path
  ots = opentimestamps.stamp(root); tsa = rfc3161.timestamp(root); status = anchored if both else pending (retry)
delete(artifact, reason, approver):
  if client.legal_hold or artifact.legal_hold: refuse
  if reason == 'retention' and now < retention_until: refuse
  crypto-shred: if last artifact under the key's scope → schedule key deletion; else re-encrypt path not needed
     (per-client key scope means client_request/legal deletion of a *single* artifact is done by
      re-keying the remaining artifacts to a new client key and destroying the old one — batch job)
  insert deletion_log; freeze dependent consent_evaluation rows (FZ_SOURCE_DELETED)
```

Note on granularity: compliance-mode Object Lock cannot delete an object early. Per-client keys make *client-level* deletion immediate. Single-artifact deletion requires re-keying the client's other artifacts, so it is a scheduled batch operation with an SLA agreed in the DPA (Counsel C9).

---

## 13. Job orchestration

Workflows (Celery task chains, one task per activity; runner proposed, ADR-5): `BackfillWorkflow(client, from, to)`, `NightlyWorkflow(client, date)`, `AnchorWorkflow(date)`, `CaptureWorkflow(client)`, `RevocationObserveWorkflow(client)`, `ReportWorkflow(client, run_id)`.

Activities are idempotent by natural key (`artifact_id`, `(source_artifact_id, parser_version)`, `(event_id, run_id, variant)`). Retries with exponential backoff; a failed activity never leaves partial rows visible (write in a transaction keyed by run). A workflow that fails leaves `run.status = failed`; the portal keeps showing the last successful run.

---

## 14. Portal and export API

```
GET  /clients/{id}/runs                       list runs (client roles see output_visibility=client only)
GET  /clients/{id}/score?run=                  scores, checkpoints run/total, provisional flag
GET  /clients/{id}/metrics?run=&code=          metric cards
GET  /clients/{id}/contacts?run=&status=       contact rows: bases, five check states, proof summary, tiers, hash
GET  /clients/{id}/numbers/{e164}/evidence     evidence file (PDF|JSON), logged
GET  /clients/{id}/revocation?run=             M08 / M09 summary + propagation matrix cells
GET  /clients/{id}/leads?run=                  signal counts, dispute-candidate count, vendor scores with month-on-month
GET  /clients/{id}/findings                    fix list with status
POST /clients/{id}/findings/{fid}/status       open|in_progress|resolved|reopened
GET  /clients/{id}/vendors/{vid}/disputes      (module 11)
GET  /clients/{id}/sources                     sources with tier, access, last sync, status
POST /clients/{id}/sources/{sid}/revoke
POST /clients/{id}/uploads?type=&name=         body = the file's raw bytes, stored unchanged
GET  /clients/{id}/alerts
GET  /session                                  user, client, role, engagement mode, report period
internal:
POST /rulebook/versions  PATCH /rulebook/versions/{v}/approve (counsel role)
GET  /rulebook/impact?key=&from=&to=           contacts changing status between variants
```

All responses carry `run_id`, `rulebook_version`, `code_version`, and the standard disclosure.

The response shapes are fixed by the portal's contract file,
`frontend/src/api/types.ts` (frontend plan, Part A, Task A3). The endpoint list
above was revised on 2026-10-03 to match the screens of the CiV Audit Portal
Prototype: `contacts`, `revocation`, `leads` and `sources` were added, and
`sources` replaces the earlier `connectors` naming.

---

## 15. Testing strategy

| Level | What | Gate |
|---|---|---|
| Unit | Each engine step with fixtures; rulebook loader validation; timing rules; business-day calendar; nearest-rank | every PR |
| Consent cases C01–C50 | Fixture contacts + proofs + opt-outs → expected status and codes; run under strict and lenient | Gate 2 |
| Lead Inspector L01–L29 | As specified in the Lead Inspector doc | Gate 2 (checks 2–3), Gate 4 (check 1, scorecard) |
| Metric cases T01–T54 | Fixture datasets → expected numerator, denominator, display, labels | Gate 4 |
| Revocation cases | Simulated systems with configurable suppression delays | Gate 3 |
| Reproducibility | Re-run a stored run; assert byte-identical evidence JSON | every release |
| Banned-word | Every report template and every generated report text | every PR + every run |
| Rulebook load | Approved version with a TBD or unapproved `affects_status` key must refuse | every PR |
| Card linter | Every metric module has all seven docstring fields | every PR |
| Hand-checked sample | ≥ `gate_sample_size`, ≥ `gate_min_per_reason_code` per code, synthetic where the pilot lacks a code | Gate 0 / Gate 2 |
| Security | RLS cross-tenant tests; secrets never in logs; pen test before first real data | Launch |

---

## 16. Cost model hooks

Counters per run: RND queries (tier price), carrier lookups, email verifications, page captures (compute minutes), transcription minutes, AI tokens by feature, S3 GB-months, test-number SMS/voice. Exported as `run.stats.cost` and rolled up per client per month for the pricing doc.
