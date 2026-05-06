# Personal Scheduler (Calendar) — Design Spec

- **Date:** 2026-05-06
- **Status:** Draft (pending review)
- **Owner:** TBD
- **Driver request:** "개인의 스케줄링이 가능하도록 구글 캘린더를 착안한 기능 추가. 개인 스케줄이지만 공개 여부를 선택할 수 있어 개인의 스케줄과 사내용 스케줄을 나눠서 관리할 수 있도록 함."

## 1. Problem & Goals

내부 직원들이 각자의 일정과 사내 공통 일정을 한 캘린더에서 관리할 수 있어야 한다. 이벤트마다 **공개/비공개**를 단일 토글로 선택해, 비공개는 본인만, 공개는 전사 모든 사용자가 볼 수 있다.

**Primary use case:** 사내 공유 캘린더가 메인. 개인 메모/일정이 그 위에 덧씌워지는 모델.

**Success criteria:**
- 임의 사용자가 일정을 만들고 공개/비공개를 선택할 수 있다.
- 다른 사용자의 비공개 일정은 보이지 않는다 (응답에서 누락).
- 다른 사용자의 공개 일정은 누구에게나 보이지만 수정/삭제는 작성자만.
- 월간·주간 뷰에서 시간대/종일/다일 이벤트가 시각적으로 구분되어 표시된다.

## 2. Scope

### In Scope (v1)
- 이벤트 생성·조회·수정·삭제 (CRUD)
- 이벤트 종류: **시간대 이벤트**(start/end), **종일 이벤트**, **다일 종일 이벤트**
- 공개/비공개 이진 토글 — 공개 = 전사 모든 인증된 내부 사용자
- 캘린더 뷰: **월간 + 주간**
- 필터: `전체` (기본) / `내 일정` / `공개만`
- 글로벌 페이지 `/calendar`, 상단 nav에 진입점 추가
- 본인만 자기 이벤트 수정/삭제. Admin 우회 권한 없음.

### Out of Scope (v2 후보, 명시적 비포함)
- 반복 이벤트 (RRULE)
- 알림/리마인더 (인앱·이메일)
- 초대/RSVP/참석자
- ProjectAssignment 자동 표시 (할당-캘린더 통합)
- 일간 뷰, 아젠다 위젯, 대시보드 위젯
- 휴지통/소프트 삭제
- ICS 가져오기/내보내기
- 모바일 풀-반응형 (best-effort만)
- Admin 우회 수정 권한
- 다중 캘린더 (사용자별 N개 캘린더)
- 색상/카테고리 사용자 정의
- 첨부 파일

## 3. Decisions Reached

브레인스토밍에서 확정된 결정 요약:

| 영역 | 결정 |
|---|---|
| 핵심 목적 | 사내 캘린더 메인 + 개인 메모 통합 |
| 공개 범위 | 전사 — 인증된 모든 내부 사용자 |
| 공개 생성 권한 | 모든 사용자 자유롭게 |
| v1 이벤트 종류 | 시간대 / 종일 / 다일 종일 (반복 제외) |
| 할당 통합 | 표시 안 함 |
| v1 뷰 | 월간 + 주간만 |
| 알림 | v1에 없음 |
| 진입점 | 글로벌 `/calendar` 페이지 (메인 nav) |
| 데이터 모델 | 단일 `calendar_events` 테이블 |

## 4. Architecture

### Backend
- 위치: `backend/src/main/kotlin/com/company/workforce/`
- 신규 패키지: `domain/calendar/`, `api/calendar/`
- 기존 `User` 엔티티에 FK로 연결, ON DELETE CASCADE
- 시간 저장: UTC `Instant`, 비즈니스 로직은 KST(`Asia/Seoul`) 기준 정규화

### Frontend
- 신규 라우트: `frontend/src/app/calendar/page.tsx`
- 신규 디렉토리: `frontend/src/components/calendar/`
- 데이터: TanStack Query, axios 클라이언트는 `lib/api/calendar.ts`
- 모션: 기존 framer-motion 스프링 프리셋 재사용 (PageTransition, Modal)
- 아이콘: Phosphor Icons duotone

