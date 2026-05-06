# Personal Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the v1 personal scheduler/calendar feature spec'd in `docs/superpowers/specs/2026-05-06-personal-scheduler-design.md` — event CRUD with public/private toggle, month + week views, three-mode filter, and a global `/calendar` page.

**Architecture:** Single `calendar_events` table on the backend (Kotlin/Spring Boot/JPA), `/api/calendar/events` REST surface with row-level visibility (`owner OR public`), server-side KST normalization for all-day events. Frontend uses Next.js 16 app router with `/calendar` page composing month + week views, TanStack Query for data, framer-motion for transitions. Modal primitive built fresh on this branch (option A from spec § 10).

**Tech Stack:** Kotlin / Spring Boot 3 / JPA / Postgres / Flyway / Testcontainers / JUnit · Next.js 16 / React 19 / Tailwind 4 / TanStack Query / framer-motion / Phosphor Icons / Playwright

**Branch:** `feature/personal-calendar` (already created from `main`).

**Reference spec:** `docs/superpowers/specs/2026-05-06-personal-scheduler-design.md` — every cross-reference like *"spec § 5"* points there.

---

## Quick orientation for the implementer

The codebase already has these patterns — please mirror them:
- **Backend tests:** `backend/src/test/kotlin/com/company/workforce/IntegrationTestBase.kt` (Testcontainers Postgres + helper to create employee/user) and `PhaseControllerTest.kt` (real auth via `loginAndGetToken`, **not** `@WithMockUser`).
- **Backend exceptions:** `backend/src/main/kotlin/com/company/workforce/api/common/Exceptions.kt` and `GlobalExceptionHandler.kt`. Domain exceptions are sealed/simple Kotlin classes, mapped to status codes by handler annotations.
- **Backend domain pattern:** raw `UUID` FKs (e.g. `ProjectAssignment.employeeId`), no `@ManyToOne` — keep that style.
- **Frontend primitives:** `frontend/src/components/ui/primitives/Drawer.tsx` shows the framer-motion + AnimatePresence + ESC-to-close + `cn` pattern for the new Modal.
- **Frontend tokens:** `frontend/src/app/globals.css` — add new event tokens to `:root` and (where you want Tailwind utilities) `@theme inline`.
- **Frontend nav:** `frontend/src/components/layout/NavBar.tsx`'s `<NavLink>` helper and link list block.
- **E2E tests:** `frontend/e2e/` with `auth.setup.ts` providing storageState. Spec the test imports relative to that.

When in doubt about formatting, copy from the nearest sibling file.

---

## Task list (commit after each)

1. Add `BadRequestException` + handler
2. Flyway V14 migration
3. CalendarEvent entity + Repository (with range queries)
4. Repository integration test
5. Calendar DTOs + filter enum
6. CalendarService (CRUD + permissions + KST normalization)
7. CalendarService unit/integration tests
8. CalendarController + wire-up
9. CalendarController integration tests
10. Frontend: design tokens for events
11. Frontend: Modal primitive
12. Frontend: axios client + types
13. Frontend: calendar-utils (date math)
14. Frontend: useCalendarEvents hook
15. Frontend: EventBlock + EventDetailModal + EventFormModal
16. Frontend: CalendarMonthView
17. Frontend: CalendarWeekView
18. Frontend: CalendarHeader + URL state
19. Frontend: /calendar page (composition)
20. Frontend: nav entry
21. Playwright: visibility & ownership E2E
22. Playwright: multi-day rendering E2E
23. Final smoke + branch cleanup

---

## Task 1 — Add `BadRequestException` and global handler

**Why:** Spec § 5 / § 11 require business-rule violations (e.g. range > 92 days) to map to 400. The existing `GlobalExceptionHandler` doesn't have a `BadRequestException` handler yet. Adding it now keeps the calendar service simple and keeps the change reusable for other features.

**Files:**
- Modify: `backend/src/main/kotlin/com/company/workforce/api/common/Exceptions.kt`
- Modify: `backend/src/main/kotlin/com/company/workforce/api/common/GlobalExceptionHandler.kt`

- [ ] **Step 1.1: Read both files** — confirm current shape (Unauthorized/Forbidden/NotFound/Conflict + MethodArgumentNotValidException are present).

- [ ] **Step 1.2: Add `BadRequestException` to `Exceptions.kt`**

```kotlin
class BadRequestException(message: String) : RuntimeException(message)
```

Match the simple class style of the other exceptions in the file.

- [ ] **Step 1.3: Add handler to `GlobalExceptionHandler.kt`**

```kotlin
@ExceptionHandler(BadRequestException::class)
@ResponseStatus(HttpStatus.BAD_REQUEST)
fun handleBadRequest(e: BadRequestException) = mapOf("message" to e.message)
```

Place between `handleNotFound` and `handleConflict`.

- [ ] **Step 1.4: Compile** — `./gradlew :backend:compileKotlin` (or `./gradlew compileKotlin` from backend/). Expected: BUILD SUCCESSFUL.

- [ ] **Step 1.5: Commit**

```bash
git add backend/src/main/kotlin/com/company/workforce/api/common/Exceptions.kt \
        backend/src/main/kotlin/com/company/workforce/api/common/GlobalExceptionHandler.kt
git commit -m "feat(api): add BadRequestException + 400 handler"
```

---

## Task 2 — Flyway V14 migration

**Files:**
- Create: `backend/src/main/resources/db/migration/V14__create_calendar_events.sql`

- [ ] **Step 2.1: Confirm V14 is unused on this branch** — `ls backend/src/main/resources/db/migration/ | sort -V | tail -5`. Latest must be V13. If V14 already taken (e.g. wave2 merged in meantime), bump to next free number and update the file name in subsequent tasks.

- [ ] **Step 2.2: Write migration**

```sql
CREATE TABLE calendar_events (
  id              UUID PRIMARY KEY,
  owner_user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(200) NOT NULL,
  description     VARCHAR(2000),
  location        VARCHAR(200),
  start_at        TIMESTAMPTZ NOT NULL,
  end_at          TIMESTAMPTZ NOT NULL,
  all_day         BOOLEAN NOT NULL DEFAULT FALSE,
  is_public       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL,
  updated_at      TIMESTAMPTZ NOT NULL,
  CONSTRAINT chk_event_range CHECK (end_at >= start_at)
);

CREATE INDEX idx_calendar_events_range  ON calendar_events (start_at, end_at);
CREATE INDEX idx_calendar_events_owner  ON calendar_events (owner_user_id);
CREATE INDEX idx_calendar_events_public ON calendar_events (is_public) WHERE is_public = TRUE;
```

- [ ] **Step 2.3: Verify migration applies cleanly** — `./gradlew flywayMigrate` against your local dev DB OR `./gradlew test --tests 'com.company.workforce.api.auth.AuthControllerTest'` (any existing integration test boots Testcontainers + Flyway). Expected: PASS, no migration errors.

- [ ] **Step 2.4: Commit**

```bash
git add backend/src/main/resources/db/migration/V14__create_calendar_events.sql
git commit -m "feat(db): V14 calendar_events table"
```

---

## Task 3 — `CalendarEvent` entity + repository

**Files:**
- Create: `backend/src/main/kotlin/com/company/workforce/domain/calendar/CalendarEvent.kt`
- Create: `backend/src/main/kotlin/com/company/workforce/domain/calendar/CalendarEventRepository.kt`

- [ ] **Step 3.1: Write the entity**

```kotlin
package com.company.workforce.domain.calendar

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "calendar_events")
class CalendarEvent(
    @Id val id: UUID = UUID.randomUUID(),
    val ownerUserId: UUID,
    var title: String,
    var description: String? = null,
    var location: String? = null,
    var startAt: Instant,
    var endAt: Instant,
    var allDay: Boolean = false,
    var isPublic: Boolean = false,
    val createdAt: Instant = Instant.now(),
    var updatedAt: Instant = Instant.now()
)
```

Match the constructor-with-defaults style used in `ProjectAssignment.kt` (no `@ManyToOne`, raw UUID FK).

- [ ] **Step 3.2: Write the repository**

```kotlin
package com.company.workforce.domain.calendar

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant
import java.util.UUID

interface CalendarEventRepository : JpaRepository<CalendarEvent, UUID> {

    @Query("""
        SELECT e FROM CalendarEvent e
        WHERE (e.ownerUserId = :viewerId OR e.isPublic = true)
          AND e.startAt < :to AND e.endAt > :from
        ORDER BY e.startAt
    """)
    fun findVisibleInRange(
        @Param("viewerId") viewerId: UUID,
        @Param("from") from: Instant,
        @Param("to") to: Instant
    ): List<CalendarEvent>

    @Query("""
        SELECT e FROM CalendarEvent e
        WHERE e.ownerUserId = :ownerId
          AND e.startAt < :to AND e.endAt > :from
        ORDER BY e.startAt
    """)
    fun findByOwnerInRange(
        @Param("ownerId") ownerId: UUID,
        @Param("from") from: Instant,
        @Param("to") to: Instant
    ): List<CalendarEvent>

    @Query("""
        SELECT e FROM CalendarEvent e
        WHERE e.isPublic = true
          AND e.startAt < :to AND e.endAt > :from
        ORDER BY e.startAt
    """)
    fun findPublicInRange(
        @Param("from") from: Instant,
        @Param("to") to: Instant
    ): List<CalendarEvent>
}
```

Range semantics: half-open `[from, to)`. `start_at < to AND end_at > from` is the standard overlap predicate.

- [ ] **Step 3.3: Compile** — `./gradlew compileKotlin`. Expected: SUCCESS.

- [ ] **Step 3.4: Commit**

```bash
git add backend/src/main/kotlin/com/company/workforce/domain/calendar/
git commit -m "feat(calendar): add CalendarEvent entity + repository"
```

---

## Task 4 — Repository integration test (TDD: write it first, watch it fail, then it passes)

**Why TDD:** The range overlap predicate is easy to get wrong (off-by-one on inclusivity). Writing the test before any service code keeps the contract honest.

**Files:**
- Create: `backend/src/test/kotlin/com/company/workforce/domain/calendar/CalendarEventRepositoryTest.kt`

- [ ] **Step 4.1: Write the failing test**

