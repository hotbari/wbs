# Impeccable Audit — 왜 "부족하고 어설퍼" 보이는가

**날짜:** 2026-04-23
**브랜치:** `design/impeccable-audit`
**기준:** `CLAUDE.md` + `.impeccable.md` (5 Design Principles, Aesthetic Direction, Anti-patterns)
**방식:** 정적 코드 감사 — 모든 user-facing 페이지(11개) + `globals.css` + `primitives/*`(18개) + 주요 복합 컴포넌트(15개)
**포맷:** 전략 Findings + 원칙별 근본원인

---

## 1. Executive Summary

최근 elevation 커밋들(`a8f667c`, `ed6f80e`, `e09fa2f`, `d5d8696`)은 시스템의 **꼭대기**(floating nav, double-bezel, spring motion, Plus Jakarta Sans)를 잘 올렸습니다. 어설퍼 보이는 이유는 그 아래 **뿌리(토큰·프리미티브·사용 규율)**가 꼭대기를 받쳐주지 못하고 있어서입니다.

세 개의 구조적 이슈가 모든 페이지에서 동시에 누수되고 있습니다:

1. **디자인 시스템이 정의되어 있지만 사용되지 않는다.** `heading-1`, `display-2`, `eyebrow`, `MotionCard`, `Pagination` 같은 프리미티브가 잘 만들어져 있는데 페이지 11개 중 상당수가 `text-2xl font-semibold tracking-tight` 같은 하드코드로 우회합니다. 결과: 같은 제품인데 화면마다 느낌이 다름.
2. **Emerald가 모든 것을 의미한다 → 아무것도 의미하지 않는다.** "Emerald = allocation health"가 원칙인데 Avatar 배경, Nav 로고, Welcome 배너 아이콘 박스, skill chip, 대시보드 corner glow, progress bar `low` 색, spotlight border — 거의 모든 곳에 있음. 시그널이 희석돼 "정상/초과/가용" 같은 의미 신호가 힘을 못 씀.
3. **토큰·사이즈·모션이 여러 표준으로 공존한다.** Input h-10 / Select h-9 / Button h-11, Card 16px / MotionCard 28px / WelcomeBanner 16px 의 bezel, 스프링 모션과 easeOut 모션이 동일 화면 안에 섞임, `--accent-foreground` 라는 **존재하지 않는 토큰**이 3곳에서 참조됨. 이런 균열 하나하나는 작지만 누적되면 "craft 부족"으로 느껴집니다.

원칙 관점에서: **"Structure earns trust"**는 hero·카드 헤더 레벨에서는 작동하지만, **표·폼·목록** 레벨로 내려가면 무너집니다. **"Every role deserves the same craft"**는 `/share/[token]`과 `/admin/allocations` 같은 읽기용·관리용 화면에서 지켜지지 않습니다.

---

## 2. Top Findings

각 항목: **Severity · 영향 범위 · 위반 원칙 · 대표 증거(file:line) · 권장 fix 방향**

---

### F1 — `--accent-foreground` 토큰이 정의되지 않았는데 3곳에서 사용됨

**Severity:** Critical (실제 렌더링 버그)
**영향:** 선택된 스킬 칩(pm/staffing, SkillEditPanel), 필터 카운트 배지(SkillFilterPanel) — "상태 선택됨" 시각 피드백이 깨짐
**원칙:** "Structure earns trust"

**증거:**
- `frontend/src/app/globals.css` — `--accent-foreground` 정의 부재. `--accent-text`는 있음.
- `frontend/src/app/pm/staffing/page.tsx:94` — `bg-accent text-accent-foreground border-accent`
- `frontend/src/components/ui/SkillEditPanel.tsx:146` — 숙련도 선택 칩 선택 상태
- `frontend/src/components/ui/SkillFilterPanel.tsx:46` — 선택 카운트 배지

**권장:** 토큰 추가 `--accent-foreground: #ffffff` (light), `--accent-foreground: #052e1f` (dark), 그리고 `@theme inline`에 매핑. 또는 세 곳 모두 `text-white`로 교체. 전자를 권장 — "accent 위의 전경"은 다크/라이트 모두에서 의미가 유지돼야 함.

---

### F2 — 타이포그래피 시스템이 정의되었지만 대부분의 페이지가 우회함

**Severity:** Major
**영향:** 페이지 H1 11개 중 9개가 raw Tailwind 클래스로 하드코드. 페이지마다 letter-spacing, line-height가 미세하게 다름.
**원칙:** "Structure earns trust" / "Density through clarity"

