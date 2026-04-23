# Wave 1 Impeccable Audit — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix five foundational design system issues (F1/F2/F4/F5/F12) from the 2026-04-23 impeccable audit — pure design/token/primitive work, no feature changes. Deliver one bundled PR on branch `design/impeccable-audit`.

**Architecture:** Single-pass refactor in 10 tasks across 4 phases. Phase 0 adds missing CSS tokens and typography classes. Phase 1 unifies form control heights. Phase 2 introduces a `PageHeader` primitive and migrates 11 pages + fixes `/me`. Phase 3 decouples emerald decoration from the "allocation health" signal. Phase 4 verifies.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4 (with `@theme inline`), Framer Motion 12, TypeScript, Phosphor Icons. No new dependencies.

**Source spec:** `docs/superpowers/audits/2026-04-23-impeccable-audit.md`

> **No unit test framework exists** (Playwright is installed but requires the backend running). Verification strategy per task:
> - `cd frontend && npx tsc --noEmit` — type safety
> - `cd frontend && npm run build` — end-to-end compile (heavier; runs once per phase)
> - `git grep -n <pattern>` — negative assertions that removed hardcoded patterns stay removed
> - Manual dev server smoke test at the end (Phase 4)

---

## File Map

### New files
- `frontend/src/components/ui/primitives/PageHeader.tsx` — shared page header component (eyebrow + heading + optional append/subtitle/action/backTo)

### Modified foundation
- `frontend/src/app/globals.css` — new tokens `--accent-foreground`, `--brand-mark`, `--accent-glow-sm/md/lg`; new utility classes `.heading-4`, `.body-base`, `.body-meta`; retuned `--allocation-low`

### Modified primitives
- `frontend/src/components/ui/primitives/Select.tsx` — `h-9 → h-10`, `py-1.5 → py-2`
- `frontend/src/components/ui/primitives/Button.tsx` — sizes `sm:h-9` (36), `md:h-10` (40), `lg:h-11` (44)
- `frontend/src/components/ui/primitives/Avatar.tsx` — hash-based neutral palette; `tone?: 'hash' | 'accent'` prop
- `frontend/src/components/ui/primitives/index.ts` — export `PageHeader`

### Modified components (emerald decouple)
- `frontend/src/components/layout/NavBar.tsx` — logo `text-accent → text-brand-mark`; avatar `tone="accent"`
- `frontend/src/app/login/page.tsx` — logo `text-accent → text-brand-mark`
- `frontend/src/components/ui/WelcomeBanner.tsx` — replace ad-hoc bezel with `.bezel`/`.bezel-inner`; icon box + top edge neutralized
- `frontend/src/components/ui/EmployeeCard.tsx` — skill chip bg `accent-light → muted`; text neutral
- `frontend/src/components/ui/LoginVisualPanel.tsx` — watermark `accent → foreground`
- `frontend/src/app/admin/dashboard/page.tsx` — remove metric tile corner glow (decorative); keep live pulse dot (semantic)
- `frontend/src/app/me/page.tsx` — avatar `tone="accent"` (my identity)

### Modified pages (PageHeader migration — 11 pages)
- `frontend/src/app/admin/allocations/page.tsx`
- `frontend/src/app/admin/skills/page.tsx`
- `frontend/src/app/admin/projects/new/page.tsx`
- `frontend/src/app/admin/projects/[id]/edit/page.tsx`
- `frontend/src/app/admin/employees/new/page.tsx`
- `frontend/src/app/admin/employees/[id]/edit/page.tsx`
- `frontend/src/app/projects/page.tsx`
- `frontend/src/app/projects/[id]/page.tsx`
- `frontend/src/app/pm/staffing/page.tsx`
- `frontend/src/app/share/[token]/page.tsx`
- `frontend/src/app/employees/[id]/edit/page.tsx`

### Modified page (F2 only)
- `frontend/src/app/me/page.tsx` — `h1` classes `text-xl sm:text-2xl font-semibold tracking-tight → heading-1` (handled together with avatar tone change)

### Skipped deliberately (out of Wave 1 scope)
- Forms (`AllocationForm`, `EmployeeForm`) — benefit from Phase 1 mechanical height fix automatically; dedicated FormField primitive is Wave 2.
- `MotionCard` expansion — Wave 2 (F3).
- Motion preset consolidation — Wave 2 (F7).
- Table primitive, ConfirmDialog — Wave 2/3 (F8, F9).

---

## Phase 0 — Token Foundation

One task. Produces the CSS building blocks every later phase depends on.

### Task 0.1: Add tokens + typography classes to `globals.css`

**Files:**
- Modify: `frontend/src/app/globals.css`

**Rationale:** Add the three missing pieces at once so later tasks can reference `text-accent-foreground`, `text-brand-mark`, `.heading-4` without touching `globals.css` again.

- [ ] **Step 1: Add `--accent-foreground` to light `:root` block**

In `frontend/src/app/globals.css`, inside the `:root` block, after the `--accent-text` line (≈ line 22), add:

```css
  --accent-foreground: #ffffff;          /* foreground on accent surfaces — AA ≥ 4.5 with button-primary-bg */
```

- [ ] **Step 2: Add `--accent-foreground` and the rest of new tokens to `.dark` block**

Inside the `.dark` block after `--accent-text: #6ee7b7;`, add:

```css
  --accent-foreground: #042f1f;          /* dark tone that reads on lighter dark-mode accent */
```

- [ ] **Step 3: Add neutral brand mark + accent glow tokens (both blocks)**

In `:root` block after `--accent-foreground` (from step 1):

```css
  /* Neutral brand decoration — used for logos & ambient glows so accent stays semantic */
  --brand-mark:        #52525b;            /* zinc-600 */
  --accent-glow-sm:    color-mix(in srgb, var(--accent) 6%, transparent);
  --accent-glow-md:    color-mix(in srgb, var(--accent) 10%, transparent);
  --accent-glow-lg:    color-mix(in srgb, var(--accent) 15%, transparent);
```

In `.dark` block after its new `--accent-foreground`:

```css
  --brand-mark:        #d4d4d8;            /* zinc-300 */
```

(`--accent-glow-*` resolve against `--accent` which is already dark-mode-aware, so no dark overrides needed for those three.)

- [ ] **Step 4: Retune `--allocation-low`**

In the `:root` block, change:

```css
  --allocation-low:    #34d399;
```

to:

```css
  --allocation-low:    #6ee7b7;  /* emerald-300 — still reads "available" but leaves pure emerald (#10b981) as the primary-health signal */
```

In the `.dark` block, change:

```css
  --allocation-low:    #34d399;
```

to:

```css
  --allocation-low:    #a7f3d0;
```

- [ ] **Step 5: Map new tokens into `@theme inline`**

In the `@theme inline` block, add:

```css
  --color-accent-foreground: var(--accent-foreground);
  --color-brand-mark:        var(--brand-mark);
  --color-accent-glow-sm:    var(--accent-glow-sm);
  --color-accent-glow-md:    var(--accent-glow-md);
  --color-accent-glow-lg:    var(--accent-glow-lg);
```

Place these next to the existing `--color-accent` / `--color-accent-dark` lines so Tailwind v4 exposes `text-accent-foreground`, `text-brand-mark`, `bg-accent-glow-md`, etc.

- [ ] **Step 6: Add typography scale fillers**

In the `@layer base` block, after the `.label-section` line, add:

```css
  .heading-4  { font-size: 0.875rem;  font-weight: 600; letter-spacing: -0.005em; line-height: 1.4; }
  .body-base  { font-size: 0.875rem;  font-weight: 400; line-height: 1.55; }
  .body-meta  { font-size: 0.75rem;   font-weight: 400; color: var(--muted-foreground); line-height: 1.45; }
```

- [ ] **Step 7: Verify tokens compile cleanly**

Run:

```bash
cd frontend && npx tsc --noEmit
```

Expected: exit 0, no errors (this just reads the CSS; type check is for the project).

Then:

```bash
cd frontend && npm run build
```

Expected: build completes with no CSS errors. New tokens will be referenced in later phases; here we only confirm nothing is broken by the additions.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/app/globals.css
git commit -m "feat(tokens): add accent-foreground, brand-mark, accent-glow, heading-4/body-base/body-meta; retune allocation-low"
```

---

## Phase 1 — Form Primitive Heights (F5)

One task. Unify control heights so forms align.

### Task 1.1: Unify Input/Select/Textarea/Button heights

**Files:**
- Modify: `frontend/src/components/ui/primitives/Select.tsx`
- Modify: `frontend/src/components/ui/primitives/Button.tsx`
- Verify: `frontend/src/components/ui/primitives/Input.tsx` (already `h-10` — no-op)
- Verify: `frontend/src/components/ui/primitives/Textarea.tsx` (no fixed height by design — no-op)

- [ ] **Step 1: Select → `h-10 py-2`**

In `frontend/src/components/ui/primitives/Select.tsx`, line 14, change:

```tsx
'flex h-9 w-full rounded-[var(--radius-md)] border bg-card px-3 py-1.5 text-sm',
```

to:

```tsx
'flex h-10 w-full rounded-[var(--radius-md)] border bg-card px-3 py-2 text-sm',
```

- [ ] **Step 2: Button size scale → 36 / 40 / 44**

In `frontend/src/components/ui/primitives/Button.tsx`, lines 14-18, replace the `sizes` object:

```tsx
const sizes = {
  sm: 'h-9 px-3 text-xs gap-1.5',   // 36px — inline table actions, icon buttons
  md: 'h-10 px-4 text-sm gap-2',    // 40px — aligns with Input/Select
  lg: 'h-11 px-5 text-sm gap-2',    // 44px — primary CTAs
} as const
```

- [ ] **Step 3: Type check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 4: Build**

```bash
cd frontend && npm run build
```

Expected: build succeeds. Call sites compile unchanged because `size` prop surface is identical.

- [ ] **Step 5: Negative grep — no h-9 remains on Select, no h-11 remains on Button sm/md**

```bash
git grep -n "h-9 w-full" frontend/src/components/ui/primitives/Select.tsx
```

Expected: no matches.

```bash
git grep -n "h-11 px-3.5\|h-11 px-4" frontend/src/components/ui/primitives/Button.tsx
```

Expected: no matches.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/ui/primitives/Select.tsx frontend/src/components/ui/primitives/Button.tsx
git commit -m "refactor(primitives): unify form control heights — Input/Select h-10, Button sm/md/lg 36/40/44"
```