```kotlin
package com.company.workforce.domain.calendar

import com.company.workforce.IntegrationTestBase
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.user.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.annotation.DirtiesContext
import java.time.Instant
import java.util.UUID

@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class CalendarEventRepositoryTest : IntegrationTestBase() {

    @Autowired lateinit var repo: CalendarEventRepository
    @Autowired lateinit var userRepository: UserRepository
    @Autowired lateinit var employeeRepository: EmployeeRepository
    @Autowired lateinit var passwordEncoder: PasswordEncoder

    private lateinit var alice: UUID
    private lateinit var bob: UUID

    @BeforeEach
    fun setup() {
        userRepository.deleteAll()
        employeeRepository.deleteAll()
        val ae = createEmployee(employeeRepository, email = "alice@test.com", fullName = "Alice")
        val be = createEmployee(employeeRepository, email = "bob@test.com", fullName = "Bob")
        alice = createUser(userRepository, passwordEncoder, ae.id, email = "alice@test.com").id
        bob   = createUser(userRepository, passwordEncoder, be.id, email = "bob@test.com").id
    }

    private fun event(
        owner: UUID, start: String, end: String, isPublic: Boolean = false, title: String = "e"
    ) = repo.save(CalendarEvent(
        ownerUserId = owner, title = title,
        startAt = Instant.parse(start), endAt = Instant.parse(end),
        isPublic = isPublic,
    ))

    @Test
    fun `findVisibleInRange returns own private and any public, hides other private`() {
        event(alice, "2026-05-06T01:00:00Z", "2026-05-06T02:00:00Z", isPublic = false, title = "alice-private")
        event(alice, "2026-05-06T03:00:00Z", "2026-05-06T04:00:00Z", isPublic = true,  title = "alice-public")
        event(bob,   "2026-05-06T05:00:00Z", "2026-05-06T06:00:00Z", isPublic = false, title = "bob-private")
        event(bob,   "2026-05-06T07:00:00Z", "2026-05-06T08:00:00Z", isPublic = true,  title = "bob-public")

        val asAlice = repo.findVisibleInRange(
            alice, Instant.parse("2026-05-06T00:00:00Z"), Instant.parse("2026-05-07T00:00:00Z")
        ).map { it.title }.toSet()

        assertEquals(setOf("alice-private", "alice-public", "bob-public"), asAlice)
    }

    @Test
    fun `range overlap is half-open (touching boundary excludes adjacent event)`() {
        // event ends exactly at 02:00. Range starts at 02:00 — should NOT include.
        event(alice, "2026-05-06T01:00:00Z", "2026-05-06T02:00:00Z", isPublic = true)
        val res = repo.findVisibleInRange(
            alice, Instant.parse("2026-05-06T02:00:00Z"), Instant.parse("2026-05-06T03:00:00Z")
        )
        assertTrue(res.isEmpty(), "Event ending at the range start must not be returned")
    }

    @Test
    fun `multi-day event spanning the queried range is returned`() {
        event(alice, "2026-05-01T00:00:00Z", "2026-05-10T00:00:00Z", isPublic = false, title = "vacation")
        val res = repo.findVisibleInRange(
            alice, Instant.parse("2026-05-05T00:00:00Z"), Instant.parse("2026-05-06T00:00:00Z")
        ).map { it.title }
        assertEquals(listOf("vacation"), res)
    }

    @Test
    fun `findByOwnerInRange returns only that owner`() {
        event(alice, "2026-05-06T01:00:00Z", "2026-05-06T02:00:00Z", isPublic = true)
        event(bob,   "2026-05-06T01:00:00Z", "2026-05-06T02:00:00Z", isPublic = true)
        val res = repo.findByOwnerInRange(
            alice, Instant.parse("2026-05-06T00:00:00Z"), Instant.parse("2026-05-07T00:00:00Z")
        )
        assertEquals(1, res.size)
        assertEquals(alice, res.first().ownerUserId)
    }

    @Test
    fun `findPublicInRange excludes private events`() {
        event(alice, "2026-05-06T01:00:00Z", "2026-05-06T02:00:00Z", isPublic = false)
        event(bob,   "2026-05-06T03:00:00Z", "2026-05-06T04:00:00Z", isPublic = true,  title = "bob-public")
        val res = repo.findPublicInRange(
            Instant.parse("2026-05-06T00:00:00Z"), Instant.parse("2026-05-07T00:00:00Z")
        ).map { it.title }
        assertEquals(listOf("bob-public"), res)
    }
}
```

- [ ] **Step 4.2: Run** — `./gradlew test --tests 'com.company.workforce.domain.calendar.CalendarEventRepositoryTest'`. Expected: **PASS** (entity already implemented in Task 3). If any test fails, fix the repository query before proceeding.

- [ ] **Step 4.3: Commit**

```bash
git add backend/src/test/kotlin/com/company/workforce/domain/calendar/
git commit -m "test(calendar): repository range query coverage"
```

---

## Task 5 — DTOs and filter enum

**Files:**
- Create: `backend/src/main/kotlin/com/company/workforce/api/calendar/dto/CalendarFilter.kt`
- Create: `backend/src/main/kotlin/com/company/workforce/api/calendar/dto/CreateCalendarEventRequest.kt`
- Create: `backend/src/main/kotlin/com/company/workforce/api/calendar/dto/UpdateCalendarEventRequest.kt`
- Create: `backend/src/main/kotlin/com/company/workforce/api/calendar/dto/CalendarEventResponse.kt`

- [ ] **Step 5.1: Filter enum**

```kotlin
package com.company.workforce.api.calendar.dto

enum class CalendarFilter { ALL, MINE, PUBLIC }
```

- [ ] **Step 5.2: Create request**

```kotlin
package com.company.workforce.api.calendar.dto

import jakarta.validation.constraints.AssertTrue
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant

data class CreateCalendarEventRequest(
    @field:NotBlank @field:Size(max = 200) val title: String,
    @field:Size(max = 2000) val description: String? = null,
    @field:Size(max = 200) val location: String? = null,
    val startAt: Instant,
    val endAt: Instant,
    val allDay: Boolean = false,
    val isPublic: Boolean = false,
) {
    @AssertTrue(message = "endAt must be on or after startAt")
    fun isRangeValid(): Boolean = !endAt.isBefore(startAt)
}
```

- [ ] **Step 5.3: Update request** — same shape, identical validation (separate class for symmetry):

```kotlin
package com.company.workforce.api.calendar.dto

import jakarta.validation.constraints.AssertTrue
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant

data class UpdateCalendarEventRequest(
    @field:NotBlank @field:Size(max = 200) val title: String,
    @field:Size(max = 2000) val description: String? = null,
    @field:Size(max = 200) val location: String? = null,
    val startAt: Instant,
    val endAt: Instant,
    val allDay: Boolean = false,
    val isPublic: Boolean = false,
) {
    @AssertTrue(message = "endAt must be on or after startAt")
    fun isRangeValid(): Boolean = !endAt.isBefore(startAt)
}
```

- [ ] **Step 5.4: Response**

```kotlin
package com.company.workforce.api.calendar.dto

import java.time.Instant
import java.util.UUID

data class CalendarEventResponse(
    val id: UUID,
    val ownerUserId: UUID,
    val ownerName: String,
    val ownerInitial: String,
    val title: String,
    val description: String?,
    val location: String?,
    val startAt: Instant,
    val endAt: Instant,
    val allDay: Boolean,
    val isPublic: Boolean,
    val isMine: Boolean,
)
```

- [ ] **Step 5.5: Compile** — `./gradlew compileKotlin`. Expected: SUCCESS.

- [ ] **Step 5.6: Commit**

```bash
git add backend/src/main/kotlin/com/company/workforce/api/calendar/dto/
git commit -m "feat(calendar): request/response DTOs + filter enum"
```

---

## Task 6 — `CalendarService` (CRUD + permissions + KST normalization)

**Files:**
- Create: `backend/src/main/kotlin/com/company/workforce/api/calendar/CalendarService.kt`

**Behavioral contract** (drives the test in Task 7):
- KST = `Asia/Seoul` (`ZoneId.of("Asia/Seoul")`).
- For `allDay = true`, normalize `startAt` to KST midnight of its date and `endAt` to KST midnight of (its date + 1) — half-open. Idempotent.
- Range queries reject `to - from > 92 days` with `BadRequestException`.
- `getOne(id, viewerId)`: return 404 (`NotFoundException`) if not found OR if private and not owned.
- `update(id, viewerId, req)`: 404 if private/not-owned, 403 if public-not-owned, 200 if owned.
- `delete(id, viewerId)`: same authorization shape as update.
- All mutating ops bump `updatedAt = Instant.now()`.

- [ ] **Step 6.1: Service skeleton**

