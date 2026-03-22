import { cn } from '@/lib/utils'

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  size?: 'sm' | 'md'
}

export function ProgressBar({ value, size = 'md', className, ...props }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100)
  const color =
    clamped >= 90 ? 'bg-destructive' :
    clamped >= 70 ? 'bg-warning' :
    'bg-accent'

  return (
    <div
      className={cn(
        'w-full bg-zinc-200 rounded-full overflow-hidden',
        size === 'sm' ? 'h-1' : 'h-1.5',
        className,
      )}
      {...props}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-300', color)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
