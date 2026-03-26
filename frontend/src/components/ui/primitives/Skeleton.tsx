import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-surface-subtle rounded-[var(--radius-md)]', className)}
      {...props}
    />
  )
}

export function SkeletonText({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-3/4', className)} {...props} />
}

export function SkeletonCircle({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn('h-10 w-10 rounded-full', className)} {...props} />
}