---

## Phase 2 — PageHeader Primitive & Typography Migration (F2 + F12)

Five tasks. Create the primitive, migrate pages in two batches, then handle the `/me` outlier.

### Task 2.1: Create `PageHeader` primitive

**Files:**
- Create: `frontend/src/components/ui/primitives/PageHeader.tsx`
- Modify: `frontend/src/components/ui/primitives/index.ts`

- [ ] **Step 1: Create the component file**

Write `frontend/src/components/ui/primitives/PageHeader.tsx`:

```tsx
import Link from 'next/link'
import { ArrowLeft } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  /** Small uppercase tag above heading — e.g. "관리자", "인력 현황" */
  eyebrow?: string
  /** Main H1 text */
  heading: string
  /** Node rendered next to the heading (e.g. status Badge) */
  headingAppend?: React.ReactNode
  /** Description / metadata line under heading */
  subtitle?: React.ReactNode
  /** Right-side actions (buttons, filter controls) */
  action?: React.ReactNode
  /** Back link shown above the eyebrow */
  backTo?: { href: string; label: string }
  className?: string
}

export function PageHeader({
  eyebrow,
  heading,
  headingAppend,
  subtitle,
  action,
  backTo,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('mb-6', className)}>
      {backTo && (
        <Link
          href={backTo.href}
          className="inline-flex items-center gap-1.5 body-meta hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backTo.label}
        </Link>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="heading-1">{heading}</h1>
            {headingAppend}
          </div>
          {subtitle && <div className="body-meta mt-1.5">{subtitle}</div>}
        </div>
        {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Export from `index.ts`**

In `frontend/src/components/ui/primitives/index.ts`, add:

```ts
export { PageHeader } from './PageHeader'
```

Place near the other layout-ish exports (`Drawer`, `PageTransition`).

- [ ] **Step 3: Type check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/ui/primitives/PageHeader.tsx frontend/src/components/ui/primitives/index.ts
git commit -m "feat(primitives): add PageHeader — shared eyebrow + heading-1 + action surface"
```

---

### Task 2.2: Migrate admin pages to `PageHeader` (6 files)

**Files:**
- Modify: `frontend/src/app/admin/allocations/page.tsx`
- Modify: `frontend/src/app/admin/skills/page.tsx`
- Modify: `frontend/src/app/admin/projects/new/page.tsx`
- Modify: `frontend/src/app/admin/projects/[id]/edit/page.tsx`
- Modify: `frontend/src/app/admin/employees/new/page.tsx`
- Modify: `frontend/src/app/admin/employees/[id]/edit/page.tsx`

- [ ] **Step 1: `admin/allocations/page.tsx`**

Add `PageHeader` to the `primitives` import on line 18. Replace lines 33-38:

```tsx
<div className="flex justify-between items-center">
  <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">배정 관리</h1>
  <Button onClick={() => setShowForm(s => !s)} variant={showForm ? 'secondary' : 'primary'}>
    {showForm ? '취소' : <><Plus className="h-4 w-4" />배정 추가</>}
  </Button>
</div>
```

with:

```tsx
<PageHeader
  eyebrow="관리자"
  heading="배정 관리"
  action={
    <Button onClick={() => setShowForm(s => !s)} variant={showForm ? 'secondary' : 'primary'}>
      {showForm ? '취소' : <><Plus className="h-4 w-4" />배정 추가</>}
    </Button>
  }
/>
```

- [ ] **Step 2: `admin/skills/page.tsx`**

Add `PageHeader` to the primitives import on line 8. Replace line 39:

```tsx
<h1 className="text-2xl font-semibold tracking-tight">스킬 관리</h1>
```

with:

```tsx
<PageHeader eyebrow="관리자" heading="스킬 관리" />
```

- [ ] **Step 3: `admin/projects/new/page.tsx`**

Read the file first to see the existing header structure (expected: similar H1 hardcode with mb-6). Add `PageHeader` to primitives import. Replace the `h1` with:

```tsx
<PageHeader
  eyebrow="관리자"
  heading="새 프로젝트"
  backTo={{ href: '/projects', label: '프로젝트 목록으로' }}
/>
```

Remove the standalone `mb-6` wrapper if the heading was the only thing using it (PageHeader owns its bottom margin).

- [ ] **Step 4: `admin/projects/[id]/edit/page.tsx`**

Add `PageHeader` to primitives import. Replace lines 29-41 (the current back-link + flex-H1+button block):