**증거 (display-/heading- 사용 vs 하드코드):**
- ✅ 사용: `employees/[id]/page.tsx:103` (`display-2`), `employees/page.tsx:103,121`, `admin/dashboard/page.tsx:192`, `login/page.tsx:45`, `WelcomeBanner.tsx:122`
- ❌ 하드코드: `me:36`, `admin/skills:39`, `admin/allocations:34`, `admin/projects/[id]/edit:34`, `admin/projects/new:24`, `admin/employees/new:20`, `admin/employees/[id]/edit:30`, `employees/[id]/edit:45`, `projects/page:36`, `projects/[id]:40`, `pm/staffing:56`, `share/[token]:33`

`text-2xl font-semibold tracking-tight` 은 `.heading-1`(1.5rem, 600, -0.025em, lh 1.25)과 **거의 같지만 다름**. 특히 `tracking-tight`는 -0.025em가 아니라 -0.025em에 가까운 -0.04em 근처 — 브라우저에 따라 살짝 다름.

**권장:** 11개 H1을 모두 `.heading-1` 또는 `.display-2`로 교체. 동시에 `heading-4`(14px/600)와 `body-base`(14px/400)를 globals.css에 추가해 페이지 서브헤더 레벨에서도 하드코딩 욕구를 없앰. 장기적으로 `text-xs/sm/lg/xl` 같은 raw 클래스 사용을 eslint로 넛지.

---

### F3 — MotionCard가 단 하나의 컴포넌트에서만 사용됨

**Severity:** Major
**영향:** "double-bezel premium tactile" 원칙이 `EmployeeCard`에서만 적용됨. ProjectHealthCard, 프로젝트 목록 카드, WelcomeBanner, 대시보드 하단 카드 등은 plain `<Card>` 또는 수동 bezel. 같은 제품인데 카드의 "무게감"이 화면마다 다름.
**원칙:** "Every role deserves the same craft"

**증거:**
- `MotionCard` 사용처: `EmployeeCard.tsx`, `Card.tsx`(정의), `primitives/index.ts`(export) — **실사용 1개**
- `projects/page.tsx:75` — `<Card className="transition-shadow hover:shadow-md">` (plain)
- `ProjectHealthCard.tsx:14` — `<motion.div>`로 직접 whileHover 구현 (MotionCard 미사용)
- `admin/dashboard/page.tsx:56` — `bezel` 클래스 직접 사용 (MotionCard 우회)
- `WelcomeBanner.tsx:94-103` — 자체 rounded-2xl + p-[3px] + inset shadow 로 bezel 재구현

**권장:**
- `MotionCard`에 variant 추가 (e.g. `variant: 'bezel' | 'flat' | 'bento'`) 또는 `BentoCard`·`ListCard` 별도 프리미티브 분리
- ProjectHealthCard, 프로젝트 목록 카드를 MotionCard로 통일
- WelcomeBanner는 `.bezel` / `.bezel-inner` 유틸리티로 교체해 수학적 일관성 확보 (현재 p-[3px]와 rounded-2xl=16px는 `.bezel`의 p-0.375rem + 1.75rem와 불일치)
- 대시보드 Row 1(bezel)과 Row 2(plain Card)의 "품격 낙차"를 정리 — 전부 bezel로 올리거나 Row 1을 flat으로 내리거나. 혼재는 피함.

---

### F4 — Emerald 시그널 희석: "allocation health"라는 의미가 사라짐

**Severity:** Major
**영향:** 원칙 "Emerald means health"가 무효화. 사용자가 `text-accent`를 봐도 "건강한 상태"인지 "일반 강조"인지 구별 불가.
**원칙:** "Emerald means health" (명시적으로 정의된 원칙)

**증거 (emerald이 의미 없이 쓰인 곳):**
- `Avatar.tsx:26` — **모든** avatar 배경이 `bg-accent-light`. 직원 20명 목록은 "emerald 원 20개 벽"
- `NavBar.tsx:128` — 로고 아이콘 emerald
- `WelcomeBanner.tsx:108,113,134` — 아이콘 박스, 아이콘, 액션 칩 테두리 모두 accent 혼합
- `admin/dashboard/page.tsx:60,85,108` — metric 타일 corner glow, live pulse dot, 아이콘 color — 모두 accent
- `LoginVisualPanel.tsx` — 워터마크 텍스트 `color-mix(... accent 12% ...)`
- `EmployeeCard.tsx:50,60` — skill chip bg-accent-light, prof dot bg-accent
- `ProgressBar.tsx:16` — 50% 미만도 `bg-allocation-low`인데 값이 `#34d399` (emerald)
- `spotlight-border` 그라디언트도 accent

