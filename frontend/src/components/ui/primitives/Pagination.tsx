import { cn } from '@/lib/utils'
import { CaretLeft, CaretRight, DotsThree } from '@phosphor-icons/react'

// ─── Types ───────────────────────────────────────────────────────────────────

export type PaginationVariant = 'full' | 'compact'

interface PaginationProps {
  /** Current page (1-indexed) */
  page: number
  /** Total number of pages */
  totalPages: number
  onPageChange: (page: number) => void
  variant?: PaginationVariant
  className?: string
}

// ─── Page number calculation ─────────────────────────────────────────────────

function getPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface PageButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

function PageButton({ active, className, children, ...props }: PageButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center h-8 min-w-[2rem] px-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        'disabled:opacity-40 disabled:pointer-events-none',
        active
          ? 'bg-accent text-white shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
        className,
      )}
      {...props}
    />
  )
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export function Pagination({
  page,
  totalPages,
  onPageChange,
  variant = 'full',
  className,
}: PaginationProps) {
  const canPrev = page > 1
  const canNext = page < totalPages

  // compact: prev/next only
  if (variant === 'compact') {
    return (
      <nav
        role="navigation"
        aria-label="페이지 탐색"
        className={cn('flex items-center gap-1', className)}
      >
        <PageButton
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev}
          aria-label="이전 페이지"
        >
          <CaretLeft className="h-4 w-4" aria-hidden="true" />
        </PageButton>
        <span className="text-sm text-muted-foreground px-2">
          {page} / {totalPages}
        </span>
        <PageButton
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
          aria-label="다음 페이지"
        >
          <CaretRight className="h-4 w-4" aria-hidden="true" />
        </PageButton>
      </nav>
    )
  }

  // full: numbered pages with ellipsis
  const pages = getPageRange(page, totalPages)

  return (
    <nav
      role="navigation"
      aria-label="페이지 탐색"
      className={cn('flex items-center gap-1', className)}
    >
      <PageButton
        onClick={() => onPageChange(page - 1)}
        disabled={!canPrev}
        aria-label="이전 페이지"
      >
        <CaretLeft className="h-4 w-4" aria-hidden="true" />
      </PageButton>

      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="inline-flex items-center justify-center h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          >
            <DotsThree className="h-4 w-4" />
          </span>
        ) : (
          <PageButton
            key={p}
            active={p === page}
            onClick={() => onPageChange(p)}
            aria-label={`${p}페이지`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </PageButton>
        ),
      )}

      <PageButton
        onClick={() => onPageChange(page + 1)}
        disabled={!canNext}
        aria-label="다음 페이지"
      >
        <CaretRight className="h-4 w-4" aria-hidden="true" />
      </PageButton>
    </nav>
  )
}