```tsx
<PageHeader
  eyebrow="관리자"
  heading={`수정: ${project.name}`}
  backTo={{ href: `/projects/${id}`, label: '프로젝트로 돌아가기' }}
  action={
    <Button
      variant="destructive"
      size="sm"
      loading={isPending}
      onClick={() => update({ status: 'ARCHIVED' }, { onSuccess: () => router.push('/projects') })}
    >
      프로젝트 보관
    </Button>
  }
/>
```

Remove the now-orphaned `ArrowLeft` import on line 8 — it's consumed inside PageHeader.

- [ ] **Step 5: `admin/employees/new/page.tsx`**

Read the file, replace the H1 block similarly:

```tsx
<PageHeader
  eyebrow="관리자"
  heading="직원 추가"
  backTo={{ href: '/employees', label: '직원 목록으로' }}
/>
```

- [ ] **Step 6: `admin/employees/[id]/edit/page.tsx`**

Replace the H1 block with:

```tsx
<PageHeader
  eyebrow="관리자"
  heading="직원 정보 수정"
  backTo={{ href: `/employees/${id}`, label: '직원 상세로' }}
/>
```

- [ ] **Step 7: Type check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: exit 0. Fix any unused-import warnings.

- [ ] **Step 8: Negative grep — ensure no hardcoded H1 tracking-tight remains in admin/**

```bash
git grep -n "text-2xl font-semibold tracking-tight\|text-xl sm:text-2xl font-semibold tracking-tight" frontend/src/app/admin/
```

Expected: no matches.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/app/admin
git commit -m "refactor(admin): migrate admin pages to PageHeader primitive"
```

---

### Task 2.3: Migrate non-admin pages to `PageHeader` (5 files)

**Files:**
- Modify: `frontend/src/app/projects/page.tsx`
- Modify: `frontend/src/app/projects/[id]/page.tsx`
- Modify: `frontend/src/app/pm/staffing/page.tsx`
- Modify: `frontend/src/app/share/[token]/page.tsx`
- Modify: `frontend/src/app/employees/[id]/edit/page.tsx`

- [ ] **Step 1: `projects/page.tsx`**

Add `PageHeader` to primitives import. **Replace the ENTIRE `<div className="flex justify-between items-center mb-8">…</div>` block (lines 35-54)** — both the outer flex wrapper and everything inside. PageHeader has its own `mb-6` margin and its own flex layout; leaving the wrapper would double-wrap it. Replacement:

```tsx
<PageHeader
  heading="프로젝트"
  action={
    <>
      <div className="flex bg-muted rounded-[var(--radius-lg)] p-0.5">
        {filters.map(f => (
          <button
            key={f.label}
            onClick={() => setStatus(f.value)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-[var(--radius-md)] transition-colors',
              status === f.value
                ? 'bg-card text-foreground shadow-sm font-medium'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <Link href="/admin/projects/new">
        <Button><Plus className="h-4 w-4" />새 프로젝트</Button>
      </Link>
    </>
  }
/>
```

(The closing `</div>` from the original wrapper is also removed.)

- [ ] **Step 2: `projects/[id]/page.tsx`**

Add `PageHeader` to primitives import. Replace lines 37-49 (the flex/H1/description block):

```tsx
<PageHeader
  heading={project.name}
  headingAppend={
    <Badge variant={STATUS_VARIANT[project.status]}>
      {STATUS_LABEL[project.status] ?? project.status}
    </Badge>
  }
  subtitle={
    <>
      {project.description && <p>{project.description}</p>}
      <p>{project.startDate}{project.endDate ? ` → ${project.endDate}` : ''}</p>
    </>
  }
  action={
    <Link href={`/admin/projects/${id}/edit`}>
      <Button variant="secondary" size="sm"><PencilSimple className="h-4 w-4" />수정</Button>
    </Link>
  }
/>
```

- [ ] **Step 3: `pm/staffing/page.tsx`**

Add `PageHeader` to primitives import. Replace line 56:

```tsx
<h1 className="text-2xl font-semibold tracking-tight">인력 요청</h1>
```

with:

```tsx
<PageHeader eyebrow="프로젝트 매니저" heading="인력 요청" />
```

- [ ] **Step 4: `share/[token]/page.tsx`**

Add `PageHeader` to primitives import. Replace lines 30-35 (the div with small muted text + h1 + subtitle):

```tsx
<PageHeader
  eyebrow="읽기 전용 공유"
  heading={data.fullName}
  subtitle={`${data.jobTitle} · ${data.department}`}
/>
```

- [ ] **Step 5: `employees/[id]/edit/page.tsx`**

Add `PageHeader` to primitives import. Replace line 45:

```tsx
<h1 className="text-2xl font-semibold tracking-tight mb-6">프로필 수정</h1>
```

with:

```tsx
<PageHeader
  eyebrow="프로필"
  heading="프로필 수정"
  backTo={{ href: `/employees/${id}`, label: '직원 상세로' }}
/>
```

- [ ] **Step 6: Type check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 7: Negative grep — zero hardcoded H1s in `app/` (excluding pages that already use typography classes)**

```bash
git grep -n "text-2xl font-semibold tracking-tight" frontend/src/app/
```

Expected: no matches (all migrated).

```bash
git grep -n "text-xl sm:text-2xl font-semibold tracking-tight" frontend/src/app/
```

Expected: only `frontend/src/app/me/page.tsx:36` remains (handled in Task 2.4).

- [ ] **Step 8: Commit**

```bash
git add frontend/src/app/projects frontend/src/app/pm frontend/src/app/share frontend/src/app/employees/\[id\]/edit
git commit -m "refactor(pages): migrate public pages to PageHeader primitive"
```

---

### Task 2.4: Fix `/me` H1 and final typography verification

**Files:**
- Modify: `frontend/src/app/me/page.tsx`

The `/me` hero is Avatar-next-to-name — a pattern unlike other pages. Keeping its shape, we only normalize typography.

- [ ] **Step 1: `me/page.tsx` — swap H1 class**

Change line 36:

```tsx
<h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{employee.fullName}</h1>
```

to:

```tsx
<h1 className="heading-1">{employee.fullName}</h1>
```

And line 37 (the subtitle line):

```tsx
<p className="text-muted-foreground">{employee.jobTitle} · {employee.team ?? employee.department}</p>
```

to:

```tsx
<p className="body-base text-muted-foreground">{employee.jobTitle} · {employee.team ?? employee.department}</p>
```

- [ ] **Step 2: Final negative grep**

```bash
git grep -n "text-xl sm:text-2xl font-semibold tracking-tight\|text-2xl font-semibold tracking-tight" frontend/src/app/
```

Expected: zero matches across all pages.

- [ ] **Step 3: Type check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/me/page.tsx
git commit -m "refactor(me): switch /me header to heading-1 + body-base classes"
```

---

## Phase 3 — Emerald Signal Decouple (F4)

Three tasks. The single largest "어설픔" lever — untangle decoration from signal.

### Task 3.1: `Avatar` — hash-based neutral palette + `tone` prop

**Files:**
- Modify: `frontend/src/components/ui/primitives/Avatar.tsx`
- Modify: `frontend/src/components/layout/NavBar.tsx` (opt-in accent)
- Modify: `frontend/src/app/me/page.tsx` (opt-in accent)

The default Avatar stops screaming emerald everywhere. Only "this is me" surfaces (nav avatar, my page hero) keep the emerald tone as identity signal.

- [ ] **Step 1: Rewrite `Avatar.tsx`**

Replace the entire file contents with:

```tsx
import { cn } from '@/lib/utils'

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
} as const

/** Neutral tone families — keeps avatars readable as "people" without the emerald-wall effect. */
const HASH_PALETTES = [
  'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200',
  'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-200',
  'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200',
  'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
] as const

