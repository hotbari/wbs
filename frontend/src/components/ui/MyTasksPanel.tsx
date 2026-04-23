'use client'
import { useMyTasks } from '@/lib/hooks/useSidebar'
import { Skeleton, StaggerList, StaggerItem } from '@/components/ui/primitives'
import { CheckCircle, Circle, CircleHalf } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface Props {
  onTaskClick: (task: { id: string; title: string; status: string; dueDate: string | null; phaseId: string }) => void
}

function TaskRowSkeleton() {
  return (
    <div className="flex items-center gap-2 py-1.5 px-1">
      <Skeleton className="h-4 w-4 rounded-full" />
      <Skeleton className="h-4 flex-1" />
    </div>
  )
}

const statusIcon = (status: string) => {
  if (status === 'DONE') return <CheckCircle className="h-4 w-4 text-accent shrink-0" weight="fill" />
  if (status === 'IN_PROGRESS') return <CircleHalf className="h-4 w-4 text-info shrink-0" weight="fill" />
  return <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
}

export default function MyTasksPanel({ onTaskClick }: Props) {
  const { data: tasks, isLoading } = useMyTasks()

  if (isLoading) return (
    <div className="p-4 space-y-2">
      <TaskRowSkeleton /><TaskRowSkeleton /><TaskRowSkeleton />
    </div>
  )

  if (!tasks?.length) return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      >
        <CheckCircle className="h-10 w-10 text-accent/60 mb-3" weight="duotone" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, type: 'spring', stiffness: 380, damping: 28 }}
        className="text-sm font-medium text-foreground"
      >
        모든 업무 완료
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 380, damping: 28 }}
        className="text-sm text-muted-foreground mt-1"
      >
        배정된 활성 업무가 없습니다.
      </motion.p>
    </div>
  )

  const byProject = tasks.reduce<Record<string, typeof tasks>>((acc, t) => {
    const key = t.project.name
    acc[key] = acc[key] ?? []
    acc[key].push(t)
    return acc
  }, {})

  return (
    <StaggerList className="space-y-4 p-4">
      {Object.entries(byProject).map(([project, items]) => (
        <StaggerItem key={project}>
          <p className="label-section uppercase tracking-wider font-semibold mb-1">{project}</p>
          {items.map(t => (
            <motion.div
              key={t.id}
              whileHover={{ x: 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              onClick={() => onTaskClick({ id: t.id, title: t.title, status: t.status, dueDate: t.dueDate, phaseId: t.phase.id })}
              className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-muted rounded-[var(--radius-sm)] px-1 transition-colors"
            >
              {statusIcon(t.status)}
              <span className="text-sm truncate flex-1">{t.title}</span>
              {t.dueDate && <span className="text-xs text-muted-foreground numeric">{t.dueDate}</span>}
            </motion.div>
          ))}
        </StaggerItem>
      ))}
    </StaggerList>
  )
}
