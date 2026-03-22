'use client'
import { useProjectHealth } from '@/lib/hooks/useSidebar'
import { Drawer, EmptyState } from '@/components/ui/primitives'
import { FolderOpen } from '@phosphor-icons/react'
import ProjectHealthCard from './ProjectHealthCard'
import MyTasksPanel from './MyTasksPanel'

interface Props {
  open: boolean
  onClose: () => void
  isAdmin: boolean
}

export default function SidebarPanel({ open, onClose, isAdmin }: Props) {
  const { data: health } = useProjectHealth()

  return (
    <Drawer open={open} onClose={onClose} title={isAdmin ? 'Project Health' : 'My Active Tasks'}>
      {isAdmin ? (
        <div className="p-4 space-y-3">
          {health?.map(h => <ProjectHealthCard key={h.id} health={h} />)}
          {health?.length === 0 && <EmptyState icon={FolderOpen} heading="No active projects" />}
        </div>
      ) : (
        <MyTasksPanel onTaskClick={() => {}} />
      )}
    </Drawer>
  )
}