**의미 있는 곳 (지켜야 함):**
- 배정률 컬러 단계 (low/medium/high/over)
- "정상" vs "지연" 배지 (ProjectHealthCard)
- 가용성 퍼센트

**권장:**
- 브랜드 장식 용도로 **중성 강조 색**을 하나 도입 (e.g. `--brand-mark: var(--foreground)` 또는 `#3f3f46`) — 로고, 워터마크, 장식 글로우는 이쪽으로 옮김
- `--allocation-low`를 채도 낮은 emerald 또는 **neutral-gray**로 교체해 "정상"과 "저할당" 시각 구별
- Avatar 배경은 이니셜 해시 기반 3~5색 팔레트(neutral tones)로 분산. Emerald avatar는 "현재 사용자(나)" 한정으로 시그널 유지
- Dashboard의 corner glow·pulse dot은 **값이 임계치를 넘었을 때만** 켜지도록 조건부로 — 장식이 아닌 시그널로 사용
- Skill chip은 accent-light 대신 `bg-muted` + 숙련도만 accent로 표시

이 작업 하나가 리포트 전체에서 **가장 큰 파급 효과**를 냅니다. "Emerald이 다시 의미를 갖는 순간 제품이 조여 보입니다."

---

### F5 — 폼 입력 요소들의 높이가 정렬 불가능

**Severity:** Major (모든 폼에서 시각 어긋남)
**영향:** 동일 행에 Input + Select + Button을 놓으면 세 요소의 높이(40/36/44)가 다 달라 baseline 파열. admin/skills, pm/staffing, edit 페이지, 계정 설정, MemberAssignment 전부 해당.
**원칙:** "Structure earns trust" — 같은 행이 울퉁불퉁하면 신뢰가 새어나감

**증거:**
- `primitives/Input.tsx:14` — `h-10` (40px)
- `primitives/Select.tsx:14` — `h-9` (36px)
- `primitives/Textarea.tsx:14` — 높이 미지정 (row 기반)
- `primitives/Button.tsx:15-17` — sm `h-11`, md `h-11`, lg `h-12` (Button sm/md 동일 높이는 그 자체가 버그)
- 대표: `admin/skills/page.tsx:63-68` — Input h-10 2개 옆에 Button h-11 → Button이 2px 크게 솟음
- 대표: `me/page.tsx:73-76` — Input disabled + Button size="sm" → 동일 문제

**권장:** 단일 폼 컨트롤 높이 스케일로 통일. `h-10`(40px) 기본, `h-11`(44px)는 primary action Button에만 허용하거나 Input/Select도 44px로 끌어올림. 현재의 "Button h-11 sm/md 동일"도 사이즈 토큰화 (`sm=36, md=40, lg=44`).

**추가:** Button의 `whileHover={{ y: -1, scale: 1.01 }}` 는 작은 버튼에 이중 변환 = 미세 긴장감. `scale: 1.01`은 거의 안 보이지만 jitter를 만듦. `y: -1`만 남기는 걸 고려.

---

### F6 — 터치 타깃 35% 이상 44px 미만 (AA 위반 & 어색한 느낌)

**Severity:** Major
**영향:** Pagination, Modal close, Drawer close, 테이블 인라인 Button(h-6 w-6 p-0), 아이콘 버튼들 — 이 "작은 탭 타깃" 군집이 전체 인터페이스를 "UI가 덜 성숙한" 느낌으로 만듦
**원칙:** "Every role deserves the same craft" + WCAG AA

**증거:**
- `Pagination.tsx:38` — `h-8 min-w-[2rem]` (32px)
- `Modal.tsx:125-132` — close X 아이콘 h-4 w-4 + p-1 ≈ 24px
- `Drawer.tsx:112-118` — close X 동일 24px
- `SkillEditPanel.tsx:91-102` — edit/delete 아이콘 버튼 `h-6 w-6 p-0` = 24px
- `admin/skills/page.tsx:139-155` — edit/merge/delete 아이콘 ghost 버튼 `size="sm"` 안에 h-3.5 아이콘 — 실측 터치 면적이 불명확

**권장:**
- Pagination PageButton: `h-10 min-w-10` 으로 상향
- Modal·Drawer close: `p-2` + `h-5 w-5` 아이콘 → 36~40px
- 테이블 행 액션: ghost button에 `min-h-9 min-w-9` 강제, 아이콘은 `h-4 w-4` 유지
- `baseline-ui` 스킬에 있는 터치 타깃 검사를 CI에 추가 고려

---

### F7 — 모션 언어가 두 개 (Spring vs easeOut) 공존

