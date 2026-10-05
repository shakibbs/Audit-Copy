# Counsel brief

**Version:** 1.1 · **Date:** 2026-10-01 · **Supersedes:** v1.0
**Changes from v1.0 are marked [v1.1].**

Questions only a lawyer can settle before the system can be built and sold.
Each has the starting point proposed in the September 29–30, 2026 reviews
(finding IDs in brackets). **These starting points are not legal advice from
CiV or from any AI reviewer**; several rely on 2025–2026 developments that
counsel should verify against the sources before they go into the rulebook.

**[v1.1] How to use this brief.** Every item maps to one or more rulebook
keys. Until counsel sets an item, engineering builds against the provisional
value (and, where marked, runs *strict* and *lenient* variants); outputs stay
internal. The rulebook impact dashboard shows, per item, how many pilot
contacts change status between variants, so counsel can decide with numbers.

## A. Settings the system cannot run without (client-visible)

| # | Question | Starting point proposed | Rulebook key(s) | Blocks |
|---|---|---|---|---|
| A1 | Opt-out deadline | 10 business days, in force since April 11, 2025; also for company-specific DNC requests (F-019) | `optout_deadline_business_days` | Gate 2 |
| A2 | Confirmation text after an opt-out | One text within 5 minutes, no marketing content (F-019) | `confirmation_window_minutes` | Gate 2 |
| A3 | Words that count as an automatic opt-out | The FCC's seven: STOP, QUIT, END, REVOKE, OPT OUT, CANCEL, UNSUBSCRIBE (plus OPTOUT); other wording goes to review as a rebuttable revocation (F-018) | `optout_keywords` | Gate 2 |
| A4 | Opt-out grace period used for M10 and the engine | **[v1.1]** In business days, tied to A1 or a shorter internal measure. Variants: strict 0 / lenient 10 | `optout_grace_business_days` | Gate 2 |
| A5 | Opt-out scope before and after January 31, 2027, and after the FCC's September 30, 2026 order | "Any opt-out stops everything" is a cautious policy until revoke-all takes effect; confirm both periods once the final order is published (F-021) | `optout_scope_rules` | Gate 2 |
| A6 | Calling hours | Federal 8am–9pm for telephone solicitations; state table by weekday with effective dates and each state's scope. **[v1.1] Starting points to verify:** Texas Sunday noon start; Maryland 8pm end; **Florida and Oklahoma 8pm end; Connecticut 9am–8pm**; Virginia text coverage (F-014, F-016) | `calling_hours` | Gate 4 |
| A7 | Frequency limits | Florida, Oklahoma, Maryland: 3 per 24 hours per person on the same subject, solicitations only; confirm counting rules (F-015) | `frequency_limits`, `frequency_per_campaign` | Gate 4 |
| A8 | State holiday restrictions | State table with sources | `state_holiday_restrictions` | Gate 4 |
| A9 | Existing-customer relationship | 18 months after purchase, 3 months after inquiry; never covers prerecorded telemarketing; never satisfies `dnc_listed` unless active | `ebr_purchase_months`, `ebr_inquiry_months`, `ebr_allowed_contact_types` | Gate 2 |
| A10 | Consent wording checklist, including "consent is not a condition of purchase" and "the number being consented shown" (F-024) | Counsel drafts; required vs optional per item; each item's effect | `consent_checklist` | Gate 2 |
| A11 | Required call and message disclosures, abandoned-call limit (3 % per campaign per 30 days, 2-second message) and prerecorded opt-out mechanism (F-024) | Counsel drafts | `required_disclosures`, `abandoned_call_max_rate`, `abandon_connect_seconds`, `abandon_period_days` | Gate 4 |
| A12 | Autodialed modes | Which dialer modes count as autodialed under federal law after *Facebook v. Duguid* (2021). **[v1.1]** Variants: strict = every mode except manual; lenient = none (only prerecorded / AI voice) | `autodialed_modes` | Gate 2 |
| A13 | Reassigned-number check test | Queried after the latest monthly database update, against the consent date, answer "No" (F-022) | `rnd_check_rule` | Gate 4 |
| A14 | DNC scrub age | 31 days (confirmed in review) | `dnc_scrub_max_age_days` | Gate 4 |
| **[v1.1]** A15a | Minimum consent font size; maximum sellers named (CiV policy since the one-to-one rule was vacated) (F-025) | Counsel sets; provisional 10 px / 5 | `cc_min_font_px`, `cc_max_sellers_named` | **Gate 2** (split from A15) |
| **[v1.1]** A15b | Vendor contract clauses | Counsel drafts | `vendor_required_clauses` | Gate 4 (split from A15) |
| A16 | Record retention | 5 years for call, consent, EBR and DNC records under the 2024 TSR amendment, separate from the 4-year lookback (F-023) | `record_retention_years`, `lookback_years` | Gate 4 |
| **[v1.1]** A17 | Autodialer treatment of texts and dialer modes per forum | After *Duguid*, most federal courts treat predictive / power dialers as not an ATDS; several states define autodialers more broadly. Set `sms_treated_as_autodialed` and any per-forum overrides. Variants: strict true / lenient false | `sms_treated_as_autodialed`, `autodialed_modes` (jurisdiction rows) | Gate 2 |
| **[v1.1]** A18 | State consent matrix | Per state: channels, contact types, autodialer definition, consent type required (any / written / signed written), private right of action, effective dates. Seed FL, OK, MD; counsel completes | `state_consent_rule` table | Gate 2 |
| **[v1.1]** A19 | Evidence standard for informational prior express consent | Provisional: a CRM purchase or intake record where the customer supplied the number, with source and timestamp. A bare CRM consent flag is never enough | `prior_express_evidence_types` | Gate 2 |
| **[v1.1]** A20 | Source for the "check required after N days" rule for reassigned numbers | v1.0 proposed 30 days with no cited source; counsel to state the basis or set the value as CiV policy | `rnd_required_after_days` | Gate 4 |

