# Phase 1 UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement five high-impact UX improvements identified in user research — skill filter in employee directory, top-skills display on EmployeeCard, 80/90% allocation soft alerts on admin dashboard, proficiency level tooltips, and a clearer deactivation confirmation modal.

**Architecture:** Three backend changes (new EmployeeSummary field, new EmployeeRepository query, new SkillTag DTO) enable four frontend improvements. Each task is independently deployable. No new tables or domain models are required.

**Tech Stack:** Kotlin + Spring Boot + JPA (backend), Next.js 14 App Router + React Query + Tailwind CSS (frontend)

---

## File Map

### Backend — files to modify
- `backend/src/main/kotlin/com/company/workforce/api/employee/dto/EmployeeSummary.kt` — add `topSkills` field
- `backend/src/main/kotlin/com/company/workforce/api/employee/EmployeeService.kt` — inject SkillRepository, populate topSkills in toSummary(), add skillIds + maxAllocationPercent params to list()
- `backend/src/main/kotlin/com/company/workforce/api/employee/EmployeeController.kt` — expose new query params on GET /api/employees
- `backend/src/main/kotlin/com/company/workforce/domain/employee/EmployeeRepository.kt` — extend search() query with skill join and allocation cap subquery

### Backend — new files
- `backend/src/main/kotlin/com/company/workforce/api/employee/dto/SkillTag.kt` — lightweight DTO: skillId, name, proficiency

### Frontend — files to modify
- `frontend/src/lib/types/index.ts` — add SkillTag type, add topSkills to EmployeeSummary
- `frontend/src/lib/api/employees.ts` — add skillIds + maxAllocationPercent to listEmployees params
- `frontend/src/lib/hooks/useEmployees.ts` — pass new params through
- `frontend/src/app/employees/page.tsx` — add skill multi-select filter + allocation cap slider UI
- `frontend/src/components/ui/EmployeeCard.tsx` — render topSkills badges + color-coded allocation bar
- `frontend/src/app/admin/dashboard/page.tsx` — color-code 80/90/100% rows in topOverAllocated list
- `frontend/src/components/ui/primitives/ProgressBar.tsx` — accept optional `variant` prop (default/warning/danger)

### Frontend — new files
- `frontend/src/components/ui/SkillFilterPanel.tsx` — multi-select skill dropdown used by employees/page.tsx

---

## Task 1: Backend — SkillTag DTO

**Files:**
- Create: `backend/src/main/kotlin/com/company/workforce/api/employee/dto/SkillTag.kt`

- [ ] **Step 1: Create SkillTag.kt**

```kotlin
package com.company.workforce.api.employee.dto

import java.util.UUID

data class SkillTag(
    val skillId: UUID,
    val name: String,
    val proficiency: String
)
```

- [ ] **Step 2: Verify it compiles**

```bash
cd backend && ./gradlew compileKotlin
```

Expected: BUILD SUCCESSFUL

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/kotlin/com/company/workforce/api/employee/dto/SkillTag.kt
git commit -m "feat: add SkillTag DTO for employee summary"
```

---

## Task 2: Backend — Add topSkills to EmployeeSummary

**Files:**
- Modify: `backend/src/main/kotlin/com/company/workforce/api/employee/dto/EmployeeSummary.kt`

- [ ] **Step 1: Add topSkills field to EmployeeSummary**

Replace the existing data class with:

```kotlin
package com.company.workforce.api.employee.dto

import java.util.UUID

data class EmployeeSummary(
    val id: UUID,
    val fullName: String,
    val email: String,
    val department: String,
    val team: String?,
    val jobTitle: String,
    val employmentType: String,
    val totalAllocationPercent: Long,
    val topSkills: List<SkillTag> = emptyList()
)
```

- [ ] **Step 2: Compile**

```bash
cd backend && ./gradlew compileKotlin
```

Expected: BUILD SUCCESSFUL (default value means existing callers don't break)

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/kotlin/com/company/workforce/api/employee/dto/EmployeeSummary.kt
git commit -m "feat: add topSkills to EmployeeSummary DTO"
```

