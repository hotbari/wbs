import type { Icon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: Icon
  heading: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: IconComponent, heading, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)} {...props}>
      <IconComponent className="h-10 w-10 text-muted-foreground/50 mb-3" weight="duotone" />
      <h3 className="text-sm font-medium text-foreground">{heading}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
