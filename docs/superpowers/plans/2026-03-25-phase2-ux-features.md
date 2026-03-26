# Phase 2 UX Features — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement six Phase 2 UX improvements — allocation % preview before save, skill catalog merge/rename, shareable allocation view link for PMs, forward availability projection on employee profile, and skill staleness nudge emails.

**Architecture:** Five independent feature groups: (1) a pure-frontend AllocationForm enhancement; (2) a backend merge endpoint + admin UI; (3) a token-based share system with a public frontend page; (4) a new backend availability projection endpoint + frontend card; (5) email infrastructure (Spring Mail + `@EnableScheduling`) with a weekly staleness scheduler. Items 1–4 share no infrastructure; item 5 adds `skillsLastUpdatedAt` to the Employee entity which is touched only by SkillService.

**Tech Stack:** Kotlin + Spring Boot 3.2 + Spring Mail + JPA (backend), Next.js 14 App Router + React Query + Tailwind CSS (frontend), PostgreSQL + Flyway migrations

> **Scope note:** Item 6 from the Phase 2 spec ("Clear deactivation modal distinguishing soft vs permanent delete") was already shipped as Phase 1 Task 11 — commit `739cca6`. It is excluded from this plan.

---

## File Map

### New Backend Files
- `backend/src/main/resources/db/migration/V14__create_share_tokens.sql` — share token table (Task 4, runs first)
- `backend/src/main/resources/db/migration/V15__add_skills_last_updated_to_employees.sql` — adds `skills_last_updated_at` column (Task 8, runs after)

> **Migration ordering note:** V14 (share_tokens) is created in Task 4 and V15 (skills_last_updated) is created in Task 8. This matches Flyway's sequential requirement — do not swap these numbers. Do not start the backend between tasks unless both migration files already exist.
- `backend/src/main/kotlin/com/company/workforce/domain/share/ShareToken.kt` — share token JPA entity
- `backend/src/main/kotlin/com/company/workforce/domain/share/ShareTokenRepository.kt` — repository
- `backend/src/main/kotlin/com/company/workforce/api/share/dto/ShareLinkResponse.kt` — { token, url, expiresAt }
- `backend/src/main/kotlin/com/company/workforce/api/share/dto/SharedAllocationView.kt` — public read payload
- `backend/src/main/kotlin/com/company/workforce/api/share/ShareService.kt` — creates + resolves tokens
- `backend/src/main/kotlin/com/company/workforce/api/share/ShareController.kt` — POST /api/employees/{id}/share, GET /api/share/{token}
- `backend/src/main/kotlin/com/company/workforce/api/employee/dto/AvailabilityPeriod.kt` — { from, to, availablePercent }
- `backend/src/main/kotlin/com/company/workforce/infrastructure/email/EmailService.kt` — wraps JavaMailSender
- `backend/src/main/kotlin/com/company/workforce/infrastructure/scheduler/SkillStalenessScheduler.kt` — weekly @Scheduled job

### Modified Backend Files
- `backend/build.gradle.kts` — add `spring-boot-starter-mail`
- `backend/src/main/resources/application.yml` — add mail config block
- `backend/src/main/kotlin/com/company/workforce/WorkforceApplication.kt` — add `@EnableScheduling`
- `backend/src/main/kotlin/com/company/workforce/domain/employee/Employee.kt` — add `skillsLastUpdatedAt: LocalDateTime?`
- `backend/src/main/kotlin/com/company/workforce/domain/employee/EmployeeRepository.kt` — add `findStaleSkillEmployees()` query
- `backend/src/main/kotlin/com/company/workforce/domain/allocation/ProjectAssignmentRepository.kt` — add `findActiveWithFutureEndDate()`
- `backend/src/main/kotlin/com/company/workforce/api/employee/EmployeeService.kt` — add `getAvailability()`
- `backend/src/main/kotlin/com/company/workforce/api/employee/EmployeeController.kt` — add `GET /{id}/availability`
- `backend/src/main/kotlin/com/company/workforce/api/skill/SkillService.kt` — update `skillsLastUpdatedAt` in addSkillToEmployee / updateEmployeeSkill / removeEmployeeSkill; add `mergeSkills()`
- `backend/src/main/kotlin/com/company/workforce/api/skill/SkillController.kt` — add `POST /api/admin/skills/merge`
- `backend/src/main/kotlin/com/company/workforce/config/SecurityConfig.kt` — permit `/api/share/**`

### New Frontend Files
- `frontend/src/app/share/[token]/page.tsx` — public read-only allocation view
- `frontend/src/lib/api/share.ts` — share API client

### Modified Frontend Files
- `frontend/src/lib/types/index.ts` — add `AvailabilityPeriod`, `ShareLinkResponse` types
- `frontend/src/lib/api/employees.ts` — add `getEmployeeAvailability()`
- `frontend/src/lib/api/skills.ts` — add `mergeSkills()`
- `frontend/src/components/forms/AllocationForm.tsx` — live allocation total preview
- `frontend/src/app/employees/[id]/page.tsx` — add availability projection card
- `frontend/src/app/admin/skills/page.tsx` — add merge skill UI column

---

## Task 1: Frontend — Allocation % preview in AllocationForm

**Files:**
- Modify: `frontend/src/components/forms/AllocationForm.tsx`

The form already shows each employee's `totalAllocationPercent` in the `<option>` text. We need to show a live "new total" preview below the allocation % input — so the admin sees the impact before hitting save.

- [ ] **Step 1: Add preview logic**

In `AllocationForm.tsx`, find the allocation % `<div>` inside the `grid grid-cols-2 gap-4` section. It is the second column (after `역할`) and looks exactly like this (do not change the surrounding grid div):