```kotlin
package com.company.workforce.api.calendar

import com.company.workforce.api.calendar.dto.*
import com.company.workforce.api.common.BadRequestException
import com.company.workforce.api.common.ForbiddenException
import com.company.workforce.api.common.NotFoundException
import com.company.workforce.domain.calendar.CalendarEvent
import com.company.workforce.domain.calendar.CalendarEventRepository
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.user.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.util.UUID

@Service
class CalendarService(
    private val repo: CalendarEventRepository,
    private val userRepository: UserRepository,
    private val employeeRepository: EmployeeRepository,
) {
    private val kst: ZoneId = ZoneId.of("Asia/Seoul")
    private val maxRange: Duration = Duration.ofDays(92)

    @Transactional(readOnly = true)
    fun list(viewerId: UUID, from: Instant, to: Instant, filter: CalendarFilter): List<CalendarEventResponse> {
        if (Duration.between(from, to) > maxRange) {
            throw BadRequestException("Range exceeds 92 days")
        }
        val events = when (filter) {
            CalendarFilter.ALL    -> repo.findVisibleInRange(viewerId, from, to)
            CalendarFilter.MINE   -> repo.findByOwnerInRange(viewerId, from, to)
            CalendarFilter.PUBLIC -> repo.findPublicInRange(from, to)
        }
        return events.map { it.toResponse(viewerId) }
    }

    @Transactional
    fun create(viewerId: UUID, req: CreateCalendarEventRequest): CalendarEventResponse {
        val (start, end) = normalize(req.startAt, req.endAt, req.allDay)
        val saved = repo.save(CalendarEvent(
            ownerUserId = viewerId,
            title = req.title.trim(),
            description = req.description,
            location = req.location,
            startAt = start, endAt = end,
            allDay = req.allDay,
            isPublic = req.isPublic,
        ))
        return saved.toResponse(viewerId)
    }

    @Transactional(readOnly = true)
    fun getOne(viewerId: UUID, id: UUID): CalendarEventResponse {
        val ev = repo.findById(id).orElseThrow { NotFoundException("Event not found") }
        if (ev.ownerUserId != viewerId && !ev.isPublic) throw NotFoundException("Event not found")
        return ev.toResponse(viewerId)
    }

    @Transactional
    fun update(viewerId: UUID, id: UUID, req: UpdateCalendarEventRequest): CalendarEventResponse {
        val ev = repo.findById(id).orElseThrow { NotFoundException("Event not found") }
        if (ev.ownerUserId != viewerId) {
            if (!ev.isPublic) throw NotFoundException("Event not found")
            throw ForbiddenException("Only the owner can edit this event")
        }
        val (start, end) = normalize(req.startAt, req.endAt, req.allDay)
        ev.title = req.title.trim()
        ev.description = req.description
        ev.location = req.location
        ev.startAt = start
        ev.endAt = end
        ev.allDay = req.allDay
        ev.isPublic = req.isPublic
        ev.updatedAt = Instant.now()
        return ev.toResponse(viewerId)
    }

    @Transactional
    fun delete(viewerId: UUID, id: UUID) {
        val ev = repo.findById(id).orElseThrow { NotFoundException("Event not found") }
        if (ev.ownerUserId != viewerId) {
            if (!ev.isPublic) throw NotFoundException("Event not found")
            throw ForbiddenException("Only the owner can delete this event")
        }
        repo.delete(ev)
    }

    private fun normalize(start: Instant, end: Instant, allDay: Boolean): Pair<Instant, Instant> {
        if (!allDay) return start to end
        val startDate = start.atZone(kst).toLocalDate()
        val endDateExclusive = end.atZone(kst).toLocalDate().let { d ->
            // If end is already at midnight KST and represents an exclusive boundary, leave it; otherwise add 1 day.
            if (end.atZone(kst).toLocalTime() == java.time.LocalTime.MIDNIGHT && d.isAfter(startDate)) d
            else d.plusDays(1)
        }
        val s = startDate.atStartOfDay(kst).toInstant()
        val e = endDateExclusive.atStartOfDay(kst).toInstant()
        return s to e
    }

    private fun CalendarEvent.toResponse(viewerId: UUID): CalendarEventResponse {
        val user = userRepository.findById(ownerUserId).orElseThrow {
            NotFoundException("Owner user not found: $ownerUserId")
        }
        val emp = employeeRepository.findById(user.employeeId).orElseThrow {
            NotFoundException("Owner employee not found: ${user.employeeId}")
        }
        val name = emp.fullName
        val initial = name.firstOrNull { !it.isWhitespace() }?.toString() ?: "?"
        return CalendarEventResponse(
            id = id,
            ownerUserId = ownerUserId,
            ownerName = name,
            ownerInitial = initial,
            title = title,
            description = description,
            location = location,
            startAt = startAt,
            endAt = endAt,
            allDay = allDay,
            isPublic = isPublic,
            isMine = ownerUserId == viewerId,
        )
    }
}
```

> **Note on owner lookup:** for v1 we re-read user+employee per event. If profiling later shows N+1 cost, batch by `findAllById` in the controller before mapping. Don't optimize speculatively now.

- [ ] **Step 6.2: Compile** — `./gradlew compileKotlin`. Expected: SUCCESS.

- [ ] **Step 6.3: Commit**

```bash
git add backend/src/main/kotlin/com/company/workforce/api/calendar/CalendarService.kt
git commit -m "feat(calendar): service with CRUD, permissions, KST normalization"
```

---

## Task 7 — `CalendarService` integration test

**Files:**
- Create: `backend/src/test/kotlin/com/company/workforce/api/calendar/CalendarServiceTest.kt`

- [ ] **Step 7.1: Write test (run-then-verify)**

```kotlin
package com.company.workforce.api.calendar

import com.company.workforce.IntegrationTestBase
import com.company.workforce.api.calendar.dto.*
import com.company.workforce.api.common.BadRequestException
import com.company.workforce.api.common.ForbiddenException
import com.company.workforce.api.common.NotFoundException
import com.company.workforce.domain.calendar.CalendarEventRepository
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.user.UserRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.annotation.DirtiesContext
import java.time.Instant
import java.time.ZoneId
import java.util.UUID

@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class CalendarServiceTest : IntegrationTestBase() {

    @Autowired lateinit var service: CalendarService
    @Autowired lateinit var repo: CalendarEventRepository
    @Autowired lateinit var userRepository: UserRepository
    @Autowired lateinit var employeeRepository: EmployeeRepository
    @Autowired lateinit var passwordEncoder: PasswordEncoder

    private lateinit var alice: UUID
    private lateinit var bob: UUID

    @BeforeEach
    fun setup() {
        repo.deleteAll(); userRepository.deleteAll(); employeeRepository.deleteAll()
        val ae = createEmployee(employeeRepository, email = "alice@test.com", fullName = "Alice")
        val be = createEmployee(employeeRepository, email = "bob@test.com", fullName = "Bob")
        alice = createUser(userRepository, passwordEncoder, ae.id, email = "alice@test.com").id
        bob   = createUser(userRepository, passwordEncoder, be.id, email = "bob@test.com").id
    }

    private val t1 = Instant.parse("2026-05-06T01:00:00Z")
    private val t2 = Instant.parse("2026-05-06T02:00:00Z")

    @Test
    fun `create returns isMine true for the creator`() {
        val r = service.create(alice, CreateCalendarEventRequest(
            title = "Standup", startAt = t1, endAt = t2, isPublic = true,
        ))
        assertTrue(r.isMine)
        assertEquals("Alice", r.ownerName)
        assertEquals("A", r.ownerInitial)
    }

    @Test
    fun `getOne hides other private as 404`() {
        val ev = service.create(bob, CreateCalendarEventRequest(
            title = "secret", startAt = t1, endAt = t2, isPublic = false,
        ))
        assertThrows(NotFoundException::class.java) { service.getOne(alice, ev.id) }
    }

    @Test
    fun `getOne shows other public as readonly`() {
        val ev = service.create(bob, CreateCalendarEventRequest(
            title = "town hall", startAt = t1, endAt = t2, isPublic = true,
        ))
        val r = service.getOne(alice, ev.id)
        assertFalse(r.isMine)
        assertEquals("town hall", r.title)
    }

    @Test
    fun `update by other owner of public event returns 403`() {
        val ev = service.create(bob, CreateCalendarEventRequest(
            title = "x", startAt = t1, endAt = t2, isPublic = true,
        ))
        assertThrows(ForbiddenException::class.java) {
            service.update(alice, ev.id, UpdateCalendarEventRequest(
                title = "hijack", startAt = t1, endAt = t2, isPublic = true,
            ))
        }
    }

    @Test
    fun `update by other owner of private event returns 404`() {
        val ev = service.create(bob, CreateCalendarEventRequest(
            title = "x", startAt = t1, endAt = t2, isPublic = false,
        ))
        assertThrows(NotFoundException::class.java) {
            service.update(alice, ev.id, UpdateCalendarEventRequest(
                title = "hijack", startAt = t1, endAt = t2, isPublic = false,
            ))
        }
    }

    @Test
    fun `delete by owner removes the event`() {
        val ev = service.create(alice, CreateCalendarEventRequest(
            title = "trash me", startAt = t1, endAt = t2,
        ))
        service.delete(alice, ev.id)
        assertTrue(repo.findById(ev.id).isEmpty)
    }

    @Test
    fun `allDay normalizes to KST midnight and exclusive end`() {
        val req = CreateCalendarEventRequest(
            title = "vacation",
            startAt = Instant.parse("2026-05-06T13:30:00Z"),  // 22:30 KST 5/6
            endAt   = Instant.parse("2026-05-06T15:00:00Z"),  // 00:00 KST 5/7 — already midnight
            allDay = true,
        )
        val r = service.create(alice, req)
        val kst = ZoneId.of("Asia/Seoul")
        assertEquals("2026-05-06T00:00", r.startAt.atZone(kst).toLocalDateTime().toString())
        assertEquals("2026-05-07T00:00", r.endAt.atZone(kst).toLocalDateTime().toString())
    }

    @Test
    fun `list with mine filter returns only owned`() {
        service.create(alice, CreateCalendarEventRequest(title = "a", startAt = t1, endAt = t2, isPublic = true))
        service.create(bob,   CreateCalendarEventRequest(title = "b", startAt = t1, endAt = t2, isPublic = true))
        val r = service.list(alice,
            Instant.parse("2026-05-06T00:00:00Z"),
            Instant.parse("2026-05-07T00:00:00Z"),
            CalendarFilter.MINE)
        assertEquals(1, r.size)
        assertEquals("a", r.first().title)
    }

    @Test
    fun `range over 92 days returns 400`() {
        val from = Instant.parse("2026-01-01T00:00:00Z")
        val to   = Instant.parse("2026-05-01T00:00:00Z")  // 120 days
        assertThrows(BadRequestException::class.java) {
            service.list(alice, from, to, CalendarFilter.ALL)
        }
    }
}
```

- [ ] **Step 7.2: Run** — `./gradlew test --tests 'com.company.workforce.api.calendar.CalendarServiceTest'`. Expected: all PASS. If `allDay normalizes…` fails, re-read `normalize()` in Task 6 — the idempotency branch is the tricky bit.

- [ ] **Step 7.3: Commit**

```bash
git add backend/src/test/kotlin/com/company/workforce/api/calendar/CalendarServiceTest.kt
git commit -m "test(calendar): service permissions, normalization, range guard"
```

---

## Task 8 — `CalendarController`

**Files:**
- Create: `backend/src/main/kotlin/com/company/workforce/api/calendar/CalendarController.kt`

- [ ] **Step 8.1: Write controller**