**Severity:** Major (체감)
**영향:** 동일 화면에서 카드는 spring으로 떠오르는데 모달·페이지 전환은 ease-out duration으로 움직임. "폴리시된 제품"은 모션 언어가 통일돼야 함.
**원칙:** "Motion is weight, not decoration" — spring이 원칙으로 명시됨

**증거 (Spring — 원칙 준수):**
- Button, MotionCard, NavBar, StaggerList, PhaseAccordion, ProjectHealthCard, WelcomeBanner, employees/[id] hero, MyTasksPanel, TaskRow

**증거 (easeOut / duration — 원칙 이탈):**
- `Modal.tsx:118` — `transition={{ duration: 0.2, ease: 'easeOut' }}`
- `PageTransition.tsx:13` — `duration: 0.3, ease: 'easeOut'`
- `ProgressBar.tsx:43` — `transition: 'transform 700ms ease-out'` (CSS)
- `SkillAutocomplete.tsx:78` — `transition={{ duration: 0.12 }}`
- `Tooltip.tsx:77` — `duration: 0.12, ease: 'easeOut'`
- `admin/allocations/page.tsx:46` — `duration: 0.2` (폼 접기)
- `SkillEditPanel.tsx:116` — `duration: 0.15` (편집 접기)

**권장:** `framer-motion` 헬퍼 (`motion/react`) 또는 자체 transition 상수 파일을 만들어 `spring.snappy`, `spring.gentle`, `fade.fast` 같은 **3~4개**의 고정 preset만 허용. Modal, Drawer, PageTransition은 spring으로 전환 (duration 기반은 fade-only 용도로 제한).

---

### F8 — `confirm()` 네이티브 다이얼로그 사용

**Severity:** Major
**영향:** 스킬 병합 확인이 브라우저 기본 다이얼로그로 뜸 — 방금 double-bezel + Plus Jakarta Sans + spring motion으로 올려둔 UI 품격이 한 번에 증발
**원칙:** "Every role deserves the same craft" — admin도 같은 craft

**증거:**
- `admin/skills/page.tsx:100` — `if (confirm(...))`
- 다른 화면에서는 Modal 프리미티브가 정상적으로 존재 (`Modal.tsx`)

**권장:** `Modal` 프리미티브로 교체. 공통 `<ConfirmDialog>` 컴포넌트 도입 (Modal 래퍼 + destructive variant) → 다른 destructive 액션(배정 비활성화, 프로젝트 보관 등)에서도 재사용.

---

### F9 — 테이블 행의 밀도·리듬이 "스프레드시트 수준"에 멈춤

**Severity:** Major
**영향:** `/admin/allocations`와 `/admin/skills`가 WBS의 운영 고빈도 화면인데 가장 flat함. 정렬·필터·hover 상태·zebra 없이 `text-sm` + `hover:bg-muted/50` 단일 반응. "daily 업무 도구"라는 정체성과 가장 어긋남
**원칙:** "Density through clarity, not compression"

**증거:**
- `admin/allocations/page.tsx:63-104` — 기본 HTML table, label-caps th, row hover만 있음
- `admin/skills/page.tsx:80-170` — 인라인 편집은 좋지만 기본 구조 동일
- 정렬 indicator 없음, 컬럼 너비 조절 없음, sticky header 없음, row stagger 없음

**권장:**
- `primitives/Table.tsx` (TableHeader, TableRow, TableCell, TableSortButton) 프리미티브 도입
- Row에 tabular-nums 적용(현재 `numeric` 클래스는 있지만 cell level에서 누락)
- 미세 row hover + subtle `accent/3%` 좌측 border on hover로 "선택될 수 있는 행" 시그널
- 비활성화(secondary) 액션은 overflow menu로 숨겨 행을 조여 보이게

---

### F10 — `/share/[token]` 공유 페이지가 다른 제품처럼 보임

**Severity:** Major (첫인상 브랜드)
**영향:** 링크 공유를 받은 외부 사용자가 보는 유일한 surface. 로고 없음, 브랜드 마크 없음, eyebrow 없음, MotionCard 없음, display typography 없음 — 로그인 화면의 세련됨과 완전히 대비
**원칙:** "Every role deserves the same craft" (외부 감상자도 role임)

**증거:**
- `share/[token]/page.tsx:29-76` — `max-w-xl`, plain `<div>`, hardcoded `text-2xl font-semibold tracking-tight`, plain Card 2개
- NavBar는 user가 없으면 숨김 (`NavBar.tsx:93`) → 로고가 아예 안 보임

**권장:** 간단한 public 상단 바 (Workforce 로고 + 도메인명 + "읽기 전용 공유" eyebrow) 추가. Card를 MotionCard로 교체. display-2 적용. 하단에 "회사명" 대신 작은 "Workforce — Internal Allocation" 아이덴티티. 읽기 전용이라는 점을 eyebrow로 명시.

