# Feature Guide — Comply iV Automated TCPA Audit System

**Date:** 2026-10-03 · **Status:** Draft for the owner's review
**Purpose:** explain every feature in plain language — what it is, why a client needs it, how it works, what is automatic, and what the client must supply.

**Sources:** the five v1.1 specs; the client portal file ([design-reference/complyiv-portal-audit.html](design-reference/complyiv-portal-audit.html), 15 pages); the Pricing and Prerequisites document (Sep 29, 2026); Build Plan v2; sixteen earlier CiV documents; and web research on the rules and on comparable tools, done 2026-10-03.

**Not legal advice.** The "why" sections report what public sources say about US rules. Items marked *unverified* could not be confirmed from a source that was opened. Counsel confirms every rule before it enters the rulebook.

---

## 1. The product in one page

A company that sells by phone or text can be sued under the Telephone Consumer Protection Act (TCPA) for **$500 per call or text, up to $1,500 if willful**, going back four years. Most companies that lose do so because they cannot *prove*, for one phone number on one date, that they had permission, or because an opt-out was honoured in one system and ignored in another.

Comply iV (CiV) connects to the company's own tools, reads every outbound call and text, and builds an independent, dated record of:

1. **whether proof of permission existed** for each contact;
2. **whether opt-outs actually work**, tested with real opt-outs from CiV's own phone numbers;
3. **how the company contacts people** (hours, frequency, caller ID, disclosures);
4. **where its leads came from** and how each lead vendor performs.

It turns that record into a score, a list of things to fix, and an evidence file per phone number that the company's lawyers can use.

**What CiV never does.** It never blocks or dials calls, never scrubs lists, never sells do-not-call or litigator lists, never contacts the client's customers or vendors, and never states a legal conclusion. It measures and records. This boundary is deliberate: it keeps CiV out of the client's liability chain and keeps its output usable as a neutral record.

**How a client buys it** (Pricing and Prerequisites):

| Stage | What happens | Price (draft) |
|---|---|---|
| 1. Readiness test | An automated run on 100 sample numbers; a report of what the client has, partly has, or lacks | $1,000, credited to setup |
| 2. Setup | All systems connected, full history loaded, first full audit | $5,000–$10,000 once |
| 3. Monthly plan | Daily checks, alerts, evidence, reports. Plan set by phone numbers contacted per month: Starter (up to 10,000), Growth (to 50,000), Scale (to 250,000), Enterprise | From $3,500 a month |

---

## 2. Who supplies what

CiV does not provide the client's calling tools. The client must already have them and give CiV read-only access.

### The client supplies

| What | Needed? | If missing |
|---|---|---|
| **Dialer** (Five9, Convoso, RingCentral, NICE CXone or similar) | Required if they call | No call metrics; setup blocked |
| **SMS platform** (Twilio or similar) | Required if they text | No text metrics; opt-out checks incomplete |
| **CRM** (Salesforce, HubSpot, ServiceTitan or similar) | Required | Setup blocked |
| **Consent certificate account** (TrustedForm or Jornaya), with long-term retention turned on | Required if leads come from web forms | Numbers show NO_PROOF or CONFLICTING |
| **Internal do-not-contact list** (number, date added, source) | Required | One proof element fails for every number |
| Lead platform (LeadConduit, vendor portals) | Recommended | Lead tracing not measured |
| Call recordings | Recommended | Disclosure check runs on text scripts only |
| Vendor contracts, training records, complaint log, any bought lists | Recommended | The matching metrics show "Not measured" |
| The DNC list and litigator list the client uses | Optional | Those two checks show "Not measured" |
| **One-time setup facts:** which dialer outcomes mean "stop calling"; every caller ID; every consent page address; lead vendors and sub-IDs; states called; brands used | Required | Checks that depend on them cannot run |
| **Agreements:** master services agreement, data processing agreement, and a signed authorisation for opt-out testing | Required | Nothing starts; no opt-out test runs without the authorisation |
| **Two named people:** a technical contact and a legal or compliance contact | Required | — |

The client also pays its own vendors for certificate retention and for API access where those vendors charge.

### CiV supplies

Its own registered account for the FCC Reassigned Numbers Database; a pool of CiV-owned mobile test numbers; a service that captures public consent pages; write-once evidence storage with daily time-stamping; the rulebook; the portal; and reports.

---

## 3. Ten ideas everything else rests on