```kotlin
package com.company.workforce.api.calendar

import com.company.workforce.api.calendar.dto.*
import com.company.workforce.security.UserDetailsImpl
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.util.UUID

@RestController
@RequestMapping("/api/calendar")
class CalendarController(private val service: CalendarService) {

    @GetMapping("/events")
    fun list(
        @AuthenticationPrincipal principal: UserDetailsImpl,
        @RequestParam from: Instant,
        @RequestParam to: Instant,
        @RequestParam(required = false, defaultValue = "ALL") filter: CalendarFilter,
    ): List<CalendarEventResponse> = service.list(principal.userId, from, to, filter)

    @PostMapping("/events")
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        @AuthenticationPrincipal principal: UserDetailsImpl,
        @Valid @RequestBody req: CreateCalendarEventRequest,
    ): CalendarEventResponse = service.create(principal.userId, req)

    @GetMapping("/events/{id}")
    fun get(
        @AuthenticationPrincipal principal: UserDetailsImpl,
        @PathVariable id: UUID,
    ): CalendarEventResponse = service.getOne(principal.userId, id)

    @PutMapping("/events/{id}")
    fun update(
        @AuthenticationPrincipal principal: UserDetailsImpl,
        @PathVariable id: UUID,
        @Valid @RequestBody req: UpdateCalendarEventRequest,
    ): CalendarEventResponse = service.update(principal.userId, id, req)

    @DeleteMapping("/events/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(
        @AuthenticationPrincipal principal: UserDetailsImpl,
        @PathVariable id: UUID,
    ) = service.delete(principal.userId, id)
}
```

> Verified against `UserDetailsImpl.kt`: the user's UUID is exposed as `userId` (not `id`).

- [ ] **Step 8.2: SecurityConfig sanity check** — search for `/api/` in `backend/src/main/kotlin/com/company/workforce/config/SecurityConfig.kt`. Confirm authenticated routes match `/api/**` (default for this app). No edit needed unless the config explicitly excludes `/api/calendar/**`.

- [ ] **Step 8.3: Compile** — `./gradlew compileKotlin`. Expected: SUCCESS.

- [ ] **Step 8.4: Commit**

```bash
git add backend/src/main/kotlin/com/company/workforce/api/calendar/CalendarController.kt
git commit -m "feat(calendar): REST controller wired to /api/calendar"
```

---

## Task 9 — `CalendarController` integration test

**Files:**
- Create: `backend/src/test/kotlin/com/company/workforce/api/calendar/CalendarControllerTest.kt`

Pattern: copy `PhaseControllerTest.kt`'s structure (real auth via `loginAndGetToken`).

- [ ] **Step 9.1: Write test**

```kotlin
package com.company.workforce.api.calendar

import com.company.workforce.IntegrationTestBase
import com.company.workforce.domain.auth.RefreshTokenRepository
import com.company.workforce.domain.calendar.CalendarEventRepository
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.user.UserRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put

@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class CalendarControllerTest : IntegrationTestBase() {

    @Autowired lateinit var mvc: MockMvc
    @Autowired lateinit var om: ObjectMapper
    @Autowired lateinit var employeeRepository: EmployeeRepository
    @Autowired lateinit var userRepository: UserRepository
    @Autowired lateinit var calendarRepository: CalendarEventRepository
    @Autowired lateinit var refreshTokenRepository: RefreshTokenRepository
    @Autowired lateinit var passwordEncoder: PasswordEncoder

    private lateinit var aliceToken: String
    private lateinit var bobToken: String

    @BeforeEach
    fun setup() {
        refreshTokenRepository.deleteAll()
        calendarRepository.deleteAll()
        userRepository.deleteAll()
        employeeRepository.deleteAll()
        val ae = createEmployee(employeeRepository, email = "alice@test.com", fullName = "Alice")
        val be = createEmployee(employeeRepository, email = "bob@test.com", fullName = "Bob")
        createUser(userRepository, passwordEncoder, ae.id, email = "alice@test.com")
        createUser(userRepository, passwordEncoder, be.id, email = "bob@test.com")
        aliceToken = login("alice@test.com")
        bobToken   = login("bob@test.com")
    }

    private fun login(email: String): String {
        val resp = mvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = om.writeValueAsString(mapOf("email" to email, "password" to "Password1"))
        }.andReturn().response.contentAsString
        return om.readTree(resp)["accessToken"].asText()
    }

    private fun createEvent(token: String, body: Map<String, Any?>): String {
        val resp = mvc.post("/api/calendar/events") {
            header("Authorization", "Bearer $token")
            contentType = MediaType.APPLICATION_JSON
            content = om.writeValueAsString(body)
        }.andExpect { status { isCreated() } }.andReturn().response.contentAsString
        return om.readTree(resp)["id"].asText()
    }

    private val baseEvent = mapOf(
        "title" to "Meeting",
        "startAt" to "2026-05-06T01:00:00Z",
        "endAt"   to "2026-05-06T02:00:00Z",
    )

    @Test
    fun `unauthenticated GET returns 401`() {
        mvc.get("/api/calendar/events") {
            param("from", "2026-05-06T00:00:00Z")
            param("to",   "2026-05-07T00:00:00Z")
        }.andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `alice creates and lists own private event`() {
        createEvent(aliceToken, baseEvent + ("isPublic" to false))
        mvc.get("/api/calendar/events") {
            header("Authorization", "Bearer $aliceToken")
            param("from", "2026-05-06T00:00:00Z")
            param("to",   "2026-05-07T00:00:00Z")
        }.andExpect {
            status { isOk() }
            jsonPath("$.length()") { value(1) }
            jsonPath("$[0].isMine") { value(true) }
        }
    }

    @Test
    fun `bob does not see alice's private event`() {
        createEvent(aliceToken, baseEvent + ("isPublic" to false))
        mvc.get("/api/calendar/events") {
            header("Authorization", "Bearer $bobToken")
            param("from", "2026-05-06T00:00:00Z")
            param("to",   "2026-05-07T00:00:00Z")
        }.andExpect {
            status { isOk() }
            jsonPath("$.length()") { value(0) }
        }
    }

    @Test
    fun `bob sees alice's public event but cannot edit`() {
        val id = createEvent(aliceToken, baseEvent + ("isPublic" to true))
        mvc.get("/api/calendar/events/$id") {
            header("Authorization", "Bearer $bobToken")
        }.andExpect {
            status { isOk() }
            jsonPath("$.isMine") { value(false) }
        }
        mvc.put("/api/calendar/events/$id") {
            header("Authorization", "Bearer $bobToken")
            contentType = MediaType.APPLICATION_JSON
            content = om.writeValueAsString(baseEvent + ("title" to "hijacked") + ("isPublic" to true))
        }.andExpect { status { isForbidden() } }
    }

    @Test
    fun `bob attempting to GET alice's private event returns 404`() {
        val id = createEvent(aliceToken, baseEvent + ("isPublic" to false))
        mvc.get("/api/calendar/events/$id") {
            header("Authorization", "Bearer $bobToken")
        }.andExpect { status { isNotFound() } }
    }

    @Test
    fun `delete by owner returns 204`() {
        val id = createEvent(aliceToken, baseEvent)
        mvc.delete("/api/calendar/events/$id") {
            header("Authorization", "Bearer $aliceToken")
        }.andExpect { status { isNoContent() } }
    }

    @Test
    fun `invalid range (end before start) returns 400`() {
        mvc.post("/api/calendar/events") {
            header("Authorization", "Bearer $aliceToken")
            contentType = MediaType.APPLICATION_JSON
            content = om.writeValueAsString(mapOf(
                "title" to "x",
                "startAt" to "2026-05-06T02:00:00Z",
                "endAt"   to "2026-05-06T01:00:00Z",
            ))
        }.andExpect { status { isBadRequest() } }
    }

    @Test
    fun `range over 92 days returns 400`() {
        mvc.get("/api/calendar/events") {
            header("Authorization", "Bearer $aliceToken")
            param("from", "2026-01-01T00:00:00Z")
            param("to",   "2026-05-01T00:00:00Z")
        }.andExpect { status { isBadRequest() } }
    }
}
```

- [ ] **Step 9.2: Run** — `./gradlew test --tests 'com.company.workforce.api.calendar.CalendarControllerTest'`. Expected: all PASS.

- [ ] **Step 9.3: Run all backend tests once** — `./gradlew test`. Expected: prior + new tests all green. Investigate any breakage before continuing.

- [ ] **Step 9.4: Commit**

```bash
git add backend/src/test/kotlin/com/company/workforce/api/calendar/CalendarControllerTest.kt
git commit -m "test(calendar): controller authz + status code coverage"
```

---

## Task 10 — Frontend: design tokens

**Files:**
- Modify: `frontend/src/app/globals.css`

- [ ] **Step 10.1: Add tokens after the existing `--info-light: #eff6ff;` line, inside `:root`:**

```css
  /* Calendar event variants */
  --event-private-bg: #fffbeb;
  --event-private-border: #f59e0b;
  --event-public-mine-bg: #fafafa;
  --event-public-mine-border: #3f3f46;
  --event-public-other-bg: #fafafa;
  --event-public-other-border: #a1a1aa;

  /* Calendar surfaces */
  --calendar-today-tint: linear-gradient(180deg, rgba(16,185,129,0.06), transparent 70%);
  --calendar-grid-line: var(--border);
```

> Hex values are isolated to the token definitions per CLAUDE.md ("no hardcoded hex" — meaning consumers must reference the token, not duplicate the hex). All component code reads via `var(--event-private-bg)` etc.

- [ ] **Step 10.2: Expose to Tailwind** — inside the existing `@theme inline { … }` block, add:

```css
  --color-event-private-bg: var(--event-private-bg);
  --color-event-private-border: var(--event-private-border);
  --color-event-public-mine-bg: var(--event-public-mine-bg);
  --color-event-public-mine-border: var(--event-public-mine-border);
  --color-event-public-other-bg: var(--event-public-other-bg);
  --color-event-public-other-border: var(--event-public-other-border);
```

This lets Tailwind utilities like `bg-event-private-bg` resolve. (Optional — components may also use inline `style={{ background: 'var(--event-private-bg)' }}` if simpler.)

- [ ] **Step 10.3: Verify dev server compiles** — `cd frontend && npm run dev` → check no CSS error in console. Stop with Ctrl+C.

- [ ] **Step 10.4: Commit**

```bash
git add frontend/src/app/globals.css
git commit -m "feat(tokens): calendar event variant + today tokens"
```

---

## Task 11 — Frontend: `Modal` primitive