## B. Legal questions about what counts

| # | Question | Starting point proposed | Rulebook key(s) | Blocks |
|---|---|---|---|---|
| B1 | Does IVR or keypress consent count as written consent? | Yes where the required disclosures were played, per the 2012 FCC order and E-SIGN; also check Florida's 2023 changes (F-005) | `written_consent_types` | Gate 2 |
| B2 | Informational robocalls | Need only prior express consent, not written; some informational prerecorded calls to landlines need none (F-003) | basis logic; `prior_express_evidence_types` | Gate 2 |
| B3 | Legal basis vs CiV policy | Confirm the bases in `consent_required_basis` (**[v1.1]** now six: `robocall_marketing`, `robocall_informational`, `dnc_listed`, `dnc_unknown`, `state_law`, `civ_policy`) and how each is reported; confirm the DNC exemption needs a **signed written** agreement (F-004) | basis logic; `signed_written_consent_types` | Gate 2 |
| B4 | Do calling-hour rules apply to texts? | Courts split after the 2025 *McLaughlin* decision; counsel sets the default per forum. Variants: strict true / lenient false (F-016) | `quiet_hours_apply_to_sms` | Gate 4 |
| B5 | Are texts "calls" for DNC claims? | Reported circuit split after a July 2026 Seventh Circuit decision; forum setting per client (F-017) | `litigation_forum`, M13 label | Gate 4 |
| B6 | Handling the client's DNC scrub records, including the client-SAN route and registry use restrictions (F-044) | Counsel defines what CiV may receive | intake rules | Gate 4 |
| **[v1.1]** B7 | Consent that names no seller at all | Is it NO_PROOF (consent must authorize *this* seller) or WEAK (wording gap)? Variants: strict NO_PROOF / lenient WEAK | `seller_absent_effect` | Gate 2 |
| **[v1.1]** B8 | Font size, contrast and one-number-per-certificate | Are these legal requirements (then they may move a status) or CiV policy (then they are warnings)? | `cc_min_contrast_ratio`, `cc_min_font_px`, `max_numbers_per_cert` (`affects_status`) | Gate 2 |
| **[v1.1]** B9 | Shared definitions (moved from decision D12) | `count_unanswered_calls` true; `count_undelivered_sms` false; `location_conflict_rule` strictest; `location_uncertain_treatment` report_as_possible; `location_uncertain_levels` low | those keys | Gate 4 |

