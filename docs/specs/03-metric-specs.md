# Metric specs

**Version:** 1.1 · **Date:** 2026-10-01 · **Supersedes:** v1.0
**Changes from v1.0 are marked [v1.1].**

**This document is the single source of truth for every metric.** The main
spec's metric table is only an index generated from these cards. Each card
gives the seven required fields: **question, period, population, logic, edge
cases, missing-data rule, example**. Settings in code come from the rulebook.
**[v1.1]** A card linter in CI rejects any metric module missing one of the
seven fields.

**Display rules for every metric:** percentages shown to one decimal place;
grade bands and thresholds apply to the unrounded value (89.96 shows as 90.0
but is still grade B); a 0 ÷ 0 result shows "not measured". Frozen contacts
("source deleted under retention"), pending contacts and test numbers are
excluded unless a card says otherwise.

## Shared definitions

Every metric uses these definitions; if one is unclear, fix it here, not in a single metric.

| Term | Definition | Parameter |
|---|---|---|
| Contact | An **outbound** call attempt (answered or not) or an outbound text accepted by the SMS platform. Inbound calls and texts are never contacts. | `count_unanswered_calls` (true), `count_undelivered_sms` (false) |
| Consent status | Decided per contact and per basis by the consent engine (main spec §5). A number's result for the report period = its worst contact status (NO_PROOF > CONFLICTING > WEAK > VERIFIED), shown with counts. | — |
| **[v1.1]** Legal-basis contact | A contact with at least one basis in {`robocall_marketing`, `robocall_informational`, `dnc_listed`, `state_law`}. Contacts with only `civ_policy` or `dnc_unknown` are "policy / undetermined". | — |
| Phone epoch | One number held by one person. Boundaries are date ranges with `epoch_certainty` known / bounded / unknown. Results on an unknown epoch carry "reassignment not checked". | — |
| Rule dates | Every legal setting is applied with the value in force on the contact's date, not the run date. | `rule_value.effective_from / effective_to` |
| Period | Each card states its own period. Default: rolling window ending yesterday 23:59 UTC. | `metric_window_days` (30), `lookback_years` (4) |
| Recipient location confidence | **High:** CRM address with ZIP in force at the contact. **Medium:** no address, landline, tz from area code. **Low:** no address and a mobile or ported number. | `location_uncertain_levels` (low) |
| Recipient local time | From the address ZIP's tz if present, else area code. If they disagree, both are checked and the stricter counts. **[v1.1]** Low-confidence contacts are checked against the area-code tz and reported as **"possible"** findings in a separate line — never dropped. | `location_conflict_rule` (strictest), `location_uncertain_treatment` (report_as_possible) |
| Duplicate events | Matched only **across systems**, one-to-one, same number and channel within the window. Same-system records never merge. Dialer or SMS record wins. | `dedupe_window_seconds` (120, ≥ `clock_skew_seconds`) |
| "Before" | Linked chain: no tolerance. Unlinked: clock tolerance with a timing-uncertain band. | `clock_skew_seconds` (120) |
| Business days | Mon–Fri except US federal holidays, in the recipient time zone; fallback chain when uncertain. | `business_day_calendar`, `business_day_tz_fallback` |
| Test numbers | CiV test numbers and seeded test leads (`is_test`) are excluded from every metric except M08 and M09, and from the Lead Inspector and vendor scores. | — |
| Missing source | Source not synced within the freshness limit → "not measured — {source} not supplied", never 0. The same label is used everywhere. | `source_freshness_hours` (48) |
| **[v1.1]** Percentile | Nearest-rank method: the p-th percentile of n sorted values is the value at rank ⌈p·n⌉. NEVER sorts after every finite value. | — |

**Needs legal sign-off (B9):** `count_unanswered_calls`,
`count_undelivered_sms`, `location_conflict_rule`,
`location_uncertain_treatment`, `location_uncertain_levels`. Defaults are the
cautious choice, not a legal ruling.

---

## Permission (M01–M07)

