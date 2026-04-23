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