---

## Task 3: Backend — Extend EmployeeRepository search with skill filter

**Files:**
- Modify: `backend/src/main/kotlin/com/company/workforce/domain/employee/EmployeeRepository.kt`

- [ ] **Step 1: Replace the search() query**

```kotlin
@Query("""
    SELECT DISTINCT e FROM Employee e
    LEFT JOIN EmployeeSkill es ON es.employeeId = e.id
    WHERE e.isActive = true
    AND (:search IS NULL OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
    AND (:department IS NULL OR e.department = CAST(:department AS string))
    AND (:#{#employmentType} IS NULL OR e.employmentType = :#{#employmentType})
    AND (:#{#skillIds} IS NULL OR es.skillId IN :#{#skillIds})
    AND (
        :maxAllocationPercent IS NULL OR
        (SELECT COALESCE(SUM(pa.allocationPercent), 0)
         FROM ProjectAssignment pa
         WHERE pa.employeeId = e.id
           AND pa.isActive = true
           AND pa.startDate <= CURRENT_DATE
           AND (pa.endDate IS NULL OR pa.endDate >= CURRENT_DATE)
        ) <= :maxAllocationPercent
    )
""")
fun search(
    search: String?,
    department: String?,
    @Param("employmentType") employmentType: EmploymentType?,
    @Param("skillIds") skillIds: List<UUID>?,
    maxAllocationPercent: Int?,
    pageable: Pageable
): Page<Employee>
```

Full file after edit:

```kotlin
package com.company.workforce.domain.employee

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDate
import java.util.UUID

interface EmployeeRepository : JpaRepository<Employee, UUID> {

    fun findByEmail(email: String): Employee?

    @Query("""
        SELECT DISTINCT e FROM Employee e
        LEFT JOIN EmployeeSkill es ON es.employeeId = e.id
        WHERE e.isActive = true
        AND (:search IS NULL OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
        AND (:department IS NULL OR e.department = CAST(:department AS string))
        AND (:#{#employmentType} IS NULL OR e.employmentType = :#{#employmentType})
        AND (:#{#skillIds} IS NULL OR es.skillId IN :#{#skillIds})
        AND (
            :maxAllocationPercent IS NULL OR
            (SELECT COALESCE(SUM(pa.allocationPercent), 0)
             FROM ProjectAssignment pa
             WHERE pa.employeeId = e.id
               AND pa.isActive = true
               AND pa.startDate <= CURRENT_DATE
               AND (pa.endDate IS NULL OR pa.endDate >= CURRENT_DATE)
            ) <= :maxAllocationPercent
        )
    """)
    fun search(
        search: String?,
        department: String?,
        @Param("employmentType") employmentType: EmploymentType?,
        @Param("skillIds") skillIds: List<UUID>?,
        maxAllocationPercent: Int?,
        pageable: Pageable
    ): Page<Employee>

    @Query("""
        SELECT e FROM Employee e WHERE e.isActive = true
        AND (100 - (
            SELECT COALESCE(SUM(pa.allocationPercent), 0)
            FROM ProjectAssignment pa
            WHERE pa.employeeId = e.id AND pa.isActive = true
              AND pa.startDate <= CURRENT_DATE
              AND (pa.endDate IS NULL OR pa.endDate >= CURRENT_DATE)
        )) >= :minAvailable
        AND NOT EXISTS (
            SELECT pa FROM ProjectAssignment pa
            WHERE pa.employeeId = e.id AND pa.isActive = true
              AND pa.allocationPercent = 100
              AND pa.startDate <= :fromDate
              AND (pa.endDate IS NULL OR pa.endDate >= :toDate)
        )
    """)
    fun findAvailable(
        minAvailable: Int,
        fromDate: LocalDate,
        toDate: LocalDate,
        pageable: Pageable
    ): Page<Employee>
}
```