### M01 Consent Coverage
- **Question:** of the contacts that needed proof, how many had it?
- **Period:** rolling `metric_window_days`.
- **Population:** all contacts in the period.
- **Logic — headline:** legal-basis contacts with status VERIFIED or WEAK ÷ all legal-basis contacts. **Second line:** the same over all contacts, including policy / undetermined. Reports always label which is which.
- **Edge cases:** **[v1.1]** if any contact in the period has basis `dnc_unknown`, the headline carries the note "legal basis may be understated — DNC lists not supplied for X % of contacts". Category-unknown and dial-mode-unknown contacts are counted as marketing / autodialed (stricter) and listed in their own lines.
- **Missing data:** dialer or SMS source stale → not measured.
- **Example:** 10,000 contacts; 7,000 legal-basis, 6,160 covered → **88.0 %** (legal). Across all 10,000, 8,400 covered → **84.0 %** (including CiV policy). 1,200 contacts `dnc_unknown` → note "DNC lists not supplied for 12.0 %".

### M02 Consent Status Mix
- **Question:** how do contacts split across the statuses, and why?
- **Period:** rolling `metric_window_days`.
- **Population:** all contacts in the period.
- **Logic:** count and share by status, split by basis class (legal / policy / undetermined) and by **primary** reason code; secondary codes in a detail view. **[v1.1]** Per-basis breakdown available in the detail view.
- **Edge cases:** separate lines for pre-engagement expiries, "category unknown", "dial mode unknown", "reassignment not checked", "DNC list not supplied" and frozen contacts (count only, outside the percentages).
- **Missing data:** dialer or SMS source stale → not measured.
- **Example:** VERIFIED 76.0 %, WEAK 8.0 %, CONFLICTING 11.0 %, NO_PROOF 5.0 %; of the NO_PROOF, 40 % are policy-only.