| Idea | Meaning |
|---|---|
| **Contact** | One outbound call attempt, or one outbound text the SMS platform accepted. Inbound calls and texts are never contacts. |
| **Consent status** | Every contact gets one of four: **VERIFIED** (all checks pass), **WEAK** (proof exists with a fixable gap), **CONFLICTING** (sources disagree), **NO_PROOF** (no usable proof). A phone number's result is its worst contact. |
| **Reason code** | The single main reason for a status, for example `NP_AFTER_OPT_OUT` (contacted after opting out) or `CF_PHONE_MISMATCH` (the proof names a different number). |
| **Legal basis** | *Why* proof was needed: marketing robocall, informational robocall, number on a DNC list, state law, or CiV policy only. Reports always separate "the law requires this" from "CiV asks for this as policy". |
| **Phone epoch** | One number held by one person. Numbers get reassigned, so consent from the previous holder does not cover the new one. |
| **Source tier** | Where a piece of evidence came from: Tier 1 captured by CiV, Tier 2 retrieved from an independent third party, Tier 3 read from the client's systems by API, Tier 4 uploaded by the client. Lower numbers are stronger. |
| **Checkpoint** | One specific test from the audit library (about 1,100 in total). Result: pass, warn, fail, or not run. |
| **Domain** | A group of checkpoints on one subject, 25 in all, in six families: Permission, Who you contact, How you contact, Stopping, Records, Company controls. |
| **Metric** | A number measured from the data, 33 in all (M01–M31), such as "Contacts After Opt-out". |
| **"Not measured"** | Shown whenever a source is missing or stale. It is never shown as zero and never counted as a pass. |

---

## 4. The portal, page by page

The portal file groups 15 pages under five headings. Each page below follows the same order: what it is, why it is needed, how it works, what is automatic, what the client supplies.

### Group 1 — Your position

#### 4.1 Overview
- **What it is.** One screen that answers "where do we stand and what do we do first": the Audit Score on a gauge with its letter grade, a red banner if the grade is capped, the six family scores, four headline numbers, and the top three actions.
- **Why it is needed.** An owner or general counsel needs the position in under a minute. The **grade cap** exists so a good average cannot hide the one thing that matters most: if more than 10% of the contacts that legally need proof have none or conflicting proof, the grade cannot rise above C.
- **How it works.** Each night the system re-checks new data, scores every domain, averages the domains that could be measured, and applies the cap. It also shows how many checkpoints ran out of the total, so a score built on little data is visible as such.
- **Automatic.** Everything on the page.
- **Client supplies.** Nothing beyond the connected sources.

#### 4.2 Audit Scorecard
- **What it is.** All 25 domains on one map, coloured by grade, plus a register listing each domain's score, checkpoints run, and top finding. Clicking a domain opens a panel: what the domain tests, how many checkpoints passed, warned, failed or did not run, its top finding, the metrics behind it, and its evidence sources.
- **Why it is needed.** A single score is only credible if every point traces to a test and a source. The map also shows *what was not measured*, which is as important as what was.
- **How it works.** Each checkpoint earns 1 for a pass, 0.5 for a warning, 0 for a fail; checkpoints that could not run are left out, and the count of those is shown. A domain's score is the weighted average of its checkpoints. The two DNC domains run only on lists the client supplies and are shown separately; they never enter the overall score.
- **Automatic.** All scoring.
- **Client supplies.** The sources each domain needs; a domain with no source shows "Not measured".

#### 4.3 Action Queue
- **What it is.** A ranked list of what to fix: the action, why, its severity, the domain it belongs to, who has to do it (the client or CiV), and how many score points it is worth.
- **Why it is needed.** A finding without a next step is not useful. There is also a legal reason to act: once a company has been told about a problem and does nothing, a later claim can argue the conduct was willful, which triples the damages.
- **How it works.** The system groups related findings, ranks them by severity and by how many contacts they affect, and attaches a fix step from a library that counsel has reviewed. An action closes on its own when a later run no longer finds the problem.
- **Automatic.** Detection, ranking, closing.
- **Client supplies.** The decision on what to fix and when. CiV never makes the fix.

### Group 2 — Evidence