- [ ] **Step 2: Compile**

```bash
cd backend && ./gradlew compileKotlin
```

Expected: BUILD SUCCESSFUL

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/kotlin/com/company/workforce/domain/employee/EmployeeRepository.kt
git commit -m "feat: add skill filter and allocation cap to employee directory search"
```

---

## Task 4: Backend — Wire new params through Service and Controller

**Files:**
- Modify: `backend/src/main/kotlin/com/company/workforce/api/employee/EmployeeService.kt`
- Modify: `backend/src/main/kotlin/com/company/workforce/api/employee/EmployeeController.kt`

- [ ] **Step 1: Update EmployeeService**

Add `SkillRepository` and `EmployeeSkillRepository` to constructor. Update `list()` and `toSummary()`.

```kotlin
package com.company.workforce.api.employee

import com.company.workforce.api.common.ConflictException
import com.company.workforce.api.common.ForbiddenException
import com.company.workforce.api.common.NotFoundException
import com.company.workforce.api.common.PageResponse
import com.company.workforce.api.employee.dto.CreateEmployeeRequest
import com.company.workforce.api.employee.dto.EmployeeDetail
import com.company.workforce.api.employee.dto.EmployeeSummary
import com.company.workforce.api.employee.dto.SkillTag
import com.company.workforce.api.employee.dto.UpdateEmployeeRequest
import com.company.workforce.domain.allocation.ProjectAssignmentRepository
import com.company.workforce.domain.employee.Employee
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.employee.EmploymentType
import com.company.workforce.domain.skill.EmployeeSkillRepository
import com.company.workforce.domain.skill.SkillRepository
import com.company.workforce.domain.user.User
import com.company.workforce.domain.user.UserRepository
import com.company.workforce.domain.user.UserRole
import org.springframework.data.domain.Pageable
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.UUID

