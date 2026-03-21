'use client'
import { useEffect } from 'react'
import { useProjectHealth } from '@/lib/hooks/useSidebar'
import ProjectHealthCard from './ProjectHealthCard'
import MyTasksPanel from './MyTasksPanel'

interface Props {
  open: boolean
  onClose: () => void
  isAdmin: boolean
}

export default function SidebarPanel({ open, onClose, isAdmin }: Props) {
  const { data: health } = useProjectHealth()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-30 flex justify-end" onClick={onClose}>
      <div
        className="w-80 bg-white shadow-2xl h-full overflow-y-auto border-l"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold text-sm">
            {isAdmin ? 'Project Health' : 'My Active Tasks'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        {isAdmin ? (
          <div className="p-4 space-y-3">
            {health?.map(h => <ProjectHealthCard key={h.id} health={h} />)}
            {health?.length === 0 && <p className="text-sm text-gray-400 italic">No active projects.</p>}
          </div>
        ) : (
          <MyTasksPanel onTaskClick={() => {}} />
        )}
      </div>
    </div>
  )
}