### 디자인 토큰 (CSS custom properties)
신규 토큰을 글로벌 스타일에 추가:
- `--event-private-bg`, `--event-private-border` — amber 톤
- `--event-public-mine-bg`, `--event-public-mine-border` — zinc 진한 톤
- `--event-public-other-bg`, `--event-public-other-border` — zinc 옅은 톤
- `--calendar-today-tint` — emerald 옅은 그라데이션
- `--calendar-grid-line` — `--border` 토큰 재사용

이벤트 색은 emerald와 분리 (emerald는 기존대로 할당 헬스용).

## 5. Data Model

### Entity
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

### Repository
```kotlin
interface CalendarEventRepository : JpaRepository<CalendarEvent, UUID> {
    @Query("""
        SELECT e FROM CalendarEvent e
        WHERE (e.ownerUserId = :viewerId OR e.isPublic = true)
          AND e.startAt < :to AND e.endAt > :from
        ORDER BY e.startAt
    """)
    fun findVisibleInRange(viewerId: UUID, from: Instant, to: Instant): List<CalendarEvent>

    fun findByOwnerUserIdAndStartAtLessThanAndEndAtGreaterThan(
        ownerId: UUID, to: Instant, from: Instant
    ): List<CalendarEvent>

    @Query("""
        SELECT e FROM CalendarEvent e
        WHERE e.isPublic = true AND e.startAt < :to AND e.endAt > :from
        ORDER BY e.startAt
    """)
    fun findPublicInRange(from: Instant, to: Instant): List<CalendarEvent>
}
```

### Flyway Migration `V19__create_calendar_events.sql`
```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY,
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description VARCHAR(2000),
  location VARCHAR(200),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN NOT NULL DEFAULT FALSE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT chk_event_range CHECK (end_at >= start_at)
);

CREATE INDEX idx_calendar_events_range ON calendar_events (start_at, end_at);
CREATE INDEX idx_calendar_events_owner ON calendar_events (owner_user_id);
CREATE INDEX idx_calendar_events_public ON calendar_events (is_public) WHERE is_public = TRUE;
```

### Validation Rules
- `title`: not blank, ≤ 200자
- `description`: ≤ 2000자
- `location`: ≤ 200자
- `endAt >= startAt` (DB CHECK + 서비스 검증)
- `allDay = true`이면 서비스 레이어에서 `startAt`/`endAt`을 KST 자정 경계로 정규화
- 다일 종일: `endAt`은 종료일 **다음 날 00:00:00 KST** (반-개방 구간 `[start, end)`)

## 6. API

### Base path: `/api/calendar`

| Method | Path | Action | Auth |
|---|---|---|---|
| `GET` | `/events?from=&to=&filter=` | 범위 내 가시 이벤트 조회 | 인증 필요 |
| `POST` | `/events` | 신규 이벤트 생성 | 인증 필요 |
| `GET` | `/events/{id}` | 단건 상세 | 본인 또는 `is_public=true` |
| `PUT` | `/events/{id}` | 전체 수정 | 본인만 |
| `DELETE` | `/events/{id}` | 삭제 | 본인만 |

권한 위반: `403 ForbiddenException`. 비공개 타인 이벤트: `404 NotFoundException` (존재 자체 비노출).

### Query Parameters (`GET /events`)
- `from` (required, ISO-8601 Instant) — 범위 시작
- `to` (required, ISO-8601 Instant) — 범위 끝
- `filter` (optional, default `all`) — `all` / `mine` / `public`
- 최대 범위: 92일 (서버에서 제한, 초과 시 400)

### Request DTOs
```kotlin
data class CreateCalendarEventRequest(
    val title: String,
    val description: String? = null,
    val location: String? = null,
    val startAt: Instant,
    val endAt: Instant,
    val allDay: Boolean = false,
    val isPublic: Boolean = false
)

data class UpdateCalendarEventRequest(
    val title: String,
    val description: String? = null,
    val location: String? = null,
    val startAt: Instant,
    val endAt: Instant,
    val allDay: Boolean = false,
    val isPublic: Boolean = false
)
```