#### 4.4 Contact Ledger
- **What it is.** Every call and text, one row each: time, number, channel, consent status, reason code, and flags raised by other domains (for example "out of hours" or "after opt-out"). Clicking a row shows the five consent checks, the proof used, its source tier and the evidence hash.
- **Why it is needed.** The law applies to each call and text separately, so the record has to be per contact. When a demand letter names one call, this is where the answer is.
- **How it works.** Records come from the dialer and SMS platform. The same contact seen in two systems is merged; two calls from the same system are never merged. Each contact is then put through the consent checks.
- **Automatic.** All of it.
- **Client supplies.** Dialer and SMS access.

#### 4.5 Consent Integrity
- **What it is.** The consent picture for the whole period: how contacts split across the four statuses, the most common reason codes, how the five checks work, how many contacts needed proof by law versus by CiV policy, how many certificates held up, and how many had expired before CiV was engaged.
- **Why it is needed.** Marketing calls made with an autodialer or a recorded or AI voice, and marketing texts, need **prior express written consent**: a signed agreement that clearly authorises this seller and says consent is not a condition of purchase. If challenged, the caller has to prove it.
- **How it works.** For each contact the system first decides what kind of proof was needed, then runs five checks in order:
  1. **An applicable proof exists** — the right type, dated before the contact, for this holder of the number, and not cut off by an opt-out.
  2. **The proof opens at its source** — the certificate can still be retrieved from the provider.
  3. **The content is consent** — the captured page actually shows consent wording, and the box was not pre-ticked.
  4. **The sources agree** — the phone number, the seller named, and the page all match.
  5. **Completeness** — no fixable gap, such as a certificate about to expire or required wording missing.

  The first failing check decides the status.
- **Automatic.** All of it, including retrieving each certificate.
- **Client supplies.** The consent certificate account, CRM, and lead records. A "consent = yes" field in the CRM alone is not accepted as proof.

#### 4.6 Revocation Integrity
- **What it is.** The results of live opt-out tests: how long each of the client's systems took to stop contacting a number after an opt-out, by opt-out channel (STOP reply, plain-words reply, spoken on a call, web form, email reply) and by system (dialer, messaging platform, CRM, lead platform). A cell shows hours, or **NEVER**.
- **Why it is needed.** Since April 2025 a company must honour an opt-out within **10 business days**, made by any reasonable method. Texts sent after "STOP" are among the most common lawsuits; one grocery chain settled such a case for $5.95 million. Opt-outs usually fail between systems: the SMS platform stops, the dialer keeps calling.
- **How it works.**
  1. The client signs an authorisation naming the channels, brands and dates.
  2. A CiV test number enters the client's funnel through the client's own public form, exactly as a real lead would.
  3. CiV waits to be contacted.
  4. It opts out on each channel.
  5. It watches every connected system and records when each one stops, for up to 30 days.

  Test numbers are excluded from every other metric.
- **Automatic.** Seeding, opting out, timing, the matrix, re-testing each month.
- **Client supplies.** The signed authorisation. No test runs without it.
- **Why it is distinctive.** The research found no comparable tool that tests opt-outs from outside with real phone numbers.

#### 4.7 Evidence Vault
- **What it is.** A lookup: enter a phone number and a date, and see that number's position on that date — who held the number, the consent proof, the consent page as it looked then, the lead source, the contact log, the opt-out history, the internal list check, and the resulting consent status, each with its source and hash. The page also shows how many artifacts are held, how many daily anchors exist, and how many items were deleted under retention.
- **Why it is needed.** This is what answers a demand letter in an afternoon instead of weeks. It also has to stand up in court: evidence is only persuasive if it can be shown to be unchanged since it was collected.
- **How it works.** Every file is given a fingerprint (a SHA-256 hash) the moment it arrives and is stored in write-once storage. Each day's fingerprints are combined into one value that is time-stamped by two outside services, so nobody, including CiV, can alter a file unnoticed. US evidence rules let a certified, hash-matched copy be accepted without a live witness. A hash proves the file is unchanged, not that it was true, which is why every item also shows its source tier.
- **Automatic.** Hashing, storage, daily anchoring, the lookup.
- **Client supplies.** Nothing extra.

### Group 3 — Intelligence