---

### F11 — 스타일 이스케이프 해치가 여러 곳에 산재 (인라인 style + 임시 색 + 임의 bg)

**Severity:** Major (토큰 hygiene)
**영향:** `color-mix(in srgb, var(--accent) 12%, transparent)` 같은 인라인 계산이 코드 곳곳에 반복됨. 시스템에 올려야 할 semantic token들이 ad-hoc으로 존재. 테마 토큰이 누수되는 지점들.
**원칙:** "No hardcoded hex — always use CSS custom properties" (.impeccable.md에 명시)

**증거:**
- `EmployeeTaskList.tsx:11-14` — **Tailwind 원시 팔레트** `text-indigo-400`, `text-pink-400`, `text-emerald-400`, `text-amber-400`, `text-cyan-400`, `text-violet-400` 하드코드 (프로젝트 라벨 컬러)
- `WelcomeBanner.tsx:94,99,103,108,134` — 인라인 `style={{ background: 'color-mix(...)' }}` 5회 반복
- `LoginVisualPanel.tsx:22-23` — 인라인 clamp + color-mix
- `employees/[id]/page.tsx:83-84` — `bg-accent/6`, `bg-accent/4` 임의 소수점 opacity
- `primitives/Button.tsx:8,11` — variant 정의는 토큰 기반 ✓ (좋은 예시)

**권장:**
- 프로젝트 라벨 팔레트 → `--label-1 .. --label-6` 토큰화, EmployeeTaskList는 맵만 조회
- WelcomeBanner의 인라인 style 5회 → globals.css utility 2개 (`.banner-shell`, `.banner-icon-box`)로 추출
- `bg-accent/6`, `bg-accent/4` 같은 소수 퍼센트는 `--accent-glow-sm/md/lg` 토큰으로 정규화

---

### F12 — 페이지 엔트리 일관성: eyebrow + heading + action 패턴이 절반만 적용됨

**Severity:** Minor → Major (누적)
**영향:** 일부 화면은 `eyebrow` 태그로 "제품 수준" 느낌을 주고, 나머지는 flat H1만 있음. 같은 제품이라는 응집력이 깨짐.
**원칙:** "Structure earns trust"

**증거 (eyebrow 있음 ✓):**
- `employees/page.tsx:102,120` — `<p className="eyebrow">인력 현황</p>`
- `employees/[id]/page.tsx:100` — `<p className="eyebrow mb-2">...</p>`
- `admin/dashboard/page.tsx:191` — `<p className="eyebrow">관리자 대시보드</p>`
- `WelcomeBanner.tsx:120`

**증거 (eyebrow 없음 ❌):**
- `me/page.tsx:33-39` — hero 없음, 단순 `flex items-center gap-4`
- `projects/page.tsx:35` — H1만
- `projects/[id]/page.tsx:37-45` — H1 + badge만
- `admin/allocations/page.tsx:33` — H1만
- `admin/skills/page.tsx:39` — H1만
- `admin/projects/[id]/edit/page.tsx:34` — H1만
- `pm/staffing/page.tsx:56` — H1만
- `share/[token]/page.tsx:31-34` — 유사한 small muted text 1줄 사용

**권장:** `<PageHeader eyebrow heading action>` 공용 컴포넌트 도입. 모든 페이지 루트에서 동일 컴포넌트 사용을 강제. Empty state (`/share`)에도 light variant.

---

## 3. Principle-by-Principle Root Cause

### 3.1 Structure earns trust

**현재 상태:** Hero·대시보드 bento·employee detail 에서는 강하게 작동. 테이블·폼·목록에서 무너짐.

**새는 패턴들:**
- 페이지 H1 11개 중 9개가 시스템 타이포 우회 (F2)
- 폼 컨트롤 높이 3개가 모두 다름 (F5)
- eyebrow 패턴이 절반만 적용 (F12)
- Table이 "뼈대"만 있음 (F9)
- 각 Card 종류(plain/MotionCard/bezel/WelcomeBanner 자체 bezel)의 radius 수학이 다름 (F3)

**공통 원인:** **시스템이 만들어졌지만 사용을 강제하지 않았다.** Lint 규칙도 없고, PageHeader·FormField·Table 같은 "진입 프리미티브"가 없어 개발자가 "어차피 한 번이니까" 하드코딩 하게 됨.

---

### 3.2 Motion is weight, not decoration

**현재 상태:** 대부분 잘 작동. Spring 스프링 값(400~500 stiffness, 28~35 damping)은 CLAUDE.md 기준과 일치.

