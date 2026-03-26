# Workforce Allocation System — User Research Discovery
**Date:** 2026-03-25
**Method:** Codebase-derived research (no live interviews) — inferred from role definitions, authorization matrix, feature set, and UI flows
**Artifacts:** 4 User Personas · 1 Empathy Map · 1 Journey Map · Affinity Diagram · JTBD Mapping

---

## 1. User Personas

### Persona Priority

| Priority | Persona | Reason |
|---|---|---|
| **1 — Primary** | 박지영 (Resource Manager Admin) | Highest frequency, most complex workflows |
| **2** | 최현수 (HR Admin) | Data quality gatekeeper |
| **3** | 이민준 (Individual Contributor) | Largest user group by headcount |
| **4** | 김태영 (Project Manager) | High impact; currently has no direct system access |

---

### Persona 1 — 박지영 (Resource Manager Admin) — PRIMARY

**Quote:** *"인력 현황을 한눈에 파악하고 싶어요. 스프레드시트로는 더 이상 안 되겠어요."*

- **Age:** 34 · **Role:** Resource Planning Manager · **Tech:** High
- **Goals:** Find qualified available employees fast; prevent over-allocation; be seen as strategic partner
- **Frustrations:** No skill+availability filter; allocation data is current-state only; stale employee skills; answers PM queries manually via Slack
- **Behaviors:** Checks dashboard 2–3×/day; exports to Excel for leadership; cross-references multiple tabs manually
- **Key Design Need:** Skill + availability multi-filter in directory; forward-looking availability projection; automated notifications

---

### Persona 2 — 최현수 (HR Admin)

**Quote:** *"데이터가 정확해야 신뢰를 얻죠."*

- **Age:** 41 · **Role:** HR Manager / People Ops · **Tech:** Medium
- **Goals:** Accurate employee records; clean skill catalog; smooth onboarding/offboarding
- **Frustrations:** Skill catalog duplicates ("React.js" vs "ReactJS"); inconsistent proficiency self-reporting; unclear deactivate vs delete
- **Key Design Need:** Skill merge/rename tools; proficiency level definitions; clear destructive action UI

---

### Persona 3 — 이민준 (Individual Contributor)

**Quote:** *"내 스킬을 정확하게 등록해두면 좋은 프로젝트에 배정될 수 있지 않을까요?"*

- **Age:** 28 · **Role:** Frontend Developer · **Tech:** High
- **Goals:** Keep skill profile current; be discovered for interesting projects
- **Frustrations:** No external nudge to update; proficiency levels are ambiguous; no feedback that updates matter
- **Behaviors:** Updates skills ~1–2×/year; visits app less than 3 min/session
- **Key Design Need:** Email nudges; proficiency definitions; immediate confirmation on skill update

---

### Persona 4 — 김태영 (Project Manager)

**Quote:** *"필요한 사람을 제때 구하지 못하면 일정이 밀려요."*

- **Age:** 36 · **Role:** Project Manager · **Tech:** Medium-High
- **Goals:** Confirm team availability before committing to timelines; self-serve resource queries
- **Frustrations:** No system access — must ask Resource Manager for everything; slow Slack-based request cycle; no notification when team members are pulled
- **Key Design Need:** PM read-only access tier with skill+availability filter; structured allocation request workflow; change notifications

---

## 2. Empathy Map — 박지영 (Primary Persona)

| Quadrant | Key Points |
|---|---|
| **Says** | "Who's available next month with React skills?" · "The data is only as good as what people put in." · "I found out he was at 110% after the sprint started." |
| **Thinks** | "If I miss an over-allocation, it's my fault when the project fails." · "Employees never update their skills." · "The dashboard looks good to leadership, but the underlying data is stale." |
| **Does** | Opens dashboard every morning · Cross-references Excel + system simultaneously · Sends Slack messages to chase skill updates · Screenshots dashboard for PMs |
| **Feels** | Anxious (stale data) · Frustrated (reactive workflows) · Proud (catching conflicts early) · Overwhelmed (multiple PM queries at once) |

**Core Insight:** She needs to *trust* the system. Every stale data point erodes confidence and drives her back to spreadsheets. Data freshness indicators and proactive alerts would fundamentally change her relationship with the tool.

---

## 3. Journey Map — "Staff a New Project Phase"

