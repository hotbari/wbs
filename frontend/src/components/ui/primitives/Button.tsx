'use client'
import { forwardRef } from 'react'
import { CircleNotch } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const variants = {
  primary: 'bg-button-primary-bg text-white hover:bg-button-primary-hover shadow-sm',
  secondary: 'bg-card text-foreground border border-border hover:bg-muted shadow-sm',
  ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted',
  destructive: 'bg-destructive-dark text-white hover:bg-destructive shadow-sm',
} as const

const sizes = {
  sm: 'h-9 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
} as const

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium transition-colors',
        'active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <CircleNotch className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'
export { Button }