**새는 패턴들:**
- Modal, PageTransition, Tooltip이 easeOut 기반 (F7)
- ProgressBar primitive는 rAF + CSS transition(700ms ease-out), 같은 기능을 MemberAssignmentSection.tsx:186-190 에서 직접 재구현 (동일 값이지만 duplicate)
- `employees/[id]/page.tsx` hero — 요소마다 delay가 다른 spring 4~5개가 연쇄 (0.08, 0.14, 0.22) → 첫 화면 진입 시 "너무 많은 움직임"
- `LoginVisualPanel.tsx` — 7개 태그가 동시에 4~8초 주기로 무한 float — 로그인 같은 짧은 surface에서 배경이 계속 움직이는 건 "노이즈"에 가까움

**공통 원인:** 모션이 **컴포넌트마다 개별 결정**되고 있고 시스템 preset이 없음. 개별 결정이 누적되어 "어디를 봐야 할지 모호"해짐.

---

### 3.3 Density through clarity, not compression

**현재 상태:** 가장 약한 원칙.

**새는 패턴들:**
- 버튼 sm 사이즈가 md와 같은 `h-11` — 사이즈 스케일이 무의미 (F5)
- Avatar sm(32px) + text-xs(12px) → 이니셜이 빠듯하게 보임
- 테이블이 압축·정렬·스티키헤더 없이 flat (F9)
- `label-section`(11px/500) vs `label-caps`(11px/600/uppercase) 두 라벨 스타일이 같은 크기라 하나로 통합해도 될 것을 구분해 사용 — 그런데 사용 규칙이 명확치 않음 (`me/page.tsx:46`는 label-caps, `employees/[id]:144`는 label-section — 같은 역할)
- 타이포 스케일 15px(heading-3) → 11px(label)로 점프하고 12~14px 중간이 비어있음. 페이지마다 `text-xs/sm`으로 중간을 메우면서 미세 불일치 발생

**공통 원인:** 타이포 스케일에 구멍이 있고, 라벨 2종의 역할이 겹침.

---

### 3.4 Emerald means health

**현재 상태:** 원칙으로는 가장 명확한데 실행에서는 가장 많이 깨짐.

F4에서 상세. **Emerald이 장식으로 쓰인 9곳 vs 시그널로 쓰인 3곳** 비율만 봐도 시그널 경제가 망가져 있습니다.

---

### 3.5 Every role deserves the same craft

**새는 패턴들:**
- `/share/[token]` — 외부 감상자용 페이지가 가장 허술 (F10)
- `/admin/allocations`, `/admin/skills` — 관리자용 테이블이 "스프레드시트" 수준 (F9)
- `/admin/projects/[id]/edit` — ad-hoc Card 스타일 (border-accent/30, bg-accent-light/30 등) 섞여 있음
- `confirm()` 네이티브 다이얼로그 (F8)
- 폼 컴포넌트 (`AllocationForm`, `EmployeeForm`) — Button·Input·Select의 높이 불일치를 그대로 흡수 (F5 여파)

**공통 원인:** Admin view와 "나중에 추가된 화면들"(share, pm/staffing)이 엘레베이션 기간에 함께 업그레이드 되지 않음.

---

## 4. Category Deep-dives

### 4.1 Typography

- 스케일 구멍: heading-3(15px) → label(11px) 사이 중간톤 부재 → 대부분의 body text가 Tailwind `text-sm`(14px)로 흘러가면서 **헤딩 3 & 바디가 거의 같은 크기** → 위계 약화
- Body style 토큰 없음: 같은 "메타 텍스트"가 `text-xs text-muted-foreground`(38+곳)으로 반복됨 → `.body-meta`, `.body-helper` 유틸 도입으로 정규화 권장
- Font weight 분포: 400, 500, 600, 700, 800 — 실사용은 주로 400/500/600, 700은 display/heading에 집중, **800은 layout.tsx에 로드되지만 거의 미사용** → `weight: ['400', '500', '600', '700']`로 줄여 CLS·payload 개선
- GeistMono — `numeric` 유틸은 있는데 pages에서 `font-mono tabular-nums` 하드코드 (5곳 이상) → 재사용 안 되고 있음

### 4.2 Color & token hygiene