function hashPalette(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) {
    h = ((h * 31) + name.charCodeAt(i)) >>> 0
  }
  return HASH_PALETTES[h % HASH_PALETTES.length]
}

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  size?: keyof typeof sizes
  /** `hash` (default) = deterministic neutral tone. `accent` = emerald — reserve for "current user" surfaces. */
  tone?: 'hash' | 'accent'
}

export function Avatar({ name, size = 'md', tone = 'hash', className, ...props }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const toneClass = tone === 'accent'
    ? 'bg-accent-light text-accent-dark'
    : hashPalette(name)

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold shrink-0',
        sizes[size],
        toneClass,
        className,
      )}
      {...props}
    >
      {initials}
    </div>
  )
}
```

- [ ] **Step 2: NavBar uses `tone="accent"` (current user signal)**

In `frontend/src/components/layout/NavBar.tsx` around line 163-167, change:

```tsx
<Avatar
  name={user!.email}
  size="sm"
  className="cursor-pointer hover:ring-2 hover:ring-accent transition-all"
/>
```

to:

```tsx
<Avatar
  name={user!.email}
  size="sm"
  tone="accent"
  className="cursor-pointer hover:ring-2 hover:ring-accent transition-all"
/>
```

- [ ] **Step 3: `/me` hero avatar uses `tone="accent"`**

In `frontend/src/app/me/page.tsx` line 34, change:

```tsx
<Avatar name={employee.fullName} size="lg" />
```

to:

```tsx
<Avatar name={employee.fullName} size="lg" tone="accent" />
```

- [ ] **Step 4: Type check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ui/primitives/Avatar.tsx frontend/src/components/layout/NavBar.tsx frontend/src/app/me/page.tsx
git commit -m "feat(avatar): hash-based neutral palette; accent tone opt-in for current-user surfaces"
```

---

### Task 3.2: Component decoration → neutral (NavBar logo, WelcomeBanner, EmployeeCard chip, LoginVisualPanel watermark, Login logo)

**Files:**
- Modify: `frontend/src/components/layout/NavBar.tsx`
- Modify: `frontend/src/app/login/page.tsx`
- Modify: `frontend/src/components/ui/WelcomeBanner.tsx`
- Modify: `frontend/src/components/ui/EmployeeCard.tsx`
- Modify: `frontend/src/components/ui/LoginVisualPanel.tsx`

