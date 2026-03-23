'use client'
import { useMyTasks } from '@/lib/hooks/useSidebar'
import { Skeleton, EmptyState } from '@/components/ui/primitives'
import { CheckCircle, Circle, CircleHalf } from '@phosphor-icons/react'

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
    <EmptyState icon={CheckCircle} heading="모든 업무 완료" description="배정된 활성 업무가 없습니다." className="py-8" />
  )

  const byProject = tasks.reduce<Record<string, typeof tasks>>((acc, t) => {
    const key = t.project.name
    acc[key] = acc[key] ?? []
    acc[key].push(t)
    return acc
  }, {})

  return (
    <div className="space-y-4 p-4">
      {Object.entries(byProject).map(([project, items]) => (
        <div key={project}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{project}</p>
          {items.map(t => (
            <div
              key={t.id}
              onClick={() => onTaskClick(t as any)}
              className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-muted rounded-[var(--radius-sm)] px-1 transition-colors"
            >
              {statusIcon(t.status)}
              <span className="text-sm truncate flex-1">{t.title}</span>
              {t.dueDate && <span className="text-xs text-muted-foreground">{t.dueDate}</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
