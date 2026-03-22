'use client'
import { useState } from 'react'
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
    <div className="border rounded-lg overflow-hidden mb-3">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <span className="font-medium text-sm">{phase.name}</span>
          <span className="text-xs text-gray-400">{phase.startDate} → {phase.endDate}</span>
          <span className="text-xs text-gray-500">{done}/{phase.tasks.length} done</span>
        </div>
        <div className="flex items-center gap-2">
          {adminActions}
          <span className="text-gray-400">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="divide-y">
          {phase.tasks.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400 italic">No tasks yet</p>
          ) : (
            phase.tasks.map(task => (
              <TaskRow key={task.id} task={task} onClick={onTaskClick} />
            ))
          )}
        </div>
      )}
    </div>
  )
}
