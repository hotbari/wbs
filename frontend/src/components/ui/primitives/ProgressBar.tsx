'use client'
import { useState, useEffect } from 'react'
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

  const [displayed, setDisplayed] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setDisplayed(clamped))
    return () => cancelAnimationFrame(id)
  }, [clamped])

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
        className={cn('h-full w-full rounded-full', color)}
        style={{
          transform: `scaleX(${displayed / 100})`,
          transformOrigin: 'left',
          transition: 'transform 700ms ease-out',
        }}
        aria-hidden="true"
      />
    </div>
  )
}