```tsx
        <div>
          <label className="block text-sm font-medium mb-1.5">할당률 % *</label>
          <Input type="number" min={1} max={100} value={form.allocationPercent}
            onChange={e => setForm(f => ({ ...f, allocationPercent: +e.target.value }))} required />
        </div>
```

Replace **only that `<div>…</div>` block** (keep the surrounding `grid` wrapper and all sibling fields intact) with:

```tsx
        <div>
          <label className="block text-sm font-medium mb-1.5">할당률 % *</label>
          <Input type="number" min={1} max={100} value={form.allocationPercent}
            onChange={e => setForm(f => ({ ...f, allocationPercent: +e.target.value }))} required />
          {form.employeeId && (() => {
            const emp = employees?.data.find(e => e.id === form.employeeId)
            if (!emp) return null
            const current = initialData
              ? emp.totalAllocationPercent - (initialData.allocationPercent ?? 0)
              : emp.totalAllocationPercent
            const newTotal = current + form.allocationPercent
            return (
              <p className={`text-xs mt-1 ${
                newTotal > 100 ? 'text-destructive font-medium' :
                newTotal >= 80  ? 'text-warning font-medium' :
                'text-muted-foreground'
              }`}>
                현재 {current}% → 저장 시 {newTotal}%
                {newTotal > 100 && ' ⚠ 초과'}
              </p>
            )
          })()}
        </div>
```

- [ ] **Step 2: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/forms/AllocationForm.tsx
git commit -m "feat: show allocation % total preview before save in AllocationForm"
```

---

## Task 2: Backend — Skill merge endpoint

**Files:**
- Modify: `backend/src/main/kotlin/com/company/workforce/api/skill/SkillService.kt`
- Modify: `backend/src/main/kotlin/com/company/workforce/api/skill/SkillController.kt`

Merge merges `sourceId` into `targetId`: all EmployeeSkill rows pointing at `sourceId` are re-pointed to `targetId` (skipping if the employee already has `targetId`), then the source Skill is deleted.

- [ ] **Step 1: Add `mergeSkills()` to SkillService**

Add at the end of the class (before the closing brace):

```kotlin
fun mergeSkills(sourceId: UUID, targetId: UUID) {
    if (sourceId == targetId) throw ConflictException("Source and target cannot be the same")
    val source = skillRepository.findById(sourceId).orElseThrow { NotFoundException("Source skill not found") }
    skillRepository.findById(targetId).orElseThrow { NotFoundException("Target skill not found") }

    val sourceAssignments = employeeSkillRepository.findBySkillId(sourceId)
    for (es in sourceAssignments) {
        val alreadyHasTarget = employeeSkillRepository.existsByEmployeeIdAndSkillId(es.employeeId, targetId)
        if (alreadyHasTarget) {
            employeeSkillRepository.delete(es)
        } else {
            // re-point to target (delete + re-insert to avoid composite key constraint issues)
            employeeSkillRepository.delete(es)
            employeeSkillRepository.save(EmployeeSkill(
                employeeId = es.employeeId,
                skillId = targetId,
                proficiency = es.proficiency,
                certified = es.certified,
                note = es.note
            ))
        }
    }
    skillRepository.delete(source)
}
```

- [ ] **Step 2: Add `findBySkillId` to EmployeeSkillRepository**

Open `backend/src/main/kotlin/com/company/workforce/domain/skill/EmployeeSkillRepository.kt` and add:

```kotlin
fun findBySkillId(skillId: UUID): List<EmployeeSkill>
```

- [ ] **Step 3: Add merge endpoint to SkillController**

Add a data class and endpoint. At the top of the file, add after imports:

```kotlin
data class MergeSkillsRequest(val sourceId: UUID, val targetId: UUID)
```

Add endpoint to `SkillController`:

```kotlin
@PostMapping("/api/admin/skills/merge")
@PreAuthorize("hasRole('ADMIN')")
@ResponseStatus(HttpStatus.NO_CONTENT)
fun mergeSkills(@RequestBody req: MergeSkillsRequest) = skillService.mergeSkills(req.sourceId, req.targetId)
```

- [ ] **Step 4: Build**

```bash
cd backend && ./gradlew compileKotlin
```

Expected: BUILD SUCCESSFUL

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/kotlin/com/company/workforce/api/skill/SkillService.kt \
        backend/src/main/kotlin/com/company/workforce/api/skill/SkillController.kt \
        backend/src/main/kotlin/com/company/workforce/domain/skill/EmployeeSkillRepository.kt
git commit -m "feat: add skill merge endpoint (POST /api/admin/skills/merge)"
```

---

## Task 3: Frontend — Skill merge UI in admin skills page

**Files:**
- Modify: `frontend/src/lib/api/skills.ts`
- Modify: `frontend/src/app/admin/skills/page.tsx`

- [ ] **Step 1: Add `mergeSkills` to skills API client**

Add to `frontend/src/lib/api/skills.ts`:

```typescript
export async function mergeSkills(sourceId: string, targetId: string): Promise<void> {
  await apiClient.post('/api/admin/skills/merge', { sourceId, targetId })
}
```

- [ ] **Step 2: Add merge UI to admin skills page**

The merge flow: each skill row gets a "병합" button; clicking it enters "merge source" selection mode where the user then clicks a different skill row to become the target, then confirms. Replace the full page file:

```tsx
'use client'
import { useState } from 'react'
import AdminGuard from '@/components/guards/AdminGuard'
import { useSkillList, useCreateSkill, useUpdateSkill, useDeleteSkill } from '@/lib/hooks/useSkills'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mergeSkills } from '@/lib/api/skills'
import type { Skill } from '@/lib/types'
import { Card, CardBody, Input, Button, EmptyState, PageTransition } from '@/components/ui/primitives'
import { PencilSimple, Trash, Tag, Plus, WarningCircle, ArrowsLeftRight } from '@phosphor-icons/react'

export default function AdminSkillsPage() {
  const { data: skills } = useSkillList()
  const { mutate: create, isPending: creating } = useCreateSkill()
  const { mutate: update } = useUpdateSkill()
  const { mutate: del, error: deleteError } = useDeleteSkill()
  const queryClient = useQueryClient()
  const { mutate: merge, isPending: merging } = useMutation({
    mutationFn: ({ sourceId, targetId }: { sourceId: string; targetId: string }) =>
      mergeSkills(sourceId, targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      setMergeSourceId(null)
    },
  })

  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', category: '' })
  const [mergeSourceId, setMergeSourceId] = useState<string | null>(null)

  const deleteMsg = (deleteError as { response?: { data?: { message?: string } } } | null)?.response?.data?.message
  const mergeSource = skills?.find((s: Skill) => s.id === mergeSourceId)

  return (
    <AdminGuard>
      <PageTransition>
        <div className="space-y-6 max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight">스킬 관리</h1>

          {mergeSourceId && (
            <div className="border border-warning/40 bg-warning/5 rounded-[var(--radius-lg)] px-4 py-3 text-sm">
              <p className="font-medium text-warning mb-1">병합 모드</p>
              <p className="text-muted-foreground">
                <strong>{mergeSource?.name}</strong>을(를) 병합할 대상 스킬을 클릭하세요.
                해당 스킬에 배정된 직원들이 대상 스킬로 이동됩니다.
              </p>
              <Button variant="ghost" size="sm" className="mt-2"
                onClick={() => setMergeSourceId(null)}>취소</Button>
            </div>
          )}

          <Card>
            <CardBody>
              <form
                onSubmit={e => {
                  e.preventDefault()
                  create(
                    { name: newName, category: newCategory },
                    { onSuccess: () => { setNewName(''); setNewCategory('') } }
                  )
                }}
                className="flex gap-2"
              >
                <Input placeholder="스킬 이름" value={newName} onChange={e => setNewName(e.target.value)} className="flex-1" required />
                <Input placeholder="카테고리" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-40" required />
                <Button type="submit" loading={creating}><Plus className="h-4 w-4" />추가</Button>
              </form>
            </CardBody>
          </Card>

          {deleteMsg && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive-light border border-destructive/20 rounded-[var(--radius-md)] px-3 py-2">
              <WarningCircle className="h-4 w-4 shrink-0" weight="bold" />{deleteMsg}
            </div>
          )}

          <Card>
            <CardBody className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground py-3 px-4">스킬 이름</th>
                    <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground py-3 px-4">카테고리</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {skills?.map((skill: Skill) => (
                    <tr
                      key={skill.id}
                      className={`border-b border-border last:border-0 ${
                        mergeSourceId && skill.id !== mergeSourceId
                          ? 'cursor-pointer hover:bg-warning/5'
                          : ''
                      } ${mergeSourceId === skill.id ? 'bg-warning/10' : ''}`}
                      onClick={() => {
                        if (mergeSourceId && skill.id !== mergeSourceId) {
                          if (confirm(`"${mergeSource?.name}"을(를) "${skill.name}"으로 병합하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
                            merge({ sourceId: mergeSourceId, targetId: skill.id })
                          }
                        }
                      }}
                    >
                      {editingId === skill.id ? (
                        <>
                          <td className="py-2 px-4">
                            <Input value={editForm.name}
                              onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                          </td>
                          <td className="py-2 px-4">
                            <Input value={editForm.category}
                              onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} />
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => update(
                                { id: skill.id, ...editForm },
                                { onSuccess: () => setEditingId(null) }
                              )}>저장</Button>
                              <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>취소</Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4">{skill.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">{skill.category}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm"
                                disabled={!!mergeSourceId}
                                onClick={e => {
                                  e.stopPropagation()
                                  setEditingId(skill.id)
                                  setEditForm({ name: skill.name, category: skill.category })
                                }}>
                                <PencilSimple className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm"
                                disabled={!!mergeSourceId}
                                onClick={e => {
                                  e.stopPropagation()
                                  setMergeSourceId(skill.id)
                                }}
                                title="이 스킬을 다른 스킬로 병합">
                                <ArrowsLeftRight className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm"
                                disabled={!!mergeSourceId}
                                onClick={e => { e.stopPropagation(); del(skill.id) }}
                                className="text-destructive hover:text-destructive hover:bg-destructive-light">
                                <Trash className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {(!skills || skills.length === 0) && (
                    <tr>
                      <td colSpan={3}>
                        <EmptyState icon={Tag} heading="스킬이 없습니다" description="위에서 첫 번째 스킬을 추가하세요." className="py-8" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      </PageTransition>
    </AdminGuard>
  )
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/lib/api/skills.ts frontend/src/app/admin/skills/page.tsx
git commit -m "feat: add skill merge UI to admin skills page"
```

---

## Task 4: Backend — Shareable allocation view (token infrastructure)

**Files:**
- Create: `backend/src/main/resources/db/migration/V14__create_share_tokens.sql`
- Create: `backend/src/main/kotlin/com/company/workforce/domain/share/ShareToken.kt`
- Create: `backend/src/main/kotlin/com/company/workforce/domain/share/ShareTokenRepository.kt`
- Create: `backend/src/main/kotlin/com/company/workforce/api/share/dto/ShareLinkResponse.kt`
- Create: `backend/src/main/kotlin/com/company/workforce/api/share/dto/SharedAllocationView.kt`
- Create: `backend/src/main/kotlin/com/company/workforce/api/share/ShareService.kt`
- Create: `backend/src/main/kotlin/com/company/workforce/api/share/ShareController.kt`
- Modify: `backend/src/main/kotlin/com/company/workforce/config/SecurityConfig.kt`

- [ ] **Step 1: Create V14 migration**

```sql
-- V14__create_share_tokens.sql
CREATE TABLE share_tokens (
    id UUID PRIMARY KEY,
    token UUID NOT NULL UNIQUE,
    employee_id UUID NOT NULL REFERENCES employees(id),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_share_tokens_token ON share_tokens(token);
```

- [ ] **Step 2: Create ShareToken entity**

```kotlin
package com.company.workforce.domain.share

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "share_tokens")
class ShareToken(
    @Id val id: UUID = UUID.randomUUID(),
    val token: UUID = UUID.randomUUID(),
    val employeeId: UUID,
    val expiresAt: LocalDateTime,
    val createdAt: LocalDateTime = LocalDateTime.now()
)
```

- [ ] **Step 3: Create ShareTokenRepository**

```kotlin
package com.company.workforce.domain.share

import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDateTime
import java.util.UUID

interface ShareTokenRepository : JpaRepository<ShareToken, UUID> {
    fun findByToken(token: UUID): ShareToken?
    fun deleteByExpiresAtBefore(threshold: LocalDateTime)
}
```

- [ ] **Step 4: Create DTOs**

`ShareLinkResponse.kt`:
```kotlin
package com.company.workforce.api.share.dto

import java.time.LocalDateTime

data class ShareLinkResponse(
    val token: String,
    val url: String,
    val expiresAt: LocalDateTime
)
```

`SharedAllocationView.kt`:
```kotlin
package com.company.workforce.api.share.dto

import java.time.LocalDateTime

data class SharedAllocationView(
    val employeeId: String,
    val fullName: String,
    val jobTitle: String,
    val department: String,
    val totalAllocationPercent: Long,
    val allocations: List<AllocationSummary>,
    val generatedAt: LocalDateTime = LocalDateTime.now()
) {
    data class AllocationSummary(
        val projectName: String,
        val roleInProject: String,
        val allocationPercent: Int,
        val startDate: String,
        val endDate: String?
    )
}
```

- [ ] **Step 5: Create ShareService**

```kotlin
package com.company.workforce.api.share

import com.company.workforce.api.common.NotFoundException
import com.company.workforce.api.share.dto.ShareLinkResponse
import com.company.workforce.api.share.dto.SharedAllocationView
import com.company.workforce.domain.allocation.ProjectAssignmentRepository
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.share.ShareToken
import com.company.workforce.domain.share.ShareTokenRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.UUID

@Service
@Transactional
class ShareService(
    private val shareTokenRepository: ShareTokenRepository,
    private val employeeRepository: EmployeeRepository,
    private val assignmentRepository: ProjectAssignmentRepository,
    @Value("\${app.base-url:http://localhost:3000}") private val baseUrl: String
) {
    fun createShareLink(employeeId: UUID): ShareLinkResponse {
        employeeRepository.findById(employeeId)
            .orElseThrow { NotFoundException("Employee not found") }
        val shareToken = shareTokenRepository.save(
            ShareToken(
                employeeId = employeeId,
                expiresAt = LocalDateTime.now().plusDays(30)
            )
        )
        return ShareLinkResponse(
            token = shareToken.token.toString(),
            url = "$baseUrl/share/${shareToken.token}",
            expiresAt = shareToken.expiresAt
        )
    }

    @Transactional(readOnly = true)
    fun resolveToken(token: UUID): SharedAllocationView {
        val shareToken = shareTokenRepository.findByToken(token)
            ?: throw NotFoundException("Share link not found or expired")
        if (shareToken.expiresAt.isBefore(LocalDateTime.now()))
            throw NotFoundException("Share link expired")

        val employee = employeeRepository.findById(shareToken.employeeId)
            .orElseThrow { NotFoundException("Employee not found") }
        val today = java.time.LocalDate.now()
        val currentTotal = assignmentRepository.sumCurrentAllocation(shareToken.employeeId)
        // Date-bound the list to match sumCurrentAllocation (startDate <= today AND endDate >= today or null)
        val assignments = assignmentRepository.findByEmployeeId(shareToken.employeeId)
            .filter { it.isActive && it.startDate <= today && (it.endDate == null || it.endDate!! >= today) }

        return SharedAllocationView(
            employeeId = employee.id.toString(),
            fullName = employee.fullName,
            jobTitle = employee.jobTitle,
            department = employee.department,
            totalAllocationPercent = currentTotal,
            allocations = assignments.map { a ->
                SharedAllocationView.AllocationSummary(
                    projectName = a.projectName,
                    roleInProject = a.roleInProject,
                    allocationPercent = a.allocationPercent,
                    startDate = a.startDate.toString(),
                    endDate = a.endDate?.toString()
                )
            }
        )
    }
}
```

- [ ] **Step 6: Create ShareController**

```kotlin
package com.company.workforce.api.share

import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
class ShareController(private val shareService: ShareService) {

    @PostMapping("/api/employees/{id}/share")
    @PreAuthorize("hasRole('ADMIN')")
    fun createShareLink(@PathVariable id: UUID) = shareService.createShareLink(id)

    @GetMapping("/api/share/{token}")
    fun getSharedView(@PathVariable token: UUID) = shareService.resolveToken(token)
}
```

- [ ] **Step 7: Permit /api/share/** in SecurityConfig**

In `SecurityConfig.kt`, replace the `.authorizeHttpRequests` block:

```kotlin
.authorizeHttpRequests {
    it.requestMatchers("/api/auth/**").permitAll()
      .requestMatchers("/api/share/**").permitAll()
      .anyRequest().authenticated()
}
```

- [ ] **Step 8: Add app.base-url to application.yml**

Add at the bottom of `application.yml`:

```yaml
app:
  base-url: ${APP_BASE_URL:http://localhost:3000}
```

- [ ] **Step 9: Build**

```bash
cd backend && ./gradlew build -x test
```

Expected: BUILD SUCCESSFUL

- [ ] **Step 10: Commit**

```bash
git add backend/src/main/resources/db/migration/V14__create_share_tokens.sql \
        backend/src/main/kotlin/com/company/workforce/domain/share/ \
        backend/src/main/kotlin/com/company/workforce/api/share/ \
        backend/src/main/kotlin/com/company/workforce/config/SecurityConfig.kt \
        backend/src/main/resources/application.yml
git commit -m "feat: add shareable allocation view link backend (tokens + public endpoint)"
```

---

## Task 5: Frontend — Share link UI and public share page

**Files:**
- Modify: `frontend/src/lib/types/index.ts`
- Create: `frontend/src/lib/api/share.ts`
- Modify: `frontend/src/app/employees/[id]/page.tsx`
- Create: `frontend/src/app/share/[token]/page.tsx`

- [ ] **Step 1: Add ShareLinkResponse type**

Add to `frontend/src/lib/types/index.ts`:

```typescript
export interface ShareLinkResponse {
  token: string
  url: string
  expiresAt: string
}

export interface SharedAllocationView {
  employeeId: string
  fullName: string
  jobTitle: string
  department: string
  totalAllocationPercent: number
  allocations: Array<{
    projectName: string
    roleInProject: string
    allocationPercent: number
    startDate: string
    endDate: string | null
  }>
  generatedAt: string
}
```

- [ ] **Step 2: Create share API client**

```typescript
// frontend/src/lib/api/share.ts
import { apiClient } from './client'
import type { ShareLinkResponse, SharedAllocationView } from '../types'

export async function createShareLink(employeeId: string): Promise<ShareLinkResponse> {
  const { data } = await apiClient.post<ShareLinkResponse>(`/api/employees/${employeeId}/share`)
  return data
}

// Uses apiClient (base URL already configured). The share endpoint is public —
// any JWT in the request is ignored by Spring Security's permit-all rule.
export async function getSharedView(token: string): Promise<SharedAllocationView> {
  const { data } = await apiClient.get<SharedAllocationView>(`/api/share/${token}`)
  return data
}
```

- [ ] **Step 3: Add share button to employee profile page**

In `frontend/src/app/employees/[id]/page.tsx`, add share link button for admins. This requires reading `useAuth` to check `isAdmin`.

Import additions at top of file:
```tsx
import { useAuth } from '@/lib/hooks/useAuth'
import { useMutation } from '@tanstack/react-query'
import { createShareLink } from '@/lib/api/share'
import { ShareNetwork } from '@phosphor-icons/react'
```

Inside the component, add:
```tsx
const { isAdmin } = useAuth()
const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
const { mutate: share, isPending: sharing } = useMutation({
  mutationFn: () => createShareLink(id),
  onSuccess: (res) => {
    navigator.clipboard.writeText(res.url)
    setCopiedUrl(res.url)
    setTimeout(() => setCopiedUrl(null), 3000)
  },
})
```

In the top action bar (next to the existing 수정 link button), add:
```tsx
{isAdmin && (
  <Button variant="secondary" size="sm" loading={sharing} onClick={() => share()}>
    <ShareNetwork className="h-4 w-4" />
    {copiedUrl ? '복사됨!' : '링크 공유'}
  </Button>
)}
```

- [ ] **Step 4: Create public share page**

```tsx
// frontend/src/app/share/[token]/page.tsx
'use client'
import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSharedView } from '@/lib/api/share'
import { Card, CardBody, ProgressBar } from '@/components/ui/primitives'

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const { data, isLoading, error } = useQuery({
    queryKey: ['share', token],
    queryFn: () => getSharedView(token),
  })

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
      불러오는 중...
    </div>
  )

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-lg font-medium">링크를 찾을 수 없습니다</p>
        <p className="text-sm text-muted-foreground">링크가 만료되었거나 잘못된 주소입니다.</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      <div>
        <p className="text-xs text-muted-foreground mb-1">인력 배정 현황 (읽기 전용)</p>
        <h1 className="text-2xl font-semibold tracking-tight">{data.fullName}</h1>
        <p className="text-muted-foreground">{data.jobTitle} · {data.department}</p>
      </div>

      <Card>
        <CardBody className="space-y-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            현재 할당률 ({data.totalAllocationPercent}%)
          </h2>
          <ProgressBar value={data.totalAllocationPercent} />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            프로젝트 배정 ({data.allocations.length}건)
          </h2>
          {data.allocations.length === 0 ? (
            <p className="text-sm text-muted-foreground">배정된 프로젝트가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {data.allocations.map((a, i) => (
                <div key={i} className="flex justify-between text-sm border border-border rounded-[var(--radius-lg)] p-3">
                  <div>
                    <p className="font-medium">{a.projectName}</p>
                    <p className="text-muted-foreground">{a.roleInProject}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{a.allocationPercent}%</p>
                    <p className="text-xs text-muted-foreground">{a.startDate} – {a.endDate ?? '진행 중'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        이 링크는 30일 후 만료됩니다 · 생성: {new Date(data.generatedAt).toLocaleDateString('ko-KR')}
      </p>
    </div>
  )
}
```

- [ ] **Step 5: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add frontend/src/lib/types/index.ts \
        frontend/src/lib/api/share.ts \
        frontend/src/app/employees/[id]/page.tsx \
        frontend/src/app/share/[token]/page.tsx
git commit -m "feat: add shareable allocation view link UI and public share page"
```

---

## Task 6: Backend — Forward availability projection

**Files:**
- Create: `backend/src/main/kotlin/com/company/workforce/api/employee/dto/AvailabilityPeriod.kt`
- Modify: `backend/src/main/kotlin/com/company/workforce/domain/allocation/ProjectAssignmentRepository.kt`
- Modify: `backend/src/main/kotlin/com/company/workforce/api/employee/EmployeeService.kt`
- Modify: `backend/src/main/kotlin/com/company/workforce/api/employee/EmployeeController.kt`

The projection shows when allocations end and available capacity opens up. Only currently-active assignments with explicit end dates are tracked; open-ended assignments lock capacity permanently.

- [ ] **Step 1: Create AvailabilityPeriod DTO**

```kotlin
package com.company.workforce.api.employee.dto

import java.time.LocalDate

data class AvailabilityPeriod(
    val from: LocalDate,
    val to: LocalDate?,         // null = open-ended
    val availablePercent: Int
)
```

- [ ] **Step 2: Add query to ProjectAssignmentRepository**

Add to `ProjectAssignmentRepository`:

```kotlin
@Query("""
    SELECT pa FROM ProjectAssignment pa
    WHERE pa.employeeId = :employeeId
      AND pa.isActive = true
      AND pa.startDate <= :today
      AND pa.endDate IS NOT NULL
      AND pa.endDate >= :today
    ORDER BY pa.endDate ASC
""")
fun findActiveWithFutureEndDate(
    @Param("employeeId") employeeId: UUID,
    @Param("today") today: LocalDate
): List<ProjectAssignment>
```

- [ ] **Step 3: Add getAvailability() to EmployeeService**

Add method to `EmployeeService` (after `listAvailable()`):

```kotlin
@Transactional(readOnly = true)
fun getAvailability(id: UUID): List<AvailabilityPeriod> {
    employeeRepository.findById(id).orElseThrow { NotFoundException("Employee not found") }
    val today = LocalDate.now()
    val currentTotal = assignmentRepository.sumCurrentAllocation(id).toInt()
    val endingAssignments = assignmentRepository.findActiveWithFutureEndDate(id, today)

    if (endingAssignments.isEmpty()) {
        return listOf(AvailabilityPeriod(today, null, (100 - currentTotal).coerceAtLeast(0)))
    }

    // group by end date: sum of allocation freed on that day
    val freedByDate = endingAssignments
        .groupBy { it.endDate!! }
        .mapValues { (_, list) -> list.sumOf { it.allocationPercent } }
        .toSortedMap()

    val periods = mutableListOf<AvailabilityPeriod>()
    var allocated = currentTotal
    var periodStart = today

    for ((endDate, freed) in freedByDate) {
        periods.add(AvailabilityPeriod(periodStart, endDate, (100 - allocated).coerceAtLeast(0)))
        periodStart = endDate.plusDays(1)
        allocated -= freed
    }
    // final open-ended period
    periods.add(AvailabilityPeriod(periodStart, null, (100 - allocated).coerceAtLeast(0)))

    return periods
}
```

Also add missing import to the top of `EmployeeService.kt`:
```kotlin
import com.company.workforce.api.employee.dto.AvailabilityPeriod
import java.time.LocalDate
```
(LocalDate is already imported — only add if missing.)

- [ ] **Step 4: Add endpoint to EmployeeController**

Add to `EmployeeController`:

```kotlin
@GetMapping("/{id}/availability")
fun getAvailability(@PathVariable id: UUID) = employeeService.getAvailability(id)
```

- [ ] **Step 5: Build**

```bash
cd backend && ./gradlew build -x test
```

Expected: BUILD SUCCESSFUL

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/kotlin/com/company/workforce/api/employee/dto/AvailabilityPeriod.kt \
        backend/src/main/kotlin/com/company/workforce/domain/allocation/ProjectAssignmentRepository.kt \
        backend/src/main/kotlin/com/company/workforce/api/employee/EmployeeService.kt \
        backend/src/main/kotlin/com/company/workforce/api/employee/EmployeeController.kt
git commit -m "feat: add forward availability projection endpoint (GET /api/employees/{id}/availability)"
```

---

## Task 7: Frontend — Availability projection card on employee profile

**Files:**
- Modify: `frontend/src/lib/types/index.ts`
- Modify: `frontend/src/lib/api/employees.ts`
- Modify: `frontend/src/app/employees/[id]/page.tsx`

- [ ] **Step 1: Add AvailabilityPeriod type**

Add to `frontend/src/lib/types/index.ts`:

```typescript
export interface AvailabilityPeriod {
  from: string
  to: string | null
  availablePercent: number
}
```

- [ ] **Step 2: Add getEmployeeAvailability to employees API**

Add to `frontend/src/lib/api/employees.ts`:

```typescript
import type { AvailabilityPeriod } from '../types'

export async function getEmployeeAvailability(id: string): Promise<AvailabilityPeriod[]> {
  const { data } = await apiClient.get<AvailabilityPeriod[]>(`/api/employees/${id}/availability`)
  return data
}
```

- [ ] **Step 3: Add availability card to employee profile page**

In `frontend/src/app/employees/[id]/page.tsx`, add the following:

New import:
```tsx
import { useQuery } from '@tanstack/react-query'
import { getEmployeeAvailability } from '@/lib/api/employees'
import type { AvailabilityPeriod } from '@/lib/types'
```

Inside `EmployeeDetailPage`, add after the `tasks` query:
```tsx
const { data: availability } = useQuery({
  queryKey: ['availability', id],
  queryFn: () => getEmployeeAvailability(id),
})
```

Add a new card after the "할당률" card (around line 70), before the skills card:

```tsx
{availability && availability.length > 0 && (
  <Card>
    <CardBody className="space-y-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        향후 가용 예측
      </h2>
      <div className="space-y-2">
        {availability.map((period: AvailabilityPeriod, i: number) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {period.from}
              {period.to ? ` ~ ${period.to}` : ' 이후'}
            </span>
            <span className={`font-medium ${
              period.availablePercent >= 50 ? 'text-accent' :
              period.availablePercent > 0   ? 'text-warning' :
              'text-destructive'
            }`}>
              {period.availablePercent}% 가용
            </span>
          </div>
        ))}
      </div>
    </CardBody>
  </Card>
)}
```

- [ ] **Step 4: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/types/index.ts \
        frontend/src/lib/api/employees.ts \
        frontend/src/app/employees/[id]/page.tsx
git commit -m "feat: add forward availability projection card to employee profile"
```

---

## Task 8: Backend — Email infrastructure + skill staleness scheduler

**Files:**
- Modify: `backend/build.gradle.kts`
- Modify: `backend/src/main/resources/application.yml`
- Modify: `backend/src/main/kotlin/com/company/workforce/WorkforceApplication.kt`
- Create: `backend/src/main/resources/db/migration/V15__add_skills_last_updated_to_employees.sql`
- Modify: `backend/src/main/kotlin/com/company/workforce/domain/employee/Employee.kt`
- Modify: `backend/src/main/kotlin/com/company/workforce/domain/employee/EmployeeRepository.kt`
- Modify: `backend/src/main/kotlin/com/company/workforce/api/skill/SkillService.kt`
- Create: `backend/src/main/kotlin/com/company/workforce/infrastructure/email/EmailService.kt`
- Create: `backend/src/main/kotlin/com/company/workforce/infrastructure/scheduler/SkillStalenessScheduler.kt`

> **Note on running without a mail server:** Set `spring.mail.host` to a non-routable address or leave it blank in dev. The EmailService catches `MailException` and logs it, so the scheduler runs without crashing if mail is unconfigured.

- [ ] **Step 1: Add spring-boot-starter-mail to build.gradle.kts**

In the `dependencies` block, add after the last `implementation` line:

```kotlin
implementation("org.springframework.boot:spring-boot-starter-mail")
```

- [ ] **Step 2: Add mail config to application.yml**

Add at the end of `application.yml`:

```yaml
spring:
  mail:
    host: ${MAIL_HOST:localhost}    # non-empty default keeps auto-config bean alive in dev
    port: ${MAIL_PORT:587}
    username: ${MAIL_USER:}
    password: ${MAIL_PASS:}
    test-connection: false          # prevents startup connection check in dev
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true

skill-staleness:
  threshold-days: 90
  from-email: ${NUDGE_FROM_EMAIL:noreply@workforce.internal}
```

> YAML is indentation-sensitive. The `spring.mail` block must be nested under the existing `spring:` key if one exists. Since the file already has a top-level `spring:`, add `mail:` as a child of it.

- [ ] **Step 3: Add @EnableScheduling to WorkforceApplication**

Replace `WorkforceApplication.kt`:

```kotlin
package com.company.workforce

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableScheduling
class WorkforceApplication

fun main(args: Array<String>) {
    runApplication<WorkforceApplication>(*args)
}
```

- [ ] **Step 4: Create V15 migration**

```sql
-- V15__add_skills_last_updated_to_employees.sql
ALTER TABLE employees ADD COLUMN skills_last_updated_at TIMESTAMP;
```

- [ ] **Step 5: Add skillsLastUpdatedAt to Employee entity**

In `Employee.kt`, add after `var isActive: Boolean = true`:

```kotlin
import java.time.LocalDateTime  // add to existing imports
```

And add field:
```kotlin
var skillsLastUpdatedAt: LocalDateTime? = null
```

Full updated class:

```kotlin
package com.company.workforce.domain.employee

import jakarta.persistence.*
import org.hibernate.annotations.JdbcType
import org.hibernate.dialect.PostgreSQLEnumJdbcType
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "employees")
class Employee(
    @Id val id: UUID = UUID.randomUUID(),
    var fullName: String,
    var email: String,
    var phone: String? = null,
    var department: String,
    var team: String? = null,
    var jobTitle: String,
    var grade: String? = null,
    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType::class)
    var employmentType: EmploymentType,
    var hiredAt: LocalDate,
    var isActive: Boolean = true,
    var skillsLastUpdatedAt: LocalDateTime? = null
)
```

- [ ] **Step 6: Add findStaleSkillEmployees to EmployeeRepository**

Add to `EmployeeRepository`:

```kotlin
import java.time.LocalDateTime

@Query("""
    SELECT e FROM Employee e
    WHERE e.isActive = true
      AND e.hiredAt <= :hiredBefore
      AND (e.skillsLastUpdatedAt IS NULL OR e.skillsLastUpdatedAt < :staleThreshold)
""")
fun findStaleSkillEmployees(
    @Param("hiredBefore") hiredBefore: LocalDate,
    @Param("staleThreshold") staleThreshold: LocalDateTime
): List<Employee>
```

Also add `import java.time.LocalDateTime` to the existing imports.

- [ ] **Step 7: Update SkillService to touch skillsLastUpdatedAt**

In `SkillService.kt`, in `addSkillToEmployee()`, `updateEmployeeSkill()`, and `removeEmployeeSkill()`, add a call to update the employee's `skillsLastUpdatedAt`.

Add a private helper to `SkillService`:

```kotlin
private fun touchSkillsUpdated(employeeId: UUID) {
    val employee = employeeRepository.findById(employeeId).orElse(null) ?: return
    employee.skillsLastUpdatedAt = java.time.LocalDateTime.now()
    employeeRepository.save(employee)
}
```

Call it at the end of `addSkillToEmployee()`:
```kotlin
return employeeSkillRepository.save(EmployeeSkill(...)).also { touchSkillsUpdated(employeeId) }
```

Call it at the end of `updateEmployeeSkill()`:
```kotlin
return employeeSkillRepository.save(es).also { touchSkillsUpdated(employeeId) }
```

Call it at the end of `removeEmployeeSkill()`:
```kotlin
employeeSkillRepository.delete(es)
touchSkillsUpdated(employeeId)
```

- [ ] **Step 8: Create EmailService**

```kotlin
package com.company.workforce.infrastructure.email

import org.slf4j.LoggerFactory
import org.springframework.mail.MailException
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Service

@Service
class EmailService(private val mailSender: JavaMailSender) {

    private val log = LoggerFactory.getLogger(javaClass)

    fun sendSkillUpdateNudge(toEmail: String, fullName: String, fromEmail: String) {
        val msg = SimpleMailMessage().apply {
            setTo(toEmail)
            setFrom(fromEmail)
            subject = "[인력관리] 스킬 정보 업데이트를 해주세요"
            text = """
안녕하세요 $fullName 님,

90일 이상 스킬 정보가 업데이트되지 않았습니다.
최신 스킬 정보는 프로젝트 배정에 직접 영향을 줍니다.

아래 링크에서 스킬을 업데이트해 주세요:
http://localhost:3000/me

감사합니다.
인력관리 시스템
            """.trimIndent()
        }
        try {
            mailSender.send(msg)
            log.info("Sent skill nudge email to {}", toEmail)
        } catch (e: MailException) {
            log.warn("Failed to send skill nudge email to {}: {}", toEmail, e.message)
        }
    }
}
```

- [ ] **Step 9: Create SkillStalenessScheduler**

```kotlin
package com.company.workforce.infrastructure.scheduler

import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.infrastructure.email.EmailService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.time.LocalDateTime

@Component
class SkillStalenessScheduler(
    private val employeeRepository: EmployeeRepository,
    private val emailService: EmailService,
    @Value("\${skill-staleness.threshold-days:90}") private val thresholdDays: Long,
    @Value("\${skill-staleness.from-email:noreply@workforce.internal}") private val fromEmail: String
) {
    private val log = LoggerFactory.getLogger(javaClass)

    // Every Monday at 09:00
    @Scheduled(cron = "0 0 9 * * MON")
    fun sendStalenessNudges() {
        val staleThreshold = LocalDateTime.now().minusDays(thresholdDays)
        val hiredBefore = LocalDate.now().minusDays(thresholdDays)
        val staleEmployees = employeeRepository.findStaleSkillEmployees(hiredBefore, staleThreshold)
        log.info("Skill staleness check: {} employees to nudge", staleEmployees.size)
        staleEmployees.forEach { emp ->
            emailService.sendSkillUpdateNudge(emp.email, emp.fullName, fromEmail)
        }
    }
}
```

- [ ] **Step 10: Build**

```bash
cd backend && ./gradlew build -x test
```

Expected: BUILD SUCCESSFUL

- [ ] **Step 11: Commit**

```bash
git add backend/build.gradle.kts \
        backend/src/main/resources/application.yml \
        backend/src/main/resources/db/migration/V15__add_skills_last_updated_to_employees.sql \
        backend/src/main/kotlin/com/company/workforce/WorkforceApplication.kt \
        backend/src/main/kotlin/com/company/workforce/domain/employee/Employee.kt \
        backend/src/main/kotlin/com/company/workforce/domain/employee/EmployeeRepository.kt \
        backend/src/main/kotlin/com/company/workforce/api/skill/SkillService.kt \
        backend/src/main/kotlin/com/company/workforce/infrastructure/
git commit -m "feat: add skill staleness nudge email (Spring Mail + weekly scheduler)"
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

Expected: compiled successfully with no TypeScript errors

- [ ] **Manual smoke test checklist**
  - [ ] Allocation form: select an employee, enter %, see "현재 X% → 저장 시 Y%" preview; verify color changes at ≥80% and >100%
  - [ ] Admin skills page: click ↔ merge button on one skill → banner appears; click another skill row → confirm dialog → skill disappears and employees have target skill
  - [ ] Employee profile (admin): click "링크 공유" → URL copied to clipboard; open URL in a new incognito tab → share page loads without login, shows name + allocations
  - [ ] Employee profile: "향후 가용 예측" card appears listing future availability periods (requires employee with time-bounded allocations in seed data)
  - [ ] (Email — dev): add `MAIL_HOST=smtp.mailtrap.io` and credentials to env; run app; trigger scheduler manually via `curl -X POST /actuator/scheduledtasks` or wait until Monday 09:00

---

*Plan generated: 2026-03-25 · Scope: Phase 2 UX features from user research discovery spec*
