'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-card rounded-[var(--radius-xl)] border border-border shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn('px-5 py-4 border-b border-border', className)} {...props} />
}

export function CardBody({ className, ...props }: CardProps) {
  return <div className={cn('px-5 py-4', className)} {...props} />
}

export function CardFooter({ className, ...props }: CardProps) {
  return <div className={cn('px-5 py-4 border-t border-border', className)} {...props} />
}

interface MotionCardProps extends CardProps {
  variant?: 'bezel' | 'flat'
}

export function MotionCard({ className, children, variant = 'bezel', ...props }: MotionCardProps) {
  if (variant === 'flat') {
    return (
      <motion.div
        whileHover={{ y: -3, boxShadow: 'var(--shadow-card-hover)' }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className={cn(
          'bg-card rounded-[var(--radius-xl)] border border-border shadow-sm will-change-transform',
          className,
        )}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.div>)}
      >
        {children}
      </motion.div>
    )
  }
  // default: bezel
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: 'var(--shadow-card-hover)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn('bezel will-change-transform', className)}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.div>)}
    >
      <div className="bezel-inner overflow-hidden">
        {children}
      </div>
    </motion.div>
  )
}
