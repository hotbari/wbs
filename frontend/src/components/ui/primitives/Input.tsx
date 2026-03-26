import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(
        'flex h-10 w-full rounded-[var(--radius-md)] border bg-card px-3 py-2 text-sm',
        'transition-colors placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        error ? 'border-destructive' : 'border-border',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
export { Input }
