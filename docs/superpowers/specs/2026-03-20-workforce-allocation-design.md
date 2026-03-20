# Workforce Allocation System — Design Spec

**Date:** 2026-03-20
**Status:** Approved
**Scope:** Sub-project 1 of 2 (Project Management is sub-project 2)

---

## 1. Overview

An internal web platform for a ~100-person company to manage an employee directory, track skills and qualifications, and plan resource allocation across projects. Employees can view the directory and edit their own profiles. Admins manage project assignments and employee records.

---

## 2. Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | Next.js 14 (App Router), TypeScript/TSX, React  |
| Backend    | Spring Boot 3.x, Kotlin, JDK 17                 |
| Database   | PostgreSQL                                      |
| Auth       | Username/password + JWT (HttpOnly cookies)      |
| Data layer | JPA / Hibernate                                 |
| Client cache | TanStack Query (React Query)                  |

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
└────────────────────┬────────────────────────────────────┘
                     │ JPA / Hibernate
┌────────────────────▼────────────────────────────────────┐
│  PostgreSQL                                             │
│  employees, skills, project_assignments, users          │
└─────────────────────────────────────────────────────────┘
```

- Next.js uses App Router with server components for initial data fetch; client components for interactive UI
- Spring Boot exposes a stateless REST API
- JWT access tokens (15 min expiry) + refresh tokens (7 days) stored in HttpOnly cookies
- CORS restricted to the Next.js origin

---

## 4. Data Model

### `users`
| Column        | Type      | Notes                        |
|---------------|-----------|------------------------------|
| id            | UUID (PK) |                              |
| email         | VARCHAR   | unique, used for login       |
| password_hash | VARCHAR   | bcrypt                       |
| role          | ENUM      | `ADMIN`, `EMPLOYEE`          |
| employee_id   | UUID (FK) | links to employees table     |
| created_at    | TIMESTAMP |                              |

### `employees`
| Column          | Type      | Notes                                        |
|-----------------|-----------|----------------------------------------------|
| id              | UUID (PK) |                                              |
| full_name       | VARCHAR   |                                              |
| email           | VARCHAR   |                                              |
| phone           | VARCHAR   |                                              |
| department      | VARCHAR   |                                              |
| team            | VARCHAR   |                                              |
| job_title       | VARCHAR   |                                              |
| grade           | VARCHAR   |                                              |
| employment_type | ENUM      | `FULL_TIME`, `CONTRACT`, `PART_TIME`         |
| hired_at        | DATE      |                                              |
| is_active       | BOOLEAN   | soft delete flag                             |

### `skills`
| Column      | Type      | Notes                                    |
|-------------|-----------|------------------------------------------|
| id          | UUID (PK) |                                          |
| name        | VARCHAR   | unique                                   |
| category    | VARCHAR   | e.g. "Backend", "Frontend", "DevOps"     |
| description | TEXT      | optional                                 |

### `employee_skills`
| Column      | Type      | Notes                                            |
|-------------|-----------|--------------------------------------------------|
| id          | UUID (PK) |                                                  |
| employee_id | UUID (FK) |                                                  |
| skill_id    | UUID (FK) |                                                  |
| proficiency | ENUM      | `BEGINNER`, `INTERMEDIATE`, `EXPERT`             |
| certified   | BOOLEAN   |                                                  |
| note        | TEXT      | optional                                         |

### `project_assignments`
| Column             | Type      | Notes                                  |
|--------------------|-----------|----------------------------------------|
| id                 | UUID (PK) |                                        |
| employee_id        | UUID (FK) |                                        |
| project_name       | VARCHAR   |                                        |
| role_in_project    | VARCHAR   |                                        |
| allocation_percent | INTEGER   | 0–100; sum across active rows ≤ 100    |
| start_date         | DATE      |                                        |
| end_date           | DATE      | null = ongoing                         |
| is_active          | BOOLEAN   |                                        |

**Rules:**
- One employee can have multiple concurrent assignments; total `allocation_percent` must not exceed 100%
- `end_date` null means ongoing; used for date-based availability queries
- Admins manage `project_assignments`; employees manage their own `employee_skills` and profile fields

---

## 5. API Endpoints

### Auth
```
POST /api/auth/login     → issue JWT + refresh token (HttpOnly cookie)
POST /api/auth/refresh   → issue new access token
POST /api/auth/logout    → clear cookies
```

### Employees
```
GET    /api/employees              → paginated directory (search, filter)
GET    /api/employees/{id}         → employee detail
POST   /api/employees              → create employee [Admin]
PATCH  /api/employees/{id}         → update profile fields
DELETE /api/employees/{id}         → soft deactivate [Admin]
GET    /api/employees/available    → filter by allocation % + date range
```

### Skills
```
GET    /api/skills                            → master skill list
POST   /api/skills                            → create skill [Admin]
GET    /api/employees/{id}/skills             → employee's skills
POST   /api/employees/{id}/skills             → add skill to employee
PATCH  /api/employees/{id}/skills/{skillId}   → update proficiency
DELETE /api/employees/{id}/skills/{skillId}   → remove skill
```

### Allocations
```
GET    /api/allocations              → all active assignments [Admin]
GET    /api/employees/{id}/allocations → employee's assignments
POST   /api/allocations              → assign to project [Admin]
PATCH  /api/allocations/{id}         → update % or dates [Admin]
DELETE /api/allocations/{id}         → remove assignment [Admin]
```

---

## 6. Frontend Pages & Components

### Pages (Next.js App Router)
| Route                      | Description                                  | Access    |
|----------------------------|----------------------------------------------|-----------|
| `/login`                   | Login form                                   | Public    |
| `/dashboard`               | Overview stats (headcount, utilization)       | Admin     |
| `/employees`               | Directory list (search, filter)              | All       |
| `/employees/[id]`          | Employee detail: profile + skills + assignments | All    |
| `/employees/[id]/edit`     | Self-edit profile                            | Own user  |
| `/admin/employees/new`     | Create new employee                          | Admin     |
| `/admin/allocations`       | Manage project assignments                   | Admin     |
| `/admin/skills`            | Manage master skill list                     | Admin     |

### Key UI Components
| Component          | Purpose                                               |
|--------------------|-------------------------------------------------------|
| `EmployeeCard`     | Avatar, name, title, department, allocation badge     |
| `SkillBadge`       | Skill name + proficiency level (color-coded)          |
| `AllocationBar`    | Visual % bar showing total allocation per employee    |
| `AvailabilityFilter` | Date range picker + min-available-% slider          |
| `AdminGuard`       | Wraps admin-only routes, redirects non-admins         |

### State Management
- Server components fetch initial data (no loading spinner on first paint)
- TanStack Query for client-side data fetching and cache invalidation
- No global state library needed at this scale

---

## 7. Authorization Rules

| Action                        | EMPLOYEE         | ADMIN |
|-------------------------------|------------------|-------|
| View employee directory       | ✅               | ✅    |
| Edit own profile/skills       | ✅               | ✅    |
| Edit other employee profiles  | ❌               | ✅    |
| Create / deactivate employees | ❌               | ✅    |
| Manage project assignments    | ❌               | ✅    |
| Manage master skill list      | ❌               | ✅    |
| View admin dashboard          | ❌               | ✅    |

---

## 8. Out of Scope (Sub-project 1)

The following are deferred to sub-project 2 (Project Management):
- WBS / task management
- Weekly phase management
- Progress tracking
- Task comments and threading
- Active task sidebar
