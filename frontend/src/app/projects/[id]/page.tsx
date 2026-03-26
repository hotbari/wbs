'use client'
import { use, useState } from 'react'
import Link from 'next/link'
import { useProject } from '@/lib/hooks/useProjects'
import PhaseAccordion from '@/components/ui/PhaseAccordion'
import TaskDetailDrawer from '@/components/ui/TaskDetailDrawer'
import type { TaskItem } from '@/lib/types'
import { Badge, Button, Skeleton, EmptyState, PageTransition } from '@/components/ui/primitives'
import { PencilSimple, ListDashes } from '@phosphor-icons/react'
import ProjectMemberPanel from '@/components/ui/ProjectMemberPanel'

const STATUS_VARIANT: Record<string, 'success' | 'info' | 'default'> = {
  ACTIVE: 'success', COMPLETED: 'info', ARCHIVED: 'default',
}
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: '활성', COMPLETED: '완료', ARCHIVED: '보관',
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: project, isLoading } = useProject(id)
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null)

  if (isLoading) return (
    <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-48" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>
  )
  if (!project) return (
    <div className="border border-destructive/30 bg-destructive-light rounded-[var(--radius-lg)] px-4 py-3 text-sm text-destructive">
      프로젝트를 찾을 수 없습니다
    </div>
  )

  return (
    <PageTransition>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{project.name}</h1>
                <Badge variant={STATUS_VARIANT[project.status]}>{STATUS_LABEL[project.status] ?? project.status}</Badge>
              </div>
              {project.description && <p className="text-sm text-muted-foreground mt-1">{project.description}</p>}
              <p className="text-xs text-muted-foreground mt-1">{project.startDate}{project.endDate ? ` → ${project.endDate}` : ''}</p>
            </div>
            <Link href={`/admin/projects/${id}/edit`}>
              <Button variant="secondary" size="sm"><PencilSimple className="h-4 w-4" />수정</Button>
            </Link>
          </div>

          <div>
            {project.phases.length === 0 ? (
              <EmptyState icon={ListDashes} heading="페이즈가 없습니다" description="프로젝트 편집에서 페이즈를 추가하세요." />
            ) : (
              project.phases.map(phase => (
                <PhaseAccordion key={phase.id} phase={phase} onTaskClick={setSelectedTask} />
              ))
            )}
          </div>

          <TaskDetailDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
        </div>
        <ProjectMemberPanel phases={project.phases} />
      </div>
    </PageTransition>
  )
}