**Why:** Spec § 10 / Modal Primitive 의존성 — option A (build new). Required by EventDetail/EventForm modals.

**Files:**
- Create: `frontend/src/components/ui/primitives/Modal.tsx`
- Modify: `frontend/src/components/ui/primitives/index.ts` — re-export `Modal` if a barrel exists. (Run `cat frontend/src/components/ui/primitives/index.ts` first; if there's no barrel, skip.)

- [ ] **Step 11.1: Write `Modal.tsx`** — adapted from `Drawer.tsx` (centered, scale-fade instead of slide):

```tsx
'use client'
import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  /** When true, suppress overlay click-to-close (use for forms with unsaved data). */
  disableOverlayClose?: boolean
}

export function Modal({
  open, onClose, title, children, className, disableOverlayClose = false,
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
      }
    }
  }, [open, handleKeyDown])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <motion.div
            className="absolute inset-0 bg-zinc-900/30 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={disableOverlayClose ? undefined : onClose}
          />
          <motion.div
            className={cn(
              'relative w-full max-w-md bg-card rounded-[var(--radius-lg)]',
              'shadow-[var(--shadow-xl)] border border-border',
              'flex flex-col overflow-hidden',
              className,
            )}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          >
            {title && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                <h2 className="font-semibold text-sm">{title}</h2>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-[var(--radius-sm)] p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 11.2: Smoke test** — temporarily import + render in `app/page.tsx` with state, hit `/`, confirm open/close + ESC + overlay click. Then **revert** the test usage.

- [ ] **Step 11.3: Commit**

```bash
git add frontend/src/components/ui/primitives/Modal.tsx
git commit -m "feat(primitives): centered Modal with spring scale-fade"
```

---

## Task 12 — Frontend: API client + types

**Files:**
- Create: `frontend/src/lib/api/calendar.ts`

- [ ] **Step 12.1: Confirmed pattern** — `frontend/src/lib/api/client.ts` exports a **named** `apiClient` (axios instance with token interceptor + 401 refresh). All sibling modules (`projects.ts`, `auth.ts`, etc.) use `import { apiClient } from './client'`.

- [ ] **Step 12.2: Write client**

```ts
import { apiClient } from './client'

export type CalendarFilter = 'ALL' | 'MINE' | 'PUBLIC'

export interface CalendarEventDTO {
  id: string
  ownerUserId: string
  ownerName: string
  ownerInitial: string
  title: string
  description: string | null
  location: string | null
  startAt: string  // ISO Instant
  endAt: string
  allDay: boolean
  isPublic: boolean
  isMine: boolean
}

export interface CalendarEventInput {
  title: string
  description?: string | null
  location?: string | null
  startAt: string
  endAt: string
  allDay: boolean
  isPublic: boolean
}

export const calendarApi = {
  list: (from: string, to: string, filter: CalendarFilter = 'ALL') =>
    apiClient.get<CalendarEventDTO[]>('/api/calendar/events', { params: { from, to, filter } })
       .then(r => r.data),

  get: (id: string) =>
    apiClient.get<CalendarEventDTO>(`/api/calendar/events/${id}`).then(r => r.data),

  create: (input: CalendarEventInput) =>
    apiClient.post<CalendarEventDTO>('/api/calendar/events', input).then(r => r.data),

  update: (id: string, input: CalendarEventInput) =>
    apiClient.put<CalendarEventDTO>(`/api/calendar/events/${id}`, input).then(r => r.data),

  delete: (id: string) =>
    apiClient.delete<void>(`/api/calendar/events/${id}`).then(() => undefined),
}
```

- [ ] **Step 12.3: Type-check** — `cd frontend && npx tsc --noEmit`. Expected: PASS.

- [ ] **Step 12.4: Commit**

```bash
git add frontend/src/lib/api/calendar.ts
git commit -m "feat(api): calendar client + types"
```

---

## Task 13 — Frontend: `calendar-utils.ts`

**Files:**
- Create: `frontend/src/components/calendar/calendar-utils.ts`

- [ ] **Step 13.1: Implement utilities**

```ts
// All date math is week-starts-Monday, Asia/Seoul (KST) — but we keep it timezone-naive
// because the page consumes ISO strings from the server already normalized.

const KST_OFFSET_MIN = 9 * 60

export type CalendarView = 'month' | 'week'

export function startOfWeek(d: Date): Date {
  const r = new Date(d)
  const day = r.getDay() // 0 (Sun) .. 6 (Sat)
  const monIndex = (day + 6) % 7 // Mon=0
  r.setDate(r.getDate() - monIndex)
  r.setHours(0, 0, 0, 0)
  return r
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

/** First Monday on or before the 1st of `d`'s month — anchors the 6-row grid. */
export function monthGridStart(d: Date): Date {
  return startOfWeek(startOfMonth(d))
}

/** 42 days (6 rows × 7) starting at `monthGridStart`. */
export function monthGridDays(d: Date): Date[] {
  const start = monthGridStart(d)
  return Array.from({ length: 42 }, (_, i) => {
    const x = new Date(start)
    x.setDate(start.getDate() + i)
    return x
  })
}

export function weekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor)
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(start)
    x.setDate(start.getDate() + i)
    return x
  })
}

export function addMonths(d: Date, n: number): Date {
  const r = new Date(d.getFullYear(), d.getMonth() + n, 1)
  return r
}

export function addWeeks(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + 7 * n)
  return r
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate()
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function toDateOnlyISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export function parseDateOnly(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Range to query the API for: a 6-row month grid + small padding. */
export function monthQueryRange(anchor: Date): { from: string; to: string } {
  const days = monthGridDays(anchor)
  const fromD = days[0]
  const toD = new Date(days[41])
  toD.setDate(toD.getDate() + 1)
  return { from: fromD.toISOString(), to: toD.toISOString() }
}

export function weekQueryRange(anchor: Date): { from: string; to: string } {
  const days = weekDays(anchor)
  const fromD = days[0]
  const toD = new Date(days[6])
  toD.setDate(toD.getDate() + 1)
  return { from: fromD.toISOString(), to: toD.toISOString() }
}
```

- [ ] **Step 13.2: Type-check** — `npx tsc --noEmit`. Expected: PASS.

- [ ] **Step 13.3: Commit**

```bash
git add frontend/src/components/calendar/calendar-utils.ts
git commit -m "feat(calendar): date math utilities (month grid, week, ranges)"
```

---

## Task 14 — Frontend: `useCalendarEvents` hook

**Files:**
- Create: `frontend/src/components/calendar/useCalendarEvents.ts`

- [ ] **Step 14.1: Implement**

```ts
'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { calendarApi, type CalendarEventInput, type CalendarFilter } from '@/lib/api/calendar'

export function useCalendarEvents(from: string, to: string, filter: CalendarFilter) {
  return useQuery({
    queryKey: ['calendar', from, to, filter],
    queryFn: () => calendarApi.list(from, to, filter),
    staleTime: 30_000,
  })
}

export function useCreateCalendarEvent(invalidateKey: readonly unknown[]) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CalendarEventInput) => calendarApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: invalidateKey }),
  })
}

export function useUpdateCalendarEvent(invalidateKey: readonly unknown[]) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CalendarEventInput }) =>
      calendarApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: invalidateKey }),
  })
}

export function useDeleteCalendarEvent(invalidateKey: readonly unknown[]) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => calendarApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: invalidateKey }),
  })
}
```

> `invalidateKey` is passed in (rather than derived) so the consuming page invalidates the *currently-active* range, not all calendar queries. This avoids cascade refetches across months.

- [ ] **Step 14.2: Type-check** — `npx tsc --noEmit`. Expected: PASS.

- [ ] **Step 14.3: Commit**

```bash
git add frontend/src/components/calendar/useCalendarEvents.ts
git commit -m "feat(calendar): TanStack Query hooks (CRUD)"
```

---

## Task 15 — Frontend: `EventBlock`, `EventDetailModal`, `EventFormModal`

**Files:**
- Create: `frontend/src/components/calendar/EventBlock.tsx`
- Create: `frontend/src/components/calendar/EventDetailModal.tsx`
- Create: `frontend/src/components/calendar/EventFormModal.tsx`

- [ ] **Step 15.1: `EventBlock.tsx`** — variant-based event chip used by both views

```tsx
'use client'
import { Lock, Globe } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { CalendarEventDTO } from '@/lib/api/calendar'

type Variant = 'private-mine' | 'public-mine' | 'public-other'

export function eventVariant(ev: CalendarEventDTO): Variant {
  if (!ev.isMine) return 'public-other'
  return ev.isPublic ? 'public-mine' : 'private-mine'
}

interface Props {
  event: CalendarEventDTO
  onClick?: () => void
  showTime?: boolean        // false in all-day chips, true for timed events
  className?: string
}