### Response DTO
```kotlin
data class CalendarEventResponse(
    val id: UUID,
    val ownerUserId: UUID,
    val ownerName: String,
    val ownerInitial: String,        // 1-2자, 타인 공개 이벤트의 이니셜 칩용
    val title: String,
    val description: String?,
    val location: String?,
    val startAt: Instant,
    val endAt: Instant,
    val allDay: Boolean,
    val isPublic: Boolean,
    val isMine: Boolean,
    val canEdit: Boolean              // 클라 편의용, isMine과 동일
)
```

## 7. Permissions & Validation Matrix

| 액션 | 본인 이벤트 | 타인 공개 | 타인 비공개 |
|---|---|---|---|
| `GET /events` 응답 포함 | ✅ | ✅ | ❌ (없음) |
| `GET /events/{id}` | ✅ 200 | ✅ 200 | ❌ 404 |
| `PUT /events/{id}` | ✅ 200 | ❌ 403 | ❌ 404 |
| `DELETE /events/{id}` | ✅ 204 | ❌ 403 | ❌ 404 |

서버는 `isMine`/`canEdit` 클라이언트 플래그를 신뢰하지 않고 모든 mutating 호출에서 owner를 재검증.

## 8. Frontend Structure

### File Layout
```
frontend/src/
  app/calendar/
    page.tsx                       # /calendar (URL 상태: ?view=&date=&filter=)
  components/calendar/
    CalendarHeader.tsx             # 월 ◀▶ + Today + 월/주 토글 + 필터칩 + "+ 일정"
    CalendarMonthView.tsx          # 7×6 그리드, 다일 이벤트 row-span
    CalendarWeekView.tsx           # 7열 × 시간행 타임라인
    EventBlock.tsx                 # 공통 이벤트 시각 (variant: chip|timeline)
    EventDetailModal.tsx           # 클릭 시 상세 (Modal 프리미티브 재사용)
    EventFormModal.tsx             # 생성/수정 폼
    useCalendarEvents.ts           # TanStack Query 훅
    calendar-utils.ts              # 그리드 계산, 다일 이벤트 슬롯 배치, 종일 정규화
  lib/api/
    calendar.ts                    # axios CRUD
```

### URL State
`/calendar?view=month|week&date=YYYY-MM-DD&filter=all|mine|public`
- 새로고침해도 동일 상태 복원
- 월간 뷰: `date`는 표시 월의 임의 날짜 (1일로 정규화)
- 주간 뷰: `date`는 해당 주의 임의 날짜 (월요일로 정규화)

### React Query Keys
- `['calendar', from, to, filter]` — 가시 이벤트 목록
- 월/주 이동 시 새 범위로 재조회
- Mutation 후 현재 키만 invalidate (낙관적 업데이트는 v1 미적용)

## 9. UX Flows

### Flow 1 — 빈 셀 클릭으로 생성
- 월간: 셀 클릭 → 그날짜 prefilled 종일 이벤트 폼 (default `isPublic=false`)
- 주간: 시간 슬롯 클릭 → 1시간 prefilled 시간대 이벤트 폼

### Flow 2 — 이벤트 클릭으로 상세
- 본인 이벤트: 상세 + 수정/삭제 버튼
- 타인 공개: 읽기 전용 상세, 작성자 표기

### Flow 3 — 필터 칩
- 3개 chip: `전체` (기본) · `내 일정` · `공개만`
- 활성: 채움 배경 (`bg-zinc-900 text-zinc-50`)
- 비활성: 보더만

### Flow 4 — 뷰 토글
- segmented control (`pill-group`), 우측 상단
- 전환 시 framer-motion fade + 슬라이드, 데이터 재요청

### Flow 5 — 생성 폼 (필드 순서)
1. 제목 *
2. 종일 토글 (on이면 시간 입력 숨김)
3. 시작 / 종료 (날짜 또는 날짜+시각)
4. 위치
5. 설명 (multiline)
6. 공개 토글 — 라벨 옆 마이크로카피: *"공개 시 전사 모든 사용자가 볼 수 있습니다"*