@Service
@Transactional
class EmployeeService(
    private val employeeRepository: EmployeeRepository,
    private val userRepository: UserRepository,
    private val assignmentRepository: ProjectAssignmentRepository,
    private val employeeSkillRepository: EmployeeSkillRepository,
    private val skillRepository: SkillRepository,
    private val passwordEncoder: PasswordEncoder
) {

    @Transactional(readOnly = true)
    fun list(
        search: String?,
        department: String?,
        employmentType: EmploymentType?,
        skillIds: List<UUID>?,
        maxAllocationPercent: Int?,
        pageable: Pageable
    ): PageResponse<EmployeeSummary> {
        val page = employeeRepository.search(search, department, employmentType, skillIds?.takeIf { it.isNotEmpty() }, maxAllocationPercent, pageable)
        return PageResponse(
            data = page.content.map { it.toSummary() },
            page = pageable.pageNumber + 1,
            pageSize = pageable.pageSize,
            total = page.totalElements
        )
    }

    @Transactional(readOnly = true)
    fun getDetail(id: UUID): EmployeeDetail =
        employeeRepository.findById(id)
            .orElseThrow { NotFoundException("Employee not found") }
            .toDetail()

    fun create(request: CreateEmployeeRequest): EmployeeDetail {
        if (employeeRepository.findByEmail(request.email) != null || userRepository.findByEmail(request.email) != null)
            throw ConflictException("Email already in use")
        val employee = employeeRepository.save(
            Employee(
                fullName = request.fullName,
                email = request.email,
                phone = request.phone,
                department = request.department,
                team = request.team,
                jobTitle = request.jobTitle,
                grade = request.grade,
                employmentType = request.employmentType,
                hiredAt = request.hiredAt
            )
        )
        userRepository.save(
            User(
                email = request.email,
                passwordHash = passwordEncoder.encode(request.password),
                role = UserRole.EMPLOYEE,
                employeeId = employee.id
            )
        )
        return employee.toDetail()
    }

    fun update(id: UUID, request: UpdateEmployeeRequest, callerUser: User): EmployeeDetail {
        val employee = employeeRepository.findById(id)
            .orElseThrow { NotFoundException("Employee not found") }
        if (callerUser.role != UserRole.ADMIN && callerUser.employeeId != id)
            throw ForbiddenException("Cannot edit another employee")
        if (callerUser.role == UserRole.ADMIN) {
            request.fullName?.let { employee.fullName = it }
            request.email?.let { newEmail ->
                if (newEmail != employee.email) {
                    if (employeeRepository.findByEmail(newEmail) != null || userRepository.findByEmail(newEmail) != null)
                        throw ConflictException("Email already in use")
                    employee.email = newEmail
                    userRepository.findByEmployeeId(id)?.let { user ->
                        user.email = newEmail
                        userRepository.save(user)
                    }
                }
            }
            request.department?.let { employee.department = it }
            request.jobTitle?.let { employee.jobTitle = it }
            request.employmentType?.let { employee.employmentType = it }
            request.hiredAt?.let { employee.hiredAt = it }
        }
        request.phone?.let { employee.phone = it }
        request.team?.let { employee.team = it }
        request.grade?.let { employee.grade = it }
        return employeeRepository.save(employee).toDetail()
    }

    fun deactivate(id: UUID) {
        val employee = employeeRepository.findById(id)
            .orElseThrow { NotFoundException("Employee not found") }
        employee.isActive = false
        employeeRepository.save(employee)
        userRepository.findByEmployeeId(id)?.let {
            it.isActive = false
            userRepository.save(it)
        }
        assignmentRepository.findByEmployeeId(id)
            .filter { it.isActive }
            .forEach { it.isActive = false; assignmentRepository.save(it) }
    }

    @Transactional(readOnly = true)
    fun listAvailable(
        minAvailablePercent: Int,
        fromDate: LocalDate,
        toDate: LocalDate,
        pageable: Pageable
    ): PageResponse<EmployeeSummary> {
        val page = employeeRepository.findAvailable(minAvailablePercent, fromDate, toDate, pageable)
        return PageResponse(
            data = page.content.map { it.toSummary() },
            page = pageable.pageNumber + 1,
            pageSize = pageable.pageSize,
            total = page.totalElements
        )
    }

    private fun Employee.toSummary(): EmployeeSummary {
        val total = assignmentRepository.sumCurrentAllocation(id)
        val empSkills = employeeSkillRepository.findByEmployeeId(id).take(3)
        val skillIds = empSkills.map { it.skillId }.toSet()
        val skillNameMap = skillRepository.findAllById(skillIds).associate { it.id to it.name }
        val topSkills = empSkills.map { es ->
            SkillTag(skillId = es.skillId, name = skillNameMap[es.skillId] ?: "", proficiency = es.proficiency.name)
        }
        return EmployeeSummary(id, fullName, email, department, team, jobTitle, employmentType.name, total, topSkills)
    }

    private fun Employee.toDetail() = EmployeeDetail(
        id, fullName, email, phone, department, team, jobTitle, grade,
        employmentType.name, hiredAt, isActive, emptyList(), emptyList()
    )
}
```

- [ ] **Step 2: Update EmployeeController**

```kotlin
@GetMapping
fun list(
    @RequestParam search: String?,
    @RequestParam department: String?,
    @RequestParam employmentType: EmploymentType?,
    @RequestParam(required = false) skillIds: List<UUID>?,
    @RequestParam(required = false) maxAllocationPercent: Int?,
    @RequestParam(defaultValue = "1") page: Int,
    @RequestParam(defaultValue = "20") pageSize: Int
) = employeeService.list(search, department, employmentType, skillIds, maxAllocationPercent, PageRequest.of(page - 1, pageSize))
```

- [ ] **Step 3: Build and verify**

```bash
cd backend && ./gradlew build -x test
```

Expected: BUILD SUCCESSFUL

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/kotlin/com/company/workforce/api/employee/EmployeeService.kt \
        backend/src/main/kotlin/com/company/workforce/api/employee/EmployeeController.kt
git commit -m "feat: wire skill filter and topSkills through service and controller"
```

