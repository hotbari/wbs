'use client'
import type { TaskItem } from '@/lib/types'

const STATUS_COLORS: Record<string, string> = {
  TODO: 'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  DONE: 'bg-green-100 text-green-700',
}

interface Props {
  task: TaskItem
  onClick: (task: TaskItem) => void
}

export default function TaskRow({ task, onClick }: Props) {
  const isOverdue = task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date()
  return (
    <div
      className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-50 cursor-pointer border-b last:border-0"
      onClick={() => onClick(task)}
    >
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[task.status]}`}>
        {task.status.replace('_', ' ')}
      </span>
      <span className="flex-1 text-sm truncate">{task.title}</span>
      <div className="w-20 bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-blue-500 h-1.5 rounded-full"
          style={{ width: `${task.progressPercent}%` }}
        />
      </div>
      {task.dueDate && (
        <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
          {task.dueDate}
        </span>
      )}
    </div>
  )
}
