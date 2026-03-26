'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CaretDown, Calendar, ListDashes } from '@phosphor-icons/react'
import { Badge, EmptyState } from '@/components/ui/primitives'
import type { PhaseDetail, TaskItem } from '@/lib/types'
import TaskRow from './TaskRow'

interface Props {
  phase: PhaseDetail
  onTaskClick: (task: TaskItem) => void
  adminActions?: React.ReactNode
}

export default function PhaseAccordion({ phase, onTaskClick, adminActions }: Props) {
  const [open, setOpen] = useState(true)
  const done = phase.tasks.filter(t => t.status === 'DONE').length
  return (
    <div className="border border-border rounded-[var(--radius-xl)] overflow-hidden mb-3">
      <motion.button
        className="w-full flex items-center justify-between px-4 py-3 bg-muted hover:bg-muted/80 text-left transition-colors"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        whileTap={{ scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <div className="flex items-center gap-3">
          <span className="font-medium text-sm">{phase.name}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {phase.startDate} → {phase.endDate}
          </span>
          <Badge variant={done === phase.tasks.length && phase.tasks.length > 0 ? 'success' : 'default'}>
            {done}/{phase.tasks.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {adminActions}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          >
            <CaretDown className="h-4 w-4 text-muted-foreground" />
          </motion.span>
        </div>
      </motion.button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="overflow-hidden"
          >
            {phase.tasks.length === 0 ? (
              <EmptyState icon={ListDashes} heading="업무가 없습니다" className="py-6" />
            ) : (
              <motion.div
                className="divide-y divide-border"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.03, delayChildren: 0.05 } },
                }}
              >
                {phase.tasks.map(task => (
                  <motion.div
                    key={task.id}
                    variants={{
                      hidden: { opacity: 0, x: -4 },
                      show: {
                        opacity: 1,
                        x: 0,
                        transition: { type: 'spring' as const, stiffness: 400, damping: 30 },
                      },
                    }}
                  >
                    <TaskRow task={task} onClick={onTaskClick} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