---

## Task 5: Frontend — Update types and API client

**Files:**
- Modify: `frontend/src/lib/types/index.ts`
- Modify: `frontend/src/lib/api/employees.ts`

- [ ] **Step 1: Add SkillTag type and topSkills to EmployeeSummary in types/index.ts**

Add after the Proficiency line:

```typescript
export interface SkillTag {
  skillId: string
  name: string
  proficiency: Proficiency
}
```

Update EmployeeSummary:

```typescript
export interface EmployeeSummary {
  id: string
  fullName: string
  email: string
  department: string
  team: string | null
  jobTitle: string
  employmentType: EmploymentType
  totalAllocationPercent: number
  topSkills: SkillTag[]
}
```

- [ ] **Step 2: Update listEmployees params in employees.ts**

```typescript
export async function listEmployees(params?: {
  search?: string
  department?: string
  skillIds?: string[]
  maxAllocationPercent?: number
  page?: number
  pageSize?: number
}): Promise<PageResponse<EmployeeSummary>> {
  const { data } = await apiClient.get<PageResponse<EmployeeSummary>>('/api/employees', { params })
  return data
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/lib/types/index.ts frontend/src/lib/api/employees.ts
git commit -m "feat: add SkillTag type and skill filter params to employee API client"
```

---

## Task 6: Frontend — SkillFilterPanel component

**Files:**
- Create: `frontend/src/components/ui/SkillFilterPanel.tsx`

- [ ] **Step 1: Create SkillFilterPanel**

```tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listSkills } from '@/lib/api/skills'
import { Funnel, X } from '@phosphor-icons/react'
import type { Skill } from '@/lib/types'

interface Props {
  selectedSkillIds: string[]
  onChange: (ids: string[]) => void
}

export default function SkillFilterPanel({ selectedSkillIds, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { data: skills = [] } = useQuery({ queryKey: ['skills'], queryFn: () => listSkills() })

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggle(id: string) {
    onChange(selectedSkillIds.includes(id) ? selectedSkillIds.filter(s => s !== id) : [...selectedSkillIds, id])
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-md)] border transition-colors ${
          selectedSkillIds.length > 0
            ? 'border-accent bg-accent/10 text-accent'
            : 'border-border hover:border-accent/50'
        }`}
      >
        <Funnel className="h-4 w-4" />
        스킬 필터
        {selectedSkillIds.length > 0 && (
          <span className="bg-accent text-accent-foreground text-xs rounded-full px-1.5 py-0.5 leading-none">
            {selectedSkillIds.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-64 bg-card border border-border rounded-[var(--radius-lg)] shadow-lg p-2 max-h-64 overflow-y-auto">
          {selectedSkillIds.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 px-2"
            >
              <X className="h-3 w-3" /> 전체 해제
            </button>
          )}
          {skills.map((skill: Skill) => (
            <label
              key={skill.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-sm)] hover:bg-muted cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={selectedSkillIds.includes(skill.id)}
                onChange={() => toggle(skill.id)}
                className="rounded"
              />
              <span className="truncate">{skill.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">{skill.category}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/SkillFilterPanel.tsx
git commit -m "feat: add SkillFilterPanel multi-select component"
```

---

## Task 7: Frontend — Employee directory page with skill filter

**Files:**
- Modify: `frontend/src/app/employees/page.tsx`

- [ ] **Step 1: Add skill filter state and SkillFilterPanel to employees/page.tsx**

Replace full file content:

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEmployeeList } from '@/lib/hooks/useEmployees'
import EmployeeCard from '@/components/ui/EmployeeCard'
import SkillFilterPanel from '@/components/ui/SkillFilterPanel'
import { Button, Input, Skeleton, SkeletonCircle, EmptyState, PageTransition, StaggerList, StaggerItem } from '@/components/ui/primitives'
import { Plus, MagnifyingGlass, Users } from '@phosphor-icons/react'
import { Card, CardBody } from '@/components/ui/primitives'

function EmployeeCardSkeleton() {
  return (
    <Card><CardBody>
      <div className="flex items-center gap-3 mb-3">
        <SkeletonCircle />
        <div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/2" /></div>
      </div>
      <Skeleton className="h-1.5 w-full" />
      <Skeleton className="h-3 w-20 mt-1.5" />
    </CardBody></Card>
  )
}

export default function EmployeesPage() {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([])
  const [maxAllocationPercent, setMaxAllocationPercent] = useState<number | undefined>(undefined)
  const [page, setPage] = useState(1)
  const { isAdmin } = useAuth()
  const { data, isLoading, error } = useEmployeeList({
    search: search || undefined,
    department: department || undefined,
    skillIds: selectedSkillIds.length > 0 ? selectedSkillIds : undefined,
    maxAllocationPercent,
    page,
  })

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1

  function resetPage() { setPage(1) }

  return (
    <PageTransition>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">직원 목록</h1>
        {isAdmin && (
          <Link href="/admin/employees/new">
            <Button><Plus className="h-4 w-4" />직원 추가</Button>
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="이름으로 검색..."
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage() }}
            className="pl-9 w-64"
          />
        </div>
        <Input
          placeholder="부서"
          value={department}
          onChange={e => { setDepartment(e.target.value); resetPage() }}
          className="w-40"
        />
        <SkillFilterPanel
          selectedSkillIds={selectedSkillIds}
          onChange={ids => { setSelectedSkillIds(ids); resetPage() }}
        />
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">최대 배정</label>
          <select
            className="text-sm border border-border rounded-[var(--radius-md)] px-2 py-2 bg-background"
            value={maxAllocationPercent ?? ''}
            onChange={e => { setMaxAllocationPercent(e.target.value ? Number(e.target.value) : undefined); resetPage() }}
          >
            <option value="">제한 없음</option>
            <option value="50">50% 이하</option>
            <option value="80">80% 이하</option>
            <option value="100">100% 이하</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="border border-destructive/30 bg-destructive-light rounded-[var(--radius-lg)] px-4 py-3 text-sm text-destructive mb-6">
          직원 목록을 불러오지 못했습니다.
        </div>
      )}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <EmployeeCardSkeleton key={i} />)}
        </div>
      ) : data?.data.length === 0 ? (
        <EmptyState icon={Users} heading="직원을 찾을 수 없습니다" description="검색어나 필터를 조정해 보세요." />
      ) : (
        <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {data?.data.map(emp => (
            <StaggerItem key={emp.id}><EmployeeCard employee={emp} /></StaggerItem>
          ))}
        </StaggerList>
      )}
      {data && totalPages > 1 && (
        <div className="flex items-center gap-2 mt-8 justify-center">
          <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>이전</Button>
          <span className="text-sm text-muted-foreground px-2">{page} / {totalPages} 페이지</span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>다음</Button>
        </div>
      )}
    </PageTransition>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/employees/page.tsx
git commit -m "feat: add skill filter and allocation cap filter to employee directory"
```

---

## Task 8: Frontend — EmployeeCard shows top skills + color-coded allocation

**Files:**
- Modify: `frontend/src/components/ui/EmployeeCard.tsx`
- Modify: `frontend/src/components/ui/primitives/ProgressBar.tsx`

- [ ] **Step 1: Read current ProgressBar**

```bash
cat frontend/src/components/ui/primitives/ProgressBar.tsx
```

- [ ] **Step 2: Add color variant to ProgressBar**

The bar should turn amber at ≥80% and red at ≥100%. Add a `variant` prop derived from the value:

```tsx
interface ProgressBarProps {
  value: number
  className?: string
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100)
  const color =
    clamped >= 100 ? 'bg-destructive' :
    clamped >= 80  ? 'bg-warning' :
    'bg-accent'

  return (
    <div className={`h-1.5 w-full rounded-full bg-muted overflow-hidden ${className ?? ''}`}>
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
```

> **Facilitator note:** Read the actual ProgressBar file first (step 1) and preserve any existing props/structure. Only add the color logic. The exact implementation may differ slightly from above — adapt to fit.

- [ ] **Step 3: Update EmployeeCard to show topSkills badges**

```tsx
import Link from 'next/link'
import { Card, CardBody, Avatar, ProgressBar } from '@/components/ui/primitives'
import type { EmployeeSummary } from '@/lib/types'

const PROFICIENCY_LABEL: Record<string, string> = {
  BEGINNER: '초급',
  INTERMEDIATE: '중급',
  EXPERT: '전문',
}

export default function EmployeeCard({ employee }: { employee: EmployeeSummary }) {
  return (
    <Link href={`/employees/${employee.id}`} className="group">
      <Card className="transition-shadow hover:shadow-md">
        <CardBody>
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={employee.fullName} />
            <div className="min-w-0">
              <p className="font-medium text-sm truncate group-hover:text-accent transition-colors">{employee.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{employee.jobTitle} · {employee.department}</p>
            </div>
          </div>
          <ProgressBar value={employee.totalAllocationPercent} />
          <p className={`text-xs mt-1.5 ${
            employee.totalAllocationPercent >= 100 ? 'text-destructive font-medium' :
            employee.totalAllocationPercent >= 80  ? 'text-warning font-medium' :
            'text-muted-foreground'
          }`}>
            {employee.totalAllocationPercent}% 배정됨
          </p>
          {employee.topSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {employee.topSkills.map(s => (
                <span
                  key={s.skillId}
                  className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                >
                  {s.name}
                  <span className="opacity-60">{PROFICIENCY_LABEL[s.proficiency] ?? s.proficiency}</span>
                </span>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </Link>
  )
}
```

- [ ] **Step 4: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ui/EmployeeCard.tsx \
        frontend/src/components/ui/primitives/ProgressBar.tsx
git commit -m "feat: show top skills and color-coded allocation on EmployeeCard"
```

---

## Task 9: Frontend — Admin dashboard 80/90% soft alerts

**Files:**
- Modify: `frontend/src/app/admin/dashboard/page.tsx`

- [ ] **Step 1: Color-code topOverAllocated list rows**

In the 고할당 직원 section, replace the existing row div:

```tsx
{data.topOverAllocated.map(({ employee, allocationPercent }) => {
  const isOver = allocationPercent >= 100
  const isWarn = allocationPercent >= 80 && allocationPercent < 100
  return (
    <div
      key={employee.id}
      className={`flex items-center gap-4 border rounded-[var(--radius-lg)] p-3 ${
        isOver ? 'border-destructive/40 bg-destructive/5' :
        isWarn ? 'border-warning/40 bg-warning/5' :
        'border-border'
      }`}
    >
      <span className="text-sm font-medium w-40 truncate">{employee.fullName}</span>
      <div className="flex-1"><ProgressBar value={allocationPercent} /></div>
      <span className={`text-sm w-12 text-right font-medium ${
        isOver ? 'text-destructive' : isWarn ? 'text-warning' : 'text-muted-foreground'
      }`}>
        {allocationPercent}%
      </span>
    </div>
  )
})}
```

Also add a section header label to show threshold legend:

```tsx
<div className="flex items-center justify-between mb-4">
  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">고할당 직원</h2>
  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning inline-block" />80%+</span>
    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive inline-block" />100%+</span>
  </div>
</div>
```

- [ ] **Step 2: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/admin/dashboard/page.tsx
git commit -m "feat: add 80/90/100% color-coded soft alerts to admin dashboard"
```

---

## Task 10: Frontend — Proficiency level tooltips at skill entry

**Files:**
- Modify: `frontend/src/components/forms/EmployeeForm.tsx` (or wherever proficiency is selected — check first)

- [ ] **Step 1: Read EmployeeForm to find proficiency select**

```bash
cat frontend/src/components/forms/EmployeeForm.tsx
```

- [ ] **Step 2: Add tooltip definitions near proficiency select**

Find the proficiency `<select>` or equivalent and add helper text below it:

```tsx
{/* After the proficiency select */}
<p className="text-xs text-muted-foreground mt-1">
  초급: 기본 개념 이해 · 중급: 실무 적용 가능 · 전문: 타인 지도 가능
</p>
```

If proficiency is a custom Select component, wrap it and add the description text below. Preserve existing markup — only add the helper text.

- [ ] **Step 3: Check me/page.tsx for skill update UI and add same tooltip**

```bash
cat frontend/src/app/me/page.tsx
```

Add the same helper text wherever proficiency is selected in that page.

- [ ] **Step 4: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/forms/EmployeeForm.tsx frontend/src/app/me/page.tsx
git commit -m "feat: add proficiency level definitions as helper text at skill entry"
```

---

## Task 11: Frontend — Clearer deactivation confirmation modal

**Files:**
- Modify: `frontend/src/app/admin/employees/[id]/edit/page.tsx` (check first — deactivation trigger likely lives here)

- [ ] **Step 1: Read the edit page to find deactivation trigger**

```bash
cat "frontend/src/app/admin/employees/[id]/edit/page.tsx"
```

- [ ] **Step 2: Replace any simple `confirm()` or button with an explicit modal message**

If a `window.confirm()` is used, replace it with a modal-style inline confirmation state:

```tsx
// Add state near top of component
const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false)

// Replace the deactivate button with:
{!showDeactivateConfirm ? (
  <Button variant="destructive" onClick={() => setShowDeactivateConfirm(true)}>
    직원 비활성화
  </Button>
) : (
  <div className="border border-destructive/30 bg-destructive/5 rounded-[var(--radius-lg)] p-4 space-y-3">
    <p className="text-sm font-medium text-destructive">비활성화 확인</p>
    <p className="text-sm text-muted-foreground">
      이 직원은 로그인이 불가능해지고 모든 배정이 해제됩니다.
      데이터는 삭제되지 않으며 관리자가 언제든 복구할 수 있습니다.
    </p>
    <div className="flex gap-2">
      <Button variant="destructive" size="sm" onClick={handleDeactivate}>확인, 비활성화</Button>
      <Button variant="ghost" size="sm" onClick={() => setShowDeactivateConfirm(false)}>취소</Button>
    </div>
  </div>
)}
```

> Adapt to existing component patterns. Preserve existing `handleDeactivate` or mutation call — only change the trigger UI.

- [ ] **Step 3: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add "frontend/src/app/admin/employees/[id]/edit/page.tsx"
git commit -m "feat: replace deactivation confirm() with explicit inline confirmation modal"
```

---

## Final Verification

- [ ] **Backend build**

```bash
cd backend && ./gradlew build -x test
```

Expected: BUILD SUCCESSFUL

- [ ] **Frontend build**

```bash
cd frontend && npm run build
```

Expected: no errors, compiled successfully

- [ ] **Manual smoke test checklist**
  - [ ] Visit /employees — skill filter dropdown appears and filters results
  - [ ] Select a skill — only employees with that skill show
  - [ ] Set max allocation 50% — over-allocated employees disappear
  - [ ] EmployeeCard shows skill badges (if employee has skills)
  - [ ] EmployeeCard allocation bar turns amber at 80%+, red at 100%
  - [ ] Admin dashboard 고할당 rows show amber/red background at 80/100%
  - [ ] Proficiency select shows helper text
  - [ ] Deactivate button shows inline confirmation with descriptive message

---

*Plan generated: 2026-03-25 · Scope: Phase 1 UX improvements from user research*
