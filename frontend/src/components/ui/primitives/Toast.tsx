'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Warning, Info, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastData {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  /** Duration in ms. 0 = persistent. Default: 4000 */
  duration: number
  action?: {
    label: string
    onClick: () => void
  }
}

type ToastInput = Omit<ToastData, 'id' | 'duration'> & { duration?: number }

// ─── Store (module-level singleton, client only) ─────────────────────────────

type Listener = (toasts: ToastData[]) => void
let _toasts: ToastData[] = []
const _listeners = new Set<Listener>()
const _timers = new Map<string, ReturnType<typeof setTimeout>>()

function emit() {
  _listeners.forEach(l => l([..._toasts]))
}

export function toast(input: ToastInput): string {
  const id = crypto.randomUUID()
  const duration = input.duration ?? 4000
  // Keep at most 5 toasts; drop the oldest when full
  _toasts = [..._toasts.slice(-4), { ...input, id, duration }]
  emit()
  if (duration > 0) {
    _timers.set(id, setTimeout(() => dismissToast(id), duration))
  }
  return id
}

toast.success = (title: string, opts?: Omit<ToastInput, 'variant' | 'title'>) =>
  toast({ variant: 'success', title, ...opts })
toast.error = (title: string, opts?: Omit<ToastInput, 'variant' | 'title'>) =>
  toast({ variant: 'error', title, ...opts })
toast.warning = (title: string, opts?: Omit<ToastInput, 'variant' | 'title'>) =>
  toast({ variant: 'warning', title, ...opts })
toast.info = (title: string, opts?: Omit<ToastInput, 'variant' | 'title'>) =>
  toast({ variant: 'info', title, ...opts })

export function dismissToast(id: string) {
  clearTimeout(_timers.get(id))
  _timers.delete(id)
  _toasts = _toasts.filter(t => t.id !== id)
  emit()
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useToastStore(): ToastData[] {
  const [toasts, setToasts] = useState<ToastData[]>([..._toasts])
  useEffect(() => {
    _listeners.add(setToasts)
    return () => { _listeners.delete(setToasts) }
  }, [])
  return toasts
}

// ─── Variant config ──────────────────────────────────────────────────────────

const variantConfig = {
  success: {
    Icon: CheckCircle,
    container: 'border-success/20 bg-success-light',
    iconCls: 'text-accent',
    titleCls: 'text-accent-dark',
    progressCls: 'bg-accent',
  },
  error: {
    Icon: XCircle,
    container: 'border-destructive/20 bg-destructive-light',
    iconCls: 'text-destructive',
    titleCls: 'text-destructive',
    progressCls: 'bg-destructive',
  },
  warning: {
    Icon: Warning,
    container: 'border-warning/20 bg-warning-light',
    iconCls: 'text-warning-foreground',
    titleCls: 'text-warning-foreground',
    progressCls: 'bg-warning',
  },
  info: {
    Icon: Info,
    container: 'border-info/20 bg-info-light',
    iconCls: 'text-info',
    titleCls: 'text-info-foreground',
    progressCls: 'bg-info',
  },
} as const

// ─── ToastItem ───────────────────────────────────────────────────────────────

interface ToastItemProps {
  data: ToastData
  onDismiss: (id: string) => void
}

export function ToastItem({ data, onDismiss }: ToastItemProps) {
  const { id, variant, title, description, duration, action } = data
  const cfg = variantConfig[variant]
  const Icon = cfg.Icon
  const [progress, setProgress] = useState(100)

  // Shrink progress bar in sync with the auto-dismiss timer
  useEffect(() => {
    if (duration === 0) return
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      setProgress(Math.max(0, 100 - (elapsed / duration) * 100))
    }, 50)
    return () => clearInterval(interval)
  }, [duration])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'relative w-80 rounded-[var(--radius-lg)] border shadow-md overflow-hidden flex flex-col',
        cfg.container,
      )}
    >
      {/* Body */}
      <div className="flex items-start gap-3 px-4 pt-3.5 pb-3">
        <Icon
          className={cn('h-4 w-4 shrink-0 mt-0.5', cfg.iconCls)}
          weight="fill"
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-semibold leading-snug', cfg.titleCls)}>
            {title}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
              {description}
            </p>
          )}
          {action && (
            <button
              onClick={() => { action.onClick(); onDismiss(id) }}
              className={cn(
                'mt-2 text-xs font-medium underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm',
                cfg.titleCls,
              )}
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => onDismiss(id)}
          aria-label="알림 닫기"
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors rounded-[var(--radius-sm)] p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Progress bar */}
      {duration > 0 && (
        <div className="h-0.5 w-full bg-surface-subtle" aria-hidden="true">
          <div
            className={cn('h-full', cfg.progressCls)}
            style={{ width: `${progress}%`, transition: 'width 50ms linear' }}
          />
        </div>
      )}
    </motion.div>
  )
}