### M03 Certificate Validity
- **Question:** do the certificates the client gave us hold up?
- **Period:** rolling `metric_window_days`.
- **Population:** distinct (certificate, phone number) pairs supplied for numbers contacted in the period.
- **Logic:** pairs whose certificate opens (at the provider or from CiV's stored copy) and passes step 4 of the consent engine ÷ all pairs.
- **Edge cases:** one certificate may cover at most `max_numbers_per_cert` numbers; the others fail with `CF_PHONE_MISMATCH`. Provider outages retried for `provider_retry_hours`, never failed. Pre-engagement expiries shown separately.
- **Missing data:** certificate provider unreachable beyond retry → "pending — provider unavailable", excluded.
- **Example:** 800 pairs, 60 fail → **92.5 %**.

### M04 Form Wording Pass Rate
- **Question:** do the consent pages, including affiliates' pages, contain every required item?
- **Period:** page versions captured in `metric_window_days`.
- **Population:** distinct consent page versions (URL + normalized hash): the client's own and every `capture_url` from leads; partner-list links followed.
- **Logic:** versions passing every **required** item in `consent_checklist` ÷ versions. Missing optional items are warnings. Measurable items are rule-based browser measurements; **[v1.1]** seller name has a rule-based first pass; only meaning uses AI behind its gate.
- **Edge cases:** pages that block capture are "not captured" and excluded, never passed. AI items not yet gated are "not measured" and do not fail a page.
- **Missing data:** no capture in the period → not measured.
- **Example:** 40 versions, 31 pass → **77.5 %**.

### M05 Form Change Alerts
- **Question:** did a consent page change since CiV last captured it?
- **Period:** each capture cycle (`page_capture_interval_hours`).
- **Population:** every consent URL captured in the previous cycle.
- **Logic:** count of pages whose normalized hash changed, split into "consent block changed" (high; `consent_block_hash` differs) and "other content changed" (low).
- **Edge cases:** a page that was "not captured" last cycle and captures now is "new capture", not a change. A page that stops capturing is "capture lost", raised as an alert.
- **Missing data:** capture job did not run → not measured.
- **Example:** 40 pages, 2 changed, 1 in the consent block.

### M06 Lead Traceability
- **Question:** can every web lead be traced to where and when consent was given?
- **Period:** leads created in `metric_window_days`.
- **Population:** web leads (existing-customer records excluded).
- **Logic:** leads with vendor (or `first_party` = the client's own form), capture URL, capture time and certificate, all consistent ÷ leads. Affiliate networks also need a sub-ID when `require_sub_id`.
- **Edge cases:** a lead whose certificate belongs to another phone is not traced (`CF_PHONE_MISMATCH`).
- **Missing data:** lead platform stale → not measured.
- **Example:** 5,000 leads, 4,200 traced → **84.0 %**.

### M07 Vendor Terms on File
- **Question:** does every active lead vendor have signed terms with the required clauses?
- **Period:** vendors with a lead in the last `vendor_active_days`.
- **Population:** active vendors.
- **Logic:** vendors with an unexpired contract where every clause in `vendor_required_clauses` was found at confidence ≥ `ai_min_confidence` ÷ active vendors.
- **Edge cases:** clauses below the threshold are "needs review" for the **client**; no CiV person changes a result. Until the contract-clause AI feature passes its gate, M07 is "not measured — AI gate".
- **Missing data:** no contracts uploaded → not measured — contracts not supplied.
- **Example:** 12 vendors, 8 pass → **66.7 %**.

## Stopping (M08–M10)

### M08 Opt-out Speed
- **Question:** after a test opt-out, how long until the client's systems stop contacting the person?
- **Period:** test opt-outs completed in the last `revocation_window_days` **[v1.1 parameterised]**.
- **Population:** CiV test opt-outs (M08 includes test numbers by design).
- **Logic:** for each test, find when each system suppressed the number. **Only contacting systems (dialer, SMS) set the overall time**; CRM and lead platform are informational columns. An "inferred" time (last contact, when a system exposes no suppression state) is clamped at 0. Output median and 90th percentile hours by nearest rank; NEVER sorts last.
- **Edge cases:** fewer than `min_tests_per_cell` tests → "indicative". Opt-outs through non-designated methods are shown separately as "method not designated".
- **Missing data:** no completed tests in the window → not measured.
- **Example:** 8 tests; slowest contacting-system times 2, 3, 5, 6, 20, 26, 48, NEVER → **[v1.1]** nearest-rank median = value at rank ⌈0.5 × 8⌉ = 4 → **6.0 hours**; 90th percentile = rank ⌈0.9 × 8⌉ = 8 → **NEVER**.

### M09 Opt-outs Unprocessed at Deadline
- **Question:** how many test opt-outs were not processed by the deadline?
- **Period:** as M08.
- **Population:** as M08, restricted to methods that count under `optout_exclusive_methods`.
- **Logic:** deadline = `optout_deadline_business_days` business days after receipt, counted per `business_day_calendar` **[v1.1]** in the test number's own time zone (`test_number.time_zone`); an opt-out received on a weekend or holiday starts counting the next business day. **M09a:** not suppressed by the deadline in any contacting system. **M09b:** contacted after the deadline.
- **Edge cases:** "indicative" below `min_tests_per_cell`; non-designated methods shown as "method not designated".
- **Missing data:** as M08.
- **Example:** 8 tests; 1 never suppressed and contacted again; 1 suppressed late → M09a **2**, M09b **1**.

### M10 Contacts After Opt-out
- **Question:** in the client's own data, were people contacted after opting out?
- **Period:** rolling `metric_window_days`. Test numbers excluded.
- **Population:** numbers with an opt-out on record before or during the period.
- **Logic:** opt-out sources: replies matching `optout_keywords`; free text the AI classifies as an opt-out at ≥ `ai_min_confidence` (separate line, after its gate); CRM opt-out fields; dialer dispositions in `optout_dispositions`. Count contacts at or after the end of `optout_grace_business_days` (a contact exactly at the grace end counts). Excluded: **one** confirmation message within `confirmation_window_minutes`, and contacts after a newer consent proof. Scope follows `optout_scope_rules` in force on the contact date.
- **Edge cases:** opt-outs through non-designated methods reported separately. Grace end computed in the recipient tz with `business_day_tz_fallback`.
- **Missing data:** SMS or dialer stale → not measured.
- **Example:** 400 opted-out numbers; 9 numbers received 14 later contacts → **14 contacts, 9 numbers**.

## Who you contact (M11–M15)

### M11 Pre-Contact Reassigned Checks
- **Question:** before robocalls long after consent, did the client itself check the number still belonged to the consenting person?
- **Period:** rolling `metric_window_days`.
- **Population:** **[v1.1]** contacts with a robocall basis whose winning proof has a `captured_at`, made more than `rnd_required_after_days` after that date. Robocall contacts with no winning proof appear as a separate "no consent date" count (they are NO_PROOF already).
- **Logic:** a proper check = a client query for that number, run after the latest monthly database update before the contact (`rnd_update_calendar`), asking about the consent date, answered "No". Properly checked ÷ population. Separate finding: a client query answered "Yes" followed by a contact.
- **Edge cases:** CiV's own after-the-fact queries never count here. The safe harbor covers robocall consent claims, not DNC claims.
- **Missing data:** client query logs not supplied → "not measured — client query logs not supplied".
- **Example:** 1,000 contacts in population, 620 properly checked → **62.0 %**; 2 contacts after a "Yes"; 140 robocall contacts with no consent date listed separately.

### M12 Internal List Contacts
- **Question:** did the client contact numbers after they entered its own do-not-contact list?
- **Period:** rolling `metric_window_days`.
- **Population:** numbers on the client's internal list.
- **Logic:** contacts to a number after its entry date, within the same phone epoch. No entry dates → upload date, labelled "date approximate".
- **Edge cases:** contacts on a different epoch (reassigned) are excluded and listed; unknown epochs carry "reassignment not checked".
- **Missing data:** missing list → not measured — internal list not supplied. Label "supplied by client".
- **Example:** **22 contacts, 11 numbers**.

### M13 DNC Scrub Record Check
- **Question:** did the client scrub on time, and what happened to numbers its own scrub flagged?
- **Period:** rolling `metric_window_days`.
- **Population:** all contacts (output 1); contacts to numbers the client's own scrub flagged (output 2).
- **Logic — output 1, scrub age:** contacts made while the scrub in use was older than `dnc_scrub_max_age_days`. **Output 2, flagged numbers contacted,** in disjoint buckets by the contact's winning proof: **[v1.1]** (a1) signed written consent (`signed_written_consent_types`), VERIFIED or WEAK; (a2) other consent, VERIFIED or WEAK; (b) active existing-customer relationship only; (c) any other status. CiV reports all buckets; it does not decide which were allowed.
- **Edge cases:** texts labelled "treatment varies by circuit" using `litigation_forum`. Unit: contacts, numbers beside.
- **Missing data:** missing scrub records → not measured. Label "supplied by client"; not in the overall score.
- **Example:** 900 of 45,000 contacts on an out-of-date scrub (**2.0 %**); 35 flagged contacts: 24 (a1), 6 (a2), 3 (b), 2 (c).

### M14 Litigator List Contacts
- **Question:** did the client contact numbers on its own litigator list?
- **Period:** rolling `metric_window_days`.
- **Population:** numbers on the client-supplied litigator list.
- **Logic:** contacts to listed numbers after the list version date, same epoch. Informational; not in any score.
- **Edge cases:** list version date used when entry dates are absent, labelled "date approximate".
- **Missing data:** no list → not measured — litigator list not supplied.
- **Example:** **4 contacts, 2 numbers**.

### M15 Cross-border Contacts
- **Question:** did the client contact numbers outside the US?
- **Period:** rolling `metric_window_days`.
- **Population:** all contacts.
- **Logic:** country code other than +1, or +1 with an area code in `nanp_non_us_area_codes` (Canada, Caribbean).
- **Edge cases:** ported numbers keep their dialled country code; no carrier lookup is used here.
- **Missing data:** dialer or SMS stale → not measured.
- **Example:** 12 contacts to +1 604 (Canada), 1 to +44 (UK), 2 to +1 876 (Jamaica) → **15 contacts**.

## How you contact (M16–M21, M31)

### M16 Out-of-Hours Contacts
- **Question:** were people contacted outside the hours the rules allow, in their own time zone?
- **Period:** rolling `metric_window_days`.
- **Population:** all contacts; texts included only where `quiet_hours_apply_to_sms` or the state rule says so.
- **Logic — two counts: federal** — marketing contacts that are telephone solicitations (no VERIFIED or WEAK consent and no active EBR) outside the federal window; **state** — contacts outside the window in `calling_hours` for the recipient's state and local weekday, applying that state's scope. Local time per shared definitions; the tz database handles daylight saving; weekday and holidays use the local date. Boundaries: 08:00:00 and 21:00:00 inside; 07:59:59 and 21:00:01 outside.
- **Edge cases:** **[v1.1]** low-confidence locations are checked against the area-code tz and reported as **"possible"** in a third line, never counted as confirmed and never dropped. When ZIP and area-code zones disagree, the stricter result counts (confirmed).
- **Missing data:** `calling_hours` TBD → client output "not measured — rule not set" (provisional runs use the provisional table).
- **Example:** 50,000 contacts; 180 federal, 310 state, **120 possible (location uncertain)**.

### M17 Over-Limit Contacts
- **Question:** was any person contacted more often than their state allows?
- **Period:** rolling `metric_window_days`.
- **Population:** contact types the state rule covers (typically marketing only), from `frequency_limits`.
- **Logic:** unit = per **person** (epoch owner, joining numbers by CRM contact ID) and per **subject** (campaign subject). A window is the `window_hours` before a contact, excluding a contact exactly `window_hours` earlier. A contact is over-limit if it is beyond the limit in its window; over-limit contacts still count toward later windows. Campaigns count together unless `frequency_per_campaign`.
- **Edge cases:** location uncertain → "possible" line as M16.
- **Missing data:** `frequency_limits` TBD → not measured — rule not set.
- **Example:** limit 3 per 24 h; calls 09:00, 12:00, 15:00, 18:00 and next day 10:00 → 18:00 and next-day 10:00 over-limit → **2 contacts**.

### M18 Holiday Contacts
- **Question:** were people contacted on days their state restricts?
- **Period:** rolling `metric_window_days`.
- **Population:** contacts in states with rows in `state_holiday_restrictions`, applying each state's scope.
- **Logic:** local date compared with the restricted dates.
- **Edge cases:** location uncertain → "possible" line.
- **Missing data:** `state_holiday_restrictions` TBD → not measured — rule not set.
- **Example:** **6 contacts**.

### M19 Robo-contact Required-Proof Count
- **Question:** how many robocalls and robotexts lacked the proof type their category requires?
- **Period:** rolling `metric_window_days`.
- **Population:** contacts with a robocall basis.
- **Logic:** read each contact's evaluation for its robocall basis (not the number's). Count those not VERIFIED or WEAK, in buckets marketing / informational / category unknown, plus a "dial mode unknown" bucket.
- **Edge cases:** while the rulebook is provisional, strict and lenient counts are both shown internally.
- **Missing data:** dialer stale → not measured.
- **Example:** 12,000 robo contacts; 540 without the required proof (500 marketing, 25 informational, 15 category unknown).

### M20 Disclosure Check
- **Question:** do calls and texts say the words the rules require?
- **Period:** per campaign per `metric_window_days`.
- **Population:** every active text template, plus a random sample of `disclosure_sample_size` recorded calls per campaign (stored seed).
- **Logic:** transcribe calls; check each item in `required_disclosures`; AI items count only after the feature passes its gate. Output: % of reviewed items with every required disclosure; each failure links to the template or audio timestamp.
- **Edge cases:** campaigns with no recordings → templates only, labelled.
- **Missing data:** `required_disclosures` TBD or transcription gate not passed → not measured.
- **Example:** 100 calls + 20 templates, 102 pass → **85.0 %**.

### M21 Caller ID Quality
- **Question:** can people see and call back who called them?
- **Period:** rolling `metric_window_days`; CiV test-dials each distinct caller ID once per window.
- **Population:** all calls.
- **Logic:** a call passes when its caller ID is valid and unblocked and that number answers or reaches voicemail on CiV's test dial. Attestation: STIR/SHAKEN A / B / C / unsigned mix; B is not a failure; "not available" when the dialer does not expose it.
- **Edge cases:** a caller ID retired mid-window is tested if it made any call in the window.
- **Missing data:** dialer stale → not measured; no caller ID field → "not available".
- **Example:** 30,000 calls, 27,600 pass → **92.0 %**; 4 caller IDs not callable; mix 71 % A, 26 % B, 3 % not available.

### M31 Abandoned-Call Rate
- **Question:** how many answered marketing calls were dropped before an agent came on?
- **Period:** per campaign, per `abandon_period_days` **[v1.1 parameterised]**.
- **Population:** answered marketing calls.
- **Logic:** abandoned calls (answered but not connected to a live agent within `abandon_connect_seconds` of the greeting, from dispositions and connect times) ÷ answered calls. Flag campaigns above `abandoned_call_max_rate`. Where recordings exist, also check the required prerecorded message.
- **Edge cases:** calls with no `connected_at` and an "abandoned" disposition count as abandoned; calls with neither are "undetermined" and listed.
- **Missing data:** no connect times and no dispositions → not measured.
- **Example:** 20,000 answered calls, 740 abandoned → **3.7 %**, flagged.

## Records and company controls (M22a–M25b)

### M22a Proof Completeness (headline)
- **Question:** if someone sues over a contact to this number, does the proof exist?
- **Period:** phone epochs contacted in `metric_window_days`.
- **Population:** contacted epochs. **[v1.1]** Two lines: **headline** over epochs with at least one legal-basis contact; **second line** over all contacted epochs.
- **Logic:** elements apply by proof type; "not applicable" is allowed:

| # | Element | Applies to |
|---|---|---|
| 1 | Every contact VERIFIED or WEAK (**[v1.1]** legal-basis contacts for the headline; all contacts for the second line) | All |
| 2 | Consent page as of that date | Web certificates only |
| 3 | Third-party proof: certificate, recording, signed form (**[v1.1]** or an accepted `prior_express_evidence_types` record for informational-only epochs) | Contacts needing written consent; prior-express record otherwise |
| 4 | Lead source (named vendor, or the client's own form) | Web leads only |
| 5 | Contact log with required fields | All |
| 6 | Opt-out history synced | All |
| 7 | Internal list checked | All |
| 8 | Client's pre-contact reassigned check | Robocall contacts > `rnd_required_after_days` after consent |

  Numerator: epochs where every applicable element is present.
- **Edge cases:** the share of complete epochs resting on tier-4 evidence is shown beside the result.
- **Missing data:** dialer / SMS or consent source missing → not measured, naming the source. Optional source missing (internal list, client query logs) → that element "not measured", left out, result "partial (n of 8 elements measured)".
- **Example:** 1,000 epochs; 560 complete → **56.0 %** (headline, 820 legal-basis epochs: 470 complete → 57.3 %).

### M22b Conduct Pass Rate
- **Question:** separately from the proof, did the contacts pass the behaviour checks?
- **Period:** `metric_window_days`.
- **Population:** contacted epochs.
- **Logic:** epochs with none of: contact after opt-out (M10), internal-list contact (M12), out-of-hours contact (M16 confirmed), over-limit contact (M17), holiday contact (M18) ÷ epochs. **[v1.1]** M19 removed (it is a proof measure, counted in M22a).
- **Edge cases:** "possible" findings do not fail an epoch here; they are listed.
- **Missing data:** each check whose input is not measured is left out and named; result shown as partial.
- **Example:** 1,000 epochs, 930 pass → **93.0 %**.

### M23 Record Age Coverage
- **Question:** do the records go back far enough?
- **Period:** as of `evaluation_as_of` **[v1.1]**.
- **Population:** numbers first contacted within `lookback_years`.
- **Logic — two tests:** (1) records cover every contact within `lookback_years`; (2) the record types the Telemarketing Sales Rule requires are kept for `record_retention_years`.
- **Edge cases:** a source whose history starts after `evaluation_as_of − lookback_years` reduces coverage and is named.
- **Missing data:** no source history metadata → not measured.
- **Example:** 3,000 of 10,000 numbers first contacted before the dialer's history starts → **70.0 %**.

### M24 Complaint Handling
- **Question:** are complaints recorded and resolved?
- **Period:** complaints received in `metric_window_days` **[v1.1]**.
- **Population:** rows in the client complaint log ("supplied by client").
- **Logic:** % resolved, and median days to resolve (nearest rank) against `complaint_resolution_target_days`; complaints from numbers also in M10 are flagged.
- **Edge cases:** unresolved complaints older than the target are listed by age.
- **Missing data:** no log → not measured — complaint log not supplied.
- **Example:** 40 complaints, 34 resolved, median 6 days → **85.0 %, 6 days**.

### M25a Training Records
- **Question:** did the agents who made contacts have current training?
- **Period:** agents who made contacts in `metric_window_days` **[v1.1]**.
- **Population:** those agents.
- **Logic:** agents with a training record within `training_valid_days` ÷ all such agents. Training records read by the AI reader after its gate.
- **Edge cases:** agent IDs from the dialer that do not map to an uploaded roster are "unmatched" and listed.
- **Missing data:** no training logs → not measured — training logs not supplied; AI gate not passed → not measured — AI gate.
- **Example:** 45 of 50 → **90.0 %**.

### M25b Acquired List Proof
- **Question:** does each bought or inherited list carry a consent chain?
- **Period:** lists acquired within `lookback_years` **[v1.1]**.
- **Population:** rows in `acquired_list`.
- **Logic:** sample `acquired_list_sample_size` numbers per list with the stored seed (whole list if smaller); the list passes if failures ≤ `acquired_list_max_failures`. Lists passing ÷ lists.
- **Edge cases:** a list with no consent-chain artifacts fails outright and is labelled "no chain supplied".
- **Missing data:** no acquired lists declared → not measured — acquired lists not declared.
- **Example:** 3 lists; 1 passes (1 failure in 100), 2 fail → **33.3 %**.

## Lead Inspector (M26–M30)

### M26 Few-Signal Lead Rate
- **Question:** what share of inspected leads show few risk signals?
- **Period:** leads inspected in `metric_window_days`. Test leads excluded.
- **Population:** inspected leads.
- **Logic:** "few risk signals" ÷ inspected; "some" and "high" counts beside.
- **Edge cases:** leads with every signal "not measured" are listed as "not measured", outside the rate.
- **Missing data:** Check 1 not yet enabled (C3) → not measured.
- **Example:** 5,000 leads; 4,300 few, 550 some, 150 high → **86.0 %**.

### M27 Consent Page Match Rate
- **Question:** does the certificate's page snapshot match what CiV captured?
- **Period:** leads inspected in `metric_window_days`.
- **Population:** leads where both a certificate snapshot and a CiV capture within `page_snapshot_max_gap_days` exist.
- **Logic:** matching (similarity ≥ `ca_page_match_threshold` by `page_similarity_method`) ÷ comparable.
- **Edge cases:** captures outside the gap are "not comparable" and listed; **[v1.1]** backfilled leads are always "not comparable — no contemporaneous capture".
- **Missing data:** snapshots not exposed by the provider (D13) → not measured.
- **Example:** 1,200 comparable, 1,150 match → **95.8 %**.

### M28 Consent Completeness Rate
- **Question:** what share of leads' consent pages pass every required checklist item?
- **Period:** leads inspected in `metric_window_days`.
- **Population:** inspected leads with a captured page.
- **Logic:** passing every required item ÷ inspected; pages not captured listed separately.
- **Edge cases:** AI-only items not yet gated are "not measured" and do not fail a lead.
- **Missing data:** no captures → not measured.
- **Example:** 5,000 leads, 3,900 pass → **78.0 %**.

### M29 Vendor Grade Mix
- **Question:** how do the client's vendors grade?
- **Period:** computed monthly over `vs_window_days`.
- **Population:** vendors with a lead in the window.
- **Logic:** number of vendors at each grade A–F, lowest-scoring vendor named; vendors below `vs_min_leads_for_score` shown as "not enough data".
- **Edge cases:** sub-IDs graded separately where present.
- **Missing data:** scorecard not enabled (C3) → not measured.
- **Example:** 12 vendors: 3 A, 5 B, 2 C, 1 D, 1 F; lowest: Vendor X (54.2).

### M30 Disputable Lead Value
- **Question:** what could the client raise with vendors right now?
- **Period:** leads still inside each vendor's dispute window (`vs_dispute_window_days`, else `default_dispute_window_days`).
- **Population:** dispute candidates (Lead Inspector doc).
- **Logic:** count of leads on the dispute list and total price; leads with no price counted but left out of the total and flagged.
- **Edge cases:** vendors with no contract on file → window 0 → no candidates, shown as "no contract on file".
- **Missing data:** no lead prices at all → count only, total "not measured".
- **Example:** 62 leads, $1,860 total, 4 without price.
