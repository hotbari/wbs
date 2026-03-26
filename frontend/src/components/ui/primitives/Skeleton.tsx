import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-surface-subtle rounded-[var(--radius-md)]', className)}
      {...props}
    />
  )
}

export function SkeletonText({ className, lines = 1, ...props }: SkeletonTextProps) {
  if (lines <= 1) return <Skeleton className={cn('h-4 w-3/4', className)} {...props} />
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-1/2' : 'w-full', className)}
        />
      ))}
    </div>
  )
}

export function SkeletonCircle({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn('h-10 w-10 rounded-full', className)} {...props} />
}