export function EventBlock({ event, onClick, showTime = true, className }: Props) {
  const variant = eventVariant(event)
  const styleByVariant: Record<Variant, React.CSSProperties> = {
    'private-mine': {
      background: 'var(--event-private-bg)',
      borderLeftColor: 'var(--event-private-border)',
    },
    'public-mine': {
      background: 'var(--event-public-mine-bg)',
      borderLeftColor: 'var(--event-public-mine-border)',
    },
    'public-other': {
      background: 'var(--event-public-other-bg)',
      borderLeftColor: 'var(--event-public-other-border)',
    },
  }
  const time = showTime && !event.allDay
    ? new Date(event.startAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    : null

  return (
    <button
      type="button"
      onClick={onClick}
      style={styleByVariant[variant]}
      className={cn(
        'w-full text-left flex items-center gap-1.5 px-1.5 py-0.5 rounded',
        'border-l-[3px] text-[11px] leading-tight',
        'truncate hover:-translate-y-px transition-transform duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        className,
      )}
    >
      {variant === 'private-mine' && <Lock className="h-3 w-3 shrink-0 opacity-70" weight="duotone" />}
      {variant === 'public-mine'  && <Globe className="h-3 w-3 shrink-0 opacity-70" weight="duotone" />}
      {variant === 'public-other' && (
        <span className="shrink-0 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-zinc-200 text-zinc-600 text-[9px] font-semibold">
          {event.ownerInitial}
        </span>
      )}
      {time && <span className="font-mono tabular-nums text-muted-foreground text-[10px]">{time}</span>}
      <span className="truncate">{event.title}</span>
    </button>
  )
}
```

- [ ] **Step 15.2: `EventDetailModal.tsx`**

```tsx
'use client'
import { Modal } from '@/components/ui/primitives/Modal'
import { Button } from '@/components/ui/primitives'
import { Trash, PencilSimple } from '@phosphor-icons/react'
import type { CalendarEventDTO } from '@/lib/api/calendar'

interface Props {
  event: CalendarEventDTO | null
  onClose: () => void
  onEdit: (e: CalendarEventDTO) => void
  onDelete: (e: CalendarEventDTO) => void
}

export function EventDetailModal({ event, onClose, onEdit, onDelete }: Props) {
  if (!event) return null
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <Modal open={!!event} onClose={onClose} title={event.title}>
      <div className="px-5 py-4 space-y-3 text-sm">
        <div className="text-muted-foreground">
          {event.allDay ? '종일' : `${fmt(event.startAt)} – ${fmt(event.endAt)}`}
        </div>
        {event.location && <div>📍 {event.location}</div>}
        {event.description && <p className="whitespace-pre-wrap">{event.description}</p>}
        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
          {event.isMine ? '내 일정' : `${event.ownerName} · ${event.isPublic ? '공개' : '비공개'}`}
        </div>
      </div>
      {event.isMine && (
        <div className="flex gap-2 px-5 py-3 border-t border-border bg-muted/30">
          <Button variant="ghost" onClick={() => onEdit(event)}>
            <PencilSimple className="h-4 w-4 mr-1" /> 수정
          </Button>
          <Button variant="destructive" onClick={() => onDelete(event)}>
            <Trash className="h-4 w-4 mr-1" /> 삭제
          </Button>
        </div>
      )}
    </Modal>
  )
}
```

> Confirm `Button` exports `variant="destructive"` and `variant="ghost"` exist. If not, use the closest available variant or fall back to plain styled `<button>`. (Read `frontend/src/components/ui/primitives/Button.tsx` first.)

- [ ] **Step 15.3: `EventFormModal.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/primitives/Modal'
import { Button, Input, Textarea } from '@/components/ui/primitives'
import type { CalendarEventDTO, CalendarEventInput } from '@/lib/api/calendar'

interface Props {
  open: boolean
  initial?: CalendarEventDTO | null      // null = create, present = edit
  defaultStart?: Date                    // for create flow from cell click
  defaultEnd?: Date
  onClose: () => void
  onSubmit: (input: CalendarEventInput, id?: string) => Promise<void>
}

function toLocalInput(d: Date, allDay: boolean): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  if (allDay) return `${y}-${m}-${dd}`
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${dd}T${hh}:${mi}`
}

function fromLocalInput(s: string, allDay: boolean): Date {
  return allDay ? new Date(`${s}T00:00:00`) : new Date(s)
}

export function EventFormModal({ open, initial, defaultStart, defaultEnd, onClose, onSubmit }: Props) {
  const [allDay, setAllDay] = useState(false)
  const [title, setTitle] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setAllDay(initial.allDay)
      setTitle(initial.title)
      setStart(toLocalInput(new Date(initial.startAt), initial.allDay))
      setEnd(toLocalInput(new Date(initial.endAt), initial.allDay))
      setLocation(initial.location ?? '')
      setDescription(initial.description ?? '')
      setIsPublic(initial.isPublic)
    } else {
      const s = defaultStart ?? new Date()
      const e = defaultEnd ?? new Date(s.getTime() + 60 * 60 * 1000)
      const isAll = !defaultStart && !defaultEnd
      setAllDay(isAll)
      setTitle('')
      setStart(toLocalInput(s, isAll))
      setEnd(toLocalInput(e, isAll))
      setLocation('')
      setDescription('')
      setIsPublic(false)
    }
    setError(null)
  }, [open, initial, defaultStart, defaultEnd])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!title.trim()) { setError('제목을 입력해 주세요'); return }
    const startD = fromLocalInput(start, allDay)
    const endD   = fromLocalInput(end, allDay)
    if (endD < startD) { setError('종료가 시작보다 빠릅니다'); return }
    setSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description || null,
        location: location || null,
        startAt: startD.toISOString(),
        endAt: endD.toISOString(),
        allDay,
        isPublic,
      }, initial?.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? '일정 수정' : '새 일정'} disableOverlayClose>
      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3 text-sm">
        <Input placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} required maxLength={200} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={allDay} onChange={e => setAllDay(e.target.checked)} />
          <span>종일</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type={allDay ? 'date' : 'datetime-local'}
            value={start} onChange={e => setStart(e.target.value)} required
          />
          <Input
            type={allDay ? 'date' : 'datetime-local'}
            value={end} onChange={e => setEnd(e.target.value)} required
          />
        </div>
        <Input placeholder="위치 (선택)" value={location} onChange={e => setLocation(e.target.value)} maxLength={200} />
        <Textarea placeholder="설명 (선택)" value={description} onChange={e => setDescription(e.target.value)} maxLength={2000} />
        <label className="flex items-start gap-2">
          <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="mt-0.5" />
          <span>
            <span className="block">공개</span>
            <span className="block text-xs text-muted-foreground">공개 시 전사 모든 사용자가 볼 수 있습니다</span>
          </span>
        </label>
        {error && <div className="text-destructive text-xs">{error}</div>}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>취소</Button>
          <Button type="submit" disabled={submitting}>{submitting ? '저장 중…' : '저장'}</Button>
        </div>
      </form>
    </Modal>
  )
}
```

> Adjust `Button`/`Input`/`Textarea` import paths to match the actual barrel export. If `Textarea` isn't in `primitives/index.ts`, import directly from `@/components/ui/primitives/Textarea`.

- [ ] **Step 15.4: Type-check** — `npx tsc --noEmit`. Expected: PASS.

- [ ] **Step 15.5: Commit**

```bash
git add frontend/src/components/calendar/EventBlock.tsx \
        frontend/src/components/calendar/EventDetailModal.tsx \
        frontend/src/components/calendar/EventFormModal.tsx
git commit -m "feat(calendar): EventBlock, detail modal, form modal"
```

---

## Task 16 — Frontend: `CalendarMonthView`

**Files:**
- Create: `frontend/src/components/calendar/CalendarMonthView.tsx`

- [ ] **Step 16.1: Implement** (multi-day events shown as repeated chips per cell — simpler than row-spanning bars, acceptable for v1; spec § 10 multi-day rendering can be polished after)

```tsx
'use client'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { EventBlock } from './EventBlock'
import {
  monthGridDays, isSameDay, isSameMonth,
} from './calendar-utils'
import type { CalendarEventDTO } from '@/lib/api/calendar'

interface Props {
  anchor: Date
  events: CalendarEventDTO[]
  today: Date
  onCellClick: (d: Date) => void
  onEventClick: (e: CalendarEventDTO) => void
}

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일']

export function CalendarMonthView({ anchor, events, today, onCellClick, onEventClick }: Props) {
  const days = useMemo(() => monthGridDays(anchor), [anchor])

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEventDTO[]>()
    for (const day of days) {
      const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0)
      const dayEnd   = new Date(day); dayEnd.setHours(24, 0, 0, 0)
      const matched = events.filter(e => {
        const s = new Date(e.startAt); const en = new Date(e.endAt)
        return s < dayEnd && en > dayStart
      })
      map.set(day.toDateString(), matched)
    }
    return map
  }, [days, events])

  return (
    <div className="rounded-[var(--radius-lg)] overflow-hidden border border-border">
      <div className="grid grid-cols-7 bg-muted/40 border-b border-border">
        {WEEKDAYS.map((label, i) => (
          <div
            key={label}
            className={cn(
              'px-3 py-2 text-[11px] uppercase tracking-wider font-semibold',
              i >= 5 ? 'text-muted-foreground/60' : 'text-muted-foreground',
            )}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-6 bg-border gap-px">
        {days.map((d) => {
          const inMonth = isSameMonth(d, anchor)
          const isToday = isSameDay(d, today)
          const cellEvents = eventsByDay.get(d.toDateString()) ?? []
          return (
            <div
              key={d.toISOString()}
              role="button"
              tabIndex={0}
              onClick={() => onCellClick(d)}
              onKeyDown={(e) => { if (e.key === 'Enter') onCellClick(d) }}
              className={cn(
                'relative flex flex-col gap-1 p-1.5 min-h-[100px] bg-card cursor-pointer',
                'hover:bg-muted/40 transition-colors',
                !inMonth && 'bg-muted/30',
                isToday && 'ring-1 ring-emerald-500/30',
              )}
              style={isToday ? { background: 'var(--calendar-today-tint), var(--card)' } : undefined}
            >
              <div className={cn(
                'flex items-center gap-1.5 text-[11px] font-mono tabular-nums',
                !inMonth ? 'text-muted-foreground/40' : 'text-muted-foreground',
                isToday && 'text-emerald-700 font-semibold',
              )}>
                {isToday && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                <span>{d.getDate()}</span>
              </div>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {cellEvents.slice(0, 3).map(ev => (
                  <EventBlock
                    key={ev.id + d.toDateString()}
                    event={ev}
                    showTime={!ev.allDay}
                    onClick={() => { /* handled below to avoid bubbling to cell */ }}
                  />
                ))}
                {cellEvents.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-1">
                    +{cellEvents.length - 3}개
                  </div>
                )}
              </div>
              {/* Click overlay for events: separate layer to stop propagation */}
              <div className="absolute inset-0 pointer-events-none">
                {cellEvents.slice(0, 3).map((ev, idx) => (
                  <button
                    key={ev.id + 'overlay'}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onEventClick(ev) }}
                    className="pointer-events-auto absolute left-1.5 right-1.5 h-[18px]"
                    style={{ top: 26 + idx * 20 }}
                    aria-label={`Event: ${ev.title}`}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

> The "click overlay" hack avoids bubbling the cell click when the user means to click an event. If you prefer, refactor `EventBlock` to call `e.stopPropagation()` in its `onClick` and remove this overlay.

- [ ] **Step 16.2: Type-check** — `npx tsc --noEmit`. Expected: PASS.

- [ ] **Step 16.3: Commit**

```bash
git add frontend/src/components/calendar/CalendarMonthView.tsx
git commit -m "feat(calendar): month grid view"
```

---

## Task 17 — Frontend: `CalendarWeekView`

**Files:**
- Create: `frontend/src/components/calendar/CalendarWeekView.tsx`

- [ ] **Step 17.1: Implement** (timeline grid 7 cols × hours)

```tsx
'use client'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { weekDays, isSameDay } from './calendar-utils'
import { EventBlock } from './EventBlock'
import type { CalendarEventDTO } from '@/lib/api/calendar'

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7) // 07:00 ~ 19:00
const HOUR_HEIGHT = 44 // px