## C. CiV's own exposure

| # | Question | Starting point proposed | Blocks |
|---|---|---|---|
| C1 | Evidence and privilege claims in main spec §10 | Claim only what holds: FRE 902(14) for copy integrity, the client's custodian for accuracy; counsel-directed mode improves but does not guarantee protection (F-008) | Launch |
| C2 | Alerts create notice that can support willful damages | In counsel-directed mode route alerts and findings to counsel only; tell buyers in writing; approve alert design (F-009) | Launch |
| C3 | Lead Inspector and the Fair Credit Reporting Act | Review exposure; contract bars eligibility use; written use-case approval from the carrier-data provider (F-011) | Phase 4 |
| C4 | Test numbers | Honest carrier registration; real carrier mobile lines; rotation disclosed in Annex C (F-012) | Phase 3 |
| C5 | Recording consent for spoken tests in all-party states; whether Annex C binds the client's vendors and staff (F-083) | Until decided, play a recording notice at the start of every spoken test | Phase 3 |
| C6 | Report wording, evidence file format and fix-step library | Review before first client | Launch |
| **[v1.1]** C7 | Litigation hold, retention conflicts and subpoenas | Define: who may set `legal_hold`; what happens when a client's retention term conflicts with a hold; `civ_default_retention_years` when the contract is silent; the subpoena procedure (notify client unless forbidden; produce only what is required; no commentary); the SLA for single-artifact deletion by re-keying | Launch |
| **[v1.1]** C8 | Unauthorized practice of law | Whether any feature (fix-step library, alerts, counsel-directed mode, evidence certification template) counts as legal advice in the states CiV sells into; required disclaimers | Launch |
| **[v1.1]** C9 | CiV's own data obligations | GLBA for insurance and financial-services clients; state privacy laws (CiV as service provider / processor); status of call recordings; DPA template; data-subject deletion requests against Object Lock | Launch |
| **[v1.1]** C10 | Capturing affiliate consent pages and seeding test leads | Whether headless capture of third-party public pages and seeding test identities through the client's public forms need any authorization beyond Annex C | Phase 2 / 3 |

## D. Recent facts to verify

The review relies on these; confirm each against its source before use:

- the FCC September 30, 2026 order text and its treatment of designated opt-out methods;
- revoke-all effective January 31, 2027;
- the July 2026 Seventh Circuit texts decision;
- Texas SB 140 and Virginia SB 1339 text and opt-out rules;
- the 2024 TSR record-keeping amendment;
- the vacatur of the one-to-one consent rule (*IMC v. FCC*, January 2025);
- *McLaughlin v. McKesson* (June 2025) and its effect on deference to FCC rulings;
- *Facebook v. Duguid* (2021) autodialer scope and state divergences (Florida, Oklahoma, Maryland);
- the January 2026 acquisition of Jornaya by ActiveProspect;
- Reassigned Numbers Database coverage dates (July 27, 2020; January 27, 2021) and monthly update schedule;
- **[v1.1]** state calling-hour windows listed under A6 (Florida, Oklahoma, Connecticut, Maryland, Texas).

## E. Item status tracker

| Item | Status | Set on | Rulebook version |
|---|---|---|---|
| A1–A20, B1–B9, C1–C10 | Open | — | — |

Counsel updates this table; each "Set" creates a new rulebook version with an effective date.