#### 4.8 Contact Conduct
- **What it is.** How the client contacts people: contacts outside permitted hours (by state), contacts over state frequency limits, contacts on restricted holidays, abandoned-call rate by campaign, robocalls lacking the required proof, whether required disclosures were said, caller ID quality, and contacts to non-US numbers.
- **Why it is needed.** Having consent does not make every contact lawful. Federal rules allow solicitations only between 8am and 9pm in the recipient's local time, and several states are stricter:

  | State | Window | Confirmed? |
  |---|---|---|
  | Oklahoma, Maryland, Washington | 8am–8pm | Yes |
  | Connecticut | 9am–8pm | Yes |
  | Texas | 9am–9pm Mon–Sat, noon–9pm Sunday | Yes |
  | Oregon | 8am–8pm, from Jan 1, 2026 | Yes |
  | Florida | 8am–8pm | From a vendor chart only |

  Oklahoma, Maryland and Oregon also limit calls to three in 24 hours on the same subject (Florida: unverified). Federal rules cap abandoned calls at 3% of answered calls over 30 days, require a live agent within two seconds, and require the caller ID to be a number that can be called back.
- **How it works.** The recipient's local time comes from the address ZIP code on file, or from the area code if there is no address. Where the two disagree, both are checked and the stricter result counts. Where the location is uncertain, the contact is reported as "possible", not dropped. CiV also calls each of the client's caller IDs once to confirm it answers.
- **Automatic.** All of it. Disclosure checks on recordings use AI and count only after that AI feature passes its accuracy test.
- **Client supplies.** Dialer and SMS access, CRM addresses, recordings if available.