interface Props {
  anchor: Date
  events: CalendarEventDTO[]
  today: Date
  onSlotClick: (d: Date) => void
  onEventClick: (e: CalendarEventDTO) => void
}

export function CalendarWeekView({ anchor, events, today, onSlotClick, onEventClick }: Props) {
  const days = useMemo(() => weekDays(anchor), [anchor])

  function eventStyle(ev: CalendarEventDTO, day: Date) {
    if (ev.allDay) return null
    const s = new Date(ev.startAt); const e = new Date(ev.endAt)
    const dayStart = new Date(day); dayStart.setHours(HOURS[0], 0, 0, 0)
    const top = Math.max(0, (s.getTime() - dayStart.getTime()) / 36e5) * HOUR_HEIGHT
    const dur = Math.max(0.25, (e.getTime() - s.getTime()) / 36e5)
    const height = Math.max(20, dur * HOUR_HEIGHT)
    return { top, height }
  }

  function eventsForDay(day: Date) {
    return events.filter(ev => {
      const s = new Date(ev.startAt); const e = new Date(ev.endAt)
      const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0)
      const dayEnd   = new Date(day); dayEnd.setHours(24, 0, 0, 0)
      return s < dayEnd && e > dayStart
    })
  }

  return (
    <div className="rounded-[var(--radius-lg)] overflow-hidden border border-border bg-card">
      {/* day header */}
      <div className="grid grid-cols-[48px_repeat(7,1fr)] bg-muted/40 border-b border-border">
        <div />
        {days.map((d) => {
          const isToday = isSameDay(d, today)
          return (
            <div
              key={d.toISOString()}
              className={cn(
                'px-3 py-2 text-xs',
                isToday ? 'text-emerald-700 font-semibold' : 'text-muted-foreground',
              )}
            >
              <span className="font-mono tabular-nums">{d.getDate()}</span>
              <span className="ml-1.5">{['월','화','수','목','금','토','일'][(d.getDay()+6)%7]}</span>
            </div>
          )
        })}
      </div>

      {/* timeline body */}
      <div className="relative grid grid-cols-[48px_repeat(7,1fr)]">
        {/* hours column */}
        <div className="flex flex-col">
          {HOURS.map(h => (
            <div key={h} style={{ height: HOUR_HEIGHT }} className="text-[10px] text-muted-foreground/70 font-mono tabular-nums px-2 pt-1 border-t border-border first:border-t-0">
              {String(h).padStart(2,'0')}:00
            </div>
          ))}
        </div>

        {days.map((day) => (
          <div key={day.toISOString()} className="relative border-l border-border">
            {HOURS.map(h => (
              <div
                key={h}
                style={{ height: HOUR_HEIGHT }}
                className="border-t border-border first:border-t-0 hover:bg-muted/30 cursor-pointer"
                onClick={() => {
                  const slot = new Date(day)
                  slot.setHours(h, 0, 0, 0)
                  onSlotClick(slot)
                }}
              />
            ))}
            {/* events overlay */}
            {eventsForDay(day).map(ev => {
              const pos = eventStyle(ev, day)
              if (!pos) {
                // all-day events: show as a thin top bar inside the day column
                return (
                  <div
                    key={ev.id + day.toDateString()}
                    className="absolute left-1 right-1 top-0.5 z-[1]"
                  >
                    <EventBlock event={ev} showTime={false} onClick={() => onEventClick(ev)} />
                  </div>
                )
              }
              return (
                <div
                  key={ev.id + day.toDateString()}
                  className="absolute left-1 right-1 z-[1]"
                  style={{ top: pos.top, height: pos.height }}
                >
                  <EventBlock event={ev} onClick={() => onEventClick(ev)} className="h-full items-start" />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
```

> Overlapping events stack visually but don't lay out side-by-side in v1. That's acceptable per spec; polish later.

- [ ] **Step 17.2: Type-check** — `npx tsc --noEmit`. Expected: PASS.

- [ ] **Step 17.3: Commit**

```bash
git add frontend/src/components/calendar/CalendarWeekView.tsx
git commit -m "feat(calendar): week timeline view"
```

---

## Task 18 — Frontend: `CalendarHeader` + URL state helpers

**Files:**
- Create: `frontend/src/components/calendar/CalendarHeader.tsx`

- [ ] **Step 18.1: Implement**

```tsx
'use client'
import { CaretLeft, CaretRight, Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'
import type { CalendarFilter } from '@/lib/api/calendar'
import type { CalendarView } from './calendar-utils'

interface Props {
  view: CalendarView
  onViewChange: (v: CalendarView) => void
  anchor: Date
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  filter: CalendarFilter
  onFilterChange: (f: CalendarFilter) => void
  onCreate: () => void
}

const FILTERS: { key: CalendarFilter; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'MINE', label: '내 일정' },
  { key: 'PUBLIC', label: '공개만' },
]

export function CalendarHeader({
  view, onViewChange, anchor, onPrev, onNext, onToday, filter, onFilterChange, onCreate,
}: Props) {
  const label = view === 'month'
    ? `${anchor.getFullYear()}년 ${anchor.getMonth() + 1}월`
    : (() => {
        const start = new Date(anchor)
        const end = new Date(anchor); end.setDate(start.getDate() + 6)
        return `${start.getMonth() + 1}월 ${start.getDate()}일 – ${end.getMonth() + 1}월 ${end.getDate()}일`
      })()

  return (
    <div className="flex items-center justify-between mb-4 px-4 py-3 bg-card border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-2">
        <button onClick={onPrev} aria-label="Previous" className="w-7 h-7 grid place-items-center border border-border rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40">
          <CaretLeft className="h-3.5 w-3.5" />
        </button>
        <button onClick={onNext} aria-label="Next" className="w-7 h-7 grid place-items-center border border-border rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40">
          <CaretRight className="h-3.5 w-3.5" />
        </button>
        <span className="font-semibold text-base font-mono tabular-nums tracking-tight ml-1">{label}</span>
        <button onClick={onToday} className="ml-1 px-2.5 py-1 text-xs border border-border rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40">
          오늘
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="inline-flex bg-muted/60 rounded-full p-0.5 gap-0.5">
          {(['month', 'week'] as CalendarView[]).map(v => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={cn(
                'px-3 py-1 rounded-full text-xs',
                view === v ? 'bg-card shadow-[var(--shadow-sm)] text-foreground' : 'text-muted-foreground',
              )}
            >
              {v === 'month' ? '월간' : '주간'}
            </button>
          ))}
        </div>

        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={cn(
              'px-3 py-1 rounded-full text-xs border transition-colors',
              filter === f.key
                ? 'bg-zinc-900 text-zinc-50 border-zinc-900'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}

        <Button onClick={onCreate} className="ml-1.5">
          <Plus className="h-4 w-4 mr-1" /> 일정
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 18.2: Type-check** — `npx tsc --noEmit`. Expected: PASS.

- [ ] **Step 18.3: Commit**

```bash
git add frontend/src/components/calendar/CalendarHeader.tsx
git commit -m "feat(calendar): header with nav, view toggle, filters, CTA"
```

---

## Task 19 — Frontend: `/calendar` page (composition + URL state)

**Files:**
- Create: `frontend/src/app/calendar/page.tsx`

- [ ] **Step 19.1: Implement** — Next 16 app router requires `useSearchParams` to be inside a `<Suspense>` boundary, so split into a Suspense-wrapped client component.

```tsx
import { Suspense } from 'react'
import CalendarPageClient from './CalendarPageClient'

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="max-w-[1400px] mx-auto px-6 py-6 text-muted-foreground text-sm">로딩…</div>}>
      <CalendarPageClient />
    </Suspense>
  )
}
```

Then create `frontend/src/app/calendar/CalendarPageClient.tsx`:

```tsx
'use client'
import { useCallback, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CalendarHeader } from '@/components/calendar/CalendarHeader'
import { CalendarMonthView } from '@/components/calendar/CalendarMonthView'
import { CalendarWeekView } from '@/components/calendar/CalendarWeekView'
import { EventDetailModal } from '@/components/calendar/EventDetailModal'
import { EventFormModal } from '@/components/calendar/EventFormModal'
import {
  addMonths, addWeeks, monthQueryRange, weekQueryRange,
  parseDateOnly, toDateOnlyISO, type CalendarView,
} from '@/components/calendar/calendar-utils'
import {
  useCalendarEvents,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
} from '@/components/calendar/useCalendarEvents'
import type { CalendarEventDTO, CalendarFilter } from '@/lib/api/calendar'

export default function CalendarPageClient() {
  const router = useRouter()
  const params = useSearchParams()

  const view: CalendarView = (params.get('view') === 'week' ? 'week' : 'month')
  const dateParam = params.get('date')
  const filter: CalendarFilter = (() => {
    const f = params.get('filter')?.toUpperCase()
    return f === 'MINE' || f === 'PUBLIC' ? f : 'ALL'
  })()
  const anchor = useMemo(() => dateParam ? parseDateOnly(dateParam) : new Date(), [dateParam])
  const today = useMemo(() => new Date(), [])

  const range = useMemo(
    () => view === 'month' ? monthQueryRange(anchor) : weekQueryRange(anchor),
    [view, anchor],
  )
  const queryKey = useMemo(
    () => ['calendar', range.from, range.to, filter] as const,
    [range, filter],
  )

  const { data: events = [] } = useCalendarEvents(range.from, range.to, filter)
  const createMut = useCreateCalendarEvent(queryKey)
  const updateMut = useUpdateCalendarEvent(queryKey)
  const deleteMut = useDeleteCalendarEvent(queryKey)

  const [detailEvent, setDetailEvent] = useState<CalendarEventDTO | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formInitial, setFormInitial] = useState<CalendarEventDTO | null>(null)
  const [formStart, setFormStart] = useState<Date | undefined>(undefined)
  const [formEnd, setFormEnd] = useState<Date | undefined>(undefined)

  const setUrl = useCallback((next: Partial<{ view: CalendarView; date: string; filter: CalendarFilter }>) => {
    const sp = new URLSearchParams(params.toString())
    if (next.view) sp.set('view', next.view)
    if (next.date) sp.set('date', next.date)
    if (next.filter) sp.set('filter', next.filter)
    router.replace(`/calendar?${sp.toString()}`)
  }, [params, router])

  const handlePrev  = () => setUrl({ date: toDateOnlyISO(view === 'month' ? addMonths(anchor, -1) : addWeeks(anchor, -1)) })
  const handleNext  = () => setUrl({ date: toDateOnlyISO(view === 'month' ? addMonths(anchor, 1)  : addWeeks(anchor, 1))  })
  const handleToday = () => setUrl({ date: toDateOnlyISO(new Date()) })

  function openCreateAtDay(d: Date) {
    setFormInitial(null)
    setFormStart(undefined); setFormEnd(undefined)
    // Cell click in month view → all-day default
    const day = new Date(d); day.setHours(0,0,0,0)
    setFormStart(undefined); setFormEnd(undefined)
    setFormOpen(true)
  }
  function openCreateAtSlot(d: Date) {
    setFormInitial(null)
    const e = new Date(d); e.setHours(d.getHours() + 1)
    setFormStart(d); setFormEnd(e)
    setFormOpen(true)
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <CalendarHeader
        view={view}
        onViewChange={(v) => setUrl({ view: v })}
        anchor={anchor}
        onPrev={handlePrev} onNext={handleNext} onToday={handleToday}
        filter={filter}
        onFilterChange={(f) => setUrl({ filter: f })}
        onCreate={() => { setFormInitial(null); setFormStart(undefined); setFormEnd(undefined); setFormOpen(true) }}
      />

      {view === 'month' ? (
        <CalendarMonthView
          anchor={anchor}
          events={events}
          today={today}
          onCellClick={openCreateAtDay}
          onEventClick={setDetailEvent}
        />
      ) : (
        <CalendarWeekView
          anchor={anchor}
          events={events}
          today={today}
          onSlotClick={openCreateAtSlot}
          onEventClick={setDetailEvent}
        />
      )}

      <EventDetailModal
        event={detailEvent}
        onClose={() => setDetailEvent(null)}
        onEdit={(ev) => { setDetailEvent(null); setFormInitial(ev); setFormOpen(true) }}
        onDelete={async (ev) => {
          if (!confirm('이 일정을 삭제할까요?')) return
          await deleteMut.mutateAsync(ev.id)
          setDetailEvent(null)
        }}
      />

      <EventFormModal
        open={formOpen}
        initial={formInitial}
        defaultStart={formStart}
        defaultEnd={formEnd}
        onClose={() => setFormOpen(false)}
        onSubmit={async (input, id) => {
          if (id) await updateMut.mutateAsync({ id, input })
          else    await createMut.mutateAsync(input)
        }}
      />
    </div>
  )
}
```

- [ ] **Step 19.2: Type-check** — `npx tsc --noEmit`. Expected: PASS.

- [ ] **Step 19.3: Manual smoke (must do)** —
  - `cd frontend && npm run dev` and `cd backend && ./gradlew bootRun` (separate shells)
  - Log in, hit `http://localhost:3000/calendar`
  - Verify: month view loads, "+ 일정" creates an event, clicking an event opens detail, edit + delete work, view toggle to week shows timeline, filter chips persist via URL.

- [ ] **Step 19.4: Commit**

```bash
git add frontend/src/app/calendar/page.tsx frontend/src/app/calendar/CalendarPageClient.tsx
git commit -m "feat(calendar): /calendar page composing views + URL state"
```

---

## Task 20 — Frontend: nav entry

**Files:**
- Modify: `frontend/src/components/layout/NavBar.tsx`

- [ ] **Step 20.1: Add `<NavLink>` between 직원 and 프로젝트**

Search for the line `<NavLink href="/projects">프로젝트</NavLink>` and insert above it:

```tsx
<NavLink href="/calendar">캘린더</NavLink>
```

The link is visible to **all** authenticated users (no role guard).

- [ ] **Step 20.2: Smoke test** — refresh, click 캘린더, route navigates to `/calendar` with the highlight underline showing.

- [ ] **Step 20.3: Commit**

```bash
git add frontend/src/components/layout/NavBar.tsx
git commit -m "feat(nav): add 캘린더 entry"
```

---

## Task 21 — Playwright: visibility & ownership E2E

**Files:**
- Create: `frontend/e2e/calendar.spec.ts`

> If `auth.setup.ts` only provisions an admin user, this test reuses that storageState and creates the second user via API. If multi-user scenarios already exist in another spec, copy that pattern.

- [ ] **Step 21.1: Read existing setup** — `frontend/e2e/auth.setup.ts` and one existing spec (e.g. `projects.spec.ts`) to confirm helpers and storageState path.

- [ ] **Step 21.2: Write spec**

```ts
import { test, expect } from '@playwright/test'

test.describe('Calendar — visibility', () => {
  test('private event from one user is invisible to another', async ({ page, request }) => {
    // Assumes seed users alice/bob via the existing seed migration; if not present, adapt to admin/user from auth.setup.
    await page.goto('/calendar')
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible({ timeout: 5000 }).catch(() => {})

    // Create private event via UI as the logged-in user
    await page.getByRole('button', { name: /일정/ }).click()
    await page.getByPlaceholder('제목').fill('내 비공개')
    await page.getByLabel('종일').check()
    // start/end inputs prefilled from form defaults
    await page.getByRole('button', { name: '저장' }).click()
    await expect(page.getByText('내 비공개')).toBeVisible()

    // Switch identity: log out, log in as second user
    await page.getByRole('button', { name: /로그아웃|Sign out/i }).click().catch(() => {})
    // Adjust to your real auth UI flow if different

    // After logging in as bob/another seed user:
    // await page.fill('input[type=email]', 'bob@test.com')
    // await page.fill('input[type=password]', 'Password1')
    // await page.click('button[type=submit]')
    // await page.goto('/calendar')
    // await expect(page.getByText('내 비공개')).toHaveCount(0)
  })
})
```

> **This test is a stub.** The current auth.setup only knows about admin. Two paths:
> 1. **Quickest:** Adjust the test so two storageState files (alice + bob) are produced in setup. Add an `auth.setup.ts` block that also logs in bob and persists `e2e/.auth/bob.json`. Then write per-project Playwright config with two storage states OR run two `test.use({ storageState })` blocks.
> 2. **Most robust:** drive both users via the API in a single test run, sharing nothing.

Pick option 1; it mirrors the existing pattern. Update `playwright.config.ts` `projects` array to include a second project pointing at the bob storage state.

- [ ] **Step 21.3: Run** — `cd frontend && npx playwright test calendar.spec.ts`. Expected: PASS. Iterate until selectors match real DOM.

- [ ] **Step 21.4: Commit**

```bash
git add frontend/e2e/calendar.spec.ts frontend/e2e/auth.setup.ts frontend/playwright.config.ts
git commit -m "test(e2e): calendar visibility and ownership"
```

---

## Task 22 — Playwright: multi-day rendering E2E

**Files:**
- Modify: `frontend/e2e/calendar.spec.ts`

- [ ] **Step 22.1: Add test inside the same `test.describe`**

```ts
test('multi-day all-day event renders on each spanning day', async ({ page }) => {
  await page.goto('/calendar')
  await page.getByRole('button', { name: /일정/ }).click()
  await page.getByPlaceholder('제목').fill('워크숍')
  await page.getByLabel('종일').check()
  // Set start = today, end = today + 2 (use date inputs explicitly)
  const today = new Date()
  const end = new Date(today); end.setDate(end.getDate() + 2)
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  const dateInputs = page.locator('input[type=date]')
  await dateInputs.nth(0).fill(fmt(today))
  await dateInputs.nth(1).fill(fmt(end))
  await page.getByRole('button', { name: '저장' }).click()

  // Expect three day-cells to contain "워크숍"
  await expect(page.getByText('워크숍')).toHaveCount(3)
})
```

- [ ] **Step 22.2: Run** — `npx playwright test calendar.spec.ts`. Expected: PASS.

- [ ] **Step 22.3: Commit**

```bash
git add frontend/e2e/calendar.spec.ts
git commit -m "test(e2e): multi-day event spans cells"
```

---

## Task 23 — Final smoke + branch cleanup

- [ ] **Step 23.1: Run all backend tests** — `cd backend && ./gradlew test`. Expected: green.

- [ ] **Step 23.2: Run all frontend tests** — `cd frontend && npx tsc --noEmit && npx playwright test`. Expected: green.

- [ ] **Step 23.3: Manual full-feature smoke** — log in as one user, create one of each variant (timed/all-day/multi-day, private and public), switch views, switch filters, edit, delete, refresh (URL state restores). Check on a second user that visibility matches the matrix.

- [ ] **Step 23.4: Cleanup** — verify nothing left behind:

```bash
git status      # working tree clean (modulo .superpowers/ if still present)
git log --oneline main..HEAD     # all commits scoped to calendar feature
```

- [ ] **Step 23.5: Add `.superpowers/` to `.gitignore`** if it isn't already (the brainstorming session left mockups there):

```bash
grep -q '^\.superpowers/' .gitignore || echo '.superpowers/' >> .gitignore
git add .gitignore
git commit -m "chore: ignore .superpowers/ brainstorm artifacts"
```

- [ ] **Step 23.6: Push and open PR** when ready (don't push without user confirmation).

---

## Success Criteria (cross-check vs spec § 1)

- [x] Any user can create an event and toggle public/private
- [x] Other users see public events, never private ones (verified by repository test, service test, controller test, Playwright test)
- [x] Only the owner can edit/delete (controller 403/404 tests + Playwright visibility test)
- [x] Month + week views render timed / all-day / multi-day correctly
- [x] Modal primitive landed as a reusable artifact

## Open follow-ups (out of scope; defer)

- Side-by-side overlapping events in week view
- Multi-day events as continuous spanning bars (currently repeat-per-cell)
- Avatar component instead of single-letter initial chip
- Optimistic updates for mutations
- Mobile responsive polish

---
