'use client'
import type { MyTask } from '@/lib/types'
import { Badge, ProgressBar, EmptyState } from '@/components/ui/primitives'
import { Warning, ListDashes } from '@phosphor-icons/react'
import { statusToProgress, statusToLabel } from '@/lib/utils'

const STATUS_VARIANT: Record<string, 'default' | 'info' | 'success'> = {
  TODO: 'default', IN_PROGRESS: 'info', DONE: 'success',
}

const PROJECT_COLORS = [
  'text-indigo-400', 'text-pink-400', 'text-emerald-400',
  'text-amber-400', 'text-cyan-400', 'text-violet-400',
]

function getProjectColor(index: number) {
  return PROJECT_COLORS[index % PROJECT_COLORS.length]
}

interface Props {
  tasks: MyTask[]
}

export default function EmployeeTaskList({ tasks }: Props) {
  if (tasks.length === 0) {
    return <EmptyState icon={ListDashes} heading="배정된 업무가 없습니다" className="py-8" />
  }

  const byProject = tasks.reduce<Record<string, { projectId: string; tasks: MyTask[] }>>((acc, t) => {
    const key = t.project.id
    if (!acc[key]) acc[key] = { projectId: key, tasks: [] }
    acc[key].tasks.push(t)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.values(byProject).map((group, idx) => {
        const projectName = group.tasks[0].project.name
        return (
          <div key={group.projectId}>
            <p className={`text-xs font-semibold mb-2 ${getProjectColor(idx)}`}>{projectName}</p>
            <div className="space-y-1">
              {group.tasks.map(task => {
                const isOverdue = task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date()
                const isDone = task.status === 'DONE'
                return (
                  <div key={task.id} className="flex items-center gap-2 py-1.5 px-2 rounded-[var(--radius-md)] bg-muted/50">
                    <Badge variant={STATUS_VARIANT[task.status]} className="text-[10px]">
                      {statusToLabel(task.status)}
                    </Badge>
                    <span className={`flex-1 text-sm truncate ${isDone ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </span>
                    <div className="w-10">
                      <ProgressBar value={statusToProgress(task.status)} size="sm" />
                    </div>
                    {task.dueDate && (
                      isOverdue ? (
                        <span className="flex items-center gap-0.5 text-[10px] text-destructive font-medium">
                          <Warning className="h-3 w-3" weight="bold" />{task.dueDate}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">{isDone ? task.dueDate : `~${task.dueDate}`}</span>
                      )
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