| Stage | Emotion | Top Pain | Top Opportunity |
|---|---|---|---|
| 1. Receive Request | 😐 Neutral | Unstructured Slack intake | Structured PM request form |
| 2. Scout Candidates | 😟 Frustrated | No skill filter — 5-tab browsing | Skill + allocation % filter in directory |
| 3. Check Allocation | 😤 Stressed | Current % only, manual date math | Forward availability projection |
| 4. Negotiate | 😐 Resigned | All via Slack, no record | In-system allocation proposal workflow |
| 5. Create Record | 😊 Relieved | One-at-a-time form, no bulk | Bulk allocation creation |
| 6. Confirm | 😌 Satisfied | Manual Slack notification to employee | Automated assignment notification |

**Emotional Curve:** Starts neutral → crashes at scouting and allocation check → recovers at creation (system works!) → closes satisfied but fragile.

**Moments of Truth:**
1. Directory skill search — if broken, she abandons the system
2. Forward availability — if unavailable, she makes bad proposals and erodes PM trust
3. Conflict detection — the one place the system protects her (must remain reliable)
4. Employee notification — if still via Slack, the system remains a filing cabinet

---

## 4. Five Master Themes (Synthesis)

### Theme 1 — The Discovery Problem Is the Product Problem
The directory is the most-used and most broken screen. No skill filter, no availability projection, no comparison view. Users compensate with Excel and browser tabs. Until this is fixed, the system cannot be the primary tool for its own core use case.

### Theme 2 — The System Lives Outside the Workflow
Slack is hired for requests, negotiations, confirmations, and notifications. The app is hired only for recording. Notifications and intake forms are the mechanism by which the system earns relevance.

### Theme 3 — Data Quality Is a System Responsibility, Not a User Responsibility
Users don't maintain their own data — not because they're irresponsible, but because there's no prompt, no incentive, and no feedback loop. Treat data staleness as a product defect, not a user behavior problem.

### Theme 4 — Proactive Protection Exists in One Place and Should Exist Everywhere
Conflict detection at 100% is the system's highest-value feature. This pattern should extend to: 80/90% soft alerts, expiring allocations, stale skills, and PM change notifications.

### Theme 5 — Stakeholder Access Mismatch Creates a Human Bottleneck
The Resource Manager is a human API for PMs and leadership. A PM read-only access tier eliminates the most common category of Admin interruptions.

---

## 5. Prioritized Design Roadmap

### Phase 1 — Now

| Feature | Theme | Effort |
|---|---|---|
| Skill filter in employee directory (multi-select skill + proficiency + allocation %) | 1 | Medium |
| Allocation % + top skills on EmployeeCard in directory list | 1 | Low |
| Automated email notification to employee + team lead on allocation creation | 2 | Low |
| Soft alerts at 80% and 90% allocation on admin dashboard | 4 | Low |
| Proficiency level definitions (tooltip at skill entry) | 3 | Low |

### Phase 2 — Soon

| Feature | Theme | Effort |
|---|---|---|
| Forward availability projection on employee profile ("Available X% from [date]") | 1 | Medium-High |
| Skill staleness nudge emails (90-day inactivity trigger) | 3 | Medium |
| Skill catalog management — merge/rename duplicate skills | 3 | Medium |
| Shareable allocation view link for PMs | 2 | Low |
| Allocation % preview before save (show new total) | 4 | Low |
| Clear deactivation modal distinguishing soft vs permanent delete | 5 | Low |

### Phase 3 — Later

| Feature | Theme | Effort |
|---|---|---|
| PM read-only access tier (skill filter + availability + project team view) | 5 | High |
| Structured staffing request workflow (PM submits → queue → admin fulfills) | 2 | High |
| Bulk allocation creation (multi-employee, one form) | 1 | Medium |
| Allocation timeline view (mini Gantt per employee, 60-day horizon) | 1 | High |
| Change notification to PM when team member allocation is modified | 2 | Medium |

---

## 6. Research Gaps to Validate

1. Actual allocation check frequency (daily vs weekly?)
2. Skill self-reporting accuracy in practice (how often do employees over-rate?)
3. Whether there is an existing spreadsheet being replaced (adoption risk)
4. Current PM system access level (none, or something informal?)
5. Mobile usage patterns (desktop-only assumed)
6. Korean language nuances in skill catalog naming conventions
7. How escalation of allocation conflicts currently works

---

*Generated by Claude Code design-research:discover skill · 2026-03-25*
