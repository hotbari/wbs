# Workforce Allocation System — Design Spec

**Date:** 2026-03-20
**Status:** Approved
**Scope:** Sub-project 1 of 2 (Project Management is sub-project 2)

> **Conventions:** `?` after a field name means optional/nullable. All JSON field names use camelCase. DB column names use snake_case.

---

## 1. Overview

An internal web platform for a ~100-person company to manage an employee directory, track skills and qualifications, and plan resource allocation across projects. Employees can view the directory and edit their own profiles. Admins manage project assignments and employee records.

---

## 2. Tech Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Frontend     | Next.js 14 (App Router), TypeScript/TSX, React  |
| Backend      | Spring Boot 3.x, Kotlin, JDK 17                 |
| Database     | PostgreSQL                                      |
| Auth         | Username/password + JWT (HttpOnly cookies)      |
| Data layer   | JPA / Hibernate                                 |
| Client cache | TanStack Query (React Query)                    |

> **Note:** Spring Boot 3.x requires JDK 17+. JDK 11 is not supported.

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Browser                                                 │
│  Next.js 14 (App Router, TypeScript/TSX)                │
│  - Employee Directory pages                             │
│  - Profile pages (self-edit)                            │
│  - Admin dashboard (assignments, availability)          │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS / REST + JWT
┌────────────────────▼────────────────────────────────────┐
│  Spring Boot 3.x + Kotlin + JDK 17                      │
│  - Auth API  (/api/auth/*)                              │
│  - Employee API  (/api/employees/*)                     │
│  - Skills API  (/api/skills/*)                          │
│  - Allocation API  (/api/allocations/*)                 │
│  - Admin API  (/api/admin/*)                            │
└────────────────────┬────────────────────────────────────┘
                     │ JPA / Hibernate
┌────────────────────▼────────────────────────────────────┐
│  PostgreSQL                                             │
│  users, employees, skills, employee_skills,             │
│  project_assignments, refresh_tokens                    │
└─────────────────────────────────────────────────────────┘
```

- Next.js uses App Router with server components for initial data fetch; client components for interactive UI
- Spring Boot exposes a stateless REST API
- JWT access tokens (15 min expiry) + refresh tokens (7 days) stored in HttpOnly cookies
- CORS configured with `allowCredentials = true`; allowed origin is environment-variable-driven (`CORS_ALLOWED_ORIGIN`)

---

## 4. Authentication & Token Lifecycle

### Login Flow
`POST /api/auth/login` validates credentials. If `is_active = false` on the user, returns `403 Forbidden` (distinct from `401` wrong credentials). On success, issues:
- JWT access token (15 min) in response body
- Refresh token (7 days) in `Set-Cookie: refreshToken` HttpOnly cookie

### Refresh Token Strategy
- Refresh tokens are **single-use with rotation**: each use issues a new refresh token and invalidates the old one
- Refresh tokens are **stored server-side** in the `refresh_tokens` table (hashed with bcrypt — enables revocation)
- **Reuse detection:** if a token is used after already being rotated, all refresh tokens for that user are immediately revoked (full family invalidation — theft mitigation). The response is `401`; user must re-login
- On `POST /api/auth/logout`: all refresh tokens for the user are revoked and the cookie is cleared
- Concurrent refresh: second request using an already-rotated token triggers reuse detection → full revocation → 401

### `refresh_tokens` table
| Column     | Type         | Notes                              |
|------------|--------------|------------------------------------|
| id         | UUID (PK)    |                                    |
| user_id    | UUID (FK)    | references `users.id`, NOT NULL    |
| token_hash | VARCHAR(255) | bcrypt hash of raw token, NOT NULL |
| expires_at | TIMESTAMP    | NOT NULL                           |
| revoked    | BOOLEAN      | NOT NULL, default false            |
| created_at | TIMESTAMP    | NOT NULL, default now()            |

---

## 5. Data Model

### `users` — login credentials + role
| Column        | Type         | Notes                                        |
|---------------|--------------|----------------------------------------------|
| id            | UUID (PK)    |                                              |
| email         | VARCHAR(255) | unique, NOT NULL                             |
| password_hash | VARCHAR(255) | bcrypt, NOT NULL                             |
| role          | ENUM         | `ADMIN`, `EMPLOYEE`, NOT NULL                |
| employee_id   | UUID (FK)    | references `employees.id`, unique, NOT NULL  |
| is_active     | BOOLEAN      | NOT NULL, default true                       |
| created_at    | TIMESTAMP    | NOT NULL, default now()                      |

**Relationship:** Every `user` has exactly one `employee` record (1:1). `POST /api/employees` creates both in a single `@Transactional` service call — if either insert fails, both are rolled back. The `password` field is **required** in the create request; there is no employee record without a user account.

### `employees` — HR profile data
| Column          | Type         | Notes                                         |
|-----------------|--------------|-----------------------------------------------|
| id              | UUID (PK)    |                                               |
| full_name       | VARCHAR(255) | NOT NULL                                      |
| email           | VARCHAR(255) | NOT NULL                                      |
| phone           | VARCHAR(20)  | nullable                                      |
| department      | VARCHAR(100) | NOT NULL                                      |
| team            | VARCHAR(100) | nullable                                      |
| job_title       | VARCHAR(100) | NOT NULL                                      |
| grade           | VARCHAR(50)  | nullable                                      |
| employment_type | ENUM         | `FULL_TIME`, `CONTRACT`, `PART_TIME`, NOT NULL |
| hired_at        | DATE         | NOT NULL                                      |
| is_active       | BOOLEAN      | NOT NULL, default true                        |

**Soft delete:** `DELETE /api/employees/{id}` sets `employees.is_active = false`, sets `users.is_active = false` (disabling login), and sets `is_active = false` on all active `project_assignments` for that employee — all in one transaction. List endpoints exclude inactive employees by default.

### `skills` — master skill catalog
| Column      | Type         | Notes                                |
|-------------|--------------|--------------------------------------|
| id          | UUID (PK)    |                                      |
| name        | VARCHAR(100) | unique, NOT NULL                     |
| category    | VARCHAR(100) | NOT NULL                             |
| description | TEXT         | nullable                             |

### `employee_skills` — skills per employee
| Column      | Type      | Notes                                            |
|-------------|-----------|--------------------------------------------------|
| id          | UUID (PK) |                                                  |
| employee_id | UUID (FK) | references `employees.id`, NOT NULL              |
| skill_id    | UUID (FK) | references `skills.id`, NOT NULL                 |
| proficiency | ENUM      | `BEGINNER`, `INTERMEDIATE`, `EXPERT`, NOT NULL   |
| certified   | BOOLEAN   | NOT NULL, default false                          |
| note        | TEXT      | nullable                                         |

Unique constraint: `(employee_id, skill_id)`.

### `project_assignments` — resource allocation
| Column             | Type         | Notes                                                |
|--------------------|--------------|------------------------------------------------------|
| id                 | UUID (PK)    |                                                      |
| employee_id        | UUID (FK)    | references `employees.id`, NOT NULL                  |
| project_name       | VARCHAR(255) | free-text (no FK; projects table is sub-project 2)   |
| role_in_project    | VARCHAR(100) | NOT NULL                                             |
| allocation_percent | INTEGER      | NOT NULL, CHECK (allocation_percent BETWEEN 1 AND 100) |
| start_date         | DATE         | NOT NULL                                             |
| end_date           | DATE         | nullable (null = ongoing), CHECK (end_date > start_date) |
| is_active          | BOOLEAN      | NOT NULL, default true                               |

**Date range overlap definition:** An assignment is considered active on a given date `D` if:
- `is_active = true`, AND
- `start_date <= D`, AND
- `end_date IS NULL OR end_date >= D`

NULL `end_date` means the assignment is ongoing with no planned end.

**`totalAllocationPercent` computation:** Sum of `allocation_percent` for all assignments where `is_active = true AND start_date <= TODAY AND (end_date IS NULL OR end_date >= TODAY)`. This is the "as of today" allocation.

**Allocation cap enforcement (100% rule):**
- Enforced at the **application service layer**
- All writes to `project_assignments` (insert and update) execute within a `SERIALIZABLE` transaction
- Before inserting/updating, the service reads the employee's current total allocation for overlapping date ranges using `SELECT ... FOR UPDATE` to lock those rows
- If the new total would exceed 100%, the transaction is aborted and `409 Conflict` is returned
- `SERIALIZABLE` isolation prevents two concurrent transactions from both passing the cap check simultaneously

---

## 6. Input Validation Rules

| Field              | Rule                                                                     |
|--------------------|--------------------------------------------------------------------------|
| email              | Valid RFC 5322 format, max 255 chars, unique                             |
| password           | Required; min 8 chars, at least 1 uppercase letter, at least 1 digit    |
| fullName           | Required; 1–255 chars                                                    |
| phone              | Optional; if provided: digits, spaces, `+`, `-`, `(`, `)` only; min 7 chars, max 20 chars |
| department         | Required; 1–100 chars                                                    |
| jobTitle           | Required; 1–100 chars                                                    |
| allocationPercent  | Required; integer 1–100                                                  |
| startDate          | Required; valid ISO date                                                 |
| endDate            | Optional; must be strictly after `startDate` if provided                 |
| skill name         | Required; 1–100 chars, unique                                            |

All validation errors return `400 Bad Request`:
```json
{ "errors": [{ "field": "email", "message": "Invalid email format" }] }
```

---

## 7. API Endpoints

### Common Response Conventions
- `200 OK` (GET, PATCH), `201 Created` (POST), `204 No Content` (DELETE/logout)
- Pagination envelope: `{ "data": [...], "page": 1, "pageSize": 20, "total": 95 }`
- Error codes: `400` validation, `401` unauthenticated/token invalid, `403` unauthorized or account deactivated, `404` not found, `409` conflict

### Auth
```
POST /api/auth/login
  Body: { email, password }
  200: { accessToken, user: { id, email, role, employeeId } }
  401: wrong credentials
  403: account deactivated (is_active=false)

POST /api/auth/refresh
  Cookie: refreshToken
  200: { accessToken }  (new refreshToken set in cookie)
  401: token expired, revoked, or reuse detected (triggers full family revocation)

POST /api/auth/logout
  Cookie: refreshToken
  204: all refresh tokens for user revoked, cookie cleared
```

### Admin Dashboard
```
GET /api/admin/dashboard
  Auth: ADMIN
  200: {
    totalActiveEmployees: number,
    avgAllocationPercent: number,         // avg totalAllocationPercent across active employees
    availableEmployees: EmployeeSummary[], // available >= 50% in next 30 days
    topOverAllocated: EmployeeSummary[]   // top 5 by totalAllocationPercent desc
  }
```

### Employees

**Employee-editable fields** (via PATCH by own user): `phone`, `team`, `grade`
**Admin-only fields** (via PATCH by ADMIN): `fullName`, `email`, `department`, `jobTitle`, `employmentType`, `hiredAt`, `isActive`

```
GET /api/employees?page&pageSize&search&department&employmentType&isActive
  Auth: any authenticated
  200: { data: EmployeeSummary[], page, pageSize, total }
  EmployeeSummary: { id, fullName, email, department, team, jobTitle,
                     employmentType, totalAllocationPercent }

GET /api/employees/available?minAvailablePercent&fromDate&toDate&page&pageSize
  Auth: any authenticated
  200: paginated EmployeeSummary where (100 - totalAllocationPercent) >= minAvailablePercent
       and no active assignment covers the full fromDate–toDate range at 100% capacity
  Note: NULL end_date assignments are treated as ongoing

GET /api/employees/{id}
  Auth: any authenticated
  200: EmployeeDetail { ...all employee fields, skills: EmployeeSkill[], assignments: Allocation[] }
  404: not found

POST /api/employees
  Auth: ADMIN
  Body: { fullName, email, password, phone?, department, team?, jobTitle,
          grade?, employmentType, hiredAt }
  Creates employee + user account atomically (@Transactional). Rolls back both on any failure.
  201: EmployeeDetail
  409: email already in use

PATCH /api/employees/{id}
  Auth: own user (employee-editable fields only) | ADMIN (all fields)
  Body: partial — only fields listed in respective allowed set above
  200: updated EmployeeDetail
  403: employee attempting to edit another's profile or an admin-only field

DELETE /api/employees/{id}
  Auth: ADMIN
  204: soft-deactivates employee + their active assignments + their user account (single transaction)
  404: not found
```

### Skills
```
GET /api/skills?category
  Auth: any authenticated
  200: SkillSummary[] { id, name, category }

GET /api/skills/{id}
  Auth: any authenticated
  200: Skill { id, name, category, description }
  404: not found

POST /api/skills
  Auth: ADMIN
  Body: { name, category, description? }
  201: Skill
  409: name already exists

PATCH /api/skills/{id}
  Auth: ADMIN
  Body: { name?, category?, description? }
  200: updated Skill
  409: name conflict

DELETE /api/skills/{id}
  Auth: ADMIN
  204: hard delete (safe only if no employee_skills reference it — validated before delete)
  409: skill is in use by one or more employees (cannot delete)

GET /api/employees/{id}/skills
  Auth: any authenticated
  200: EmployeeSkill[] { id, skill: { id, name, category }, proficiency, certified, note }

POST /api/employees/{id}/skills
  Auth: own user | ADMIN
  Body: { skillId, proficiency, certified?, note? }
  201: EmployeeSkill
  409: skill already assigned to this employee

PATCH /api/employees/{id}/skills/{skillId}
  Auth: own user | ADMIN
  Body: { proficiency?, certified?, note? }
  200: updated EmployeeSkill

DELETE /api/employees/{id}/skills/{skillId}
  Auth: own user | ADMIN
  204: removed
```

### Allocations
```
GET /api/allocations?employeeId&projectName&isActive&page&pageSize
  Auth: ADMIN
  200: paginated AllocationSummary[]

GET /api/employees/{id}/allocations
  Auth: own user | ADMIN
  200: Allocation[] { id, projectName, roleInProject, allocationPercent,
                      startDate, endDate, isActive }

POST /api/allocations
  Auth: ADMIN
  Body: { employeeId, projectName, roleInProject, allocationPercent, startDate, endDate? }
  Runs in SERIALIZABLE transaction with SELECT FOR UPDATE on employee's active assignments.
  201: Allocation
  409: would exceed 100% total allocation for this employee on overlapping date range

PATCH /api/allocations/{id}
  Auth: ADMIN
  Body: { allocationPercent?, startDate?, endDate?, isActive? }
  Runs in SERIALIZABLE transaction with SELECT FOR UPDATE.
  200: updated Allocation
  409: would exceed 100%

DELETE /api/allocations/{id}
  Auth: ADMIN
  Soft delete: sets is_active=false (preserves audit history). Hard delete is not supported.
  204: allocation deactivated
  404: not found
```

---

## 8. Frontend Pages & Components

### Pages (Next.js App Router)
| Route                         | Description                                               | Access   |
|-------------------------------|-----------------------------------------------------------|----------|
| `/login`                      | Login form                                                | Public   |
| `/dashboard`                  | Headcount, avg utilization, available >50%, over-allocated | Admin   |
| `/employees`                  | Directory with search + filters                           | All      |
| `/employees/[id]`             | Profile + skills + assignments (read-only for others)     | All      |
| `/employees/[id]/edit`        | Self-edit: phone, team, grade, skills                     | Own user |
| `/admin/employees/new`        | Create employee + user account                            | Admin    |
| `/admin/employees/[id]/edit`  | Full employee edit (all fields)                           | Admin    |
| `/admin/allocations`          | View/create/edit/deactivate project assignments           | Admin    |
| `/admin/skills`               | View/create/edit/delete master skill list                 | Admin    |

### Key UI Components
| Component            | Purpose                                               |
|----------------------|-------------------------------------------------------|
| `EmployeeCard`       | Avatar, name, title, department, allocation badge     |
| `SkillBadge`         | Skill name + proficiency (color-coded)                |
| `AllocationBar`      | Visual % bar of total allocation per employee         |
| `AvailabilityFilter` | Date range picker + min-available-% slider            |
| `AdminGuard`         | Wraps admin-only routes, redirects non-admins         |

### State Management
- Server components fetch initial data (no loading spinner on first paint)
- TanStack Query for client-side mutations and cache invalidation
- No global state library needed at this scale

---

## 9. Authorization Rules

| Action                              | EMPLOYEE (own) | EMPLOYEE (others) | ADMIN |
|-------------------------------------|---------------|-------------------|-------|
| View employee directory             | ✅            | ✅                | ✅    |
| View any employee detail            | ✅            | ✅                | ✅    |
| Edit own profile (phone/team/grade) | ✅            | ❌                | ✅    |
| Edit own skills                     | ✅            | ❌                | ✅    |
| Edit admin-only employee fields     | ❌            | ❌                | ✅    |
| Create / deactivate employees       | ❌            | ❌                | ✅    |
| Manage project assignments          | ❌            | ❌                | ✅    |
| View master skill list              | ✅            | ✅                | ✅    |
| Create / edit / delete skills       | ❌            | ❌                | ✅    |
| View admin dashboard                | ❌            | ❌                | ✅    |

---

## 10. Out of Scope (Sub-project 1)

The following are deferred to sub-project 2 (Project Management):
- WBS / task management
- Weekly phase management
- Progress tracking
- Task comments and threading
- Active task sidebar
- Projects table (`project_assignments` uses free-text `project_name` until sub-project 2)
