import { cn } from '@/lib/utils'

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  size?: 'sm' | 'md'
}

export function ProgressBar({ value, size = 'md', className, ...props }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100)
  const color =
    value >= 100 ? 'bg-allocation-over' :
    value >= 80  ? 'bg-allocation-high' :
    value >= 50  ? 'bg-allocation-medium' :
    'bg-allocation-low'

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        'w-full bg-surface-subtle rounded-full overflow-hidden',
        size === 'sm' ? 'h-1' : 'h-1.5',
        className,
      )}
      {...props}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-300', color)}
        style={{ width: `${clamped}%` }}
        aria-hidden="true"
      />
    </div>
  )
}
