'use client'
import { useEffect, useCallback, useRef, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
}

export function Drawer({ open, onClose, title, children, className }: DrawerProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Focus trap + Escape handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = getFocusable(panelRef.current)
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    },
    [onClose],
  )

  // Move focus into Drawer when it opens; restore when it closes
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
      window.addEventListener('keydown', handleKeyDown)
      // Wait for animation frame so the panel is visible before focusing
      const raf = requestAnimationFrame(() => {
        if (panelRef.current) {
          const focusable = getFocusable(panelRef.current)
          focusable[0]?.focus()
        }
      })
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        cancelAnimationFrame(raf)
      }
    } else {
      previousFocusRef.current?.focus()
    }
  }, [open, handleKeyDown])

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          className="fixed inset-0 z-40 flex justify-end"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            className={cn(
              'relative w-96 max-w-full bg-card shadow-xl h-full overflow-y-auto border-l border-border flex flex-col',
              className,
            )}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {title && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                <h2 id={titleId} className="font-semibold text-sm">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  aria-label="닫기"
                  className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-[var(--radius-sm)] p-1"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
