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
    <Drawer open={open} onClose={onClose} title={isAdmin ? '프로젝트 현황' : '내 진행 업무'}>
      {isAdmin ? (
        <div className="p-4 space-y-3">
          {health?.map(h => <ProjectHealthCard key={h.id} health={h} />)}
          {health?.length === 0 && <EmptyState icon={FolderOpen} heading="활성 프로젝트가 없습니다" />}
        </div>
      ) : (
        <MyTasksPanel onTaskClick={() => {}} />
      )}
    </Drawer>
  )
}
