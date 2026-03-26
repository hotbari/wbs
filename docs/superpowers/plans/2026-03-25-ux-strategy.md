# Workforce Allocation System — UX Strategy
**Version 1.0 | March 25, 2026**
**Branch:** design/owl-listener

---

## Table of Contents
1. [North-Star Vision](#1-north-star-vision)
2. [Competitive Landscape](#2-competitive-landscape)
3. [Experience Map](#3-experience-map)
4. [Design Principles](#4-design-principles)
5. [Opportunity Framework](#5-opportunity-framework)
6. [Metrics & KPIs](#6-metrics--kpis)
7. [Design Brief](#7-design-brief)

---

## 1. North-Star Vision

### Aspirational Product Vision

WBS becomes the single source of truth for human capital decisions at the company — a live, queryable map of who knows what, who is available when, and where the gaps will be before they become blockers. Resource Managers stop firefighting and start planning; every staffing decision is made from evidence, not instinct or a stale spreadsheet.

### What Success Looks Like, By User

**Resource Manager (Primary — checks 2-3x/day)**
Answers "who can staff this project starting in 6 weeks with React and AWS experience" in under 30 seconds, without leaving the dashboard. Conflict detection surfaces before a project manager asks. Forward projections are accurate enough that surprises become exceptions, not the norm.

**HR Admin**
The skill catalog is clean, current, and trusted. Duplicate skills no longer proliferate because merge tooling is frictionless. Nudge emails drive enough contributor engagement that profile staleness drops below 10%.

**Individual Contributor**
Updating skills takes less than 2 minutes and feels personally useful, not a compliance burden. Contributors see their profile as a career record. When a project match uses their profile, they feel it.

**Project Manager (Phase 3)**
PMs can submit a structured staffing request and track its status without chasing the Resource Manager on Slack. They have read-only visibility into their team's availability and upcoming conflicts.

### 3-Year Horizon Vision (2029)

By 2029, WBS operates as an **ambient workforce intelligence layer**:

- **Staffing requests are workflow-native.** A PM submits a request, the system proposes ranked candidates, and the Resource Manager approves or adjusts. The spreadsheet is gone.
- **Forward projections are trusted.** The 12-week availability forecast drives headcount conversations in leadership reviews.
- **Skill data is a living record.** Profiles kept current through lightweight touchpoints — quarterly self-reviews, post-project skill confirmations, automated staleness detection.
- **Conflict detection is proactive.** The system flags over-allocation risks 4+ weeks in advance, before they escalate.
- **The platform earns the daily open.** Because data is accurate and the UI is fast, people open WBS instead of building shadow spreadsheets.

### Core Value Proposition

> WBS eliminates the gap between "what the company knows about its people" and "what decision-makers need to know right now." It converts workforce data from a periodic HR artifact into a real-time operational asset.

Three legs: **Visibility** (current, not weeks-old data) · **Speed** (answers in seconds, not hours) · **Trust** (data quality mechanisms make the numbers credible enough to act on).

### Strategic Bets

| Bet | Hypothesis |
|---|---|
| 1. Frictionless Profile Maintenance | Well-timed nudges + self-serve editing sustains 90%+ profile freshness without mandating compliance |
| 2. Forward Projections as Primary Planning Surface | 8–12 week availability projections become the lens for all staffing decisions, shifting RM from reactive to anticipatory |
| 3. Structured Staffing Requests Replace Slack | A simple intake form is enough to pull PM↔RM conversation into WBS and create an auditable record |
| 4. Skill Taxonomy Quality Is a Multiplier | Investing early in merge/dedup tooling compounds in accuracy for every downstream feature |

---

## 2. Competitive Landscape

### Summary Positioning

WBS occupies white space between enterprise ERP (SAP SuccessFactors, Workday — too heavy, months to implement) and lightweight tools (Float, Resource Guru, Notion/Airtable — no skill intelligence). It also occupies white space that pure skill management platforms (Degreed, Workera) cannot fill because they have no allocation or availability layer.

> **Strategic positioning:** "The only resource management tool purpose-built for the operational reality of a mid-scale technical team: too dynamic for spreadsheets, too lean for enterprise software, and too skills-driven for calendar-based schedulers."

### Feature Comparison

| Feature | WBS | SAP SF | Workday | Float | Resource Guru | Jira | Monday | Degreed | Notion | Airtable |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Skill profiles | ✓ | ✓ | ✓ | — | — | — | Partial | ✓ | Manual | Manual |
| Skill proficiency levels | ✓ (3-tier) | ✓ | ✓ | — | — | — | Manual | ✓ | Manual | Manual |
| Skill catalog management | ✓ | — | — | — | — | — | — | ✓ | — | — |
| Skill merge/dedup | ✓ | — | — | — | — | — | — | — | — | — |
| Skill staleness nudge email | ✓ | — | — | — | — | — | — | — | — | Partial |
| Allocation % tracking | ✓ | — | — | Hours | Hours | Story pts | Hours | — | Manual | Manual |
| Hard 100% cap enforcement | ✓ | — | Soft | Soft | Soft | — | Soft | — | — | Formula |
| 3-tier over-allocation alerts | ✓ | — | — | 1-tier | 1-tier | — | Visual | — | — | — |
| Forward availability projection | ✓ (30/60/90d) | — | Partial | Capacity | Capacity | — | — | — | — | Formula |
| Admin dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | Plugin | ✓ | ✓ | — | Build |
| Shareable read-only links | ✓ | — | — | — | — | — | Partial | — | ✓ | ✓ |
| Employee self-service profile | ✓ | Limited | Limited | — | — | — | — | ✓ | Manual | Manual |
| Implementation time | Days | Months | Months | Hours | Hours | Days | Hours | Weeks | Hours | Days |

### UX Differentiation Opportunities

1. **Allocation as a First-Class Visual Language** — progressive color gradient at 80/90/100%, allocation bars showing composition by project on hover
2. **Forward Availability as the Primary Planning Surface** — default view is future-oriented; current state is a marker, not the focal point
3. **Skill Profile Ownership by the Employee** — self-service profile as polished as the admin dashboard; nudge email deep-links to specific stale skill
4. **Shareable Links as a Trust-Building Surface** — curated PM view, not a stripped admin view; shows expiry date prominently
5. **Skill Catalog as Organizational Memory** — merge/dedup is a first-class queue with preview of affected employees, not an admin menu option
6. **Role-Scoped Interfaces** — each tier is purpose-designed, not permission-stripped from a single layout

### The Incumbent WBS Replaces

The companies that need WBS are already using: a Notion database that operations maintains manually, an Airtable base that breaks when a new skill is added, and a Float calendar that answers "who is free" but never "who is qualified." The migration story from these tools is WBS's primary adoption narrative.

---

## 3. Experience Map

### Journey 1: Staffing a New Project (Resource Manager — 박지영)

*Scenario: PM messages on Slack asking for a React developer, 80% allocation from next month.*

| Stage | Actions | Touchpoints | Emotion | Pain Points | Opportunities |
|---|---|---|---|---|---|
| **1. Receive Request** | Reads Slack DM, mentally parses unstructured ask | None — WBS not involved | Neutral → anxious | No formal intake record; lives only in Slack | PM staffing request form as structured intake |
| **2. Search Candidates** | Opens `/employees`, sets skill + allocation filters | SkillFilterPanel, EmployeeCard grid | Frustrated → cautious | Catalog duplicates ("React" vs "ReactJS"); no future availability on card; no comparison mode | Skill freshness indicator; forward availability on card; catalog dedup guardrail |
| **3. Evaluate Availability** | Clicks into profile, reviews forward projection card | Employee detail + availability card | Stressed but improving | Open-ended assignments corrupt projection; no staleness timestamp visible; no side-by-side compare | Show `skillsLastUpdatedAt`; flag open-ended assignments; candidate shortlist |
| **4. Assign Employee** | `/admin/allocations` → AllocationForm → live preview → submit | AllocationForm with real-time total preview, 100% cap guard | Relieved | No skill/dept context in employee dropdown; single-entry form; no link to original Slack request | Enrich dropdown; bulk assignment form; link to intake record |
| **5. Confirm & Communicate** | Returns to Slack to notify employee and PM; generates share link | Share token + public `/share/[token]` | Satisfied but still doing manual work | No automated assignment notification; share link expiry invisible to PM; link is employee-scoped not project-scoped | Auto email on assignment; expiry visibility; project-scoped share |

### Journey 2: Keeping Skills Fresh (Individual Contributor — 이민준)

*Scenario: Receives staleness nudge email 93 days after last skill update.*

| Stage | Actions | Touchpoints | Emotion | Pain Points | Opportunities |
|---|---|---|---|---|---|
| **1. Email Nudge** | Reads email, decides to act | Spring Mail nudge (weekly scheduler, 90-day threshold) | Mildly annoyed → motivated | Accusatory framing; no personalization; link lands on login page | Value-frame copy; deep-link to `/me#skills`; show current top-3 skills in email |
| **2. Log In** | Arrives at `/login`, authenticates, lands on dashboard | Login page, JWT auth, redirect | Neutral → impatient | No post-auth redirect carrying intent; must navigate again | `?redirect=/me#skills` in email CTA |
| **3. Review Skills** | Navigates to `/me`, finds skills card | `/me` page, SkillBadge components | Uncertain | No "last updated" timestamp visible; stale and fresh skills look identical; narrow sidebar can overflow | Show `skillsLastUpdatedAt` on card; staleness indicator per badge |
| **4. Update Proficiency** | Looks for edit affordance — finds none on `/me` | — | **Frustrated** | **No self-serve skill edit on `/me` page; must ask admin; proficiency levels undefined** | **Inline edit on skills card; catalog-backed autocomplete; proficiency tooltip** |
| **5. Confirmation** | Sees (or doesn't see) success feedback | React Query cache update | Uncertain | No toast on save; no updated timestamp; no feedback the update mattered | Toast notification; refresh "last updated" label; motivational close-loop message |

### Highest-Friction Moments (Ranked)

| Rank | Moment | Why |
|---|---|---|
| 1 | Skill catalog duplicates invalidating search (Journey 1, Stage 2) | Invisible: RM doesn't know she's missing candidates. Highest consequence friction. |
| 2 | No self-serve skill edit on `/me` (Journey 2, Stage 4) | Entire nudge pipeline produces zero data improvement and maximum frustration. Highest drop-off point. |
| 3 | Unstructured Slack-based staffing intake (Journey 1, Stage 1) | Highest volume friction (2-3 PM queries/day) with no audit trail. |

### Biggest Emotional Valleys (Ranked)

| Rank | Valley | Root Cause |
|---|---|---|
| 1 | "I found out he was at 110% after the sprint started" | Open-ended assignments corrupt the forward projection silently |
| 2 | "Why did I bother updating if nothing confirms it mattered?" | No feedback loop between IC update and RM discovery |
| 3 | Skill search returns zero results due to catalog fragmentation | System trust collapses; user opens Excel |

**Root cause:** The system captures data but does not surface it back to the people whose behavior created it. The Resource Manager cannot see when data is stale; the Individual Contributor cannot see that their update registered. Fixing the data visibility layer resolves friction in both journeys simultaneously.

---

## 4. Design Principles

### 1. The Directory Is the Product
The employee directory is not a list — it is the primary decision-making instrument. Every design choice serves the question: "Who is available, with what skills, starting when?"

- Skill, department, and allocation filters appear together in a single persistent filter bar — not behind a drawer
- `EmployeeCard` surfaces allocation % and top 3 skills inline — the card answers the staffing question without a click
- Forward availability with a date range is a first-class entry point, not a query string parameter

*Prevents:* Directory-as-filing-cabinet. *Resolves:* Breadth vs. depth.

### 2. The 100% Cap Is Sacred Ground
The hard allocation cap is the system's highest-trust feature. It must never be defeatable, and its enforcement must be visible before, during, and after the fact.

- Allocation forms show a live running total before save: "Current: 60% + this: 30% = 90% of 100%"
- SERIALIZABLE transaction + SELECT FOR UPDATE makes concurrent over-allocation physically impossible
- Admin dashboard uses graduated alerts (amber at 80%, red at 100%) — pressure shown before ceiling is hit

*Prevents:* Post-hoc conflict discovery. *Resolves:* Present state vs. future projection.

### 3. Staleness Is a System Failure, Not a User Fault
When skill data goes stale, the system treats it as a product defect and takes action.

- Weekly scheduler dispatches staleness nudge emails; email deep-links to the specific skills section
- Proficiency selects display inline definitions at point of entry — ambiguity eliminated at input
- Employee cards display a freshness signal when skills >90 days stale

*Prevents:* "Dashboard looks good but data is stale." *Resolves:* Data precision vs. ease of update.

### 4. Admins Govern, Employees Own
Admins control access and catalog integrity; employees have uncontested authority over their own skill profiles.

- API layer enforces field whitelists by caller role; mismatched field edits return 403
- Employees add/update/remove their own skills without admin approval step
- Employees pick from the admin-curated catalog — catalog quality is protected without gatekeeping profile accuracy

*Prevents:* Admin micromanagement (staleness) and uncontrolled catalog growth (fragmentation simultaneously). *Resolves:* Admin power vs. employee autonomy.

### 5. Show Time, Not Just State
Allocation percentages without dates are opinions. Expose temporal context at every layer.

- Employee profile shows forward availability projection, not just today's total allocation
- Assignments with no `end_date` are semantically distinct from dated assignments in the UI
- Admin dashboard "available employees" tile uses a 30-day forward window, not today's free percentage

*Prevents:* Allocation theater — confident-looking percentages that become wrong next week. *Resolves:* Present state vs. future projection.

### 6. Protection Radiates Outward
Conflict detection started at the 100% cap. That protective pattern extends to every stakeholder who can be harmed by an allocation change they did not see coming.

- Soft alerts at 80/90% appear before the hard cap is reached
- Assigned employees receive an automated notification — not a Slack message
- Shareable read-only links give PMs self-serve visibility without making RM a human API

*Prevents:* System-as-filing-cabinet — recording decisions made entirely outside it. *Resolves:* Stakeholder access mismatch.

### 7. Destructive Actions Earn Their Friction
Recoverable actions are fast. Irreversible or high-impact actions require a moment of intentional comprehension.

- Employee deactivation shows an inline panel explaining what will happen — not `window.confirm()`
- Soft delete is the default; hard delete gated by referential integrity check (409 if referenced)
- Confirmation panels replace buttons in-context, keeping the user spatially oriented

*Prevents:* Muscle-memory accidental data loss. *Resolves:* Admin power bounded by deliberate action.

### 8. Read-Only Access Is a First-Class Tier
Stakeholders who need to see but not change should have a path to self-serve that does not route through the Resource Manager as intermediary.

- Share tokens use signed, time-bounded URLs — purpose-built for PM ad-hoc sharing
- The token system is designed to evolve into an authenticated PM tier — `/share/[token]` and the PM dashboard are the same product, different auth layers
- The directory skill filter and forward availability view are designed as independent, parameterizable views so access control is additive, not a redesign

*Prevents:* RM as human API — answering the same availability query by screenshot 10 times a week.

---

## 5. Opportunity Framework

### Scoring Methodology
Priority Score = (Impact × Frequency × Strategic Fit) / Effort
Ratings 1–5; Effort: 1=hours, 2=half-day, 3=1-2 days, 4=3-5 days, 5=week+

### Full Scoring Table

| # | Opportunity | Impact | Freq | Effort | Fit | Score |
|---|---|:---:|:---:|:---:|:---:|:---:|
| 2 | Skill freshness signal in UI (`skillsLastUpdatedAt`) | 4 | 4 | 1 | 5 | **80.0** |
| 4 | Assignment confirmation notification to employee | 4 | 5 | 2 | 5 | **50.0** |
| 6 | End-date visibility on open-ended assignments | 5 | 4 | 2 | 5 | **50.0** |
| 8 | Share link expiry visibility for PM | 3 | 3 | 1 | 4 | **36.0** |
| 1 | IC self-serve skill editing on `/me` | 4 | 3 | 2 | 5 | **30.0** |
| 12 | Allocation form employee dropdown context tags | 3 | 4 | 2 | 4 | **24.0** |
| 5 | Structured PM staffing request workflow | 4 | 4 | 5 | 5 | **16.0** |
| 3 | Skill catalog dedup guardrail at add-time | 3 | 3 | 3 | 4 | **12.0** |
| 9 | Project-scoped share view | 4 | 3 | 4 | 4 | **12.0** |
| 10 | Bulk staffing assignment form | 4 | 3 | 4 | 4 | **12.0** |
| 7 | Side-by-side candidate comparison | 3 | 2 | 4 | 4 | **6.0** |
| 11 | Admin dashboard historical trend data | 3 | 2 | 5 | 3 | **3.6** |

### Phase 3 Roadmap

**Sprint 3.1 — Quick Wins (2 weeks)**

| # | Deliverable | Backend | Frontend |
|---|---|---|---|
| #2 | `skillsLastUpdatedAt` freshness badge on profile + `/me` | Expose field in `EmployeeDetail` DTO | Freshness label with 30/60/90d color states |
| #6 | Amber "No end date" flag on open-ended assignments | None | `MemberAssignmentSection` + assignment row |
| #8 | Share link expiry date shown at generation + expired error page | Include `expiresAt` in share response | Admin UI + `/share/[token]` expired state |
| #12 | Allocation form dropdown enriched with dept + top skills | Already in `EmployeeSummary` DTO | `AllocationForm` combobox option rendering |

**Sprint 3.2 — IC Autonomy + Notifications (2 weeks)**

| # | Deliverable | Backend | Frontend |
|---|---|---|---|
| #1 | IC self-serve skill add/edit/remove on `/me` | Auth guard carve-out for own `EmployeeSkill` mutations | Inline edit popover on skills card, catalog autocomplete |
| #4 | Email on assignment creation | `AllocationService.create()` trigger → Spring Mail | None (email template only) |

**Sprint 3.3 — PM Access Tier (3 weeks)**

| # | Deliverable | Backend | Frontend |
|---|---|---|---|
| #5 | PM request form + RM queue + status tracking | `StaffingRequest` entity, new `UserRole.PM`, Flyway migration | PM intake form + RM fulfillment queue |
| #9 | Project-scoped share token + public project view | `scope` discriminator on `share_tokens`, project data endpoint | `/share/project/[token]` roster page |

### Phase 4 Backlog

| # | Opportunity | Notes |
|---|---|---|
| #10 | Bulk allocation creation form | Independent; `POST /api/allocations/bulk` wrapping existing service |
| #3 | Catalog dedup guardrail at add-time | Trigram similarity check at `SkillService.create()` |
| #7 | Side-by-side candidate comparison view | `/compare?a=[id]&b=[id]`; pure frontend |
| #11 | Admin dashboard historical trend | Requires daily snapshot scheduler; defer until leadership demand |

### Key Architectural Dependencies

1. **PM Role Tier (#5) gates project-scoped share (#9)** — `UserRole` enum expansion should be designed for `PM` as first-class
2. **`skillsLastUpdatedAt` (#2) enables IC self-serve (#1)** — column exists; self-serve edit must touch it on every mutation
3. **Spring Mail substrate (Phase 2) is the notification layer for #4** — triggered (not scheduled) use of existing infrastructure
4. **Share token table (#8, #9)** — extend with `scope` discriminator (`EMPLOYEE`/`PROJECT`) + optional `project_id` FK rather than a second table
5. **`AllocationService.create()` is the chokepoint for #4 and #10** — both inject here; bulk should wrap single-create to avoid duplicating cap detection

---

## 6. Metrics & KPIs

### North-Star Metric

**Time to First Qualified Candidate (T2C)**

Elapsed time from page load on `/employees` to first filter-applied render with ≥1 result. Maps directly to "under 30 seconds" product goal. Fails naturally when UI is slow, data is stale, or filter features are absent.

- **Target:** Median ≤ 30s
- **Stretch:** p75 ≤ 45s
- **Red flag:** Median > 90s for any rolling 7-day window

### Engagement Metrics

| Metric | Target | Red Flag |
|---|---|---|
| Weekly Active Admin Users (WAU-Admin) | ≥80% of admin accounts active/week | <50% for 2 consecutive weeks |
| Directory Filter Usage Rate | ≥60% of directory sessions use ≥1 filter | <20% — filter not trusted or found |
| Return Visit Frequency (Admin) | ≥4 sessions/week per active admin | <2 sustained — tool being bypassed |
| IC Login Rate (post-nudge, within 14 days) | ≥40% | <15% — nudge in spam or no motivation to act |
| Allocation Creation Source | 100% of new allocations go through WBS | Any confirmed spreadsheet-sourced allocation |

### Task Completion Metrics

| Metric | Target | Red Flag |
|---|---|---|
| Staffing Workflow Completion Rate | ≥50% of filter sessions end with allocation created | <20% — broken handoff between search and record-keeping |
| Skill Update Completion Rate (IC, post-nudge) | ≥65% of nudge logins result in a skill change | <30% — ICs abandon on profile page |
| Allocation Conflict Rejection Rate | <5% of attempts blocked by cap | >20% — stale data or admins not reading preview |
| Share Link Delivery Completion | ≥70% of generated links accessed within 7 days | <30% — links not reaching PMs |
| Skill Catalog Merge Action Rate | ≥80% of flagged duplicates resolved within 30 days | <40% — merge tool not being used |

### Data Quality Metrics

| Metric | Target | Red Flag |
|---|---|---|
| Skill Data Freshness Rate | ≥80% of employees updated within 90 days | <50% — system-wide staleness crisis |
| Profile Completeness Rate | ≥95% of employees have ≥1 skill | <70% — filters return empty results too often |
| Skill Catalog Duplicate Rate | <5% of catalog are duplicates | >15% — filters fragmenting results |
| Allocation Accuracy (quarterly spot-check) | ≥90% match actual project status | <75% — data diverging from reality |
| Stale Allocation Rate | 0% (active allocation with lapsed end date) | Any non-zero count persisting >1 business day |

### Q2 2026 OKRs

**Objective 1: Make WBS the primary tool for staffing decisions**
- KR1.1 — T2C median ≤ 30s by end of Q2
- KR1.2 — Directory filter usage rate ≥60%
- KR1.3 — ≥80% WAU-Admin weekly

**Objective 2: Establish trustworthy, current skill data**
- KR2.1 — 80% of profiles updated within 90 days
- KR2.2 — Staleness nudge achieves ≥40% login conversion within 14 days
- KR2.3 — Skill catalog duplicate rate <5%

**Objective 3: Reduce friction in the allocation workflow**
- KR3.1 — 50% of staffing sessions end with allocation created
- KR3.2 — Median staffing request resolution time ≤2 business days
- KR3.3 — Over-cap attempt rate <5% of allocation creation attempts

**Objective 4: Deliver a reliable platform that earns daily trust**
- KR4.1 — API p95 ≤500ms on `/api/employees` filter endpoint
- KR4.2 — Zero unplanned outages >30 minutes during business hours
- KR4.3 — 0 stale allocations sustained

### Counter-Metrics (Anti-Gaming)

| Counter-Metric | Counters | Target |
|---|---|---|
| Skill Entry Inflation Rate: avg skills added per session | Freshness Rate + Completeness Rate | <4 skills/update-session sustained; flag any session >15 |
| Phantom Allocation Rate: allocations reversed within 48h | Workflow Completion Rate | <3% of created allocations reversed within 48h |
| IC Session Bounce Rate: post-nudge login with <30s session, no skill change | Login Rate + Update Completion | <20% of nudge-triggered logins are immediate bounces |

### Instrumentation Requirements

| Requirement | Priority |
|---|---|
| Client-side analytics event emitter (`filter_applied`, `allocation_created`, `skill_updated`, session duration, nudge-login source) | High |
| Server-side request timing middleware (p95 per endpoint) | High |
| Email delivery webhook handler (delivery/bounce rates) | Medium |
| Scheduled DB health check queries (stale allocations, freshness rate, catalog duplicates) | Medium |
| Admin analytics dashboard surface | Low (start with ad-hoc queries) |

---

## 7. Design Brief

### Problem Statement

Resource Managers operating mid-scale technical teams are making staffing decisions from stale spreadsheets, fragmented Slack threads, and incomplete skill records — introducing planning risk that surfaces as sprint-blocking conflicts, not calendar warnings. WBS surfaces allocation state but does not surface availability projections, skill freshness signals, or structured intake workflows, forcing practitioners to fill those gaps with manual workarounds. The result is a system that is trusted for storage but bypassed for decisions.

### Design Challenge

> How might we transform WBS from a passive allocation record into an active planning surface — one that earns daily opens by surfacing forward-looking signal, keeping skill data fresh without burdening the people who own it, and giving every role exactly the decision-relevant context they need, no more?

### Target Users

| User | Role | Core Need |
|---|---|---|
| Resource Manager | Primary operator | Live, queryable availability map + structured intake channel |
| Individual Contributor | Data owner | Self-serve profile editing + meaningful confirmation feedback |
| Project Manager | Consumer (Phase 3) | Read-only project staffing view + structured request submission |
| HR Admin | Catalog steward | Merge/dedup tooling + data quality instrumentation |

### Success Criteria

| Criterion | Metric | Target |
|---|---|---|
| Staffing decisions happen faster | T2C median | ≤30 seconds |
| Admins use the system daily | WAU-Admin | ≥80% |
| Skill data stays current | Skill freshness rate | ≥80% of profiles within 90 days |
| Nudge emails convert | Email-to-login conversion | ≥40% |
| Sessions result in allocations | Staffing sessions → allocation | ≥50% |
| System remains performant | p95 API response | ≤500ms |

### Constraints

- **No enterprise-scale complexity** — solutions requiring dedicated admin maintenance overhead work against adoption
- **Role boundaries are architectural** — admin/employee/read-only tier split is a trust model, not a cosmetic permission layer
- **100% cap is non-negotiable** — visible before, during, and after assignment; never defeatable
- **Backend performance envelope** — new views drawing on forward projection data must stay within p95 ≤500ms budget

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Catalog fragmentation degrades search faster than dedup ships | High | High | Surface freshness signals + zero-result feedback in Phase 3; dedup guardrail in Phase 4 |
| IC self-serve editing introduces taxonomy drift | Medium | High | Constrain skill entry to catalog-backed autocomplete; free-text flows to admin review queue |
| PM structured intake adds friction → PMs return to Slack | Medium | High | Guided form, not a ticket system; PM-facing language must be non-technical |
| Forward projection trusted before accuracy validated | Low | High | Label projection surfaces with confidence window until baseline validated |
| Nudge frequency triggers unsubscribes | Medium | Medium | Single nudge per 90-day window; include one-click "mark as current" in email |

### Recommended Design Direction

**Information architecture:** Skill filter graduates from refinement tool to primary decision instrument. Forward availability becomes first-class alongside current allocation — every employee card answers "available when?" not just "available now."

**Visual language:** Temporal context is mandatory at every allocation surface. The 100% cap is communicated through a progressive visual system (capacity bars that shift color at 80/90/100%), not a validator that fires at submission. Destructive actions require deliberate confirmation; recoverable actions are fast and forgiving.

**Role-scoped interfaces:** Each interface tier is designed for its user's job, not permission-stripped from a single view:
- Admin/RM: full allocation tooling, forward projection, structured intake review, catalog governance
- IC (`/me`): profile ownership, skill self-edit, assignment visibility, feedback confirmation
- PM/External (share link): project-scoped read-only view with structured request entry point

**Data quality as UX:** Staleness is surfaced as signal, not shame. `skillsLastUpdatedAt` drives a visible freshness indicator and triggers the nudge email. The system acts on stale data — the user does not have to police it.

### Phase 3 Scope

**Sprint 3.1 — Quick Wins (2 weeks)**
- #2 Skill freshness signal — `skillsLastUpdatedAt` on cards with 30/60/90d thresholds
- #6 End-date visibility — amber "No end date" flag on open-ended assignments
- #8 Share link expiry — shown at generation and on expired share page
- #12 Allocation form dropdown — enriched with dept + top skills + current utilization

**Sprint 3.2 — IC Autonomy + Notifications (2 weeks)**
- #1 IC self-serve skill editing — inline edit on `/me` skills card with catalog autocomplete
- #4 Assignment confirmation email — Spring Mail trigger on `AllocationService.create()`

**Sprint 3.3 — PM Access Tier (3 weeks)**
- #5 Structured PM staffing request workflow — `UserRole.PM`, intake form, RM fulfillment queue
- #9 Project-scoped share view — extend `share_tokens` table, new public project roster page

**Out of scope for Phase 3:** Candidate comparison view, catalog dedup guardrail, admin trend data, mobile-optimized experience.

### Open Questions

1. When an IC edits a skill already used as a staffing match, does the edit retroactively affect that match record? What is the auditability requirement?
2. What is the agreed taxonomy governance model — who can propose new catalog entries, on what review cadence?
3. What is the confidence window for forward availability data — is the 90-day projection accurate enough to present without a disclaimer surface?
4. Does the PM staffing request require authentication, or is it accessible via the unauthenticated share link surface?
5. What is the ceiling on system-generated emails per user per week before they become noise — is there a notification preference layer in scope?
6. Does the assignment confirmation email require RM approval before sending, or is it automatic on allocation save?
7. Is T2C currently instrumented, or does it require new frontend event tracking to establish a Q2 baseline?

---

*This document represents the complete UX strategy for WBS Phase 3 and beyond. Strategy owner should review open questions and update the design brief before sprint planning begins.*

*Produced by `/ux-strategy:strategize` — March 25, 2026*
