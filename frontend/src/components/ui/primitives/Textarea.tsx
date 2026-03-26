import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(
        'flex w-full rounded-[var(--radius-md)] border bg-card px-3 py-2 text-sm',
        'transition-colors placeholder:text-muted-foreground resize-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        error ? 'border-destructive' : 'border-border',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'
export { Textarea }