#### 4.9 Lead Provenance
- **What it is.** A review of every lead the client bought or collected: how many show few, some or high risk signals; which signals fire most often (form filled in under 8 seconds, name does not match the carrier's record, disposable email, many forms from one device); which consent checklist items are most often missing; and how often the certificate's page snapshot matches CiV's own capture.
- **Why it is needed.** A company that buys leads relies on consent it never saw collected, and it answers for it anyway. This page shows whether that consent holds up.
- **How it works.** Three checks per lead: (1) signals that the form was not filled in by the number's owner, (2) whether the proof agrees with CiV's own page capture and with the delivery time, (3) whether the consent page had every required item.
- **Automatic.** All of it, in a nightly batch.
- **Client supplies.** Lead platform access; form-behaviour data if they buy it from their certificate vendor.
- **A limit that matters.** Results describe signals in a record, never a judgment about a person, and may not be used to decide anyone's eligibility for credit, insurance, employment or housing. Used that way, the data could become a "consumer report" under the Fair Credit Reporting Act.

#### 4.10 Vendor Ledger
- **What it is.** Each lead vendor (and sub-ID) with its lead count, high-signal leads, score, grade and month-on-month change, plus the grade distribution, the number of leads the client could still dispute, and any vendor whose score dropped sharply.
- **Why it is needed.** It tells the client which vendors to question, renegotiate or drop, and which leads are still inside the contract's dispute window.
- **How it works.** A vendor's score starts at 100 and loses points for its share of high-signal leads, consent problems, checklist gaps, name mismatches, late deliveries, and early opt-outs or complaints. Vendors with fewer than 100 leads show "not enough data". CiV never contacts a vendor.
- **Automatic.** Scoring, grading, the dispute list.
- **Client supplies.** Vendor names and sub-IDs, vendor contracts.

#### 4.11 Metrics Library
- **What it is.** All 33 metrics in six groups, each showing its value, a one-line note, and the domains it feeds. Clicking one shows its definition.
- **Why it is needed.** It is the reference: anyone can see exactly how a number was produced.
- **How it works.** Each metric has a written card stating its question, period, population, logic, edge cases, what happens when data is missing, and a worked example.
- **Automatic.** All of it.
- **Client supplies.** The sources each metric needs.

### Group 4 — Disclosure

#### 4.12 Source Registry
- **What it is.** Every connected system: its source tier, how CiV accesses it, when it last synced, whether it is current, stale or not supplied, and which domains it feeds.
- **Why it is needed.** Stale data must never look like good data. If the dialer has not synced for two days, every number that depends on it is suspect, and the page says so.
- **How it works.** Each source is checked against a freshness limit (48 hours). Past it, an alert is raised and the dependent metrics show "Not measured — source missing".
- **Automatic.** Syncing, health checks, alerts.
- **Client supplies.** Access to each system, or file uploads where there is no API. The client can revoke CiV's access in one click.

#### 4.13 Reports & Exports
- **What it is.** Six downloads:

  | Output | Contents |
  |---|---|
  | Period audit report | Scorecard, domains, metrics, action queue for the month |
  | Evidence file export | Per phone number: every contact, its consent decision, proof, tiers, hashes |
  | Certification pack | Hash list and a certification template for court use |
  | Litigation evidence package | Court-ready export for up to 25 named numbers with a chain-of-custody report (paid add-on, $2,500 per matter) |
  | Metric export | All metrics with their underlying counts |
  | Rulebook snapshot | Every rule value in force for the period |
- **Why it is needed.** The portal is for daily use; these are what go to a board, to outside counsel, or into a legal matter.
- **How it works.** Every report is checked against a list of banned words before release, and ends with the statement that CiV is not a law firm.
- **Automatic.** Generation and the wording check.
- **Client supplies.** Nothing extra.

### Group 5 — Engagement

#### 4.14 Scope & Boundaries
- **What it is.** Three columns — what CiV does, what the client decides, what CiV never does — plus the engagement mode and the date the client acknowledged the notice about alerts.
- **Why it is needed.** It sets expectations and limits liability on both sides. It also records the **engagement mode**. In *counsel-directed mode* the client's lawyers engage CiV, and findings and alerts go only to them, which improves (but does not guarantee) protection from disclosure in a lawsuit.
- **How it works.** Mostly static text; the mode changes who can see findings and who receives alerts.
- **Automatic.** Routing of alerts by mode.
- **Client supplies.** The choice of mode.

#### 4.15 Rulebook
- **What it is.** The settings the system reads — deadlines, keywords, calling hours, thresholds — each with its value, owner and status: **Set** (decided), **Proposed** (a starting value awaiting counsel), or **TBD** (not yet set, so checks that depend on it do not produce client results).
- **Why it is needed.** The rules change, sometimes within a month (section 6). Every result must be reproducible with the rules as they stood on the contact's date, and a client should be able to see exactly which values were applied.
- **How it works.** Every legal value carries the dates it was in force. Changing one creates a new version; old versions are kept so past results can be reproduced. Any setting that can change a consent status needs counsel's approval.
- **Automatic.** Applying the right value for each contact's date.
- **Client supplies.** A few per-client settings, such as which dialer outcomes mean "stop".

---

## 5. Features behind the screens

| Feature | What it does | Why it matters |
|---|---|---|
| **Readiness test** | Pulls 30 days of data, picks 100 contacted numbers, checks 11 prerequisites (dialer, SMS, CRM, consent proof, certificate retention, consent pages, lead records, internal list, history depth, recordings, documents) as Ready / Partial / Missing, previews the consent status mix, and recommends a plan | Shows the client its real position before it pays for setup, and shows CiV whether the client is a fit |
| **Setup and onboarding** | Collects the one-time facts: outcome mapping, caller IDs, consent page addresses, vendors and sub-IDs, states, brands, campaign categories | Many checks cannot run without them |
| **Connectors and uploads** | Reads each client system through its official API with the client's own credentials, read-only; accepts file uploads where no API exists | Official, logged access is what makes the evidence defensible |
| **Consent page capture** | A browser run by CiV visits every consent page daily, saves what it looks like, and measures font size, contrast and placement of the consent text | Proves what a page said on a given date, including vendors' pages the client cannot otherwise see |
| **Phone epochs** | Uses the FCC Reassigned Numbers Database to work out when a number changed hands | Consent from a previous holder does not cover the new one. The database only answers yes, no or no data, so boundaries are often a date range |
| **AI reader** | Reads contracts, transcribes recordings, classifies free-text opt-outs, reads training records | Each AI feature must pass an accuracy test on hand-labelled examples before its results count; until then its items show "Not measured" |
| **Alerts** | Sent when a consent page changes, a certificate nears expiry, a test opt-out passes its deadline, contacts after opt-out appear, or a source goes stale | Problems are caught in days, not at the next audit |
| **Plans and metering** | Counts distinct numbers contacted each month, with a downloadable list; moves a client up a plan after two months over the limit | The bill must be as checkable as the evidence |

---

## 6. What the research changed

These findings affect features directly. Each needs counsel's confirmation.

| Finding | Effect on the product |
|---|---|
| **The FCC adopted a new revocation order on September 30, 2026.** It lets a caller treat an opt-out as applying only to the category of informational messages it was aimed at, and lets a caller designate an exclusive opt-out method. It takes effect 30 days after publication, which had not happened by October 1. A follow-up proposal asks about shortening the 10 business days, possibly to 7. *Adoption confirmed by one law-firm post; the adopted text was not opened.* | The rulebook's opt-out scope and "designated method" settings now have a real rule behind them. The "countdown to January 31, 2027" in the earlier portal is out of date. The deadline must stay a setting, not a fixed 10. |
| **A federal appeals court ruled in July 2026 that a text is not a "call" for private do-not-call lawsuits** (*Steidinger*, Seventh Circuit). Other courts differ. | Results that depend on this must vary by the court the client is likely to face. The system already has a "litigation forum" setting for this. |
| **Since June 2025, courts are not bound by the FCC's readings of the TCPA** (*McLaughlin*). | Several rules are less settled than the documents assume; the rulebook's jurisdiction settings matter more. |
| **The Reassigned Numbers Database has complete data only from January 27, 2021**, not July 27, 2020. | The earlier date in the engineering spec should be corrected; the later one drives the legal protection. |
| **TrustedForm certificates:** an unclaimed certificate can be claimed for 72 hours, extended to 90 days if a form submission is detected. The documentation does not say "deleted". | The pricing document's "90 days" and the spec's "72 hours" are both partly right; the wording should be aligned. |
| **Oregon, Washington and Texas rules** (Oregon: 8am–8pm, three per 24 hours, texts covered, from 2026; Texas: texts covered and registration required since September 2025; Virginia: STOP honoured for 10 years). | Not in the documents; they belong in the state tables. |
| **Whether calling hours apply to texts someone signed up for is unsettled.** One court dismissed such a case in April 2026. | Keep this as a counsel-set option per court, as the rulebook already does. |

---

## 7. Features in your earlier documents that the current portal dropped

Your September 15 portal and the "instrument" documents describe features that are not among the 15 pages above. They are listed here so nothing is lost; whether to bring any back is a decision for the feature list.

| Feature | What it was |
|---|---|
| Exposure Indicator | A second score, where higher is worse, built from defect rate, court venue, how targeted the industry is, and call volume |
| Plaintiff Proximity | A litigation watch from public court dockets: filings by district, law firms active nearby, and similar companies recently sued |
| Number Health | Carrier "spam" labels on each caller ID over time, with call-authentication levels |
| Regulatory Deltas | Only the rule changes that affect a control this client runs, with days left |
| Attestations | A dated statement of measured status for insurers and buyers, with a tool that maps an insurer's questionnaire to the record |
| Operator Certification | A certificate for call centres, with unannounced spot checks |
| Accountability Register | CiV's own monitoring misses, with cause and fix |
| Projected score | "Today → if all actions complete" |
| "What moved" timeline | What changed the score this quarter |
| Coverage strip | Which months the evidence record covers |
| API and assistant access | Lets the client's own tools query a number's position |
| Insurer and investor reports | A diligence report on a company or an acquisition target |

Your documents also contradict each other on four points that the feature list must settle:

1. **Two scores in opposite directions.** The Exposure Indicator (higher is worse) and the Audit Score (higher is better) would confuse readers if both appear.
2. **Dollar estimates.** One document forbids dollar amounts in any deliverable; another is built on them.
3. **Peer benchmarks.** The earlier portal rejects them outright: "a relative rank is not an exposure measure."
4. **The old "CallGuard" blueprint** blocks calls and scrubs lists. It breaks every boundary of the current product and should not be used as a source.

---

## 8. What was not gathered

- **Never seen:** the checkpoint library (CIV-ATP-01), which defines what the 25 domains actually test; the test cases C01–C50 and T01–T54; CIV-RIM-01; Annex C; and any "engineering spec v2" later than the Sep 27 version.
- **Partly read:** the "Domain test procedures" tab of the Baseline Audit Book, The Non-Delegable Five, and the insurance slide deck.
- **Unconfirmed vendor facts:** CompliancePoint, CallMiner, Balto and Secureframe pages would not open.
- **Unconfirmed rule facts:** Florida's calling hours and frequency limit (statute site would not open); the adopted text of the September 30 order; state holiday restrictions (from a vendor chart only).

## 9. What comes next

1. **This guide** — for your review.
2. **A master feature list** — every feature above, plus suggested additions from the research (score history, owners and due dates on actions, a read-only seat for counsel or an insurer, legal hold, an access trail, guided onboarding, a "dispute this finding" note, and others), each marked for you to approve or drop, with the four contradictions in section 7 put to you as decisions.
3. **A new frontend plan** built from the approved list.
