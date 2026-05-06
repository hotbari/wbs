'use client'
import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  /** When true, suppress overlay click-to-close (use for forms with unsaved data). */
  disableOverlayClose?: boolean
}

export function Modal({
  open, onClose, title, children, className, disableOverlayClose = false,
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
      }
    }
  }, [open, handleKeyDown])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <motion.div
            className="absolute inset-0 bg-zinc-900/30 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={disableOverlayClose ? undefined : onClose}
          />
          <motion.div
            className={cn(
              'relative w-full max-w-md bg-card rounded-[var(--radius-lg)]',
              'shadow-[var(--shadow-xl)] border border-border',
              'flex flex-col overflow-hidden',
              className,
            )}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          >
            {title && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                <h2 className="font-semibold text-sm">{title}</h2>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-[var(--radius-sm)] p-1"
                >
                  <X className="h-4 w-4" />
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