## 10. Visual Treatment

### Event Variant Tokens
| 변형 | bg | left-border | icon |
|---|---|---|---|
| 내 비공개 | `--event-private-bg` (amber-50) | `--event-private-border` (amber-500) | Phosphor `Lock` (12px) |
| 내 공개 | `--event-public-mine-bg` (zinc-50) | `--event-public-mine-border` (zinc-700) | Phosphor `Globe` (12px) |
| 타인 공개 | `--event-public-other-bg` (zinc-50, 85% opacity) | `--event-public-other-border` (zinc-400) | 작성자 이니셜 칩 |

### Typography
- 이벤트 제목: Plus Jakarta Sans, 11–13px
- 시각: GeistMono, tabular-nums (`font-feature-settings: "tnum"`)
- 월/일 표기: GeistMono

### Today Indicator
- 셀 배경: `linear-gradient(180deg, rgba(16,185,129,.06), transparent 70%)`
- 셀 헤더 도트: 6px emerald-500
- 날짜 숫자: emerald-700, font-weight 600

### Motion
- 월 ◀▶ 전환: 300ms spring(stiffness 450, damping 30) — `transform`/`opacity`만
- 이벤트 hover: `translateY(-1px)` + `scale(1.01)`, 150ms
- 모달 enter/exit: 기존 Modal 스프링
- 새 이벤트 생성 직후 fade-in (스태거 없음)

### Multi-day 이벤트
- 같은 row 내: 가로 연속 막대 (border-radius 양 끝만)
- row 경계 넘을 때: 새 row 첫 셀에서 다시 시작 (보더 좌측만 다시)
- 첫 셀에 제목, 이후 셀은 `→` 또는 빈 칸으로 연속감만 표현

## 11. Error Handling

- **백엔드:** `GlobalExceptionHandler` 기존 패턴
  - `IllegalArgumentException` (검증 실패) → `400 Bad Request` + 메시지
  - `ForbiddenException` → `403`
  - `NotFoundException` → `404`
- **프론트:** TanStack Query `onError` → 토스트
  - 폼 모달은 에러 시 데이터 보존 + "재시도" 버튼
  - 시간 범위 검증 실패는 클라에서 폼 제출 전 1차 차단
- 삭제는 hard delete (휴지통 v2)

## 12. Testing Strategy

### Backend (JUnit + Spring Boot Test)
- `CalendarEventRepositoryTest` — 범위 쿼리 정확성 (겹침/다일/종일 경계)
- `CalendarServiceTest` — 권한 매트릭스, 종일 KST 정규화, 검증 규칙
- `CalendarControllerTest` — `@WithMockUser` 기반 200/400/403/404 시나리오

### Frontend (Playwright E2E)
- **Test 1**: 사용자 A 로그인 → /calendar → 비공개 이벤트 생성 → 사용자 B 로그인 → 보이지 않음 확인
- **Test 2**: 사용자 A 공개 이벤트 생성 → 사용자 B에서 보임 → A에게만 수정/삭제 버튼 노출
- **Test 3**: 다일 종일 이벤트 생성 → 월간 뷰에서 가로 연속 막대 렌더 확인

컴포넌트 단위 테스트는 v1에서 생략 (E2E 커버리지로 충분).

## 13. Migration & Rollout

- Flyway V19로 테이블 추가, 기존 데이터 영향 없음
- 기능 플래그 없이 직접 배포 — v1은 신규 페이지로 기존 흐름과 격리
- nav 추가 항목: 모든 역할(HR/PM/Admin/Employee) 동일 노출

## 14. Open Items / Future Work

특정 시점에 결정 가능, 현재 명시적 비포함:
- 이벤트 색상 사용자 정의 / 카테고리 라벨
- ProjectAssignment 통합 (읽기 전용 오버레이)
- 반복 이벤트 (RRULE)
- 알림 (인앱 → 이메일 단계적)
- ICS 양방향
- 다국어 (현재 ko-KR만)
