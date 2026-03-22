import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-muted text-muted-foreground',
  success: 'bg-success-light text-accent-dark',
  warning: 'bg-warning-light text-amber-700',
  danger: 'bg-destructive-light text-destructive',
  info: 'bg-info-light text-blue-700',
} as const

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
