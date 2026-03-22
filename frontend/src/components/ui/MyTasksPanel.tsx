'use client'
import { useMyTasks } from '@/lib/hooks/useSidebar'

interface Props {
  onTaskClick: (task: { id: string; title: string; status: string; progressPercent: number; dueDate: string | null; phaseId: string }) => void
}

export default function MyTasksPanel({ onTaskClick }: Props) {
  const { data: tasks, isLoading } = useMyTasks()
  if (isLoading) return <p className="text-sm text-gray-400 p-4">Loading…</p>
  if (!tasks?.length) return <p className="text-sm text-gray-400 p-4 italic">No active tasks assigned to you.</p>

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
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{project}</p>
          {items.map(t => (
            <div
              key={t.id}
              onClick={() => onTaskClick(t as any)}
              className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded px-1"
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                t.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                t.status === 'DONE' ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <span className="text-sm truncate flex-1">{t.title}</span>
              {t.dueDate && <span className="text-xs text-gray-400">{t.dueDate}</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
