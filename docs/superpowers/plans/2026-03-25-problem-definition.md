# Workforce Allocation System — Problem Definition
**Version 1.0 | March 25, 2026**
**Follows:** `2026-03-25-ux-strategy.md` · `2026-03-25-ux-benchmark.md`

> **Purpose:** Structure the Phase 3 design challenge into a clear, actionable definition that engineering, design, and stakeholders can use to make fast, consistent decisions.

---

## Table of Contents
1. [Problem Exploration](#1-problem-exploration)
2. [Stakeholder Map](#2-stakeholder-map)
3. [Problem Statement](#3-problem-statement)
4. [Constraints](#4-constraints)
5. [Success Criteria](#5-success-criteria)
6. [Decision Principles](#6-decision-principles)
7. [Prioritized Sub-Problems](#7-prioritized-sub-problems)

---

## 1. Problem Exploration

### The Surface Complaint

Phase 3 was framed as three discrete feature gaps:
1. ICs can't self-edit their skills
2. PMs still interrupt the RM for staffing queries
3. The forward availability projection isn't trusted

Five-whys analysis reveals these are not independent features. They are three symptoms of a single root cause.

### Five Whys: "ICs don't update their skills"

| Why | Answer |
|---|---|
| Why don't ICs update skills? | There is no edit affordance on `/me` — the skills card is read-only |
| Why is skills editing admin-only? | Skills were treated as a data integrity problem; admins were the control point |
| Why was admin-as-gatekeeper the default? | System was designed for the RM persona; IC empowerment was secondary |
| Why does that tradeoff persist? | `EmployeeSkill` has no `updatedAt` / `updatedBy` — without provenance, unlocking self-serve feels risky |
| Why was provenance never added? | The data model was never instrumented for trust |

**Root cause A:** The data model was never instrumented for trust. Empowering ICs requires either trusting the model enough to accept unaudited edits, or adding audit infrastructure first. Phase 3 is attempting to solve the behavior problem before resolving the data integrity precondition.

---

### Five Whys: "PMs still interrupt the RM"

| Why | Answer |
|---|---|
| Why do PMs interrupt the RM? | PMs have no system access; `UserRole` is binary (ADMIN \| EMPLOYEE) |
| Why were PMs excluded? | Adding a third role requires touching every `@PreAuthorize` guard and frontend auth branch — deferred as too costly |
| Why does no workaround exist? | Phase 2 share links are person-scoped, not project-scoped; PMs can't self-serve discovery |
| Why hasn't informal workaround emerged? | PMs interrupt not just for data but for the RM's judgment layer ("yes, but she's winding down next month") |
| Why can't data replace judgment? | The allocation model lacks soft availability signals — only hard percentage data with potentially wrong end dates |

**Root cause B:** Two separate problems are collapsed. Problem B1: access gatekeeping (solvable with a PM role tier). Problem B2: contextual judgment that data alone cannot replace (not solvable by any Phase 3 feature). Solving only B1 may reduce interruptions by 40–60%, not 100%.

---

### Five Whys: "Forward projection isn't trusted"

| Why | Answer |
|---|---|
| Why isn't the projection trusted? | End dates on allocations are frequently wrong — projects slip, allocations extend without updating the system |
| Why are end dates wrong? | No expiry alert, no "confirm or extend" prompt, no nudge when an end date is approaching |
| Why was no expiry alert built? | Phase 2 addressed skill staleness (nudge email) but not allocation staleness — different entity, different scheduler |
| Why does allocation staleness matter more? | Stale availability is operationally dangerous; stale skills is embarrassing. A wrong projection causes broken commitments to PMs. |
| Why wasn't the maintenance loop added with the projection feature? | Projection was built as a read-only analytical feature, not a workflow-triggering one |

**Root cause C:** The projection feature was built on unvalidated data. Phase 3 improves the display layer but does not address allocation data freshness — the input quality problem that makes the output untrustworthy.

---

### Assumption Audit

| # | Assumption | Confidence | What Changes If Wrong | Validation Method |
|---|---|---|---|---|
| A1 | ICs will update skills if given edit access | **Low** | Feature ships; skill data stays stale; RM trust degrades | Pilot: give 10 ICs admin-level edit access for 30 days; measure edit rate before/after |
| A2 | PM read-only tier will meaningfully reduce RM interruptions | **Medium** | PMs still interrupt for judgment queries; Phase 3's highest-effort item yields low ROI | Classify 20 consecutive RM interruptions as "data retrieval" vs. "judgment needed"; if <60% are pure data, PM tier won't hit targets |
| A3 | The Phase 2 nudge email established an engagement baseline | **Low** | Nudge email links to a dead-end `/me` (no edit UI); email may be conditioning ICs to ignore it | Pull access logs: does `/me` traffic spike on Monday mornings after nudge fires? |
| A4 | Profile freshness signals are sufficient to drive IC updates | **Low** | Signals become ambient noise nobody acts on; RM sees stale badges but IC doesn't respond | Check whether allocation color alerts (Phase 1) changed RM behavior — if not, freshness signals won't either without a workflow trigger |
| A5 | Project-scoped share links are what PMs actually need | **Medium** | PMs need filtered discovery (who to request), not team manifests (who is currently assigned) | Ask 3 PMs: "If you had one bookmarkable link, what would it show?" |
| A6 | IC self-serve won't degrade skill data quality | **Low** | IC-introduced catalog noise accumulates; Phase 1 skill filter becomes unreliable | Audit catalog for ambiguity density; if >20% of skills have plausible close neighbors, catalog-constrained autocomplete is a prerequisite |

---

### Critical Reframes

**Reframe 1 — What if the RM's real problem is anxiety about data quality, not the update rate itself?**
The current plan optimizes for self-serve capability. But even with perfect self-serve, the RM cannot know which profiles to trust without a freshness indicator. Alternative: build a RM-facing data confidence dashboard first (aggregate freshness score, drill-down to stale employees), letting the RM identify who needs outreach rather than sending blanket nudge emails. Implication: don't ship self-serve editing before the trust signals exist.

**Reframe 2 — What if the PM bottleneck is a relationship artifact, not an access artifact?**
In a ~100-person company, PMs may prefer asking the RM because they value her judgment, not because they lack system access. A structured async request queue (RM processes when convenient) solves the synchronous interruption problem without the architectural cost of a full PM role tier. This is worth testing before committing to the `UserRole.PM` refactoring.

**Reframe 3 — What if the projection is untrustworthy because the model is wrong, not just stale?**
Allocations don't end cleanly on dates — they taper, extend, and overlap in ways a percentage-and-date model cannot represent. A "soft availability flag" — a RM-set manual signal ("likely free mid-April") alongside the computed projection — acknowledges that judgment cannot be fully automated. High-quality presentation of low-precision data is more dangerous than an obviously rough estimate.

---

### Known Unknowns

| Unknown | How to Resolve |
|---|---|
| Actual IC skill update rate + what triggers rare updates | Add `updatedAt` to `EmployeeSkill`; run 60-day measurement; correlate with nudge email dates |
| Whether PMs currently use Phase 2 share links as workaround | Pull share token access logs; count unique tokens generated and accessed |
| How much catalog ambiguity exists (how often would ICs pick wrong skill) | Audit current catalog for entries with plausible close neighbors |
| Whether AllocationService point-in-time model is consistent with interval-based projection | Write test: overlapping allocations + `findAvailable` query; confirm interval subtraction is correct |
| Whether assignment notification email will be perceived as empowering or surveillance | Ask 5 ICs directly: "Would you want a response option in the assignment email?" |

---

### Scope Traps

| Trap | Signal | Mitigation |
|---|---|---|
| **PM Role Tier pulls in full authorization refactoring** | >3 files touched for auth logic alone | Audit all `@PreAuthorize` guards before Sprint 3.3 starts; design PM tier to be additive, not a refactor |
| **IC Self-Serve pulls in audit infrastructure + catalog enforcement** | Implementation begins without `updatedAt` migration or constrained select UI | Make `EmployeeSkill.updatedAt` migration and catalog-autocomplete constraint explicit Sprint 3.2 prerequisites |
| **Staffing Request Workflow is a mini product within a product** | Plan does not include a new DB table with status enum | Break into: (a) simple intake form → (b) RM queue → (c) status notifications — ship (a) only in Phase 3 |

---

## 2. Stakeholder Map

### Profiles

| Stakeholder | Primary Goal | Current Friction | Phase 3 Gain | Resistance Risk |
|---|---|---|---|---|
| **RM (박지영)** | Answer staffing queries in <30s without Slack/Excel | Human API for PMs; forward projection corrupts silently; finds out over-allocation post-sprint | PM queue eliminates interruptions; clash dialog catches conflicts; freshness signals identify untrustworthy data | PM intake form feels like added triage overhead if PMs don't adopt it |
| **IC (이민준)** | Be discovered for interesting projects; own a skill record that reflects reality | No self-serve skill edit; no confirmation that updates registered; nudge email lands on dead-end page | Self-serve edit closes the nudge pipeline; assignment email confirms they've been staffed; freshness signal makes profile quality visible | Skill editing autonomy without definitions may lead to wrong proficiency tags; assignment email feels like surveillance if framing is wrong |
| **HR Admin (최현수)** | Clean, trusted, consistently applied skill catalog | Catalog has duplicates; no visibility into how many profiles are stale; dedup tools in Phase 4, not Phase 3 | IC editing constrained to catalog autocomplete prevents taxonomy drift; freshness signals give quality state without manual audits | IC self-serve editing ships before Phase 4 catalog dedup — gap between enablement and cleanup is a data integrity risk she must accept |
| **PM (김태영)** | Confirm team availability before client commitments; learn about allocation changes | Zero system access; all queries to RM via Slack; no notification when team members are reallocated | PM intake form = structured channel; project share view = self-serve visibility; request status tracking eliminates "did you see my Slack?" | PM intake form adds formality to informal relationship; project share view may be misread without RM context |
| **Engineering** | Ship Phase 3 without accumulating architectural debt | AllocationService is chokepoint for Phase 3 notifications; PM role tier requires auditing auth guards everywhere; share_tokens needs scope discriminator | Clear sprint packaging with explicit dependency ordering; Spring Mail substrate reused; scope traps documented in advance | Sprint 3.3 scope creep if PM role or request queue requirements expand mid-sprint |
| **Leadership** | Utilization data reliable enough for headcount decisions | RM exports to Excel for reviews; no aggregate skill coverage view | Freshness signals make dashboard credible; PM intake creates auditable staffing record; forward projection supports quarterly planning | WBS surfaces uncomfortable over-allocation truths without a remediation path |

---

### Critical Tensions

**Tension 1: IC Editing Autonomy vs. Catalog Data Integrity**
HR Admin wants a gate. The design principle says employees own their profiles. Catalog dedup (Phase 4) is not available to clean up any drift Phase 3 introduces. Resolution: IC editing **must** ship with catalog-constrained autocomplete and proficiency definition tooltips as mandatory UI elements — not optional enhancements. These two controls are the gate replacement.

**Tension 2: PM Intake Form as Process vs. Conversation**
RM wants structured intake; PM wants informal speed. A form slower than a Slack message for common requests will be abandoned. Resolution: maximum 4 required fields (skill needed, allocation %, start date, urgency tier). All other fields optional. Engineering must receive the field-required matrix before Sprint 3.3 schema design.

**Tension 3: Clash Dialog as Prevention vs. Override Enabler**
The 100% cap is architecturally non-defeatable (SERIALIZABLE + SELECT FOR UPDATE). The clash dialog must not present an override option. It must present **two** forward paths: (1) reduce the proposed allocation % to what fits, (2) navigate to the conflicting assignment to end-date or modify it. This definition must be locked before Sprint 3.3 implementation begins — it governs the API contract.

---

### Influence Map

```
Alignment sequence (must complete before blocking sprint):

BEFORE SPRINT 3.1 (Quick Wins)
└── Engineering: lock updatedAt migration, clash dialog scope definition,
    share token discriminator schema

BEFORE SPRINT 3.2 (IC Autonomy)
└── HR Admin (최현수): show catalog-autocomplete constraint demonstrated, not described
    → converts mid-sprint objection to pre-sprint question
    → outcome: self-serve ships without approval gate

BEFORE SPRINT 3.3 (PM Tier)
└── RM (박지영): co-design the intake queue workflow; she must believe the queue
    reduces her load, not adds to it
└── PM (김태영): live demo with his actual request types; agree on required fields
└── Engineering: lock clash dialog API contract and PM role auth scope

AT LAUNCH
└── ICs (all): aligned via product design quality — confirmation feedback,
    proficiency definitions, value-forward email framing
└── Leadership: business impact framing — time-per-staffing-session, request
    resolution time; no design detail needed
```

---

### Who Gates Whom

| Dependency | Gating Party | Blocked Party | Mechanism |
|---|---|---|---|
| IC self-serve ships without approval gate | HR Admin accepts catalog-autocomplete constraint | ICs gain autonomy; RM gets fresher data | HR Admin objection in Sprint 3.2 planning is the only mechanism that adds a gate |
| PM intake form gets consistent use | PM (김태영) adopts form | RM (박지영) gets queue relief | One non-adopting PM actively undermines feature value |
| Clash dialog has resolution paths, not just hard stops | Engineering defines scope before Sprint 3.3 | RM trusts dialog instead of routing around it | If dialog stops at "cannot proceed" with no next step, RM bypasses it |
| IC self-serve doesn't degrade catalog quality | HR Admin accepts proficiency tooltips as gate replacement | Everyone's skill filter accuracy | Tooltips reduce inflation; autocomplete prevents fragmentation |

---

## 3. Problem Statement

### Single Sentence
> WBS captures workforce data accurately but does not complete the feedback loop — ICs don't own their data, PMs can't self-serve answers, and the forward projection is not trusted because the system has no mechanism to keep allocation records current — leaving the RM as the sole human bridge between data entry and operational outcome.

### Decomposed Into Three Distinct Problems

**Problem 1 — The IC Ownership Gap** *(Sprint 3.2)*
ICs have no self-serve path to update their own skill profiles, and receive no confirmation that their actions (or the actions taken on their behalf) have any effect on the system. The feedback loop between "I updated my skills" and "I was matched for a project" is invisible. Without this loop, the nudge email drives engagement with a dead end, and skill data stays stale regardless of how motivated ICs are.

*Primary affected:* IC (이민준), RM (박지영), HR Admin (최현수)
*Core metric:* Skill Data Freshness Rate ≥80%; Skill Update Completion Rate ≥65% of nudge-triggered logins

---

**Problem 2 — The RM Human API Problem** *(Sprint 3.3)*
The RM is the only path through which PMs can access workforce intelligence, creating a structural bottleneck that scales linearly with PM count. Every staffing query, availability check, and team status request is a synchronous interruption. The system has no mechanism for PMs to self-serve answers to questions the system already knows.

*Primary affected:* RM (박지영), PM (김태영)
*Core metric:* Self-Serve Rate ≥70% (PM queries resolved without RM Slack message); Staffing Request Resolution Time ≤2 business days

---

**Problem 3 — The Projection Trust Gap** *(Cross-cutting; partially addressed in Sprint 3.1)*
The forward availability projection (`/api/employees/{id}/availability`) is computed from allocation end dates that are frequently stale or missing. The projection display has been built without a maintenance loop for the underlying data. Increasing projection visibility (planned for PM share views) without improving data freshness makes the problem worse — PMs will rely on an authoritative-looking projection that is based on unvalidated inputs.

*Primary affected:* RM (박지영), PM (김태영)
*Core metric:* Stale Allocation Rate = 0%; Allocation Accuracy ≥90% (quarterly spot-check)

---

### What Is Not the Problem

- **Skills proficiency calibration.** WBS does not need to validate whether ICs are correctly self-reporting their proficiency level. The behavioral anchor tooltips reduce inflation; the catalog autocomplete prevents fragmentation. Accepting some proficiency noise is the cost of IC autonomy. Admin override remains available.
- **Replacing the RM's judgment.** The PM access tier answers data queries; it does not replace the RM's contextual knowledge about team dynamics, project risks, or informal agreements. The system should support RM judgment, not substitute for it.
- **Real-time allocation rebalancing.** WBS is a planning tool, not a dynamic resource scheduler. It does not need to automatically reassign people in response to over-allocation. Surfacing the conflict and providing resolution options is sufficient.

---

## 4. Constraints

### Technical Constraints

| Constraint | Source | Impact on Phase 3 |
|---|---|---|
| **`EmployeeSkill` has no `updatedAt` / `updatedBy`** | Missing from entity and schema | IC self-serve and freshness signals both require this; must ship as a Flyway migration in Sprint 3.1 before Sprint 3.2 features build on it |
| **`UserRole` is a binary ADMIN \| EMPLOYEE enum** | `UserRole.kt` and all downstream guards | Adding `PM` touches every `@PreAuthorize` annotation, every service-layer role check, and every frontend `isAdmin` branch — this is a systemic change, not a one-liner |
| **`AllocationService.create()` uses SERIALIZABLE + SELECT FOR UPDATE** | Non-defeatable cap enforcement | The clash resolution dialog cannot offer an "override" option; conflict resolution must happen by modifying existing allocations, not bypassing the cap |
| **`share_tokens` table is scoped to `employee_id`** | Phase 2 schema | Project-scoped share requires a `scope` discriminator + optional `project_id` FK — additive, not a new table, to preserve the cleanup job and expiry logic |
| **`EmailService` has a single template** | Phase 2 implementation | Assignment notification, request queue status updates, and staleness nudges all share the same mail infrastructure — each new email type requires a new template and trigger pattern |
| **AllocationService conflict detection is point-in-time** | `sumCurrentAllocation` SQL | Not consistent with interval-based `findAvailable` projection — overlapping partial-period allocations may produce incorrect availability signals; requires a test case before PM-facing visibility increases |

### Business Constraints

| Constraint | Impact |
|---|---|
| **100% allocation cap is non-defeatable** | Clash dialog must offer resolution paths, not override. This is a product principle (Principle 2), not just a technical constraint. |
| **Role boundaries are architectural, not cosmetic** | Admin/Employee/PM tier split must be designed correctly in the data model — it cannot be a frontend-only permission hide |
| **No enterprise-scale admin overhead** | IC self-serve must not require HR Admin approval per edit; PM intake form must not create RM triage work heavier than the Slack DMs it replaces |
| **Phase 3 must ship before Q2 2026** | PM intake form (Sprint 3.3) is the highest-complexity item; scope reduction here is more likely than in Sprints 3.1–3.2 |

### Design Constraints

| Constraint | Impact |
|---|---|
| **Skill entry must be constrained to catalog vocabulary** | IC edit UI must use autocomplete from the catalog, not free-text; this is the non-negotiable trade for removing the admin approval gate |
| **Proficiency behavioral anchors are mandatory, not optional** | The proficiency level selector for IC self-editing must include definition tooltips; this is the gate replacement that satisfies HR Admin alignment |
| **Clash dialog must not offer cap bypass** | Dialog shows conflicting assignments + resolution options (reduce proposed %, navigate to conflicting assignment). No override flow. |
| **Assignment notification email framing must be value-forward, not surveillance** | "당신이 [Project Name]에 배정되었습니다" must be framed as information + career relevance, not a fait accompli notification |
| **PM-facing views must not expose internal HR data** | Salary-adjacent fields (grade, employment type), internal allocation conflict notes, and HR-only annotations must be excluded from all PM-accessible surfaces by design |

---

## 5. Success Criteria

### Problem 1: IC Ownership Gap

| Criterion | Metric | Target | Measurement |
|---|---|---|---|
| ICs can maintain their own skills | Skill Update Completion Rate (nudge-triggered logins → skill change) | ≥65% | Server event: `nudge_login` session containing `skill_updated` |
| Skill data becomes and stays current | Skill Data Freshness Rate | ≥80% updated within 90 days | DB query: `COUNT WHERE skillsLastUpdatedAt >= NOW() - 90d` / total active employees |
| IC update effort is minimal | Time-on-Task for skill update session | Median ≤3 minutes | Server session duration for nudge-triggered sessions ending in `skill_updated` |
| Catalog quality does not degrade | Skill catalog duplicate rate | Remains <5% or does not increase post-Phase 3 | Weekly catalog health query |

### Problem 2: RM Human API Problem

| Criterion | Metric | Target | Measurement |
|---|---|---|---|
| PMs self-serve staffing queries | Self-Serve Rate | ≥70% of PM staffing queries resolved without RM Slack | Quarterly RM survey: "Of your last 10 staffing queries from PMs, how many required your direct answer?" |
| RM interruptions decrease | Staffing Request Resolution Time | Median ≤2 business days (currently unmeasured) | Request intake timestamp → allocation creation timestamp (once intake form ships) |
| PM intake form is adopted | PM intake form usage | ≥80% of new staffing requests submitted via form (not Slack) within 60 days | Count `staffing_request_created` events / RM estimate of total requests per week |

### Problem 3: Projection Trust Gap

| Criterion | Metric | Target | Measurement |
|---|---|---|---|
| Allocation records are maintained | Stale Allocation Rate (active allocation with lapsed end date) | 0% | Daily DB health check: `WHERE endDate < NOW() AND isActive = true` |
| Open-ended allocations are visible and flagged | End-date flag adoption rate | ≥90% of new allocations created with an end date (vs. null) | DB query post-Sprint 3.1 |
| Forward projection is trusted for decisions | N/A (qualitative until PM tier ships) | RM reports using projection in staffing conversations | Quarterly RM interview |

### North-Star (all three problems)

**Time to First Qualified Candidate (T2C) ≤ 30 seconds** — median elapsed time from `/employees` page load to first filter-applied render with ≥1 result. This metric degrades if any of the three problems worsens (stale skills → bad filter results; no IC ownership → stale data; broken projection → extra manual checks).

---

## 6. Decision Principles

These six principles govern design decisions throughout Phase 3 when constraints conflict. Each includes the trade-off it resolves.

### P1: Trust Must Be Earned Incrementally, Not Assumed at Launch
New features that expose potentially imprecise data (forward projection on PM share views, skill freshness badges) must include visible confidence signals at launch — a "last updated" timestamp, a projection window label ("next 90 days"), an explicit uncertainty indicator for allocations with no end date. Showing clean, authoritative-looking UI on top of low-precision data is a greater risk than a rougher presentation that is honest about its limits.

*Resolves:* Tension between increasing visibility and increasing trust in data accuracy.

---

### P2: The Gate Replacement Must Exist Before the Gate Is Removed
IC self-serve skill editing removes the admin approval gate. The gate replacement — catalog-constrained autocomplete + proficiency behavioral anchor tooltips — must ship in the same sprint, as mandatory UI elements, not follow-up polish. If either element is deferred, the gate must be reinstated until they ship.

*Resolves:* Tension between IC autonomy and catalog data integrity.

---

### P3: Resolve at Source, Not at Display
If data is wrong (stale allocations, absent end dates, stale skills), fixing the display of wrong data is not a solution. Every Phase 3 feature that surfaces data must also include a direct path to correct the data if it is wrong. A freshness badge with no edit affordance is diagnostic, not therapeutic. An open-ended assignment flag with no RM edit path is friction, not resolution.

*Resolves:* The projection trust gap — and the general pattern of "instrument the problem without solving it."

---

### P4: Minimum Required Fields, Maximum Optional Context
Every form in Phase 3 (PM intake form, IC skill edit, allocation clash resolution) defaults to the minimum set of required fields that makes the action unambiguous. Additional context fields are optional. A form that cannot be completed in under 60 seconds for the common case will be abandoned. The field-required matrix must be decided before schema design — not after.

*Resolves:* Tension between PM form as process vs. conversation; applies equally to IC edit friction.

---

### P5: IC-Facing Copy Is Always Value-Forward, Never Compliance-Forward
Every email, in-app nudge, and confirmation message directed at ICs frames the action in terms of personal benefit: "Your updated profile helps you get matched for the right projects." Not: "Your profile hasn't been updated in 90 days." This framing distinction affects open rates, completion rates, and the perception of whether the system is an ally or a monitor. It applies to subject lines, button labels, and empty states.

*Resolves:* Assignment notification surveillance risk; nudge email conversion rate.

---

### P6: Scope Contracts Are Fixed Before Sprints Start
Each sprint begins with a locked scope definition for the highest-risk items:
- Sprint 3.1: requires `EmployeeSkill.updatedAt` migration and clash dialog definition before code starts
- Sprint 3.2: requires HR Admin alignment before code starts
- Sprint 3.3: requires PM required-field matrix, clash dialog API contract, and PM role auth scope audit before code starts

Scope discovered during a sprint is deferred to the next sprint, not absorbed. The three identified scope traps (PM role auth refactoring, IC audit infrastructure, staffing request workflow) have explicitly agreed boundaries.

*Resolves:* Scope traps from problem exploration; ensures stakeholder alignment gates the right sprints.

---

## 7. Prioritized Sub-Problems

### Decomposition

The three core problems from Section 3 decompose into 11 executable sub-problems. Each is evaluated on the same priority framework used in the opportunity analysis.

**Priority Score = (Impact × Frequency × Strategic Fit) / Effort**
Impact: effect on primary affected user (1-5)
Frequency: how often the pain is felt (1-5)
Effort: 1=hours, 2=half-day, 3=1-2 days, 4=3-5 days, 5=week+
Strategic Fit: alignment with north-star T2C metric (1-5)

| # | Sub-Problem | Problem | Impact | Freq | Effort | Fit | Score |
|---|---|---|:---:|:---:|:---:|:---:|:---:|
| SP1 | `EmployeeSkill.updatedAt` migration + freshness timestamps visible in UI | P1 + P3 | 4 | 4 | 1 | 5 | **80.0** |
| SP2 | End-date visibility flag on open-ended assignments | P3 | 5 | 4 | 2 | 5 | **50.0** |
| SP3 | IC self-serve skill editing on `/me` with catalog autocomplete + proficiency tooltips | P1 | 4 | 3 | 3 | 5 | **20.0** |
| SP4 | Assignment confirmation email to IC on allocation creation | P1 + P2 | 4 | 5 | 2 | 5 | **50.0** |
| SP5 | Profile completeness ring on `/me` with missing-section links | P1 | 3 | 3 | 2 | 4 | **18.0** |
| SP6 | Allocation form: pre-selection allocation % in employee dropdown | P2 + P3 | 3 | 4 | 1 | 4 | **48.0** |
| SP7 | Share link expiry date visible at generation + expired error state | P2 | 3 | 3 | 1 | 4 | **36.0** |
| SP8 | Clash resolution dialog with two forward paths | P2 + P3 | 5 | 3 | 3 | 5 | **25.0** |
| SP9 | PM intake form (required fields only: skill, %, start date, urgency) | P2 | 4 | 4 | 4 | 5 | **20.0** |
| SP10 | RM queue view for intake form requests | P2 | 4 | 4 | 4 | 5 | **20.0** |
| SP11 | Project-scoped share view | P2 | 4 | 3 | 4 | 4 | **12.0** |

---

### Sprint Allocation

**Sprint 3.1 — Trust Infrastructure (2 weeks)**
*Goal: Make the data's quality state visible before shipping any feature that depends on data quality.*

| # | Sub-Problem | Why Now |
|---|---|---|
| SP1 | `updatedAt` migration + freshness timestamps | Prerequisite for SP3 (IC editing must touch this field); unblocks all data quality metrics |
| SP2 | End-date visibility flag on open-ended assignments | Protects the Phase 2 forward projection investment; zero backend changes |
| SP6 | Pre-selection allocation % in employee dropdown | Highest ROI pattern from benchmark; 1 hour frontend change |
| SP7 | Share link expiry visibility | Closes PM trust gap; 1 hour backend + 1 hour frontend |

*Sprint 3.1 technical prerequisite:* `EmployeeSkill.updatedAt` Flyway migration must be written, reviewed, and deployed before any Sprint 3.2 feature code starts. This is non-negotiable.

---

**Sprint 3.2 — IC Autonomy (2 weeks)**
*Goal: Complete the IC feedback loop — from nudge email to skill update to visible confirmation.*
*Stakeholder gate: HR Admin alignment before sprint planning (show catalog-autocomplete demo).*

| # | Sub-Problem | Why Now |
|---|---|---|
| SP3 | IC self-serve skill editing on `/me` | Closes the nudge-to-dead-end loop; requires SP1's `updatedAt` to already exist |
| SP4 | Assignment confirmation email to IC | Closes the assignment feedback loop; Spring Mail already exists; no new infrastructure |
| SP5 | Profile completeness ring on `/me` | Ambient nudge that replaces some reliance on email alone |

*Sprint 3.2 technical prerequisites:* Auth guard carve-out for IC `EmployeeSkill` mutations designed and reviewed before implementation; proficiency tooltip content written and approved before UI build.

---

**Sprint 3.3 — PM Access Tier (3 weeks)**
*Goal: Eliminate the RM as a synchronous bottleneck for PM staffing queries.*
*Stakeholder gates: RM co-design of queue workflow; PM field-required matrix agreed; clash dialog API contract locked; PM role auth scope audit complete.*

| # | Sub-Problem | Why Now | Scope Boundary |
|---|---|---|---|
| SP8 | Clash resolution dialog | Completes conflict detection UX; required before PM-facing features increase projection reliance | Max scope: two resolution paths (reduce proposed %, navigate to conflicting allocation). No override. No third-party notifications. |
| SP9 | PM intake form (Phase A) | Creates structured intake channel; must be minimum viable (4 required fields max) | Required fields only: skill needed, allocation %, start date, urgency. No project assignment linking, no status tracking in this sprint. |
| SP10 | RM queue view (Phase A) | RM-facing inbox for intake form submissions; minimum viable | List view of open requests + ability to mark resolved. No automated routing. No SLA enforcement. |
| SP11 | Project-scoped share view | Completes the PM self-serve story; deferred from Sprint 3.1 | Employee + current allocation + active project list. No editable columns. No field-visibility toggle (Phase 4). |

*Sprint 3.3 scope contract:* SP9 (intake form) and SP10 (RM queue) together constitute Phase A of the staffing request workflow. Status tracking, request history, request linking to allocations, and PM notification on request fulfillment are Phase B — deferred to Phase 4 unless Sprint 3.3 finishes early.

---

### Deferred to Phase 4

| # | Sub-Problem | Reason for Deferral |
|---|---|---|
| Staffing request status tracking + history | Phase B of SP9/SP10; builds on Phase A foundation; don't design upfront |
| Field-level visibility on share links | Airtable pattern; medium effort; SP11 (project share) ships first to validate PM share need |
| Peer skill endorsement | Degreed pattern; high engagement value; requires new social trust model |
| Admin-configurable alert rules | Asana pattern; requires alert rule engine; medium effort |
| Bulk allocation creation form | Independent; no blocking dependencies; adds throughput but not trust |
| Allocation expiry nudge emails | Root cause C from five-whys; requires new scheduler; closes the projection trust gap fully |
| Side-by-side candidate comparison | Low frequency; directory skill filter partially satisfies need |

---

### The Execution Contract

Phase 3 ships three capabilities, in order:

1. **The trust infrastructure** (Sprint 3.1) — makes data quality visible and honest before any feature builds on top of it.
2. **The IC feedback loop** (Sprint 3.2) — closes the gap between "IC updates skills" and "RM trusts skill data" for the first time.
3. **The PM self-serve channel** (Sprint 3.3) — replaces the RM-as-human-API with a structured intake + read-only discovery path.

Each sprint's output is independently valuable and does not require subsequent sprints to justify its existence. Sprint 3.1 improves data trust immediately. Sprint 3.2 improves skill data quality immediately. Sprint 3.3 reduces RM interruptions immediately.

**If scope must be cut**, the order of sacrifice is: SP11 (project share, defer to Phase 4) → SP8 (clash dialog, simplify to non-interactive error state) → SP9+SP10 (intake form, defer entire Sprint 3.3 to Phase 4). The IC ownership gap (Sprint 3.2) must not be cut — it is the foundation of every data quality metric in the system.

---

*Produced by `/ux-strategy:frame-problem` — March 25, 2026*
*Companion documents:*
*→ `2026-03-25-ux-strategy.md` — north-star vision, design principles, opportunity scores*
*→ `2026-03-25-ux-benchmark.md` — competitive scoring matrix, UX pattern inventory*
*Consider following up with `/writing-plans` to convert SP1–SP11 into sprint implementation tasks.*
