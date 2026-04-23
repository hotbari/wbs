'use client'
import { Badge, ProgressBar } from '@/components/ui/primitives'
import { Warning } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { TaskItem } from '@/lib/types'
import { statusToProgress, statusToLabel, isOverdue } from '@/lib/utils'

const STATUS_VARIANT: Record<string, 'default' | 'info' | 'success'> = {
  TODO: 'default', IN_PROGRESS: 'info', DONE: 'success',
}

interface Props { task: TaskItem; onClick: (task: TaskItem) => void }

export default function TaskRow({ task, onClick }: Props) {
  const overdue = isOverdue(task.dueDate, task.status)
  return (
    <motion.div
      whileHover={{ x: 3 }}
      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      className="flex items-center gap-3 py-2.5 px-3 hover:bg-muted cursor-pointer transition-colors"
      onClick={() => onClick(task)}
    >
      <Badge variant={STATUS_VARIANT[task.status]}>{statusToLabel(task.status)}</Badge>
      <span className="flex-1 text-sm truncate">{task.title}</span>
      <div className="w-20"><ProgressBar value={statusToProgress(task.status)} size="sm" /></div>
      {task.dueDate && (
        overdue ? (
          <Badge variant="destructive" className="gap-1">
            <Warning className="h-3 w-3" weight="bold" />{task.dueDate}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground numeric">{task.dueDate}</span>
        )
      )}
    </motion.div>
  )
}