> **Before Step 3:** read `frontend/src/components/ui/WelcomeBanner.tsx` end-to-end first. Step 3 replaces only the inner JSX of the outer `motion.div` — the surrounding `AnimatePresence`, `useState`, `useEffect`, and the `motion.div`'s `initial/animate/exit/transition` props all stay. A blind paste will break the file.

- [ ] **Step 1: NavBar logo — `text-accent → text-brand-mark`**

In `frontend/src/components/layout/NavBar.tsx` line 128:

```tsx
<UsersThree className="h-5 w-5 text-accent" weight="duotone" />
```

→

```tsx
<UsersThree className="h-5 w-5 text-brand-mark" weight="duotone" />
```

- [ ] **Step 2: Login page logo — `text-accent → text-brand-mark`**

In `frontend/src/app/login/page.tsx` line 37:

```tsx
<UsersThree className="h-5 w-5 text-accent" weight="duotone" />
```

→

```tsx
<UsersThree className="h-5 w-5 text-brand-mark" weight="duotone" />
```

- [ ] **Step 3: WelcomeBanner — use `.bezel`/`.bezel-inner`, neutralize icon box + top edge**

In `frontend/src/components/ui/WelcomeBanner.tsx`, replace the inner JSX (lines 93-154, inside `motion.div`) with:

```tsx
<div className="bezel">
  <div className="bezel-inner px-5 py-4 flex items-start gap-4 relative overflow-hidden">
    {/* Icon column */}
    <div className="shrink-0 mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center bg-muted">
      <Icon className="h-5 w-5 text-brand-mark" weight="duotone" />
    </div>

    {/* Content */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="eyebrow">{config.eyebrow}</span>
      </div>
      <h2 className="heading-2 mb-1">{config.heading}</h2>
      <p className="body-base text-muted-foreground mb-3">{config.body}</p>

      {/* Quick actions — chips keep accent text (they ARE calls to action) but neutral borders */}
      <div className="flex flex-wrap gap-2">
        {config.actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            onClick={dismiss}
            className="welcome-action-link inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-border text-accent-text transition-colors duration-150 hover:border-accent/40"
          >
            {action.label}
            <ArrowRight className="h-3 w-3" weight="bold" />
          </Link>
        ))}
      </div>
    </div>

    {/* Dismiss */}
    <button
      onClick={dismiss}
      aria-label="닫기"
      className="shrink-0 -mt-0.5 -mr-1 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
    >
      <X className="h-4 w-4" weight="bold" />
    </button>
  </div>
</div>
```

The removed pieces:
- Ad-hoc outer `rounded-2xl p-[3px] bg-[color-mix(...)]` → replaced by `.bezel` utility
- Accent-tinted top gradient edge (deleted)
- Inline-style accent icon box + icon color → neutral `bg-muted` + `text-brand-mark`
- Action chip inline-style accent border → neutral `border-border`, accent only shows on hover

Keep the outer `motion.div` with its `initial/animate/exit` spring props (no change there).

- [ ] **Step 4: EmployeeCard skill chip → neutral**

In `frontend/src/components/ui/EmployeeCard.tsx` lines 48-52, change:

```tsx
<span
  key={s.skillId}
  className="inline-flex items-center gap-1 px-2 py-1 rounded-[var(--radius-sm)] bg-accent-light/40 text-xs font-medium text-accent-text"
>
```

to:

```tsx
<span
  key={s.skillId}
  className="inline-flex items-center gap-1 px-2 py-1 rounded-[var(--radius-sm)] bg-muted text-xs font-medium text-foreground"
>
```

The proficiency dots below (`bg-accent` when filled) stay — those **are** the semantic signal of skill level.

- [ ] **Step 5: LoginVisualPanel watermark → neutral**

In `frontend/src/components/ui/LoginVisualPanel.tsx` lines 20-24:

```tsx
<p
  className="font-bold leading-none tracking-tighter"
  style={{
    fontSize: 'clamp(3rem, 8vw, 6rem)',
    color: 'color-mix(in srgb, var(--accent) 12%, var(--foreground) 6%)',
  }}
>
```

→

```tsx
<p
  className="font-bold leading-none tracking-tighter"
  style={{
    fontSize: 'clamp(3rem, 8vw, 6rem)',
    color: 'color-mix(in srgb, var(--foreground) 10%, transparent)',
  }}
>
```

(The floating skill tags keep their neutral-card look; `.mesh-gradient` background keeps accent because it is the branded login surface.)

- [ ] **Step 6: Type check + build**

```bash
cd frontend && npx tsc --noEmit && npm run build
```

