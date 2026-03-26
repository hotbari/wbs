'use client'
import React, { useState, useId, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

interface TooltipProps {
  /** Tooltip text or content */
  content: React.ReactNode
  position?: TooltipPosition
  /** Hover delay in ms before showing. Default: 300 */
  delay?: number
  children: React.ReactElement<{ 'aria-describedby'?: string }>
}

// ─── Position config ─────────────────────────────────────────────────────────

const positionClasses: Record<TooltipPosition, string> = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
}

const motionProps: Record<TooltipPosition, object> = {
  top:    { initial: { opacity: 0, y:  4 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y:  4 } },
  bottom: { initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -4 } },
  left:   { initial: { opacity: 0, x:  4 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x:  4 } },
  right:  { initial: { opacity: 0, x: -4 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -4 } },
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Tooltip({ content, position = 'top', delay = 300, children }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const tooltipId = useId()
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setOpen(true), delay)
  }, [delay])

  const hide = useCallback(() => {
    clearTimeout(timerRef.current)
    setOpen(false)
  }, [])

  // Inject aria-describedby into the trigger element
  const trigger = React.cloneElement(children, {
    'aria-describedby': open ? tooltipId : undefined,
  })

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
    >
      {trigger}

      <AnimatePresence>
        {open && (
          <motion.div
            id={tooltipId}
            role="tooltip"
            className={cn(
              'absolute z-50 pointer-events-none whitespace-nowrap',
              'rounded-[var(--radius-md)] bg-foreground text-card text-xs font-medium px-2.5 py-1.5',
              'shadow-md',
              positionClasses[position],
            )}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            {...motionProps[position]}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
