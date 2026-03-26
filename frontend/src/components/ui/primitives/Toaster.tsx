'use client'
import { AnimatePresence } from 'framer-motion'
import { useToastStore, dismissToast, ToastItem } from './Toast'
import { cn } from '@/lib/utils'

export type ToastPosition = 'top-right' | 'bottom-right' | 'top-center'

interface ToasterProps {
  position?: ToastPosition
}

const positionClasses: Record<ToastPosition, string> = {
  'top-right':    'top-4 right-4 items-end',
  'bottom-right': 'bottom-4 right-4 items-end',
  'top-center':   'top-4 left-1/2 -translate-x-1/2 items-center',
}

export function Toaster({ position = 'top-right' }: ToasterProps) {
  const toasts = useToastStore()

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-2 pointer-events-none',
        positionClasses[position],
      )}
      aria-label="알림 목록"
      aria-live="polite"
      aria-relevant="additions removals"
    >
      <AnimatePresence mode="sync">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem data={t} onDismiss={dismissToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
