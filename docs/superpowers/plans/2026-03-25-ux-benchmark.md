# Workforce Allocation System — UX Competitive Benchmark
**Version 1.0 | March 25, 2026**
**Follows:** `2026-03-25-ux-strategy.md`

---

## Table of Contents
1. [Benchmark Framework](#1-benchmark-framework)
2. [Competitor Profiles](#2-competitor-profiles)
3. [Scoring Matrix](#3-scoring-matrix)
4. [Journey Comparisons](#4-journey-comparisons)
5. [UX Pattern Inventory](#5-ux-pattern-inventory)
6. [Opportunity Map](#6-opportunity-map)
7. [Recommendations](#7-recommendations)

---

## 1. Benchmark Framework

### Evaluation Dimensions

Nine dimensions covering UX quality, functional coverage, data quality, and workflow completeness. Each scored 1–5; total out of 45.

| # | Dimension | Category | What It Measures |
|---|---|---|---|
| D1 | **Candidate Discovery Speed** | UX Quality | Steps from staffing need to qualified+available shortlist; filter types available; result intelligibility |
| D2 | **Interaction Feedback Quality** | UX Quality | Pre-save allocation preview; soft threshold warnings; conflict callouts; loading states; destructive action disclosure |
| D3 | **Skills Intelligence** | Functional | Skill proficiency levels; multi-skill AND/OR filter; taxonomy; inline display on candidate cards |
| D4 | **Availability Intelligence** | Functional | Forward-looking projection (30–90d); date-range availability filter; leave-adjusted capacity |
| D5 | **Conflict Detection** | Functional | Hard cap enforcement; soft threshold alerts (80/90%); proactive dashboard surfacing; conflict resolution workflow |
| D6 | **Data Freshness Mechanisms** | Data Quality | Automated staleness nudges; staleness indicators on cards; last-updated timestamps; admin freshness dashboard |
| D7 | **Catalog Integrity Controls** | Data Quality | Skill merge/rename tooling; alias/synonym support; dedup guardrails at add-time; usage counts |
| D8 | **End-to-End Workflow Completion** | Workflow | Full staffing loop completable in-system without Slack/spreadsheet bridges; IC notification on assignment |
| D9 | **Cross-Role Coordination** | Workflow | IC self-service profile; PM read-only tier; HR Admin governance tools; RM operational controls; no admin bottleneck |

### Scoring Rubric (all dimensions)

| Score | Meaning |
|---|---|
| 5 | Best-in-class: feature is first-class, designed for this use case, no workarounds |
| 4 | Good: feature exists, well-designed, minor gaps |
| 3 | Adequate: feature exists, functional, notable limitations |
| 2 | Partial/weak: approximation possible with workarounds or configuration |
| 1 | Absent or broken: feature does not exist or creates more problems than it solves |

### Competitors Evaluated

| Group | Tool | Why Included |
|---|---|---|
| Resource schedulers | Float, Resource Guru | Closest workflow analogs; scheduling-first tools |
| PM tools w/ resource features | Monday.com, Asana | Common alternatives at this company size |
| Lightweight incumbents | Notion, Airtable | Direct replacements WBS must displace |
| Skill / HR platforms | Degreed, Workday | Skill intelligence and profile management references |

---

## 2. Competitor Profiles

### Float
**Philosophy:** Calendar-first scheduling for agency/studio operators. People are rows; days are columns; drag-to-create is the core interaction. Skills are not modeled. ICs are scheduling objects, not profile owners.

**Strongest UX moments:** Drag-to-resize duration, tentative (hatched) vs confirmed allocation visual states, split-panel availability sidebar on person click.

**Weakest UX moments:** No skill model, hours-per-day allocation (not %), ICs have zero agency, no stakeholder sharing without a paid seat.

---

### Resource Guru
**Philosophy:** "Clash-free" scheduling for professional services. People are resources with capacity; every booking attempt is validated against that capacity before save. More utilitarian and data-dense than Float.

**Strongest UX moments:** Clash resolution dialog (shows conflicting bookings, exact overage, resolution options — a workflow, not a warning), leave integration auto-subtracts PTO from schedulable capacity, availability API + iCal export.

**Weakest UX moments:** Free-form flat skill tags (no proficiency, no IC self-service), verbose booking form (8 required fields), reporting is powerful but not ambient.

---

### Monday.com
**Philosophy:** "Work operating system" — flexible, configurable, spreadsheet-familiar. Everything is a board; any board can approximate resource management with enough columns and automations.

**Strongest UX moments:** Threshold-zone workload bars (green/amber/red with visual break at 100%), filter column UI with multi-select dropdowns, MIRROR column linking related-entity data inline.

**Weakest UX moments:** No native availability concept (timeline-gap inference only), skills are freeform text columns with no system meaning, no pre-save blocking (only post-dashboard visual alerts), configuration overhead accumulates as UX debt.

---

### Asana
**Philosophy:** "Work graph" — structured task hierarchy with goals, portfolios, projects, and tasks. Resource management is task-effort-derived, not directly declared.

**Strongest UX moments:** Portfolio briefing table (status dots, owner, timeline, priority in a clean summary — the best PM-facing stakeholder surface in the category), click-through from workload bar to root-cause task, rules engine (trigger/condition/action cards, human-readable).

**Weakest UX moments:** Skills entirely absent from data model, availability = sum of assigned task hours (not declared allocation %), no pre-entry validation, IC has no skills profile to own.

---

### Notion
**Philosophy:** Document-database hybrid. "Everything is a block." Adopted for workforce tracking because zero IT involvement is required and HR can build a database in an afternoon.

**Strongest UX moments:** Composable filter builder (property + condition + value, chip-based, AND/OR, readable), inline cell editing (double-click to edit any field, no edit mode required), frictionless one-click share links.

**Weakest UX moments:** No pre-save validation (150% allocation saves silently), date-filtered allocation sum requires brittle formula chains that break silently, no notifications system (only @mention), no column-level access control on shared views.

---

### Airtable
**Philosophy:** Relational database with a spreadsheet interface. Typed fields, enforced values, linked records, rollups, and automations. More rigorous than Notion; more accessible than a real database.

**Strongest UX moments:** Typed fields enforce valid proficiency options, linked-record dropdown shows current allocation total before selection (pre-check), conditional row coloring (entire row turns red at 100%+), Interface Designer with field-level visibility control in shared views.

**Weakest UX moments:** No pre-save blocking (automations fire retroactively), multi-skill AND filter on a single multi-select field is not native, Interface Designer has high per-stakeholder setup cost, allocation formula is maintenance-dependent and breaks silently.

---

### Degreed
**Philosophy:** Learning experience platform (LXP) with skills intelligence as a byproduct of learning activity. Skills are career growth endpoints, not supply-side staffing signals.

**Strongest UX moments:** Behavioral proficiency anchors (tooltip per level shows job-to-be-done statement, not an abstract number), peer endorsement count per skill (social proof without manager approval), skill update visual feedback loop (proficiency ring animates on save).

**Weakest UX moments:** No availability or allocation layer of any kind, skill data is learning-event-derived (not project-experience-derived), staffing discovery is secondary admin console UX, no token-based sharing.

---

### Workday
**Philosophy:** Enterprise HCM. Every worker is a canonical, auditable, org-owned record. Interactions are transactional, procedural, approval-gated, and compliance-grade.

**Strongest UX moments:** Profile completeness ring with bulleted missing-item list (ambient nudge with direct links to each missing section), calendar-based availability with stacked project segments and leave integration, permanent role-based security grants (configure once, applies to all PMs forever).

**Weakest UX moments:** Allocation creation is 8-field form with approval routing (for a 30-second action), skill self-service routes through submit-to-approval workflow (24–48h lag), no ad-hoc token-link sharing, exploratory staffing discovery requires pre-built custom reports.

---

## 3. Scoring Matrix

### Raw Scores

| Dimension | Float | Res. Guru | Monday | Asana | Notion | Airtable | Degreed | Workday | **WBS Now** | **WBS Target** |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| D1 Candidate Discovery Speed | 2 | 3 | 2 | 1.5 | 2.5 | 2.5 | 1.5 | 2 | **3.5** | **5** |
| D2 Interaction Feedback Quality | 2 | 3 | 2 | 2 | 1 | 2 | 1 | 2 | **4** | **5** |
| D3 Skills Intelligence | 1 | 2 | 1.5 | 0.5 | 2 | 3 | 4 | 3 | **4** | **5** |
| D4 Availability Intelligence | 3 | 4 | 1.5 | 2 | 1 | 2 | 1 | 3 | **4** | **5** |
| D5 Conflict Detection | 2 | 4 | 2 | 2.5 | 1 | 2 | 1 | 3 | **5** | **5** |
| D6 Data Freshness Mechanisms | 1 | 2 | 1.5 | 1.5 | 1 | 2 | 3 | 2 | **3** | **5** |
| D7 Catalog Integrity Controls | 1 | 1 | 1 | 0.5 | 1.5 | 2 | 2 | 2 | **4** | **5** |
| D8 End-to-End Workflow Completion | 2 | 2 | 2 | 1.5 | 1 | 2 | 1 | 2.5 | **3** | **5** |
| D9 Cross-Role Coordination | 1.5 | 1.5 | 2 | 2 | 2.5 | 2.5 | 3 | 2 | **3** | **5** |
| **TOTAL / 45** | **15.5** | **22.5** | **16** | **14** | **13.5** | **20** | **17.5** | **21.5** | **33.5** | **45** |

### Ranked by Total Score

| Rank | Tool | Score | Category |
|---|---|:---:|---|
| 1 | **WBS (current)** | 33.5 | Purpose-built |
| 2 | Resource Guru | 22.5 | Resource scheduler |
| 3 | Workday | 21.5 | Enterprise HCM |
| 4 | Airtable | 20.0 | Lightweight incumbent |
| 5 | Degreed | 17.5 | Skill/LXP platform |
| 6 | Monday.com | 16.0 | PM tool |
| 7 | Float | 15.5 | Resource scheduler |
| 8 | Asana | 14.0 | PM tool |
| 9 | Notion | 13.5 | Lightweight incumbent |

### Score Gap Analysis: WBS vs Best-in-Class Per Dimension

| Dimension | Best Competitor Score | Best Competitor | WBS Now | Gap vs WBS | WBS Target Gap |
|---|:---:|---|:---:|:---:|:---:|
| D1 Discovery Speed | 3 | Resource Guru | 3.5 | **+0.5 (WBS leads)** | 1.5 |
| D2 Interaction Feedback | 3 | Resource Guru | 4 | **+1.0 (WBS leads)** | 1.0 |
| D3 Skills Intelligence | 4 | Degreed | 4 | **Tied** | 1.0 |
| D4 Availability Intelligence | 4 | Resource Guru | 4 | **Tied** | 1.0 |
| D5 Conflict Detection | 4 | Resource Guru | 5 | **+1.0 (WBS leads)** | 0 |
| D6 Data Freshness | 3 | Degreed | 3 | **Tied** | 2.0 |
| D7 Catalog Integrity | 2 | Airtable/Workday | 4 | **+2.0 (WBS leads)** | 1.0 |
| D8 Workflow Completion | 3 | Resource Guru | 3 | **Tied** | 2.0 |
| D9 Cross-Role Coordination | 3 | Degreed | 3 | **Tied** | 2.0 |

**WBS leads in:** Conflict Detection, Interaction Feedback, Catalog Integrity, Discovery Speed
**WBS tied with best competitor in:** Skills Intelligence, Availability Intelligence, Data Freshness, Workflow Completion, Cross-Role Coordination
**WBS trails best competitor in:** Nothing — WBS matches or leads the best score in every dimension

**Interpretation:** WBS is ahead of the market on its structural differentiators (conflict enforcement, catalog tooling, feedback quality). The remaining work is to close the gap to the WBS target score — the dimensions with the most headroom are D6 (Data Freshness, +2.0 to target), D8 (Workflow Completion, +2.0), and D9 (Cross-Role Coordination, +2.0).

---

## 4. Journey Comparisons

### Journey 1: Staffing a New Project
*"Find a React developer available 80% from next month"*

| Stage | Float | Resource Guru | Monday | Asana | Notion | Airtable | Degreed | Workday | WBS |
|---|---|---|---|---|---|---|---|---|---|
| **Receive request** | Slack only | Slack only | Slack only | Slack only | Slack only | Slack only | Slack only | Slack only | Slack only (Phase 3: intake form) |
| **Filter candidates** | Visual row scan | "Find Available Resources" filter | Column filter (skill tag, coarse) | Workload swimlane scan (no skill) | Multi-condition filter | Typed multi-select filter | Skill search (single dim) | Pre-built report | **Multi-skill + max-allocation filter panel, real-time card grid** |
| **Evaluate availability** | Hours-per-day gap | Forward hours + leave-adjusted | Timeline gap inference | Task-hours sum | Date-filtered rollup (fragile) | Date-filtered formula (fragile) | No availability data | Calendar week-by-week | **Forward projection card (30/60/90d)** |
| **Assign** | Drag-click on timeline | 8-field form, Clash dialog | Cell edit (no enforcement) | Task assignment (no % cap) | New row (no enforcement) | New row (retroactive automation alert) | No allocation | 8-field form + approval routing | **AllocationForm with live % preview, hard cap API** |
| **Notify stakeholders** | Screenshot to Slack | Slack / iCal export | Manual | Manual | Manual | Manual | No allocation | Approval workflow notification | **Share link (Phase 2); IC email notification (Phase 3)** |
| **Workflow self-contained?** | No | No | No | No | No | No | N/A | Partial | **Partial → Yes by Phase 3** |

**Key insight:** WBS is the only tool where stages 2–4 (filter, evaluate, assign) are a continuous in-system flow rather than three separate workflows requiring context switching. No competitor bridges skill filtering and availability projection and conflict-safe allocation creation in a single session.

---

### Journey 2: Keeping Skill Data Fresh
*"IC receives nudge; updates profile in under 2 minutes"*

| Stage | Float | Resource Guru | Monday | Asana | Notion | Airtable | Degreed | Workday | WBS |
|---|---|---|---|---|---|---|---|---|---|
| **Trigger** | None | None | None | None | None | Automation (if built) | Email nudge + in-app | Profile completeness ring | **Email nudge (90-day threshold)** |
| **Login / navigate** | No IC profile to navigate to | No IC profile | IC has no skills profile | IC has no skills profile | Opens shared page | Airtable form link | Deep-links to profile | Login → multi-step navigation | Login → `/me` (deep-link in Phase 3) |
| **Review current skills** | N/A | N/A | N/A | N/A | Inline cell view | Table row view | Skill rings + level label | Worker profile (Skills & Experience) | **SkillBadge list (no freshness indicator yet)** |
| **Edit skill proficiency** | Admin only | Admin only | Admin only | Admin only | Inline cell edit (if editor) | Form submit (create vs update bug) | Proficiency ring selector (IC-owned) | Submit to approval (24–48h lag) | **No IC self-edit today (Phase 3 gap)** |
| **Receive confirmation** | N/A | N/A | N/A | N/A | Cell visually updates | Form "thank you" screen | Ring animates on save | Approval status in inbox | Toast notification (Phase 3 enhancement) |

**Key insight:** WBS's biggest gap vs the field is in this journey. Degreed has the strongest IC update experience by far — IC-owned, visually engaging, with feedback animations. Workday has the best nudge structure (completeness ring). WBS has the staleness email (best trigger mechanism in the category) but lacks self-serve editing and feedback confirmation — meaning the trigger works but the action is blocked. This is Phase 3 Sprint 2's primary deliverable.

---

### Journey 3: Capacity Oversight
*"Admin checks who is approaching over-allocation and what opens up in 6 weeks"*

| Stage | Float | Resource Guru | Monday | Asana | Notion | Airtable | Degreed | Workday | WBS |
|---|---|---|---|---|---|---|---|---|---|
| **Present-state utilization** | Reports tab (not ambient) | Reports tab (not ambient) | Workload widget (dashboard) | Workload view | Rollup formula column | Rollup + conditional color | No allocation data | Dashboard (lagging) | **Admin dashboard — live, top-overallocated list** |
| **Soft threshold alerts** | Red bar only (no tiers) | Clash fires at booking | Visual bar zone (1 tier) | Workload bar color (1 tier) | None | None | N/A | Configurable (off by default) | **Three tiers: 80% / 90% / 100% with distinct colors** |
| **Forward projection** | None | None | None | None | None | None | None | Calendar if configured | **`/api/employees/{id}/availability` (30/60/90d)** |
| **Identify root cause** | Navigate to person row | Reports → allocation list | Click workload bar → task | Click bar → task | None | None | N/A | Navigate to worker record | **Click allocation → assignment row (Phase 3 improvement)** |

**Key insight:** WBS's admin dashboard is the only surface in the benchmark that provides both present-state multi-tier alerts AND a forward projection. The closest competitor is Workday's calendar view, which requires full HCM configuration. The gap WBS must close is ambient alerting (push notifications when thresholds are crossed) and click-through from utilization bar to root-cause assignment.

---

### Journey 4: Stakeholder Sharing
*"RM sends PM a link to check team availability without booking a meeting"*

| Approach | Float | Resource Guru | Monday | Asana | Notion | Airtable | Degreed | Workday | WBS |
|---|---|---|---|---|---|---|---|---|---|
| Mechanism | Paid Observer seat | Paid Observer or iCal | Guest link (board) | Portfolio guest access | Share page link | Interface Designer link | No allocation sharing | Permanent role grant | **Token link (30d expiry, no login)** |
| Login required? | Yes (paid seat) | Yes (paid seat) | Yes (guest account) | Yes (guest account) | No | No | N/A | Yes (IT-provisioned) | **No** |
| Project-scoped? | No (full schedule) | No (full schedule) | Partial (board filter) | Yes (portfolio) | Manual filter | Interface filter | N/A | Yes (security role) | Employee-scoped today; **project-scoped in Phase 3** |
| PM-optimized view? | No | No | No (raw board) | Closest (portfolio table) | No | Closest (Interface Designer) | N/A | No | **Fixed format today; configurable in Phase 3** |
| Setup per stakeholder | Seat purchase | Seat purchase | Account creation | Account creation | One click | Interface build | N/A | IT configuration | **One button click — zero setup** |

**Key insight:** WBS has the best sharing mechanism in the category on two dimensions: zero login required, and zero per-stakeholder setup. The gap to close is moving from employee-scoped to project-scoped views and giving the RM field-level visibility control over what the PM sees (Airtable's Interface Designer advantage).

---

## 5. UX Pattern Inventory

Concrete patterns from competitors that WBS should steal, ranked by implementation value.

### Tier 1 — Steal Immediately (Low Effort, High Impact)

| # | Pattern | Source | WBS Application | Effort |
|---|---|---|---|---|
| P1 | **Pre-selection allocation % in employee dropdown** | Airtable linked-record pre-check | Show "Alex Kim (70%)" in AllocationForm `<select>` options | 1h |
| P2 | **Last-modified timestamp per skill** | Workday audit trail, Airtable | "React · 중급 · 14일 전" chip on SkillBadge in profile + directory | 2h |
| P3 | **Colored left-border on EmployeeCard by utilization tier** | Airtable row coloring | 2px left border: green <80%, amber 80–99%, red 100%+ — instant triage at card-grid scale | 1h |
| P4 | **Behavioral proficiency anchor tooltip per level** | Degreed proficiency rings | Tooltip/popover on each BEGINNER/INTERMEDIATE/EXPERT option showing job-to-be-done statement | 2h |
| P5 | **Skill update visual feedback (micro-animation on save)** | Degreed proficiency animation | SkillBadge pulse animation on successful save; resolves "did my update register?" anxiety | 2h |
| P6 | **Tentative allocation visual state** | Float hatched bars | Dashed border on AllocationCard for proposed/pending assignments, distinct from confirmed | 2h |

### Tier 2 — Plan for Phase 3 (Medium Effort, High Impact)

| # | Pattern | Source | WBS Application | Effort |
|---|---|---|---|---|
| P7 | **Clash resolution dialog as a multi-step workflow** | Resource Guru Clash dialog | When cap is hit: show panel with all conflicting assignments, exact % overage, resolution options (reduce this, reduce other, override+reason) | M |
| P8 | **12-week mini availability timeline** | Workday calendar view + Float split panel | Replace text-list availability projection with a 12-column week-by-week grid; each cell colored by utilization tier | M |
| P9 | **Composable filter chip bar** | Notion filter builder | Replace current independent dropdown panels with chip-based composable filters: "+ Add filter" → property → condition → value, each filter as a dismissible chip showing "Skill: React (×)" | M |
| P10 | **Profile completeness ring with missing-item list** | Workday profile completeness | On `/me` page: completeness indicator (e.g., "2 of 3 sections complete") with direct links to each missing section | M |
| P11 | **Portfolio briefing table for PM share views** | Asana Portfolio | Redesign project-scoped share page as a clean summary table: Name \| Skills top-3 \| Current % \| Available from — readable as a stakeholder briefing | M |
| P12 | **Click-through from utilization bar to root-cause assignments** | Asana workload bar click | In admin dashboard: clicking an over-allocation bar opens an inline panel showing the specific assignments causing the overage with inline edit controls | M |

### Tier 3 — Phase 4 or Later

| # | Pattern | Source | WBS Application |
|---|---|---|---|
| P13 | Peer endorsement count on skills | Degreed endorsements | Colleague +1 on a skill; shows "Endorsed by 3" badge; lightweight trust signal |
| P14 | Structured alert rule cards | Asana rules engine | Admin-configurable alert rules expressed as trigger/condition/action cards in human language |
| P15 | iCal/API export for availability | Resource Guru | Read-only iCal endpoint per project for PM calendar integration |
| P16 | Leave-adjusted availability | Resource Guru leave integration | Subtract approved PTO from forward availability projection |
| P17 | Field-level visibility control on share link | Airtable Interface Designer | RM can toggle which fields are visible on the generated share link |

---

## 6. Opportunity Map

### WBS vs. Field — Dimension-by-Dimension Gap

The following maps where WBS leads the market, where it is competitive, and where it has genuine gaps relative to what the best competitor offers for this use case.

```
                                WBS NOW    BEST COMPETITOR    GAP TO MARKET LEADER
D1 Candidate Discovery Speed      3.5           3.0            WBS +0.5 ↑
D2 Interaction Feedback Quality   4.0           3.0            WBS +1.0 ↑
D3 Skills Intelligence            4.0           4.0 (Degreed)  TIED —
D4 Availability Intelligence      4.0           4.0 (Res.Guru) TIED —
D5 Conflict Detection             5.0           4.0 (Res.Guru) WBS +1.0 ↑
D6 Data Freshness Mechanisms      3.0           3.0 (Degreed)  TIED —
D7 Catalog Integrity Controls     4.0           2.0            WBS +2.0 ↑
D8 Workflow Completion            3.0           3.0 (Res.Guru) TIED —
D9 Cross-Role Coordination        3.0           3.0 (Degreed)  TIED —
```

WBS leads the field in 4 of 9 dimensions. The remaining 5 dimensions are competitive ties with best-in-class competitors — none are deficits.

### WBS Current Gaps vs. WBS Target

| Dimension | WBS Now | WBS Target | Gap | Closes With |
|---|:---:|:---:|:---:|---|
| D1 Discovery Speed | 3.5 | 5 | 1.5 | P9 (filter chips) + forward availability on card |
| D2 Interaction Feedback | 4 | 5 | 1.0 | P7 (Clash dialog workflow) + P5 (update animation) |
| D3 Skills Intelligence | 4 | 5 | 1.0 | P4 (behavioral anchors) + P13 (endorsements, Phase 4) |
| D4 Availability Intelligence | 4 | 5 | 1.0 | P8 (mini timeline) + P16 (leave-adjusted, Phase 4) |
| D5 Conflict Detection | 5 | 5 | 0 | Already best-in-class |
| D6 Data Freshness | 3 | 5 | 2.0 | IC self-serve edit (Phase 3) + P2 (timestamps) + P10 (completeness ring) |
| D7 Catalog Integrity | 4 | 5 | 1.0 | Dedup guardrail at add-time (Phase 4) |
| D8 Workflow Completion | 3 | 5 | 2.0 | IC email notification + PM intake form (Phase 3) |
| D9 Cross-Role Coordination | 3 | 5 | 2.0 | IC self-serve (Phase 3) + PM role tier (Phase 3) |

**Highest-value gap closures for Phase 3:**
1. **D6 Data Freshness** (gap = 2.0): IC self-serve editing + freshness timestamps close most of this gap
2. **D8 Workflow Completion** (gap = 2.0): IC assignment email + PM intake form close most of this gap
3. **D9 Cross-Role Coordination** (gap = 2.0): IC self-serve + PM read-only tier closes this gap

These three dimensions share a common driver: **the system currently captures data but does not surface it back to the people who created it, and it does not complete the feedback loop between data entry and operational outcome.** All three gaps close together if the Phase 3 sprint plan is executed.

### Competitive Moats: What Competitors Cannot Replicate

These are WBS advantages that require architectural decisions, not just feature additions, to replicate:

| Moat | Why It's Hard to Replicate | Risk |
|---|---|---|
| **Hard 100% cap at API level** | Requires building a purpose-specific allocation domain with SERIALIZABLE transactions. Float/Monday/Notion/Airtable all have soft-only enforcement by design because flexibility is their business model. | Low — this is a design philosophy choice; unlikely to be reversed |
| **IC-owned skill profiles with system-level staleness detection** | Requires `skillsLastUpdatedAt` in the data model, a weekly scheduler, and an IC-facing edit surface. Enterprise tools (Workday) have the scheduler but gate editing behind approvals. | Medium — Workday could unlock self-service; Degreed could add allocation |
| **Token-based, zero-configuration stakeholder sharing** | Requires purposeful backend token infrastructure. Notion's share is close but has no expiry or field control. Airtable's Interface Designer requires per-stakeholder setup. | Low — this is an architectural choice that Notion/Airtable's flexibility models actively resist |
| **Skill taxonomy with merge/rename governance** | Requires a dedicated catalog admin UI and merge-on-write logic. No competitor in this benchmark has merge tooling. | Low — no competitor is building this |

---

## 7. Recommendations

### Finding 1: WBS is already the strongest tool in the category — protect the moats, close the IC gaps

WBS scores 33.5/45 against a field where the strongest competitor (Resource Guru) scores 22.5/45. The structural advantages are real: conflict enforcement, catalog integrity, forward availability, and token sharing are genuinely differentiated. No competitor in this benchmark offers this combination.

The risk is not that competitors will overtake WBS on its strengths. The risk is that WBS under-delivers on the IC experience — the layer that feeds every structural advantage with accurate data. **If the skill profiles are stale, the catalog is fragmented, and ICs don't own their data, every other competitive advantage degrades.**

**Action:** Execute Phase 3 Sprint 2 (IC self-serve editing + assignment confirmation email) as the highest-priority work after the quick wins.

---

### Finding 2: Three specific competitor patterns have the highest ROI relative to implementation cost

Based on the scoring gap analysis and the journey comparisons, these three patterns from the benchmark would close the most WBS-vs-target score points per engineering-hour:

**#1 — Pre-selection allocation % in employee dropdown (P1, Airtable)**
Score impact: D1 +0.3, D2 +0.3
Implementation: Append `(70%)` to each option label in the AllocationForm `<select>`, with color indicator at 80%+. One hour of frontend work.
This is the highest ROI pattern in the entire benchmark. It gives the RM the most important information (current allocation) at the exact moment they most need it (employee selection), with zero navigation cost.

**#2 — Composable filter chip bar (P9, Notion)**
Score impact: D1 +0.7 toward target
Implementation: Refactor SkillFilterPanel from independent dropdowns to a chip-based "Add filter → property → condition → value" composable bar. Medium frontend work.
As WBS adds more filter dimensions over time (department, employment type, availability date range, grade), the current panel does not scale. Notion's chip model handles N filter types cleanly and surfaces all active filters as readable chips that users can dismiss individually. This is the interaction pattern that makes the directory feel like a search tool rather than a set of independent selects.

**#3 — Behavioral proficiency anchor tooltip per level (P4, Degreed)**
Score impact: D3 +0.5, D6 +0.3 (reduces self-report inconsistency)
Implementation: Tooltip on BEGINNER/INTERMEDIATE/EXPERT options. Phase 1 already added helper text below the select — the steal is attaching the definition to each option as a tooltip rather than a group caption. Two hours of frontend work.
Degreed's research finding (confirmed by the WBS user research) is that proficiency self-report is highly inconsistent without behavioral anchors. Every RM filter on "React: Intermediate" is only as accurate as the IC's interpretation of "Intermediate." Anchoring with "실무 적용 가능 — 독립적으로 작업 완수" reduces the interpretation gap and improves filter accuracy without requiring admin validation.

---

### Finding 3: The stakeholder sharing model needs one targeted upgrade to match Airtable

WBS's token-based sharing is structurally superior (zero login, zero per-user setup). The gap is field-level visibility control — the RM cannot choose which fields are visible in the generated link. This is Airtable's strongest remaining advantage.

**Short-term mitigation (Phase 3):** Make the project-scoped share view deliberately minimal — name, title, current allocation %, availability window, active projects. Remove internal fields (grade, employment type, HR notes) from the public view entirely by design. The RM doesn't choose what to hide; the system makes the right call about what's appropriate for external stakeholders.

**Phase 4 improvement:** Add a field-visibility toggle on the share link generation modal (show/hide 3–4 columns). This matches Airtable's pattern with less configuration overhead.

---

### Finding 4: Resource Guru's Clash dialog is the right model for WBS's conflict resolution UX

WBS currently shows a `conflictMsg` string in the AllocationForm when the 100% cap is exceeded. This is better than most competitors (which don't block at all) but it's a dead-end response: the error message appears, the form is invalid, and the RM must manually figure out what to adjust.

Resource Guru's Clash dialog is a workflow: it shows which existing allocations are in conflict, the exact overage percentage, and resolution options. The RM has a path forward without leaving the form.

**Recommended Phase 3 addition:** When the API returns 409 (conflict), the form should expand a Clash panel below the form fields showing:
- The conflicting assignments (project name, current %, date range)
- The exact over-allocation amount ("This assignment would put Alex at 110% — 10% over cap")
- Resolution options: "Reduce this allocation," "End a conflicting assignment early," "Override with reason (admin only)"

This closes the D2 (Interaction Feedback) and D8 (Workflow Completion) gaps simultaneously and makes WBS's strongest competitive feature (conflict detection) experientially obvious to users coming from other tools.

---

### Finding 5: Degreed's IC engagement mechanics are the reference for the `/me` page redesign

WBS's north-star on the IC experience is: updating skills takes under 2 minutes and feels personally useful, not administrative. Degreed achieves this better than any other benchmarked tool for the IC update workflow specifically.

Three specific mechanics from Degreed should inform the `/me` page Phase 3 work:
1. **Proficiency rings with behavioral anchors** → WBS equivalent: proficiency selector tooltip
2. **Visual feedback on update** → WBS equivalent: SkillBadge animation on save
3. **"Your profile helps you get discovered"** motivational copy in nudge email → WBS equivalent: email framing ("최신 스킬 프로필은 관련 프로젝트 배정 가능성을 높입니다")

The difference between a nudge email that converts at 20% and one that converts at 40% is not the trigger (both are at 90 days) — it's the framing. Degreed's consumer-product value frame ("your profile = career visibility") converts better than a compliance frame ("your profile is out of date"). WBS's nudge email should be written in that register.

---

### Summary Scorecard: Phase 3 Design Priorities (from benchmark)

| Priority | Action | Closes Competitor Gap | WBS Dimension Gain |
|---|---|---|---|
| 1 | IC self-serve skill editing on `/me` | Matches Degreed profile ownership; closes Workday's approval-lag gap | D6 +1.0, D9 +0.5 |
| 2 | Freshness timestamps on skill badges (P2) | Matches Workday audit trail; closes Degreed visual-feedback gap | D6 +0.5, D3 +0.2 |
| 3 | Pre-selection allocation % in dropdown (P1) | Matches Airtable linked-record pre-check | D1 +0.3, D2 +0.3 |
| 4 | Clash resolution dialog as workflow (P7) | Matches Resource Guru Clash workflow | D2 +0.5, D8 +0.3 |
| 5 | Behavioral proficiency anchor tooltip (P4) | Matches Degreed proficiency level definitions | D3 +0.3, D6 +0.2 |
| 6 | Profile completeness ring with missing-item list (P10) | Matches Workday profile completeness prompt | D6 +0.5, D9 +0.3 |
| 7 | Assignment confirmation email to IC | Closes the only notification gap vs. competitors | D8 +0.5, D9 +0.3 |
| 8 | PM intake form + RM queue | Closes the single largest workflow gap in the benchmark | D8 +1.0, D9 +0.7 |

**Executing priorities 1–5 in Phase 3 Sprint 1–2 brings WBS to an estimated score of ~38/45 — above any competitor's current total and within 7 points of theoretical maximum.**

---

*Produced by `/ux-strategy:benchmark` — March 25, 2026*
*Companion document: `2026-03-25-ux-strategy.md`*
*Follow up with `/frame-problem` to define specific design challenges for Phase 3 Sprint 1.*