Expected: both succeed.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/layout/NavBar.tsx frontend/src/app/login/page.tsx frontend/src/components/ui/WelcomeBanner.tsx frontend/src/components/ui/EmployeeCard.tsx frontend/src/components/ui/LoginVisualPanel.tsx
git commit -m "refactor(decoration): decouple emerald from brand/decoration — logos, welcome banner, skill chips, login watermark → neutral"
```

---

### Task 3.3: Dashboard — remove decorative corner glow (keep semantic pulse dot)

**Files:**
- Modify: `frontend/src/app/admin/dashboard/page.tsx`

Rationale: `MetricBentoCard` renders a `bg-accent/10 blur-2xl` corner glow on every tile — pure decoration, not a signal. The `bezel` already provides depth; the glow dilutes emerald. The live pulse dot on `AvailabilityBentoCard` IS semantic ("live data") and stays.

- [ ] **Step 1: Remove corner glow from `MetricBentoCard`**

In `frontend/src/app/admin/dashboard/page.tsx` lines 58-60, delete:

```tsx
        {/* Corner glow */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-accent/10 blur-2xl pointer-events-none" />
```

The parent `<div className="bezel-inner relative overflow-hidden p-5">` can keep `relative overflow-hidden` since nothing else positions off it in this tile — actually verify no other absolute children exist here; after the glow removal, `relative overflow-hidden` is unused. Change:

```tsx
<div className="bezel-inner relative overflow-hidden p-5">
```

to:

```tsx
<div className="bezel-inner p-5">
```

- [ ] **Step 2: Also remove ambient glows from `employees/[id]/page.tsx` hero (same pattern)**

In `frontend/src/app/employees/[id]/page.tsx` lines 82-84, delete:

```tsx
          {/* Ambient glows */}
          <div className="absolute -top-8 -left-8 w-48 h-48 rounded-full bg-accent/6 blur-3xl pointer-events-none" />
          <div className="absolute -top-4 right-1/3 w-32 h-32 rounded-full bg-accent/4 blur-2xl pointer-events-none" />
```

The `<div className="relative mb-2 pb-10">` keeps `relative` because the hairline divider uses `origin-left` on a non-absolute element — no adjustments needed. (Verify by checking the rest of the hero block.)

- [ ] **Step 3: Type check + build**

```bash
cd frontend && npx tsc --noEmit && npm run build
```

Expected: success.

- [ ] **Step 4: Negative grep — `bg-accent/` decorative uses gone**

```bash
git grep -n "bg-accent/[0-9]" frontend/src/
```

Expected: minimal matches. Allowed remaining: nothing required — if any show up, they must be semantic (e.g. inside a progress/status path). Report any residual matches for case-by-case review.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/admin/dashboard/page.tsx frontend/src/app/employees/\[id\]/page.tsx
git commit -m "refactor(decoration): remove decorative accent glows from dashboard tiles and employee hero"
```

---

## Phase 4 — Verification

One consolidated task. Type + build + grep + manual smoke test.

### Task 4.1: Final verification pass

- [ ] **Step 1: Type check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 2: Build**

```bash
cd frontend && npm run build
```

Expected: build succeeds with no warnings about missing tokens / unknown utility classes.

- [ ] **Step 3: Negative grep — all F-level target patterns gone**

Run all of these and expect zero matches:

```bash
# F1 is fixed by token definition — verify the token exists
git grep -n "accent-foreground" frontend/src/app/globals.css
# expected: 2 definitions (light + dark), 1 @theme mapping

# F2 — no hardcoded H1 remains anywhere in app/
git grep -n "text-2xl font-semibold tracking-tight" frontend/src/app/
git grep -n "text-xl sm:text-2xl font-semibold tracking-tight" frontend/src/app/

# F5 — Select height and Button sm h-11 gone
git grep -n "h-9 w-full" frontend/src/components/ui/primitives/Select.tsx
git grep -n "sm: 'h-11" frontend/src/components/ui/primitives/Button.tsx
```

All five commands expected: zero matches (except the first `accent-foreground` grep which should have 3 hits — the token itself).

- [ ] **Step 4: Positive grep — new primitives are used**

```bash
# PageHeader adopted by 11 pages
git grep -l "<PageHeader" frontend/src/app/ | wc -l
# expected: 11
```

If the count is less than 11, audit which page was missed.

- [ ] **Step 5: Manual smoke test — user-performed**

Start dev server (requires backend; if backend is not reachable, skip this step and rely on build verification):

```bash
cd frontend && npm run dev
```

Visit and visually verify, one page at a time. Check list:

- [ ] `/login` — logo is **neutral** (not emerald). Form labels align. Watermark "인력 배치" is very subtle grey, not green. Floating tags animate smoothly.
- [ ] `/employees` — directory avatars are **varied grey tones** (zinc/stone/neutral/slate), not all green. Filter form inputs align with the 필터 button baseline.
- [ ] `/employees/[id]` — hero: no ambient green glows behind the name. Avatar is **neutral** (unless this is current user — still neutral, that's intended). Skill chips have **grey background** with green proficiency dots.
- [ ] `/me` — avatar is **emerald** (intentional — "my identity"). Heading 1 reads at heading-1 scale (24px, -0.025em tracking). Password form: Input and Button line up.
- [ ] `/admin/dashboard` — three metric tiles: **no corner glow**. Pulse dot on "여유 인력" header **still pulses** (semantic live indicator). Availability list avatars are grey (hash palette).
- [ ] `/admin/allocations` — page header has eyebrow "관리자" + heading + action button. Table unchanged.
- [ ] `/admin/skills` — page header with eyebrow. Merge-mode banner unchanged. Inline edit Input + Button row aligns.
- [ ] `/admin/projects/[id]/edit` — back link visible, eyebrow, heading, destructive "보관" action on the right.
- [ ] `/projects` — page header with action pill (filter toggle + new project button). Project cards unchanged.
- [ ] `/projects/[id]` — page header with heading + status badge + description subtitle + 수정 button.
- [ ] `/pm/staffing` — page header with eyebrow "프로젝트 매니저". Skill chip "selected" state is **visibly different** from unselected (this is the F1 fix).
- [ ] `/share/[token]` — page header with eyebrow "읽기 전용 공유", heading = name, subtitle = role/dept. Feels like same product as the rest.
- [ ] `/admin/projects/new`, `/admin/employees/new`, `/admin/employees/[id]/edit`, `/employees/[id]/edit` — each shows page header with back link.

For the `/pm/staffing` skill chip specifically (the F1 regression surface): select any skill chip — its selected state should now show white text on emerald background (previously: invisible text because `--accent-foreground` was undefined). Same behavior on proficiency picker in `/me` skill edit panel and on the count badge in `SkillFilterPanel` (employees page filter area).

- [ ] **Step 6: `git status` is clean and commits are logical**

```bash
git log --oneline design/impeccable-audit ^main
```

Expected: one commit per task (≈ 10 commits on this branch since the wave started). Each commit message follows `type(scope): summary` convention.

- [ ] **Step 7: Push and open PR**

```bash
git push -u origin design/impeccable-audit
gh pr create --title "Wave 1: Impeccable audit — tokens, typography, heights, PageHeader, emerald decouple" --body "$(cat <<'EOF'
## Summary
- Addresses five foundational findings from `docs/superpowers/audits/2026-04-23-impeccable-audit.md`: F1 (missing `--accent-foreground` token), F2 (typography system bypass), F4 (emerald signal dilution), F5 (form control height mismatch), F12 (inconsistent page headers)
- Purely design/token/primitive work — no feature changes, no API changes

## Changes by finding
- **F1** — Added `--accent-foreground` token (light + dark) and `@theme inline` mapping. Fixes invisible-text regression on selected skill chips (pm/staffing, /me skill panel) and skill filter count badge
- **F2** — Added `.heading-4`, `.body-base`, `.body-meta` typography classes. Replaced 11 pages' hardcoded `text-2xl font-semibold tracking-tight` with `PageHeader` component and fixed `/me` directly
- **F4** — Introduced `--brand-mark` (neutral) and `--accent-glow-*` tokens. Retuned `--allocation-low`. Avatar now uses a hash-based neutral palette by default; `tone="accent"` retained for current-user surfaces (NavBar, /me hero). NavBar + login logos, WelcomeBanner decoration, EmployeeCard skill chip, LoginVisualPanel watermark, dashboard/employee-detail ambient glows all neutralized
- **F5** — Unified control heights: Input/Select `h-10`, Button `sm/md/lg = 36/40/44`
- **F12** — Created `PageHeader` primitive (eyebrow + heading + optional append/subtitle/action/backTo). Migrated 11 pages

## Test plan
- [x] `npx tsc --noEmit` clean
- [x] `npm run build` succeeds
- [x] `git grep` confirms hardcoded H1 patterns removed
- [x] Manual smoke test (see plan doc Phase 4 Step 5 checklist)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Rollback strategy

Each phase is an independent commit. If a phase regresses anything:

```bash
git revert <commit-sha>
```

- **Phase 0 (tokens) must not be reverted while later phases are present** — later phases reference those tokens.
- **Phases 1–3 can be reverted independently.** Reverting a later phase does not force rolling back Phase 0; the tokens are additive and safe to leave defined even if their consumers are reverted.
- If reverting the whole wave, revert in reverse phase order (Phase 3 → 2 → 1 → 0).

---

## Notes for the implementer

- **Match existing style.** This codebase uses Framer Motion spring values `stiffness: 400-500, damping: 28-35`. Keep them. Do not change motion in this wave (F7 is Wave 2).
- **Tailwind v4 `@theme inline` exposes tokens.** Adding `--color-brand-mark: var(--brand-mark)` inside `@theme inline` is what makes `text-brand-mark`, `bg-brand-mark` work as utility classes — don't forget this step in Task 0.1.
- **Korean UI text.** All heading copy, eyebrows, back-link labels stay Korean. The codebase uses `lang="ko"` and `word-break: keep-all`.
- **Do not touch forms (`AllocationForm`, `EmployeeForm`) beyond what Phase 1 delivers automatically.** Height alignment fixes their label-spacing problem for free. FormField primitive is Wave 2.
- **If you find a residual hardcoded pattern not listed in this plan**, report it and do not auto-fix — Wave 1 is scope-locked to the five findings.
- **Commit granularity.** One commit per task. Do not amend; new commits are preferred.
- **Windows bash / git grep.** Both work as shown above. If `git grep` returns nothing with `| wc -l` on a machine without `wc`, substitute `git grep -c "<pattern>" | awk -F: '{s+=$NF} END {print s}'` or count visually.