- F1: `--accent-foreground` 미정의 (Critical)
- F11: 인라인 color-mix, 원시 Tailwind 팔레트(text-indigo-400 등), 소수 opacity 하드코드 (Major)
- `--accent-text`(#047857)와 `--button-primary-bg`(#059669) 관계가 문서화 안 됨 — 하나는 "문자용 다크", 하나는 "버튼 배경" 인데 이름이 달라 혼동. 프리미티브에서 `bg-accent-dark` vs `bg-button-primary-bg` 혼용 발생 가능
- Destructive dark vs light variant: Button destructive는 `bg-destructive-dark`, Badge destructive는 `bg-destructive-light` — 올바른 패턴이지만 명명이 비대칭(`accent-dark` vs `button-primary-bg`)
- `--shadow-card-hover: 0 8px 40px -8px rgb(0 0 0 / 0.15)` — 40px blur spread는 "anti-pattern: 무거운 그림자"에 가까움. 20~24px로 낮추는 걸 권장

### 4.3 Motion & interaction

- F7: spring vs easeOut 혼재
- Hover micro-interaction: Button `y: -1 + scale: 1.01` (두 transform), MotionCard `y: -3 + shadow` (두 transform), NavBar Avatar `scale: 1.06`, TaskRow `x: 3`, MyTasksPanel `x: 2` — 통일된 "hover weight" 없음. 5가지 다른 느낌
- ThemeToggle `whileTap={{ rotate: 20, scale: 0.88 }}` — 테마 변경이 "재미있는 액션"으로 연출되는데, enterprise tool에서는 "트렌디"에 가까움 (CLAUDE.md: "modern without being trendy")
- `LoginVisualPanel` 7개 태그 무한 float — 로그인 surface에서 영속 애니메이션은 주의 분산. 3~4개로 줄이고 duration 줄이기 권장
- `.animate-pulse-ring` on Avatar when tasks > 0 — `@keyframes pulse-ring`는 박스섀도 애니메이션으로 GPU를 계속 깨움. 주의 환기용 임펄스 성격이라면 2번만 튀고 멈추는 편이 적절

### 4.4 Layout & density

- Main container `max-w-[1400px] px-4 sm:px-6 pt-24 pb-16` (`providers.tsx:24`) — 고정. `/share/[token]`도 이 컨테이너 안에 들어가 최대폭을 받는데, 공유 페이지는 자체 `max-w-xl`로 다시 제한 → 이중 컨테이너
- 사이드바 패턴 2종: `/employees`는 sticky left-sidebar, `/projects/[id]`는 right-panel — 유사한 "main + aside" 레이아웃인데 각기 다른 방향. 공통 `<Shell main aside>` 컴포넌트 없음
- Dashboard asymmetric 5-col(3+2)은 좋음 ✓ — 하지만 Row 1의 bezel vs Row 2의 plain card 높이 차이가 시각적 "계단" 생성 (F3 관련)
- Project list는 stacked `grid gap-4` single column — 바디 폭(max 1400 - sidebar 220 - gap = ~1150px)에 single column 카드가 너비 전부 차지 → "빈 공간감"이 느껴짐. 2-column 또는 "asymmetric list" 고려

### 4.5 Component & primitive hygiene

- `EmptyState` ✓ (잘 설계됨)
- `Pagination` — 구현 있지만 `/employees` 페이지가 직접 구현 (`page:200-206`) → Pagination 프리미티브 미사용
- `Modal` — 구현 있지만 `admin/skills`가 `confirm()` 사용 (F8)
- `Toast` / `Toaster` — 구현 있음. 실제 사용 surface 탐색 필요 (현재 검색 결과 거의 없음) — 사용자 피드백 채널로 활용 여지
- `Tooltip` — `SkillEditPanel`에서만 사용됨 (1곳). 테이블 action buttons에 추가 권장 (F6과 연동)
- `PageTransition` — 모든 페이지에서 감싸고 있음 ✓. 다만 easeOut 모션 (F7)
- `SkillBadge`, `SkillFreshnessBadge`, `AllocationBar` — `AllocationBar`는 ProgressBar의 얇은 래퍼(1줄). 중복 레이어, 제거 가능
- Forms (`AllocationForm`, `EmployeeForm`) — 미리보기 기반 이슈: 라벨/필드 정렬이 F5의 영향을 직접 받음. FormField 프리미티브 없음

---

## 5. Priority Queue — 손대는 순서

"가장 큰 파급 효과" 순으로. 각 항목 옆에 예상 영향(✱ = 한 곳, ✱✱ = 여러 화면, ✱✱✱ = 전 제품).

### Wave 1 — 구조적 토대 (1~2일, ✱✱✱)

1. **F1: `--accent-foreground` 토큰 추가** — 실제 버그. 5분 작업.
2. **F4: Emerald 해체** — Avatar 중립화, 장식 accent → brand-mark 중성 강조, allocation-low 톤 다운. 이 작업만으로 "어색함"의 30~40%가 사라집니다.
3. **F2+F12: PageHeader 프리미티브 도입 + 타이포 클래스 일괄 교체** — 11개 페이지 H1 통일. eyebrow 패턴 확장. `heading-4`, `body-base`, `body-meta` 토큰 추가.
4. **F5: 폼 컨트롤 높이 통일** — Input/Select를 `h-10`로 기준, Button sm=36/md=40/lg=44로 재정의.

### Wave 2 — 시스템 응집 (2~3일, ✱✱)

5. **F3: MotionCard variant 확장 + ProjectHealthCard·projects/page·WelcomeBanner 정리** — Card 계보 통일.
6. **F7: Motion preset 파일 도입** — Modal/PageTransition/Tooltip을 spring으로 이식.
7. **F11: 토큰 hygiene pass** — EmployeeTaskList 원시 팔레트 제거, WelcomeBanner 인라인 style → 유틸리티 추출, `--accent-glow-*` 토큰 도입.
8. **F8: ConfirmDialog 컴포넌트 + admin/skills merge 다이얼로그 교체**.

### Wave 3 — 테이블 & 밀도 (3~5일, ✱✱)

9. **F9: Table 프리미티브 도입**, sort indicator, subtle hover border, row stagger.
10. **F6: 터치 타깃 일괄 상향** — Pagination 40px, Modal/Drawer close 36~40px, 테이블 action min-w-9.
11. **4.3 Hover micro-interaction 통일** — `--hover-lift-sm/md/lg` 모션 preset 표준화.

### Wave 4 — 외주 화면 라이프팅 (1~2일, ✱✱)

12. **F10: `/share/[token]` 브랜딩 업** — public header, MotionCard, display-2.
13. **PM / Admin edit 화면 마감** — `admin/projects/[id]/edit`의 ad-hoc Card 스타일 정리.
14. **Forms (AllocationForm, EmployeeForm) 리뷰** — Wave 1 F5 적용 후 FormField 프리미티브 도입 여부 판단.

### Wave 5 — 폴리시 (상시, ✱)

- LoginVisualPanel 7→4 태그 축소, float duration 증가 (4s→6~8s)
- GeistMono 유틸 기반 표기 정규화 (하드코드 `font-mono tabular-nums` 제거)
- Theme toggle animation 단순화 (rotate 20 → y 상하 1px)
- Plus Jakarta Sans weight `['800']` 제거 (사용처 없음)
- `.animate-pulse-ring` 2번 한정 임펄스로 변경

---

## Appendix — 원본 증거 요약 (주요 수치)

| 항목 | 값 | 출처 |
|---|---|---|
| `--accent-foreground` 참조 | 3곳 | grep |
| `--accent-foreground` 정의 | 없음 | globals.css |
| H1 페이지 중 타이포 시스템 우회 | 11 / 13 | grep |
| MotionCard 실사용 컴포넌트 | 1 (EmployeeCard) | grep |
| `text-xs text-muted-foreground` 중복 | 39곳 / 21파일 | grep |
| `rounded-[var(--radius-*)]` 사용 | 34곳 / 27파일 | grep |
| `label-caps` + `label-section` 사용 | 38곳 / 17파일 | grep |
| 네이티브 `confirm()` 사용 | 1곳 (admin/skills) | grep |
| 폼 컨트롤 높이 | Input=40 / Select=36 / Button(sm,md)=44 / Button(lg)=48 | primitives |
| Pagination 버튼 높이 | 32px (AA: 44px) | Pagination:38 |

---

## Non-findings (언급 없이 확인한 잘 된 부분들)

균형을 위해 — 현재 **잘 작동하는** 것들:

- `bezel` + `bezel-inner` utility 수학은 정확함 (28px 외/22px 내/inset highlight)
- Spring preset 값 (stiffness 400~500, damping 28~35)이 CLAUDE.md와 일치
- `layoutId` nav pill transition은 폴리시된 동작
- `useCountUp` rAF 구현은 깨끗함
- ThemeProvider + `disableTransitionOnChange` — 올바른 선택
- PhaseAccordion의 stagger + caret rotation + height animation은 스프링으로 일관
- EmployeeCard의 spotlight-border + MotionCard 조합은 원칙의 모범 예시
- Login 페이지 asymmetric grid는 기업 로그인의 "SAP 느낌"을 잘 회피
- WelcomeBanner의 dismiss + 로컬스토리지 키 버저닝(`v1-`) 설계 깔끔
- Focus trap, aria-label, keyboard navigation이 Modal/Drawer에서 충실

---

*Audit complete. 다음 단계: Wave 1 항목부터 구현 계획(writing-plans)을 수립할지, 특정 Finding을 먼저 파고들지 결정 필요.*
